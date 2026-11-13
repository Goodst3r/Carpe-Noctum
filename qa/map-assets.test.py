"""Offline map packaging rejects corruption before producing an installer input."""
from pathlib import Path
import base64
import hashlib
import importlib.util
import json
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / 'night-sweep' / 'map_assets.py'

class MapAssetsTests(unittest.TestCase):
    def setUp(self):
        self.assertTrue(MODULE.is_file(), 'The offline map asset packager is missing')
        spec = importlib.util.spec_from_file_location('map_assets', MODULE)
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.vendor = Path(self.temp.name)
        self.contents = {'worker.js': b'const label = "</script>";', 'engine.wasm': bytes([0,97,115,109,0,255])}
        self.entries = []
        for name, data in self.contents.items():
            (self.vendor / name).write_bytes(data)
            self.entries.append({'name': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        self.manifest()

    def manifest(self):
        (self.vendor / 'manifest.json').write_text(json.dumps({'schema': 1, 'files': self.entries}))

    def test_worker_and_binary_bytes_survive_embedded_json(self):
        markup = self.module.asset_script(self.vendor)
        self.assertTrue(markup.startswith('<script id="map-import-assets" type="application/json">'))
        self.assertEqual(markup.count('</script>'), 1)
        payload = json.loads(markup.split('>', 1)[1].removesuffix('</script>'))
        self.assertEqual({name: base64.b64decode(value) for name, value in payload.items()}, self.contents)

    def test_corruption_fails_before_embedding(self):
        (self.vendor / 'worker.js').write_bytes(b'changed')
        with self.assertRaisesRegex(ValueError, 'checksum|size'):
            self.module.asset_script(self.vendor)

    def test_size_mismatch_fails(self):
        self.entries[0]['bytes'] += 1
        self.manifest()
        with self.assertRaisesRegex(ValueError, 'size'):
            self.module.asset_script(self.vendor)

    def test_duplicate_asset_name_fails(self):
        self.entries.append(self.entries[0].copy())
        self.manifest()
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            self.module.asset_script(self.vendor)

    def test_asset_path_cannot_escape_vendor_directory(self):
        self.entries[0]['name'] = '../outside.js'
        self.manifest()
        with self.assertRaisesRegex(ValueError, 'name'):
            self.module.asset_script(self.vendor)

    def test_manifest_schema_must_be_supported(self):
        (self.vendor / 'manifest.json').write_text('{"schema":2,"files":[]}')
        with self.assertRaisesRegex(ValueError, 'schema'):
            self.module.asset_script(self.vendor)

if __name__ == '__main__':
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(MapAssetsTests))
    if result.wasSuccessful():
        print(f'Map assets: {result.testsRun} checks passed')
    raise SystemExit(0 if result.wasSuccessful() else 1)
