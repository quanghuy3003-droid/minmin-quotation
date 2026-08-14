import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('legacy Excel import replaces file-name-only photo metadata with embedded images',()=>{
  assert.match(source,/function isRenderableImageSource\(value\)[\s\S]*?\^data:image/);
  assert.match(source,/function applyExcelPhotoFallback\(line,image\)[\s\S]*?Object\.assign\(line,normalizePhotoRefs\(line\)\)/);
  assert.match(source,/if\(!isRenderableImageSource\(current\)\)[\s\S]*?line\.photo=''[\s\S]*?line\.photoDataUrl=''/);
  assert.match(source,/if\(!isRenderableImageSource\(photoSourceValue\(line\)\)&&isRenderableImageSource\(image\)\)[\s\S]*?line\.photoDataUrl=image;[\s\S]*?line\.photo=image;/);
});

test('ExcelJS public image API is preferred when decoding workbook media',()=>{
  assert.match(source,/function excelImageDataUrl\(wb,imageId\)[\s\S]*?wb\?\.getImage==='function'\?wb\.getImage\(imageId\)/);
  assert.match(source,/function worksheetProductImages\(wb,sheet,firstRow=11\)[\s\S]*?excelImageDataUrl\(wb,img\.imageId\)/);
});

test('quotation and inventory imports share the repaired embedded-image fallback',()=>{
  const quotation=source.slice(source.indexOf('async function importQuotationExcel'),source.indexOf('async function importQuotationToInventory'));
  const inventory=source.slice(source.indexOf('async function importQuotationToInventory'),source.indexOf('async function exportQuotation'));
  assert.match(quotation,/worksheetProductImages[\s\S]*?applyExcelPhotoFallback/);
  assert.match(inventory,/worksheetProductImages[\s\S]*?applyExcelPhotoFallback/);
});
