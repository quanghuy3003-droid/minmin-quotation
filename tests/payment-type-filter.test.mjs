import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const start=html.indexOf('function paymentTable()');
const end=html.indexOf('function renderPayments()',start);
assert.notEqual(start,-1);
assert.notEqual(end,-1);
const source=html.slice(start,end);

assert.match(source,/acc\.filters\?\.paymentType\|\|'all'/,'Payment filter must persist inside accounting filters');
assert.match(source,/paymentTypeFilter==='all'\?allRows:allRows\.filter/,'All/Thu/Chi must filter visible rows');
assert.match(source,/data-payment-type-filter/,'The payment table needs visible filter controls');
assert.match(source,/\['all','T[^']*'\],\['Thu','Thu'\],\['Chi','Chi'\]/,'The filter must expose All, Thu, and Chi');
assert.match(html,/filters\.paymentType=button\.dataset\.paymentTypeFilter\|\|'all'/,'Clicking a payment filter must save the selected type');
assert.match(source,/const totalThu=allRows\.filter/,'Summary totals must remain based on all transactions');

console.log('Payment Thu/Chi filter checks passed.');
