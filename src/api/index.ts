import type { IncomingMessage, ServerResponse } from "node:http";

export function handleApiRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.url?.startsWith("/api/crawler")) {
    // switch (req.url) { }
  }
}
