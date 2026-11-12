#!/usr/bin/env python3
"""Independent real-keyboard entry check for each searchable NAV list."""
import argparse,json,subprocess,threading
from functools import partial
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('root',type=Path);p.add_argument('--artifact',default='outputs/Night_Sweep.html');p.add_argument('--chromium',default='/usr/bin/chromium');p.add_argument('--receipt',type=Path,required=True);args=p.parse_args();root=args.root.resolve()
class H(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(H,directory=str(root)));threading.Thread(target=s.serve_forever,daemon=True).start()
def head():return subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
r={'headBefore':head(),'artifact':args.artifact,'checks':[],'runtimeErrors':[]}
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path=args.chromium,headless=True,args=['--no-sandbox'])
  for width in [320,360,390,430]:
   c=b.new_context(viewport={'width':width,'height':844},color_scheme='dark');page=c.new_page();page.on('pageerror',lambda e:r['runtimeErrors'].append(str(e)));page.goto(f'http://127.0.0.1:{s.server_port}/{args.artifact}');page.wait_for_function("typeof WorkflowUI!=='undefined'")
   for group,start,query,wanted in [('plan','projects','what-if','trial'),('field','sweepSetup','night log','nightLog'),('tools','calculators','fiber','fiber')]:
    page.evaluate('(id)=>WorkflowUI.go(id)',start);box=page.locator('[data-task-search]');box.fill(query)
    visible=page.locator('#taskTabs [data-task]').evaluate_all('(es)=>es.filter(e=>!e.hidden).map(e=>e.dataset.task)');box.press('Tab');focused=page.evaluate('document.activeElement.dataset.task||null');selected=page.evaluate('WorkflowUI.current()')
    passed=visible==[wanted] and focused==wanted and selected==start
    if passed:page.keyboard.press('Enter');passed=page.evaluate('WorkflowUI.current()')==wanted
    row={'width':width,'group':group,'query':query,'expected':wanted,'visible':visible,'focusedAfterTab':focused,'selectedBeforeActivation':selected,'pass':passed};r['checks'].append(row);print(('PASS 'if passed else'FAIL ')+json.dumps(row),flush=True)
   c.close()
  b.close()
finally:s.shutdown();r['headAfter']=head();r['statusAfter']=subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True);args.receipt.write_text(json.dumps(r,indent=2))
failed=sum(not x['pass'] for x in r['checks']);print(f"Searchable lists real-keyboard entry: {len(r['checks'])-failed} passed, {failed} failed; {len(r['runtimeErrors'])} runtime errors.",flush=True)
raise SystemExit(bool(failed or r['runtimeErrors'] or r['headBefore']!=r['headAfter'] or r['statusAfter']))
