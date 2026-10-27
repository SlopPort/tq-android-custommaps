'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../bootstrap/lab-database-probe.js'),'utf8');
function run(mode){
 let changed=false,loads=0;
 const pointer={isNull:()=>false,add:()=>({readU32:()=>changed?(mode==='afterMismatch'?77:35):(mode==='beforeMismatch'?99:3)})};
 const allocation=()=>({writeByteArray(){},writePointer(){},writeU32(){},readU32:()=>mode==='short'?1:100,readPointer:()=>pointer});
 const context={Uint8Array,ptr:()=>0,Memory:{alloc:allocation,allocUtf8String:allocation},Process:{pointerSize:8},
 File:{readAllBytes:()=>new Uint8Array([1,2,3]).buffer},
 NativeFunction:function(name){if(name.includes('Deserialize'))return (a,b,c,flag)=>{assert.strictEqual(flag,0);loads++;changed=true;};if(name.includes('GetRecordIndex'))return ()=>mode==='missing'?-1:1;return ()=>1;}};
 vm.runInNewContext(source,context);
 let h=2166136261;for(const b of [1,2,3])h=Math.imul(h^b,16777619)>>>0;
 const result=context.tqLabDatabaseProbe({getExportByName:n=>n},pointer,{activate:mode!=='baseline',size:3,fnv1a:mode==='hash'?'bad':h.toString(16),records:[{record:'test',offset:44,before:3,after:35}]});
 return {result,loads};
}
assert.equal(run('baseline').result.status,'baseline-verified');assert.equal(run('baseline').loads,0);
for(const mode of ['short','missing','beforeMismatch','hash']){assert.equal(run(mode).result.status,'refused');assert.equal(run(mode).loads,0);}
assert.equal(run('ok').result.status,'overrides-verified');assert.equal(run('ok').loads,1);
assert.equal(run('afterMismatch').result.status,'mismatch-restart-required');
console.log('PASS: mocked baseline, refusal gates, bounded sample and post-load mismatch. Native execution is not covered.');
