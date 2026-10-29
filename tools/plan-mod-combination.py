"""Read-only combination preflight for trusted local ARZ v3 files.

Produces a hash-bound database plan, not a merged archive or an activation request.
Resource-key and gameplay validation must happen separately.
"""
import argparse
import hashlib
import importlib.util
import itertools
import json
import struct
import zlib
from pathlib import Path

_spec = importlib.util.spec_from_file_location('tq_record_compare', Path(__file__).with_name('compare-mod-records.py'))
_compare = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_compare)


def plan(paths, map_indices=()):
    if not 2 <= len(paths) <= 8:
        raise ValueError('Choose between two and eight databases')
    if len(map_indices) > 1:
        raise ValueError('Only one custom map may be selected')
    if any(type(i) is not int or i < 0 or i >= len(paths) for i in map_indices):
        raise ValueError('Invalid map input index')
    inputs, databases, seen = [], [], set()
    for path in paths:
        data = Path(path).read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        if digest in seen:
            raise ValueError('Duplicate database input')
        seen.add(digest)
        database = _compare.read(data)
        inputs.append(dict(name=Path(path).name, sha256=digest, size=len(data), records=len(database[2])))
        databases.append(database)
    pairs, conflicts = [], []
    for first, second in itertools.combinations(range(len(databases)), 2):
        result = _compare.compare(databases[first], databases[second])
        pairs.append(dict(first=first, second=second, shared=result['shared'], identical=result['identical']))
        conflicts.extend(dict(first=first, second=second, **row) for row in result['conflicts'])
    return dict(schema=1, status='refused-record-conflicts' if conflicts else 'no-record-conflicts-runtime-unverified',
                inputs=inputs, mapInput=map_indices[0] if map_indices else None,
                pairs=pairs, conflicts=conflicts, activationAllowed=False,
                remainingChecks=['ARC internal asset keys and mount order', 'retention of both database overrides',
                                 'map identity and resources', 'gameplay and isolated save/reload'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('databases', type=Path, nargs='+')
    parser.add_argument('--map-input', type=int, action='append', default=[], help='Zero-based input containing the custom map; at most one')
    args = parser.parse_args()
    try:
        result = plan(args.databases, args.map_input)
    except (ValueError, AssertionError, OSError, struct.error, zlib.error, IndexError) as error:
        parser.exit(2, 'Preflight failed: ' + str(error) + '\n')
    print(json.dumps(result, indent=2))
    raise SystemExit(1 if result['conflicts'] else 0)
