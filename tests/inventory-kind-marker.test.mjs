import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function inventoryOrderCustomerName\(item\)[\s\S]*?_quotationCustomerName/,'Order customer names must prefer stored quotation data');
assert.match(source,/file\.match\(\/Quotation\\s\*-\\s\*\(\.\+\)\$\/i\)/,'Order customer names must fall back to the quotation file name');
assert.match(source,/item\?\.itemKind==='sample'[\s\S]*?data-stock-kind-marker="sample"[\s\S]*?bg-coral/,'Sample products need a red dot marker');
assert.match(source,/item\?\.itemKind!=='order'[\s\S]*?data-stock-kind-marker="order"[\s\S]*?>✓<\/span>[\s\S]*?\$\{esc\(customer\)\}/,'Order products need a green check and customer name');
assert.match(source,/\$\{inventoryKindMarker\(item\)\}/,'The kind marker must render on each compact inventory card');
assert.match(source,/attrs\._quotationCustomerName=String\(appData\.info\?\.client\|\|appData\.export\?\.client\|\|''\)\.trim\(\)/,'Quotation imports must retain the customer name on inventory items');

console.log('Inventory sample and order marker checks passed.');
