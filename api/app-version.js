module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Chỉ hỗ trợ GET." });
  }

  const version = String(
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_URL ||
    "local"
  );

  return res.status(200).json({ ok: true, version });
};
