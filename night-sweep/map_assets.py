"""Embed checksum-pinned local recognition assets in the single offline HTML."""
import base64
import hashlib
import json
from pathlib import Path
import re


def asset_script(vendor_dir):
    vendor_dir = Path(vendor_dir).resolve()
    manifest = json.loads((vendor_dir / 'manifest.json').read_text())
    if manifest.get('schema') != 1 or not isinstance(manifest.get('files'), list) or not manifest['files']:
        raise ValueError('Unsupported or empty map asset manifest schema')
    assets = {}
    for entry in manifest['files']:
        name = entry.get('name')
        if not isinstance(name, str) or not re.fullmatch(r'[A-Za-z0-9_.-]+', name) or name in {'.', '..'}:
            raise ValueError('Invalid map asset name')
        if name in assets:
            raise ValueError('Map asset has a duplicate name: ' + name)
        path = (vendor_dir / name).resolve()
        if path.parent != vendor_dir or not path.is_file():
            raise ValueError('Invalid map asset name or missing file: ' + name)
        data = path.read_bytes()
        if type(entry.get('bytes')) is not int or entry['bytes'] != len(data):
            raise ValueError('Map asset size mismatch: ' + name)
        if entry.get('sha256') != hashlib.sha256(data).hexdigest():
            raise ValueError('Map asset checksum mismatch: ' + name)
        assets[name] = base64.b64encode(data).decode('ascii')
    return '<script id="map-import-assets" type="application/json">' + json.dumps(assets, separators=(',', ':'), sort_keys=True) + '</script>'
