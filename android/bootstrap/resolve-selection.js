'use strict';
// Returns a plan only. The caller must validate the engine and unloaded-player state.
function tqResolveSelection(text, profiles, libraryRoot, readBytes) {
  const request=JSON.parse(text);
  if(request.schema!==1)throw Error('Unsupported selection schema');
  if(request.id===null && request.database===null)return {status:'vanilla'};
  if(typeof request.id!=='string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(request.id))throw Error('Invalid library ID');
  const roots=Array.isArray(libraryRoot)?libraryRoot:[libraryRoot];
  const contained=typeof request.database==='string' && roots.some(root=>typeof root==='string' && request.database.startsWith(root+'/'+request.id+'/'));
  if(!contained || /\\|\x00/.test(request.database)
    || request.database.split('/').some(p=>p==='.'||p==='..') || !request.database.toLowerCase().endsWith('.arz'))throw Error('Invalid library database path');
  const candidates=profiles.filter(p=>p.size===request.size);
  if(candidates.length===0)return {status:'unsupported',id:request.id};
  const bytes=readBytes(request.database);
  if(bytes.byteLength!==request.size)throw Error('Selected database changed');
  let hash=2166136261;for(const b of new Uint8Array(bytes))hash=Math.imul(hash^b,16777619)>>>0;
  const fingerprint=('00000000'+hash.toString(16)).slice(-8);
  const profile=candidates.find(p=>p.fnv1a===fingerprint);
  if(!profile)return {status:'unsupported',id:request.id};
  if (profile.kind === 'custom-map') {
    const relative = value => typeof value === 'string' && value.length <= 1024
      && !/[\\\x00:]/.test(value) && !value.startsWith('/')
      && value.split('/').every(part => part !== '' && part !== '.' && part !== '..');
    if (!relative(profile.databaseRelative) || !request.database.endsWith('/' + profile.databaseRelative)
        || !relative(profile.map) || !profile.map.endsWith('.map')
        || !Array.isArray(profile.resources) || profile.resources.length === 0 || profile.resources.length > 64)
      throw Error('Invalid custom-map profile');
    const root = request.database.slice(0, -profile.databaseRelative.length);
    const paths = new Set(), resources = [];
    let total = 0;
    for (const item of profile.resources) {
      if (!relative(item.path) || !item.path.toLowerCase().endsWith('.arc')
          || !Number.isSafeInteger(item.size) || item.size < 1 || item.size > 64*1024*1024
          || !/^[a-f0-9]{8}$/.test(item.fnv1a) || paths.has(item.path.toLowerCase()))
        throw Error('Invalid resource profile');
      paths.add(item.path.toLowerCase()); total += item.size;
      if (total > 256*1024*1024) throw Error('Resource plan exceeds limit');
    }
    for (const item of profile.resources) {
      const path = root + item.path, data = new Uint8Array(readBytes(path));
      if (data.byteLength !== item.size) throw Error('Resource size mismatch: ' + item.path);
      let h = 2166136261; for (const b of data) h = Math.imul(h ^ b, 16777619) >>> 0;
      if (('00000000' + h.toString(16)).slice(-8) !== item.fnv1a)
        throw Error('Resource fingerprint mismatch: ' + item.path);
      resources.push({path, size:item.size, fnv1a:item.fnv1a});
    }
    return {status:'map-preflight-verified',id:request.id,name:profile.name,
      plan:{root,map:profile.map,resources,activate:false}};
  }
  return {status:'recognized',id:request.id,name:profile.name,
    config:{...profile,path:request.database,activate:true}};
}
