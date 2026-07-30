const MINMIN_ROOT_FOLDER = "MINMIN App Storage";
const MINMIN_UPLOAD_TOKEN = "__MINMIN_UPLOAD_TOKEN__";
const MINMIN_MAX_BYTES = 10 * 1024 * 1024;

function doGet() {
  return json_({ ok: true, name: "MINMIN Drive Upload", version: 2 });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event && event.postData && event.postData.contents || "{}");
    if (!MINMIN_UPLOAD_TOKEN || MINMIN_UPLOAD_TOKEN.indexOf("__MINMIN_") === 0) {
      throw new Error("Chưa cấu hình mã bảo vệ upload.");
    }
    if (String(payload.uploadToken || "") !== MINMIN_UPLOAD_TOKEN) {
      throw new Error("Không có quyền upload.");
    }

    const requestId = safeKey_(payload.requestId || Utilities.getUuid());
    const cache = CacheService.getScriptCache();
    const cached = cache.get(requestId);
    if (cached) return json_(JSON.parse(cached));

    const parsed = parseDataUrl_(String(payload.dataUrl || ""));
    if (parsed.bytes.length > MINMIN_MAX_BYTES) {
      throw new Error("File vượt 10 MB. Hãy nén hoặc chia nhỏ file.");
    }

    const kind = safeFolderName_(payload.kind || "files");
    const code = safeFolderName_(payload.code || "uncoded");
    const fileName = safeFileName_(payload.fileName || `${kind}-${Date.now()}`);
    const folderPath = String(payload.folderPath || `${kind}/${code}`)
      .split("/")
      .map(safeFolderName_)
      .filter(Boolean);

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    let file;
    try {
      const root = getOrCreateFolder_(DriveApp.getRootFolder(), MINMIN_ROOT_FOLDER);
      const targetFolder = folderPath.reduce(
        (parent, name) => getOrCreateFolder_(parent, name),
        root
      );
      const blob = Utilities.newBlob(
        parsed.bytes,
        payload.mimeType || parsed.mimeType,
        fileName
      );
      file = targetFolder.createFile(blob);
      file.setDescription(`MINMIN upload ${requestId}`);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } finally {
      lock.releaseLock();
    }

    if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
      file.setTrashed(true);
      throw new Error("Google Drive chưa cho phép chia sẻ file bằng liên kết.");
    }

    const fileId = file.getId();
    const mimeType = file.getMimeType() || parsed.mimeType;
    const isImage = /^image\//i.test(mimeType);
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    const result = {
      ok: true,
      provider: "google-drive",
      bucket: "drive",
      fileId,
      fileName: file.getName(),
      name: file.getName(),
      mimeType,
      fileType: mimeType,
      size: file.getSize(),
      folderPath: `${MINMIN_ROOT_FOLDER}/${folderPath.join("/")}`,
      storagePath: `${MINMIN_ROOT_FOLDER}/${folderPath.join("/")}/${file.getName()}`,
      viewUrl,
      imageUrl: isImage ? imageUrl : "",
      publicUrl: isImage ? imageUrl : viewUrl,
      url: isImage ? imageUrl : viewUrl,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      uploadedAt: new Date().toISOString()
    };
    cache.put(requestId, JSON.stringify(result), 21600);
    return json_(result);
  } catch (error) {
    return json_({
      ok: false,
      error: String(error && error.message || error || "Upload thất bại.")
    });
  }
}

function parseDataUrl_(dataUrl) {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) throw new Error("File upload không đúng định dạng.");
  const mimeType = match[1] || "application/octet-stream";
  const body = match[3] || "";
  const bytes = match[2]
    ? Utilities.base64Decode(body)
    : Utilities.newBlob(decodeURIComponent(body)).getBytes();
  return { mimeType, bytes };
}

function getOrCreateFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function safeKey_(value) {
  return String(value || "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 120);
}

function safeFolderName_(value) {
  return String(value || "files")
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .slice(0, 80) || "files";
}

function safeFileName_(value) {
  return String(value || "file")
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .slice(0, 160) || "file";
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
