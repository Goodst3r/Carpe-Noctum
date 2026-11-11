#!/usr/bin/env python3
"""Wrap the existing standalone NightSweep build as a dependency-free static PWA.

Run night-sweep/build.py first. This script leaves outputs/Night_Sweep.html
unchanged and emits only deployable public files to dist/. It requires Python's
standard library; PNG icon assets are committed alongside their original SVG.
"""
from pathlib import Path
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'pwa'
DIST = ROOT / 'dist'
app = (ROOT / 'outputs' / 'Night_Sweep.html').read_text()
files = {}
for relative in ['pwa.js', 'pwa.css', 'manifest.webmanifest']:
    files[relative] = (SOURCE / relative).read_bytes()
for icon in sorted((SOURCE / 'icons').glob('*')):
    if icon.is_file():
        files['icons/' + icon.name] = icon.read_bytes()
guide = ROOT / 'docs' / 'NightSweep_1.8_Alpha_README.html'
if guide.exists():
    files['guide.html'] = guide.read_bytes()
pages = {
    'install.html': SOURCE / 'install.html',
    'android.html': ROOT / 'docs' / 'Android_Install.html',
    'iphone.html': ROOT / 'docs' / 'iPhone_Install.html',
    'equipment-coverage.html': ROOT / 'docs' / 'NightSweep_1.8_Equipment_Coverage.html',
    'setup-guide.html': ROOT / 'docs' / 'NightSweep_1.8_Setup_Guide.html',
    'math-audit.html': ROOT / 'docs' / 'NightSweep_1.8_Math_Audit.html',
    'functions-guide.html': ROOT / 'docs' / 'NightSweep_1.8_Alpha_Functions_README.html',
    'phone-installation.html': ROOT / 'docs' / 'NightSweep_1.8_Alpha_Android_iOS_Installation.html',
    'training-coverage.html': ROOT / 'docs' / 'NightSweep_1.8_Training_Coverage.html',
}
for page, original in pages.items():
    files[page] = original.read_bytes()
for page in ['guide.html', *pages]:
    if page in files:
        content = files[page].decode()
        aliases = {original.name: public for public, original in pages.items()}
        aliases.update({original.with_suffix('.md').name: public for public, original in pages.items()})
        aliases[guide.name] = 'guide.html'
        def public_link(match):
            target = match.group(2)
            filename, marker, fragment = target.partition('#')
            return match.group(1) + aliases.get(filename, filename) + (marker + fragment if marker else '') + match.group(3)
        content = re.sub(r'(href=[\"\'])([^\"\']+)([\"\'])', public_link, content)
        files[page] = content.replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>', 1).encode()
files['robots.txt'] = b'User-agent: *\nDisallow: /\n'

# Copy local image/style dependencies from authored guides without any network.
for name, original in [('guide.html', guide), *pages.items()]:
    if name not in files:
        continue
    for target in re.findall(r'(?:src|href)=[\"\']([^\"\']+)', files[name].decode(), re.I):
        clean = target.split('#', 1)[0].split('?', 1)[0]
        if not clean or clean.startswith(('/', '.', 'http:', 'https:', 'mailto:', 'data:')) or clean in ['guide.html', *pages]:
            continue
        candidate = (original.parent / clean).resolve()
        if candidate.is_file() and candidate.is_relative_to(original.parent.resolve()):
            files[clean] = candidate.read_bytes()

worker_template = (SOURCE / 'service-worker.js').read_text()
# The version is a hash of every source byte needed by the deployed public app,
# plus this builder. Generated version metadata is excluded to avoid a cycle.
digest = hashlib.sha256()
for name, data in [('base-app.html', app.encode()), ('worker-template.js', worker_template.encode()), ('build-pwa.py', Path(__file__).read_bytes()), *sorted(files.items())]:
    digest.update(name.encode() + b'\0' + data + b'\0')
version = digest.hexdigest()[:20]
release = {'version': version, 'worker': f'sw.{version}.js', 'appVersion': '2.0 Alpha build 1'}
metadata = '\n'.join([
    '<meta name="robots" content="noindex,nofollow">',
    '<meta name="theme-color" content="#071014">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-title" content="NightSweep">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
    '<link rel="manifest" href="manifest.webmanifest">',
    '<link rel="icon" type="image/svg+xml" href="icons/icon.svg">',
    '<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">',
    '<link rel="stylesheet" href="pwa.css">',
])
app = app.replace('</head>', metadata + '\n</head>', 1)
injection = '<script type="application/json" id="nightSweepPwaConfig">' + json.dumps(release, separators=(',', ':')) + '</script>\n<script src="pwa.js"></script>\n'
app = app.replace('</body>', injection + '</body>', 1)
files['index.html'] = app.encode()
assets = sorted(files)
hashes = {name: hashlib.sha256(files[name]).hexdigest() for name in assets}
worker = worker_template.replace('__VERSION__', json.dumps(version)).replace('__ASSETS__', json.dumps(assets, separators=(',', ':'))).replace('__HASHES__', json.dumps(hashes, separators=(',', ':')))
files[release['worker']] = worker.encode()
# release.json is deliberately network-only. No personal data is in this file.
files['release.json'] = (json.dumps(release, indent=2) + '\n').encode()

# A rebuild cannot accidentally publish source, fixtures, APKs or job data.
DIST.mkdir(parents=True, exist_ok=True)
for old in DIST.iterdir():
    if old.is_dir():
        shutil.rmtree(old)
    else:
        old.unlink()
for name, data in sorted(files.items()):
    target = DIST / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
print(f'Built NightSweep 2.0 Alpha build 1 PWA {version}: {len(assets)} offline assets → {DIST}')
