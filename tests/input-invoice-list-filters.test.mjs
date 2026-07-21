import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const html=readFileSync(join(process.cwd(),'index.html'),'utf8');

assert.match(html,/Nhà cung cấp \/ MST/,'Supplier filter must also accept a tax code');
assert.match(html,/data-input-invoice-filter="invoiceNumber"/,'Invoice list needs an invoice-number filter');
assert.match(html,/data-input-invoice-filter="search"/,'Invoice list needs a description search filter');
assert.match(html,/x\.seller_tax_code/,'Supplier filtering must search the tax code');
assert.match(html,/x\.invoice_series/,'Invoice-number filtering must search the invoice series');
assert.match(html,/x\.raw_item_description/,'Description filtering must search invoice content');
assert.match(html,/data-input-invoice-filter-reset/,'Invoice filters need a clear action');
assert.match(html,/state\.inputInvoices\.filters=\{period:'',year:'',supplier:'',invoiceNumber:'',search:'',category:'',status:'',reviewed:''\}/,'Clear action must reset every invoice filter');
assert.match(html,/Danh sách hóa đơn[\s\S]{0,500}inputInvoiceFilters\(\)/,'Filters must be rendered directly with the invoice list');

console.log('Input invoice list filter checks passed.');
