import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const html=readFileSync(join(process.cwd(),'index.html'),'utf8');

assert.match(html,/window\.__MINMIN_AUTO_LINK_STATEMENT__\?\.\(p\)/,'Imported statement rows must attempt confident auto-linking');
assert.match(html,/data-payment-auto-link/,'The payment table needs a manual auto-link action for existing statement rows');
assert.match(html,/best\.score<65/,'Low-confidence candidates must not be linked automatically');
assert.match(html,/best\.score-second\.score<20/,'Ambiguous candidates must remain unlinked');
assert.match(html,/data-payment-supplier/,'Expense rows must select a supplier instead of requiring an invoice');
assert.match(html,/payment\.related_type=supplier\?'supplier':''/,'Supplier selection must persist on the payment');
assert.match(html,/payment\?\.related_type==='supplier'/,'Reconciliation must include payments assigned to a supplier');
assert.match(html,/function originalStatementDescription/,'Statement descriptions need a dedicated immutable source');
assert.match(html,/payment\.related_label=originalStatementDescription\(payment\)/,'Selecting a supplier must preserve the original statement description');
assert.match(html,/function restoreSupplierStatementLabels/,'Previously overwritten statement descriptions must be repaired');
assert.match(html,/filters\.reconcileUnit=supplier\.key/,'Selecting a supplier must make it the active reconciliation unit');
assert.match(html,/data-reconcile-details-toggle/,'The long reconciliation table needs a collapse control');
assert.match(html,/reconcileDetailsCollapsed=!state\.accounting\.filters\.reconcileDetailsCollapsed/,'The collapse control must persist and toggle its state');
assert.match(html,/balance=data\.invoiceTotal-data\.paymentTotal/,'Supplier balance must follow invoices minus payments');
assert.match(html,/cộng riêng tổng hóa đơn phải thu và tổng tiền đã thanh toán/,'The reconciliation screen must explain the supplier-ledger method');
assert.match(html,/Phải thu · \$\{invoices\.length\} hóa đơn/,'Invoice count must be visible beside the receivable total');
assert.match(html,/Đã thanh toán · \$\{payments\.length\} giao dịch/,'Payment count must be visible beside the paid total');
assert.match(html,/Không ghép từng dòng với nhau/,'Reconciliation must compare totals without row-level matching');
assert.match(html,/Giao dịch sao kê \(\$\{payments\.length\}\)/,'Statement transactions must remain a separate dated list');
assert.match(html,/Hóa đơn nhà cung cấp \(\$\{invoices\.length\}\)/,'Supplier invoices must remain a separate dated list');

console.log('Bank statement supplier-ledger checks passed.');
