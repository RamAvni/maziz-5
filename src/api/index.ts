import type { IncomingMessage, ServerResponse } from "node:http";
import { logger } from "../common/functions/logger.js";

export async function getMotGtfsZipFile(isModifiedSince?: string) {
  console.log("tryingZipFiles");
  const url = "https://gtfs.mot.gov.il/gtfsfiles/ClusterToLine.zip";

  // const url =
  //   "https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip";
  const res = await fetch(url);
  const length = Number(res.headers.get("Content-Length"));
  const lastModified = res.headers.get("last-modified");
  const fileName = url.split("/").at(-1);
  if (!length || !res.body) return;
  if (
    isModifiedSince &&
    lastModified &&
    new Date(isModifiedSince) <= new Date(lastModified)
  )
    return { lastModified };

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

  return { zipFile, lastModified };
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
) {
  switch (req.url) {
    case "/api/agencies":
      const ifModifiedSince = req.headers["if-modified-since"];
      const zipFileResult = await getMotGtfsZipFile(ifModifiedSince);

      if (!zipFileResult?.zipFile && zipFileResult?.lastModified) {
        res.writeHead(304);
        res.end();
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/zip",
        Date: new Date().toUTCString(),
        "cache-control": `private, max-age=${60 * 60 * 24}`,
        "last-modified": `${zipFileResult?.lastModified}`,
        "content-length": zipFileResult?.zipFile?.length,
      });
      res.end(zipFileResult?.zipFile);
      logger("Sent the .zip file", "debug");
      break;
  }
}
