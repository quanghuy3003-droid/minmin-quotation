import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const html=readFileSync(join(process.cwd(),'index.html'),'utf8');

assert.match(html,/window\.__MINMIN_AUTO_LINK_STATEMENT__\?\.\(p\)/,'Imported statement rows must attempt confident auto-linking');
assert.match(html,/data-payment-auto-link/,'The payment table needs a manual auto-link action for existing statement rows');
assert.match(html,/trùng tên công ty/,'Suggestions must explain company-name matches');
assert.match(html,/best\.score<65/,'Low-confidence candidates must not be linked automatically');
assert.match(html,/best\.score-second\.score<20/,'Ambiguous candidates must remain unlinked');
assert.match(html,/★ Gợi ý/,'The best invoice suggestion must be visibly promoted');
assert.match(html,/data-payment-supplier/,'Expense rows must select a supplier instead of requiring an invoice');
assert.match(html,/payment\.related_type=supplier\?'supplier':''/,'Supplier selection must persist on the payment');
assert.match(html,/payment\?\.related_type==='supplier'/,'Reconciliation must include payments assigned to a supplier');
assert.match(html,/Dòng tiền sẽ vào tab Đối soát của nhà cung cấp/,'The supplier selector must explain the reconciliation flow');
assert.match(html,/function originalStatementDescription/,'Statement descriptions need a dedicated immutable source');
assert.match(html,/payment\.related_label=originalStatementDescription\(payment\)/,'Selecting a supplier must preserve the original statement description');
assert.match(html,/function restoreSupplierStatementLabels/,'Previously overwritten statement descriptions must be repaired');
assert.match(html,/filters\.reconcileUnit=supplier\.key/,'Selecting a supplier must make it the active reconciliation unit');
assert.match(html,/Hóa đơn nhà cung cấp tự cập nhật từ mục Mua vào/,'The reconciliation screen must explain its live invoice source');

console.log('Bank statement invoice auto-link checks passed.');
