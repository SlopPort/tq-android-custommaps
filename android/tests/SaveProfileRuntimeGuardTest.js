'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
function run(mode){
 let attached=0,aborted=0,checked=0,last;
 const ctx={Process:{id:1,getModuleByName:()=>({getExportByName:()=> 'abort'})},
  NativeFunction:function(address){return address==='abort'?()=>{aborted++;throw Error('PROCESS_ABORT');}:()=>{};},
  Memory:{allocUtf8String:()=>({})},Interceptor:{attach:()=>{attached++;if(mode==='attach')throw Error('attach failed');return {};}}};
 vm.createContext(ctx);
 for(const name of ['plan-save-path.js','save-profile-runtime.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../bootstrap',name),'utf8'),ctx);
 const gate={address:(_e,n)=>{checked++;if(mode==='missing'&&checked===8)throw Error('unverified cloud function');return n;}};
 try{ctx.tqInstallSaveProfile({},gate,{liveRoot:'/live/SaveData/',profileRoot:'/profile/SaveData/',onReport:r=>last=r});}
 catch(e){assert.match(String(e),/PROCESS_ABORT/);}
 return {attached,aborted,checked,last};
}
const missing=run('missing');assert.equal(missing.attached,0);assert.equal(missing.aborted,1);assert.equal(missing.last.status,'refused');
const failed=run('attach');assert.equal(failed.checked,8);assert.equal(failed.aborted,1);assert.equal(failed.last.status,'refused');
const ready=run('ready');assert.equal(ready.checked,8);assert.equal(ready.attached,6);assert.equal(ready.aborted,0);assert.equal(ready.last.status,'ready');
console.log('PASS: all native addresses required before hooks; installation failure aborts; complete installation reports ready');
