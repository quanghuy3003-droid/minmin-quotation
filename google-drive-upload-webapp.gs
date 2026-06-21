const MINMIN_ROOT_FOLDER = "MINMIN App Storage";

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData && event.postData.contents || "{}");
    const dataUrl = String(payload.dataUrl || "");
    const parsed = parseDataUrl_(dataUrl);
    const kind = safeFolderName_(payload.kind || "files");
    const code = safeFolderName_(payload.code || "uncoded");
    const fileName = safeFileName_(payload.fileName || `${kind}-${Date.now()}`);
    const folderPath = String(payload.folderPath || `${kind}/${code}`)
      .split("/")
      .map(safeFolderName_)
      .filter(Boolean);

    const root = getOrCreateFolder_(DriveApp.getRootFolder(), MINMIN_ROOT_FOLDER);
    const targetFolder = folderPath.reduce((parent, name) => getOrCreateFolder_(parent, name), root);
    const blob = Utilities.newBlob(parsed.bytes, payload.mimeType || parsed.mimeType, fileName);
    const file = targetFolder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return json_({
      ok: true,
      fileId: file.getId(),
      name: file.getName(),
      folderPath: `${MINMIN_ROOT_FOLDER}/${folderPath.join("/")}`,
      viewUrl: file.getUrl(),
      downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
      imageUrl: `https://drive.google.com/uc?export=view&id=${file.getId()}`
    });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message || error) });
  }
}

function doGet() {
  return json_({ ok: true, name: "MINMIN Drive Upload Web App" });
}

function parseDataUrl_(dataUrl) {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) throw new Error("File upload không đúng định dạng data URL.");
  const mimeType = match[1] || "application/octet-stream";
  const body = match[3] || "";
  const bytes = match[2] ? Utilities.base64Decode(body) : Utilities.newBlob(decodeURIComponent(body)).getBytes();
  return { mimeType, bytes };
}

function getOrCreateFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function safeFolderName_(value) {
  return String(value || "files").replace(/[\\/:*?"<>|#%{}~&]/g, "-").slice(0, 80) || "files";
}

function safeFileName_(value) {
  return String(value || "file").replace(/[\\/:*?"<>|#%{}~&]/g, "-").slice(0, 160) || "file";
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
