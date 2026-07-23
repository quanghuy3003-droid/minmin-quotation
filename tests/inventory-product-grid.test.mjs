import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/@media \(max-width: 640px\)[\s\S]*?\.minmin-stock-group-body\s*\{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,'Mobile inventory groups must show four products in a compact two-by-two grid');
assert.match(source,/\.minmin-stock-group-head\s*\{[\s\S]*?flex-direction: row !important[\s\S]*?justify-content: space-between !important/,'Mobile inventory group headings must use a compact horizontal row');
assert.match(source,/@media \(min-width: 1024px\)[\s\S]*?\.minmin-stock-group-body\s*\{[\s\S]*?grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/,'Desktop inventory groups must show four products per row');
assert.match(source,/\.minmin-stock-info > div:nth-child\(2\)\s*\{[\s\S]*?overflow-wrap: anywhere[\s\S]*?font-size: 0\.67rem !important/,'Compact mobile product codes must wrap safely inside narrow cards');
assert.match(source,/\.minmin-stock-card \.minmin-stock-info > div:first-child[\s\S]*?display: none !important/,'Compact product cards must hide the product name and classification');
assert.match(source,/\.minmin-stock-card \.stock-chip-row > :nth-child\(n \+ 4\)[\s\S]*?display: none !important/,'Compact product cards must keep total days visible while hiding status and invoice chips');
assert.match(source,/\.minmin-stock-card:has\(\.minmin-stock-detail\)\s*\{[\s\S]*?grid-column: 1 \/ -1/,'An expanded product must use the full row');
assert.match(source,/\.minmin-stock-card \[data-stock-toggle\]::after[\s\S]*?content: "⌄"/,'Compact cards need a small detail control');

console.log('Inventory compact four-product grid checks passed.');
