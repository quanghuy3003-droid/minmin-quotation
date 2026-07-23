import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/body:has\(\.minmin-accounting-unified-mobile\) \.minmin-app-logo[\s\S]*?display: flex !important/,'Mobile accounting must retain the real Minmin logo header');
assert.match(source,/body:has\(\.minmin-accounting-unified-mobile\) \.minmin-main-nav[\s\S]*?display: grid !important/,'Mobile accounting must retain the shared six-tab navigation');
assert.match(source,/function accountingUnifiedNav[\s\S]*?Tổng quan[\s\S]*?Bán hàng[\s\S]*?Mua hàng[\s\S]*?Thu chi/,'Accounting needs the four requested internal mobile tabs');
assert.match(source,/function accountingUnifiedOverview[\s\S]*?VAT tạm phải nộp[\s\S]*?Lập chứng từ[\s\S]*?Bán hàng[\s\S]*?Thu tiền[\s\S]*?Mua hàng[\s\S]*?Chi tiền/,'The overview must expose VAT and the four real document actions');
assert.match(source,/Hóa đơn cần kiểm tra[\s\S]*?data-accounting-unified-review/,'The review card must route to filtered purchase invoices');
assert.match(source,/function accountingUnifiedSales[\s\S]*?Đủ liên kết[\s\S]*?Chưa đủ liên kết[\s\S]*?data-accounting-unified-sale-detail/,'Sales must render linked and unlinked compact cards with real detail actions');
assert.match(source,/function accountingUnifiedPurchases[\s\S]*?Đồng bộ XML\/PDF[\s\S]*?data-input-invoice-lock[\s\S]*?data-input-invoice-delete/,'Purchases must retain XML/PDF, lock and delete workflows');
assert.match(source,/function accountingUnifiedPaymentDateLabel[\s\S]*?Hôm nay[\s\S]*?Hôm qua/,'Payments must use the requested mobile date groups');
assert.match(source,/function accountingUnifiedPayments[\s\S]*?data-accounting-unified-new-payment[\s\S]*?Thêm thu chi/,'Payments must retain the mobile add flow');
assert.match(source,/const renderAccountingDesktopPreserved=renderAccountingTabDesktopBase/,'Desktop accounting must stay on its original renderer');
assert.match(source,/renderAccountingUnifiedResponsive[\s\S]*?max-width: 767px[\s\S]*?renderAccountingDesktopPreserved/,'The unified renderer must switch only at the mobile breakpoint');

console.log('Unified Minmin mobile accounting checks passed.');
