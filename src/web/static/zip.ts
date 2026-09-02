/** {@link https://en.wikipedia.org/wiki/ZIP_(file_format)#ZIP64:~:text=ZIP64edit|Wikipedia} */
interface Zip64ExtraFileHeader {
  headerId: number;
  extraFieldSize: number;
  uncompressedFileSize: bigint;
  compressedDataSize: bigint;
  localRecordOffset?: bigint;
  diskNumber?: number;
}

interface ZippedFileHeaders {
  signature: string;
  version: number;
  generalPurpose: number;
  compressionMethod: number;
  lastModifiedTime: string;
  lastModifiedDate: Date;
  crc: number;
  compressedSize?: number;
  uncompressedSize?: number;
  fileNameLength: number;
  fileName: string;
  extraLength: number;
  extra: Zip64ExtraFileHeader;
}

// interface CentralDirectoryHeaders {}

function MSDosDateToDate(MSDosDate: number) {
  const year = 1980 + ((MSDosDate >> 9) & 0x7f);
  const month = (MSDosDate >> 5) & 0x1f;
  const day = MSDosDate & 0x1f;
  return new Date(year, month, day);
}
function MSDosTimeToString(MSDosTime: number) {
  const hour = (MSDosTime >> 11) & 0x1f;
  const minute = (MSDosTime >> 5) & 0x2f;
  const seconds = (MSDosTime & 0x1f) * 2; // MS-DOS devides seconds by 2 in order to save space
  return `${hour}:${minute}:${seconds}`;
}

export async function getMotGtfsZipFile() {
  const url = "http://localhost:8080/api/agencies";
  const res = await fetch(url);
  const length = Number(res.headers.get("Content-Length"));
  const fileName = url.split("/").at(-1);
  if (!length || !res.body) return;

  const zipFile = new Uint8Array(length);
  let offset = 0;
  for await (const chunk of res.body) {
    zipFile.set(chunk, offset);
    offset += chunk.length;
    console.info(
      `Downloading "${fileName}" --> ${offset} / ${length}, %${((offset / length) * 100).toFixed(0)}`,
    );
  }

  return zipFile;
}

/** See:
 * {@link https://en.wikipedia.org/wiki/ZIP_(file_format)|ZIP (Wikipedia)}
 * and {@link https://en.wikipedia.org/wiki/ZIP_(file_format)#ZIP64|ZIP#ZIP64 (Wikipedia)}
 * TODO: remove the need for the zipFile since we got view*/
export function getZip64ZippedFileHeaders(
  zipFile: Uint8Array,
  view: DataView,
  offset: number,
): ZippedFileHeaders {
  const fileNameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const extraOffset = offset + 30 + fileNameLength;
  const extraFieldSize = view.getUint16(extraOffset + 2, true);

  const headers = {
    signature: Array.from(zipFile.subarray(offset + 0, offset + 4)).reduce(
      (prev, current) => prev + String.fromCharCode(current),
      "",
    ),
    version: view.getUint16(offset + 4, true),
    generalPurpose: view.getUint16(offset + 6, true),
    compressionMethod: view.getUint16(offset + 8, true),
    lastModifiedTime: MSDosTimeToString(view.getUint16(offset + 10, true)),
    lastModifiedDate: MSDosDateToDate(view.getUint16(offset + 12, true)),
    crc: view.getUint32(offset + 14, true),
    compressedSize:
      extraFieldSize >= 8 ? view.getUint32(offset + 18, true) : undefined,
    uncompressedSize:
      extraFieldSize >= 8 ? view.getUint32(offset + 22, true) : undefined,
    fileNameLength,
    fileName: Array.from(
      zipFile.subarray(offset + 30, offset + 30 + fileNameLength),
    ).reduce((prev, current) => prev + String.fromCharCode(current), ""),
    extraLength,
    extra: {
      headerId: view.getUint16(extraOffset, true),
      extraFieldSize: view.getUint16(extraOffset + 2, true),
      uncompressedFileSize: view.getBigUint64(extraOffset + 4, true),
      compressedDataSize: view.getBigUint64(extraOffset + 12, true),
      localRecordOffset:
        extraFieldSize >= 24
          ? view.getBigUint64(extraOffset + 20, true)
          : undefined,
      diskNumber:
        extraFieldSize >= 28
          ? view.getUint32(extraOffset + 28, true)
          : undefined,
    },
  };

  if (headers.compressionMethod !== 8)
    throw new Error("unsupported zip compression method");
  if (
    headers.extra.uncompressedFileSize >= Number.MAX_SAFE_INTEGER ||
    headers.extra.compressedDataSize >= Number.MAX_SAFE_INTEGER
  )
    throw new Error("TODO: support larger numbers");

  return headers;
}

