'use strict';
// Laboratory-only database experiment. Not a general mod loader or save-isolation system.
const tqLabHeld = [];
function tqLabDatabaseProbe(module, archive, config) {
  const result = {status:'preflight', mutationAttempted:false};
  try {
    const E = name => module.getExportByName(name);
    const F = (name, resultType, args) => new NativeFunction(E(name), resultType, args);
    const assign = F('_ZNSt6__ndk112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc','pointer',['pointer','pointer']);
    const index = F('_ZN4GAME15DatabaseArchive24GetRecordIndexFromStringERKNSt6__ndk112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE','int',['pointer','pointer']);
    const record = F('_ZN4GAME15DatabaseArchive9GetRecordEPPvRji','int',['pointer','pointer','pointer','int']);
    const items = config.records.map(item => {
      const string = Memory.alloc(24), text = Memory.allocUtf8String(item.record);
      string.writeByteArray(new Uint8Array(24)); assign(string,text); tqLabHeld.push(string,text);
      return {...item,string};
    });
    function sample() {
      return items.map(item => {
        const i = index(archive,item.string);
        if(i<0)throw Error('Sentinel record missing');
        const output = Memory.alloc(Process.pointerSize), count = Memory.alloc(4);
        output.writePointer(ptr(0));
        count.writeU32(0);
        const ok = record(archive,output,count,i), size = count.readU32(), bytes = output.readPointer();
        if(ok !== 1 || bytes.isNull() || item.offset+4>size)throw Error('Invalid sentinel buffer');
        return {record:item.record, index:i, result:ok, size, value:bytes.add(item.offset).readU32()};
      });
    }
    result.before = sample();
    if(!result.before.every((v,i)=>v.value===items[i].before))throw Error('Stock sentinel mismatch');
    if(config.activate !== true){result.status='baseline-verified';return result;}
    const bytes = File.readAllBytes(config.path);
    if(bytes.byteLength!==config.size)throw Error('Specimen size mismatch');
    let hash=2166136261;
    for(const b of new Uint8Array(bytes))hash=Math.imul(hash^b,16777619)>>>0;
    if(('00000000'+hash.toString(16)).slice(-8)!==config.fnv1a)throw Error('Specimen fingerprint mismatch');
    const data=Memory.alloc(bytes.byteLength);data.writeByteArray(bytes);tqLabHeld.push(data);
    const deserialize=F('_ZN4GAME15DatabaseArchive11DeserializeEPKvjb','void',['pointer','pointer','uint','bool']);
    result.mutationAttempted=true;
    deserialize(archive,data,bytes.byteLength,0);
    result.after=sample();
    result.status=result.after.every((v,i)=>v.value===items[i].after)?'overrides-verified':'mismatch-restart-required';
    if(result.status==='overrides-verified') result.recheck = function () {
      try {
        result.delayed=sample();
        if(!result.delayed.every((v,i)=>v.value===items[i].after))result.status='delayed-mismatch-restart-required';
      } catch(error){result.status='delayed-error-restart-required';result.error=String(error);}
    };
  } catch(error){result.status=result.mutationAttempted?'error-restart-required':'refused';result.error=String(error);}
  return result;
}
