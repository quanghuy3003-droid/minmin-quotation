import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function quoteCustomerReadyForCollapse\(\)[\s\S]*?'client','tel','representative','quoteDate','address','delivery'/,'Customer details must be complete before auto-collapse');
assert.match(source,/function applyQuoteCustomerCollapse\(\)[\s\S]*?state\.info\.client[\s\S]*?data-customer-expand/,'Collapsed customer details must show the customer name and edit action');
assert.match(source,/data-customer-collapse/,'Expanded customer details must offer a collapse action');
assert.match(source,/render=function\(\.\.\.args\)[\s\S]*?applyQuoteCustomerCollapse/,'Customer collapsing must run after quote rendering');

console.log('Quotation customer auto-collapse checks passed.');
