'use strict';
// Diagnostic only. Install before world loading; retain for the process lifetime.
// No mesh creation, save writes, movement changes or hook detachment.
function tqObserveNavigation(engine, gate, limit = 256) {
  if (Process.arch !== 'arm64' || Process.pointerSize !== 8)
    throw Error('Navigation observer requires ARM64');
  if (!Number.isInteger(limit) || limit < 1 || limit > 1024)
    throw Error('Invalid navigation observation limit');
  const postLoad = gate.address(engine, '_ZN4GAME5Level9_PostLoadERi');
  const meshAddress = gate.address(engine, '_ZN4GAME5Level17GetPathMeshRecastEv');
  const initializedAddress = gate.address(engine, '_ZNK4GAME14PathMeshRecast13IsInitializedEv');
  const getMesh = new NativeFunction(meshAddress, 'pointer', ['pointer']);
  const isInitialized = new NativeFunction(initializedAddress, 'bool', ['pointer']);
  const rows = [];
  let entered = 0, completed = 0, dropped = 0, errors = 0;
  const listener = Interceptor.attach(postLoad, {
    onEnter(args) {
      entered++;
      this.sample = entered <= limit;
      if (!this.sample) { dropped++; return; }
      this.level = args[0];
      this.thread = this.threadId;
      try { this.step = args[1].readS32(); }
      catch (_) { this.sample = false; errors++; }
    },
    onLeave() {
      if (!this.sample) return;
      try {
        const mesh = getMesh(this.level);
        rows.push({ thread: this.thread, step: this.step,
          level: this.level.toString(), mesh: mesh.toString(),
          present: !mesh.isNull(),
          initialized: !mesh.isNull() && Boolean(isInitialized(mesh)) });
        completed++;
      } catch (_) { errors++; }
    }
  });
  Interceptor.flush();
  return Object.freeze({
    // Retain listener and NativeFunction handles, including while snapshots are read.
    retained: Object.freeze([listener, getMesh, isInitialized]),
    snapshot() {
      return { schema: 1, pid: Process.id, status: 'diagnostic-only',
        entered, completed, dropped, errors, limit,
        rows: rows.map(row => Object.assign({}, row)) };
    }
  });
}
