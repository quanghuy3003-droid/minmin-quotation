import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/\.minmin-stock-group-body\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/,'Desktop inventory groups must show three products per row');
assert.match(source,/\.minmin-stock-card \.minmin-stock-info > div:first-child[\s\S]*?display: none !important/,'Compact product cards must hide the product name and classification');
assert.match(source,/\.minmin-stock-card \.stock-chip-row > :nth-child\(n \+ 3\)[\s\S]*?display: none !important/,'Compact product cards must hide status and invoice chips');
assert.match(source,/\.minmin-stock-card:has\(\.minmin-stock-detail\)\s*\{[\s\S]*?grid-column: 1 \/ -1/,'An expanded product must use the full row');
assert.match(source,/\.minmin-stock-card \[data-stock-toggle\]::after[\s\S]*?content: "⌄"/,'Compact cards need a small detail control');

console.log('Inventory compact three-product grid checks passed.');
