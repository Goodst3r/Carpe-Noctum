#!/usr/bin/env python3
"""Build the offline Carpe Noctum alpha with official Android SDK tools.
Usage: python3 build.py /absolute/path/to/Night_Sweep.html [--preview] [--unsigned]
No Gradle, remote service, account, or internet is used after toolchain setup.
"""
from pathlib import Path
import argparse, subprocess, shutil, os, zipfile, hashlib, json, re
from tempfile import TemporaryDirectory, mkdtemp

ORIGINAL_CERTIFICATE_SHA256 = 'a7c2596c2ab550f3b403fcfc1e84ec271bf18408ec55267d55e3698d153046ca'
SUPPLIED_013_CERTIFICATE_SHA256 = '7998433ff49dc46b1157f69c917fb9b7e93936a5845140f054f9488ad7519e5b'
STANDARD_PACKAGE = 'com.spencerwilliams.nightsweep'
PREVIEW_PACKAGE = STANDARD_PACKAGE + '.preview'
VERSION_NAME = '2.0 Alpha build 4'
VERSION_CODE = 28


def publish_release(candidate, destination):
    """Promote matching APK/receipts together and retain the last release on failure."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    promotion = Path(mkdtemp(prefix='.' + destination.name + '.publish-', dir=destination.parent))
    prepared, previous = promotion / 'prepared', promotion / 'previous'
    keep_recovery = False
    try:
        if destination.exists():
            # Standard output can contain the separately built Preview directory.
            shutil.copytree(destination, prepared)
        else:
            prepared.mkdir()
        for artifact in candidate.iterdir():
            shutil.copy2(artifact, prepared / artifact.name)
        had_previous = destination.exists()
        if had_previous:
            destination.rename(previous)
        try:
            prepared.rename(destination)
        except BaseException:
            if had_previous:
                try:
                    previous.rename(destination)
                except BaseException as recovery_error:
                    keep_recovery = True
                    raise RuntimeError('Release promotion failed; prior release retained for recovery at ' + str(previous)) from recovery_error
            raise
    finally:
        if not keep_recovery:
            shutil.rmtree(promotion, ignore_errors=True)


def prepare_sources(canonical, staged, asset, preview=False):
    """Use disposable build sources; never rewrite the canonical Java/manifest/assets."""
    if staged.exists():
        shutil.rmtree(staged)
    shutil.copytree(canonical, staged)
    shutil.copy2(asset, staged / 'assets/index.html')
    package = PREVIEW_PACKAGE if preview else STANDARD_PACKAGE
    label = 'Carpe Noctum ' + VERSION_NAME.replace(' Alpha', ' Preview') if preview else 'Carpe Noctum ' + VERSION_NAME
    if preview:
        manifest = staged / 'AndroidManifest.xml'
        text = manifest.read_text()
        text = text.replace('package="' + STANDARD_PACKAGE + '"', 'package="' + package + '"')
        text = text.replace('android:label="Carpe Noctum ' + VERSION_NAME + '"', 'android:label="' + label + '"')
        text = text.replace('android:name=".MainActivity"', 'android:name="' + STANDARD_PACKAGE + '.MainActivity"')
        text = text.replace('android:name=".PickerFiles"', 'android:name="' + STANDARD_PACKAGE + '.PickerFiles"')
        text = text.replace('android:authorities="' + STANDARD_PACKAGE + '.pickerfiles"', 'android:authorities="' + package + '.pickerfiles"')
        manifest.write_text(text)
    return package, label


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('html', type=Path)
    parser.add_argument('--preview', action='store_true', help='Build the preview package: updates prior 1.4/1.5 Preview with the original key; coexists separately with supplied 0.13.')
    parser.add_argument('--unsigned', action='store_true', help='Compile an unsigned, non-installable candidate without accessing a keystore; never replaces signed release output.')
    parser.add_argument('--signing-dir', type=Path, help='Private directory containing nightsweep-release.p12 and keystore-password.txt; default is signing-private beside this script. The certificate remains pinned.')
    parser.add_argument('--expected-html-sha256', help='Pin the independently frozen standalone HTML. Refuse a changed input before compiling or signing.')
    parser.add_argument('--expected-certificate-sha256', default=ORIGINAL_CERTIFICATE_SHA256, help='Pin the intended signing certificate. For a preserving 0.13 update, supply its private key and its certificate SHA-256 explicitly.')
    args = parser.parse_args()
    expected_certificate = args.expected_certificate_sha256.lower().replace(':', '')
    if not re.fullmatch(r'[0-9a-f]{64}', expected_certificate):
        parser.error('Expected certificate SHA-256 must contain exactly 64 hexadecimal digits.')
    root = Path(__file__).resolve().parent
    sdk = root / 'toolchain'; bt = sdk / 'build-tools/android-15'; platform = sdk / 'platform/android-35/android.jar'; ecj = sdk / 'ecj.jar'
    variant = 'preview' if args.preview else 'standard'
    canonical = root / 'app/src/main'; build = root / 'build' / (('unsigned-' if args.unsigned else '') + variant)
    release_out = root / 'dist' / ('unsigned-' + variant) if args.unsigned else root / 'dist' / 'preview' if args.preview else root / 'dist'
    private = args.signing_dir.resolve() if args.signing_dir else root / 'signing-private'
    build.mkdir(parents=True, exist_ok=True)
    password = private / 'keystore-password.txt'; key = private / 'nightsweep-release.p12'
    if not args.unsigned and (not key.is_file() or not password.is_file()):
        raise SystemExit('Restore the intended private signing backup into signing-private/ before building. No replacement key is generated.')
    asset = args.html.resolve()
    if not asset.is_file():
        raise SystemExit('HTML asset does not exist: ' + str(asset))
    html_sha256 = hashlib.sha256(asset.read_bytes()).hexdigest()
    if args.expected_html_sha256:
        frozen_hash = args.expected_html_sha256.lower()
        if not re.fullmatch(r'[0-9a-f]{64}', frozen_hash):
            parser.error('Expected HTML SHA-256 must contain exactly 64 hexadecimal digits.')
        if html_sha256 != frozen_hash:
            raise SystemExit('Standalone HTML differs from the frozen SHA-256; no APK was compiled or signed.')
    training_job_included = all(marker in asset.read_text() for marker in ['const TrainingJob=', "const marker='guided-1.5'", 'initTraining();'])
    if not training_job_included:
        raise SystemExit('The 2.0 build 28 HTML must include the guided synthetic training job.')
    sweep_setup_included = 'const SweepSetup=' in asset.read_text() or 'const SweepSetup =' in asset.read_text()
    if not sweep_setup_included:
        raise SystemExit('The 2.0 HTML must include the guided sweep setup module.')
    if 'Carpe Noctum ' + VERSION_NAME not in asset.read_text():
        raise SystemExit('Standalone HTML does not identify the intended 2.0 Alpha release.')
    # Failed compilation or validation must not publish an APK or partial receipts,
    # and must leave the previous validated release available for rollback.
    with TemporaryDirectory(prefix='release-candidate-', dir=build) as candidate:
        out = Path(candidate)
        source = build / 'source'
        package, label = prepare_sources(canonical, source, asset, args.preview)
        for name in ['aapt2', 'zipalign', 'apksigner', 'd8']:
            (bt / name).chmod(0o755)
        def run(command, **kwargs):
            subprocess.run([str(value) for value in command], check=True, **kwargs)
        compiled = build / 'resources.zip'; unsigned = build / 'unsigned.apk'; aligned = build / 'aligned.apk'
        apk = out / ('CarpeNoctum-2.0-build4-' + ('preview' if args.preview else 'alpha') + ('-unsigned' if args.unsigned else '') + '.apk')
        for path in [compiled, unsigned, aligned, apk]:
            path.unlink(missing_ok=True)
        classes = build / 'classes'; dex = build / 'dex'
        for path in [classes, dex]:
            if path.exists(): shutil.rmtree(path)
            path.mkdir()
        run([bt / 'aapt2', 'compile', '--dir', source / 'res', '-o', compiled])
        run([bt / 'aapt2', 'link', '-o', unsigned, '--manifest', source / 'AndroidManifest.xml', '-I', platform, '-A', source / 'assets', '--min-sdk-version', '26', '--target-sdk-version', '35', compiled])
        run(['java', '-jar', ecj, '-source', '8', '-target', '8', '-bootclasspath', str(platform) + os.pathsep + str(bt / 'core-lambda-stubs.jar'), '-d', classes, *source.glob('java/**/*.java')])
        classzip = build / 'classes.zip'
        with zipfile.ZipFile(classzip, 'w') as archive:
            for path in classes.rglob('*.class'): archive.write(path, path.relative_to(classes).as_posix())
        run(['java', '-cp', bt / 'lib/d8.jar', 'com.android.tools.r8.D8', '--release', '--min-api', '26', '--lib', platform, '--output', dex, classzip])
        with zipfile.ZipFile(unsigned, 'a', compression=zipfile.ZIP_DEFLATED) as archive:
            for path in dex.glob('*.dex'): archive.write(path, path.name)
        run([bt / 'zipalign', '-f', '-p', '4', unsigned, aligned])
        certificate = None
        if args.unsigned:
            shutil.copy2(aligned, apk)
            (out / 'apk-signature-verification.txt').write_text('Unsigned candidate. Not signed or installable; no compatible-update claim.\n')
        else:
            run(['java', '-jar', bt / 'lib/apksigner.jar', 'sign', '--ks', key, '--ks-key-alias', 'nightsweep', '--ks-pass', 'file:' + str(password), '--out', apk, aligned])
            verify = subprocess.run(['java', '-jar', str(bt / 'lib/apksigner.jar'), 'verify', '--verbose', '--print-certs', str(apk)], check=True, text=True, capture_output=True)
            (out / 'apk-signature-verification.txt').write_text(verify.stdout)
        run([bt / 'zipalign', '-c', '-v', '4', apk], stdout=subprocess.DEVNULL)
        manifest = subprocess.run([str(bt / 'aapt2'), 'dump', 'badging', str(apk)], check=True, text=True, capture_output=True)
        (out / 'apk-manifest-verification.txt').write_text(manifest.stdout)
        expected = "package: name='" + package + "' versionCode='" + str(VERSION_CODE) + "' versionName='" + VERSION_NAME + "'"
        if expected not in manifest.stdout or "application-label:'" + label + "'" not in manifest.stdout:
            raise SystemExit('APK package, version or visible label did not match the intended release.')
        xml = subprocess.run([str(bt / 'aapt2'), 'dump', 'xmltree', '--file', 'AndroidManifest.xml', str(apk)], check=True, text=True, capture_output=True)
        (out / 'apk-manifest-tree.txt').write_text(xml.stdout)
        if package + '.pickerfiles' not in xml.stdout:
            raise SystemExit('APK document provider authority does not match the selected app package.')
        if not args.unsigned:
            certificate_match = re.search(r'Signer #1 certificate SHA-256 digest: ([0-9a-f]+)', verify.stdout)
            certificate = certificate_match.group(1) if certificate_match else None
            if certificate != expected_certificate:
                raise SystemExit('Signing identity differs from the explicitly pinned certificate; candidate not published.')
            if 'Verified using v2 scheme (APK Signature Scheme v2): true' not in verify.stdout or 'Verified using v3 scheme (APK Signature Scheme v3): true' not in verify.stdout:
                raise SystemExit('Expected v2 and v3 APK signatures did not verify.')
        with zipfile.ZipFile(apk) as archive:
            if hashlib.sha256(asset.read_bytes()).hexdigest() != html_sha256:
                apk.unlink(missing_ok=True)
                raise SystemExit('Standalone HTML changed during the build; APK removed.')
            if archive.read('assets/index.html') != asset.read_bytes():
                raise SystemExit('Packaged HTML does not match build input.')
        info = {'file': apk.name, 'size_bytes': apk.stat().st_size, 'sha256': hashlib.sha256(apk.read_bytes()).hexdigest(), 'html_sha256': html_sha256, 'frozen_html_sha256': args.expected_html_sha256, 'version': VERSION_NAME, 'version_code': VERSION_CODE, 'package': package, 'label': label, 'min_sdk': 26, 'target_sdk': 35, 'tested_on_device': False, 'preview': args.preview, 'separate_storage_from_supplied_013': args.preview, 'can_update_14_preview': package == PREVIEW_PACKAGE and certificate == ORIGINAL_CERTIFICATE_SHA256, 'shares_storage_with_14_preview': package == PREVIEW_PACKAGE, 'can_update_prior_15_preview': package == PREVIEW_PACKAGE and certificate == ORIGINAL_CERTIFICATE_SHA256, 'can_update_prior_16_preview': package == PREVIEW_PACKAGE and certificate == ORIGINAL_CERTIFICATE_SHA256, 'training_job_included': training_job_included, 'sweep_setup_included': sweep_setup_included, 'can_coexist_with_supplied_013': args.preview, 'embedded_html_matches_input': True, 'certificate_sha256': certificate, 'matches_original_signing_identity': certificate == ORIGINAL_CERTIFICATE_SHA256, 'supplied_013_certificate_sha256': SUPPLIED_013_CERTIFICATE_SHA256, 'can_update_supplied_013_in_place': package == STANDARD_PACKAGE and certificate == SUPPLIED_013_CERTIFICATE_SHA256}
        info.update(signed=not args.unsigned, installable=not args.unsigned,
                    artifact_kind='unsigned candidate' if args.unsigned else 'signed release',
                    shares_storage_with_14_preview=not args.unsigned and package == PREVIEW_PACKAGE,
                    can_coexist_with_supplied_013=not args.unsigned and args.preview)
        (out / 'build-info.json').write_text(json.dumps(info, indent=2) + '\n')
        publish_release(out, release_out)
        print(json.dumps(info, indent=2))


if __name__ == '__main__':
    main()
