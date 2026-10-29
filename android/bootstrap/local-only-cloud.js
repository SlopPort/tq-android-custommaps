'use strict';
// Build-specific local-only policy candidate. The caller must preflight all
// addresses and install this before any cloud operations. Experimental loader
// integration has bounded device coverage; full callback coverage is unverified.
function tqInstallLocalOnlyCloud(engine, gate, onFailure) {
  const names = {
    instance: '_ZN4GAME16CloudSaveManager8InstanceEv',
    set: '_ZN4GAME16CloudSaveManager15SetCloudEnabledEb',
    enabled: '_ZNK4GAME16CloudSaveManager14IsCloudEnabledEv'
  };
  const api = {};
  for (const key of Object.keys(names)) api[key] = gate.address(engine, names[key]);
  const instance = new NativeFunction(api.instance, 'pointer', []);
  const set = new NativeFunction(api.set, 'void', ['pointer', 'bool']);
  const enabled = new NativeFunction(api.enabled, 'bool', ['pointer']);
  const report = {status:'installing', enableRequestsBlocked:0};
  const held = [];
  try {
    // Preserve the stock setter and its state transitions, but never request
    // enabling cloud synchronization while this process uses a mod profile.
    held.push(Interceptor.attach(api.set, {
      onEnter(args) {
        if (args[1].toInt32() & 1) report.enableRequestsBlocked++;
        args[1] = ptr(0);
      }
    }));
    Interceptor.flush();
    const manager = instance();
    if (manager.isNull()) throw Error('Cloud manager unavailable');
    set(manager, 0);
    if (enabled(manager)) throw Error('Cloud manager remained enabled');
    report.status = 'local-only';
  } catch (error) {
    report.status = 'refused';
    onFailure(error);
    throw error; // A returning failure callback must not imply successful setup.
  }
  return {report, held, assertDisabled() {
    if (enabled(instance())) throw Error('Cloud unexpectedly enabled');
  }};
}
