'use strict';
// Optional argument: a real ARZ v3 file for the summary parser.
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const ctx={Uint8Array,DataView,Map,Set,Array,String,Math,Error};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../bootstrap/generic-mod-runtime.js'),'utf8'),ctx);
const buf=a=>Uint8Array.from(a).buffer;
assert.equal(ctx.tqDecodeModText(buf([0x74,0x92,0x73])),'t’s');
assert.equal(ctx.tqDecodeModText(buf([0xef,0xbb,0xbf,0xc5,0x82])),'ł');
assert.equal(ctx.tqDecodeModText(buf([0xff,0xfe,0x41,0,0x42,1])),'Ał');
assert.equal(ctx.tqDecodeModText(buf([0xc5])),'Å');
const rows=ctx.tqParseModText('// c\r\n  tagA=One=1  \r\nxtagB=Two\r\n= bad\r\n9x=bad\r\ntagA=Again\r\n');
assert.deepEqual(Array.from(rows,r=>r.line),['tagA=Again','xtagB=Two']);
// Synthetic ARZ: header, one string table, three records.
function arz(names){
 const parts=[];const u32=v=>{const b=Buffer.alloc(4);b.writeUInt32LE(v);return b;};
 const strings=Buffer.concat([u32(names.length),...names.map(n=>Buffer.concat([u32(n.length),Buffer.from(n)]))]);
 const records=Buffer.concat(names.map((_,i)=>Buffer.concat([u32(i),u32(3),Buffer.from('cls'),Buffer.alloc(16)])));
 const head=Buffer.alloc(24);head.writeUInt16LE(4,0);head.writeUInt16LE(3,2);
 head.writeUInt32LE(24,4);head.writeUInt32LE(records.length,8);head.writeUInt32LE(names.length,12);
 head.writeUInt32LE(24+records.length,16);head.writeUInt32LE(strings.length,20);
 const b=Buffer.concat([head,records,strings]);return b.buffer.slice(b.byteOffset,b.byteOffset+b.length);
}
const s=ctx.tqArzSummary(arz(['a/x.dbr','b/y.dbr','c/z.dbr']),2);
assert.equal(s.count,3);assert.deepEqual(Array.from(s.names),['a/x.dbr','b/y.dbr']);
assert.throws(()=>ctx.tqArzSummary(buf([1,2,3,4]),2),/header/);
if(process.argv[2]){const b=fs.readFileSync(process.argv[2]);const r=ctx.tqArzSummary(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),16);assert.equal(r.names.length,16);console.log('specimen records',r.count,r.names[0]);}
console.log('PASS: Windows-1252/UTF-8/UTF-16 text, tag rows, ARZ record summary');
