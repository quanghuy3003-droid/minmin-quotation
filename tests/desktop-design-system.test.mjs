import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('desktop workspace uses the shared Minmin design system', () => {
  for (const marker of [
    'MINMIN desktop design system',
    '--mm-green:',
    '.mm-desktop-hero',
    '.mm-stat-strip',
    '.mm-desktop-side',
  ]) assert.ok(html.includes(marker), `missing ${marker}`);
});

test('all four desktop modules are covered without replacing business logic', () => {
  for (const marker of [
    '.minmin-quote-desktop-view',
    '.minmin-stock-desktop-view',
    '.mm-accounting-desktop-redesign',
    '.minmin-website-desktop-view',
    'mountMinminDesktopUi',
  ]) assert.ok(html.includes(marker), `missing ${marker}`);
  assert.match(html, /grid-template-columns:\s*minmax\(0,\s*72fr\)\s+minmax\(286px,\s*28fr\)/);
});

test('desktop enhancement delegates actions to existing controls', () => {
  assert.ok(html.includes("document.querySelector('[data-add-line],#addProduct,#addLine')?.click()"));
  assert.ok(html.includes("document.querySelector('[data-website-sync-all],#syncWebsiteProducts')?.click()"));
  assert.ok(html.includes("document.querySelector('[data-sync-inventory],#syncInventory')"));
});

test('quotation editors stay isolated from the legacy layout and duplicate summary', () => {
  assert.ok(html.includes('function mmMountQuoteEditor(quote)'));
  assert.ok(html.includes("state.ui.desktopQuoteEditor='customer'"));
  assert.ok(html.includes('state.ui.quoteLineOpen[id]=true'));
  assert.match(html, /\.minmin-quote-desktop-view\s*>\s*\.mm-quote-legacy-aside\s*\{\s*display:\s*none\s*!important;/);
  assert.doesNotMatch(
    html,
    /data-mm-quote-customer[\s\S]{0,500}classList\.remove\('mm-quote-exact-active'\)/,
  );
});
