const DRIVE_ID_RE = /^[a-zA-Z0-9_-]{10,160}$/;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function detectImageType(bytes, headerType) {
  const type = String(headerType || "").split(";")[0].trim().toLowerCase();
  if (IMAGE_TYPES.has(type)) return type;
  if (bytes.length >= 12) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
    if (String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP") return "image/webp";
    const gif = String.fromCharCode(...bytes.subarray(0, 6));
    if (gif === "GIF87a" || gif === "GIF89a") return "image/gif";
  }
  return "";
}

function extensionForType(type) {
  return {"image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp"}[type] || "";
}

function safeFileName(value) {
  return String(value || "product-image")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140) || "product-image";
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end("Method not allowed");
  }

  const id = String(req.query?.id || "").trim();
  if (!DRIVE_ID_RE.test(id)) return res.status(400).end("Invalid Google Drive file id");

  const requestedName = safeFileName(req.query?.file || "product-image.webp");
  const requestedExtension = (requestedName.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const upstream = await fetch(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`, {
      headers: {Accept: "image/webp,image/png,image/jpeg,image/gif"},
      redirect: "follow",
      signal: controller.signal
    });
    if (!upstream.ok) return res.status(502).end(`Google Drive returned ${upstream.status}`);

    const bytes = new Uint8Array(await upstream.arrayBuffer());
    const type = detectImageType(bytes, upstream.headers.get("content-type"));
    const actualExtension = extensionForType(type);
    if (!type) return res.status(415).end("Google Drive did not return a supported image");
    if (requestedExtension && requestedExtension !== actualExtension && !(requestedExtension === "jpeg" && actualExtension === "jpg")) {
      return res.status(415).end(`Image extension does not match ${type}`);
    }

    const base = requestedName.replace(/\.[^.]+$/, "") || "product-image";
    const fileName = `${base}.${actualExtension}`;
    res.setHeader("Content-Type", type);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Length", String(bytes.byteLength));
    if (req.method === "HEAD") return res.status(200).end();
    return res.status(200).send(Buffer.from(bytes));
  } catch (error) {
    const message = error?.name === "AbortError" ? "Google Drive image request timed out" : "Unable to read Google Drive image";
    return res.status(502).end(message);
  } finally {
    clearTimeout(timer);
  }
};
