import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/@media \(max-width: 1023px\)[\s\S]*?main > section\.mx-auto\.grid\.max-w-7xl > aside[\s\S]*?order: -1/,'Quotation summary must appear before the form on phones and tablets');
assert.match(source,/@media \(min-width: 768px\)[\s\S]*?position: sticky !important[\s\S]*?top: 1rem !important/,'Quotation summary must follow scrolling on iPad and desktop');
assert.match(source,/max-height: calc\(100dvh - 2rem\)[\s\S]*?overflow-y: auto/,'Sticky summary must remain usable on shorter screens');

console.log('Quotation summary responsive position checks passed.');
