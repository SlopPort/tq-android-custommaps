'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../bootstrap/probe.js'),'utf8');
function run(pid){
 let tick, listener, report, resolves=0;
 const pointer={isNull:()=>false};
 const address={sub:()=>({toString:()=>'0x10'}),equals:()=>true,
  readByteArray:()=>new Uint8Array([1,2,3]).buffer,readPointer:()=>pointer};
 const engine={base:{add:()=>address},getExportByName:()=>address};
 function File(){this.write=s=>report=JSON.parse(s);this.close=()=>{};}
 File.readAllText=()=>JSON.stringify({startupPid:pid});
 const ctx={rpc:{exports:{}},Process:{id:123,findModuleByName:()=>engine,getCurrentThreadId:()=>1},
  setInterval:f=>(tick=f,1),clearInterval:()=>{},console,Uint8Array,File,
  NativeFunction:function(){return ()=>pointer;},Interceptor:{attach:(_p,h)=>(listener=h,{})},
  tqResolveSelection:()=>{resolves++;return {status:'vanilla'};}};
 vm.runInNewContext(source,ctx);
 ctx.rpc.exports.init('early',{report:'report',expectedApi:[{name:'test',rva:16,size:3,fnv1a:'56cf37ab'}],
  observeMenu:true,selectionRequest:'startup-request.json',requireStartupPid:true,profiles:[]});
 tick();assert.ok(listener);
 for(let i=0;i<60;i++)listener.onLeave();
 return {report,resolves};
}
for(const pid of [122,undefined,null]){
 const r=run(pid);assert.equal(r.resolves,0);assert.equal(r.report.menuProbe.selection.status,'error');
 assert.equal(r.report.modsActivated,false);
}
const current=run(123);assert.equal(current.resolves,1);assert.equal(current.report.menuProbe.selection.status,'vanilla');
console.log('PASS: stale/missing startup PID refused before selection resolution; current startup accepted');
