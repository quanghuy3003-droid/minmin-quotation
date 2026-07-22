import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/@media \(min-width: 1024px\)[\s\S]*?\.minmin-main-nav \{[\s\S]*?padding-left: max\(2rem, calc\(\(100% - 80rem\) \/ 2 \+ 2rem\)\)/,'Desktop tabs must share the main content left edge');
assert.match(source,/padding-right: max\(18\.625rem, calc\(\(100% - 80rem\) \/ 2 \+ 18\.625rem\)\)/,'Desktop tabs must stop before the quotation summary column');

console.log('Main navigation content-column alignment checks passed.');
