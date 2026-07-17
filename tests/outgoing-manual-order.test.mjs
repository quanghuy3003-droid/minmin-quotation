import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const between=(start,end)=>{
  const from=html.indexOf(start), to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing ${start}`);
  assert.notEqual(to,-1,`Missing ${end}`);
  return html.slice(from,to);
};

assert.match(html,/const OUTGOING_MANAGED_MARKER='\[TAO_TU_QUET_XML_V3\]'/);
assert.match(html,/outgoingInvoices:\(outgoing\|\|\[\]\)\.map\(normalizeOutgoingInvoice\)\.filter\(isManagedOutgoingInvoice\)/,'Remote legacy orders must not return to the app');
assert.match(html,/state\.accounting\.outgoingInvoices=\(state\.accounting\.outgoingInvoices\|\|\[\]\)\.filter\(isManagedOutgoingInvoice\)/,'Local legacy orders must not be uploaded again');
assert.match(html,/saveOutgoingInvoiceRemote\(inv\)\{ if\(!isManagedOutgoingInvoice\(inv\)\)return;/,'Only XML-created orders may be saved remotely');

const scanSource=between('async function outGScanXml','function outGSaveLines');
assert.match(scanSource,/parseVietnamInvoiceXml\(xml/,'The XML must be parsed before creating an order');
assert.match(scanSource,/File XML không có dữ liệu hóa đơn hợp lệ/,'Invalid XML must be rejected');
assert.match(scanSource,/const inv=outgoingEmpty\(/,'A valid XML must create the order');
assert.match(scanSource,/outgoingInvoices\.unshift\(inv\)/,'The XML workflow must append the parsed order');
assert.ok(scanSource.indexOf('File XML không có dữ liệu hóa đơn hợp lệ')<scanSource.indexOf('const inv=outgoingEmpty('),'Validation must happen before order creation');

assert.match(html,/Quét XML &amp; tạo đơn hàng|Quét XML & tạo đơn hàng/,'The primary action must explain that scanning creates the order');
assert.match(html,/data-outg-scan-xml/,'The XML picker must be opened by an explicit button');
assert.match(html,/querySelector\('\[data-outg-scan-xml\]'\)\?\.addEventListener\('click',\(\)=>document\.getElementById\('outgXmlScanner'\)\?\.click\(\)\)/,'The scan button must directly open the XML file input');
assert.doesNotMatch(html,/data-outg-new-order/,'There must be no separate empty-order creation action');
assert.doesNotMatch(html,/function outGCreateOrder/,'Empty orders must not be created');

console.log('XML-first outgoing-order creation checks passed.');
