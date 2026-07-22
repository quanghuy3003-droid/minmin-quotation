const crypto = require('node:crypto');

const MAX_XLSX_BYTES = 20 * 1024 * 1024;
const GRAPH_ROOT = 'https://graph.microsoft.com/v1.0';

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_XLSX_BYTES) {
        reject(Object.assign(new Error('File Excel vuot qua gioi han 20 MB.'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function graphRequest(url, options, label) {
  const response = await fetch(url, options);
  if (response.ok) return response;
  const detail = (await response.text()).slice(0, 1000);
  throw new Error(`${label} that bai (${response.status}): ${detail || response.statusText}`);
}

async function getAccessToken() {
  const tenant = process.env.MS_GRAPH_TENANT_ID;
  const clientId = process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
  if (!tenant || !clientId || !clientSecret || !process.env.MS_GRAPH_DRIVE_ID) {
    throw Object.assign(new Error('Chua cau hinh Microsoft Graph cho chuyen doi Excel sang PDF.'), { statusCode: 503 });
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });
  const response = await graphRequest(
    `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body },
    'Dang nhap Microsoft Graph'
  );
  return (await response.json()).access_token;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  let uploadedItemId = '';
  let token = '';
  try {
    const xlsx = await readBody(req);
    if (!xlsx.length) throw Object.assign(new Error('File Excel rong.'), { statusCode: 400 });
    token = await getAccessToken();
    const driveId = encodeURIComponent(process.env.MS_GRAPH_DRIVE_ID);
    const sourceName = decodeURIComponent(String(req.headers['x-file-name'] || 'quotation.xlsx'));
    const baseName = sourceName.replace(/\.xlsx$/i, '').replace(/[^\p{L}\p{N}._ -]+/gu, '_').slice(0, 100) || 'quotation';
    const tempName = `${baseName}-${crypto.randomUUID()}.xlsx`;
    const auth = { Authorization: `Bearer ${token}` };
    const upload = await graphRequest(`${GRAPH_ROOT}/drives/${driveId}/root:/${encodeURIComponent(tempName)}:/content`, {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      body: xlsx
    }, 'Tai workbook len Excel Online');
    uploadedItemId = (await upload.json()).id;
    const converted = await graphRequest(
      `${GRAPH_ROOT}/drives/${driveId}/items/${encodeURIComponent(uploadedItemId)}/content?format=pdf`,
      { headers: auth, redirect: 'follow' },
      'Excel Online xuat PDF'
    );
    const pdf = Buffer.from(await converted.arrayBuffer());
    if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Microsoft Graph khong tra ve mot file PDF hop le.');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', String(pdf.length));
    res.setHeader('Cache-Control', 'no-store');
    res.end(pdf);
  } catch (error) {
    sendJson(res, error.statusCode || 502, { ok: false, error: error.message || 'Khong chuyen doi duoc Excel sang PDF.' });
  } finally {
    if (uploadedItemId && token) {
      try {
        const driveId = encodeURIComponent(process.env.MS_GRAPH_DRIVE_ID);
        await fetch(`${GRAPH_ROOT}/drives/${driveId}/items/${encodeURIComponent(uploadedItemId)}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.warn('Khong xoa duoc workbook tam tren OneDrive:', error.message);
      }
    }
  }
};

module.exports.config = { api: { bodyParser: false } };
