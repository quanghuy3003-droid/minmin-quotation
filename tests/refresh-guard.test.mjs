import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const appPath=new URL('../index.html',import.meta.url);
const mirrorPath=new URL('../../index.html',import.meta.url);
const [html,mirror]=await Promise.all([
  readFile(appPath,'utf8'),
  readFile(mirrorPath,'utf8').catch(error=>{
    if(error?.code==='ENOENT')return null;
    throw error;
  })
]);

function section(start,end){
  const from=html.indexOf(start);
  const to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing section: ${start}`);
  assert.notEqual(to,-1,`Missing section end: ${end}`);
  return html.slice(from,to);
}

if(mirror!=null)assert.equal(mirror,html,'The root app and repository app must stay identical');
assert.doesNotMatch(
  html,
  /setInterval\([^\n]*loadWorkingStateFromSupabase\(\)\.then\(\(\)=>render\(\)\)/,
  'Background polling must never force a render on every interval'
);

const coordinator=section('async function syncAppInBackground','async function saveInventoryItemRemote');
assert.match(coordinator,/backgroundSyncInFlight/,'Background sync must be single-flight');
assert.match(coordinator,/appHasActiveEditor\(\)/,'Background sync must yield while the user is editing');
assert.match(coordinator,/silent:true/,'Child sync jobs must not render independently');
assert.match(coordinator,/if\(changed\)render\(\)/,'Background sync may render once only after real data changes');

for(const [name,end] of [
  ['syncInputInvoicesFromSupabase','async function saveInputInvoiceRemote'],
  ['syncAccountingFromSupabase','async function saveOutgoingInvoiceRemote'],
  ['syncInventoryFromSupabase','async function syncAppInBackground']
]){
  const body=section(`async function ${name}`,end);
  assert.match(body,/silent=!!options\.silent/,`${name} must support silent background mode`);
  assert.match(body,/backgroundSyncShouldYield\(activityToken\)/,`${name} must not overwrite active edits`);
  assert.match(body,/return changed/,`${name} must report whether data really changed`);
}

const workingStateLoader=section('async function loadWorkingStateFromSupabase','function scheduleWorkingStateSave');
assert.match(workingStateLoader,/remoteVersion<=workingStateRemoteVersion/,'Unchanged working state must not be reapplied');

const init=section('async function initApp','/* MINMIN PATCH 2026-07-01E2');
assert.match(init,/syncAppInBackground\(\{force:true,includeWorkingState:false\}\)/,'Initial child syncs must be coordinated');
assert.match(init,/BACKGROUND_SYNC_INTERVAL_MS/,'Periodic sync must use the guarded coordinator');

console.log('Refresh guard regression checks passed.');
