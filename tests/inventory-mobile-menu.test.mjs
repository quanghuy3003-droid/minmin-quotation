import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/body:has\(\.minmin-stock-mobile-view\) \.minmin-app-logo,[\s\S]*?body:has\(\.minmin-stock-mobile-view\) \.minmin-main-nav[\s\S]*?display: none !important/,'Mobile inventory must replace the global header with its own back toolbar');
assert.match(source,/\.minmin-stock-mobile-item\s*\{[\s\S]*?grid-template-columns: 104px minmax\(0, 1fr\) 44px/,'Mobile inventory products must use a compact image, information and action row');
assert.match(source,/function renderInventoryMobileView\(\)[\s\S]*?data-stock-mobile-back="tab"[\s\S]*?data-stock-mobile-category[\s\S]*?data-stock-mobile-search/,'Mobile inventory needs back, category and search controls');
assert.match(source,/function renderInventoryMobileView\(\)[\s\S]*?data-stock-mobile-add[\s\S]*?>Thêm sản phẩm</,'Mobile inventory needs a visible add-product action');
assert.match(source,/\.minmin-stock-mobile-search-row svg\s*\{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px;/,'Mobile inventory search icon must keep a compact explicit size');
assert.match(source,/function inventoryMobileListItem\(item(?:,filterNeedle='')?\)[\s\S]*?item\.photoDataUrl[\s\S]*?item\.code[\s\S]*?money\(finance\.sell\)[\s\S]*?Number\(item\.quantity\|\|0\)/,'Every mobile product row must show image, code, price and stock quantity');
assert.match(source,/function inventoryMobileDetailView\(item\)[\s\S]*?data-stock-mobile-back="detail"[\s\S]*?minmin-stock-mobile-hero[\s\S]*?inventoryCompactDates\(item\)[\s\S]*?data-stock-out/,'The product detail view must provide back navigation, a large image, dates and stock actions');
assert.match(source,/const renderInventoryTabDesktop = renderInventoryTab;[\s\S]*?minmin-stock-desktop-view[\s\S]*?renderInventoryMobileView\(\)/,'Desktop inventory must remain available beside the dedicated mobile renderer');
assert.match(source,/function renderInventoryMobileEntry\(\)[\s\S]*?data-stock-mobile-back="entry"[\s\S]*?Thêm sản phẩm[\s\S]*?data-stock-mobile-entry-help/,'The mobile add-product screen must provide the requested minimal header');
assert.match(source,/function renderInventoryMobileEntry\(\)[\s\S]*?1\. Nhập liệu[\s\S]*?2\. Thông tin chính[\s\S]*?3\. Giá &amp; Thời gian[\s\S]*?4\. Ảnh &amp; Hóa đơn/,'The mobile entry screen must use exactly four primary sections');
assert.match(source,/function inventoryMobileEntryField\([\s\S]*?data-inventory-draft=/,'Mobile entry fields must preserve the original draft binding');
assert.match(source,/function inventoryMobileEntryAttribute\([\s\S]*?data-inventory-attr=/,'Mobile lamp attributes must preserve the original attribute binding');
assert.match(source,/function renderInventoryMobileEntry\(\)[\s\S]*?id="stockImportQuotation"[\s\S]*?id="stockPhoto"[\s\S]*?stockInvoice[\s\S]*?stockSaleInvoice[\s\S]*?id="stockAdd"/,'The redesigned entry screen must preserve import, upload and save hooks');
assert.match(source,/minmin-stock-entry-attributes[\s\S]*?<summary>Thuộc tính đèn<\/summary>/,'Lamp attributes must use a collapsed native accordion');
assert.match(source,/minmin-stock-entry-footer[\s\S]*?data-stock-mobile-cancel[\s\S]*?id="stockAdd"/,'The mobile entry screen must keep cancel and save actions in a sticky footer');
assert.match(source,/data-stock-mobile-save[\s\S]*?document\.getElementById\('stockAdd'\)\?\.click\(\)/,'The top import action must delegate saving to the original inventory handler');
assert.match(source,/data-stock-mobile-add[\s\S]*?state\.ui\.stockMobileEntry=true[\s\S]*?render\(\{force:true\}\)/,'The mobile add-product button must open the entry screen');
assert.match(source,/if\(back\.dataset\.stockMobileBack==='entry'\)state\.ui\.stockMobileEntry=false/,'The mobile entry screen back button must return to inventory');
assert.match(source,/state\.ui\.stockSearch='';\s*state\.ui\.stockMobileEntry=false;/,'A successful inventory entry must return mobile users to the product list');
assert.match(source,/document\.addEventListener\('click',event=>\{[\s\S]*?data-stock-mobile-back[\s\S]*?data-stock-mobile-open[\s\S]*?data-stock-mobile-search-go/,'Mobile inventory controls must be wired through delegated click handling');
assert.match(source,/matches\.find\(el=>el\.offsetParent!==null\)\|\|matches\[0\]/,'Stock actions must read quantity from the visible mobile or desktop input');
assert.match(source,/data-stock-mobile-filter-row[\s\S]*?data-stock-mobile-stage[\s\S]*?data-stock-mobile-search/,'Mobile inventory rows must expose searchable stage metadata');
assert.match(source,/document\.addEventListener\('input',event=>\{[\s\S]*?data-stock-mobile-search[\s\S]*?applyInventoryMobileFilters\(search\.value\)/,'Typing must apply the mobile inventory filter immediately');
assert.match(source,/function applyInventoryMobileFilters\([\s\S]*?row\.hidden=!show[\s\S]*?data-stock-mobile-filter-empty/,'Live mobile filtering must hide nonmatches and show a proper empty state');

console.log('Inventory mobile menu and product detail checks passed.');
