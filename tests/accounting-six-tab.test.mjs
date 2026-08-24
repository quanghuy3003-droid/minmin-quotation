import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(here,'..','index.html'),'utf8');
const js=fs.readFileSync(path.join(here,'..','assets','accounting-six-tab.js'),'utf8');
const css=fs.readFileSync(path.join(here,'..','assets','accounting-six-tab.css'),'utf8');

test('production entry loads the six-tab accounting presentation layer',()=>{
  assert.match(html,/assets\/accounting-six-tab\.css/);
  assert.match(html,/assets\/accounting-six-tab\.js/);
});

test('desktop accounting exposes the redesigned workspace plus restored reconciliation',()=>{
  assert.match(js,/\['overview','Tổng quan'\],\['incoming','Mua vào'\],\['outgoing','Bán ra'\],\['payments','Thu\/chi'\],\['debts','Công nợ'\],\['reconcile','Đối soát'\],\['reports','Báo cáo'\]/);
  for(const retired of ["['vat','Thuế GTGT']","['vouchers','Chứng từ']","['cashbook','Sổ quỹ']"]){
    assert.ok(!js.includes(retired),`retired tab leaked into six-tab navigation: ${retired}`);
  }
});

test('all six screens retain their requested information architecture',()=>{
  for(const label of ['Tiền mặt & ngân hàng','Việc cần xử lý','Danh sách hóa đơn mua vào','Danh sách hóa đơn bán ra','Bảng kê chi tiết thu chi','Đối chiếu thanh toán','Xuất báo cáo quản trị','Kiểm tra nhanh']){
    assert.ok(js.includes(label),`missing accounting UI block: ${label}`);
  }
});

test('the presentation layer is desktop-only and preserves existing handlers',()=>{
  assert.match(js,/max-width:767px/);
  for(const hook of ['data-accounting-view','inputInvoiceFiles','data-mmso-drop-files','bankStatementPdf','exportAccountingReport'])assert.ok(js.includes(hook),`missing existing handler hook ${hook}`);
  assert.match(css,/@media\(min-width:768px\)/);
});

test('desktop redesign keeps the existing right-side drawers and product pickers',()=>{
  assert.match(js,/function legacyInteractionLayers\(view\)/);
  for(const selector of ['.mmq-drawer-layer','.mmq-payment-edit-layer','.mmso-drawer-backdrop','.mmso-drawer','#outgoingInventoryPickerOverlay']){
    assert.ok(js.includes(selector),`missing preserved interaction layer ${selector}`);
  }
  assert.match(js,/return page\+legacyInteractionLayers\(view\)/);
});

test('outgoing product chips render the matched inventory image',()=>{
  assert.match(js,/if\(outgoing\)img=typeof driveAssetUrl/);
  assert.match(js,/photoSourceValue\(stock\)/);
});

test('restored reconciliation uses the new design and existing business logic',()=>{
  assert.ok(js.includes('globalThis.__minminReconciliation'));
  for(const label of ['Đơn vị cần đối soát','Tổng hóa đơn','Tổng giao dịch','Chênh lệch','Kết quả đối soát','Giao dịch sao kê','Hóa đơn nhà cung cấp'])assert.ok(js.includes(label),`missing reconciliation content ${label}`);
  assert.ok(css.includes('.mm6-reconcile-columns'));
  assert.ok(js.includes('.mmq-reconcile-drawer-layer'));
});
