import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(source, /function mmStockKindButton\(item\)[\s\S]*?mm-stock-kind-button is-kind-\$\{esc\(kind\.value\)\}/, 'Each card must expose its inventory kind as a colored button');
assert.match(source, /kind\.value==='order'[\s\S]*?inventoryOrderCustomerName\(item\)[\s\S]*?mm-stock-order-customer/, 'Order inventory cards must keep the customer name visible');
assert.match(source, /data-mm-stock-card-step="\$\{esc\(key\)\}"[\s\S]*?data-mm-stock-card-add="\$\{esc\(key\)\}"/, 'Cards must provide compact quantity and add-stock controls');
assert.match(source, /data-mm-stock-card-add[\s\S]*?adjustInventory\(key,'Nhập kho',qty\)/, 'Card add-stock action must reuse the existing inventory movement logic');
assert.match(source, /\.mm-stock-kind-button\.is-kind-reserve[\s\S]*?\.mm-stock-kind-button\.is-kind-sample[\s\S]*?\.mm-stock-kind-button\.is-kind-order/, 'Reserve, sample, and order must have distinct quiet color treatments');
assert.match(source, /\.minmin-stock-desktop-view \.mm-stock-exact-main \{ grid-column: 1 \/ -1; \}/, 'Desktop product cards should use the available inventory workspace width');
assert.match(source, /\.minmin-stock-desktop-view \.mm-stock-dashboard-side \{ display: none !important; \}/, 'The obsolete stock sidebar must not squeeze the redesigned product cards');

console.log('Inventory quiet-luxury card layout checks passed.');
