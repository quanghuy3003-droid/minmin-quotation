import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { createRequire } from "node:module";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 5173);
const root = new URL(".", import.meta.url).pathname;
const require = createRequire(import.meta.url);
const driveUploadHandler = require("./api/drive-upload.js");

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);

  if (url.pathname === "/api/drive-upload") {
    response.status = code => {
      response.statusCode = code;
      return response;
    };
    response.json = data => {
      if (!response.headersSent) {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      response.end(JSON.stringify(data));
    };
    driveUploadHandler(request, response);
    return;
  }

  const safePath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath === "/" ? "index.html" : safePath);

  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    const fallbackPath = join(root, "index.html");
    response.writeHead(200, { "Content-Type": types[".html"] });
    createReadStream(fallbackPath).pipe(response);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`App bao gia dang chay tai http://localhost:${port}`);
});
