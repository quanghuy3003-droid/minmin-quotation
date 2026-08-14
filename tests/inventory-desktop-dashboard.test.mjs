import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('desktop inventory dashboard is rendered from the real inventory state', () => {
  for (const marker of [
    'function mmDesktopInventoryStats()',
    'function mmStockExactDashboard(stats)',
    'function mmStockProductCard(item)',
    'function mmDesktopStockAside(stats)',
    'normalizeInventoryItem',
    'isInventoryDeleted',
    'inventoryStage(item)',
  ]) assert.ok(html.includes(marker), `missing ${marker}`);
});

test('desktop inventory keeps every requested workflow connected', () => {
  for (const marker of [
    'data-mm-stock-entry',
    'data-mm-stock-top-out',
    'data-mm-stock-audit',
    'data-mm-stock-more',
    'data-mm-stock-exact-search',
    'data-mm-stock-exact-filter',
    'data-mm-stock-exact-sort',
    'data-mm-stock-view',
    'data-mm-stock-page',
    'data-mm-stock-edit-field',
    'data-mm-stock-file',
    'data-mm-stock-upload',
    'data-mm-stock-adjust',
    'data-mm-stock-audit-save',
    'upsertInventoryItem',
    'adjustInventory',
    'saveInventoryItemRemote',
  ]) assert.ok(html.includes(marker), `missing ${marker}`);
});

test('desktop-only inventory redesign does not replace the mobile layout', () => {
  assert.ok(html.includes("if(window.matchMedia?.('(max-width: 767px)').matches)return;"));
  assert.match(html, /@media\s*\(min-width:\s*768px\)[\s\S]*?\.mm-stock-toolbar-exact/);
  assert.ok(html.includes('.minmin-stock-desktop-view .mm-stock-legacy-root { display: none !important; }'));
});

test('inventory dashboard has exact toolbar, grid/list cards, sidebar and modal styles', () => {
  for (const marker of [
    '.mm-stock-toolbar-exact',
    '.mm-stock-card-grid',
    '.mm-stock-card-grid.is-list',
    '.mm-stock-product-card',
    '.mm-stock-dashboard-side',
    '.mm-stock-pagination',
    '.mm-stock-modal-overlay',
  ]) assert.ok(html.includes(marker), `missing ${marker}`);
});

test('desktop product dots use the same inventory classification as mobile', () => {
  for (const marker of [
    'function mmStockKindPresentation(itemOrKind)',
    'function mmStockKindSignal(item)',
    'function mmStockKindLegend()',
    'data-mm-stock-kind',
    'Hàng dự trữ (VAT)',
    'Hàng mẫu (NON)',
    'Hàng order (VAT)',
    '.mm-stock-card-signal.is-kind-reserve',
    '.mm-stock-card-signal.is-kind-sample',
    '.mm-stock-card-signal.is-kind-order',
  ]) assert.ok(html.includes(marker), `missing ${marker}`);
  assert.match(html, /const kind=inventoryKindMeta\(value\)/);
  assert.doesNotMatch(html, /mmStockProductCard\(item\)[\s\S]*?mm-stock-card-signal is-\$\{esc\(stage\.key\)\}/);
});

test('desktop classification legend filters products and can be toggled off', () => {
  assert.match(html, /function mmStockKindLegend\(\)[\s\S]*?data-mm-stock-kind-filter/);
  assert.match(html, /aria-pressed="\$\{selected\}"/);
  assert.match(html, /if\(ui\.kind!=='all'\)items=items\.filter\(item=>mmStockKindPresentation\(item\)\.value===ui\.kind\)/);
  assert.match(html, /const stockKind=event\.target\.closest\?\.\('\[data-mm-stock-kind-filter\]'\)[\s\S]*?ui\.kind=ui\.kind===kind\?'all':kind;[\s\S]*?ui\.page=1/);
});

test('product detail can choose, replace and clear XML or PDF invoices', () => {
  assert.ok(html.includes('＋ Chọn XML/PDF'));
  assert.ok(html.includes('accept=".xml,.pdf,application/pdf,text/xml,application/xml"'));
  assert.ok(html.includes('data-mm-stock-file-remove'));
  assert.ok(html.includes('function clearInventoryItemInvoice'));
  assert.ok(html.includes('_ignoreLinkedInboundInvoice'));
});
