import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const patch=source.slice(source.indexOf('/* MINMIN PATCH 2026-07-25: optimized website images'));

test('website images are optimized client-side without cropping or upscaling',()=>{
  assert.match(patch,/function minminOptimizeWebsiteImage\(file,options=\{\}\)/);
  assert.match(patch,/maxEdge\/Math\.max\(sourceWidth,sourceHeight\)/);
  assert.match(patch,/const scale=Math\.min\(1,/,'small images must not be enlarged');
  assert.match(patch,/context\.drawImage\(image,0,0,width,height\)/,'normal upload must preserve the full image');
  assert.match(patch,/type='image\/webp'/);
  assert.match(patch,/quality=Number\(options\.quality\|\|0\.83\)/);
  assert.match(patch,/type='image\/jpeg'/);
  assert.match(patch,/Number\(options\.jpegQuality\|\|0\.82\)/);
  assert.match(patch,/Đã tối ưu:[\s\S]*before[\s\S]*after/);
});

test('featured image and gallery expose all requested management actions',()=>{
  for(const marker of [
    'Cắt lại ảnh đại diện',
    'data-minmin-featured-remove',
    'data-minmin-gallery-feature',
    'data-minmin-gallery-remove',
    'data-minmin-image-preview',
    'draggable="true"',
    'minminReorderGallery',
    'minminFeatureGallery',
    'is-removing',
    '180',
  ])assert.ok(patch.includes(marker),`missing ${marker}`);
  assert.match(patch,/Dùng ảnh đầu tiên trong Gallery làm ảnh đại diện/);
  assert.match(patch,/if\(to===0\)return minminFeatureGallery\(source\)/);
  assert.match(patch,/@media\(max-width:767px\)[\s\S]*\.minmin-gallery-controls\{opacity:1\}/);
});

test('deleted synchronized images are retained as pending delete until Woo confirms images',()=>{
  assert.match(patch,/websitePendingDeleteUrls/);
  assert.match(patch,/function minminPendingDeletes/);
  assert.match(patch,/websitePendingDeleteUrls:minminPendingDeletes/);
  assert.match(patch,/JSON\.stringify\(\{images:urls\.map\(src=>\(\{src\}\)\)\}\)/);
  assert.match(patch,/wooImageSignature:websiteImageSignature\(item\),websitePendingDeleteUrls:\[\]/);
});

test('single product synchronization is full, step based and retryable',()=>{
  assert.match(patch,/steps=\[\.\.\.\(content&&item\.category\?\['categories'\]:\[\]\),\.\.\.\(content\?\['content'\]:\[\]\),\.\.\.\(images\?\['images'\]:\[\]\)\]/);
  assert.match(patch,/websiteSyncRetrySteps:steps\.slice\(index\)/);
  assert.match(patch,/retryOnly&&item\.websiteSyncRetrySteps\.length/);
  assert.match(patch,/minminWooFastPayload\(item,\{includeImages:false,includeCategories:true/);
  assert.match(patch,/body:JSON\.stringify\(\{images:urls\.map/);
  assert.match(patch,/Đồng bộ đầy đủ nội dung, thuộc tính, giá, ảnh đại diện và Gallery/);
});

test('every remote synchronization step has a finite timeout and contextual error',()=>{
  assert.match(patch,/function minminWebsiteWithTimeout/);
  assert.match(patch,/websiteWooCategoryIds\(item\.category\),30000/);
  assert.match(patch,/Cập nhật nội dung'\)/);
  assert.match(patch,/Tải \$\{urls\.length\} ảnh/);
  assert.match(patch,/Cập nhật nội dung thất bại/);
  assert.match(patch,/Không thể tải ảnh/);
});

test('batch synchronization is smart, sequential and preserves failures for retry',()=>{
  assert.match(patch,/filter\(product=>failedOnly\?failedOnly\.has\(String\(product\.id\)\):minminWebsiteNeedsSync\(product\)\)/);
  assert.match(patch,/for\(let index=0;index<products\.length;index\+\+\)/);
  assert.match(patch,/await minminSyncProduct\(products\[index\]\.id/);
  assert.match(patch,/failedIds\.push\(products\[index\]\.id\)/);
  assert.match(patch,/Thành công: \$\{ok\} · Thất bại: \$\{fail\}/);
  assert.match(patch,/data-minmin-retry-failed/);
});

test('product status and progress use completed real steps',()=>{
  for(const label of ['Chưa đồng bộ','Có thay đổi','Đang cập nhật nội dung','Đang tải ảnh','Hoàn tất','Lỗi']){
    assert.ok(patch.includes(label),`missing status ${label}`);
  }
  assert.match(patch,/wooProgress:Math\.round\(\(completed\/steps\.length\)\*100\)/);
  assert.match(patch,/Đã đồng bộ lúc \$\{esc\(last\)\}/);
  assert.match(patch,/button\.disabled=busy/);
});
