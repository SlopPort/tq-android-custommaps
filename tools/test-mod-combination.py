"""Synthetic database tests. Fixtures exercise the reader, not engine acceptance."""
import importlib.util
import struct
import tempfile
import unittest
import zlib
from pathlib import Path

spec = importlib.util.spec_from_file_location('planner', Path(__file__).with_name('plan-mod-combination.py'))
planner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(planner)


def fixture(path, record, value, padding=False):
    strings = (['unused'] if padding else []) + [record, 'weight']
    raw = struct.pack('<HHII', 0, 1, strings.index('weight'), value)
    block = zlib.compress(raw)
    cls = b'Synthetic'
    table = struct.pack('<II', strings.index(record), len(cls)) + cls + struct.pack('<4I', 0, len(block), 0, 0)
    text = struct.pack('<I', len(strings)) + b''.join(struct.pack('<I', len(s.encode())) + s.encode() for s in strings)
    path.write_bytes(struct.pack('<HHIIIII', 4, 3, 24+len(block), len(table), 1, 24+len(block)+len(table), len(text)) + block + table + text)
    return path


class CombinationTest(unittest.TestCase):
    def test_record_collision_is_refused(self):
        with tempfile.TemporaryDirectory() as d:
            a=fixture(Path(d)/'a.arz', 'Records/Shared.dbr', 1)
            b=fixture(Path(d)/'b.arz', 'records/shared.dbr', 2, True)
            result=planner.plan([a,b])
            self.assertEqual(result['status'], 'refused-record-conflicts')
            self.assertEqual(result['conflicts'][0]['changedFields'], ['weight'])
            self.assertFalse(result['activationAllowed'])

    def test_identical_semantics_ignore_string_indices(self):
        with tempfile.TemporaryDirectory() as d:
            a=fixture(Path(d)/'a.arz', 'records/shared.dbr', 1)
            b=fixture(Path(d)/'b.arz', 'records/shared.dbr', 1, True)
            result=planner.plan([a,b], [0])
            self.assertEqual(result['pairs'][0]['identical'],1)
            self.assertEqual(result['mapInput'],0)
            self.assertFalse(result['activationAllowed'])
            with self.assertRaises(ValueError): planner.plan([a,b],[0,1])
            with self.assertRaises(ValueError): planner.plan([a,a])

    def test_disjoint_records_remain_runtime_unverified(self):
        with tempfile.TemporaryDirectory() as d:
            result=planner.plan([fixture(Path(d)/'a.arz','a.dbr',1),fixture(Path(d)/'b.arz','b.dbr',2)])
            self.assertEqual(result['pairs'][0]['shared'],0)
            self.assertEqual(result['status'],'no-record-conflicts-runtime-unverified')
            self.assertFalse(result['activationAllowed'])


if __name__=='__main__': unittest.main()
