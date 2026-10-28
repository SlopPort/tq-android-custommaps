'use strict';
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../bootstrap/preflight-native-api.js'), 'utf8'), context);
const preflight = context.tqPreflightNativeApi;
let memory = [1, 2, 3, 4];
const ptr = n => ({ n, equals: p => p.n === n, add: v => ptr(n + v),
  toString: () => String(n), readByteArray: size => Uint8Array.from(memory.slice(n - 100, n - 100 + size)).buffer });
const engine = {name:'libtq.so',base:ptr(100),size:4,getExportByName:n=>{
  if (n === 'root') return ptr(100);
  if (n === 'load') return ptr(102);
  throw Error('Missing export');
}};
const root = {name:'root',rva:0,bytes:[1,2]}, load = {name:'load',rva:2,bytes:[3,4]};
const gate = preflight(engine, [[root], [root, load]]);
assert.equal(gate.count, 2);
// A hook can alter prologue bytes after the common check. Later consumers use
// the same verified capability rather than falsely rejecting that known hook.
memory[0] = 99;
assert.equal(gate.address(engine, 'root').n, 100);
assert.equal(gate.address({...engine}, 'root').n, 100);
assert.throws(()=>gate.address({...engine,base:ptr(200)}, 'root'), /instance changed/);
assert.throws(()=>gate.address(engine, 'unknown'), /not preflighted/);
assert.throws(()=>preflight(engine, [[root], [load]]), /bytes mismatch/);
memory[0] = 1;
let installed = false;
try { preflight(engine, [[root], [{...load,bytes:[3,9]}]]); installed = true; } catch (_) {}
assert.equal(installed, false, 'A later group mismatch must prevent installation');
for (const descriptor of [{...root,rva:NaN},{...root,rva:4},{...root,bytes:[]},
  {...root,bytes:[-1]}, {...root,name:'missing'}, {...load,rva:0}])
  assert.throws(()=>preflight(engine, [[descriptor]]));
assert.throws(()=>preflight(engine, [[]]));
assert.throws(()=>preflight(engine, []));
assert.equal(preflight(engine, [[{name:'root',rva:0,size:2,fnv1a:'ed74208a'}]]).count, 1);
assert.throws(()=>preflight(engine, [[{name:'root',rva:0,size:2,fnv1a:'00000000'}]]));
console.log('NativeApiPreflightTest PASS');
