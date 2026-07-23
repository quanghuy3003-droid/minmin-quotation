import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/--minmin-accent:\s*#239177/,'Shared mobile design tokens must define the Minmin accent');
assert.match(source,/grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/,'The shared mobile and tablet menu must keep six equal tab slots');
assert.match(source,/body:has\(\.minmin-quote-mobile-view\) \.minmin-topbar[\s\S]*display:\s*block !important/,'Quotation mobile must keep the real logo header');
assert.match(source,/\.minmin-quote-mobile-header,[\s\S]*\.minmin-website-mobile-header[\s\S]*display:\s*none !important/,'Legacy duplicate mobile headers must be hidden');

assert.match(source,/const filters=\[\['all','Tất cả'\],\['pendant','Đèn thả'\],\['wall','Đèn tường'\],\['table','Đèn bàn'\]/,'Quotation mobile must provide product type chips');
assert.match(source,/data-quote-mobile-menu[\s\S]*data-quote-mobile-delete/,'Quotation rows must expose compact overflow actions');
assert.match(source,/data-quote-mobile-import[\s\S]*importQuotationExcel/,'Quotation mobile must retain old Excel import');

assert.match(source,/\[\['all','Tất cả',inv\.items\.length\],\['stock','Trong kho',counts\.stock\],\['production','Đang sản xuất',counts\.production\],\['sold','Hết hàng',counts\.sold\]\]/,'Inventory mobile must provide status chips');
assert.match(source,/● Hàng mẫu[\s\S]*✓ \$\{esc\(inventoryOrderCustomerName/,'Inventory cards must distinguish samples and customer orders');
assert.match(source,/data-stock-mobile-quick-quote[\s\S]*addInventoryItemToQuote/,'In-stock cards must support adding directly to a quotation');
assert.match(source,/minmin-stock-mobile-age[\s\S]*duration\.total/,'Inventory cards must show total age');

assert.match(source,/minmin-website-summary-dark[\s\S]*Lỗi đồng bộ/,'Website mobile must use a dark status summary');
assert.match(source,/\.minmin-website-sync-check[\s\S]*#239177/,'Website synchronized markers must use the shared green accent');
assert.match(source,/data-website-mobile-product-menu[\s\S]*Đồng bộ sản phẩm[\s\S]*Đưa vào báo giá[\s\S]*Xóa sản phẩm/,'Website rows must expose real product actions');
assert.match(source,/Tên tiếng Việt \*[\s\S]*Tên tiếng Anh[\s\S]*Giá bán \(VND\) \*/,'Website wizard must keep the requested bilingual base fields');
assert.match(source,/data-website-mobile-recrop[\s\S]*recropWebsiteFeatured/,'Website image step must retain crop editing');
assert.match(source,/minmin-website-secret-field[\s\S]*data-website-mobile-secret/,'WooCommerce credentials must be masked with show and hide controls');
assert.match(source,/@media \(min-width:\s*768px\) and \(max-width:\s*900px\)[\s\S]*repeat\(6/,'Tablet menu must remain on a single row');

console.log('shared mobile design system checks passed');
