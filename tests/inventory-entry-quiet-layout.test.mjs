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
assert.match(source, /\.mm-stock-modal\.is-stock-entry-modal \{[\s\S]*?width: min\(1310px,calc\(100vw - 96px\)\);/, 'The entry modal must match the supplied desktop width');
assert.match(source, /\.mm-stock-entry-editor \.mm-stock-entry-media-grid \{[\s\S]*?grid-template-columns: repeat\(4,minmax\(0,1fr\)\) !important;/, 'Image and invoice uploads must keep the four-column mockup layout');
assert.match(source, /\.mm-stock-entry-editor \.mm-stock-entry-grid select \{[\s\S]*?height: 42px !important;/, 'Desktop stock fields must match the compact mockup height');
assert.match(source, /\.mm-stock-entry-editor \.mm-stock-upload-card input\[type="file"\] \{ display: none !important; \}/, 'Native file controls must be replaced by compact upload cards');
assert.match(prepare, /\['stockPhoto','Chọn ảnh'\][\s\S]*?\['stockSaleInvoice','Chọn file PDF'\][\s\S]*?\['stockInvoice','Chọn file PDF'\]/, 'Image and both invoice upload flows must be retained');
assert.match(prepare, /data-mm-stock-entry-section[\s\S]*?Tự tạo theo mã hàng/, 'QR action must remain in the redesigned form');
assert.match(prepare, /if\(!dropzone\.querySelector\('img'\)\)[\s\S]*?Kéo thả ảnh vào đây/, 'The empty image preview must become a compact dropzone');
assert.match(prepare, /photoInput\.dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/, 'Dropzone uploads must delegate to the existing stockPhoto handler');
assert.match(prepare, /if\(!dropzone\.querySelector\('img'\)\)/, 'An existing product image must be preserved instead of being replaced by the placeholder');
assert.match(source, /if\(movedTarget\)\{[\s\S]*?mmPrepareStockEntryEditor\(movedTarget,overlay\.querySelector\('\.mm-stock-modal'\)\);/, 'Only the existing desktop entry form should be decorated inside its modal');

for (const hook of ['id="stockImportQuotation"', 'id="stockAdd"', 'data-inventory-draft=', 'data-inventory-attr=']) {
  assert.ok(source.includes(hook), `Existing stock logic hook must remain: ${hook}`);
}
for (const label of ['Mã hàng', 'Tên sản phẩm', 'Phân loại', 'Số lượng', 'Giá mua vào', 'Giá bán ra', 'Loại đèn', 'ĐVT', 'Kích thước', 'Ngày đặt hàng', 'Ngày nhập hàng', 'Ngày xuất hàng', 'Ảnh sản phẩm', 'Hóa đơn đầu ra PDF', 'Hóa đơn mua vào PDF', 'Vật liệu chao đèn', 'Vật liệu thân đèn', 'Nhiệt độ màu', 'Màu sắc', 'Nguồn sáng']) {
  assert.ok(source.includes(label), `The original field must remain visible: ${label}`);
}
assert.match(source, /d\.photoDataUrl\?`<img src="\$\{esc\(driveAssetUrl\(d\.photoDataUrl\)\)\}" class="h-full w-full object-contain"/, 'An existing inventory image must remain visible without cropping');
assert.doesNotMatch(prepare, /\.value\s*=|dataInventoryDraft\s*=|state\.inventory\.draft\s*=/, 'Presentation preparation must not rewrite the existing field data');
assert.doesNotMatch(prepare, /supabase|fetch\(|saveInventory|storeInventoryFile/, 'UI preparation must not replace persistence or upload logic');
assert.ok(source.includes('function renderInventoryMobileEntry()'), 'Existing mobile stock entry UI must remain available');

console.log('Inventory entry Quiet Luxury layout checks passed.');
