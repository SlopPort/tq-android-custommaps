"""Synthetic fixtures only; no game or mod content."""
import importlib.util
from pathlib import Path
import struct, zlib

path=Path(__file__).resolve().parents[2]/'tools/compare-mod-records.py'
spec=importlib.util.spec_from_file_location('overlap',path)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def fixture(record, text, reverse=False):
    strings=[record,'label',text]
    if reverse: strings.reverse()
    raw=struct.pack('<HHII',2,1,strings.index('label'),strings.index(text))
    payload=zlib.compress(raw)
    table=struct.pack('<II',strings.index(record),4)+b'Test'+struct.pack('<4I',0,len(payload),0,0)
    stringdata=struct.pack('<I',len(strings))+b''.join(struct.pack('<I',len(s.encode()))+s.encode() for s in strings)
    rt=24+len(payload);st=rt+len(table)
    return struct.pack('<HHIIIII',4,3,rt,len(table),1,st,len(stringdata))+payload+table+stringdata

a=m.read(fixture('records/example.dbr','alpha'))
b=m.read(fixture('records/example.dbr','alpha',True))
assert m.compare(a,b)['identical']==1, 'Archive-local string indices must not cause a conflict'
c=m.read(fixture('records/example.dbr','beta'))
assert m.compare(a,c)['conflicts'][0]['changedFields']==['label']
d=m.read(fixture('records/other.dbr','alpha'))
assert m.compare(a,d)['shared']==0
assert m.compare(a,d)['runtimeCompatibility']=='UNTESTED'
print('PASS: resolved string equivalence, conflicting value, disjoint records, no compatibility overclaim')
