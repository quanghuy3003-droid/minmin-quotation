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
assert.match(html,/function outGManagedRows\(\)/,'Outgoing XML orders need a view-specific unfiltered list');
assert.match(html,/const rows=outGManagedRows\(\);/,'The outgoing view must not hide a scanned order behind accounting month filters');

const managedRowsSource=between('function outGManagedRows','function outGOrderName');
const managedRows=new Function('state','isManagedOutgoingInvoice','accountingUpdatedAt',`${managedRowsSource}; return outGManagedRows;`)(
  {accounting:{filters:{period:'2026-07',year:'2026'},outgoingInvoices:[
    {id:'old-month',note:'[TAO_TU_QUET_XML_V3]',invoice_date:'2026-03-10',created_at:'2026-07-01T00:00:00Z',updated_at:'2026-07-03T00:00:00Z'},
    {id:'current-month',note:'[TAO_TU_QUET_XML_V3]',invoice_date:'2026-07-10',created_at:'2026-07-02T00:00:00Z',updated_at:'2026-07-02T00:00:00Z'}
  ]}},
  inv=>inv.note.includes('[TAO_TU_QUET_XML_V3]'),
  inv=>inv.updated_at
);
assert.deepEqual(managedRows().map(inv=>inv.id),['old-month','current-month'],'Orders must stay visible and keep creation order so the next order appears below');

const scanSource=between('async function outGScanXml','function outGSaveLines');
assert.match(scanSource,/parseVietnamInvoiceXml\(xml/,'The XML must be parsed before creating an order');
assert.match(scanSource,/File XML không có dữ liệu hóa đơn hợp lệ/,'Invalid XML must be rejected');
assert.match(scanSource,/const inv=outgoingEmpty\(/,'A valid XML must create the order');
assert.match(scanSource,/outgoingInvoices\.push\(inv\)/,'The XML workflow must append each parsed order below the previous orders');
assert.match(scanSource,/outGManagedRows\(\)\.length\+1/,'Order numbering must include managed orders from every invoice month');
assert.ok(scanSource.indexOf('File XML không có dữ liệu hóa đơn hợp lệ')<scanSource.indexOf('const inv=outgoingEmpty('),'Validation must happen before order creation');

assert.match(html,/Quét XML hóa đơn/,'The primary action must start from the outgoing invoice XML');
assert.match(html,/id="outgXmlScanner" aria-label="Quét XML hóa đơn"/,'The visible scan control must expose the native XML file input');
assert.match(html,/class="absolute inset-0 h-full w-full cursor-pointer opacity-0"/,'The native file input must cover the complete visible scan control');
assert.doesNotMatch(html,/getElementById\('outgXmlScanner'\)\?\.click\(\)/,'Opening the XML picker must not depend on a synthetic click');
assert.doesNotMatch(html,/data-outg-new-order/,'There must be no separate empty-order creation action');
assert.doesNotMatch(html,/function outGCreateOrder/,'Empty orders must not be created');
assert.doesNotMatch(html,/data-outg-order-select/,'The outgoing page must not have an order dropdown');
assert.match(html,/rows\.map\(inv=>`\$\{outGHeader\(inv\)\}\$\{!outGDetailsCollapsed\(inv\)\?outGLinesTable\(inv\):''\}`\)\.join\(''\)/,'Every order must render as a stacked card');
assert.match(html,/data-outg-delete-order="\$\{esc\(inv\.id\)\}"/,'Every order card needs its own delete button');
const deleteSource=between('async function outGDeleteOrder','renderOutgoingInvoices=function');
assert.ok(deleteSource.indexOf('confirm(')<deleteSource.indexOf('outgoingInvoices='),'An order must never be deleted before explicit confirmation');
assert.match(deleteSource,/deleteOutgoingInvoiceRemote\(id\)/,'Confirmed deletion must also remove the remote order');

console.log('XML-first outgoing-order creation checks passed.');
