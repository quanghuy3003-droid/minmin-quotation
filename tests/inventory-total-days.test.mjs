import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function inventoryTotalDays\(item\)[\s\S]*?daysBetweenDates\(item\?\.orderDate,item\?\.importDate\|\|item\?\.exportDate\|\|todayIso\(\)\)[\s\S]*?daysBetweenDates\(item\.importDate,item\.exportDate\|\|todayIso\(\)\)/,'Total inventory days must use both ordering and in-stock periods');
assert.match(source,/available\.reduce\(\(sum,days\)=>sum\+days,0\)/,'Available ordering and in-stock days must be added together');
assert.match(source,/data-stock-total-days[\s\S]*?Tổng \$\{duration\.total\} ngày/,'Each calculable inventory item needs a visible total-days badge');
assert.match(source,/html\.replace\(quantityChip,`\$\{quantityChip\}\$\{inventoryTotalDaysBadge\(item\)\}`\)/,'The total-days badge must render beside price and stock quantity');

console.log('Inventory total-days checks passed.');
