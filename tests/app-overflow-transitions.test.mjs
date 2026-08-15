import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/@keyframes minmin-ui-fade-in[\s\S]*?@keyframes minmin-ui-fade-out/,'The shared design system must define both enter and exit motion');
assert.match(source,/prefers-reduced-motion:\s*no-preference/,'Motion must respect the user reduced-motion preference');
assert.match(source,/\.minmin-overflow-popover\.is-closing[\s\S]*?minmin-ui-fade-out/,'Overflow menus need a visible fade-out state');

const closeStart=source.indexOf('let minminOverflowCloseTimer=0');
const closeEnd=source.indexOf('function websiteMobileIcon',closeStart);
assert.notEqual(closeStart,-1,'Missing shared mobile overflow closer');
assert.notEqual(closeEnd,-1,'Missing end of shared mobile overflow closer');
const closeSource=source.slice(closeStart,closeEnd);

for(const key of ['quoteMobileMenuId','quoteMobileActionsOpen','stockMobileMenuId','websiteMobileProductMenuId','accountingMobileMenuId']){
  assert.match(closeSource,new RegExp(key),`Blank-space dismissal must close ${key}`);
}
assert.match(closeSource,/interactive=target\.closest[\s\S]*?if\(insideMenu\|\|menuToggle\|\|interactive\)return/,'Interactive controls and menu contents must remain clickable');
assert.match(closeSource,/classList\.add\('is-closing'\)[\s\S]*?setTimeout/,'Blank-space dismissal must animate before removing a menu');

console.log('Shared overflow dismissal and transition checks passed.');
