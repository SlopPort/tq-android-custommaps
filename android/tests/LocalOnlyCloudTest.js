'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
function run(mode) {
 let hooks=0,checks=0,flushed=false,called=false,failed=0,callback;
 const pointer=n=>({toInt32:()=>n,isNull:()=>n===0});
 const ctx={ptr:pointer,Interceptor:{attach:(_a,c)=>{hooks++;callback=c;return {};},flush:()=>flushed=true},
 NativeFunction:function(a){
   if(a.includes('Instance'))return ()=>{assert(flushed);return pointer(1);};
   if(a.includes('SetCloud'))return (_p,value)=>{assert.strictEqual(value,0);called=true;};
   return ()=>mode==='still-enabled';
 }};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../bootstrap/local-only-cloud.js'),'utf8'),ctx);
 const gate={address:(_e,n)=>{checks++;if(mode==='missing'&&checks===3)throw Error('missing');return n;}};
 let result,error;
 try {result=ctx.tqInstallLocalOnlyCloud({},gate,()=>failed++);}catch(e){error=e;}
 if(result){const args=[pointer(1),pointer(1)];callback.onEnter(args);assert.equal(args[1].toInt32(),0);assert.equal(result.report.enableRequestsBlocked,1);}
 return {hooks,checks,called,failed,result,error};
}
assert.equal(run('missing').hooks,0);
const ok=run('ok');assert.equal(ok.checks,3);assert(ok.called);assert.equal(ok.result.report.status,'local-only');
const bad=run('still-enabled');assert.equal(bad.failed,1);assert(bad.error);assert(!bad.result);
console.log('PASS: preflight before hooks; flush before singleton; disable and verify; later enable requests forced off; failed verification refuses');
