from playwright.sync_api import sync_playwright
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
srv=ThreadingHTTPServer(("127.0.0.1",0),SimpleHTTPRequestHandler)
Thread(target=srv.serve_forever,daemon=True).start()
n=0
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in (320,375,390,430):
  page=b.new_page(viewport={'width':width,'height':800},is_mobile=True,has_touch=True)
  page.goto(f'http://127.0.0.1:{srv.server_port}/outputs/Night_Sweep.html')
  page.evaluate("WorkflowUI.go('calculators')")
  card=page.locator('[data-calc-card="cascade"]');card.scroll_into_view_if_needed()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width;n+=1
  for el in card.locator('input, select, button').all():
   box=el.bounding_box();assert box and box['x']>=0 and box['x']+box['width']<=width+1,(width,box)
  n+=1
  page.locator('[data-calc="cascade"][data-field="operation"]').select_option('combine_cnr')
  page.locator('[data-cascade-cnr]').nth(0).fill('40')
  page.locator('[data-cascade-add]').click()
  assert page.locator('[data-cascade-cnr]').count()==3;n+=1
  page.locator('[data-cascade-cnr]').nth(2).fill('43')
  assert 'blank is unknown' in page.locator('#calc-cascade-result').inner_text();n+=1
  page.close()
 b.close()
print(f'Independent rendered UI: {n} checks passed')