async function decompressZip64ZippedFile(
  zipFile: Uint8Array,
  view: DataView,
  headers: ZippedFileHeaders,
  fileStartsAt: number,
  fileEndsAt: number,
) {
  const decompressionStream = new DecompressionStream("deflate-raw");
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(view.buffer.slice(fileStartsAt, fileEndsAt));
      controller.close();
    },
  });
  const readable = stream.pipeThrough(decompressionStream);

  const file = new Uint8Array(Number(headers.extra.uncompressedFileSize));
  let offset = 0;
  for await (const chunk of readable) {
    file.set(chunk, offset);
    offset += chunk.length;
  }

  return file;
}

export interface ReadZippedfile {
  headers: ZippedFileHeaders;
  stringified: string | string[];
}
export async function readZip64File(
  zipFile: Uint8Array,
  callback?: (
    headers: ZippedFileHeaders,
    stringifiedZipFile: string | string[],
  ) => void,
) {
  const view = new DataView(
    zipFile.buffer,
    zipFile.byteOffset,
    zipFile.byteLength,
  );
  let offset = 0;

  const files: ReadZippedfile[] = [];
  while (true) {
    const signature = view.getUint32(offset, true);
    // local file
    if (signature === 0x04034b50) {
      const headers = getZip64ZippedFileHeaders(zipFile, view, offset);
      const fileStartsAt =
        offset + 30 + headers.fileNameLength + headers.extraLength;
      const fileEndsAt =
        fileStartsAt + Number(headers.extra.compressedDataSize);
      const decompressedBytes = await decompressZip64ZippedFile(
        zipFile,
        view,
        headers,
        fileStartsAt,
        fileEndsAt,
      );
      const decoder = new TextDecoder();
      let stringified: string | string[];
      if (decompressedBytes.length > 2 ** 27) {
        stringified = [];
        for (
          let chunkOffset = 0;
          chunkOffset < decompressedBytes.length;
          chunkOffset += 2 ** 27
        ) {
          const max =
            decompressedBytes.length > chunkOffset + 2 ** 27
              ? chunkOffset + 2 ** 27
              : undefined;
          stringified.push(
            decoder.decode(decompressedBytes.subarray(chunkOffset, max)),
          );
        }
      } else {
        stringified = decoder.decode(decompressedBytes);
      }

      if (callback) callback(headers, stringified);
      files.push({ headers, stringified });
      offset = fileEndsAt;
    }
    // central directory
    else if (signature === 0x02014b50) {
      break;
    }
    // end of central directory
    else if (signature === 0x06054b50) {
      break;
    } else {
      console.error(`got garbage! ${signature}`);
      break;
    }
  }
  return files;
}

export function normalizeCsvTextFile(
  stringifiedFile: string | string[],
): object[] {
  const newRows: object[] = [];
  if (typeof stringifiedFile === "string") {
    const rows = stringifiedFile
      .replaceAll("\r", "")
      .split("\n") // All gtfs file must end their row with a new line.
      .map((row) => row.split(","));

    for (let i = 1; i < rows.length; i++) {
      newRows[i] = {};
      for (let j = 0; j < rows[0].length; j++) {
        const key = rows[0][j];
        const value = rows[i][j];
        newRows[i][key] = value;
      }
    }
    return newRows;
  } else {
    const rows = stringifiedFile.reduce((prev, str) => {
      return [
        ...prev,
        ...str
          .replaceAll("\r", "")
          .split("\n")
          .map((row) => row.split(",")),
      ];
    }, []);

    for (let i = 1; i < rows.length; i++) {
      newRows[i] = {};
      for (let j = 0; j < rows[0].length; j++) {
        const key = rows[0][j];
        const value = rows[i][j];
        newRows[i][key] = value;
      }
    }
    return newRows;
  }
}
