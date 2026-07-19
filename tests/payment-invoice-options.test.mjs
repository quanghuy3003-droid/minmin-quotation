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
assert.match(source,/key===selectedKey\|\|!linkedKeys\.has\(key\)/,'Used invoices must disappear while the current selection remains visible');
assert.match(html,/function paymentRelatedIds\(payment\)[^{]*\{[^}]*slice\(0,1\)/,'Each payment must use at most one invoice reference');
assert.match(html,/function paymentInvoiceLinkControl\(p\)/,'Payment rows need a dedicated linked-state control');
assert.match(html,/const id=paymentRelatedIds\(p\)\[0\]\|\|'', invoice=paymentInvoiceRefs\(p\)\[0\]\|\|null, linked=!!invoice/,'Green state must require one invoice that still exists');
assert.doesNotMatch(html,/data-payment-link-slot=/,'The UI must not render a second invoice selector');
assert.match(html,/Math\.abs\(difference\)<1[\s\S]*Khớp số tiền[\s\S]*Còn thiếu[\s\S]*Vượt/,'The linked invoice must be checked for exact, short, and excess amounts');
assert.match(html,/pay\.related_id=target\?String\(id\):''/,'Changing the picker must persist only one invoice id');
assert.match(html,/String\(row\.related_id\|\|''\)\.split\(','\)\[0\]\.trim\(\)/,'Legacy two-id values must safely keep only the first invoice');

console.log('Single payment invoice link and difference checks passed.');
