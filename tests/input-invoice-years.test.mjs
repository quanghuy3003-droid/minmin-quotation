import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const between=(start,end)=>{
  const from=html.indexOf(start), to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing ${start}`);
  assert.notEqual(to,-1,`Missing ${end}`);
  return html.slice(from,to);
};

const dateSource=between('function mmInputInvoiceTime','function mmInputInvoiceYearGroups');
const dates=new Function(`${dateSource}; return {mmInputInvoiceTime,mmInputInvoiceYear};`)();
assert.equal(dates.mmInputInvoiceYear({invoice_date:'2026-07-17'}),'2026');
assert.equal(dates.mmInputInvoiceYear({invoice_date:'31/12/2025'}),'2025');
assert.ok(dates.mmInputInvoiceTime({invoice_date:'2026-01-02'})>dates.mmInputInvoiceTime({invoice_date:'2025-12-31'}));

const groupSource=between('function mmInputInvoiceYearGroups','renderInputInvoicesTab = function');
const renderGroups=new Function('state','money','inputInvoiceTable','esc','mmInputInvoiceTime','mmInputInvoiceYear',`${groupSource}; return mmInputInvoiceYearGroups;`)(
  {ui:{}},
  value=>String(value),
  rows=>`<table>${rows.map(row=>row.label).join('|')}</table>`,
  value=>String(value),
  dates.mmInputInvoiceTime,
  dates.mmInputInvoiceYear
);
const grouped=renderGroups([
  {label:'old',invoice_date:'2025-12-31',total_amount:100,vat_amount:8},
  {label:'newer',invoice_date:'2026-07-17',total_amount:300,vat_amount:24},
  {label:'newest',invoice_date:'2026-08-01',total_amount:200,vat_amount:16}
]);
assert.ok(grouped.indexOf('Năm 2026')<grouped.indexOf('Năm 2025'),'Newer years must render first');
assert.match(grouped,/<table>newest\|newer<\/table>/,'Invoices inside a year must sort newest first');
assert.doesNotMatch(grouped,/<table>old<\/table>/,'Older years must be collapsed by default');
assert.match(grouped,/data-input-invoice-year-toggle="2025"/);

const statusPanel=between('function mmInvoiceStatusPanel','function mmInvoiceCategoryChip');
assert.match(statusPanel,/data-input-invoice-delete/,'The visible compact invoice row must include delete');
assert.match(statusPanel,/>Xóa<\/button>/);

console.log('Input invoice chronological year grouping checks passed.');
