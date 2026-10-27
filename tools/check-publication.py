"""Conservative publication hygiene; not a copyright or legal compliance verdict."""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DENIED = {'.apk', '.dex', '.so', '.arz', '.arc', '.map', '.obb', '.class',
          '.jar', '.jks', '.keystore', '.p12', '.pem', '.zip', '.tar', '.7z',
          '.rar', '.ogg', '.mp3', '.dds', '.tex'}

def violations(path, data):
    issues = []
    if path.suffix.lower() in DENIED:
        issues.append('binary/archive/key extension')
    if any(p.lower() in {'savedata', 'local-inputs', 'local-output'} for p in path.parts):
        issues.append('private-data directory')
    if len(data) > 1024 * 1024:
        issues.append('over 1 MiB: manual review required')
    if b'\x00' in data:
        issues.append('binary content')
    if any(line.strip() in {b'-----BEGIN PRIVATE KEY-----', b'-----BEGIN RSA PRIVATE KEY-----'} for line in data.splitlines()):
        issues.append('private key content')
    return issues

def main():
    if '--self-test' in sys.argv:
        assert violations(pathlib.Path('game.apk'), b'example')
        assert violations(pathlib.Path('notes.txt'), b'\x00ELF')
        assert violations(pathlib.Path('SaveData/hero.txt'), b'save')
        assert not violations(pathlib.Path('src/Example.java'), b'class Example {}')
        print('PASS: publication guard self-test')
        return 0
    result = subprocess.run(['git', '-c', 'safe.directory=' + ROOT.as_posix(),
        '-C', str(ROOT), 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
        capture_output=True, check=True)
    failed = False
    names = sorted(set(result.stdout.decode('utf-8').split('\0')) - {''})
    for name in names:
        path = ROOT / name
        if path.is_symlink():
            print('BLOCK:', name, 'symlink requires review'); failed = True; continue
        if not path.exists():
            continue
        if path.stat().st_size > 1024 * 1024:
            print('BLOCK:', name, 'over 1 MiB: manual review required'); failed = True; continue
        issues = violations(pathlib.Path(name), path.read_bytes())
        if issues:
            print('BLOCK:', name, '; '.join(issues)); failed = True
    print(('FAIL' if failed else 'PASS') + ': checked %d publication candidate paths; not a legal audit' % len(names))
    return int(failed)

if __name__ == '__main__':
    sys.exit(main())
