import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');
const api=await readFile(new URL('../api/excel-to-pdf.js',import.meta.url),'utf8');

assert.match(source,/async function buildQuotationWorkbookForPdf\(\)[\s\S]*?await exportQuotation\(\)/);
assert.match(source,/async function exportQuotationPdfFromXlsx\(options=\{\}\)[\s\S]*?fetch\('\/api\/excel-to-pdf'/);
assert.match(source,/previewPdf\.onclick=\(\)=>exportQuotationPdfFromXlsx\(\{preview:true\}\)/);
assert.match(source,/pdf\.onclick=\(\)=>exportQuotationPdfFromXlsx\(\)/);
assert.match(source,/catch\(error\)\{[\s\S]*?return exportPdfA4\(\{preview,previewWindow:previewWin\}\)/,'PDF export must fall back locally when Graph is unavailable');
assert.match(source,/options\.previewWindow\|\|window\.open/,'PDF preview fallback must reuse the already-open preview window');
assert.match(source,/\.logo\{[^}]*width:auto;height:64px;max-width:190px;object-fit:contain/,'Quotation logo must preserve its natural aspect ratio');
assert.match(source,/\.table-first\{[^}]*top:304px/,'The product table must clear the complete client and telephone block');
assert.match(source,/\.sheet td\{font-size:9\.2px/,'Product content must use a balanced readable font size');
assert.match(source,/\.total-label\{text-align:left!important/,'Quotation total labels must be left-aligned');
assert.match(source,/class="no-border" colspan="7"><\/td><td class="total-label" colspan="3">/,'Totals must align exactly with the last four product-table columns');
assert.match(source,/\.ship-row td\{[^}]*vertical-align:middle!important/,'Shipping cells must center content vertically');
assert.match(source,/\.total-row td\{height:20px;vertical-align:middle!important/,'First-page total cells must use a fixed centered height');
assert.match(source,/summary:'all'/,'The closing product page must contain every quotation total');
assert.doesNotMatch(source,/<table class="summary-totals">/,'Totals must not be deferred to the notes page');
assert.match(source,/reservedForClosing=final\?\(32\+20\*7\):0/,'Pagination must reserve space for the centered shipping row and seven totals');
assert.match(source,/\.sheet th\{[^}]*vertical-align:middle!important/,'Column headings must center vertically within their cells');
assert.match(source,/\.sheet th,\.sheet td\{border:\.15px solid #777/,'Quotation grid lines must render ultra thin and soft');
assert.match(source,/\.ship-row td\{height:32px[^}]*vertical-align:middle!important/,'Shipping content must be centered vertically inside a taller row');
assert.match(source,/class="total-label" colspan="3"><span class="total-cell-content">/,'Total labels need a dedicated vertical-centering wrapper');
assert.match(source,/class="total-value"><span class="total-cell-content">/,'Total values need a dedicated vertical-centering wrapper');
assert.match(source,/\.total-cell-content\{[^}]*display:flex;height:20px[^}]*align-items:center/,'Total content must center vertically with flex alignment');
assert.match(source,/\.total-cell-content\{position:absolute;left:0;right:0;top:50%;[^}]*transform:translateY\(-78%\)/,'Total content visual center must align with each cell midpoint');
assert.match(source,/\.sheet thead th\{position:relative;background:#000!important;color:#fff!important\}/,'Quotation table headers must use a black background with white text');
assert.match(source,/\.header-cell-content\{position:absolute;left:0;right:0;top:50%;[^}]*transform:translateY\(-58%\)/,'Quotation header text must sit on the vertical midpoint axis');
assert.match(source,/\.header-cell-content\{transform:translateY\(-50%\)!important\}/,'Quotation header text must be geometrically centered within each cell');
assert.match(source,/header-cell-content\$\{lines\.length>1\?' header-cell-two-lines':''\}/,'Two-line quotation headers need a dedicated alignment class');
assert.match(source,/\.header-cell-two-lines\{transform:translateY\(-20%\)!important\}/,'Two-line quotation headers must align their visual axis with the cell midpoint');
assert.match(source,/\.logo\{left:202\.5px!important;width:auto!important;max-width:190px!important;transform:translateX\(-50%\);object-fit:contain!important\}/,'Quotation logo must stay proportional while centered over the brand block');
assert.match(source,/\.closing-panel \.words\{left:0!important;right:0!important;top:-24px!important;display:flex!important;align-items:center;justify-content:center;gap:70px\}/,'Amount in words must move upward and center across the final page');
assert.match(source,/class="header-cell-content\$\{/,'Every column heading needs a vertical-centering wrapper');
assert.match(source,/\.header-cell-content\{[^}]*align-items:center;justify-content:center/,'Column headings must center on both axes');
assert.match(source,/notesOnProductPage=true/,'Multi-page quotations must place notes beside the final product totals');
assert.match(source,/if\(!notesOnProductPage\)pages\.push\(summaryPageHtml\(\)\)/,'A separate notes page must only be used when the first page has no room');
assert.match(source,/\.closing-panel\{position:absolute;left:0;right:0;bottom:28px/,'Notes and QR must occupy the empty area below final-page totals');
assert.match(source,/\.date\{[^}]*right:104px[^}]*width:180px;text-align:center/,'QR and date must share the same centered axis');
assert.match(source,/const cover=page\.cover\?/,'Quotation cover content must be conditional');
assert.match(source,/quotationPageHtml\(\{cover:true,header:true,rows:rows\.slice\(0,firstTake\)/,'Only the first product page must include the quotation cover');
assert.match(source,/quotationPageHtml\(\{cover:false,header:true,rows:chunk/,'Middle product pages must omit the quotation cover');
assert.match(source,/quotationPageHtml\(\{cover:false,header:true,rows:rows\.slice\(pos\)/,'The closing product page must omit the quotation cover');
assert.match(source,/\.qr\{[^}]*top:166px/,'QR must be vertically centered beside the raised notes block');
assert.ok(source.lastIndexOf('previewPdf.onclick=()=>exportQuotationPdfFromXlsx')>source.lastIndexOf('previewPdf.onclick=()=>exportPdfA4'));
assert.ok(source.lastIndexOf('pdf.onclick=()=>exportQuotationPdfFromXlsx')>source.lastIndexOf('pdf.onclick=()=>exportPdfA4'));
assert.match(api,/content\?format=pdf/);
assert.match(api,/MS_GRAPH_DRIVE_ID/);
assert.doesNotMatch(api,/html2canvas|jsPDF|canvas/i);

const require=createRequire(import.meta.url);
const handler=require(fileURLToPath(new URL('../api/excel-to-pdf.js',import.meta.url)));
const previousFetch=globalThis.fetch;
const previousEnv={
  tenant:process.env.MS_GRAPH_TENANT_ID,
  client:process.env.MS_GRAPH_CLIENT_ID,
  secret:process.env.MS_GRAPH_CLIENT_SECRET,
  drive:process.env.MS_GRAPH_DRIVE_ID
};
process.env.MS_GRAPH_TENANT_ID='tenant';
process.env.MS_GRAPH_CLIENT_ID='client';
process.env.MS_GRAPH_CLIENT_SECRET='secret';
process.env.MS_GRAPH_DRIVE_ID='drive';
const calls=[];
globalThis.fetch=async (url,options={})=>{
  calls.push({url:String(url),method:options.method||'GET',body:options.body});
  if(String(url).includes('/oauth2/v2.0/token'))return new Response(JSON.stringify({access_token:'token'}),{status:200});
  if(options.method==='PUT')return new Response(JSON.stringify({id:'item-id'}),{status:201});
  if(String(url).includes('format=pdf'))return new Response(Buffer.from('%PDF-1.7\nmock'),{status:200});
  if(options.method==='DELETE')return new Response(null,{status:204});
  throw new Error(`Unexpected request: ${url}`);
};
const request=Readable.from([Buffer.from('PK mock xlsx')]);
request.method='POST';
request.headers={'x-file-name':encodeURIComponent('MQD.xlsx')};
const response={
  statusCode:200,headers:{},body:Buffer.alloc(0),
  setHeader(key,value){this.headers[key]=value;},
  end(value){this.body=value?Buffer.from(value):Buffer.alloc(0);}
};
await handler(request,response);
assert.equal(response.statusCode,200);
assert.equal(response.headers['Content-Type'],'application/pdf');
assert.ok(response.body.subarray(0,5).equals(Buffer.from('%PDF-')));
assert.deepEqual(calls.map(call=>call.method),['POST','PUT','GET','DELETE']);
assert.ok(Buffer.isBuffer(calls[1].body),'The exact generated XLSX bytes must be uploaded.');
globalThis.fetch=previousFetch;
if(previousEnv.tenant===undefined)delete process.env.MS_GRAPH_TENANT_ID; else process.env.MS_GRAPH_TENANT_ID=previousEnv.tenant;
if(previousEnv.client===undefined)delete process.env.MS_GRAPH_CLIENT_ID; else process.env.MS_GRAPH_CLIENT_ID=previousEnv.client;
if(previousEnv.secret===undefined)delete process.env.MS_GRAPH_CLIENT_SECRET; else process.env.MS_GRAPH_CLIENT_SECRET=previousEnv.secret;
if(previousEnv.drive===undefined)delete process.env.MS_GRAPH_DRIVE_ID; else process.env.MS_GRAPH_DRIVE_ID=previousEnv.drive;

console.log('Quotation PDF uses the generated XLSX and Microsoft Graph conversion.');
