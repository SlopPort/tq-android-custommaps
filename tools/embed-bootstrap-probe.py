"""Local diagnostic integration only. Does not patch game libraries or access checks.
Requires a decoded APK that already contains the manager and a DEX including
GameBootstrapActivity. Gadget must be supplied locally; no download or redistribution.
"""
import argparse
import pathlib
import shutil
import json
import xml.etree.ElementTree as ET

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('decoded', type=pathlib.Path)
p.add_argument('gadget', type=pathlib.Path)
p.add_argument('--enable-supported-databases', action='store_true',
    help='Opt into the experimental selected-database loader; no save isolation or ARC/MAP mounting')
a = p.parse_args()
root = pathlib.Path(__file__).resolve().parents[1]
ns = 'http://schemas.android.com/apk/res/android'
ET.register_namespace('android', ns)
key = lambda n: '{' + ns + '}' + n
path = a.decoded / 'AndroidManifest.xml'
tree = ET.parse(path); manifest = tree.getroot(); app = manifest.find('application')
if manifest.get('package') != 'com.hg.titanquestultimate' or app is None:
    raise SystemExit('Unexpected package')
name = 'org.tqmods.GameBootstrapActivity'
if any(x.get(key('name')) == name for x in app):
    raise SystemExit('Probe already registered')
lib = a.decoded / 'lib/arm64-v8a'
if not (lib / 'libtq.so').is_file():
    raise SystemExit('Expected arm64 game library missing')
for n in ('libtqmods.so', 'libtqmods.config.so', 'libtqmods.script.so'):
    if (lib / n).exists(): raise SystemExit('Refusing to overwrite ' + n)
shutil.copyfile(a.gadget, lib / 'libtqmods.so')
script = (root / 'android/bootstrap/probe.js').read_bytes()
parameters = {'report': '/data/user/0/com.hg.titanquestultimate/files/bootstrap-status.json',
    'expectedApi': json.loads((root / 'android/bootstrap/api-5364.json').read_text())}
if a.enable_supported_databases:
    script = (root / 'android/bootstrap/resolve-selection.js').read_bytes() + b'\n' + \
        (root / 'android/bootstrap/lab-database-probe.js').read_bytes() + b'\n' + script
    parameters.update(observeMenu=True, verifyVanilla=True, requireStartupPid=True,
        selectionRequest='/data/user/0/com.hg.titanquestultimate/files/tqmods/startup-request.json',
        libraryRoot=['/data/user/0/com.hg.titanquestultimate/files/tqmods/library',
                     '/data/data/com.hg.titanquestultimate/files/tqmods/library'],
        profiles=json.loads((root / 'android/bootstrap/profiles-5364.json').read_text())
            + json.loads((root / 'android/bootstrap/map-profiles-5364.json').read_text()))
(lib / 'libtqmods.script.so').write_bytes(script)
(lib / 'libtqmods.config.so').write_text(json.dumps({
    'interaction': {'type': 'script', 'path': 'libtqmods.script.so', 'parameters': parameters},
    'runtime': 'qjs'}), encoding='utf-8')
app.set(key('extractNativeLibs'), 'true')
activity = ET.SubElement(app, 'activity', {key('name'): name,
    key('exported'): 'true', key('label'): 'TQ Game Startup Test'})
f = ET.SubElement(activity, 'intent-filter')
ET.SubElement(f, 'action', {key('name'): 'android.intent.action.MAIN'})
ET.SubElement(f, 'category', {key('name'): 'android.intent.category.LAUNCHER'})
tree.write(path, encoding='utf-8', xml_declaration=True)
print('Registered ' + ('experimental selected-database loader' if a.enable_supported_databases else 'startup-only diagnostic')
    + '. Compile/include the activity DEX before building.')
