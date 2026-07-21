import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const html=readFileSync(join(process.cwd(),'index.html'),'utf8');

assert.match(html,/window\.__MINMIN_AUTO_LINK_STATEMENT__\?\.\(p\)/,'Imported statement rows must attempt confident auto-linking');
assert.match(html,/data-payment-auto-link/,'The payment table needs a manual auto-link action for existing statement rows');
assert.match(html,/trùng tên công ty/,'Suggestions must explain company-name matches');
assert.match(html,/best\.score<65/,'Low-confidence candidates must not be linked automatically');
assert.match(html,/best\.score-second\.score<20/,'Ambiguous candidates must remain unlinked');
assert.match(html,/★ Gợi ý/,'The best invoice suggestion must be visibly promoted');

console.log('Bank statement invoice auto-link checks passed.');
