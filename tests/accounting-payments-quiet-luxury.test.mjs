import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = html.indexOf('function quietPaymentsDesktop()');
const end = html.indexOf('function quietAccountingOtherDesktop', start);
assert.ok(start > 0 && end > start, 'The desktop Thu/chi renderer must exist');
const payments = html.slice(start, end);

assert.doesNotMatch(payments, /paymentForm\(\)/, 'Desktop Thu/chi must not render the legacy manual payment form');
assert.doesNotMatch(payments, /Ghi nhận thanh toán\s*\/\s*UNC/, 'Desktop Thu/chi must not show the legacy UNC form heading');
assert.match(payments, /quietPaymentImport\(\)/, 'The bank statement import bar must be first-class desktop UI');
assert.match(html, /id="bankStatementPdf"[\s\S]*?Chọn PDF sao kê/);
assert.match(html, /id="importBankStatementPdf"[\s\S]*?Quét PDF/);

for (const label of ['Tổng thu', 'Tổng chi', 'Số dư', 'Cần kiểm tra']) {
  assert.match(html, new RegExp(label), `Missing Thu/chi KPI: ${label}`);
}

for (const filter of ['paymentDateFrom', 'paymentDateTo', 'paymentType', 'paymentSearch', 'paymentReview']) {
  assert.match(html, new RegExp(`data-mm-payment-filter="${filter}"`), `Missing Thu/chi filter: ${filter}`);
}
assert.match(html, /data-payment-auto-link[\s\S]*?Tự nhận diện nhà cung cấp/);

for (const column of ['Ngày', 'Loại', 'Nội dung giao dịch', 'Hóa đơn / Nhà cung cấp', 'File nguồn', 'Số tiền', 'Chứng từ', 'Thao tác']) {
  assert.match(html, new RegExp(`<th>${column.replace('/', '\\/')}</th>`), `Missing transaction column: ${column}`);
}

assert.match(html, /data-mm-payment-supplier=/, 'Expense supplier control must support searchable datalist input');
assert.match(html, /<datalist id="\$\{listId\}"/, 'Supplier search must expose suggestions');
assert.match(html, /mmq-payment-party \$\{selected\?'recognized':''\}/, 'Recognized suppliers need a Minmin green state');
assert.match(html, /data-open-url=/, 'Rows must retain the Open action');
assert.match(html, /data-payment-edit=/, 'Rows must retain the Edit action');
assert.match(html, /data-mm-payment-menu=/, 'Rows must use the compact overflow menu');
assert.match(html, /data-payment-delete=/, 'Delete must remain available inside the overflow menu');

assert.match(html, /if\(mobile\)return quietAccountingBase\.apply\(this,arguments\)/, 'Mobile accounting must keep the existing renderer');
assert.match(html, /if\(view==='payments'\)return quietPaymentsDesktop\(\)/, 'Only desktop Thu/chi should use the new renderer');
assert.match(html, /savePaymentRemote\(payment\)/, 'Supplier changes must keep remote persistence');

console.log('Desktop Thu/chi Quiet Luxury checks passed.');
