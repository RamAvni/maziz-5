import type { IncomingMessage, ServerResponse } from "node:http";
import { readZip64File, tryingZipFiles } from "../common/functions/zip.js";

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
) {
  switch (req.url) {
    case "/api/agencies":
      const zip = await tryingZipFiles();
      if (zip) {
        const string = readZip64File(zip);
      }
  }
}
