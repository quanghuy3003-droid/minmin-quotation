import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(
  source,
  /\{\s*value:'DC',\s*name:'Đồ trang trí',\s*label:'Đồ trang trí \(DC\)'\s*\}/,
  'Quotation and inventory product selectors must include one unclassified decor type'
);
assert.match(
  source,
  /function inferProductType\(line\)[\s\S]*?s\.includes\('trang tri'\)\|\|s\.includes\('decor'\)\)return'DC'/,
  'Decor products must be inferred from Vietnamese and English names'
);
assert.match(
  source,
  /function codeSelect\(label,key,line,options\)[\s\S]*?if\(key==='productType'\)label='Loại sản phẩm'/,
  'The shared selector must use a generic product-type label'
);
assert.match(
  source,
  /\[data-line-code-part="productType"\][\s\S]*?select\.value!=='DC'[\s\S]*?line\.attributes=\{\.\.\.ATTRIBUTE_DEFAULTS\}/,
  'Switching a quote line to decor must start with blank editable attributes'
);
const productTypesBlock = source.match(/const PRODUCT_TYPES\s*=\s*\[([\s\S]*?)\];/)?.[1] || '';
assert.equal(
  (productTypesBlock.match(/value:'DC'/g) || []).length,
  1,
  'Decor must remain a single product type without subcategories'
);

console.log('decor product type tests passed');
