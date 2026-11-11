#!/usr/bin/env python3
"""Package verified 1.8 artifacts locally; never signs an APK or publishes a site."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import argparse
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent.parent
EXAMPLES = [
    'NightSweep_1.8_Alpha_Training_Job.json', 'NightSweep_1.8_Six_Active_Practice.json',
    'NightSweep_1.8_Custom_Curves_Practice.json', 'NightSweep_1.8_GainMaker_OEM_AGC_Practice.json',
    'NightSweep_1.8_GainMaker_DSIM_Practice.json', 'NightSweep_1.8_GainMaker_Manual_Thermal_Practice.json',
    'NightSweep_1.8_GS7K_Practice.json',
]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def sums(files):
    return ''.join(sha(data) + '  ' + name + '\n' for name, data in sorted(files.items())).encode()

def archive(path, files):
    with ZipFile(path, 'w', ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(files.items()):
            z.writestr(name, data)
    with ZipFile(path) as z:
        assert z.testzip() is None
        assert set(z.namelist()) == set(files)
        for name, data in files.items():
            assert z.read(name) == data, name

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT.parent / 'deliverables')
    args = parser.parse_args()
    output = args.out.resolve()
    if output.is_relative_to(ROOT):
        raise SystemExit('Write packages outside the source tree to avoid recursive archives.')
    qa = json.loads((ROOT / 'qa/pwa-test-results.json').read_text())
    browser = json.loads((ROOT / 'research/alpha18/browser/results.json').read_text())
    html = (ROOT / 'outputs/Night_Sweep.html').read_bytes()
    pwa = (ROOT / 'dist/index.html').read_bytes()
    assert qa['all_passed'] and qa['build_unchanged_during_tests'] and qa['version'] == '1.8 Alpha'
    assert browser['passed'] and not browser['page_errors']
    assert sha(html) == qa['standalone_sha256'] == browser['standalone_sha256']
    assert sha(pwa) == qa['html_sha256'] == browser['pwa_sha256']
    for name in EXAMPLES:
        data = json.loads((ROOT / 'release' / name).read_text())
        assert data['version'] == 1 and data['job']['training'] == 'guided-1.5', name
    output.mkdir(parents=True, exist_ok=True)
    standalone = output / 'NightSweep_1.8_Alpha.html'
    standalone.write_bytes(html)
    share = {'NightSweep.html': html}
    for name in ['NightSweep_1.8_Alpha_README.md', 'NightSweep_1.8_Alpha_README.html',
                 'NightSweep_1.8_Setup_Guide.html', 'NightSweep_1.8_Math_Audit.html',
                 'NightSweep_1.8_Equipment_Coverage.html', 'NightSweep_1.8_Training_Coverage.md',
                 'NightSweep_1.8_Training_Coverage.html']:
        share[name] = (ROOT / 'docs' / name).read_bytes()
    for name in EXAMPLES:
        share['examples/' + name] = (ROOT / 'release' / name).read_bytes()
    share['START_HERE.md'] = ('''# NightSweep 1.8 Alpha

Open NightSweep.html in a supported browser. On Home, use Practice library to open any of seven exercises, or expand Load an example for any feature to choose one of 37 seeded feature examples. Six active devices in series is the requested six-deep run.

Complete field workflow uses GS7K and GainMaker GaN with Scientific Atlanta, GigaXtend and Technetix passives on the 42/54 MHz workflow. The separate six-active example uses Vecima/AOI on 204/258 MHz.

The examples folder contains portable project backups. Use Files → Open project to load one; use Files → Save project to keep an external backup. Bundled values and originals are synthetic training data.

Read NightSweep_1.8_Alpha_README.html for field workflow and backup instructions. Existing hosted/installed releases are separate: this package does not update the public website or include a newly signed 1.8 APK. Android build 23 source is in the separate Codex handoff; its original private signing key is required.

Keep existing phone jobs and exports. APK and browser storage are separate. Manufacturer/setup links need connectivity. Real Android/iPhone/Safari/WebView and native picker/printing checks remain physical-device work.
''').encode()
    share['SHA256SUMS.txt'] = sums(share)
    share_zip = output / 'NightSweep_1.8_Alpha_Package.zip'
    archive(share_zip, share)
    pwa_files = {str(path.relative_to(ROOT / 'dist')): path.read_bytes()
                 for path in sorted((ROOT / 'dist').rglob('*')) if path.is_file()}
    pwa_zip = output / 'NightSweep_1.8_Alpha_PWA.zip'
    archive(pwa_zip, pwa_files)
    excluded = {'node_modules', '__pycache__', '.git', 'signing-private', '.superpowers', '.pytest_cache'}
    source = {}
    for path in sorted(ROOT.rglob('*')):
        relative = path.relative_to(ROOT)
        if not path.is_file() or path.is_symlink() or any(part in excluded for part in relative.parts):
            continue
        if relative.as_posix() == 'SHA256SUMS.txt' or relative.parts[:2] in [('android-build', 'build'), ('android-build', 'dist')]:
            continue
        source[relative.as_posix()] = path.read_bytes()
    checksum = sums(source)
    (ROOT / 'SHA256SUMS.txt').write_bytes(checksum)
    source['SHA256SUMS.txt'] = checksum
    source_zip = output / 'NightSweep_1.8_Alpha_Codex_Handoff.zip'
    archive(source_zip, source)
    report = ROOT / 'research/alpha18/AUDIT_SUMMARY.md'
    if report.exists():
        shutil.copy2(report, output / 'NightSweep_1.8_Alpha_Audit.md')
    artifacts = {p.name: {'bytes': p.stat().st_size, 'sha256': sha(p.read_bytes())}
                 for p in [standalone, share_zip, pwa_zip, source_zip]}
    (output / 'SHA256SUMS.txt').write_bytes(sums({p.name: p.read_bytes() for p in output.iterdir() if p.is_file() and p.name != 'SHA256SUMS.txt'}))
    print(json.dumps({'artifacts': artifacts, 'source_files': len(source), 'share_files': len(share), 'pwa_files': len(pwa_files)}, indent=2))

if __name__ == '__main__':
    main()
