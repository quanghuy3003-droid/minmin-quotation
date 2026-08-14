import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, '..', 'index.html'), 'utf8');
const quiet = html.slice(html.indexOf('MINMIN PATCH 2026-07-25: Quiet Luxury accounting workspace'));
const reconcile = html.slice(html.indexOf('function quietReconcileApplied'), html.indexOf('function quietAccountingOtherDesktop'));

test('desktop reconciliation has dedicated Quiet Luxury routing while mobile remains legacy', () => {
  assert.match(quiet, /if\(mobile\)return quietAccountingBase/);
  assert.match(quiet, /if\(view==='reconcile'\)return quietReconcileDesktop\(\)/);
  assert.match(html, /\.mmq-reconcile-page\{background:#FAFAF8\}/);
  assert.match(html, /\.mmq-reconcile-table-card\{[^}]*border:1px solid #ECECEC[^}]*border-radius:16px/);
});

test('reconciliation filters support date range, month, year, unit, status and search', () => {
  for (const key of ['reconcileFrom', 'reconcileTo', 'reconcileMonth', 'reconcileYear', 'reconcileUnit', 'reconcileStatus', 'reconcileSearch']) {
    assert.ok(reconcile.includes(`data-mmq-reconcile-filter="${key}"`), `missing filter ${key}`);
  }
  assert.ok(reconcile.includes('data-mmq-reconcile-apply'));
  assert.ok(reconcile.includes('data-mmq-reconcile-clear'));
  assert.match(html, /if\(from\|\|to\)return[\s\S]*?if\(monthValue\|\|year\)/, 'date range must take priority over month/year');
});

test('reconciliation shows four KPIs, party summary and balanced two-column tables', () => {
  for (const label of ['Tổng hóa đơn', 'Tổng giao dịch', 'Chênh lệch', 'Kết quả đối soát']) {
    assert.ok(reconcile.includes(label), `missing KPI ${label}`);
  }
  for (const label of ['Đơn vị cần đối soát', 'Loại đối tượng', 'Trạng thái đối soát', 'Giao dịch sao kê', 'Hóa đơn nhà cung cấp']) {
    assert.ok(reconcile.includes(label), `missing reconciliation section ${label}`);
  }
  assert.match(html, /\.mmq-reconcile-columns\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
});

test('reconciliation rows expose compact actions and a right-side detail drawer', () => {
  for (const action of ['Mở', 'Đối soát lại', 'Xem chi tiết', 'Sao chép nội dung', 'Mở file nguồn', 'Ghi chú', 'Làm mới dữ liệu']) {
    assert.ok(reconcile.includes(action), `missing reconciliation action ${action}`);
  }
  assert.ok(reconcile.includes('mmq-reconcile-drawer'));
  assert.ok(reconcile.includes('Thông tin đầy đủ'));
  assert.ok(reconcile.includes('Lịch sử đối soát'));
});

test('reconciliation includes clear status and empty states without new persistence logic', () => {
  assert.ok(reconcile.includes('Đã khớp'));
  assert.ok(reconcile.includes('Đang chênh'));
  assert.ok(reconcile.includes('Không có dữ liệu đối soát trong khoảng thời gian này.'));
  assert.doesNotMatch(reconcile, /supabaseRequest\(|create table|alter table/i);
});
