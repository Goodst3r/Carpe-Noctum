#!/usr/bin/env python3
"""Invented native-layout samples; standard-library ZIP/CRC is the independent reference.
No field-export data or identifying metadata is read by this generator.
"""
import gzip
import io
import json
from pathlib import Path
import zipfile
import zlib

OUT = Path(__file__).resolve().parent
FORWARD = {'testGroup': {'tests': [{'id': 'sweeplessSweep', 'resultGroups': [
    {'id': 'sweep', 'resultSeries': [{'id': 'Levels',
        'independent': {'label': 'Frequency', 'type': 'set', 'units': 'MHz', 'values': [510, 270, 390]},
        'dependent': [
            {'label': 'Absolute', 'type': 'set', 'units': 'dBmV', 'values': [13, 12, 14.5]},
            {'label': 'Referenced', 'type': 'set', 'units': 'dB', 'values': []}]}]}]}]}}
REVERSE = {'cdmVersion': '2.0', 'tests': [{'type': 'sweepmode_app', 'results': {'status': 'none', 'data': {
    'invented_chart': {'eType': 'resultSeries', 'type': 'line', 'label': 'Reverse Sweep',
        'xAxisLabel': 'MHz', 'yAxisLabel': 'dBmV',
        'Unreferenced': {'eType': 'series', 'name': 'Unreferenced', 'dimensions': 2,
            'units': ['MHz', 'dBmV'], 'data': [[7, -3], [10, -2.5], [10.75, -1], [15, -2.25]]}},
    'invented_reference_table': {'eType': 'resultTable', 'tableColumnHeaders': [],
        'tableData': [[{'value': 'Reference name'}, {'value': 'NONE'}],
                      [{'value': 'Reference date'}, {'value': '---'}]]}}}}]}

def encoded(obj):
    return (json.dumps(obj, separators=(',', ':'), ensure_ascii=True) + '\n').encode()

def archive(entries, method=zipfile.ZIP_STORED, descriptor=False):
    class Nonseekable(io.BytesIO):
        def seekable(self): return False
        def seek(self, *args): raise io.UnsupportedOperation()
    out = Nonseekable() if descriptor else io.BytesIO()
    with zipfile.ZipFile(out, 'w', compression=method) as z:
        for name, data in entries:
            info = zipfile.ZipInfo(name, date_time=(2000, 1, 1, 0, 0, 0))
            info.compress_type = method
            z.writestr(info, data)
    return out.getvalue()

forward = encoded(FORWARD)
reverse = encoded(REVERSE)
files = {'forward.json': forward, 'reverse.json': reverse,
         'reverse.json-1.gz': gzip.compress(reverse, mtime=0),
         'forward-stored.zip': archive([('invented.json', forward)]),
         'forward-ancillary.zip': archive([('invented.json', forward), ('checksum.txt', b'123456789')]),
         'forward-all-bytes.zip': archive([('invented.json', forward), ('empty.bin', b''),
             ('all-bytes.bin', bytes(range(256))), ('reverse-bytes.bin', bytes(reversed(range(256))))]),
         'forward-deflated.zip': archive([('invented.json', forward)], zipfile.ZIP_DEFLATED),
         'forward-descriptor.zip': archive([('invented.json', forward)], zipfile.ZIP_DEFLATED, True),
         'multiple-json.zip': archive([('first.json', forward), ('second.json', reverse)]),
         'traversal.zip': archive([('../invented.json', forward)]),
         'too-many.zip': archive([(f'invented{i}.txt', b'') for i in range(33)]),
         'nested.zip': archive([('invented.json.gz', gzip.compress(reverse, mtime=0))]),
         'bomb.json.gz': gzip.compress(b' ' * (2 * 1024 * 1024 + 1), mtime=0),
         'bomb.zip': archive([('invented.json', b' ' * (2 * 1024 * 1024 + 1))], zipfile.ZIP_DEFLATED)}
assert zlib.crc32(bytes(range(256))) == 0x29058c73
assert zlib.crc32(bytes(reversed(range(256)))) == 0xda3ba10a
with zipfile.ZipFile(io.BytesIO(files['forward-all-bytes.zip'])) as check:
    for member in check.infolist():
        assert member.CRC == zlib.crc32(check.read(member))
for name, data in files.items():
    (OUT / name).write_bytes(data)
print(f'Generated {len(files)} wholly synthetic fixtures.')
