import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(source,/function quoteMobileProductRows\(\)[\s\S]*?data-quote-inline-code="\$\{esc\(line\.uid\)\}"/,'Mobile quote rows must expose the product code for direct editing');
assert.match(source,/function mmQuoteExactDashboard\(\)[\s\S]*?data-quote-inline-code="\$\{esc\(line\.uid\)\}"/,'Desktop quote rows must expose the product code for direct editing');
assert.match(source,/function beginQuoteInlineCodeEdit\(/,'The shared inline product-code editor must be available on both layouts');
assert.match(source,/line\.codeCustom=!!next[\s\S]*?line\.codePartsTouched=true/,'Direct code edits must be preserved as manual product codes');
assert.match(source,/event\.key==='Enter'[\s\S]*?event\.key==='Escape'/,'The inline editor must support keyboard save and cancel');
