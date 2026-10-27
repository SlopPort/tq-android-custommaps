'use strict';
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const source = fs.readFileSync(require('path').join(__dirname, '../bootstrap/probe.js'), 'utf8');
function run(mode) {
 let tick, written;
 const address = { sub: () => ({toString: () => '0x10'}), equals: () => mode !== 'address',
   readByteArray: () => new Uint8Array([1,2,3]).buffer };
 const engine = {base:{add:()=>address},getExportByName:()=>{if(mode==='missing')throw Error('missing'); return address;}};
 const ctx = {rpc:{exports:{}}, Process:{id:123, findModuleByName:()=>engine},
   setInterval:f=>(tick=f,1),clearInterval:()=>{},console,Uint8Array,
   File:function(){this.write=s=>written=JSON.parse(s);this.close=()=>{};}};
 vm.runInNewContext(source,ctx);
 let h=2166136261;for(const b of [1,2,3])h=Math.imul(h^b,16777619)>>>0;
 ctx.rpc.exports.init('early',{report:'test',expectedApi:[{name:'test',rva:'0x10',size:3,fnv1a:mode==='hash'?'00000000':h.toString(16)}]});
 tick(); return written;
}
assert.equal(run('ok').apiPreflight.status,'matched');
for(const mode of ['address','hash','missing'])assert.equal(run(mode).apiPreflight.status,'mismatch');
assert.equal(run('ok').modsActivated,false);
assert.equal(run('ok').hooksInstalled,false);
console.log('PASS: API preflight match, address/hash mismatch, missing symbol; no activation');
