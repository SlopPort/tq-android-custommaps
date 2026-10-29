'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
function run(mode){
 let early,menu,last,beforeLoad,archiveReady=true;const events=[];
 const id='00000000-0000-0000-0000-000000000001',root='/profiles/'+id+'/SaveData';
 const request={schema:1,startupPid:mode==='stale'?99:12,id,database:'/lib/mod.arz',preparedProfile:{root,runtimeBound:false}};
 if(mode==='vanilla'){request.id=null;request.database=null;}
 if(mode==='missing')delete request.preparedProfile;
 const ptr={isNull:()=>false},player={isNull:()=>true};
 function File(){this.write=s=>last=JSON.parse(s);this.close=()=>{};}
 File.readAllText=()=>JSON.stringify(request);
 const c={rpc:{exports:{}},Process:{id:12,getModuleByName:()=>({getExportByName:()=> 'abort'})},File,
  NativeFunction:function(n,_r,_a,options){if(n==='abort')assert.equal(options.exceptions,'propagate');if(n==='abort')return ()=>{events.push('abort');throw Error('ABORT');};return ()=>n.includes('GetMainPlayer')?player:n.includes('GetDatabaseArchive')&&!archiveReady?player:ptr;},
  Interceptor:{attach:(_p,h)=>(menu=h,{})},
  tqResolveSelection:()=>mode==='vanilla'?{status:'vanilla'}:{status:'map-preflight-verified',id,plan:{root:'/library/',map:'maps/gladiators.map',resources:[{path:'/library/resources/Maps.arc',size:1,fnv1a:'abc'}]}},
  tqObserveEngineStartup:cb=>(early=cb,events.push('observer'),[{}]),
  tqPreflightNativeApi:()=>({count:8,address:(_e,n)=>n}),
  tqInstallLocalOnlyCloud:()=>{events.push('cloud');return {report:{status:'local-only'}};},
  tqInstallSaveProfile:(_e,_g,o)=>{beforeLoad=o.beforeLoad;events.push('profile');return {};},
  tqActivateGladiatorsMap:()=>{events.push('map');return {status:'ready-for-ModProbe'};},
  tqLabDatabaseProbe:()=>({status:'baseline-verified'})};
 vm.createContext(c);
 for(const n of ['plan-save-path.js','resolve-save-profile.js','profile-loader.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../bootstrap',n),'utf8'),c);
 try{c.rpc.exports.init('early',{report:'report',selectionRequest:'request',profiles:[],libraryRoot:'/library',profilesRoot:'/profiles',liveSaveRoot:'/live/SaveData/',expectedApi:[],saveApi:[],cloudApi:[],mapApi:[],gladiators:{resources:[{name:'Maps.arc',size:1,fnv1a:'abc'}]}});}catch(e){assert.match(String(e),/ABORT/);}
 if(early){early({getExportByName:()=>({readPointer:()=>ptr})});if(beforeLoad)assert.throws(beforeLoad,/not ready/);if(mode==='delayed'){archiveReady=false;menu.onLeave();assert.equal(last.modsActivated,false);assert.throws(beforeLoad,/not ready/);archiveReady=true;}menu.onLeave();if(beforeLoad)assert.doesNotThrow(beforeLoad);}
 return {last,events};
}
const map=run('map');assert.deepEqual(map.events,['observer','cloud','profile','map']);assert.equal(map.last.modsActivated,true);assert.equal(map.last.status,'ready');
assert.equal(run('delayed').last.modsActivated,true);
const vanilla=run('vanilla');assert.deepEqual(vanilla.events,['observer']);assert.equal(vanilla.last.modsActivated,false);
for(const mode of ['missing','stale']){const r=run(mode);assert.ok(r.events.includes('abort'));assert.ok(!r.events.includes('observer'));assert.equal(r.last.status,'refused');}
console.log('PASS: selected profile before map, vanilla without profile hooks, missing/stale startup refusal');
