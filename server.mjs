import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 5173);
const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const driveUploadPath = join(root, "api", "drive-upload.js");
const driveUploadHandler = existsSync(driveUploadPath) ? require(driveUploadPath) : null;
const paymentRequestPath = join(root, "api", "payment-request.js");
const paymentRequestHandler = existsSync(paymentRequestPath) ? require(paymentRequestPath) : null;
const excelToPdfPath = join(root, "api", "excel-to-pdf.js");
const excelToPdfHandler = existsSync(excelToPdfPath) ? require(excelToPdfPath) : null;

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
    if (!driveUploadHandler) {
      response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Drive upload API is not installed in this app copy." }));
      return;
    }
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

  if (url.pathname === "/api/payment-request") {
    if (!paymentRequestHandler) {
      response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Payment request API is not installed." }));
      return;
    }
    paymentRequestHandler(request, response);
    return;
  }

  if (url.pathname === "/api/excel-to-pdf") {
    if (!excelToPdfHandler) {
      response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Excel to PDF API is not installed." }));
      return;
    }
    excelToPdfHandler(request, response);
    return;
  }

  const requestedPath = decodeURIComponent(url.pathname).replace(/^[/\\]+/, "");
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath || "index.html");

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
