const PHOTO_FOLDER_ID = 'PASTE_PHOTO_FOLDER_ID_HERE';
const INVOICE_FOLDER_ID = 'PASTE_INVOICE_FOLDER_ID_HERE';

function doGet() {
  return jsonOutput({
    ok: true,
    message: 'Minmin Drive upload endpoint is ready.'
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const kind = String(payload.kind || '').toLowerCase();
    const folderId = kind === 'invoice' ? INVOICE_FOLDER_ID : PHOTO_FOLDER_ID;
    if (!folderId || folderId.indexOf('PASTE_') === 0) {
      throw new Error('Missing Google Drive folder id in Apps Script.');
    }

    const dataUrl = String(payload.dataUrl || '');
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error('Invalid file data.');

    const mimeType = payload.mimeType || match[1] || 'application/octet-stream';
    const safeName = safeFileName(payload.fileName || `${kind || 'file'}-${Date.now()}`);
    const code = safeFileName(payload.code || '');
    const name = code ? `${code} - ${safeName}` : safeName;
    const bytes = Utilities.base64Decode(match[2]);
    const blob = Utilities.newBlob(bytes, mimeType, name);
    const file = DriveApp.getFolderById(folderId).createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    return jsonOutput({
      ok: true,
      fileId,
      name: file.getName(),
      mimeType,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      imageUrl: `https://drive.google.com/uc?export=view&id=${fileId}`
    });
  } catch (err) {
    return jsonOutput({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function safeFileName(value) {
  return String(value || '')
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
