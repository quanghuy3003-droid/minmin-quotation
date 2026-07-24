import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('mobile product sync always sends the current images',()=>{
  assert.match(
    source,
    /data-website-mobile-sync-one[\s\S]*Đồng bộ toàn bộ nội dung, danh mục và hình ảnh[\s\S]*Đồng bộ sản phẩm[\s\S]*uploadWebsiteProductToWoo\(id,\{includeImages:true,includeCategories:true\}\)/,
    'single-product mobile sync must include all content, categories and images',
  );
  assert.match(
    source,
    /data-website-mobile-sync[\s\S]*minminUploadAllWooSuperFast\(\{includeImages:true,forceImages:true\}\)/,
    'dashboard sync must repair legacy products whose images were never sent',
  );
});

test('image edits are tracked independently from text synchronization',()=>{
  for(const marker of [
    'imageUpdatedAt',
    'wooImageSyncedAt',
    'wooImageSignature',
    'function websiteImagesNeedSync',
    "wooStatus:p.wooProductId?'Chưa đồng bộ ảnh':''",
  ]) assert.ok(source.includes(marker),`missing ${marker}`);
  assert.match(source,/function minminWooNeedsUpload\(p\)[\s\S]*websiteImagesNeedSync\(x\)/);
});

test('WooCommerce response is validated before the app reports image success',()=>{
  assert.match(source,/const categoryIds=includeCategories&&item\.category\?await websiteWooCategoryIds\(item\.category\):\[\]/);
  assert.match(source,/minminWooFastPayload\(item, \{includeImages, includeCategories, categoryIds\}\)/);
  assert.match(
    source,
    /includeImages && payload\.images\?\.length[\s\S]*WooCommerce đã nhận dữ liệu chữ nhưng chưa nhận được ảnh/,
  );
  assert.match(
    source,
    /wooImageSyncedAt:syncedAt,wooImageSignature:websiteImageSignature\(item\)/,
  );
});

test('mobile synchronization badge cannot report a pending image as synchronized',()=>{
  assert.match(source,/const pendingImages=websiteImagesNeedSync\(p\)/);
  assert.match(source,/function websiteProductFullySynced\(product\)/);
  assert.match(source,/const syncBadge=fullySynced\?/);
  assert.match(source,/Chưa đồng bộ ảnh/);
  assert.match(source,/!fullySynced\?'Chưa đồng bộ'/);
});

test('phone uploads are cropped and compressed to a 900 square',()=>{
  assert.match(source,/function cropFeaturedImageToSquare\(dataUrl,size=900,quality=0\.82\)/);
  assert.match(source,/uploadWebsiteFeatured\(featured\.files\[0\],\{size:900,quality:0\.82\}\)/);
  assert.match(source,/uploadWebsiteGallery\(gallery\.files,\{square:true,size:900,quality:0\.82\}\)/);
  assert.match(source,/Ảnh chụp điện thoại được tự động crop vuông và nén còn 900×900/);
});

test('mobile synchronization exposes product and batch percentages',()=>{
  assert.match(source,/function websiteMobileSyncProgressPanel\(\)/);
  assert.match(source,/websiteMobileSyncProgress:\s*Math\.max/);
  assert.match(source,/Đang đồng bộ \$\{progress\}%/);
  assert.match(source,/minmin-website-product-progress/);
  assert.match(source,/Đang đồng bộ \$\{overallBefore\}%/);
  assert.match(source,/const finished=processed>=items\.length, finalProgress=/);
  assert.match(source,/setWebsiteMobileSyncProgress\(\{active:false,progress:finalProgress/);
});
