'use strict';
// Bounded parser for the ASCII subset tested in the Gladiators laboratory probe.
// No engine calls. Reject unsupported encoding instead of silently corrupting it.
function tqParseAsciiModText(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length > 65536) throw Error('Mod text exceeds 64 KiB');
  if (bytes.some(b => b === 0 || b > 127)) throw Error('Unsupported mod text encoding');
  const source = Array.from(bytes, b => String.fromCharCode(b)).join('');
  const entries = [], keys = new Set();
  for (const line of source.split(/\r?\n/)) {
    if (line.length > 4096) throw Error('Mod text line exceeds 4096 characters');
    const equals = line.indexOf('=');
    if (equals <= 0 || !/^tag[A-Za-z0-9_]+$/.test(line.slice(0, equals))) continue;
    const key = line.slice(0, equals);
    if (keys.has(key)) throw Error('Duplicate mod text tag: ' + key);
    keys.add(key);
    entries.push({key, value: line.slice(equals + 1), line});
  }
  return entries;
}
