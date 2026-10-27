import pathlib,struct,zlib,json,argparse
ap=argparse.ArgumentParser(description='Find three differing numeric loot fields in stock and mod ARZ files.');ap.add_argument('stock',type=pathlib.Path);ap.add_argument('mod',type=pathlib.Path);ap.add_argument('output',type=pathlib.Path);args=ap.parse_args()
def load(path):
 b=path.read_bytes(); _,v,ro,rl,n,so,sl=struct.unpack_from('<HH5I',b);p=so+4;ss=[]
 for _ in range(struct.unpack_from('<I',b,so)[0]):
  k=struct.unpack_from('<I',b,p)[0];p+=4;ss.append(b[p:p+k].decode(errors="replace"));p+=k
 rec={};p=ro
 for _ in range(n):
  idx,k=struct.unpack_from('<II',b,p);p+=8;cls=b[p:p+k].decode(errors="replace");p+=k;o,l,t=struct.unpack_from('<IIQ',b,p);p+=16
  rec[ss[idx].lower()]=(cls,o,l)
 return b,ss,rec
a=load(args.stock);b=load(args.mod)
def fields(db,r):
 raw=zlib.decompress(db[0][24+r[1]:24+r[1]+r[2]]);out={};p=0
 while p<len(raw):
  t,n,k=struct.unpack_from('<HHI',raw,p);p+=8;v=list(struct.unpack_from('<'+('f' if t==1 else 'I')*n,raw,p));out[db[1][k]]={'type':t,'offset':p,'values':v};p+=n*4
 return out
out=[]
for name,r in b[2].items():
 if name not in a[2] or 'loot' not in r[0].lower():continue
 x,y=fields(a,a[2][name]),fields(b,r)
 for k,f in y.items():
  if f['type'] in (0,1) and k in x and x[k]['values']!=f['values'] and f['offset']==x[k]['offset']:
   out.append(dict(record=name,field=k,before=x[k],after=f));break
 if len(out)==3:break
args.output.write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))

