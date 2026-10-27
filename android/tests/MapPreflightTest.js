const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ctx={Uint8Array};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../bootstrap/resolve-selection.js'),'utf8'),ctx);
const id='00000000-0000-0000-0000-000000000001',root='/private/library';
const hash=b=>{let h=2166136261;for(const x of b)h=Math.imul(h^x,16777619)>>>0;return h.toString(16).padStart(8,'0');};
const db=[1,2,3],arc=[4,5,6];
const profile={name:'fixture',kind:'custom-map',size:3,fnv1a:hash(db),databaseRelative:'database/mod.arz',map:'maps/test.map',resources:[{path:'resources/Maps.arc',size:3,fnv1a:hash(arc)}]};
const request={schema:1,id,database:root+'/'+id+'/database/mod.arz',size:3};
let reads=[];const run=(p=profile,reader)=>ctx.tqResolveSelection(JSON.stringify(request),[p],root,name=>{reads.push(name);return Uint8Array.from(reader?reader(name):(name.endsWith('.arz')?db:arc)).buffer;});
let result=run();assert.equal(result.status,'map-preflight-verified');assert.equal(result.plan.activate,false);assert.equal(result.config,undefined);assert.equal(result.plan.resources.length,1);
assert.throws(()=>run(profile,n=>n.endsWith('.arz')?db:[4,5]),/size mismatch/);
assert.throws(()=>run(profile,n=>n.endsWith('.arz')?db:[9,9,9]),/fingerprint/);
assert.throws(()=>run(profile,n=>{if(n.endsWith('.arc'))throw Error('missing');return db;}),/missing/);
for(const bad of ['../bad.arc','/bad.arc','resources/../bad.arc','resources\\bad.arc']){
 reads=[];assert.throws(()=>run({...profile,resources:[{...profile.resources[0],path:bad}]}));assert.equal(reads.length,1);
}
reads=[];assert.throws(()=>run({...profile,resources:[profile.resources[0],profile.resources[0]]}));assert.equal(reads.length,1);
assert.throws(()=>run({...profile,databaseRelative:'other/mod.arz'}));
assert.throws(()=>run({...profile,map:'../test.map'}));
assert.equal(ctx.tqResolveSelection(JSON.stringify({schema:1,id:null,database:null}),[profile],root,()=>{throw Error('Unexpected read');}).status,'vanilla');
console.log('PASS: complete map plan remains inactive; missing/changed archives, traversal, duplicates and mismatched database layout refused');
