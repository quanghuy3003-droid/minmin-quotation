import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');
const cardStart=source.indexOf('function inventoryItemCard(item)');
const cardEnd=source.indexOf('function renderInventoryLookup',cardStart);
const cardSource=source.slice(cardStart,cardEnd);

assert.ok(cardStart>0&&cardEnd>cardStart,'Inventory card renderer must be present');
assert.match(source,/function inventoryCompactDates\(item\)[\s\S]*?'orderDate'[\s\S]*?'importDate'[\s\S]*?'exportDate'/,'Three inventory dates must share one compact vertical panel');
assert.match(source,/function inventoryCompactSpecs\(item\)[\s\S]*?\['Kích thước'[\s\S]*?\['ĐVT'[\s\S]*?ATTRIBUTE_FIELDS\.map/,'Dimensions, unit, and lighting attributes must share one product-information panel');
assert.doesNotMatch(cardSource,/inventoryCheckNote\('Tình trạng'/,'Expanded cards must not repeat the stock-status check');
assert.doesNotMatch(cardSource,/inventoryEditableMoney|inventoryDetailCell\('Lợi nhuận'|inventoryInvoiceControl|data-stock-quote/,'Crossed-out finance and footer controls must be removed from expanded cards');
assert.match(cardSource,/inventoryCompactDates\(item\)\}\$\{inventoryCompactSpecs\(item\)/,'Expanded cards must render only the two consolidated detail panels after invoice checks');
assert.match(source,/\.minmin-stock-card:has\(\.minmin-stock-detail\) \.minmin-stock-actions \{[\s\S]*?display: flex !important[\s\S]*?gap: 0\.4rem !important/,'Expanded inventory actions must use a compact flex layout');
assert.match(source,/\.minmin-stock-card:has\(\.minmin-stock-detail\) \.stock-chip-row > :nth-child\(3\)[\s\S]*?display: none !important/,'Expanded cards must hide the redundant stage chip');

console.log('Inventory condensed detail checks passed.');
