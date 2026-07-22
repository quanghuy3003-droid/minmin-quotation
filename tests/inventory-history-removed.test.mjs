import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/const withoutHistory = markup => \{[\s\S]*?markup\.indexOf\('<div class="minmin-stock-history'/,'Inventory rendering must remove the history section from its markup');
assert.match(source,/if\(entryStart < 0 \|\| listStart < 0\)return withoutHistory\(html\)/,'History removal must also apply when compact layout markers are unavailable');
assert.match(source,/if\(state\.ui\.stockInputCollapsed\)\{[\s\S]*?return withoutHistory\(html\.slice\(0,entryStart\)\+html\.slice\(listStart\)\)/,'Collapsed inventory rendering must not restore the history section');
assert.match(source,/return withoutHistory\(`\$\{html\.slice\(0,entryStart\)\}/,'Expanded inventory rendering must not restore the history section');

console.log('Inventory history removal checks passed.');
