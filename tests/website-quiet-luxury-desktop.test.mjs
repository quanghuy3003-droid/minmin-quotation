import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/MINMIN WEBSITE DESKTOP 2026-07-26/,'Website must include the Quiet Luxury desktop renderer');
assert.match(source,/function mmwConnection\(\)[\s\S]*Consumer Key[\s\S]*Consumer Secret[\s\S]*Đồng bộ nhanh/,'WooCommerce connection must remain compact and keep existing controls');
assert.match(source,/function mmwKpis\(\)[\s\S]*Tổng sản phẩm[\s\S]*Đủ dữ liệu[\s\S]*Đang thiếu dữ liệu[\s\S]*Cần kiểm tra \/ Có thay đổi/,'Website must expose four uniform KPI cards');
assert.match(source,/function mmwFilters\(\)[\s\S]*data-mmw-filter="search"[\s\S]*status[\s\S]*category[\s\S]*missing[\s\S]*data-mmw-advanced/,'Desktop filters must stay on the compact Website toolbar');
assert.match(source,/function mmwTable\(\)[\s\S]*Ảnh[\s\S]*Sản phẩm[\s\S]*SKU \/ Stock[\s\S]*Trạng thái Website[\s\S]*Mức độ dữ liệu[\s\S]*Đồng bộ[\s\S]*Thao tác/,'Website products must render in the modern data table');
assert.match(source,/<header class="mmw-hero" data-mm-desktop-hero>/,'The new Website hero must suppress the legacy duplicate desktop heading');
assert.match(source,/\.mmw-page\{[\s\S]*?max-width:1336px!important[\s\S]*?margin:0 auto!important/,'Website desktop content must use the same centered width as the other desktop tabs');
assert.match(source,/function mmwDrawer\(\)[\s\S]*Thông tin[\s\S]*Media[\s\S]*Attributes[\s\S]*Website \/ SEO[\s\S]*Đồng bộ[\s\S]*Lịch sử/,'Product editing must use the six-tab right drawer');
assert.match(source,/data-mmw-save-draft[\s\S]*data-mmw-close[\s\S]*data-mmw-complete/,'Drawer must keep its sticky draft, cancel and complete footer actions');
assert.match(source,/if\(window\.matchMedia\?\.\('\(max-width: 767px\)'\)\.matches\)return mmwWebsiteBase/,'Mobile Website UI must delegate to the existing renderer');
assert.match(source,/websiteImagesPanel\(\)[\s\S]*websiteSimpleAttributeFields\(\)[\s\S]*data-website-upload-woo/,'Drawer must reuse the existing media, attribute and sync pipelines');
assert.match(source,/\.mmw-drawer\{[\s\S]*width:min\(580px,96vw\)[\s\S]*animation:mmwSlideIn \.23s ease/,'Drawer must use the requested desktop width and subtle transition');

console.log('website quiet luxury desktop tests passed');
