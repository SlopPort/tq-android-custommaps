"""Restore untouched original assets after an Apktool --no-assets build; local use only."""
import argparse,zipfile,shutil,pathlib
p=argparse.ArgumentParser();p.add_argument('original',type=pathlib.Path);p.add_argument('rebuilt',type=pathlib.Path);p.add_argument('output',type=pathlib.Path);a=p.parse_args()
if a.output.exists():raise SystemExit('Output exists; refusing overwrite')
with zipfile.ZipFile(a.original) as original,zipfile.ZipFile(a.rebuilt) as rebuilt,zipfile.ZipFile(a.output,'w',allowZip64=True) as out:
 for source,entries in [(rebuilt,[i for i in rebuilt.infolist() if not i.filename.startswith('assets/')]),(original,[i for i in original.infolist() if i.filename.startswith('assets/')])]:
  for info in entries:
   if info.is_dir():out.writestr(info,b'');continue
   with source.open(info) as src,out.open(info,'w',force_zip64=info.file_size>=2**31) as dst:shutil.copyfileobj(src,dst,1024*1024)
print(a.output)
