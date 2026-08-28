import { logger } from "./logger.js";

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

export async function tryingZipFiles() {
  console.log("tryingZipFiles");
  // const url = "https://gtfs.mot.gov.il/gtfsfiles/ClusterToLine.zip";
  const url =
    "https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip";
  const res = await fetch(url);
  const length = Number(res.headers.get("Content-Length"));
  const fileName = url.split("/").at(-1);
  if (!length || !res.body) return;

  const zipFile = new Uint8Array(length);
  let offset = 0;
  for await (const chunk of res.body) {
    zipFile.set(chunk, offset);
    offset += chunk.length;
    logger(
      `Downloading "${fileName}" --> ${offset} / ${length}, %${((offset / length) * 100).toFixed(0)}`,
      "info",
    );
  }

  return zipFile;
}

/** See:
 * {@link https://en.wikipedia.org/wiki/ZIP_(file_format)|ZIP (Wikipedia)}
 * and {@link https://en.wikipedia.org/wiki/ZIP_(file_format)#ZIP64|ZIP#ZIP64 (Wikipedia)}
 * TODO: remove the need for the zipFile since we got view*/
export function getZip64FileHeaders(
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

  if (headers.compressionMethod != 8)
    throw new Error("unsupported zip compression method");
  if (
    headers.extra.uncompressedFileSize >= Number.MAX_SAFE_INTEGER ||
    headers.extra.compressedDataSize >= Number.MAX_SAFE_INTEGER
  )
    throw new Error("TODO: support larger numbers");

  return headers;
}

async function decompressZip64File(
  zipFile: Uint8Array,
  view: DataView,
  headers: ZippedFileHeaders,
  fileStartsAt: number,
  fileEndsAt: number,
) {
  console.log("decompressZip64File");

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

export async function readZip64File(zipFile: Uint8Array) {
  const view = new DataView(
    zipFile.buffer,
    zipFile.byteOffset,
    zipFile.byteLength,
  );
  let offset = 0;

  const files: (string | string[])[] = [];
  while (true) {
    const signature = view.getUint32(offset, true);
    if (signature === 0x04034b50) {
      console.log("case 1");
      // local file
      const headers = getZip64FileHeaders(zipFile, view, offset);
      console.log(headers);
      const fileStartsAt =
        offset + 30 + headers.fileNameLength + headers.extraLength;
      const fileEndsAt =
        fileStartsAt + Number(headers.extra.compressedDataSize);
      const decompressedBytes = await decompressZip64File(
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

      files.push(stringified);
      offset = fileEndsAt;
      console.log("fileEndsAt:", fileEndsAt);
      console.log("offset:", offset);
    }
    // central directory
    else if (signature === 0x02014b50) {
      break;
    }
    // end of central directory
    else if (signature === 0x06054b50) {
      break;
    } else {
      logger(`got garbage! ${signature}`, "error");
      break;
    }
  }
  console.log(files);
  return files;
}
