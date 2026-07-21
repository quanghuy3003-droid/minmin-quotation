const fs = require('node:fs');
const path = require('node:path');
const JSZip = require('../vendor/jszip.min.js');

const templatePath = path.join(__dirname, '..', 'assets', 'templates', 'payment-request-template.docx');
const allowed = ['CUSTOMER_NAME','CUSTOMER_ADDRESS','CONTRACT_NO','CONTRACT_DATE','PAYMENT_PERCENT','PAYMENT_AMOUNT','PAYMENT_AMOUNT_WORDS','SIGNER_NAME'];

function xmlEscape(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

module.exports = async function paymentRequest(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method not allowed');
  }
  try {
    const input = await readBody(req);
    const zip = await JSZip.loadAsync(fs.readFileSync(templatePath));
    for (const part of ['word/document.xml','word/header1.xml','word/header2.xml','word/footer1.xml','word/footer2.xml']) {
      const entry = zip.file(part);
      if (!entry) continue;
      let xml = await entry.async('string');
      for (const key of allowed) xml = xml.split(`{{${key}}}`).join(xmlEscape(input[key]));
      zip.file(part, xml);
    }
    const output = await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="payment-request.docx"');
    res.setHeader('Content-Length', output.length);
    res.end(output);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({error:error?.message || String(error)}));
  }
};
