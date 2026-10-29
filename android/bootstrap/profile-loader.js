'use strict';
// Opt-in integration test. ModProbe only until character-list isolation is verified.
rpc.exports.init = function(stage, parameters) {
  const report={schema:1,pid:Process.id,stage,status:'preparing',modsActivated:false};
  const held=[];globalThis.__tqProfileLoader={report,held};
  const write=()=>{const f=new File(parameters.report,'w');try{f.write(JSON.stringify(report));}finally{f.close();}};
  const abort=new NativeFunction(Process.getModuleByName('libc.so').getExportByName('abort'),'void',[],{exceptions:'propagate'});
  const refuse=e=>{report.status='refused';report.error=String(e);try{write();}finally{abort();}};
  try {
    const text=File.readAllText(parameters.selectionRequest),request=JSON.parse(text);
    if(request.startupPid!==Process.id)throw Error('Selection belongs to another startup');
    const selection=tqResolveSelection(text,parameters.profiles,parameters.libraryRoot,p=>File.readAllBytes(p));
    if(!['vanilla','recognized','map-preflight-verified'].includes(selection.status))throw Error('Selected mod is unsupported');
    report.menuProbe={selection:{status:selection.status,id:selection.id,name:selection.name}};
    const profile=tqResolveSaveProfile(request,Process.id,parameters.profilesRoot,parameters.liveSaveRoot);
    const isMap=selection.status==='map-preflight-verified';
    let mapConfig;
    if(isMap){
      if(selection.plan.map!=='maps/gladiators.map')throw Error('Map adapter unavailable');
      mapConfig={...parameters.gladiators,root:selection.plan.root.replace(/\/$/,''),api:parameters.mapApi};
      if(selection.plan.resources.length!==mapConfig.resources.length)throw Error('Map resource inventory changed');
      for(const expected of mapConfig.resources){
        const actual=selection.plan.resources.find(x=>x.path===mapConfig.root+'/resources/'+expected.name);
        if(!actual || actual.size!==expected.size || actual.fnv1a!==expected.fnv1a)throw Error('Map adapter fingerprint mismatch');
      }
    }
    held.push(...tqObserveEngineStartup(engine=>{
      const groups=[parameters.expectedApi];
      if(profile)groups.push(parameters.saveApi,parameters.cloudApi);
      if(isMap)groups.push(parameters.mapApi);
      const gate=tqPreflightNativeApi(engine,groups.map(g=>g.map(a=>({...a,rva:Number(a.rva)}))));
      report.apiPreflight={status:'matched',count:gate.count};
      let cloudPolicy;
      if(profile){cloudPolicy=tqInstallLocalOnlyCloud(engine,gate,refuse);held.push(cloudPolicy);report.cloud=cloudPolicy.report;}
      if(profile)held.push(tqInstallSaveProfile(engine,gate,{...profile,cloudPolicy,beforeLoad(){if(report.status!=='ready'||!report.modsActivated)throw Error('Mod activation is not ready; restart and wait at character selection');},allowedCharacter:'ModProbe',onReport:r=>{report.saveProfile=r;write();}}));
      const E=n=>engine.getExportByName(n);
      const fn=(n,r,a)=>new NativeFunction(gate.address(engine,n),r,a);
      const getArchive=fn('_ZN4GAME6Engine18GetDatabaseArchiveEv','pointer',['pointer']);
      const getPlayer=fn('_ZNK4GAME10GameEngine13GetMainPlayerEv','pointer',['pointer']);
      let calls=0,done=false;
      held.push(Interceptor.attach(gate.address(engine,'_ZN4GAME8PlayMenu6UpdateEv'),{onLeave(){
        if(done)return;
        if(++calls>600){done=true;refuse(Error('Menu activation timed out'));return;}
        try {
          const instance=E('_ZN4GAME7gEngineE').readPointer(),game=E('_ZN4GAME11gGameEngineE').readPointer();
          if(instance.isNull()||game.isNull())return;
          const archive=getArchive(instance),player=getPlayer(game);
          if(!player.isNull())throw Error('Activation requires menu without player');
          if(archive.isNull())return;
          done=true;
          if(isMap){
            report.menuProbe.map=tqActivateGladiatorsMap(engine,archive,player,mapConfig,gate,r=>{report.menuProbe.map=r;write();});
            if(report.menuProbe.map.status!=='ready-for-ModProbe')throw Error('Map setup incomplete');
            report.modsActivated=true;
          }else if(selection.status==='recognized'){
            report.menuProbe.database=tqLabDatabaseProbe(engine,archive,selection.config);
            if(report.menuProbe.database.status!=='overrides-verified')throw Error('Database setup incomplete');
            report.modsActivated=true;
          }else if(parameters.profiles.length){
            const sample=parameters.profiles.find(p=>p.kind!=='custom-map');
            if(sample)report.menuProbe.database=tqLabDatabaseProbe(engine,archive,{...sample,activate:false});
          }
          report.status='ready';write();
        }catch(e){refuse(e);}
      }}));
      report.status='waiting-for-menu';write();
    },refuse));
    report.status='waiting-for-engine';write();
  }catch(e){refuse(e);}
};
