#!/usr/bin/env python3
"""Package the fresh standalone application and checksum-pinned offline shell."""
from pathlib import Path
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
files={}
for name in ['pwa.js','manifest.webmanifest']:
    files[name]=(ROOT/'pwa'/name).read_bytes()
for p in sorted((ROOT/'pwa/icons').glob('*')):
    if p.is_file():files['icons/'+p.name]=p.read_bytes()
for p in sorted((ROOT/'artifacts/ai').rglob('*')):
    if p.is_file():files['ai/'+str(p.relative_to(ROOT/'artifacts/ai'))]=p.read_bytes()
files['guide.html']=(ROOT/'docs/rebuild/guide.html').read_bytes()
app=(ROOT/'outputs/Night_Sweep.html').read_text()
worker_template=(ROOT/'pwa/service-worker.js').read_text()
digest=hashlib.sha256()
for name,data in sorted([('app',app.encode()),('worker',worker_template.encode()),*files.items()]):digest.update(name.encode()+b'\0'+data+b'\0')
version=digest.hexdigest()[:20]
release={'version':version,'worker':f'sw.{version}.js','appVersion':'2.0 Alpha build 5'}
app=app.replace('</head>','<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"></head>')
config='<script id="carpe-pwa-config" type="application/json">'+json.dumps(release)+'</script><script src="pwa.js"></script>'
files['index.html']=app.replace('</body>',config+'</body>').encode()
hashes={name:hashlib.sha256(data).hexdigest() for name,data in files.items()}
worker=worker_template.replace('__VERSION__',json.dumps(version)).replace('__ASSETS__',json.dumps(sorted(name for name in files if not name.startswith('ai/')))).replace('__HASHES__',json.dumps(hashes))
files[release['worker']]=worker.encode()
files['release.json']=(json.dumps(release,indent=2)+'\n').encode()
files['robots.txt']=b'User-agent: *\nDisallow: /\n'
DIST.mkdir(exist_ok=True)
for old in DIST.iterdir():
    if old.is_dir():shutil.rmtree(old)
    else:old.unlink()
for name,data in files.items():
    p=DIST/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
print(f'Built fresh PWA {version}: {len(files)} public assets')
