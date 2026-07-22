import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function quoteLineReadyForCollapse\(line\)[\s\S]*?Number\(line\?\.quantity\)>0[\s\S]*?previewImage\(line\)/,'A quote line must validate its essential fields before collapsing');
assert.match(source,/function quoteLineCollapsedSummary\(line,idx\)[\s\S]*?Thành tiền[\s\S]*?data-line-expand/,'Collapsed quote lines must show a compact summary and edit action');
assert.match(source,/if\(quoteLineReadyForCollapse\(line\)&&state\.ui\.quoteLineOpen\[line\.uid\]!==true\)return quoteLineCollapsedSummary/,'Completed quote lines must collapse automatically');
assert.match(source,/\[data-line-collapse\]/,'Expanded quote lines must offer a manual collapse action');
assert.match(source,/SL \$\{Number\(line\.quantity\|\|0\)\}[\s\S]*?Đơn giá/,'Collapsed summaries must show quantity and unit price');
assert.match(source,/grid-cols-\[64px_minmax\(0,1fr\)_62px\][\s\S]*?data-line-expand[\s\S]*?>Sửa<[\s\S]*?data-remove-line[\s\S]*?>Xóa</,'Mobile summaries must keep compact edit and delete actions on the right');

console.log('Quotation line auto-collapse checks passed.');
