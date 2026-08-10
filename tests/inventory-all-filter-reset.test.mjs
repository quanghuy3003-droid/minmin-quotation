import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(
  source,
  /const stockFilter=event\.target\.closest\?\.\('\[data-mm-stock-exact-filter\]'\);[\s\S]*?if\(ui\.filter==='all'\)\{[\s\S]*?ui\.category='all';[\s\S]*?ui\.review='all';/,
  'The All inventory tab must clear category and data filters so sold-out products remain visible',
);

console.log('inventory all-filter reset tests passed');
