import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/body:has\(\.minmin-stock-mobile-view\) \.minmin-app-logo,[\s\S]*?body:has\(\.minmin-stock-mobile-view\) \.minmin-main-nav[\s\S]*?display: none !important/,'Mobile inventory must replace the global header with its own back toolbar');
assert.match(source,/\.minmin-stock-mobile-item\s*\{[\s\S]*?grid-template-columns: 104px minmax\(0, 1fr\) 44px/,'Mobile inventory products must use a compact image, information and action row');
assert.match(source,/function renderInventoryMobileView\(\)[\s\S]*?data-stock-mobile-back="tab"[\s\S]*?data-stock-mobile-category[\s\S]*?data-stock-mobile-search/,'Mobile inventory needs back, category and search controls');
assert.match(source,/function inventoryMobileListItem\(item\)[\s\S]*?item\.photoDataUrl[\s\S]*?item\.code[\s\S]*?money\(finance\.sell\)[\s\S]*?Number\(item\.quantity\|\|0\)/,'Every mobile product row must show image, code, price and stock quantity');
assert.match(source,/function inventoryMobileDetailView\(item\)[\s\S]*?data-stock-mobile-back="detail"[\s\S]*?minmin-stock-mobile-hero[\s\S]*?inventoryCompactDates\(item\)[\s\S]*?data-stock-out/,'The product detail view must provide back navigation, a large image, dates and stock actions');
assert.match(source,/const renderInventoryTabDesktop = renderInventoryTab;[\s\S]*?minmin-stock-desktop-view[\s\S]*?renderInventoryMobileView\(\)/,'Desktop inventory must remain available beside the dedicated mobile renderer');
assert.match(source,/document\.addEventListener\('click',event=>\{[\s\S]*?data-stock-mobile-back[\s\S]*?data-stock-mobile-open[\s\S]*?data-stock-mobile-search-go/,'Mobile inventory controls must be wired through delegated click handling');
assert.match(source,/matches\.find\(el=>el\.offsetParent!==null\)\|\|matches\[0\]/,'Stock actions must read quantity from the visible mobile or desktop input');

console.log('Inventory mobile menu and product detail checks passed.');
