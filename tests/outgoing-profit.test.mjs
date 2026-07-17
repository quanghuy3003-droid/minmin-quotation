import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

function section(start,end){
  const from=html.indexOf(start), to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing ${start}`);
  assert.notEqual(to,-1,`Missing ${end}`);
  return html.slice(from,to);
}

const kindSource=section('function outGLineKind','function outGStockKey');
const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const number=value=>Number(value||0)||0;
const kinds=new Function('invoiceNorm','outGNum',`${kindSource}; return {outGLineKind,outGSignedLineAmounts};`)(normalize,number);

assert.equal(kinds.outGLineKind({item_name:'Chiết khấu thương mại 10%',net_amount:6610000}),'discount');
assert.deepEqual(
  kinds.outGSignedLineAmounts({item_name:'Chiết khấu thương mại 10%',net_amount:6610000,vat_amount:528800,total_amount:7138800}),
  {kind:'discount',net:-6610000,vat:-528800,total:-7138800}
);
assert.equal(kinds.outGLineKind({item_name:'Phí vận chuyển',net_amount:3000000}),'shipping');
assert.equal(kinds.outGLineKind({item_name:'Đèn thả Melt',net_amount:7700000}),'product');
assert.equal(kinds.outGLineKind({item_name:'Theo hợp đồng mua bán',net_amount:0,vat_amount:0,total_amount:0}),'note');

const financeSource=section('function outGFinance','function outGBadge');
const finance=new Function('outGLines','outGNum','outGSignedLineAmounts','outGLineCost',`${financeSource}; return outGFinance;`)(
  inv=>inv.items_json,
  number,
  kinds.outGSignedLineAmounts,
  line=>({inputNet:Number(line.input_cost||0),inputVat:Number(line.input_vat||0)})
);
const result=finance({
  net_amount:12000000,
  vat_amount:960000,
  total_amount:12960000,
  items_json:[
    {item_name:'Đèn',net_amount:10000000,vat_amount:800000,total_amount:10800000,input_cost:4000000,input_vat:320000},
    {item_name:'Phí vận chuyển',net_amount:3000000,vat_amount:240000,total_amount:3240000,input_cost:1000000,input_vat:80000},
    {item_name:'Chiết khấu thương mại',net_amount:1000000,vat_amount:80000,total_amount:1080000,input_cost:0,input_vat:0}
  ]
});
assert.equal(result.saleNet,12000000,'Invoice net amount must be the authoritative revenue after discount');
assert.equal(result.inputNet,5000000,'Product cost and shipping input cost must both be deducted');
assert.equal(result.profit,7000000,'Profit must equal invoice net revenue minus every matched input cost');

assert.match(html,/Chọn hóa đơn đầu vào vận chuyển/);
assert.match(html,/Khoản chiết khấu giảm doanh thu · không cần hình ảnh/);
assert.match(html,/selected_input_invoice_ids/);

console.log('Outgoing profit and cost classification checks passed.');
