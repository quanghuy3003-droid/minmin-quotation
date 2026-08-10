import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(source, /\{\s*value:'AC',\s*name:'Phụ kiện',\s*label:'Phụ kiện \(AC\)'\s*\}/, 'Inventory must include the accessory product type');
assert.match(source, /item\.productType==='AC'[\s\S]*?data-mm-stock-accessory-qty[\s\S]*?data-mm-stock-accessory-add/, 'Accessory cards must provide a direct quantity input and add-stock action');
assert.match(source, /data-mm-stock-accessory-add[\s\S]*?adjustInventory\(key,'Nhập kho',qty\)/, 'Direct accessory action must increase inventory through the standard movement flow');

console.log('inventory accessory category tests passed');
