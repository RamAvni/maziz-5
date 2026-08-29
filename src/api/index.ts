import type { IncomingMessage, ServerResponse } from "node:http";
import { logger } from "../common/functions/logger.js";

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

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
) {
  switch (req.url) {
    case "/api/agencies":
      res.setHeader("Content-Type", "application/zip");
      res.end(await tryingZipFiles());
  }
}
