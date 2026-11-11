#!/usr/bin/env python3
"""Rendered cascade checks; release mode reads the frozen standalone unchanged."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import importlib.util
import json
import re
import os
import sys
import hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'qa'))
from evidence_path import evidence_path
OUT=evidence_path('research/build2/layout-candidate.html').parent
src=ROOT/'night-sweep';html=(src/'shell.html').read_text()
for token,name in re.findall(r"\('([^']*<!--[^']*-->)', '([^']+)'\)",(src/'build.py').read_text()):
 data=(src/name).read_text()
 if name=='catalog.json':
  c=json.loads(data);c['setupManuals']=json.loads((src/'setup-manuals.json').read_text());data=json.dumps(c,separators=(',',':'),ensure_ascii=False)
 html=html.replace(token,data)
html=html.replace('<!--DSIMPILOTCODES-->',(src/'dsim-pilot-codes.js').read_text())
release_mode=os.environ.get('NIGHTSWEEP_RELEASE_TEST')=='1'
if release_mode:
 html=(ROOT/'outputs/Night_Sweep.html').read_text()
(OUT/'layout-candidate.html').write_text(html)
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(OUT)));Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
def check(name,value):
 if not value:raise AssertionError(name)
 checks.append(name);print('PASS '+name,flush=True)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None,headless=True,args=['--no-sandbox'])
  for width in [360,390,768,1280]:
   context=browser.new_context(viewport={'width':width,'height':844},is_mobile=width<600,has_touch=width<600)
   page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
   page.goto(f'http://127.0.0.1:{server.server_port}/layout-candidate.html')
   page.wait_for_function('typeof TrainingJob!=="undefined" && typeof WorkflowUI!=="undefined"')
   page.evaluate('''()=>{const s=TrainingJob.makeState();delete s.evidenceFiles;s.evidence=[];loadState(s);WorkflowUI.go('route');}''')
   box=page.locator('#cascadeStrip');bounds=box.bounding_box()
   check(f'{width}px cascade keeps a bounded viewport',bounds['height']<=(320 if width<600 else 420)+1)
   check(f'{width}px scroll region has a label and keyboard focus',box.get_attribute('role')=='region' and box.get_attribute('tabindex')=='0' and 'Scroll' in box.get_attribute('aria-label'))
   expected=page.evaluate('state.rows.map(r=>r.id)')
   for row in expected:
    target=page.locator(f'#cascadeStrip [data-cascade-open="{row}"]');target.scroll_into_view_if_needed();target.click()
    check(f'{width}px {row} remains reachable in diagram',page.locator('#pointSelect').input_value()==row)
   check(f'{width}px diagram does not widen the page',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
   if width<600:
    box.evaluate('(e)=>{e.scrollTop=0;e.scrollLeft=0;}');box.focus();page.keyboard.press('ArrowDown');page.wait_for_function('document.getElementById("cascadeStrip").scrollTop>0')
    check(f'{width}px diagram scrolls with keyboard',box.evaluate('(e)=>e.scrollTop>0'))
   page.emulate_media(media='print');check(f'{width}px print removes diagram height constraint',box.evaluate('(e)=>getComputedStyle(e).maxHeight')=='none')
   context.close()
  check('No uncaught application errors',not errors);browser.close()
 (OUT/'layout-validation.json').write_text(json.dumps({'checks':len(checks),'passed':True,'cases':checks,'standalone_sha256':hashlib.sha256(html.encode()).hexdigest(),'release_mode':release_mode,'scope':('Frozen standalone' if release_mode else 'Source-assembled candidate')+' in desktop Chromium at360/390/768/1280px. Touch/mobile emulation; no physicalphone/Safari/WebView claim.'},indent=2)+'\n')
 print(f'Build2 layout: {len(checks)} checks passed')
finally:server.shutdown();server.server_close()
