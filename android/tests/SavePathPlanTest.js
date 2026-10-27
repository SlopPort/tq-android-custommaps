const assert = require('assert'), fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../bootstrap/plan-save-path.js'), 'utf8'), ctx);
const live = '/external/Preferences/SaveData', profile = '/private/profiles/test/SaveData';
const plan = p => ctx.tqPlanSavePath(live, profile, p);
for (const relative of ['', '/Main/Hero/Player.chr', '/Main/Hero/Backup/Player.chr',
    '/Sys/winsys.dxg', '/Sys/winsys.dxb', '/Sys/0miscsys.dxg', '/Sys/2miscsys.dxb',
    '/Sys/Main/winsys.dxg', '/Sys/Main/winsys.dxb', '/Sys/Main/0miscsys.dxg',
    '/Sys/Main/1miscsys.dxb']) {
  const result = plan(live + relative);
  assert.equal(result.kind, 'redirect');
  assert.equal(result.target, profile + relative);
  assert.equal(plan(result.target).kind, 'already-profile');
}
assert.equal(plan(live + '//Sys///Main/winsys.dxg').target, profile + '/Sys/Main/winsys.dxg');
// Root shape observed on build 5364; synthetic destination, no device I/O.
const observed = '/storage/emulated/0/Android/data/com.hg.titanquestultimate/files/Preferences/SaveData/';
assert.equal(ctx.tqPlanSavePath(observed, profile + '/', observed).target, profile);
assert.equal(ctx.tqPlanSavePath(observed, profile, observed + 'Main/Hero/Player.chr').target,
    profile + '/Main/Hero/Player.chr');
for (const p of [live + 'Other/file', '/elsewhere/file', live + '/../file',
    live + '/./file', live + '/bad\0file', live + '\\Main', 'relative', null,
    live + '/' + 'x'.repeat(4096)]) assert.throws(() => plan(p));
assert.throws(() => ctx.tqPlanSavePath(live, live, live), /Overlapping/);
assert.throws(() => ctx.tqPlanSavePath(live, live + '/nested/SaveData', live), /Overlapping/);
assert.throws(() => ctx.tqPlanSavePath(live, '/private/profile', live), /SaveData/);
console.log('PASS: character, backup and shared-storage path plans; idempotence and escape refusals');
