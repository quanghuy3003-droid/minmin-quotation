import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

function section(start,end){
  const from=html.indexOf(start),to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing ${start}`);
  assert.notEqual(to,-1,`Missing ${end}`);
  return html.slice(from,to);
}

const helperSource=section('function accountingUnifiedSaleFinance','function accountingUnifiedSales');
const helper=new Function('window',`${helperSource}; return accountingUnifiedSaleFinance;`)({
  __minminOutgoingModel:{
    finance:()=>({saleNet:12_000_000,profit:7_000_000,vatDiff:560_000,vatPayable:560_000})
  }
});

assert.deepEqual(helper({net_amount:1,vat_amount:1}),{
  revenue:12_000_000,
  profit:7_000_000,
  vatPayable:560_000
});

const deductibleHelper=new Function('window',`${helperSource}; return accountingUnifiedSaleFinance;`)({
  __minminOutgoingModel:{finance:()=>({saleNet:5_000_000,profit:1_000_000,vatDiff:-80_000})}
});
assert.equal(deductibleHelper({}).vatPayable,0,'Negative VAT difference is deductible, not VAT payable');

const salesSource=section('function accountingUnifiedSales','function accountingUnifiedPurchaseUpload');
for(const label of ['Tổng đơn hàng','Doanh thu','Lợi nhuận','VAT phải nộp']){
  assert.match(salesSource,new RegExp(label),`Missing ${label} from mobile sale cards`);
}
assert.match(salesSource,/accountingUnifiedSaleFinance\(inv\)/,'Every mobile sale card must use linked input costs');

console.log('Mobile sales show revenue, profit and VAT payable.');
