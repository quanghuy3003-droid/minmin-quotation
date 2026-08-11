import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const source=await readFile(new URL('../index.html',import.meta.url),'utf8');
assert.match(source,/fetch\(`\/api\/app-version\?ts=\$\{Date\.now\(\)\}`,[\s\S]*?cache:'no-store'/,'The app version request must bypass browser caches');
assert.match(source,/previous&&previous!==current[\s\S]*?location\.reload\(\)/,'A changed deployment must refresh an already-open mobile tab');
assert.match(source,/addEventListener\('pageshow'/,'Returning to a cached mobile page must check the deployment');
assert.match(source,/visibilitychange[\s\S]*?visibilityState==='visible'[\s\S]*?checkAppDeploymentVersion/,'A visible mobile tab must check the deployment');

const require=createRequire(import.meta.url);
const handler=require(fileURLToPath(new URL('../api/app-version.js',import.meta.url)));
const previousSha=process.env.VERCEL_GIT_COMMIT_SHA;
process.env.VERCEL_GIT_COMMIT_SHA='test-commit-sha';
const response={
  statusCode:200,
  headers:{},
  setHeader(key,value){this.headers[key]=value;},
  status(code){this.statusCode=code; return this;},
  json(body){this.body=body; return this;}
};
await handler({method:'GET'},response);
if(previousSha===undefined)delete process.env.VERCEL_GIT_COMMIT_SHA;
else process.env.VERCEL_GIT_COMMIT_SHA=previousSha;

assert.equal(response.statusCode,200);
assert.equal(response.body?.version,'test-commit-sha');
assert.match(response.headers['Cache-Control'],/no-store/);

console.log('App deployment refresh checks passed.');
