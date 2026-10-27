"""Add the original mod-manager component to an Apktool-decoded local APK.
No entitlement, signature-verification, game code or asset patches.
"""
import argparse,pathlib,shutil,xml.etree.ElementTree as ET
p=argparse.ArgumentParser();p.add_argument('decoded',type=pathlib.Path);p.add_argument('dex',type=pathlib.Path);a=p.parse_args()
ns='http://schemas.android.com/apk/res/android';ET.register_namespace('android',ns)
k=lambda s:'{'+ns+'}'+s
manifest=a.decoded/'AndroidManifest.xml';tree=ET.parse(manifest);app=tree.getroot().find('application')
assert app is not None
if any(x.get(k('name'))=='org.tqmods.ModManagerActivity' for x in app):raise SystemExit('Already integrated; refusing duplicate patch')
package=tree.getroot().get('package')
if not package: raise SystemExit('Missing package name')
ET.SubElement(app,'activity',{k('name'):'org.tqmods.ModManagerActivity',k('exported'):'false',k('label'):'Titan Quest Mods',k('theme'):'@android:style/Theme.Material.Light.NoActionBar',k('taskAffinity'):package+'.mods',k('launchMode'):'singleTask'})
alias=ET.SubElement(app,'activity-alias',{k('name'):'org.tqmods.Launcher',k('targetActivity'):'org.tqmods.ModManagerActivity',k('exported'):'true',k('label'):'Titan Quest Mods'})
f=ET.SubElement(alias,'intent-filter');ET.SubElement(f,'action',{k('name'):'android.intent.action.MAIN'});ET.SubElement(f,'category',{k('name'):'android.intent.category.LAUNCHER'})
n=2
while (a.decoded/('classes%d.dex'%n)).exists():n+=1
shutil.copyfile(a.dex,a.decoded/('classes%d.dex'%n));tree.write(manifest,encoding='utf-8',xml_declaration=True)
print('Added manager and launcher alias in classes%d.dex; game launcher retained'%n)
