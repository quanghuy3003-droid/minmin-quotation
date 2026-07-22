import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/stockInputCollapsed:false/,'Inventory input needs an explicit expanded default state');
assert.match(source,/data-toggle="stockInputCollapsed"/,'Inventory input needs a collapse control');
assert.match(source,/state\.ui\.stockInputCollapsed\?'▾ Mở rộng':'▴ Thu gọn'/,'The collapse control must clearly show both states');
assert.match(source,/data-stock-entry-fields/,'Expanded inventory fields need a dedicated layout wrapper');
assert.match(source,/\.minmin-stock-three-columns[\s\S]*?repeat\(3, minmax\(0, 1fr\)\)/,'Desktop inventory fields must use three aligned columns');
assert.match(source,/if\(state\.ui\.stockInputCollapsed\)[\s\S]*?html\.slice\(0,entryStart\)\+html\.slice\(listStart\)/,'Collapsing must remove only the inventory form body');

console.log('Inventory input three-column and collapse checks passed.');
