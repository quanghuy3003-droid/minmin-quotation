function normalizeEndpoint(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/https:\/\/script\.google\.com\/macros\/s\/([^/?#]+)(?:\/(?:exec|dev))?/i);
  return match ? `https://script.google.com/macros/s/${match[1]}/exec` : raw;
}

function allowedOrigin(origin) {
  if (!origin) return true;
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin)) return true;
  if (origin === "https://minmin-quotation-s74k.vercel.app") return true;
  return /^https:\/\/minmin-quotation-[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 18 * 1024 * 1024) {
        reject(new Error("File quá lớn để upload qua API trung gian."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Dữ liệu upload không đúng định dạng JSON."));
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  const origin = String(req.headers?.origin || "");
  if (!allowedOrigin(origin)) {
    return res.status(403).json({ ok: false, error: "Nguồn gọi upload không hợp lệ." });
  }
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      provider: "google-drive",
      configured: Boolean(process.env.DRIVE_UPLOAD_ENDPOINT && process.env.DRIVE_UPLOAD_TOKEN)
    });
  }
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Chỉ hỗ trợ upload bằng POST." });

  try {
    const body = await readJsonBody(req);
    const endpoint = normalizeEndpoint(process.env.DRIVE_UPLOAD_ENDPOINT || body.endpoint);
    const uploadToken = String(process.env.DRIVE_UPLOAD_TOKEN || "");
    const payload = {
      ...(body.payload || {}),
      uploadToken
    };

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/exec$/i.test(endpoint)) {
      return res.status(400).json({
        ok: false,
        error: "Google Drive chưa được cấu hình trên máy chủ."
      });
    }
    if (!uploadToken) {
      return res.status(503).json({ ok: false, error: "Google Drive chưa có mã bảo vệ upload." });
    }
    if (!payload.dataUrl || !payload.fileName) {
      return res.status(400).json({ ok: false, error: "Thiếu file upload." });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const driveRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const text = await driveRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const preview = text.replace(/\s+/g, " ").slice(0, 220);
      return res.status(502).json({
        ok: false,
        error: `Apps Script chưa trả JSON. Kiểm tra deploy Web app quyền Anyone. Phản hồi: ${preview || "trống"}`
      });
    }

    if (!driveRes.ok || !data.ok) {
      return res.status(502).json({ ok: false, error: data.error || `Google Drive lỗi ${driveRes.status}` });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : String(error)
    });
  }
};
