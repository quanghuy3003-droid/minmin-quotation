function normalizeEndpoint(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/https:\/\/script\.google\.com\/macros\/s\/([^/?#]+)(?:\/(?:exec|dev))?/i);
  return match ? `https://script.google.com/macros/s/${match[1]}/exec` : raw;
}

function allowedOrigin(origin) {
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin)) return true;
  if (origin === "https://minmin-quotation-s74k.vercel.app") return true;
  return /^https:\/\/minmin-quotation-[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 9 * 1024 * 1024) {
        reject(new Error("Dữ liệu đồng bộ vượt 9 MB."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Dữ liệu đồng bộ không đúng định dạng JSON."));
      }
    });
    req.on("error", reject);
  });
}

function containsReplacementCharacter(value) {
  if (typeof value === "string") return value.includes("\uFFFD");
  if (Array.isArray(value)) return value.some(containsReplacementCharacter);
  if (value && typeof value === "object") return Object.values(value).some(containsReplacementCharacter);
  return false;
}

module.exports = async function handler(req, res) {
  const origin = String(req.headers?.origin || "");
  if (req.method !== "GET" && (!origin || !allowedOrigin(origin))) {
    return res.status(403).json({ ok: false, error: "Nguồn gọi đồng bộ không hợp lệ." });
  }
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      provider: "google-drive",
      stateSync: true,
      configured: Boolean(process.env.DRIVE_UPLOAD_ENDPOINT && process.env.DRIVE_UPLOAD_TOKEN)
    });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Chỉ hỗ trợ POST." });
  }

  try {
    const body = await readJsonBody(req);
    const action = String(body.action || "");
    if (!["state.get", "state.put"].includes(action)) {
      return res.status(400).json({ ok: false, error: "Tác vụ đồng bộ không hợp lệ." });
    }
    if (action === "state.put" && containsReplacementCharacter(body.data)) {
      return res.status(400).json({
        ok: false,
        error: "Dữ liệu chứa ký tự lỗi mã hóa. App đã chặn ghi đè để bảo vệ bản UTF-8 trên Google Drive."
      });
    }
    const endpoint = normalizeEndpoint(process.env.DRIVE_UPLOAD_ENDPOINT);
    const uploadToken = String(process.env.DRIVE_UPLOAD_TOKEN || "");
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/exec$/i.test(endpoint) || !uploadToken) {
      return res.status(503).json({ ok: false, error: "Google Drive chưa được cấu hình trên máy chủ." });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let driveResponse;
    try {
      driveResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...body, uploadToken }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }
    const text = await driveResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ ok: false, error: "Google Drive trả dữ liệu không hợp lệ." });
    }
    if (!driveResponse.ok) {
      return res.status(502).json({ ok: false, error: data.error || `Google Drive lỗi ${driveResponse.status}` });
    }
    return res.status(data.conflict ? 409 : (data.ok ? 200 : 502)).json(data);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || String(error) });
  }
};
