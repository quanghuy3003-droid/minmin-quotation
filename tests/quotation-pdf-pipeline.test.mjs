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
