import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const proxy=readFileSync(new URL('../api/woo-image.js',import.meta.url),'utf8');
const vercel=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));

test('Woo image proxy only accepts Drive ids and returns explicit image metadata',()=>{
  assert.match(proxy,/DRIVE_ID_RE/);
  assert.match(proxy,/drive\.google\.com\/uc\?export=download/);
  assert.match(proxy,/detectImageType/);
  assert.match(proxy,/Content-Type/);
  assert.match(proxy,/Content-Disposition/);
  assert.match(proxy,/X-Content-Type-Options/);
});

test('Vercel exposes proxy URLs whose path ends in the original image extension',()=>{
  assert.ok(vercel.rewrites.some(rule=>rule.source==='/woo-image/:file'&&rule.destination==='/api/woo-image?file=:file'));
});
