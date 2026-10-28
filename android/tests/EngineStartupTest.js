'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../bootstrap/observe-engine-startup.js'),'utf8');
function setup(existing){
 let flushed=0,engine={name:'libtq.so',base:{toString:()=> '0x1000'}},hooks=[];
 const c=vm.createContext({Process:{findModuleByName:()=>existing?engine:null,
  getModuleByName:n=>n==='libdl.so'?{getExportByName:n=>({toString:()=>n})}:engine},
  Interceptor:{flush:()=>flushed++,attach:(_p,h)=>(hooks.push(h),{})}});
 vm.runInContext(source,c);
 return {start:c.tqObserveEngineStartup,flushed:()=>flushed,hooks,
  load(name,success=true,index=0){const invocation={};hooks[index].onEnter.call(invocation,[{isNull:()=>false,readUtf8String:()=>name}]);hooks[index].onLeave.call(invocation,{isNull:()=>!success});},
  remap(){engine={...engine,base:{toString:()=> '0x2000'}};}};
}
let installs=0,errors=[];
const s=setup(false);s.start(()=>{installs++;},e=>errors.push(String(e)));
s.load('libother.so');assert.equal(installs,0);
s.load('/app/libtq.so');assert.equal(installs,1);assert.equal(s.flushed(),2);
s.load('libtq.so',true,1);assert.equal(installs,1);assert.equal(errors.length,0);
s.remap();s.load('libtq.so');assert.match(errors[0],/mapping changed/);
const late=setup(true);assert.throws(()=>late.start(()=>{},()=>{}),/refusal returned/);assert.equal(late.hooks.length,0);
const asyncCase=setup(false);let failure;
asyncCase.start(()=>({then(){}}),e=>failure=String(e));asyncCase.load('libtq.so');assert.match(failure,/synchronous/);assert.equal(asyncCase.flushed(),1);
const failed=setup(false);failed.start(()=>{throw Error('must not install');},e=>failure=String(e));failed.load('libtq.so',false);assert.match(failure,/failed to load/);
console.log('PASS: synchronous loader-exit install, flush, nested deduplication, late/failed/remapped/async refusal');
