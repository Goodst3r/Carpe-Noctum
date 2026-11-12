from playwright.sync_api import sync_playwright
import json
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory='/workspace/review40/outputs'))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/Night_Sweep.html'
checks=0
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,430]:
  c=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True,accept_downloads=True)
  page=c.new_page();page.goto(url);page.wait_for_function('typeof PowerPMUI!=="undefined"');page.evaluate('WorkflowUI.go("powerPm")')
  page.locator('#powerPmName').fill('PRACTICE');page.locator('#powerPmDate').fill('2026-11-12');page.locator('#powerPmSave').click()
  with page.expect_download() as d:page.locator('#powerPmExport').click()
  path=f'/tmp/review40-{width}.json';d.value.save_as(path);data=json.load(open(path));assert data['supplies'][0]['name']=='PRACTICE';checks+=1
  with page.expect_file_chooser() as f:page.locator('#powerPmImport').click()
  f.value.set_files(path);page.wait_for_function('document.querySelector("#powerPmStatus").textContent.includes("Imported")');checks+=1
  n=page.evaluate('JSON.parse(localStorage.getItem(PowerPM.KEY)).supplies.length');assert n==2;checks+=1
  print(f'{width}px actual download saved, FileChooser opened/imported; duplicate defect reproduced: supplies={n}')
  page.evaluate('''async()=>{localStorage.removeItem(PowerPM.KEY);const v={date:'2026-11-12',chemistry:'',inverter:'',alarms:'',batteries:[{slot:'<img src=x onerror=window.p=1>',volts:12}],spans:[]};window.bad=JSON.stringify({kind:PowerPM.FILE_KIND,version:1,supplies:[{name:'PRACTICE',visits:[v]}]})}''')
  with page.expect_file_chooser() as f:page.locator('#powerPmImport').click()
  f.value.set_files({'name':'synthetic.json','mimeType':'application/json','buffer':page.evaluate('window.bad').encode()})
  page.wait_for_function('JSON.parse(localStorage.getItem(PowerPM.KEY))?.supplies.length===1');page.locator('#powerPmSupplyPick').select_option(index=1);page.wait_for_function('window.p===1');checks+=1
  print(f'{width}px imported slot executed event handler (window.p=1)')
  c.close()
 b.close()
print(f'{checks} focused browser assertions confirmed (4 positive file-control assertions, 4 defect reproductions)')
