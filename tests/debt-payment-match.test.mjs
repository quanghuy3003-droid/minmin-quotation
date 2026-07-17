import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const between=(start,end)=>{
  const from=html.indexOf(start), to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing ${start}`);
  assert.notEqual(to,-1,`Missing ${end}`);
  return html.slice(from,to);
};

const candidates=between('function debtCompatiblePayments','function debtPaymentPicker');
assert.match(candidates,/kind==='receivable'\?'outgoing':'incoming'/,'Receivables and payables must target different invoice types');
assert.match(candidates,/kind==='receivable'\?'thu':'chi'/,'Receivables match receipts while payables match expenses');
assert.match(candidates,/payment\.related_id&&!/,'Payments already linked to another invoice must be excluded');
assert.match(candidates,/Math\.abs\(amount-remain\)<1/,'Exact remaining amounts must receive compatibility priority');

const picker=between('function debtPaymentPicker','async function debtLinkPayment');
assert.match(picker,/data-debt-payment-pick/,'Every open debt needs a payment picker');
assert.match(picker,/Ch\u1ecdn giao d\u1ecbch ph\u00f9 h\u1ee3p|Chọn giao dịch phù hợp/,'The picker must explain that it lists compatible transactions');

const link=between('async function debtLinkPayment','renderDebts=function');
assert.match(link,/payment\.related_type=relatedType/);
assert.match(link,/payment\.related_id=String\(inv\.id\)/);
assert.match(link,/savePaymentRemote\(payment\)/,'The selected payment link must sync remotely');
assert.match(link,/saveOutgoingInvoiceRemote\(inv\):saveInputInvoiceRemote\(inv\)/,'Both sales and purchase invoices must sync after matching');

const debts=between('renderDebts=function','renderOutgoingInvoices=function');
assert.match(debts,/debtPaymentPicker\(row\.kind,row\.inv\)/,'Each debt row must render its compatibility picker');

console.log('Debt-compatible payment matching checks passed.');
