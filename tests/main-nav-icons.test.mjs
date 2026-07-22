import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

for(const tab of ['quote','stock','accounting','documents','website','tools']){
  assert.match(source,new RegExp(`${tab}:'<svg`),`The ${tab} navigation item must have an icon`);
}
assert.match(source,/minmin-main-nav[\s\S]*?bg-\[#111315\]/,'Main navigation must use the requested dark toolbar');
assert.match(source,/after:bg-mint/,'The active navigation item must have a clear accent indicator');
assert.match(source,/\[&>svg\]:h-full[\s\S]*?\$\{icons\[id\]\}/,'Navigation icons must share a consistent size');

console.log('Main navigation icon toolbar checks passed.');
