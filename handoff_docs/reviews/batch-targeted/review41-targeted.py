from pathlib import Path
from playwright.sync_api import sync_playwright
import json
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
server=ThreadingHTTPServer(("127.0.0.1",0),partial(SimpleHTTPRequestHandler,directory="/workspace/review41/outputs"));Thread(target=server.serve_forever,daemon=True).start()
count=0
def check(v,msg):
 global count
 assert v,msg
 count+=1
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,375,390,430]:
  c=b.new_context(viewport={'width':width,'height':844},color_scheme='dark')
  page=c.new_page();page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html');page.wait_for_function("typeof WorkflowUI!=='undefined'")
  page.evaluate("document.documentElement.dataset.theme='night';state.job={...(state.job||{}),name:'SYNTHETIC '+ 'LongJob'.repeat(40),legacyIgnored:{keep:true}};state.rows[0].name='SYNTHETIC '+ 'Point'.repeat(40);state.sweepSetup={version:1,selected:'unexpected',profiles:{},history:[]};WorkflowUI.go('home')")
  check(page.locator('[data-context=plant]').inner_text()=='Plant unknown',str(width)+' unknown')
  check(page.evaluate("document.documentElement.scrollWidth<=innerWidth+1 && document.querySelector('#contextStrip').scrollWidth<=document.querySelector('#contextStrip').clientWidth+1"),str(width)+' long content fits')
  before=page.evaluate('JSON.stringify(state)')
  storage=page.evaluate('JSON.stringify(Object.entries(localStorage).sort())')
  for screen in ['calculators','limits','docsis','home','route','projects']:
   page.evaluate('(s)=>WorkflowUI.go(s)',screen)
  check(page.evaluate('JSON.stringify(state)')==before,str(width)+' state exact unchanged navigation')
  check(page.evaluate('JSON.stringify(Object.entries(localStorage).sort())')==storage,str(width)+' storage exact unchanged navigation')
  page.evaluate("WorkflowUI.go('home')")
  page.emulate_media(media='print')
  check(page.locator('#contextStrip').evaluate("s=>getComputedStyle(s).display==='none'"),str(width)+' print hides')
  page.emulate_media(media='screen')
  check(page.locator('#contextStrip').is_visible(),str(width)+' print restore')
  page.screenshot(path=f'/tmp/review41-{width}.png')
  c.close()
 b.close()
print(f'Independent context strip: {count} checks passed')
