import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, '..', 'index.html'), 'utf8');
const patch = html.slice(html.indexOf('MINMIN PATCH 2026-07-25: Quiet Luxury accounting workspace'));

test('accounting desktop uses the Minmin Quiet Luxury design tokens', () => {
  assert.match(patch, /#FAFAF8/);
  assert.match(patch, /#ECECEC/);
  assert.match(patch, /#3D8B74/);
  assert.match(patch, /\.mmq-kpi\{[^}]*border-radius:16px/);
  assert.match(patch, /\.mmq-button\{height:44px/);
});

test('accounting dashboard keeps the requested compact information architecture', () => {
  for (const label of ['Tổng trước VAT', 'VAT đầu vào', 'Tổng thanh toán', 'Cần kiểm tra']) {
    assert.ok(patch.includes(label), `missing KPI ${label}`);
  }
  assert.ok(patch.includes('Kéo XML/PDF vào đây'));
  assert.ok(patch.includes('Upload hóa đơn'));
  assert.ok(patch.includes('XML đọc thành công'));
  assert.ok(patch.includes('PDF lưu thành công'));
  assert.match(patch, /<th>Ngày<\/th><th>Nhà cung cấp<\/th><th>Nội dung<\/th><th>Sản phẩm đã khớp<\/th>/);
});

test('invoice rows expose only XML, edit and overflow actions', () => {
  assert.match(patch, /class="mmq-row-actions"[\s\S]*?XML[\s\S]*?data-mm-accounting-edit[\s\S]*?quietActionMenu/);
  for (const action of ['Khớp lại', 'Xem PDF', 'Xóa', 'Lịch sử']) {
    assert.ok(patch.includes(action), `missing overflow action ${action}`);
  }
});

test('invoice details stay in an editable six-tab drawer', () => {
  for (const [id, tab] of [['info', 'Thông tin'], ['pdf', 'PDF'], ['xml', 'XML'], ['products', 'Sản phẩm'], ['notes', 'Ghi chú'], ['history', 'Lịch sử']]) {
    assert.ok(patch.includes(`['${id}','${tab}']`), `missing drawer tab ${tab}`);
  }
  assert.ok(patch.includes('data-input-invoice-edit='));
  assert.ok(patch.includes('data-input-invoice-item-field='));
  assert.ok(patch.includes('data-input-invoice-stock-picker='));
});

test('the redesign is desktop-only and delegates to existing business logic', () => {
  assert.match(patch, /if\(mobile\)return quietAccountingBase/);
  assert.match(patch, /processInputInvoiceFiles\(\)/);
  assert.match(patch, /inputInvoiceFiltered\(\)/);
  assert.match(patch, /saveInputInvoices\(\)/);
  assert.doesNotMatch(patch, /create table if not exists|supabaseRequest\(/i);
});
