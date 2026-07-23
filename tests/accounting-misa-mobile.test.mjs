import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/body:has\(\.minmin-accounting-mobile-view\) \.minmin-app-logo[\s\S]*?display: none !important/,'Mobile accounting must replace the global app header with its own MISA-style header');
assert.match(source,/function accountingMobileDashboard\(\)[\s\S]*?Lập chứng từ[\s\S]*?Bán hàng[\s\S]*?Thu tiền[\s\S]*?Mua hàng[\s\S]*?Chi tiền/,'The mobile accounting dashboard needs the four primary MISA-style actions');
assert.match(source,/const taxRows=\[\['Doanh thu tính thuế GTGT'[\s\S]*?\['Thuế GTGT đầu ra'[\s\S]*?\['Thuế GTGT đầu vào'[\s\S]*?\['VAT tạm phải nộp'/,'The mobile overview must define the current tax figures');
assert.match(source,/Tiền thuế[\s\S]*?taxRows\.map/,'The tax figures must render in the mobile overview card');
assert.match(source,/function accountingMobileBottom\(active='overview'\)[\s\S]*?Tổng quan[\s\S]*?Bán hàng[\s\S]*?Mua hàng[\s\S]*?Thu chi[\s\S]*?Thêm/,'Mobile accounting needs a fixed five-item bottom navigation');
assert.match(source,/function accountingMobileMore\(\)[\s\S]*?Công nợ[\s\S]*?Thuế GTGT[\s\S]*?Chứng từ[\s\S]*?Sổ quỹ[\s\S]*?Báo cáo[\s\S]*?Đối soát/,'The More screen must expose every remaining accounting area');
assert.match(source,/const renderAccountingTabDesktopBase=renderAccountingTab;[\s\S]*?renderAccountingTabResponsive/,'Desktop accounting must remain intact behind the responsive renderer');
assert.match(source,/data-accounting-mobile-payment-type[\s\S]*?state\.accounting\.filters\.paymentType=paymentType/,'Thu tiền and Chi tiền actions must open the corresponding payment filter');
assert.match(source,/data-accounting-mobile-back[\s\S]*?state\.activeTab='quote'/,'The accounting header back button must return to the quotation tab');
assert.match(source,/data-tab="accounting"[\s\S]*?max-width: 640px[\s\S]*?state\.accounting\.view='overview'/,'Opening Accounting on a phone must always start from the MISA-style overview');

console.log('MISA-style mobile accounting dashboard checks passed.');
