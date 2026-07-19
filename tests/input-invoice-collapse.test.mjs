import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(html,/data-input-invoice-collapse/,'The large input-invoice editor needs a collapse control');
assert.match(html,/data-input-invoice-collapse[^>]*>[\s\S]*?Thu gọn<\/button>/,'The collapse control needs a clear Vietnamese label');
assert.match(html,/\[data-input-invoice-collapse\][\s\S]*?editingId=''/,'Collapsing must close the active editor');
assert.match(html,/if\(String\(state\.inputInvoices\.editingId\)===String\(inv\.id\)\)state\.inputInvoices\.editingId=''/,'Reviewing the active invoice must auto-collapse its editor');

const extractionStart=html.indexOf('function inputInvoiceExtractionPanel');
const extractionEnd=html.indexOf('function inputInvoiceInventoryOptions',extractionStart);
assert.notEqual(extractionStart,-1);
assert.notEqual(extractionEnd,-1);
const extractionPanel=html.slice(extractionStart,extractionEnd);
assert.doesNotMatch(extractionPanel,/Sửa dữ liệu/,'The extraction panel must not repeat the edit action');
assert.doesNotMatch(extractionPanel,/Đánh dấu đã kiểm tra/,'The extraction panel must not repeat the review action');

const tableStart=html.indexOf('function inputInvoiceTable');
const tableEnd=html.indexOf('function renderToolsTab',tableStart);
const invoiceTable=html.slice(tableStart,tableEnd);
assert.match(invoiceTable,/data-input-invoice-delete="\$\{esc\(x\.id\)\}"/,'Every input-invoice row needs a delete action');
assert.match(invoiceTable,/>Xóa<\/button>/,'The row delete action must show the word Xóa');
assert.match(html,/confirm\('Xóa dòng hóa đơn này\?/,'Deleting an invoice must require confirmation');

console.log('Input invoice editor collapse checks passed.');
