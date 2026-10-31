'use strict';
// Register before the game activity loads libtq.so. Runs after dlopen returns,
// including ELF constructors, but before its application caller resumes.
// Engine unload/reload is unsupported. Retain the returned listeners for life.
// With options.allowRunning (Magisk injection), an engine that is already loaded
// is installed at once; the caller must then guard what the engine read before.
function tqObserveEngineStartup(install, refuse, options) {
  if (typeof install !== 'function' || typeof refuse !== 'function') throw Error('Startup callbacks required');
  const running = Process.findModuleByName('libtq.so');
  if (running !== null && options && options.allowRunning === true) {
    try {
      const outcome = install(running);
      if (outcome && typeof outcome.then === 'function') throw Error('Engine installation must be synchronous');
      Interceptor.flush();
    } catch (error) { refuse(error); }
    return [];
  }
  if (running !== null) {
    refuse(Error('Engine already loaded; a fresh process is required'));
    throw Error('Startup refusal returned');
  }
  let installed = null;
  const listeners = [], seen = new Set();
  const linker = Process.getModuleByName('libdl.so');
  for (const name of ['android_dlopen_ext', 'dlopen']) {
    const address = linker.getExportByName(name);
    if (seen.has(address.toString())) continue;
    seen.add(address.toString());
    listeners.push(Interceptor.attach(address, {
      onEnter(args) {
        this.target = false;
        if (!args[0].isNull()) {
          const path = args[0].readUtf8String();
          this.target = path === 'libtq.so' || path.endsWith('/libtq.so');
        }
      },
      onLeave(result) {
        if (!this.target) return;
        try {
          if (result.isNull()) throw Error('Engine library failed to load');
          const engine = Process.getModuleByName('libtq.so');
          if (installed !== null) {
            if (installed !== engine.base.toString()) throw Error('Engine mapping changed');
            return; // Nested loader entry points may report the same load.
          }
          const outcome = install(engine);
          if (outcome && typeof outcome.then === 'function') throw Error('Engine installation must be synchronous');
          Interceptor.flush();
          installed = engine.base.toString();
        } catch (error) { refuse(error); }
      }
    }));
  }
  Interceptor.flush();
  return listeners;
}
