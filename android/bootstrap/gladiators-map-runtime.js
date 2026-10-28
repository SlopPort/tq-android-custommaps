'use strict';
// Experimental adapter for the verified Gladiators specimen on build 5364.
// ModProbe-only until final profile/startup acceptance. No hot unload or rollback.
// Configuration and API fingerprints must come from a trusted built-in profile.
function tqActivateGladiatorsMap(engine, archive, player, config, gate, onReport) {
 const report={schema:1,pid:Process.id,status:'preflight',events:[],character:'ModProbe'};
 const save=()=>onReport(report);
 const held=[];globalThis.__tqGladiatorsHeld=held;
 const hash=b=>{let h=2166136261;for(const v of b)h=Math.imul(h^v,16777619)>>>0;return ('00000000'+h.toString(16)).slice(-8);};
 try {
  if(!player.isNull()||archive.isNull())throw Error('Requires menu without player');
  if(!gate)throw Error('Map startup preflight missing');
  for(const a of config.api)gate.address(engine,a.name);
  const F=(n,r,a)=>new NativeFunction(gate.address(engine,n),r,a);
  const assign=F('_ZNSt6__ndk112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc','pointer',['pointer','pointer']);
  const str=s=>{const p=Memory.alloc(24),t=Memory.allocUtf8String(s);assign(p,t);held.push(p,t);return p;};
  const getFS=F('_ZN4GAME6Engine13GetFileSystemEv','pointer',['pointer']);
  const fs=getFS(engine.getExportByName('_ZN4GAME7gEngineE').readPointer());if(fs.isNull())throw Error('No FileSystem');
  const count0=()=>fs.add(16).readPointer().sub(fs.add(8).readPointer()).toInt32()/8;
  if(count0()!==0)throw Error('Group 0 occupied');
  const add=F('_ZN4GAME10FileSystem16AddSourceArchiveERKNS0_22AddSourceArchiveParamsE','int',['pointer','pointer']);
  const open=F('_ZN4GAME10FileSystem8OpenFileEPKcNS_8FileModeE','pointer',['pointer','pointer','int']);
  const close=F('_ZN4GAME10FileSystem9CloseFileERPNS_4FileE','void',['pointer','pointer']);
  const length=F('_ZNK4GAME11FileArchive9GetLengthEv','uint',['pointer']);
  const lock=F('_ZN4GAME11FileArchive4LockEv','pointer',['pointer']);
  const unlock=F('_ZN4GAME11FileArchive6UnlockEv','void',['pointer']);
  report.mounts=[];
  for(const item of config.resources){
   const path=config.root+'/resources/'+item.name;
   const bytes=new Uint8Array(File.readAllBytes(path));if(bytes.length!==item.size||hash(bytes)!==item.fnv1a)throw Error('ARC mismatch '+item.name);
   const options=Memory.alloc(0x30);held.push(options);options.add(8).writePointer(str(path));
   // Use engine default archive namespace; no invented resource prefix.
   const result=add(fs,options);report.mounts.push({name:item.name,result});save();if(result!==1)throw Error('Mount failed');
  }
  report.paths=[];
  for(const path of ['gladiators.map','maps/gladiators.map','Maps/gladiators.map']){
   const f=open(fs,Memory.allocUtf8String(path),0);const row={path,present:!f.isNull()};let locked=false;
   try{if(!f.isNull()){row.size=length(f);if(row.size!==2866820)throw Error('Map size mismatch');const p=lock(f);locked=true;if(p.isNull())throw Error('Map lock failed');row.fnv1a=hash(new Uint8Array(p.readByteArray(row.size)));row.valid=row.fnv1a==='1f214379';}}
   finally{if(locked)unlock(f);if(!f.isNull()){const pp=Memory.alloc(8);pp.writePointer(f);close(fs,pp);}}
   report.paths.push(row);
  }
  const chosen=report.paths.find(x=>x.valid);if(!chosen)throw Error('No map path resolved');report.map=chosen.path;
  const index=F('_ZN4GAME15DatabaseArchive24GetRecordIndexFromStringERKNSt6__ndk112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE','int',['pointer','pointer']);
  const record=F('_ZN4GAME15DatabaseArchive9GetRecordEPPvRji','int',['pointer','pointer','pointer','int']);
  report.before=config.records.map(x=>{const i=index(archive,str(x.name)),p=Memory.alloc(8),n=Memory.alloc(4);const ok=i<0?0:record(archive,p,n,i);return {index:i,result:ok,size:n.readU32(),present:ok===1&&!p.readPointer().isNull()&&n.readU32()>0};});
  if(report.before.some(x=>x.present))throw Error('Mod sentinels already present');
  const data=File.readAllBytes(config.root+'/database/'+config.database.name);
  if(data.byteLength!==config.database.size||hash(new Uint8Array(data))!==config.database.fnv1a)throw Error('Database mismatch');
  const buffer=Memory.alloc(data.byteLength);buffer.writeByteArray(data);held.push(buffer);
  report.status='loading-database';save();
  F('_ZN4GAME15DatabaseArchive11DeserializeEPKvjb','void',['pointer','pointer','uint','bool'])(archive,buffer,data.byteLength,0);
  report.after=config.records.map(x=>{const i=index(archive,str(x.name)),p=Memory.alloc(8),n=Memory.alloc(4);if(i<0)throw Error('Missing sentinel');const ok=record(archive,p,n,i);if(ok!==1||p.readPointer().isNull()||n.readU32()!==x.size)throw Error('Invalid sentinel');const values=x.cells.map(c=>p.readPointer().add(c.offset).readU32());return {name:x.name,index:i,size:n.readU32(),numericChecks:values.length,pass:values.every((v,j)=>v===x.cells[j].value)};});
  if(!report.after.every(x=>x.pass))throw Error('Sentinel content mismatch');
  const loc=engine.getExportByName('_ZN4GAME19LocalizationManager10m_InstanceE').readPointer();if(loc.isNull())throw Error('Missing localization');
  const has=F('_ZN4GAME19LocalizationManager15HasLocalizationEPKc','bool',['pointer','pointer']);
  const tag=Memory.allocUtf8String('tagCave_01');report.textBefore=has(loc,tag);

  const tf=open(fs,Memory.allocUtf8String('Text\\modStrings.txt'),0);if(tf.isNull())throw Error('Missing mod text');let source;
  try {const n=length(tf);if(n>65536)throw Error('Text exceeds laboratory bound');const b=lock(tf);try{const bytes=new Uint8Array(b.readByteArray(n));if(bytes.some(x=>x>127||x===0))throw Error('This prototype supports ASCII mod strings only');source=String.fromCharCode(...bytes);}finally{unlock(tf);}}finally{const pp=Memory.alloc(8);pp.writePointer(tf);close(fs,pp);}
  const assignWide=F('_ZNSt6__ndk112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw','pointer',['pointer','pointer']);
  const destroyWide=F('_ZNSt6__ndk112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev','void',['pointer']);
  const addWide=F('_ZN4GAME19LocalizationManager11AddTagToMapERNSt6__ndk112basic_stringIwNS1_11char_traitsIwEENS1_9allocatorIwEEEEPKcb','void',['pointer','pointer','pointer','bool']);
  report.importedTextTags=[];
  for(const line of source.split(/\r?\n/)){const eq=line.indexOf('=');if(eq<=0||!/^tag[A-Za-z0-9_]+$/.test(line.slice(0,eq)))continue;if(line.length>4096)throw Error('Long tag line');const w=Memory.alloc(24),data=Memory.alloc((line.length+1)*4);for(let i=0;i<line.length;i++)data.add(i*4).writeU32(line.charCodeAt(i));assignWide(w,data);try{addWide(loc,w,Memory.allocUtf8String('Text/modStrings.txt'),1);}finally{destroyWide(w);}report.importedTextTags.push(line.slice(0,eq));}
  report.textAfter=has(loc,tag);

  if(!report.textAfter)throw Error('Mod text not registered');
  const getText=F('_ZN4GAME19LocalizationManager7GetTextEPKc',['uint64','uint64','uint64'],['pointer','pointer']);
  const returned=getText(loc,tag),textObject=Memory.alloc(24);for(let i=0;i<3;i++)textObject.add(i*8).writeU64(returned[i]);
  try {const b=textObject.readU8(),n=(b&1)?textObject.add(8).readU64().toNumber():b>>>1;if(n>512)throw Error('Invalid returned text length');const q=(b&1)?textObject.add(16).readPointer():textObject.add(4);let value='';const units=[];for(let i=0;i<n;i++){const c=q.add(i*4).readU32();units.push(c);value+=c<=0x10ffff?String.fromCodePoint(c):'?';}report.textValue={length:n,value,units};save();}
  finally {F('_ZNSt6__ndk112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev','void',['pointer'])(textObject);}

  let depth=0;
  const wide=p=>{const first=p.readU8(),n=(first&1)?p.add(8).readU64().toNumber():first>>1;if(n>128)throw Error('Name too long');const q=(first&1)?p.add(16).readPointer():p.add(4);let s='';for(let i=0;i<n;i++)s+=String.fromCodePoint(q.add(i*4).readU32());return s;};
  // Laboratory fix: preserve a verified custom map identity for ModProbe only.
  const enumThreads=new Map();
  const enumName='_ZN4GAME4Game13AddSavedGamesERNSt6__ndk16vectorINS0_18SaveGameInfoStructENS1_9allocatorIS3_EEEERKNS1_12basic_stringIcNS1_11char_traitsIcEENS4_IcEEEESE_RKNS8_IwNS9_IwEENS4_IwEEEEbbSE_RKNS_8UniqueIdE';
  const narrow=p=>{const b=p.readU8(),n=(b&1)?p.add(8).readU64().toNumber():b>>>1;if(n>4096)throw Error('Invalid map string');return n?((b&1)?p.add(16).readPointer():p.add(1)).readUtf8String(n):'';};
  const enumSite=engine.base.add(0xc76da4);
  // BL to libc++ string assign, verified in the examined build.
  const enumExpected=config.enumCallBytes;
  if(Array.from(new Uint8Array(enumSite.readByteArray(4))).join(',')!==enumExpected)throw Error('Enumeration call mismatch');
  const mapCString=Memory.allocUtf8String('maps/gladiators.map');held.push(mapCString);
  held.push(Interceptor.attach(engine.getExportByName(enumName),{
   onEnter(args){try{this.target=wide(args[4])==='ModProbe';if(this.target){const id=this.threadId;enumThreads.set(id,(enumThreads.get(id)||0)+1);}}catch(e){report.events.push({event:'enum-guard-error',error:String(e)});save();}},
   onLeave(){if(this.target){const id=this.threadId;const n=(enumThreads.get(id)||1)-1;if(n)enumThreads.set(id,n);else enumThreads.delete(id);}}
  }));
  held.push(Interceptor.attach(enumSite,{
   onEnter(){if(!enumThreads.get(this.threadId))return;try{const stored=narrow(this.context.sp.add(0x50));if(stored!=='maps/gladiators.map')return;const original=this.context.x1.readUtf8String();if(original!=='Levels/World/World01.map')throw Error('Unexpected map assignment');this.context.x1=mapCString;report.events.push({event:'correct-save-map-identity',original,stored});save();}catch(e){report.events.push({event:'enum-correction-error',error:String(e)});save();}}
  }));
  const playerName=F('_ZN4GAME8GameInfo13GetPlayerNameEv','pointer',['pointer']);
  const setLevel=F('_ZN4GAME8GameInfo12SetLevelNameERKNSt6__ndk112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE','void',['pointer','pointer']);
  const mapName=str(chosen.path);
  held.push(Interceptor.attach(engine.getExportByName('_ZNK4GAME13LoadingScreen11GetSaveGameERNS_4Game18SaveGameInfoStructEb'),{
   onEnter(args){try{const info=args[0].add(0x458).readPointer();if(!info.isNull()&&wide(playerName(info))==='ModProbe'){setLevel(info,mapName);report.events.push({event:'select-map-save',name:'ModProbe',map:chosen.path});save();}}catch(e){report.events.push({event:'save-selection-error',error:String(e)});save();}}
  }));
  held.push(Interceptor.attach(engine.getExportByName('_ZN4GAME4Game8LoadGameERKNS0_18SaveGameInfoStructEb'),{
   onEnter(args){try{const name=wide(args[1].add(0x18));this.active=name==='ModProbe';if(this.active)depth++;report.events.push({event:'load-game',name,redirectEnabled:this.active});save();}catch(e){report.error=String(e);save();}},
   onLeave(){if(this.active)depth--;report.events.push({event:'load-game-return'});save();}
  }));
  const destination=Memory.allocUtf8String(chosen.path);held.push(destination);
  held.push(Interceptor.attach(engine.getExportByName('_ZN4GAME5World4LoadEPKcbb'),{
   onEnter(args){this.row={event:'world-load',original:args[1].readUtf8String(),redirected:depth>0};if(depth>0){args[1]=destination;this.row.path=chosen.path;}report.events.push(this.row);save();},
   onLeave(value){this.row.result=value.toInt32();save();}
  }));
  report.status='ready-for-ModProbe';report.group0=count0();
 }catch(e){report.status='error-restart-required';report.error=String(e);try{save();}finally{new NativeFunction(Process.getModuleByName('libc.so').getExportByName('abort'),'void',[],{exceptions:'propagate'})();}}
 save();return report;
}


