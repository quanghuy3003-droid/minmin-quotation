import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function quoteMobileView\(\)[\s\S]*?Khách hàng[\s\S]*?Tổng sau VAT[\s\S]*?Tìm mã, tên sản phẩm[\s\S]*?Thêm sản phẩm/,'Mobile quotation must expose the customer, total, search and add-product areas');
assert.match(source,/function quoteMobileNav\(\)[\s\S]*?Báo giá[\s\S]*?Kho hàng[\s\S]*?Kế toán[\s\S]*?Hồ sơ[\s\S]*?Khác/,'Mobile quotation must use the requested five-item navigation');
assert.match(source,/minmin-quote-product-head[\s\S]*?Sản phẩm[\s\S]*?SL[\s\S]*?Đơn giá[\s\S]*?Thành tiền/,'Mobile product list must preserve the requested table columns');
assert.match(source,/function quoteMobileProductRows\(\)[\s\S]*?previewImage\(line\)[\s\S]*?lineUnitPrice\(line\)[\s\S]*?lineAmount\(line\)/,'Mobile product rows must use the existing image and pricing logic');
assert.match(source,/minmin-quote-payment-grid[\s\S]*?Tổng giá trị[\s\S]*?Chiết khấu[\s\S]*?Sau chiết khấu[\s\S]*?VAT[\s\S]*?Đặt cọc[\s\S]*?Còn lại/,'Mobile quotation must show the complete payment summary');
assert.match(source,/data-quote-mobile-action="export-excel"[\s\S]*?Xuất Excel/,'Mobile quotation must retain Excel export');
assert.match(source,/return `<div class="minmin-quote-finance-panel">\s*<div class="minmin-quote-finance-actions">[\s\S]*?Xem trước PDF[\s\S]*?Xuất PDF[\s\S]*?Phí vận chuyển/,'Mobile PDF actions must appear before the finance inputs so the fixed footer cannot hide them');
assert.match(source,/\.minmin-quote-mobile-view\s*\{[\s\S]*?padding-bottom:\s*calc\(112px \+ env\(safe-area-inset-bottom\)\)/,'Mobile quotation must reserve comfortable space above the fixed action bar');
assert.match(source,/\.minmin-quote-payment-more svg\s*\{[\s\S]*?width:\s*18px;[\s\S]*?height:\s*18px;/,'Payment detail chevron must not expand the mobile controls');
assert.match(source,/action==='export-excel'[\s\S]*?exportQuotation\(\)/,'The mobile Excel button must use the existing workbook pipeline');
assert.match(source,/action==='preview-pdf'[\s\S]*?exportQuotationPdfFromXlsx\(\{preview:true\}\)[\s\S]*?action==='export-pdf'[\s\S]*?exportQuotationPdfFromXlsx\(\)/,'Mobile PDF actions must retain the existing Excel-to-PDF pipeline');
assert.match(source,/const renderWithQuoteMobileDashboard=render;[\s\S]*?mountQuoteMobile\(\)/,'The mobile quotation must be layered over the existing desktop renderer');
assert.match(source,/quoteSection\.classList\.add\('minmin-quote-desktop-view'\)/,'Desktop quotation must remain available and unchanged');
assert.match(source,/data-quote-mobile-edit-customer[\s\S]*?quoteMobileEditMode='customer'/,'Customer editing must still open the existing editor');
assert.match(source,/data-quote-mobile-edit-line[\s\S]*?state\.ui\.quoteLineOpen\[id\]=true/,'Product menu must still open the existing line editor');

console.log('MISA-style mobile quotation dashboard checks passed.');
