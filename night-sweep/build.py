#!/usr/bin/env python3
"""Build the fresh standalone Carpe Noctum app from canonical app/ modules."""
from pathlib import Path
import subprocess
from map_assets import asset_script
ROOT=Path(__file__).resolve().parent.parent
subprocess.run(['node',str(ROOT/'app/build-ai.cjs')],cwd=ROOT,check=True)
subprocess.run(['node',str(ROOT/'scripts/prepare-ai.mjs')],cwd=ROOT,check=True)
bundle=subprocess.check_output(['node',str(ROOT/'app/bundle.cjs')],cwd=ROOT,text=True)
shell=(ROOT/'app/shell.html').read_text()
shell=shell.replace('/*APP_STYLE*/',(ROOT/'app/style.css').read_text().replace('</style','<\\/style'))
shell=shell.replace('<!--APP_ASSETS-->',asset_script(ROOT/'night-sweep/vendor/map'))
shell=shell.replace('/*APP_SCRIPT*/',bundle.replace('</script','<\\/script'))
out=ROOT/'outputs/Night_Sweep.html'
out.parent.mkdir(exist_ok=True)
out.write_text(shell)
print('Built Carpe Noctum 2.0 Alpha build 6:',out)
