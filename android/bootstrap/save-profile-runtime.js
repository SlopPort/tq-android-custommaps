'use strict';
// Experimental build-5364 routing. Install before save enumeration. This module
// does not establish startup ordering, verify files, or support hot unloading.
function tqInstallSaveProfile(engine, gate, options) {
  const names = {
    assign: '_ZNSt6__ndk112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc',
    destroy: '_ZNSt6__ndk112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev',
    root: '_ZNK4GAME4Game21GetUserSaveDataFolderEv',
    load: '_ZN4GAME4Game8LoadGameERKNS0_18SaveGameInfoStructEb',
    read: '_ZN4GAME18UICaravanInventory8StreamInERKNSt6__ndk112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE',
    write: '_ZN4GAME18UICaravanInventory9StreamOutERKNSt6__ndk112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE',
    cloud: '_ZN4GAME16CloudSaveManager11SaveCaravanEv',
    cloudAll: '_ZN4GAME16CloudSaveManager27SaveAllCharactersAndCaravanEv'
  };
  const report = {pid:Process.id,status:'preflight',redirects:0,caravan:[],loads:[],errors:[]};
  const held = [];
  const abort = new NativeFunction(Process.getModuleByName('libc.so').getExportByName('abort'),'void',[],{exceptions:'propagate'});
  const emit = () => { if (options.onReport) options.onReport(report); };
  const fail = error => {
    report.status='refused';report.errors.push(String(error));
    // Continuing after partial routing could mix profiles. Restart is required.
    try { emit(); } finally { abort(); }
  };
  function narrow(p) {
    const b=p.readU8(),n=(b&1)?p.add(8).readU64().toNumber():b>>>1;
    if(n>4096)throw Error('Invalid native save-path length');
    return n?((b&1)?p.add(16).readPointer():p.add(1)).readUtf8String(n):'';
  }
  function wide(p) {
    const b=p.readU8(),n=(b&1)?p.add(8).readU64().toNumber():b>>>1;
    if(n>128)throw Error('Invalid native character-name length');
    const q=(b&1)?p.add(16).readPointer():p.add(4);let s='';
    for(let i=0;i<n;i++)s+=String.fromCodePoint(q.add(i*4).readU32());return s;
  }
  try {
    const live=options.liveRoot,root=options.profileRoot;
    tqPlanSavePath(live,root,live);
    // Resolve every required address before the first hook, from the shared gate.
    const api={};for(const key of Object.keys(names))api[key]=gate.address(engine,names[key]);
    const assign=new NativeFunction(api.assign,'pointer',['pointer','pointer']);
    const destroy=new NativeFunction(api.destroy,'void',['pointer']);
    const target=Memory.allocUtf8String(root.endsWith('/')?root:root+'/');held.push(target);
    held.push(Interceptor.attach(api.root,{
      onEnter(){this.out=this.context.x8;},
      onLeave(){try{
        const original=narrow(this.out);
        if(tqPlanSavePath(live,root,original).target!==root.replace(/\/$/,''))
          throw Error('Unexpected native save root');
        assign(this.out,target);report.redirects++;
      }catch(e){fail(e);}}
    }));
    for(const key of ['read','write'])held.push(Interceptor.attach(api[key],{
      onEnter(args){try{
        const source=narrow(args[1]),plan=tqPlanSavePath(live,root,source);
        this.temp=Memory.alloc(24);this.temp.writeByteArray(new Uint8Array(24));
        this.text=Memory.allocUtf8String(plan.target);assign(this.temp,this.text);args[1]=this.temp;
        if(report.caravan.length<100){this.row={operation:key,source,target:plan.target};report.caravan.push(this.row);}
      }catch(e){fail(e);}},
      onLeave(value){try{if(this.row&&key==='read')this.row.result=value.toInt32();if(this.temp)destroy(this.temp);emit();}catch(e){fail(e);}}
    }));
    held.push(Interceptor.attach(api.load,{
      onEnter(args){try{
        if(options.beforeLoad) options.beforeLoad();
        const name=wide(args[1].add(0x18));
        if(options.allowedCharacter && name!==options.allowedCharacter)throw Error('Character outside test scope');
        if(report.loads.length<100)report.loads.push({event:'enter',name});emit();
      }catch(e){fail(e);}},
      onLeave(){if(report.loads.length<100)report.loads.push({event:'return'});try{emit();}catch(e){fail(e);}}
    }));
    for(const key of ['cloud','cloudAll'])held.push(Interceptor.attach(api[key],{
      onEnter(){try {
        if (!options.cloudPolicy) throw Error('Cloud save is not supported with an active separate profile');
        options.cloudPolicy.assertDisabled();
      } catch(e) { fail(e); }}
    }));
    report.status='ready';emit();
  } catch(e) { fail(e); }
  // Keep this object reachable for the entire process; no detach API by design.
  return {report,held};
}
