import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function websiteFreshProductUrl\(productOrUrl\)[\s\S]*?url\.searchParams\.set\('minmin_refresh'/,'Public product links must bypass stale WordPress page caches');
assert.match(source,/product\.websitePublicRefreshAt=String\(raw\.websitePublicRefreshAt\|\|''\)/,'The latest public refresh timestamp must survive cross-device normalization');
assert.match(source,/wooImageSyncedAt:syncedAt[\s\S]*?websitePublicRefreshAt:syncedAt/,'A confirmed Woo image sync must refresh the public product link version');
assert.match(source,/const productUrl=websiteFreshProductUrl\(p\)/,'Mobile Website links must open the freshly synchronized product page');
assert.match(source,/url=websiteFreshProductUrl\(product\)/,'Desktop Website links must open the freshly synchronized product page');
assert.match(source,/images\.map\(url=>`<img src="\$\{esc\(driveAssetUrl\(url\)\)\}/,'Mobile image galleries must normalize Google Drive image URLs');

console.log('website public image cache tests passed');
