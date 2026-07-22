import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/section\.classList\.add\('minmin-accounting-section'\)/,'Accounting output must have a responsive scope class');
assert.match(source,/@media \(max-width: 1024px\)[\s\S]*?\.minmin-accounting-section \{[\s\S]*?max-width: 100vw !important/,'Accounting must adapt to iPad widths');
assert.match(source,/@media \(max-width: 640px\)[\s\S]*?\.minmin-accounting-section \[data-accounting-view\][\s\S]*?flex-basis: calc\(50% - 0\.25rem\)/,'Accounting navigation must form a two-column phone layout');
assert.match(source,/\.minmin-accounting-section \.overflow-x-auto \{[\s\S]*?-webkit-overflow-scrolling: touch/,'Wide accounting tables must scroll inside their own mobile container');

console.log('Accounting phone and iPad responsive checks passed.');
