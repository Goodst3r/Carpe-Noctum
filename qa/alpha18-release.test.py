#!/usr/bin/env python3
"""Audit the generated release and guide links without network or signing keys."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent
checks = []

def check(name, fn):
    fn()
    checks.append(name)
    print('PASS ' + name)

def require(value, message):
    if not value:
        raise AssertionError(message)

class Links(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.links, self.duplicates = set(), [], []
        self.feed(source)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            if attrs['id'] in self.ids:
                self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])

def release_identity():
    global release
    release = json.loads((ROOT / 'dist/release.json').read_text())
    require(release['appVersion'] == '2.0 Alpha build 1', 'PWA release identity')
    for name in ('outputs/Night_Sweep.html', 'dist/index.html'):
        html = (ROOT / name).read_text()
        require('<title>NightSweep 2.0 Alpha build 1</title>' in html, name + ' title')
        require('NightSweep_2.0_Alpha_build_1_Project.json' in html, name + ' export identity')
        require('NightSweep_1.7_Alpha_' not in html, name + ' stale export identity')
    require(release['worker'] == 'sw.' + release['version'] + '.js', 'worker filename')

def embedded_app():
    standalone = (ROOT / 'outputs/Night_Sweep.html').read_text()
    pwa = (ROOT / 'dist/index.html').read_text()
    # Both wrappers must contain the same training and calculation implementations.
    for start, end in [('const TrainingJob=', 'function initTraining(){TrainingJob.init();}'),
                       ('const HFC =', "if(typeof module")]:
        i, j = standalone.find(start), standalone.find(end, standalone.find(start))
        require(i >= 0 and j > i, 'implementation markers: ' + start)
        require(standalone[i:j] in pwa, 'standalone/PWA implementation mismatch: ' + start)
    builder = (ROOT / 'night-sweep/build.py').read_text()
    modules = re.findall(r"\('<!--[A-Z]+-->', '([^']+\.js)'\)", builder)
    modules.append('dsim-pilot-codes.js')
    for module in modules:
        require((ROOT / 'night-sweep' / module).read_text() in standalone,
                'generated standalone differs from tested source module: ' + module)

def guide_copies():
    require((ROOT / 'night-sweep/README.md').read_bytes() ==
            (ROOT / 'docs/NightSweep_1.8_Alpha_README.md').read_bytes(), 'technician guide copies differ')
    for filename in ['NightSweep_1.8_Alpha_README.html', 'NightSweep_1.8_Setup_Guide.html',
                     'NightSweep_1.8_Equipment_Coverage.html', 'NightSweep_1.8_Math_Audit.html',
                     'NightSweep_1.8_Alpha_Functions_README.html',
                     'NightSweep_1.8_Alpha_Android_iOS_Installation.html',
                     'NightSweep_1.8_Training_Coverage.html']:
        html = (ROOT / 'docs' / filename).read_text()
        parsed = Links(html)
        require('1.8' in html[:2000], filename + ' identity')
        require(not parsed.duplicates, filename + ' duplicate IDs: ' + str(parsed.duplicates))
        for target in parsed.links:
            if target.startswith('#') and len(target) > 1:
                require(unquote(target[1:]) in parsed.ids, filename + ' broken fragment: ' + target)

def offline_guide_links():
    names = ['guide.html', 'setup-guide.html', 'equipment-coverage.html', 'math-audit.html',
             'install.html', 'android.html', 'iphone.html', 'functions-guide.html',
             'phone-installation.html', 'training-coverage.html']
    for name in names:
        html = (ROOT / 'dist' / name).read_text()
        parsed = Links(html)
        for target in parsed.links:
            split = urlsplit(target)
            if split.scheme or split.netloc or not split.path:
                continue
            path = (ROOT / 'dist' / unquote(split.path)).resolve()
            require(path.is_relative_to((ROOT / 'dist').resolve()) and path.is_file(), name + ' missing local target: ' + target)

def public_boundaries():
    names = [str(p.relative_to(ROOT / 'dist')) for p in (ROOT / 'dist').rglob('*') if p.is_file()]
    require(not any(name.endswith(('.apk', '.java', '.py', '.cjs', '.zip')) for name in names), 'developer/native archive in public PWA')
    require(not any(part in name.lower() for name in names for part in ['signing', 'training_job.json', 'node_modules', 'build-info']), 'private/developer data in public PWA')
    require(len([name for name in names if re.fullmatch(r'sw\..*\.js', name)]) == 1, 'stale worker left in dist')

def android_readiness():
    metadata = json.loads((ROOT / 'android-build/build-readiness.json').read_text())
    require(metadata['version'] == '2.0 Alpha build 1' and metadata['version_code'] == 25, 'Android source metadata')
    require(type(metadata.get('final_apk_built')) is bool, 'Android final-build state must be explicit')
    require(metadata.get('physical_device_tests') is False, 'physical device test claim')
    source = (ROOT / 'android-build/build.py').read_text()
    require("VERSION_NAME = '2.0 Alpha build 1'" in source and 'VERSION_CODE = 25' in source, 'Android source identity')
    if metadata['final_apk_built']:
        import zipfile
        output = ROOT / 'android-build/dist/preview'
        receipt = json.loads((output / 'build-info.json').read_text())
        require(receipt.get('signed') is True and receipt.get('installable') is True, 'final APK must be signed and installable')
        require(receipt.get('version') == metadata['version'] and receipt.get('version_code') == 25, 'final APK release identity')
        require(receipt.get('package') == 'com.spencerwilliams.nightsweep.preview', 'compatible Preview package')
        expected_certificate = 'a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca'
        require(receipt.get('certificate_sha256') == expected_certificate and receipt.get('matches_original_signing_identity') is True, 'original compatible-update signer')
        apk = (output / receipt['file']).resolve()
        require(apk.parent == output.resolve() and apk.suffix == '.apk' and apk.is_file(), 'final APK path')
        require(apk.stat().st_size == receipt['size_bytes'], 'final APK byte length')
        apk_hash = hashlib.sha256(apk.read_bytes()).hexdigest()
        require(apk_hash == receipt['sha256'] == metadata.get('apk_sha256'), 'final APK hash/receipts disagree')
        shared_html = (ROOT / 'outputs/Night_Sweep.html').read_bytes()
        html_hash = hashlib.sha256(shared_html).hexdigest()
        require(html_hash == receipt.get('html_sha256') == receipt.get('frozen_html_sha256') == metadata.get('standalone_sha256'), 'final frozen shared HTML identity')
        with zipfile.ZipFile(apk) as archive:
            require(archive.read('assets/index.html') == shared_html, 'APK embeds final checked shared HTML')
            require(not any(name.endswith(('.p12', '.jks', '.keystore')) or 'keystore-password' in name.lower() for name in archive.namelist()), 'private signing material in APK')
        signatures = (output / 'apk-signature-verification.txt').read_text()
        require('Signer #1 certificate SHA-256 digest: ' + expected_certificate in signatures, 'signature receipt signer')
        require(all('Verified using ' + scheme + ' scheme (APK Signature Scheme ' + scheme + '): true' in signatures for scheme in ['v2', 'v3']), 'final APK signature schemes')
        manifest = (output / 'apk-manifest-verification.txt').read_text()
        require("package: name='com.spencerwilliams.nightsweep.preview' versionCode='25' versionName='2.0 Alpha build 1'" in manifest, 'manifest receipt release identity')
        require('com.spencerwilliams.nightsweep.preview.pickerfiles' in (output / 'apk-manifest-tree.txt').read_text(), 'compatible private provider authority')

check('Standalone and PWA identify the current 2.0 release', release_identity)
check('Standalone and PWA carry identical core implementations', embedded_app)
check('Current technician guides match and have working table-of-contents links', guide_copies)
check('Published guide files reference bundled local targets', offline_guide_links)
check('Public PWA excludes developer packages and obsolete service workers', public_boundaries)
check('Android build 25 readiness verifies final signed artifacts or explicitly remains pending', android_readiness)
print(f'Alpha18 release: {len(checks)} checks passed')
