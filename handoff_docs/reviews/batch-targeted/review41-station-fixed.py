from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory='/workspace/review41/outputs'));Thread(target=server.serve_forever,daemon=True).start()
n=0
def check(ok,label):
 global n
 assert ok,label
 n+=1
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in (320,375,390,430):
  c=b.new_context(viewport={'width':width,'height':844},color_scheme='dark');page=c.new_page();page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html');page.wait_for_function("typeof WorkflowUI!=='undefined'")
  page.evaluate("loadState(TrainingJob.makePractice('complete'));WorkflowUI.go('station')")
  targets=page.locator('[data-station-target] option').evaluate_all('(es)=>es.map(e=>({key:e.value,label:e.textContent}))')
  check(len(targets)>=3,'launch and two actives')
  for i,t in enumerate(targets[:3]):
   page.locator('[data-station-target]').select_option(t['key'])
   for stage in ['before','after']:
    page.locator('[data-station-scope=record][data-station-field=stage]').select_option(stage)
    value=f'SYNTHETIC {i} {stage} output plane'
    page.locator('[data-station-scope=forward][data-station-field=plane]').fill(value)
    page.wait_for_function('(v)=>document.querySelector("[data-context=plane]").textContent==="Plane: "+v',arg=value)
    check(page.locator('[data-context=point]').inner_text()==t['label'],f'{width} target {i} {stage} label')
    check(page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'{width} fits')
  before=page.evaluate('JSON.stringify(state)')
  for i,t in reversed(list(enumerate(targets[:3]))):
   page.locator('[data-station-target]').select_option(t['key'])
   for stage in ['before','after']:
    page.locator('[data-station-scope=record][data-station-field=stage]').select_option(stage)
    value=f'SYNTHETIC {i} {stage} output plane'
    page.wait_for_function('(v)=>document.querySelector("[data-context=plane]").textContent==="Plane: "+v',arg=value)
    check(page.locator('[data-context=point]').inner_text()==t['label'],f'{width} restored target {i} {stage}')
  page.evaluate("WorkflowUI.go('route')")
  check(page.locator('[data-context=plane]').is_hidden(),f'{width} route hides plane')
  page.evaluate("WorkflowUI.go('calculators')")
  check(page.locator('#contextStrip').is_hidden(),f'{width} Tools hides strip')
  page.evaluate("WorkflowUI.go('station')")
  page.emulate_media(media='print');check(page.locator('#contextStrip').is_hidden(),f'{width} print hides');page.emulate_media(media='screen')
  c.close()
 b.close()
print(f'Independent Station context: {n} rendered checks passed')
