import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const start=html.indexOf('function paymentInvoiceSelectOptions');
const end=html.indexOf('function paymentShortText',start);
assert.notEqual(start,-1);
assert.notEqual(end,-1);
const source=html.slice(start,end);

assert.match(source,/compactDate\(x\.invoice_date\|\|x\.request_date\)/,'Outgoing invoice choices must show the invoice date');
assert.match(source,/compactDate\(x\.invoice_date\|\|x\.period\)/,'Incoming invoice choices must show the invoice date');
assert.match(source,/const linkedKeys=new Set/,'The picker must track invoices already linked to payments');
assert.match(html,/function paymentInvoiceByRef\(type,id\)/,'Linked state must resolve the referenced invoice');
assert.match(source,/const selectedKey=paymentInvoiceByRef\(selectedType,selectedId\)/,'A missing invoice reference must render as unlinked');
assert.match(source,/filter\(payment=>paymentInvoiceByRef\(payment\.related_type,payment\.related_id\)\)/,'Only existing invoice references count as linked');
assert.match(source,/key===selectedKey\|\|!linkedKeys\.has\(key\)/,'Used invoices must disappear while the current selection remains visible');
assert.match(source,/\.filter\(available\('outgoing'\)\)/);
assert.match(source,/\.filter\(available\('incoming'\)\)/);
assert.match(html,/function paymentInvoiceLinkControl\(p\)/,'Payment rows need a dedicated linked-state control');
assert.match(html,/const linked=!!paymentInvoiceByRef\(p\?\.related_type,p\?\.related_id\)/,'Green state must require an invoice that still exists');
assert.match(html,/âœ“ ÄÃ£ liÃªn káº¿t hÃ³a Ä‘Æ¡n|✓ Đã liên kết hóa đơn/,'A linked invoice must show a green check label');
assert.match(html,/linked\?'border-mint\/40 bg-mint\/5 text-mint'/,'The linked selector must use a green state');

console.log('Payment invoice option date and uniqueness checks passed.');
