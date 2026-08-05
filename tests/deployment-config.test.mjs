import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url);
const config=JSON.parse(await readFile(new URL('vercel.json',root),'utf8'));
const ignore=await readFile(new URL('.vercelignore',root),'utf8');
const server=await readFile(new URL('server.mjs',root),'utf8');

assert.equal(config.framework,null,'Vercel framework auto-detection must stay disabled');
assert.deepEqual(Object.keys(config.functions),['api/drive-upload.js','api/image-proxy.js','api/drive-state.js','api/woo-image.js','api/excel-to-pdf.js']);
assert.ok(config.rewrites.some(rule=>rule.source==='/'&&rule.destination==='/index'));
assert.match(ignore,/^\/\*$/m,'Deployment must use a root allowlist');
assert.match(ignore,/^!\/index\.html$/m);
assert.match(ignore,/^!\/api\/$/m);
assert.match(ignore,/^!\/api\/excel-to-pdf\.js$/m);
assert.match(ignore,/^!\/api\/image-proxy\.js$/m);
assert.match(ignore,/^!\/api\/drive-state\.js$/m);
assert.match(ignore,/^!\/api\/woo-image\.js$/m);
assert.doesNotMatch(ignore,/^!\/?server\.mjs$/m,'The local HTTP server must never be deployed');
assert.doesNotMatch(server,/export\s*\{\s*server\s*\}/,'Local server must not look like a Vercel entrypoint');

const require=createRequire(import.meta.url);
const handler=require(fileURLToPath(new URL('../api/drive-upload.js',import.meta.url)));
const response={
  statusCode:200,
  headers:{},
  setHeader(key,value){this.headers[key]=value;},
  status(code){this.statusCode=code; return this;},
  json(body){this.body=body; return this;},
  end(){return this;}
};
await handler({method:'GET'},response);
assert.equal(response.statusCode,200,'The Drive upload health check must initialize cleanly');
assert.equal(response.body?.ok,true);
assert.equal(response.body?.provider,'google-drive');
assert.equal(response.body?.configured,false);

console.log('Vercel deployment configuration checks passed.');
