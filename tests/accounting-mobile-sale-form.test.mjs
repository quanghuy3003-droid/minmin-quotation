import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function accountingMobileSaleForm[\s\S]*?1\. Tóm tắt hóa đơn[\s\S]*?2\. Thông tin hóa đơn[\s\S]*?3\. Thanh toán &amp; tổng tiền[\s\S]*?4\. Thông tin xuất hóa đơn[\s\S]*?5\. Sản phẩm &amp; file PDF\/XML/,'Mobile sales form must contain the five compact Minmin sections');
assert.match(source,/function accountingUnifiedSales[\s\S]*?accountingMobileSaleForm\(selected\)/,'Mobile sales edit must use the dedicated compact renderer');
assert.match(source,/function accountingMobileSaleField[\s\S]*?data-outgoing-edit="\$\{esc\(key\)\}"/,'Mobile fields must delegate to the existing outgoing edit hook');
assert.match(source,/function accountingMobileSaleForm[\s\S]*?id="createOutgoingFromInventory"[\s\S]*?data-outgoing-file="pdf"[\s\S]*?data-outgoing-file="xml"/,'Existing inventory and invoice-file hooks must remain authoritative');
assert.match(source,/mm-mobile-sale-money-row[\s\S]*?Trước VAT[\s\S]*?VAT[\s\S]*?Tổng sau VAT/,'The three VAT totals must share one compact row');
assert.match(source,/data-accounting-mobile-sale-accordion="invoice-output"[\s\S]*?data-accounting-mobile-sale-accordion="product-note"/,'Less-used invoice and product-note data must use remembered accordions');
assert.match(source,/mm-mobile-sale-footer[\s\S]*?id="saveOutgoingInvoice"[\s\S]*?Lưu nháp[\s\S]*?data-accounting-mobile-sale-complete[\s\S]*?Hoàn tất/,'The mobile form must keep a sticky draft/complete footer');
assert.match(source,/@media \(max-width: 359px\)[\s\S]*?\.mm-mobile-sale-grid,[\s\S]*?grid-template-columns: 1fr/,'Very narrow phones must fall back from two columns to one');
assert.match(source,/const renderAccountingDesktopPreserved=renderAccountingTabDesktopBase[\s\S]*?max-width: 767px[\s\S]*?renderAccountingDesktopPreserved/,'Desktop accounting must remain on the preserved renderer');

console.log('Compact Minmin mobile sales form checks passed.');
