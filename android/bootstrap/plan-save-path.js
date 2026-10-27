'use strict';
// Pure planning only: no hooks or filesystem operations. Roots must independently
// be canonicalized and checked for symlinks by the eventual native caller.
function tqPlanSavePath(liveRoot, profileRoot, requestedPath) {
  function normalized(value) {
    if (typeof value !== 'string' || value.length > 4096 ||
        !value.startsWith('/') || /[\\\x00-\x1f\x7f]/.test(value))
      throw Error('Invalid absolute save path');
    const parts = value.split('/').filter(Boolean);
    if (parts.some(p => p === '.' || p === '..')) throw Error('Dot path refused');
    return '/' + parts.join('/');
  }
  const live = normalized(liveRoot), profile = normalized(profileRoot);
  const inside = (p, root) => p === root || p.startsWith(root + '/');
  if (!live.endsWith('/SaveData') || !profile.endsWith('/SaveData'))
    throw Error('SaveData roots required');
  if (inside(live, profile) || inside(profile, live)) throw Error('Overlapping roots');
  const source = normalized(requestedPath);
  if (inside(source, profile)) return {kind: 'already-profile', target: source};
  if (!inside(source, live)) throw Error('Path outside configured save roots');
  const suffix = source.slice(live.length);
  const target = profile + suffix;
  if (target.length > 4096) throw Error('Mapped path too long');
  return {kind: 'redirect', target};
}
