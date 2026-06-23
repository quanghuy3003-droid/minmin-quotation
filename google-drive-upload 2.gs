const MINMIN_ROOT_FOLDER = "MINMIN App Storage";

function doGet() {
  return jsonOutput({
    ok: true,
    message: "Minmin Drive upload endpoint is ready."
  });
}

function doPost(e) {
  try {
    const isFormUpload = !!(e && e.parameter && e.parameter.payload);
    const payload = isFormUpload
      ? JSON.parse(e.parameter.payload || "{}")
      : JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const dataUrl = String(payload.dataUrl || "");
    const parsed = parseDataUrl(dataUrl);
    const kind = safeFolderName(payload.kind || "files");
    const code = safeFolderName(payload.code || "uncoded");
    const folderPath = String(payload.folderPath || `${kind}/${code}`)
      .split("/")
      .map(safeFolderName)
      .filter(Boolean);
    const fileName = safeFileName(payload.fileName || `${kind}-${Date.now()}`);

    const root = getOrCreateFolder(DriveApp.getRootFolder(), MINMIN_ROOT_FOLDER);
    const targetFolder = folderPath.reduce((parent, name) => getOrCreateFolder(parent, name), root);
    const blob = Utilities.newBlob(parsed.bytes, payload.mimeType || parsed.mimeType, fileName);
    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const result = {
      ok: true,
      fileId,
      name: file.getName(),
      folderPath: `${MINMIN_ROOT_FOLDER}/${folderPath.join("/")}`,
      mimeType: payload.mimeType || parsed.mimeType,
      viewUrl: file.getUrl(),
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      imageUrl: `https://drive.google.com/uc?export=view&id=${fileId}`
    };
    return isFormUpload ? htmlMessage(e.parameter.requestId || "", result) : jsonOutput(result);
  } catch (err) {
    const result = {
      ok: false,
      error: err && err.message ? err.message : String(err)
    };
    return e && e.parameter && e.parameter.payload ? htmlMessage(e.parameter.requestId || "", result) : jsonOutput(result);
  }
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) throw new Error("File upload không đúng định dạng data URL.");
  const mimeType = match[1] || "application/octet-stream";
  const body = match[3] || "";
  const bytes = match[2] ? Utilities.base64Decode(body) : Utilities.newBlob(decodeURIComponent(body)).getBytes();
  return { mimeType, bytes };
}

function getOrCreateFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function safeFolderName(value) {
  return String(value || "files")
    .replace(/[\\/:*?"<>|#%{}~&]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "files";
}

function safeFileName(value) {
  return String(value || "file")
    .replace(/[\\/:*?"<>|#%{}~&]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160) || "file";
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function htmlMessage(requestId, data) {
  const message = JSON.stringify({ requestId, data }).replace(/</g, "\\u003c");
  return HtmlService.createHtmlOutput(
    `<!doctype html><meta charset="utf-8"><script>window.parent.postMessage(${message},"*");</script>`
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
