function normalizeEndpoint(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/https:\/\/script\.google\.com\/macros\/s\/([^/?#]+)(?:\/(?:exec|dev))?/i);
  return match ? `https://script.google.com/macros/s/${match[1]}/exec` : raw;
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Chỉ hỗ trợ upload bằng POST." });

  try {
    const body = await readJsonBody(req);
    const endpoint = normalizeEndpoint(body.endpoint);
    const payload = body.payload || {};

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/exec$/i.test(endpoint)) {
      return res.status(400).json({
        ok: false,
        error: "Google Drive Web App URL chưa đúng. Cần URL dạng https://script.google.com/macros/s/.../exec."
      });
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

    return res.status(driveRes.ok && data.ok ? 200 : 502).json(data);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : String(error)
    });
  }
};
