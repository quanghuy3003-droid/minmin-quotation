import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/uploadedUrls=\[\][\s\S]*?next=\[\.\.\.uploadedUrls,\.\.\.next\.filter\(url=>!uploadedUrls\.includes\(url\)\)\]/,'New phone uploads must be inserted at the start of the gallery');
assert.match(source,/function minminPrioritizeNewWebsiteGallery\(item\)[\s\S]*?drive\\\.google\\\.com\|googleusercontent\\\.com\|supabase\\\.co[\s\S]*?item\.gallery_image_urls=ordered/,'Existing fresh cloud uploads must move ahead of older Woo images before synchronization');
assert.match(source,/item=minminPrioritizeNewWebsiteGallery\(item\);/,'Single-product sync must apply the visible-first gallery order');

console.log('website new image order tests passed');
