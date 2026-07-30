import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

function section(start,end){
  const from=html.indexOf(start);
  const to=html.indexOf(end,from+start.length);
  assert.notEqual(from,-1,`Missing section: ${start}`);
  assert.notEqual(to,-1,`Missing section end: ${end}`);
  return html.slice(from,to);
}

assert.match(html,/const WORKING_STATE_SYNC_INTERVAL_MS=30000/,'Cross-device polling must keep the reduced-bandwidth interval');
assert.match(
  section('async function syncAppInBackground','window.__minminBackgroundSync'),
  /includeChildData=options\.includeChildData!==false/,
  'Fast working-state pulls must be able to skip heavy table syncs'
);
assert.match(
  section('function initWorkingStateBridge','async function saveInventoryItemRemote'),
  /BroadcastChannel\('minmin-working-state-v1'\)/,
  'Tabs on one device must receive immediate save notifications'
);
for(const eventName of ['visibilitychange','focus','online','pagehide']){
  assert.match(
    section('function initWorkingStateBridge','async function saveInventoryItemRemote'),
    new RegExp(`['"]${eventName}['"]`),
    `Sync bridge must handle ${eventName}`
  );
}

const saver=section('function scheduleWorkingStateSave','function inputInvoiceToSupabaseRow');
assert.match(saver,/workingStateDirtyDomains/,'Local unsaved content must be protected from remote pulls');
assert.match(saver,/mergeWorkingStateForSave/,'A save must merge its changed module with the latest remote snapshot');
assert.match(saver,/fetchWorkingStateFromSupabase/,'A save must check the latest remote snapshot before writing');
assert.match(saver,/updated_at=eq\./,'Concurrent saves must use an optimistic version check');
assert.match(saver,/attempt<3/,'A conflicting save must refetch and retry its merge');
assert.match(saver,/notifyWorkingStatePeers/,'Successful saves must notify other open tabs');

const apply=section('function applyWorkingStateSnapshot','async function fetchWorkingStateFromSupabase');
assert.match(apply,/preserveDeviceUi=options\.preserveDeviceUi!==false/,'Remote content must not replace device navigation state');
assert.match(apply,/data\.activeTab&&!preserveDeviceUi/,'Phone and desktop may keep independent active tabs');

assert.match(html,/scheduleWorkingStateSave\(450,'quote'\)/,'Quotation changes must be tagged for merge');
assert.match(html,/scheduleWorkingStateSave\(450,'inventory'\)/,'Inventory changes must be tagged for merge');
assert.match(html,/scheduleWorkingStateSave\(450,'accounting'\)/,'Accounting changes must be tagged for merge');
assert.match(html,/scheduleWorkingStateSave\(450,'website'\)/,'Website changes must be tagged for merge');

console.log('Cross-device working-state sync regression checks passed.');
