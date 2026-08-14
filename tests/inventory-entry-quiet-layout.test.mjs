import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = source.indexOf('function mmPrepareStockEntryEditor');
const end = source.indexOf('function mmMountStockDesktopModal', start);
assert.ok(start > 0 && end > start, 'Desktop stock entry preparation must exist');
const prepare = source.slice(start, end);

for (const [title, key] of [
  ['Thông tin chính', 'main'],
  ['Giá và thời gian', 'time'],
  ['Ảnh và hóa đơn', 'media'],
  ['Thuộc tính đèn', 'attributes']
]) {
  assert.ok(prepare.includes(`['${title}','${key}'`), `Missing ${title} section`);
}

assert.match(source, /\.mm-stock-entry-editor \.mm-stock-entry-grid \{[\s\S]*?grid-template-columns: repeat\(3,minmax\(0,1fr\)\) !important;/, 'Desktop entry fields must use a three-column grid');
assert.match(source, /\.mm-stock-modal\.is-stock-entry-modal \{[\s\S]*?width: min\(1360px,calc\(100vw - 48px\)\);/, 'The entry modal must use the Quiet Luxury wide workspace');
assert.match(source, /\.mm-stock-entry-editor \.mm-stock-upload-card input\[type="file"\] \{ display: none !important; \}/, 'Native file controls must be replaced by compact upload cards');
assert.match(prepare, /\['stockPhoto','Chọn ảnh'\][\s\S]*?\['stockSaleInvoice','Chọn file PDF'\][\s\S]*?\['stockInvoice','Chọn file PDF'\]/, 'Image and both invoice upload flows must be retained');
assert.match(prepare, /data-mm-stock-entry-section[\s\S]*?Tự tạo theo mã hàng/, 'QR action must remain in the redesigned form');
assert.match(source, /if\(movedTarget\)\{[\s\S]*?mmPrepareStockEntryEditor\(movedTarget,overlay\.querySelector\('\.mm-stock-modal'\)\);/, 'Only the existing desktop entry form should be decorated inside its modal');

for (const hook of ['id="stockImportQuotation"', 'id="stockAdd"', 'data-inventory-draft=', 'data-inventory-attr=']) {
  assert.ok(source.includes(hook), `Existing stock logic hook must remain: ${hook}`);
}
assert.doesNotMatch(prepare, /supabase|fetch\(|saveInventory|storeInventoryFile/, 'UI preparation must not replace persistence or upload logic');
assert.ok(source.includes('function renderInventoryMobileEntry()'), 'Existing mobile stock entry UI must remain available');

console.log('Inventory entry Quiet Luxury layout checks passed.');
