import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
const appsScript=await readFile(new URL('google-drive-upload.gs',root),'utf8');
const api=await readFile(new URL('api/drive-state.js',root),'utf8');

assert.match(html,/enableGoogleDriveStateSync/);
assert.match(html,/const DRIVE_STATE_API='\/api\/drive-state'/);
assert.match(html,/action:'state\.get'/);
assert.match(html,/action:'state\.put'/);
assert.match(html,/expectedVersion:options\.skipRemoteMerge\?'':\(remoteRow\?\.version\|\|''\)/);
assert.match(html,/syncInventoryFromSupabase=syncDriveNow/);
assert.match(html,/syncInputInvoicesFromSupabase=syncDriveNow/);
assert.match(html,/syncAccountingFromSupabase=syncDriveNow/);
assert.match(html,/Đã đồng bộ dữ liệu giữa các máy qua Google Drive/);

assert.match(appsScript,/payload\.action === "state\.get"/);
assert.match(appsScript,/payload\.action === "state\.put"/);
assert.match(appsScript,/MINMIN_STATE_FILE = "minmin-current-state\.json"/);
assert.match(appsScript,/expectedVersion && current/);
assert.match(appsScript,/file\.setContent\(content\)/);
assert.match(appsScript,/MINMIN_BACKUP_FOLDER = "Weekly Backups"/);
assert.match(appsScript,/Utilities\.formatDate\(date, timeZone, "yyyy\.MM\.dd"\)/);
assert.match(appsScript,/`\$\{dateKey\}-\$\{MINMIN_BACKUP_BASENAME\}\.zip`/);
assert.match(appsScript,/Utilities\.zip\(\[stateBlob, infoBlob\], fileName\)/);
assert.match(appsScript,/backup = ensureWeeklyBackup_\(record\)/);
assert.match(appsScript,/function createWeeklyBackupNow\(\)/);
const stateSection=appsScript.slice(appsScript.indexOf('function stateFile_'),appsScript.indexOf('function parseDataUrl_'));
assert.doesNotMatch(stateSection,/setSharing\(/,'The private state file must not be shared publicly');

assert.match(api,/Cache-Control", "no-store"/);
assert.match(api,/\["state\.get", "state\.put"\]/);
assert.match(api,/DRIVE_UPLOAD_TOKEN/);
assert.match(api,/req\.method !== "GET" && \(!origin \|\| !allowedOrigin\(origin\)\)/);

const require=createRequire(import.meta.url);
const handler=require(fileURLToPath(new URL('api/drive-state.js',root)));
const response={
  statusCode:200,
  headers:{},
  setHeader(key,value){this.headers[key]=value;},
  status(code){this.statusCode=code; return this;},
  json(body){this.body=body; return this;},
  end(){return this;}
};
await handler({method:'GET',headers:{}},response);
assert.equal(response.statusCode,200);
assert.equal(response.body?.provider,'google-drive');
assert.equal(response.body?.stateSync,true);
assert.equal(response.body?.configured,false);

console.log('Google Drive state sync regression checks passed.');
