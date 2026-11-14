#!/usr/bin/env python3
"""Android source staging and release rejection checks; SDK commands are mocked.

No Android SDK, real keystore, signed APK, emulator or device is used here.
"""
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest.mock import patch
import hashlib
import importlib.util
import io
import json
import shutil
import subprocess
import sys
import unittest
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ANDROID = ROOT / 'android-build'
NS = '{http://schemas.android.com/apk/res/android}'


def load_builder(path):
    spec = importlib.util.spec_from_file_location('nightsweep_android_test', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def files_under(folder):
    return {str(p.relative_to(folder)): p.read_bytes()
            for p in folder.rglob('*') if p.is_file()} if folder.exists() else {}


class BuildHarness:
    """Run production build orchestration with synthetic external tool results."""
    def __init__(self, root, scenario=None, prior=True):
        self.root, self.scenario = root, scenario
        root.mkdir(parents=True)
        shutil.copy2(ANDROID / 'build.py', root / 'build.py')
        shutil.copytree(ANDROID / 'app', root / 'app')
        self.module = load_builder(root / 'build.py')
        private = root / 'signing-private'
        private.mkdir()
        (private / 'keystore-password.txt').write_text('synthetic placeholder')
        (private / 'nightsweep-release.p12').write_bytes(b'not a real keystore')
        self.bt = root / 'toolchain/build-tools/android-15'
        self.bt.mkdir(parents=True)
        for name in ['aapt2', 'zipalign', 'apksigner', 'd8']:
            (self.bt / name).write_text('synthetic tool placeholder')
        self.asset = root / 'input.html'
        self.asset.write_text('Carpe Noctum ' + self.module.VERSION_NAME +
                             " const TrainingJob= const marker='guided-1.5' initTraining(); const SweepSetup=")
        self.out = root / 'dist/preview'
        self.out.mkdir(parents=True)
        self.apk_name = 'CarpeNoctum-2.0-build4-preview.apk'
        if prior:
            (self.out / self.apk_name).write_bytes(b'previous validated APK placeholder')
            (self.out / 'build-info.json').write_text('{"priorValidatedBuild":true}')
            for name in ['apk-signature-verification.txt', 'apk-manifest-verification.txt', 'apk-manifest-tree.txt']:
                (self.out / name).write_text('previous validated receipt')
        self.before = files_under(self.out)
        self.calls = []

    def command(self, argv, **kwargs):
        argv = [str(value) for value in argv]
        self.calls.append(argv)
        if len(argv) > 1 and argv[1] == 'compile' and self.scenario == 'compile':
            raise subprocess.CalledProcessError(1, argv)
        if len(argv) > 1 and argv[1] == 'link':
            target, staged = Path(argv[argv.index('-o') + 1]), Path(argv[argv.index('-A') + 1])
            with zipfile.ZipFile(target, 'w') as archive:
                archive.writestr('assets/index.html', b'wrong HTML' if self.scenario == 'embedded' else (staged / 'index.html').read_bytes())
        elif Path(argv[0]).name == 'zipalign' and '-c' not in argv:
            shutil.copyfile(argv[-2], argv[-1])
        elif 'sign' in argv:
            shutil.copyfile(argv[-1], argv[argv.index('--out') + 1])
        elif 'verify' in argv:
            certificate = '0' * 64 if self.scenario == 'certificate' else self.module.ORIGINAL_CERTIFICATE_SHA256
            v2 = 'false' if self.scenario == 'signature' else 'true'
            return SimpleNamespace(stdout='Signer #1 certificate SHA-256 digest: ' + certificate +
                                   '\nVerified using v2 scheme (APK Signature Scheme v2): ' + v2 +
                                   '\nVerified using v3 scheme (APK Signature Scheme v3): true\n')
        elif 'badging' in argv:
            label = 'Carpe Noctum ' + self.module.VERSION_NAME.replace(' Alpha', ' Preview')
            badging = ("package: name='" + self.module.PREVIEW_PACKAGE + "' versionCode='" + str(self.module.VERSION_CODE) +
                       "' versionName='" + self.module.VERSION_NAME + "'\napplication-label:'" + label + "'")
            return SimpleNamespace(stdout='wrong manifest' if self.scenario == 'manifest' else badging)
        elif 'xmltree' in argv:
            if self.scenario == 'changed-input':
                self.asset.write_text('input changed during mocked build')
            return SimpleNamespace(stdout='wrong provider' if self.scenario == 'provider' else self.module.PREVIEW_PACKAGE + '.pickerfiles')
        return SimpleNamespace(stdout='')

    def run(self, extra=()):
        with patch.object(sys, 'argv', [str(self.root / 'build.py'), str(self.asset), '--preview', *extra]), \
             patch.object(self.module.subprocess, 'run', side_effect=self.command), redirect_stdout(io.StringIO()):
            self.module.main()


class AndroidPreviewTests(unittest.TestCase):
    def test_release_identity_and_offline_permissions(self):
        module = load_builder(ANDROID / 'build.py')
        manifest = ET.parse(ANDROID / 'app/src/main/AndroidManifest.xml').getroot()
        self.assertEqual(module.VERSION_NAME, '2.0 Alpha build 4')
        self.assertEqual(module.VERSION_CODE, 28)
        self.assertEqual(manifest.get(NS + 'versionName'), module.VERSION_NAME)
        self.assertEqual(manifest.get(NS + 'versionCode'), str(module.VERSION_CODE))
        self.assertFalse(manifest.findall('uses-permission'), 'Offline wrapper must not gain network or other permissions')

    def test_standard_and_preview_staging_preserve_canonical_sources(self):
        module = load_builder(ANDROID / 'build.py')
        canonical = ANDROID / 'app/src/main'
        before = files_under(canonical)
        with TemporaryDirectory(prefix='nightsweep-stage-test-') as tmp:
            root = Path(tmp)
            asset = root / 'current.html'
            asset.write_bytes(b'synthetic current shared HTML')
            for preview in [False, True]:
                staged = root / str(preview)
                package, label = module.prepare_sources(canonical, staged, asset, preview)
                manifest = ET.parse(staged / 'AndroidManifest.xml').getroot()
                app = manifest.find('application')
                self.assertEqual(package, module.PREVIEW_PACKAGE if preview else module.STANDARD_PACKAGE)
                self.assertEqual(manifest.get('package'), package)
                self.assertEqual(app.get(NS + 'label'), label)
                self.assertEqual(app.find('provider').get(NS + 'authorities'), package + '.pickerfiles')
                self.assertEqual(app.find('activity').get(NS + 'name'), module.STANDARD_PACKAGE + '.MainActivity' if preview else '.MainActivity')
                self.assertEqual(app.find('provider').get(NS + 'name'), module.STANDARD_PACKAGE + '.PickerFiles' if preview else '.PickerFiles')
                self.assertEqual((staged / 'assets/index.html').read_bytes(), asset.read_bytes())
            self.assertEqual(files_under(canonical), before)

    def assert_rejection_preserves_release(self, scenario, message):
        with TemporaryDirectory(prefix='nightsweep-rejection-test-') as tmp:
            for prior in [False, True]:
                with self.subTest(prior_validated_release=prior):
                    harness = BuildHarness(Path(tmp) / str(prior), scenario, prior)
                    with self.assertRaisesRegex((SystemExit, subprocess.CalledProcessError), message):
                        harness.run()
                    self.assertEqual(files_under(harness.out), harness.before,
                                     'Rejected candidates and partial receipts must not replace a validated release')

    def test_rejected_manifest_never_publishes_candidate(self):
        self.assert_rejection_preserves_release('manifest', 'package, version or visible label')

    def test_rejected_provider_never_publishes_candidate(self):
        self.assert_rejection_preserves_release('provider', 'provider authority')

    def test_rejected_signature_never_publishes_candidate(self):
        self.assert_rejection_preserves_release('signature', 'v2 and v3')

    def test_rejected_embedded_html_never_publishes_candidate(self):
        self.assert_rejection_preserves_release('embedded', 'Packaged HTML')

    def test_changed_input_never_publishes_candidate(self):
        self.assert_rejection_preserves_release('changed-input', 'HTML changed')

    def test_wrong_signer_never_publishes_candidate(self):
        self.assert_rejection_preserves_release('certificate', 'Signing identity')

    def test_compile_failure_preserves_previous_validated_release(self):
        self.assert_rejection_preserves_release('compile', 'non-zero exit status')

    def test_bad_frozen_hash_stops_before_sdk_commands(self):
        with TemporaryDirectory(prefix='nightsweep-hash-test-') as tmp:
            harness = BuildHarness(Path(tmp) / 'build')
            with self.assertRaisesRegex(SystemExit, 'frozen SHA-256'):
                harness.run(['--expected-html-sha256', '0' * 64])
            self.assertEqual(harness.calls, [])
            self.assertEqual(files_under(harness.out), harness.before)

    def test_publication_copy_failure_preserves_release_and_receipt(self):
        original_copy = shutil.copy2
        with TemporaryDirectory(prefix='nightsweep-publish-copy-') as tmp:
            for prior in [False, True]:
                with self.subTest(prior_validated_release=prior):
                    harness = BuildHarness(Path(tmp) / str(prior), prior=prior)
                    def fail_receipt(source, destination, *args, **kwargs):
                        if Path(source).name == 'build-info.json' and Path(source).parent.name.startswith('release-candidate-'):
                            raise OSError('Synthetic full disk while copying receipt')
                        return original_copy(source, destination, *args, **kwargs)
                    with patch.object(harness.module.shutil, 'copy2', side_effect=fail_receipt):
                        with self.assertRaisesRegex(OSError, 'Synthetic full disk'):
                            harness.run()
                    self.assertEqual(files_under(harness.out), harness.before,
                                     'Copy failure cannot publish a new APK beside an old receipt')

    def test_promotion_failure_restores_previous_release(self):
        original_rename = Path.rename
        with TemporaryDirectory(prefix='nightsweep-publish-rename-') as tmp:
            harness = BuildHarness(Path(tmp) / 'build')
            def fail_promotion(path, target):
                if path.name == 'prepared' and '.publish-' in path.parent.name:
                    raise OSError('Synthetic directory promotion failure')
                return original_rename(path, target)
            with patch.object(Path, 'rename', fail_promotion):
                with self.assertRaisesRegex(OSError, 'Synthetic directory promotion'):
                    harness.run()
            self.assertEqual(files_under(harness.out), harness.before)

    def test_validated_candidate_publishes_matching_receipt(self):
        with TemporaryDirectory(prefix='nightsweep-success-test-') as tmp:
            harness = BuildHarness(Path(tmp) / 'build')
            harness.run()
            receipt = json.loads((harness.out / 'build-info.json').read_text())
            apk = harness.out / receipt['file']
            self.assertEqual(receipt['sha256'], hashlib.sha256(apk.read_bytes()).hexdigest())
            self.assertEqual(receipt['html_sha256'], hashlib.sha256(harness.asset.read_bytes()).hexdigest())
            self.assertEqual(receipt['version'], '2.0 Alpha build 4')
            self.assertEqual(receipt['version_code'], 28)
            self.assertTrue(receipt['embedded_html_matches_input'])
            self.assertFalse(receipt['tested_on_device'])
            with zipfile.ZipFile(apk) as archive:
                self.assertEqual(archive.read('assets/index.html'), harness.asset.read_bytes())

    def test_unsigned_candidate_compiles_without_signing_material_and_cannot_claim_update(self):
        with TemporaryDirectory(prefix='nightsweep-unsigned-test-') as tmp:
            harness = BuildHarness(Path(tmp) / 'build')
            shutil.rmtree(harness.root / 'signing-private')
            harness.run(['--unsigned'])
            unsigned_out = harness.root / 'dist/unsigned-preview'
            receipt = json.loads((unsigned_out / 'build-info.json').read_text())
            apk = unsigned_out / receipt['file']
            self.assertIn('unsigned', apk.name)
            self.assertFalse(receipt['signed'])
            self.assertFalse(receipt['installable'])
            self.assertIsNone(receipt['certificate_sha256'])
            self.assertFalse(receipt['matches_original_signing_identity'])
            for key in ['can_update_14_preview', 'can_update_prior_15_preview',
                        'can_update_prior_16_preview', 'can_update_supplied_013_in_place']:
                self.assertFalse(receipt[key], key)
            self.assertEqual(receipt['sha256'], hashlib.sha256(apk.read_bytes()).hexdigest())
            self.assertFalse(any('sign' in command or 'verify' in command for command in harness.calls))
            self.assertEqual(files_under(harness.out), harness.before,
                             'Unsigned candidates cannot replace the signed Preview output')

    def test_unsigned_rejection_preserves_signed_release(self):
        with TemporaryDirectory(prefix='nightsweep-unsigned-reject-') as tmp:
            harness = BuildHarness(Path(tmp) / 'build', scenario='manifest')
            shutil.rmtree(harness.root / 'signing-private')
            with self.assertRaisesRegex(SystemExit, 'package, version or visible label'):
                harness.run(['--unsigned'])
            self.assertEqual(files_under(harness.out), harness.before)
            self.assertEqual(files_under(harness.root / 'dist/unsigned-preview'), {})

    def test_signed_build_without_original_private_material_stops_before_sdk(self):
        with TemporaryDirectory(prefix='nightsweep-missing-signer-') as tmp:
            harness = BuildHarness(Path(tmp) / 'build')
            shutil.rmtree(harness.root / 'signing-private')
            with self.assertRaisesRegex(SystemExit, 'private signing backup'):
                harness.run()
            self.assertEqual(harness.calls, [])
            self.assertEqual(files_under(harness.out), harness.before)

    def test_alternative_private_signing_directory_keeps_certificate_pinning(self):
        with TemporaryDirectory(prefix='nightsweep-private-location-') as tmp:
            harness = BuildHarness(Path(tmp) / 'build')
            private = Path(tmp) / 'secure-local-source'
            (harness.root / 'signing-private').rename(private)
            harness.run(['--signing-dir', str(private)])
            sign = next(command for command in harness.calls if 'sign' in command)
            self.assertEqual(sign[sign.index('--ks') + 1], str(private / 'nightsweep-release.p12'))
            self.assertEqual(sign[sign.index('--ks-pass') + 1], 'file:' + str(private / 'keystore-password.txt'))
            receipt_text = (harness.out / 'build-info.json').read_text()
            self.assertNotIn(str(private), receipt_text)
            self.assertEqual(json.loads(receipt_text)['certificate_sha256'], harness.module.ORIGINAL_CERTIFICATE_SHA256)

    def test_standard_promotion_preserves_separate_preview_artifacts(self):
        module = load_builder(ANDROID / 'build.py')
        with TemporaryDirectory(prefix='nightsweep-standard-publish-') as tmp:
            root = Path(tmp)
            candidate, destination = root / 'candidate', root / 'dist'
            candidate.mkdir()
            (destination / 'preview').mkdir(parents=True)
            (destination / 'preview/preview.apk').write_bytes(b'existing separate preview')
            (candidate / 'standard.apk').write_bytes(b'verified standard APK placeholder')
            (candidate / 'build-info.json').write_text('{"matching":"standard"}')
            module.publish_release(candidate, destination)
            self.assertEqual((destination / 'preview/preview.apk').read_bytes(), b'existing separate preview')
            self.assertEqual((destination / 'standard.apk').read_bytes(), (candidate / 'standard.apk').read_bytes())
            self.assertEqual((destination / 'build-info.json').read_bytes(), (candidate / 'build-info.json').read_bytes())


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(AndroidPreviewTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if result.wasSuccessful():
        print('Android preview: ' + str(result.testsRun) + ' checks passed (mocked SDK; no APK/device verification)')
    sys.exit(not result.wasSuccessful())
