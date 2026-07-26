import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const patch = html.slice(html.indexOf('MINMIN PATCH 2026-07-26 OUTGOING QUIET LUXURY'));

test('outgoing desktop uses the Minmin Quiet Luxury information architecture', () => {
  for (const marker of [
    'mmso-kpis',
    'Doanh thu',
    'Chi phí đầu vào',
    'Lợi nhuận',
    'Chênh lệch VAT',
    'Kéo XML/PDF vào đây',
    'mmso-filters',
    'mmso-table-wrap',
    'mmso-product-chip',
    'mmso-group-grid',
  ]) assert.ok(patch.includes(marker), `missing ${marker}`);
});

test('outgoing rows expose three direct actions and move secondary actions into a menu', () => {
  assert.match(patch, />XML</);
  assert.ok(patch.includes('data-mmso-edit'));
  assert.ok(patch.includes('data-mmso-menu'));
  for (const label of ['Xem PDF', 'Khớp lại', 'Xóa liên kết', 'Lịch sử xử lý']) {
    assert.ok(patch.includes(label), `missing ${label}`);
  }
});

test('outgoing invoice details use a six-tab right drawer', () => {
  for (const label of ['Thông tin', 'PDF', 'XML', 'Sản phẩm khớp', 'Ghi chú', 'Lịch sử']) {
    assert.ok(patch.includes(label), `missing drawer tab ${label}`);
  }
  assert.ok(patch.includes('class="mmso-drawer"'));
  assert.ok(patch.includes('data-outgoing-edit'));
  assert.ok(patch.includes('data-sale-order-file'));
});

test('matched products show compact inventory thumbnails without cropping', () => {
  assert.ok(patch.includes('function mmsoDrawerStockChip(inv,line,stock)'));
  assert.ok(patch.includes('class="mmso-drawer-stock-chip"'));
  assert.match(patch, /photoSourceValue\(stock\)\|\|stock\.photoDataUrl\|\|stock\.photoStorageUrl/);
  assert.match(patch, /\.mmso-drawer-stock-chip>img[\s\S]*?object-fit:contain/);
});

test('service invoices do not force inventory matching', () => {
  assert.ok(patch.includes("return 'service'"));
  assert.ok(patch.includes('Dịch vụ · Không áp dụng'));
  assert.ok(patch.includes('Không áp dụng khớp kho'));
});

test('redesign stays desktop-only and delegates to existing business logic', () => {
  assert.match(patch, /max-width:\s*767px/);
  assert.match(patch, /return mmsoBase\.apply\(this,arguments\)/);
  assert.ok(html.includes('window.__minminOutgoingModel=Object.freeze'));
  for (const helper of ['mmsoModel.lines', 'mmsoModel.kind', 'mmsoModel.finance', 'mmsoModel.match', 'mmsoModel.managedRows']) {
    assert.ok(patch.includes(helper), `missing model delegation ${helper}`);
  }
  for (const existingHook of ['outgXmlScanner', 'data-sale-order-file', 'data-outg-line-picker', 'data-outg-input-picker', 'saveOutgoingInvoiceRemote']) {
    assert.ok(patch.includes(existingHook), `missing existing hook ${existingHook}`);
  }
  assert.doesNotMatch(patch, /create table|alter table|supabaseRequest\(/i);
});

test('wide invoice table scrolls inside the card without stretching the desktop page', () => {
  assert.match(patch, /\.mmso-page\{display:grid;min-width:0/);
  assert.match(patch, /\.mmso-list\{min-width:0/);
  assert.match(patch, /\.mmso-table-wrap\{width:100%;max-width:100%;overflow:auto\}/);
  assert.match(patch, /\.mmso-table-wrap\{scrollbar-width:none;-ms-overflow-style:none\}/);
  assert.match(patch, /\.mmso-table-wrap::\-webkit-scrollbar\{display:none;width:0;height:0\}/);
});
