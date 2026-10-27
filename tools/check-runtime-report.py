"""Validate a laboratory report against a separately observed live process ID.

Reads local JSON only. Does not connect to a phone or prove gameplay compatibility.
"""
import argparse
import json
from pathlib import Path


def validate(report, pid, mode, profile):
    errors = []
    def require(condition, message):
        if not condition:
            errors.append(message)
    require(report.get('pid') == pid, 'Report belongs to a different process')
    require(report.get('enginePresent') is True, 'Engine missing')
    preflight = report.get('apiPreflight', {})
    require(preflight.get('status') == 'matched', 'API preflight failed')
    functions = preflight.get('functions', [])
    require(len(functions) == 8 and all(f.get('matched') is True for f in functions),
            'Eight matching function checks required')
    menu = report.get('menuProbe', {})
    require(menu.get('playerPresent') is False, 'No-player checkpoint missing')
    require(menu.get('archivePresent') is True, 'Archive missing')
    db = menu.get('database', {})
    active = mode == 'mod'
    require(report.get('modsActivated') is active, 'Activation flag mismatch')
    require(db.get('mutationAttempted') is active, 'Mutation flag mismatch')
    require(db.get('status') == ('overrides-verified' if active else 'baseline-verified'),
            'Database status mismatch')
    require(menu.get('selection', {}).get('status') == ('recognized' if active else 'vanilla'),
            'Selection status mismatch')
    for phase in (['before', 'after', 'delayed'] if active else ['before']):
        rows = db.get(phase, [])
        expected = profile['records']
        require(len(rows) == len(expected), phase + ': record count mismatch')
        for row, target in zip(rows, expected):
            require(row.get('record') == target['record'] and row.get('result') == 1
                    and row.get('value') == target['before' if phase == 'before' else 'after'],
                    phase + ': sentinel mismatch')
    return errors


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report', type=Path)
    parser.add_argument('--pid', type=int, required=True, help='Live PID read independently from device')
    parser.add_argument('--mode', choices=['mod', 'vanilla'], required=True)
    args = parser.parse_args()
    profiles = Path(__file__).resolve().parents[1] / 'android/bootstrap/profiles-5364.json'
    try:
        errors = validate(json.loads(args.report.read_text(encoding='utf-8-sig')),
                          args.pid, args.mode, json.loads(profiles.read_text())[0])
    except (ValueError, TypeError, KeyError, AttributeError, OSError) as error:
        errors = ['Invalid report: ' + str(error)]
    print(json.dumps({'status': 'FAIL' if errors else 'PASS', 'errors': errors,
                      'scope': 'Three sentinel fields; not full mod or gameplay compatibility'}))
    raise SystemExit(bool(errors))
