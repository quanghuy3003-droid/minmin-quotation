import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(source, /\.mm-stock-product-card\s*\{[\s\S]*?overflow:\s*hidden;/, 'Inventory cards must clip accidental horizontal overflow');
assert.match(source, /\.mm-stock-card-footer\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,1fr\) auto;/, 'Card footer must reserve bounded columns for status and actions');
assert.match(source, /\.mm-stock-accessory-add\s*\{[\s\S]*?grid-column:\s*1 \/ -1;[\s\S]*?grid-template-columns:\s*64px minmax\(0,1fr\);/, 'Accessory quantity controls must use their own full-width row');
assert.match(source, /const quickAction=isAccessory\?'':/, 'Accessory cards must not render the duplicate generic quick-add button');

console.log('inventory card overflow tests passed');
