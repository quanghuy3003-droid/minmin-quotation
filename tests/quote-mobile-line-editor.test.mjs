import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(
  source,
  /function quoteMobileLineEditor\(line\)[\s\S]*?1\. Thêm nhanh[\s\S]*?2\. Thông tin cơ bản[\s\S]*?3\. Thông tin bổ sung[\s\S]*?4\. Thuộc tính sản phẩm/,
  'The mobile quotation product editor must use the four requested sections'
);
assert.match(
  source,
  /function quoteMobileLineEditor\(line\)[\s\S]*?data-paste-line-image[\s\S]*?data-line-image[\s\S]*?data-line-paste/,
  'The quick image section must preserve paste, file selection and paste-target hooks'
);
assert.match(
  source,
  /function quoteMobileLineEditor\(line\)[\s\S]*?Tên sản phẩm \*[\s\S]*?Mã hàng \(tự sinh\)[\s\S]*?SL \*[\s\S]*?Đơn giá \(VND\) \*[\s\S]*?ĐVT \*[\s\S]*?Kích thước/,
  'The basic section must expose the compact two-column essential fields'
);
assert.match(
  source,
  /function quoteMobileLineEditor\(line\)[\s\S]*?codeSelect\('Loại đèn'[\s\S]*?codeSelect\('Kiểu hàng'[\s\S]*?leadTimeSelect\(line\)[\s\S]*?Giá NDT[\s\S]*?Cân nặng[\s\S]*?Lợi nhuận/,
  'The supplemental section must preserve the current product and pricing hooks'
);
assert.match(
  source,
  /<details class="minmin-quote-mobile-attributes">[\s\S]*?ATTRIBUTE_FIELDS\.map\(field=>renderAttributeField\(line,field\)\)/,
  'Product attributes must remain complete inside a collapsed native accordion'
);
assert.match(
  source,
  /minmin-quote-mobile-line-footer[\s\S]*?data-quote-mobile-close-editor[\s\S]*?data-quote-mobile-save-line[\s\S]*?Lưu sản phẩm/,
  'The mobile editor must keep cancel and save in a sticky footer'
);
assert.match(
  source,
  /\.minmin-quote-mobile-line-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  'The mobile editor must use the requested two-column grid'
);
assert.match(
  source,
  /\.minmin-quote-mobile-line-section\s*\{[\s\S]*?border:\s*1px solid #ececec[\s\S]*?border-radius:\s*16px[\s\S]*?background:\s*#fff/,
  'The mobile editor sections must use the Minmin card styling'
);
assert.match(
  source,
  /renderLine=function\(line,idx\)[\s\S]*?window\.innerWidth<=640[\s\S]*?quoteMobileLineEditor\(line\)[\s\S]*?renderLineExpandedForCollapse/,
  'Only mobile line editing may use the new renderer while desktop keeps the legacy editor'
);
assert.match(
  source,
  /function cropQuotationImageToSquare\(dataUrl,size=900\)[\s\S]*?Math\.min\(w,h\)[\s\S]*?async function attachImageToLine\(uid,file\)[\s\S]*?cropQuotationImageToSquare\(await readImageFileRaw\(file\)\)[\s\S]*?-900\.jpg[\s\S]*?uploadFileToSupabaseStorage\(optimizedFile,'quotation'/,
  'Quotation images must be squared and resized to 900px before the existing upload call'
);
assert.match(
  source,
  /async function attachImageDataToLine\(uid,dataUrl[\s\S]*?cropQuotationImageToSquare\(dataUrl\)/,
  'Pasted quotation images must use the same square 900px optimization'
);
assert.match(
  source,
  /data-quote-mobile-save-line[\s\S]*?state\.ui\.quoteLineOpen\[id\]=false[\s\S]*?state\.ui\.quoteMobileEditMode=''[\s\S]*?saveDraft\(\)/,
  'Saving the mobile product must keep the existing draft state and return to the quotation'
);

console.log('Minmin mobile quotation product editor checks passed.');
