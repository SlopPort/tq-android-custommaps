'use strict';
// Pure startup contract. Java must validate the private directory before Gadget
// starts; this function does not perform filesystem or symlink checks.
function tqResolveSaveProfile(request, pid, profilesRoot, liveRoot) {
  if (!request || request.schema !== 1 || request.startupPid !== pid)
    throw Error('Save profile belongs to a different startup');
  if (request.id === null && request.database === null) return null;
  if (typeof request.id !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(request.id))
    throw Error('Invalid profile selection');
  if (typeof request.database !== 'string' || request.database.length === 0)
    throw Error('Selected mod database missing');
  if (typeof profilesRoot !== 'string' || !profilesRoot.startsWith('/') ||
      /[\\\x00-\x1f\x7f]/.test(profilesRoot) ||
      profilesRoot.split('/').slice(1).some(p => !p || p === '.' || p === '..'))
    throw Error('Invalid profile storage root');
  const expected = profilesRoot + '/' + request.id + '/SaveData';
  const profile = request.preparedProfile;
  if (!profile || profile.root !== expected || profile.runtimeBound !== false)
    throw Error('Prepare a separate save copy before starting this mod');
  tqPlanSavePath(liveRoot, expected, liveRoot); // Reject overlapping/invalid roots.
  return Object.freeze({id: request.id, liveRoot, profileRoot: expected + '/'});
}
