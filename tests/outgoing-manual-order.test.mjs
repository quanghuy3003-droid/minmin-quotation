import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const between=(start,end)=>{
  const from=html.indexOf(start), to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing ${start}`);
  assert.notEqual(to,-1,`Missing ${end}`);
  return html.slice(from,to);
};

assert.match(html,/const OUTGOING_MANAGED_MARKER='\[TAO_TU_NUT_DON_HANG_V2\]'/);
assert.match(html,/outgoingInvoices:\(outgoing\|\|\[\]\)\.map\(normalizeOutgoingInvoice\)\.filter\(isManagedOutgoingInvoice\)/,'Remote legacy orders must not return to the app');
assert.match(html,/state\.accounting\.outgoingInvoices=\(state\.accounting\.outgoingInvoices\|\|\[\]\)\.filter\(isManagedOutgoingInvoice\)/,'Local legacy orders must not be uploaded again');
assert.match(html,/saveOutgoingInvoiceRemote\(inv\)\{ if\(!isManagedOutgoingInvoice\(inv\)\)return;/,'Only button-created orders may be saved remotely');

const scanSource=between('async function outGScanXml','function outGSaveLines');
assert.match(scanSource,/const inv=accountingRows\(\)\.find/,'XML scanning must require the selected managed order');
assert.match(scanSource,/Hãy bấm “Tạo đơn hàng mới” trước/);
assert.match(scanSource,/confirm\(`/,'Replacing an order XML must require confirmation');
assert.doesNotMatch(scanSource,/outgoingEmpty\(/,'XML scanning must not create an order');
assert.doesNotMatch(scanSource,/outgoingInvoices\.unshift/,'XML scanning must not append an order');

const createSource=between('function outGCreateOrder','renderOutgoingInvoices=function');
assert.match(createSource,/OUTGOING_MANAGED_MARKER/,'The create-order button must mark its orders as managed');
assert.match(createSource,/outgoingInvoices\.unshift\(inv\)/,'Only the explicit create action may append an order in this workflow');
assert.match(createSource,/getElementById\('outgXmlScanner'\)\?\.click\(\)/,'Creating an order must immediately open the XML picker');
assert.match(html,/\+ Tạo đơn mới &amp; quét XML|\+ Tạo đơn mới & quét XML/,'The primary action must explain the one-step flow');
assert.match(html,/Đổi \/ gắn XML/,'An existing order needs a separate replace/attach XML action');
assert.doesNotMatch(html,/Tạo đơn hàng mới trước khi quét XML/,'The confusing disabled XML button must be removed');

console.log('Manual outgoing-order creation checks passed.');
