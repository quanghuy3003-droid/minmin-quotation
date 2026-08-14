import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const extract = (name, next) => {
  const pattern = new RegExp(`function ${name}\\([\\s\\S]*?(?=function ${next}\\()`);
  const match = source.match(pattern);
  assert.ok(match, `Missing ${name}`);
  return match[0];
};

const definitions = [
  extract('inputInvoiceMatchText', 'inputInvoiceLineNeedsInventoryMatch'),
  extract('inputInvoiceLineNeedsInventoryMatch', 'inputInvoiceNeedsItemImages'),
  extract('inputInvoiceNeedsItemImages', 'inputInvoiceItemsEditor')
].join('\n');
const sandbox = {};
vm.runInNewContext(definitions, sandbox);

const bulb = { item_name: 'Bóng MAS LEDBulb DT 3.4-40W', quantity: 10 };
const bulbInvoice = { category: 'Chi phí khác', items: [bulb] };
assert.equal(sandbox.inputInvoiceLineNeedsInventoryMatch(bulbInvoice, bulb), true, 'Physical LED bulbs must be matchable even when the invoice category is wrong');
assert.equal(sandbox.inputInvoiceNeedsItemImages(bulbInvoice), true, 'A bulb line must enable the inventory picker for its invoice');

const service = { item_name: 'Chi phí dịch vụ phần mềm và bảo trì' };
const mixedInvoice = { category: 'Chi phí khác', items: [bulb, service] };
assert.equal(sandbox.inputInvoiceLineNeedsInventoryMatch(mixedInvoice, service), false, 'Service lines must remain outside inventory matching');

assert.match(source, /const lineCanMatch=inputInvoiceLineNeedsInventoryMatch\(inv,item\);[\s\S]*?\$\{lineCanMatch\?`<button data-input-invoice-stock-picker=/, 'The drawer must decide inventory matching per invoice line');
assert.match(source, /function inventoryEligibleForInboundInvoiceMatch\(item\)\{ return \['reserve','order'\]\.includes\(item\?\.itemKind\)&&inventoryStage\(item\)\.key==='stock'; \}/, 'The picker must still show only VAT inventory that is currently in stock');

console.log('Input invoice bulb matching checks passed.');
