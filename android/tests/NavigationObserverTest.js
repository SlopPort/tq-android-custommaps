'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
function setup(missing) {
  let callbacks, hooks = 0, checked = 0, nativeCalls = 0;
  const pointer = (name, mesh) => ({ toString: () => name, isNull: () => name === '0', mesh });
  const nullMesh = pointer('0'), cold = pointer('cold'), ready = pointer('ready');
  const ctx = { Process: { arch: 'arm64', pointerSize: 8, id: 77 },
    NativeFunction: function (address) {
      return arg => { nativeCalls++; return address.includes('GetPathMesh') ? arg.mesh : arg === ready; };
    }, Interceptor: { attach: (_a, c) => { callbacks = c; hooks++; return {}; }, flush() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../bootstrap/navigation-observer.js'), 'utf8'), ctx);
  const gate = { address(_e, name) { checked++; if (checked === missing) throw Error('unverified'); return name; } };
  return { ctx, gate, pointer, nullMesh, cold, ready,
    counters: () => ({ hooks, checked, nativeCalls }),
    callbacks: () => callbacks };
}
for (const missing of [1, 2, 3]) {
  const s = setup(missing);
  assert.throws(() => s.ctx.tqObserveNavigation({}, s.gate), /unverified/);
  assert.equal(s.counters().hooks, 0);
}
const s = setup();
const observer = s.ctx.tqObserveNavigation({}, s.gate, 4), c = s.callbacks();
function enter(name, mesh, step) {
  const state = { threadId: 8 };
  c.onEnter.call(state, [s.pointer(name, mesh), { readS32: () => step }]);
  return state;
}
// Nested invocations must retain their own level and stage.
const outer = enter('outer', s.ready, 0), inner = enter('inner', s.cold, 1);
c.onLeave.call(inner); c.onLeave.call(outer);
c.onLeave.call(enter('absent', s.nullMesh, 2));
const bad = { threadId: 8 };
c.onEnter.call(bad, [s.pointer('bad', s.ready), { readS32() { throw Error('unreadable'); } }]);
c.onLeave.call(bad);
const callsBefore = s.counters().nativeCalls;
c.onLeave.call(enter('over-limit', s.ready, 4));
assert.equal(s.counters().nativeCalls, callsBefore);
const report = observer.snapshot();
assert.equal(report.entered, 5); assert.equal(report.completed, 3);
assert.equal(report.errors, 1); assert.equal(report.dropped, 1);
assert.deepEqual(Array.from(report.rows, r => [r.level, r.present, r.initialized]),
  [['inner', true, false], ['outer', true, true], ['absent', false, false]]);
report.rows[0].initialized = true;
assert.equal(observer.snapshot().rows[0].initialized, false);
const invalid = setup();
assert.throws(() => invalid.ctx.tqObserveNavigation({}, invalid.gate, 0), /limit/);
invalid.ctx.Process.arch = 'ia32';
assert.throws(() => invalid.ctx.tqObserveNavigation({}, invalid.gate), /ARM64/);
assert.equal(invalid.counters().hooks, 0);
console.log('PASS: all addresses before hooks; nested state; absent/cold/ready meshes; bounded samples; read failure; isolated snapshots; architecture guard');
