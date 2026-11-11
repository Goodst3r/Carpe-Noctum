#!/usr/bin/env python3
"""Create the user-authorized private master ZIP, including the original signing backup."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import argparse
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
TITLE = 'NightSweep 1.8 Alpha build 2'
VERSION = '1.8 Alpha build 2'
CERTIFICATE = 'a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca'
NATIVE_FILES = {'NightSweep-1.8-build2-preview.apk', 'NightSweep-1.8-build2-preview.apk.idsig',
                'build-info.json', 'apk-manifest-tree.txt', 'apk-manifest-verification.txt',
                'apk-signature-verification.txt'}
EXAMPLES = {
    'complete': 'Training_Job', 'aoi-six-active': 'Six_Active_Practice',
    'custom-curves': 'Custom_Curves_Practice', 'gainmaker-oem': 'GainMaker_OEM_AGC_Practice',
    'gainmaker-dsim': 'GainMaker_DSIM_Practice', 'gainmaker-manual': 'GainMaker_Manual_Thermal_Practice',
    'gs7k-node': 'GS7K_Practice',
}
CURRENT_GUIDES = [
    'NightSweep_1.8_Alpha_README.md', 'NightSweep_1.8_Alpha_README.html',
    'NightSweep_1.8_Alpha_Functions_README.md', 'NightSweep_1.8_Alpha_Functions_README.html',
    'NightSweep_1.8_Alpha_Functions_README.pdf',
    'NightSweep_1.8_Alpha_Android_iOS_Installation.md',
    'NightSweep_1.8_Alpha_Android_iOS_Installation.html',
    'NightSweep_1.8_Alpha_Android_iOS_Installation.pdf',
    'NightSweep_1.8_Setup_Guide.html', 'NightSweep_1.8_Math_Audit.html',
    'NightSweep_1.8_Equipment_Coverage.md', 'NightSweep_1.8_Equipment_Coverage.html',
    'NightSweep_1.8_Training_Coverage.md', 'NightSweep_1.8_Training_Coverage.html',
    'NightSweep_1.8_Release_Notes.md', 'Android_Install.html', 'iPhone_Install.html',
]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def checksum_text(files):
    return ''.join(sha(data) + '  ' + name + '\n' for name, data in sorted(files.items())).encode()

def json_file(path):
    return json.loads(path.read_text())

def safe_source(path):
    relative = path.relative_to(ROOT)
    forbidden = {'node_modules', '__pycache__', '.git', '.pytest_cache', '.superpowers', 'signing-private'}
    if not path.is_file() or path.is_symlink() or any(p in forbidden for p in relative.parts):
        return False
    if relative.as_posix() == 'SHA256SUMS.txt':
        return False
    if relative.parts[:2] == ('android-build', 'build'):
        return False
    if relative.parts[:2] == ('android-build', 'toolchain'):
        return relative.as_posix() == 'android-build/toolchain/download.py'
    if relative.parts[:2] == ('android-build', 'dist'):
        return relative.parts[:3] == ('android-build', 'dist', 'preview') and path.name in NATIVE_FILES
    if path.suffix.lower() in {'.apk', '.zip'}:
        return False
    if path.suffix.lower() in {'.p12', '.pfx', '.jks', '.keystore', '.key'}:
        return False
    if re.search(r'(?:keystore.password|signing.backup.*private|\.env(?:\.|$))', path.name, re.I):
        return False
    return True

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT.parent / 'deliverables')
    parser.add_argument('--private-signing-dir', type=Path, required=True,
                        help='Original signer directory; included only in PRIVATE_SIGNING by explicit owner request.')
    args = parser.parse_args()
    out = args.out.resolve()
    assert not out.is_relative_to(ROOT), 'Output must be outside the source tree.'
    qa = json_file(ROOT / 'qa/pwa-test-results.json')
    browser = json_file(ROOT / 'research/build2/browser/results.json')
    app = (ROOT / 'outputs/Night_Sweep.html').read_bytes()
    pwa = (ROOT / 'dist/index.html').read_bytes()
    assert qa['version'] == VERSION and qa['all_passed'] and qa['build_unchanged_during_tests']
    assert browser['passed'] and not browser['page_errors']
    assert sha(app) == qa['standalone_sha256'] == browser['standalone_sha256']
    assert sha(pwa) == qa['html_sha256'] == browser['pwa_sha256']
    native = ROOT / 'android-build/dist/preview'
    info = json_file(native / 'build-info.json')
    assert info['version'] == VERSION and info['version_code'] == 24
    assert info['package'] == 'com.spencerwilliams.nightsweep.preview'
    assert info['signed'] and info['installable'] and info['matches_original_signing_identity']
    assert info['certificate_sha256'] == CERTIFICATE
    assert info['html_sha256'] == info['frozen_html_sha256'] == sha(app)
    assert Path(info['file']).name == info['file']
    apk = native / info['file']
    assert apk.name == 'NightSweep-1.8-build2-preview.apk'
    assert sha(apk.read_bytes()) == info['sha256'] and apk.stat().st_size == info['size_bytes']
    signature = (native / 'apk-signature-verification.txt').read_text()
    assert re.search(r'v2 scheme.*true', signature) and re.search(r'v3 scheme.*true', signature)
    with ZipFile(apk) as z:
        assert z.testzip() is None and z.read('assets/index.html') == app
        assert not any(re.search(r'keystore|\.p12$|password', name, re.I) for name in z.namelist())
    receipt = json_file(ROOT / 'release/build2/validation.json')
    assert receipt['standalone_sha256'] == sha(app) and receipt['apk_sha256'] == info['sha256']
    assert receipt['qa']['all_passed'] and receipt['browser']['all_passed']
    files = {}
    signing_dir = args.private_signing_dir.resolve()
    assert not signing_dir.is_relative_to(ROOT), 'Keep working signing files outside the source tree.'
    private_names = ['nightsweep-release.p12', 'keystore-password.txt']
    assert all((signing_dir / name).is_file() for name in private_names), 'Original signing backup is incomplete.'
    signer_check = subprocess.run(['keytool', '-list', '-v', '-alias', 'nightsweep',
                                  '-keystore', str(signing_dir / private_names[0]),
                                  '-storepass:file', str(signing_dir / private_names[1])],
                                 capture_output=True, text=True, timeout=30)
    assert signer_check.returncode == 0, 'Original signing backup could not be verified.'
    fingerprints = re.findall(r'SHA256:\s*([0-9A-Fa-f:]+)', signer_check.stdout + signer_check.stderr)
    assert any(x.replace(':', '').lower() == CERTIFICATE for x in fingerprints), 'Private backup certificate mismatch.'
    for name in private_names:
        files['PRIVATE_SIGNING/' + name] = (signing_dir / name).read_bytes()
    files['PRIVATE_SIGNING/README_PRIVATE.txt'] = (
        'PRIVATE OWNER BACKUP — INCLUDED BY YOUR EXPLICIT REQUEST\n\n'
        'nightsweep-release.p12 is the original PKCS#12 signing key (alias nightsweep).\n'
        'keystore-password.txt is its original password file. Do not paste its contents into logs.\n'
        'Keep this master archive private. These files are not needed to install the APK.\n'
        'They are intentionally separate from Source/ and both public Web/PWA directories.\n'
        'For future compatible builds, use android-build/build.py --signing-dir with this folder;\n'
        'verify the existing Preview package, increasing version code, and pinned certificate.\n'
        'Original public certificate SHA-256: ' + CERTIFICATE + '\n'
    ).encode()
    for platform in ['Android', 'iOS']:
        files[f'{platform}/Web/NightSweep.html'] = app
        for path in sorted((ROOT / 'dist').rglob('*')):
            if path.is_file():
                files[f'{platform}/Web/PWA/' + path.relative_to(ROOT / 'dist').as_posix()] = path.read_bytes()
        files[f'{platform}/README.txt'] = (
            f'{TITLE} — {platform}\n\n'
            'Read Documentation/NightSweep_1.8_Alpha_Android_iOS_Installation.pdf from the package root.\n'
            'Web/NightSweep.html is the standalone browser copy. Web/PWA contains the deployable web app.\n'
            'Android and iOS PWA copies are identical; publish one intact folder to your approved HTTPS host for both platforms.\n'
            'Opening files from this ZIP does not install or publish the hosted PWA. The existing website was not updated by this package.\n'
            'Export and verify each current job before moving between devices, browsers, installed icons or APK storage.\n'
            + ('APK/NightSweep-1.8-build2-preview.apk is the signed Android Preview update, code 24. Preserve existing jobs and verify your external backups before installing.\n' if platform == 'Android' else 'iOS uses Safari/Home Screen. The Android APK cannot install on an iPhone or iPad. No IPA/App Store installer is supplied.\n')
        ).encode()
    for path in sorted(native.iterdir()):
        if path.is_file():
            assert path.name in NATIVE_FILES, 'Unexpected native output: ' + path.name
            files['Android/APK/' + path.name] = path.read_bytes()
    for name in CURRENT_GUIDES:
        files['Documentation/' + name] = (ROOT / 'docs' / name).read_bytes()
    for path in (ROOT / 'docs/assets').rglob('*'):
        if path.is_file():
            files['Documentation/assets/' + path.relative_to(ROOT / 'docs/assets').as_posix()] = path.read_bytes()
    catalog = json_file(ROOT / 'night-sweep/catalog.json')
    devices = {d['id']: d for d in catalog['devices']}
    for variant, suffix in EXAMPLES.items():
        name = 'NightSweep_1.8_Alpha_build_2_' + suffix + '.json'
        data = (ROOT / 'release' / name).read_bytes()
        job = json.loads(data)
        assert job['version'] == 1 and job['job']['training'] == 'guided-1.5'
        assert job['job'].get('trainingVariant', 'complete') == variant
        if variant == 'complete':
            assert job['node']['model'] == 'gs7000-12g' and job['sweepSetup']['selected'] == '42'
            actives = [r for r in job['rows'] if devices.get(r['device'], {}).get('active')]
            assert len(actives) == 2 and all(r['device'] == 'active_gm_gan_hgd' for r in actives)
            families = [devices.get(r['device'], {}).get('family', '') for r in job['rows']]
            assert all(any(brand in f for f in families) for brand in ['Scientific-Atlanta', 'GigaXtend', 'Technetix'])
            assert len(job['evidence']) == len(job['evidenceFiles']) == 6
        if variant == 'aoi-six-active':
            rows = {r['id']: r for r in job['rows']}
            def depth(row, seen):
                assert row['id'] not in seen
                parent = rows.get(row['parent'].split('::')[0])
                return int(bool(devices.get(row['device'], {}).get('active'))) + (depth(parent, seen | {row['id']}) if parent else 0)
            assert max(depth(r, set()) for r in job['rows']) >= 6
        files['Examples/' + name] = data
    source = {p.relative_to(ROOT).as_posix(): p.read_bytes() for p in sorted(ROOT.rglob('*')) if safe_source(p)}
    source['SHA256SUMS.txt'] = checksum_text(source)
    (ROOT / 'SHA256SUMS.txt').write_bytes(source['SHA256SUMS.txt'])
    files.update({'Source/' + name: data for name, data in source.items()})
    for path in (ROOT / 'release/build2').iterdir():
        if path.is_file():
            files['Verification/' + path.name] = path.read_bytes()
    files['Verification/automated-test-results.json'] = (ROOT / 'qa/pwa-test-results.json').read_bytes()
    files['Verification/browser-test-results.json'] = (ROOT / 'research/build2/browser/results.json').read_bytes()
    files['Verification/plugin-review.json'] = (ROOT / 'research/build2/plugin-review.json').read_bytes()
    files['NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt'] = (ROOT / 'NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt').read_bytes()
    files['START_HERE.md'] = f'''# {TITLE}

**Private master archive: contains your original signing key and password in PRIVATE_SIGNING/. Keep this complete archive private.**

This package includes the matching signed Android Preview APK, Android/iOS browser copies, all seven practice backups, source code, documentation and validation records.

1. Read **Documentation/NightSweep_1.8_Alpha_Android_iOS_Installation.pdf** before installing or moving jobs.
2. Android installer: **Android/APK/{apk.name}**. This uses the original Preview certificate and version code 24. Back up important jobs before the compatible update; keep the working app installed.
3. Browser copies: **Android/Web/NightSweep.html** or **iOS/Web/NightSweep.html**. Their **PWA/** folders are identical deployable builds for an approved HTTPS host. This archive does not publish or update the existing website. iOS Home Screen installation uses the hosted PWA.
4. All-functions manual: **Documentation/NightSweep_1.8_Alpha_Functions_README.pdf** (editable Markdown and HTML included).
5. Load any file in **Examples/** using **Files → Open project**, or open an example from Home. The complete workflow uses GS7K / GainMaker GaN and mixed Scientific Atlanta, GigaXtend and Technetix passives on 42/54 MHz. The separate AOI route has six serial actives on 204/258 MHz.
6. Read **NightSweep_1.8_Alpha_build_2_UPDATE_LOG.txt** for the cumulative 1.8 changes. **Verification/** contains this build's actual results; **Source/** contains the complete project and its retained historical test evidence.

All practice values and supplied originals are synthetic. Jobs remain local until exported. A report PDF/CSV is not a full project backup. Emulator/browser checks and physical-device checks are distinguished in Verification/validation.json.

**Android runtime limitation:** the emulator accepted the compatible Build 22-to-24 update and retained a generic app-private fixture. Both builds then encountered the same stock WebView renderer crash in that software emulator. Native screens, picker/save/share/print and retention of actual saved jobs/original evidence remain unverified. No physical Android or iPhone testing was performed. The verified APK is included with this limitation documented; browser results do not establish native runtime behavior.

Your original key and password are included only in **PRIVATE_SIGNING/**, as explicitly requested. Public web folders and **Source/** contain neither. Installed QA dependencies and downloaded Android toolchain/emulator files are excluded. Each packaged file has a SHA-256 entry in SHA256SUMS.txt.
'''.encode()
    files['SHA256SUMS.txt'] = checksum_text(files)
    for name in files:
        if re.search(r'(?:\.p12$|\.pfx$|\.jks$|\.keystore$|\.key$|keystore-password|signing_backup_PRIVATE)', name, re.I):
            assert name in {'PRIVATE_SIGNING/' + x for x in private_names}, name
        assert '/node_modules/' not in name and '/signing-private/' not in name
        assert '/android-build/toolchain/' not in name or name.endswith('/android-build/toolchain/download.py')
    out.mkdir(parents=True, exist_ok=True)
    target = out / (TITLE + '.zip')
    temporary = out / (TITLE + '.zip.pending')
    temporary.touch(mode=0o600, exist_ok=True)
    temporary.chmod(0o600)
    with ZipFile(temporary, 'w', ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(files.items()):
            z.writestr(TITLE + '/' + name, data)
    with ZipFile(temporary) as z:
        assert z.testzip() is None and len(z.namelist()) == len(files)
        for name, data in files.items():
            assert z.read(TITLE + '/' + name) == data, name
    temporary.replace(target)
    sidecar = out / (TITLE + '.sha256.txt')
    sidecar.write_text(sha(target.read_bytes()) + '  ' + target.name + '\n')
    print(json.dumps({'zip':str(target),'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'files':len(files),'source_files':len(source),'apk_sha256':info['sha256'],'standalone_sha256':sha(app),'qa_checks':qa['checks'],'browser_checks':browser['checks']},indent=2))

if __name__ == '__main__':
    main()
