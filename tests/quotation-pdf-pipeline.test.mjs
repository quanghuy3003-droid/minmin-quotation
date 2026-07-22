import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');
const api=await readFile(new URL('../api/excel-to-pdf.js',import.meta.url),'utf8');

assert.match(source,/async function buildQuotationWorkbookForPdf\(\)[\s\S]*?await exportQuotation\(\)/);
assert.match(source,/async function exportQuotationPdfFromXlsx\(options=\{\}\)[\s\S]*?exportMobilePdfVector\(\{preview,previewWindow:previewWin\}\)/);
assert.match(source,/previewPdf\.onclick=\(\)=>exportQuotationPdfFromXlsx\(\{preview:true\}\)/);
assert.match(source,/function isMobilePdfDevice\(\)/,'Quotation PDF export must detect phones and tablets');
assert.match(source,/function presentMobilePdf\(blob,name\)/,'Mobile PDF export must provide an in-app delivery dialog');
assert.match(source,/id="mobilePdfOpen"[^>]*target="_blank"/,'The mobile delivery dialog must expose an explicit browser-open fallback');
assert.match(source,/new File\(\[blob\],name,\{type:'application\/pdf'\}\)[\s\S]*?navigator\.share/,'Mobile PDF delivery must use the native share sheet with a real PDF file');
assert.match(source,/showMobilePdfProgress\(\)[\s\S]*?Đang tạo PDF báo giá/,'Mobile PDF export must immediately show progress');
assert.match(source,/async function exportMobilePdfVector\(options=\{\}\)[\s\S]*?pdf\.autoTable/,'Quotation PDF must render its table as vectors');
const vectorPdfPipeline=source.slice(source.indexOf('async function exportMobilePdfVector(options={})'),source.indexOf('async function exportPdfA4(options={})'));
assert.doesNotMatch(vectorPdfPipeline,/HOME DÉCOR - ĐÈN TRANG TRÍ/,'The PDF header must not repeat the removed Home Decor line');
assert.match(vectorPdfPipeline,/pdf\.text\('TEL 038 868 3838',72,88\)/,'The telephone line must sit directly below the logo');
assert.match(vectorPdfPipeline,/NotoSans-Italic\.ttf[\s\S]*?addFont\('NotoSans-Italic\.ttf','NotoSans','italic'\)/,'The PDF must embed a Vietnamese-capable italic font');
assert.match(source,/const firstPageCapacity=Math\.max\(1,Math\.floor\(\(pageBottom-firstPageTableY-tableHeaderHeight\)\/productRowHeight\)\)[\s\S]*?productBody\.slice\(0,firstPageCapacity\)[\s\S]*?while\(productBody\.length-start>2\)[\s\S]*?Math\.min\(4,productBody\.length-start-1\)/,'Quotation pagination must derive the cover capacity from the blocks moved above it and reserve a compact closing page');
assert.match(source,/const finalPage=pageIndex===chunks\.length-1[\s\S]*?shippingRow,\.\.\.closingRows/,'Shipping and totals must stay on the final product page');
assert.match(source,/const customerInfoRows=\[[\s\S]*?\{label:'Tel',value:state\.info\.tel,secondaryLabel:'Email',secondaryValue:state\.info\.email\}[\s\S]*?customerInfoRows\.forEach/,'Quotation client details must contain the five Excel information rows');
assert.match(source,/i===4\?68:145[\s\S]*?pdf\.text\(row\.secondaryLabel,145,y\)[\s\S]*?pdf\.text\(String\(row\.secondaryValue\|\|''\),180,y/,'Telephone and email must share the fifth information row');
assert.match(source,/pdf\.text\('PHIẾU BÁO GIÁ \(THE QUOTATION\)',421,166[\s\S]*?const y=218\+i\*13/,'Quotation title and customer information must follow the marked lower positions');
assert.match(source,/const firstPageTableY=300,continuationTableY=44,productRowHeight=92,tableHeaderHeight=24,pageBottom=567/,'Quotation pagination must use explicit A4 content boundaries');
assert.match(source,/startY:pageIndex\?continuationTableY:firstPageTableY[\s\S]*?minCellHeight=productRowHeight/,'Quotation tables must flow below all five customer-information rows and move overflow products to later pages');
assert.match(source,/halign:'left',fillColor:hot/,'Quotation total labels must be left aligned like the Excel reference');
assert.match(source,/splitTextToSize\(String\(note\),570\)/,'Quotation notes must reserve real space for wrapped lines');
assert.match(vectorPdfPipeline,/data\.row\.index===chunk\.rows\.length&&data\.column\.index===6[\s\S]*?pdf\.line\(28,lineY,data\.cell\.x\+data\.cell\.width,lineY\)/,'The missing horizontal rule must be restored below the shipping row');
assert.match(vectorPdfPipeline,/const amountInWords=[\s\S]*?toLocaleLowerCase\('vi-VN'\)[\s\S]*?setFont\('NotoSans','italic'\)[\s\S]*?pdf\.text\(amountInWords/,'The amount in words must be lowercase, italic, and non-bold');
assert.match(source,/if\(y>340\)\{pdf\.addPage\('a4','landscape'\);y=72;\}/,'Long closing sections must move to a clean page instead of overflowing');
assert.match(source,/if\(options\.preview\)[\s\S]*?target\.location\.replace\(url\)/,'Vector PDF preview must open the generated PDF directly');
const activePdfPipeline=source.slice(source.indexOf('async function exportQuotationPdfFromXlsx(options={})'),source.indexOf("document.addEventListener('click'",source.indexOf('async function exportQuotationPdfFromXlsx(options={})')));
assert.doesNotMatch(activePdfPipeline,/excel-to-pdf|Microsoft Graph|buildQuotationWorkbookForPdf/,'Active quotation PDF actions must not depend on Microsoft Graph');
assert.match(source,/id="mobilePdfPercent"[\s\S]*?id="mobilePdfBar"/,'Mobile PDF export must display a numeric percentage and progress bar');
assert.match(source,/function updateMobilePdfProgress\(percent,label\)[\s\S]*?Math\.round/,'Mobile PDF progress must update with real phase percentages');
assert.match(source,/cropImageToSquare\(data,isMobilePdfDevice\(\)\?320:900\)/,'Mobile PDF images must be downsampled before page rasterization');
assert.match(source,/scale:isMobilePdfDevice\(\)\?\.75:2\.35[\s\S]*?imageTimeout:5000/,'iPhone page canvases must stay within an A4-sized memory budget');
assert.match(source,/pdf\.addImage\(canvas,'JPEG'[\s\S]*?canvas\.width=1;canvas\.height=1/,'Each page canvas must be released immediately after PDF encoding');
assert.match(source,/Trang \$\{i\+1\} xử lý quá lâu[\s\S]*?30000/,'A stalled page render must time out instead of freezing forever');
assert.match(source,/if\(!preview\)\{[\s\S]*?showMobilePdfError\(error\)/,'PDF failures must show their actual reason instead of endless loading');
assert.match(source,/id="mobilePdfOpen"[\s\S]*?>Mở PDF</,'Mobile PDF delivery must retain a browser-open fallback');
assert.match(source,/document\.body\.appendChild\(a\); a\.click\(\); setTimeout/,'Blob downloads must keep their URL alive for mobile browsers');
assert.match(source,/pdf\.onclick=\(\)=>exportQuotationPdfFromXlsx\(\)/);
assert.match(source,/document\.addEventListener\('click',[\s\S]*?stopImmediatePropagation\(\)[\s\S]*?exportQuotationPdfFromXlsx\(\)/,'The PDF button must have a direct capture handler that survives rerenders and PIN unlock');
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
assert.match(source,/const closingProductCapacity=1;[\s\S]*?const totalsPageCapacity=pageCapacity\(\{final:true\}\);[\s\S]*?while\(rows\.length-pos>totalsPageCapacity\)/,'Pagination must pull remaining products upward until the totals page is genuinely full');
assert.match(source,/if\(closingRows\.length<=closingProductCapacity\)[\s\S]*?notes:true[\s\S]*?else[\s\S]*?summary:'all'/,'Notes must move to their own page instead of forcing a sparse product page');
assert.match(source,/\.sheet th\{[^}]*vertical-align:middle!important/,'Column headings must center vertically within their cells');
assert.match(source,/\.sheet th,\.sheet td\{border:\.15px solid #777/,'Quotation grid lines must render ultra thin and soft');
assert.match(source,/\.ship-row td\{height:32px[^}]*vertical-align:middle!important/,'Shipping content must be centered vertically inside a taller row');
assert.match(source,/class="total-label" colspan="3"><span class="total-cell-content">/,'Total labels need a dedicated vertical-centering wrapper');
assert.match(source,/class="total-value"><span class="total-cell-content">/,'Total values need a dedicated vertical-centering wrapper');
assert.match(source,/\.total-cell-content\{[^}]*display:flex;height:20px[^}]*align-items:center/,'Total content must center vertically with flex alignment');
assert.match(source,/\.total-cell-content\{position:absolute;left:0;right:0;top:50%;[^}]*transform:translateY\(-78%\)/,'Total content visual center must align with each cell midpoint');
assert.match(source,/\.sheet thead th\{position:relative;background:#000!important;color:#fff!important\}/,'Quotation table headers must use a black background with white text');
assert.match(source,/\.header-cell-content\{position:absolute;left:0;right:0;top:50%;[^}]*transform:translateY\(-58%\)/,'Quotation header text must sit on the vertical midpoint axis');
assert.match(source,/lines\.map\(line=>`<span class="header-line">/,'Each quotation heading line must have its own layout element');
assert.match(source,/\.header-cell-content\{position:absolute!important;inset:0!important;display:flex!important[^}]*flex-direction:column;align-items:center;justify-content:center;transform:translateY\(-2px\)!important\}/,'All quotation header content must move two pixels down inside the compact black cell');
assert.match(source,/\.sheet thead th\{height:26px!important;overflow:hidden!important;box-shadow:0 -7px 0 #000\}/,'Black quotation header cells must extend seven pixels upward without moving their content');
assert.match(source,/\.logo\{left:159\.5px!important;width:auto!important;max-width:190px!important;transform:translateX\(-50%\);object-fit:contain!important\}/,'Quotation logo center must align with the marked vertical axis');
assert.match(source,/\.closing-panel \.words\{left:0!important;right:0!important;top:-24px!important;display:flex!important;align-items:center;justify-content:center;gap:70px\}/,'Amount in words must move upward and center across the final page');
assert.match(source,/class="header-cell-content"/,'Every column heading needs a vertical-centering wrapper');
assert.match(source,/\.header-cell-content\{[^}]*align-items:center;justify-content:center/,'Column headings must center on both axes');
assert.match(source,/notesOnProductPage=true/,'Multi-page quotations must place notes beside the final product totals');
assert.match(source,/if\(!notesOnProductPage\)pages\.push\(summaryPageHtml\(\)\)/,'A separate notes page must only be used when the first page has no room');
assert.match(source,/\.closing-panel\{position:absolute;left:0;right:0;bottom:28px/,'Notes and QR must occupy the empty area below final-page totals');
assert.match(source,/\.date\{[^}]*right:104px[^}]*width:180px;text-align:center/,'QR and date must share the same centered axis');
assert.match(source,/const cover=page\.cover\?/,'Quotation cover content must be conditional');
assert.match(source,/quotationPageHtml\(\{cover:true,header:true,rows:rows\.slice\(0,firstTake\)/,'Only the first product page must include the quotation cover');
assert.match(source,/quotationPageHtml\(\{cover:false,header:true,rows:chunk/,'Middle product pages must omit the quotation cover');
assert.match(source,/quotationPageHtml\(\{cover:false,header:true,rows:closingRows/,'The closing product page must omit the quotation cover');
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

console.log('Quotation PDF desktop and mobile conversion pipelines passed.');
