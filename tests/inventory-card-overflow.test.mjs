import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(source, /\.mm-stock-product-card\s*\{[\s\S]*?overflow:\s*hidden;/, 'Inventory cards must clip accidental horizontal overflow');
assert.match(source, /\.mm-stock-card-controls\s*\{[\s\S]*?grid-template-columns:\s*106px minmax\(0,1fr\) 36px;/, 'Card controls must reserve bounded columns for quantity, add-stock and overflow actions');
assert.match(source, /\.mm-stock-card-stepper\s*\{[\s\S]*?grid-template-columns:\s*32px minmax\(32px,1fr\) 32px;/, 'Quantity stepper must remain bounded inside narrow cards');
assert.match(source, /data-mm-stock-card-qty="\$\{esc\(key\)\}"\$\{accessoryQtyAttr\}[\s\S]*?data-mm-stock-card-add="\$\{esc\(key\)\}"\$\{accessoryAddAttr\}/, 'Accessories and ordinary products must share one compact add-stock control without duplication');

console.log('inventory card overflow tests passed');
