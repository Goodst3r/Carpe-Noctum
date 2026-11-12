#!/usr/bin/env python3
"""Run: python3 pr38-keyboard-repro.py /path/to/Carpe-Noctum"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
import json,sys
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/Carpe-Noctum-pr38').resolve()
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
bad=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for width in [320,360,390,430]:
   context=browser.new_context(viewport={'width':width,'height':844},color_scheme='dark');page=context.new_page()
   page.goto(f'http://127.0.0.1:{server.server_port}/outputs/Night_Sweep.html')
   page.evaluate("WorkflowUI.go('calculators')")
   box=page.locator('[data-task-search]');box.fill('fiber')
   visible=page.locator('#taskTabs [data-task]').evaluate_all('(bs)=>bs.filter(b=>!b.hidden).map(b=>({id:b.dataset.task,tabIndex:b.tabIndex}))')
   box.press('Tab');tab=page.evaluate('document.activeElement.dataset.task||document.activeElement.textContent.trim()')
   box.focus();box.press('Enter');entered=page.evaluate('WorkflowUI.current()')
   box.press('ArrowDown');down=page.evaluate('document.activeElement.dataset.task||document.activeElement.tagName')
   found={'width':width,'visible':visible,'afterTab':tab,'afterEnter':entered,'afterArrowDown':down};print(json.dumps(found),flush=True)
   if tab!='fiber' and entered!='fiber' and down!='fiber':bad.append(width)
   context.close()
  browser.close()
finally:server.shutdown()
assert not bad,'Filtered Fiber is unreachable by Tab/Enter/ArrowDown at widths '+str(bad)
