'use strict';
// Magisk route: the selection is persistent (written by the root helper when the
// player taps Play) and the save copy is checked here instead of in a startup
// activity. Returns a request in the embedded startup format, bound to this pid.
function tqMagiskRequest(request, pid, perfEnabled, profilesRoot, readText) {
  if (!request || request.schema !== 1) throw Error('Unsupported selection schema');
  const r = Object.assign({}, request, {startupPid: pid, perfEnabled: perfEnabled === true});
  delete r.preparedProfile;
  if (r.id === null || r.id === undefined) { r.id = null; r.database = null; return r; }
  if (typeof r.id !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(r.id))
    throw Error('Invalid profile selection');
  const root = (Array.isArray(profilesRoot) ? profilesRoot[0] : profilesRoot) + '/' + r.id;
  let text;
  try { text = readText(root + '/profile.properties'); }
  catch (e) { throw Error('Prepare a separate save copy before starting this mod'); }
  if (typeof text !== 'string' || text.length > 4096) throw Error('Profile preparation record missing or invalid');
  const props = {};
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m) props[m[1]] = m[2];
  }
  if (props.schema !== '1' || props.id !== r.id) throw Error('Profile preparation record does not match selection');
  r.preparedProfile = {root: root + '/SaveData', runtimeBound: false};
  return r;
}
