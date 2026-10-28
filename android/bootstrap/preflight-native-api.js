'use strict';
// Run once, before installing any participating hook. This checks compatibility,
// not authenticity. The returned capability retains only verified addresses.
function tqPreflightNativeApi(engine, groups) {
  if (!engine || engine.name !== 'libtq.so' || !Array.isArray(groups) || !groups.length)
    throw Error('Engine and API groups required');
  const addresses = new Map();
  const fnv = bytes => {
    let h = 2166136261;
    for (const b of bytes) h = Math.imul(h ^ b, 16777619) >>> 0;
    return ('00000000' + h.toString(16)).slice(-8);
  };
  for (const group of groups) {
    if (!Array.isArray(group) || !group.length) throw Error('Empty API group');
    for (const a of group) {
      if (!a || typeof a.name !== 'string' || !a.name.length ||
          !Number.isSafeInteger(a.rva) || a.rva < 0)
        throw Error('Invalid API descriptor');
      const raw = Array.isArray(a.bytes);
      const size = raw ? a.bytes.length : a.size;
      if (!Number.isInteger(size) || size < 1 || size > 65536 ||
          (raw && !a.bytes.every(b => Number.isInteger(b) && b >= 0 && b <= 255)) ||
          (!raw && !/^[0-9a-f]{8}$/.test(a.fnv1a || '')) ||
          a.rva + size > engine.size)
        throw Error('Invalid API fingerprint: ' + a.name);
      const address = engine.getExportByName(a.name);
      if (!address.equals(engine.base.add(a.rva))) throw Error('API address mismatch: ' + a.name);
      const bytes = new Uint8Array(address.readByteArray(size));
      if (bytes.length !== size || (raw ? !bytes.every((b, i) => b === a.bytes[i]) : fnv(bytes) !== a.fnv1a))
        throw Error('API bytes mismatch: ' + a.name);
      // Repeated entries are independently checked, including shared functions.
      addresses.set(a.name, address);
    }
  }
  const base = engine.base.toString(), size = engine.size, path = engine.path;
  return Object.freeze({
    count: addresses.size,
    address(currentEngine, name) {
      if (!currentEngine || currentEngine.name !== engine.name || currentEngine.path !== path ||
          currentEngine.base.toString() !== base || currentEngine.size !== size)
        throw Error('Engine instance changed');
      if (!addresses.has(name)) throw Error('API not preflighted: ' + name);
      return addresses.get(name);
    }
  });
}
