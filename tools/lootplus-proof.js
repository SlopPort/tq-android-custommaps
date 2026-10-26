// One-shot research probe for Android 3.0.5339. Load only while character selection is active.
(function () {
 const outPath='/data/user/0/com.hg.titanquestultimate/cache/tq-custommaps-proof.json';
 const report={schema:1,status:'waiting',pid:Process.id};
 const save=()=>{const f=new File(outPath,'w');f.write(JSON.stringify(report));f.close();};
 const timer=setInterval(()=>{
  const m=Process.findModuleByName('libtq.so'); if(!m)return; clearInterval(timer);
  try {
   const E=n=>m.getExportByName(n), F=(n,r,a)=>new NativeFunction(E(n),r,a,{traps:"all"});
   const assign=F('_ZNSt6__ndk112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc','pointer',['pointer','pointer']);
   const held=[];const str=s=>{const p=Memory.alloc(24),t=Memory.allocUtf8String(s);assign(p,t);held.push(p,t);return p;};
   const engine=()=>E('_ZN4GAME7gEngineE').readPointer();
   const archive=F('_ZN4GAME6Engine18GetDatabaseArchiveEv','pointer',['pointer']);
   const index=F('_ZN4GAME15DatabaseArchive24GetRecordIndexFromStringERKNSt6__ndk112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE','int',['pointer','pointer']);
   const record=F('_ZN4GAME15DatabaseArchive9GetRecordEPPvRji','int',['pointer','pointer','pointer','int']);
   const player=F('_ZNK4GAME10GameEngine13GetMainPlayerEv','pointer',['pointer']);
   const items=[{"record": "records\\xpack3\\items\\loottables\\weapons\\monster\\sword\\mi_l_potamoiwarrior.dbr", "field": "bothPrefixSuffix", "before": {"type": 0, "offset": 44, "values": [3]}, "after": {"type": 0, "offset": 44, "values": [35]}}, {"record": "records\\item\\loottables\\torso\\mastertables\\monster\\e_ratmanchampion.dbr", "field": "lootWeight2", "before": {"type": 0, "offset": 188, "values": [4]}, "after": {"type": 0, "offset": 188, "values": [60]}}, {"record": "records\\item\\loottables\\head\\mastertables\\monster\\l_ratmanchampion.dbr", "field": "lootWeight2", "before": {"type": 0, "offset": 188, "values": [4]}, "after": {"type": 0, "offset": 188, "values": [40]}}].map(x=>({...x,p:str(x.record)}));
   function sample(){return items.map(x=>{const a=archive(engine()),i=index(a,x.p),p=Memory.alloc(8),n=Memory.alloc(4);if(i<0)return {record:x.record,index:i};const ok=record(a,p,n,i),size=n.readU32(),data=p.readPointer();if(data.isNull()||size<x.after.offset+4)throw Error('Invalid record buffer: '+JSON.stringify({i,ok,size,data:String(data)}));return {record:x.record,field:x.field,index:i,ok,size,value:data.add(x.after.offset).readU32()};});}
   const expectedPath='/sdcard/Android/data/com.hg.titanquestultimate/files/Preferences/CustomMaps/lootplus/database/LootPlus.arz';
   let done=false,frames=0,rechecked=false;
   Interceptor.attach(E('_ZN4GAME8PlayMenu6UpdateEv'),{onLeave(){
    if(done){if(!rechecked&&++frames>=360&&report.status==='verified-record-overrides'){rechecked=true;try{report.delayed=sample();report.status=report.delayed.every((v,i)=>v.value===items[i].after.values[0])?'verified-stable-record-overrides':'delayed-mismatch';save();}catch(e){report.status='recheck-error';report.error=String(e);save();}}return;}if(++frames<60)return;done=true;
    try {
     const ge=E('_ZN4GAME11gGameEngineE').readPointer();if(!ge.isNull()&&!player(ge).isNull())throw Error('Player is loaded; refusing database replacement');
     report.thread=Process.getCurrentThreadId();report.before=sample();report.status='before-load';save();
     if(!report.before.every((v,i)=>v.value===items[i].before.values[0]))throw Error('Baseline differs; refusing load');
     const bytes=File.readAllBytes(expectedPath);if(bytes.byteLength!==6075026)throw Error('Unexpected specimen size');const data=Memory.alloc(bytes.byteLength);data.writeByteArray(bytes);held.push(data);report.inputBytes=bytes.byteLength;const deserialize=F('_ZN4GAME15DatabaseArchive11DeserializeEPKvjb','void',['pointer','pointer','uint','bool']);deserialize(archive(engine()),data,bytes.byteLength,0);report.activation='direct-engine-deserialize';report.after=sample();report.flag=engine().add(0xb40).readU8();
     report.status=report.after.every((v,i)=>v.value===items[i].after.values[0])?'verified-record-overrides':'mismatch';save();
    }catch(e){report.status='error';report.error=String(e.stack||e);save();}
   }});
   report.status='armed-at-character-selection';save();
  }catch(e){report.status='setup-error';report.error=String(e.stack||e);save();}
 },500);
})();



