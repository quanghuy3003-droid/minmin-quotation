import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const marker='/* MINMIN LABEL MODULE 2026-07-25';
const start=source.indexOf(marker);
assert.notEqual(start,-1,'Label module marker is missing');
const label=source.slice(start);

test('Label is a first-class navigation tab and cross-device working-state domain',()=>{
  assert.match(label,/data-tab="label"/);
  assert.match(label,/<span>Label<\/span>/);
  assert.match(label,/closest\?\.\('\[data-tab="label"\]'\)/);
  assert.match(label,/state\.activeTab='label'/);
  assert.match(source,/new Set\(\[[^\]]*'label'[^\]]*\]\)/);
  assert.match(label,/const previousBindLabel=bind/);
  assert.match(label,/function renderLabelView\(\)\{\s*state\.activeTab='label'/);
  assert.match(source,/label:\s*typeof labelStateSnapshot/);
  assert.match(source,/label:\['label'\]/);
  assert.match(source,/scheduleWorkingStateSave\(450,'label'\)/);
});

test('Label reads inventory data and supports choosing the product image',()=>{
  assert.match(label,/function labelInventoryItems\(\)/);
  assert.match(label,/filter\(item=>!isInventoryDeleted\(item\)\)/);
  assert.match(label,/function labelDraftFromInventory/);
  assert.match(label,/data-label-open-picker/);
  assert.match(label,/data-label-pick-code/);
  assert.match(label,/data-label-photo-option/);
  assert.match(label,/featured_image_url/);
  assert.match(label,/gallery_image_urls/);
});

test('the carton label preserves the fixed template wording',()=>{
  for(const text of [
    'TÊN HÀNG',
    'MODEL',
    'THÔNG SỐ KỸ THUẬT',
    'Chất liệu:',
    'Kích thước:',
    'XUẤT XỨ',
    'Trung Quốc',
    'NHÀ SẢN XUẤT',
    'ĐƠN VỊ NHẬP KHẨU &amp; PHÂN PHỐI',
    'Công ty TNHH Minmin Lifestyle',
    'Địa chỉ 27/32 Nguyễn Công Hoan,',
    'P.Cầu Kiệu, TP.HCM',
    'CẢNH BÁO / LƯU Ý',
    '.Lắp đặt bởi người có chuyên môn',
    '.Ngắt điện trước khi lắp đặt',
    '.Tránh nơi ẩm ướt',
    'THANKS FOR CHOOSING',
    'FRAGILE',
  ])assert.ok(label.includes(text),`Missing fixed label text: ${text}`);
});

test('variable data is editable in both fields and the live preview',()=>{
  for(const field of ['productName','model','material','dimension','manufacturer']){
    assert.ok(label.includes(`data-label-field="${field}"`)||label.includes('data-label-field="${key}"'));
  }
  assert.match(label,/contenteditable="true"/);
  assert.match(label,/data-label-inline/);
  assert.match(label,/data-label-preview-value/);
  assert.match(label,/querySelectorAll\(`\[data-label-preview-value=/);
});

test('saved templates retain edits until the user requests an inventory refresh',()=>{
  assert.match(label,/savedByProduct/);
  assert.match(label,/labelDraftFromInventory\(item,saved,false\)/);
  assert.match(label,/labelDraftFromInventory\(item,label\.draft\)/);
  assert.match(label,/data-label-save-template/);
  assert.match(label,/data-label-refresh/);
});

test('preview and output use four label pairs on one A4 landscape sheet',()=>{
  assert.match(label,/Array\.from\(\{length:4\}/);
  assert.match(label,/grid-template-columns:repeat\(2,1fr\)/);
  assert.match(label,/grid-template-rows:repeat\(2,1fr\)/);
  assert.match(label,/aspect-ratio:297\/210/);
  assert.match(label,/orientation:'landscape'/);
  assert.match(label,/format:'a4'/);
  assert.match(label,/pdf\.addImage\([^;]*297,210/);
  assert.match(label,/@page\{size:A4 landscape;margin:0\}/);
  assert.match(label,/window\.print\(\)/);
});

test('PDF image loading has a finite wait and product labels can be exported or printed',()=>{
  assert.match(label,/Promise\.race\(\[pending,new Promise\(resolve=>setTimeout\(resolve,15000\)\)\]\)/);
  assert.match(label,/data-label-export-pdf/);
  assert.match(label,/data-label-print/);
  assert.match(label,/vendor\/html2canvas\.min\.js/);
  assert.match(label,/vendor\/jspdf\.umd\.min\.js/);
});
