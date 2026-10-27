# Read-only ARZ v3 comparison for trusted local research inputs.
# Not a hardened validator, mod merger or runtime compatibility test.
import struct, zlib
def read(data):
    _,version,rt,rs,n,st,ss=struct.unpack_from('<HHIIIII',data)
    assert version==3
    strings=[]; pos=st+4
    for _ in range(struct.unpack_from('<I',data,st)[0]):
        size=struct.unpack_from('<I',data,pos)[0];pos+=4
        strings.append(data[pos:pos+size].decode('utf-8'));pos+=size
    records={};cursor=rt
    for _ in range(n):
        idx,clen=struct.unpack_from('<II',data,cursor)
        cls=data[cursor+8:cursor+8+clen].decode('utf-8')
        offset,size,_,_=struct.unpack_from('<4I',data,cursor+8+clen);cursor+=24+clen
        name=strings[idx].replace('/','\\').lower()
        assert name not in records
        records[name]=(cls,offset,size)
    return data,strings,records
def fields(db, rec):
    data,strings,_=db;cls,offset,size=rec
    raw=zlib.decompress(data[24+offset:24+offset+size]);pos=0;out={}
    while pos<len(raw):
        kind,count,key=struct.unpack_from('<HHI',raw,pos);pos+=8
        vals=struct.unpack_from('<'+'I'*count,raw,pos);pos+=count*4
        if kind==2:vals=tuple(strings[v] for v in vals)
        assert strings[key] not in out
        out[strings[key]]=(kind,vals)
    assert pos==len(raw)
    return cls,out

def compare(a, b):
    shared = sorted(a[2].keys() & b[2].keys())
    conflicts = []
    for name in shared:
        ac, af = fields(a, a[2][name]); bc, bf = fields(b, b[2][name])
        if ac != bc or af != bf:
            conflicts.append(dict(record=name, classDifferent=ac != bc,
                onlyA=sorted(af.keys()-bf.keys()), onlyB=sorted(bf.keys()-af.keys()),
                changedFields=sorted(k for k in af.keys() & bf.keys() if af[k] != bf[k])))
    return dict(shared=len(shared), identical=len(shared)-len(conflicts), conflicts=conflicts,
        runtimeCompatibility='UNTESTED', scope='Database records only; no ARC, script or gameplay validation')

if __name__ == '__main__':
    import argparse, json
    from pathlib import Path
    p=argparse.ArgumentParser(description='Compare two trusted, extracted ARZ v3 databases without modifying them.')
    p.add_argument('first',type=Path); p.add_argument('second',type=Path)
    args=p.parse_args()
    print(json.dumps(compare(read(args.first.read_bytes()), read(args.second.read_bytes())),indent=2))
