import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const template = new URL('../assets/templates/payment-request-template.docx', import.meta.url);

assert.ok(fs.statSync(template).size > 100_000, 'The retained payment request DOCX template must be bundled');
assert.match(source, /PAYMENT_REQUEST_TEMPLATE_URL='assets\/templates\/payment-request-template\.docx'/);
assert.match(source, /buildPaymentRequestDocxBlob/);
assert.match(source, /window\.docx\.renderAsync\(blob/);
assert.match(source, /task==='payment'\?paymentRequestPreviewHtml\(\)/);
assert.doesNotMatch(source.match(/function paymentRequestPreviewHtml\(\)[\s\S]*?\n\}/)?.[0] || '', /CỘNG HO[ÀA]/);

console.log('Payment request Word-template checks passed.');
