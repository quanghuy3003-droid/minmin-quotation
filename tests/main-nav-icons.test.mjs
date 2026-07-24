import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

for(const tab of ['quote','stock','accounting','documents','website','tools']){
  assert.match(source,new RegExp(`${tab}:'<svg`),`The ${tab} navigation item must have an icon`);
}
assert.match(source,/minmin-main-nav[\s\S]*?bg-\[#111315\]/,'Main navigation must use the requested dark toolbar');
assert.match(source,/after:bg-mint/,'The active navigation item must have a clear accent indicator');
assert.match(source,/\[&>svg\]:h-full[\s\S]*?\$\{icons\[id\]\}/,'Navigation icons must share a consistent size');
assert.match(source,/class="minmin-nav-logo"[\s\S]*?UI_LOGO_DATA_URL/,'Desktop navigation must contain the real Minmin logo');
assert.match(source,/\.minmin-nav-logo img[\s\S]*?filter:\s*brightness\(0\) invert\(1\)/,'The navigation logo must render white without changing its aspect ratio');
assert.match(source,/@media \(min-width:\s*768px\)[\s\S]*?body \.minmin-topbar \{\s*display:\s*none !important;/,'Desktop must use one unified black brand bar');

console.log('Main navigation icon toolbar checks passed.');
