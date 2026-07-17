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
assert.match(source,/flatMap\(payment=>paymentRelatedIds\(payment\)/,'Every stored invoice reference must participate in uniqueness checks');
assert.match(source,/key===selectedKey\|\|!linkedKeys\.has\(key\)/,'Used invoices must disappear while the current selection remains visible');
assert.match(source,/\.filter\(available\('outgoing'\)\)/);
assert.match(source,/\.filter\(available\('incoming'\)\)/);
assert.match(html,/function paymentInvoiceLinkControl\(p\)/,'Payment rows need a dedicated linked-state control');
assert.match(html,/const ids=paymentRelatedIds\(p\), refs=paymentInvoiceRefs\(p\), linked=refs\.length>0/,'Green state must require at least one invoice that still exists');
assert.match(html,/paymentInvoiceByRef\(type,ids\[slot\]\)\?'border-mint\/40 bg-mint\/5 text-mint'/,'Only a valid selected invoice may make its selector green');
assert.match(html,/data-payment-link-slot="\$\{slot\}"/,'Each payment must expose two invoice slots');
assert.match(html,/select\(0,'Hóa đơn 1'\).*select\(1,'Hóa đơn 2 \(không bắt buộc\)'\)/s,'A payment must allow at most two invoice choices');
assert.match(html,/function paymentAllocatedAmount\(payment,type,id\)/,'A multi-invoice payment must allocate money without double counting');
assert.match(html,/Math\.abs\(difference\)<1[\s\S]*Khớp số tiền[\s\S]*Còn thiếu[\s\S]*Vượt/,'The linked invoices must be checked for exact, short, and excess amounts');
assert.match(html,/nextIds\.join\(','\)/,'Both selected invoice ids must persist in the existing payment record');

console.log('Payment invoice option, two-link, and difference checks passed.');
