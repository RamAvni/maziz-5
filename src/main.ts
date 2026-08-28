import { createServer as createHttpServer } from "http";
import { getLanIp, logger } from "./common/functions/index.js";
import { setError } from "./common/functions/set-error.js";
import { provideStaticResource } from "./web/index.js";
import { PORT } from "./common/index.js";
import { handleApiRequest } from "./api/index.js";

declare module "http" {
  interface IncomingMessage {
    body?: string;
  }
}

function loadEnvFile() {}

function main() {
  loadEnvFile();

  const server = createHttpServer();

  // On HTTP Request
  server.on("request", (req, res) => {
    const url = req.url;
    if (!url) {
      setError(res, new Error("improper req.url given"));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      req.body = body;
      logger(url, "info");
      if (url.startsWith("/api")) void handleApiRequest(req, res);
      else void provideStaticResource(url, res);
    });
  });

  server.listen(PORT, () => {
    logger(`Server is listening on port ${PORT}`, "debug");
    logger(
      `You may access static files at: 
\t ${`http://localhost:${PORT}`}, or at:
\t http://${getLanIp()}:${PORT}`,
      "debug",
    );
  });
}

main();
