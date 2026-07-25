import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function websiteMobileDashboard\(\)/,'Website mobile must have a dashboard');
assert.match(source,/Tổng sản phẩm[\s\S]*Đã đăng[\s\S]*Thiếu dữ liệu/,'Dashboard must show website status totals');
assert.match(source,/Đồng bộ ngay[\s\S]*Tạo sản phẩm mới[\s\S]*Danh sách sản phẩm[\s\S]*Cài đặt Website/,'Dashboard must expose the four primary website workflows');
assert.match(source,/function websiteMobileList\(\)/,'Website mobile must have a product list');
assert.match(source,/data-website-mobile-search[\s\S]*data-website-mobile-status[\s\S]*data-website-mobile-detail/,'Product list must support search, status filters and details');
assert.match(source,/data-website-mobile-view="dashboard"[\s\S]*minmin-website-home-button[\s\S]*websiteMobileIcon\('home'\)/,'Product list must provide a home control back to the Website dashboard');
assert.match(source,/const syncBadge=fullySynced\?[\s\S]*minmin-website-sync-check[\s\S]*Đã đồng bộ/,'Only fully synchronized products may show a green synchronized check marker');
assert.match(source,/function websiteMobileDetail\(\)/,'Website mobile must have a product detail screen');
assert.match(source,/Thông tin[\s\S]*Ảnh[\s\S]*Thuộc tính[\s\S]*Xem trước/,'Product detail must provide the reference tabs');
assert.match(source,/function websiteMobileWizard\(\)/,'Website mobile must have a product wizard');
assert.match(source,/websiteMobileStep[\s\S]*Math\.min\(4/,'Product wizard must use four bounded steps');
assert.match(source,/data-website-mobile-featured[\s\S]*data-website-mobile-gallery/,'Image step must support featured and gallery uploads');
assert.match(source,/function websiteMobileSettings\(\)/,'Website mobile must have WooCommerce settings');
assert.match(source,/Website URL[\s\S]*Consumer Key[\s\S]*Consumer Secret[\s\S]*Kiểm tra kết nối/,'Settings must preserve WooCommerce connection controls');
assert.match(source,/Tự động đồng bộ[\s\S]*Đồng bộ ảnh[\s\S]*Không gửi danh mục trống/,'Settings must include synchronization switches');
assert.match(source,/const renderWithWebsiteMobile=render;[\s\S]*mountWebsiteMobile\(\)/,'Mobile website must layer over the existing desktop renderer');
assert.match(source,/section\.classList\.add\('minmin-website-desktop-view'\)/,'Existing desktop website view must be retained');
assert.match(source,/minminUploadAllWooSuperFast[\s\S]*includeImages/,'Mobile sync must reuse the existing WooCommerce pipeline');
assert.match(source,/websiteSaveProduct\(\)/,'Mobile wizard must reuse the existing save behavior');
assert.match(source,/data-minmin-mobile-auto-name[\s\S]*Tự đặt tên và mã/,'Mobile wizard must expose the desktop auto-name workflow');
assert.match(source,/data-minmin-mobile-auto-name[\s\S]*websiteAutoNameProduct\(\)/,'Mobile auto-name must reuse the existing desktop logic');

console.log('website-misa-mobile: ok');
