const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

function allowedOrigin(origin) {
  if (!origin) return true;
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin)) return true;
  if (origin === "https://minmin-quotation-s74k.vercel.app") return true;
  return /^https:\/\/minmin-quotation-[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

function allowedImageUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === "drive.google.com" ||
      host === "lh3.googleusercontent.com" ||
      host.endsWith(".googleusercontent.com") ||
      host === "tntpytfqgwjwdsnquhre.supabase.co";
  } catch {
    return false;
  }
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  const origin = String(req.headers?.origin || "");
  if (!allowedOrigin(origin)) return json(res, 403, { ok: false, error: "Nguồn gọi không hợp lệ." });
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Accept");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "Chỉ hỗ trợ tải ảnh bằng GET." });

  const requestUrl = new URL(req.url || "/api/image-proxy", "https://minmin-quotation-s74k.vercel.app");
  const target = requestUrl.searchParams.get("url") || "";
  if (!allowedImageUrl(target)) return json(res, 400, { ok: false, error: "Đường dẫn ảnh không được hỗ trợ." });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*" }
    });
    if (!response.ok) return json(res, response.status, { ok: false, error: `Không tải được ảnh nguồn (${response.status}).` });
    const contentType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!contentType.startsWith("image/")) return json(res, 415, { ok: false, error: "Nguồn không trả về hình ảnh." });
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > MAX_IMAGE_BYTES) return json(res, 413, { ok: false, error: "Ảnh vượt quá 12 MB." });
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_IMAGE_BYTES) return json(res, 413, { ok: false, error: "Ảnh vượt quá 12 MB." });
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
    return res.end(buffer);
  } catch (error) {
    return json(res, 502, { ok: false, error: error?.name === "AbortError" ? "Tải ảnh quá thời gian." : "Không tải được ảnh nguồn." });
  } finally {
    clearTimeout(timeout);
  }
};

