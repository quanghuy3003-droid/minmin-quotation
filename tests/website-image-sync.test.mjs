import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('mobile product sync always sends the current images',()=>{
  assert.match(
    source,
    /data-website-mobile-sync-one[\s\S]*uploadWebsiteProductToWoo\(id,\{includeImages:true\}\)/,
    'single-product mobile sync must include images',
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
  assert.match(source,/const syncBadge=published&&!pendingImages&&!error/);
  assert.match(source,/Chờ đồng bộ ảnh/);
});

