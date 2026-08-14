import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('legacy Excel import replaces file-name-only photo metadata with embedded images',()=>{
  assert.match(source,/function isRenderableImageSource\(value\)[\s\S]*?\^data:image/);
  assert.match(source,/function applyExcelPhotoFallback\(line,image\)[\s\S]*?Object\.assign\(line,normalizePhotoRefs\(line\)\)/);
  assert.match(source,/if\(!isRenderableImageSource\(current\)\|\|replaceWithEmbedded\)[\s\S]*?line\.photo=''[\s\S]*?line\.photoDataUrl=''/);
  assert.match(source,/if\(replaceWithEmbedded\)[\s\S]*?line\.photoDataUrl=embeddedImage;[\s\S]*?line\.photo=embeddedImage;/);
});

test('embedded workbook images replace obsolete Supabase URLs but preserve Drive URLs',()=>{
  assert.match(source,/function isLegacySupabaseImageSource\(value\)[\s\S]*?supabase\\\.\(\?:co\|in\)/);
  assert.match(source,/const replaceWithEmbedded=!!embeddedImage&&\(!isRenderableImageSource\(current\)\|\|isLegacySupabaseImageSource\(current\)\)/);
  assert.doesNotMatch(source,/replaceWithEmbedded=.*drive\.google/i);
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
