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
  return {status:'recognized',id:request.id,name:profile.name,
    config:{...profile,path:request.database,activate:true}};
}
