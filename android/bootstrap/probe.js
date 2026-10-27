'use strict';
// Startup/menu diagnostics. Database experiments require a separately supplied lab probe/config.
rpc.exports.init = function (stage, parameters) {
  let ticks = 0;
  let api = null;
  let menu = { status: 'disabled' }, listener = null;
  function write(status) {
    const file = new File(parameters.report, 'w');
    try { file.write(JSON.stringify(status)); } finally { file.close(); }
  }
  function snapshot() {
    return {schema: 1, stage, pid: Process.id, ticks, enginePresent: api !== null,
      hooksInstalled: listener !== null,
      modsActivated: !!(menu.database && menu.database.status === 'overrides-verified'),
      apiPreflight: api, menuProbe: menu};
  }
  const timer = setInterval(() => {
    const engine = Process.findModuleByName('libtq.so');
    if (engine !== null && api === null) {
      api = { status: 'not-configured', functions: [] };
      if (Array.isArray(parameters.expectedApi) && parameters.expectedApi.length > 0) {
        api.status = 'matched';
        for (const expected of parameters.expectedApi) {
          const result = { name: expected.name, matched: false };
          try {
            const address = engine.getExportByName(expected.name);
            result.rva = address.sub(engine.base).toString();
            if (!address.equals(engine.base.add(expected.rva))) throw Error('Unexpected export address');
            const bytes = new Uint8Array(address.readByteArray(expected.size));
            let hash = 2166136261;
            for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
            result.fnv1a = ('00000000' + hash.toString(16)).slice(-8);
            result.matched = result.fnv1a === expected.fnv1a;
          } catch (error) { result.error = String(error); }
          if (!result.matched) api.status = 'mismatch';
          api.functions.push(result);
        }
      }
      if (api.status === 'matched' && parameters.observeMenu === true) {
        try {
          const E = name => engine.getExportByName(name);
          const getArchive = new NativeFunction(E('_ZN4GAME6Engine18GetDatabaseArchiveEv'), 'pointer', ['pointer']);
          const getPlayer = new NativeFunction(E('_ZNK4GAME10GameEngine13GetMainPlayerEv'), 'pointer', ['pointer']);
          let calls = 0, done = false;
          menu = {status: 'waiting-for-menu'};
          listener = Interceptor.attach(E('_ZN4GAME8PlayMenu6UpdateEv'), {onLeave() {
            ++calls;
            if (done) {
              if (calls === 360 && menu.database && typeof menu.database.recheck === 'function') {
                menu.database.recheck();
                try { write(snapshot()); } catch (error) { console.error(String(error)); }
              }
              return;
            }
            if (calls < 60) return;
            done = true;
            try {
              const instance = E('_ZN4GAME7gEngineE').readPointer();
              const game = E('_ZN4GAME11gGameEngineE').readPointer();
              if (instance.isNull() || game.isNull()) throw Error('Engine instance unavailable');
              const archive = getArchive(instance), player = getPlayer(game);
              menu = {status: 'observed', threadId: Process.getCurrentThreadId(),
                archivePresent: !archive.isNull(), playerPresent: !player.isNull(), calls};
              let databaseConfig = parameters.labDatabase;
              if (parameters.selectionRequest && typeof tqResolveSelection === 'function') {
                try {
                  const selection = tqResolveSelection(File.readAllText(parameters.selectionRequest),
                    parameters.profiles || [], parameters.libraryRoot, path => File.readAllBytes(path));
                  menu.selection = {status:selection.status,id:selection.id,name:selection.name};
                  databaseConfig = selection.status === 'recognized' ? selection.config : null;
                  if (selection.status === 'vanilla' && parameters.verifyVanilla && parameters.profiles.length > 0)
                    databaseConfig = {...parameters.profiles[0],activate:false};
                } catch (error) {
                  menu.selection = {status:'error',error:String(error)}; databaseConfig = null;
                }
              }
              if (databaseConfig && typeof tqLabDatabaseProbe === 'function') {
                if (archive.isNull() || !player.isNull()) {
                  menu.database = {status:'refused', error:'Requires database and no loaded player'};
                } else {
                  menu.database = tqLabDatabaseProbe(engine, archive, databaseConfig);
                }
              }
            } catch (error) { menu = {status: 'error', error: String(error)}; }
            try { write(snapshot()); } catch (error) { console.error(String(error)); }
          }});
        } catch (error) { menu = {status: 'setup-error', error: String(error)}; }
      }
    }
    ++ticks;
    try {
      write(snapshot());
    } catch (error) { console.error('Bootstrap report failed: ' + error); }
    if (ticks >= 30) clearInterval(timer);
  }, 1000);
  // Return immediately: waiting for the game here would block its initialization.
};
