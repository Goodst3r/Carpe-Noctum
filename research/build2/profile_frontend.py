#!/usr/bin/env python3
"""Synthetic Chromium profiling of a frozen baseline and current frontend modules.
Never writes outputs/ or dist/. Timings are local observations, not phone benchmarks.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import argparse, hashlib, json, statistics, time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'research/build2'
MODULES=['app.js','workflow.js','style.css']
def assemble():
 import re
 src=ROOT/'night-sweep';html=(src/'shell.html').read_text()
 for token,name in re.findall(r"\('([^']*<!--[^']*-->)', '([^']+)'\)",(src/'build.py').read_text()):
  data=(src/name).read_text()
  if name=='catalog.json':
   catalog=json.loads(data);catalog['setupManuals']=json.loads((src/'setup-manuals.json').read_text());data=json.dumps(catalog,separators=(',',':'),ensure_ascii=False)
  html=html.replace(token,data)
 return html.replace('<!--DSIMPILOTCODES-->',(src/'dsim-pilot-codes.js').read_text())
def candidate():
 html=(OUT/'frontend-baseline.html').read_text()
 for name in MODULES:html=html.replace((OUT/('baseline-'+name)).read_text(),(ROOT/'night-sweep'/name).read_text())
 return html
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
parser=argparse.ArgumentParser();parser.add_argument('--phase',choices=['baseline','candidate'],required=True);parser.add_argument('--sizes',default='9,100,200');parser.add_argument('--samples',type=int,default=3);args=parser.parse_args()
if args.phase=='baseline':
 if (OUT/'frontend-baseline.html').exists():html=(OUT/'frontend-baseline.html').read_text()
 else:
  html=assemble();(OUT/'frontend-baseline.html').write_text(html)
  for name in MODULES:(OUT/('baseline-'+name)).write_text((ROOT/'night-sweep'/name).read_text())
else:html=candidate();(OUT/'frontend-candidate.html').write_text(html)
name='frontend-'+args.phase+'.html'
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(OUT)));Thread(target=server.serve_forever,daemon=True).start()
record={'phase':args.phase,'htmlSha256':hashlib.sha256(html.encode()).hexdigest(),'scope':'Synthetic desktop Chromium, 390px mobile viewport. In-process synchronous function timings; not physical-device timing. Instrumented function counts recorded separately. Baseline core/storage source held constant.','scenarios':[]}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);record['browser']=browser.version
  for size in map(int,args.sizes.split(',')):
   context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
   page=context.new_page();page.on('dialog',lambda d:d.accept());errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(f'http://127.0.0.1:{server.server_port}/'+name);page.wait_for_function('typeof TrainingJob!=="undefined" && typeof WorkflowUI!=="undefined"')
   source=page.evaluate('TrainingJob.makeState()')
   if size!=9:
    source['rows']=[dict(id='r'+str(i+1),name='SYNTHETIC span '+str(i+1),parent='source' if i==0 else 'r'+str(i)+'::through',device='none',cable='p3_625',length=100,slack=0,terminal=False) for i in range(size)]
    source['routeTools']={'frequency':860,'endpoint':'r'+str(size),'distance':50,'direction':'forward','lead':0}
   source.pop('evidenceFiles',None);source['evidence']=[]
   page.evaluate('(s)=>{loadState(s);WorkflowUI.go("route");}',source)
   page.wait_for_timeout(80)
   stats=[]
   for sample in range(args.samples):
    result=page.evaluate('''()=>{const t=performance.now();refreshResults();return performance.now()-t;}''');stats.append(result)
   render=page.evaluate('''()=>{const t=performance.now();renderAll();return performance.now()-t;}''')
   page.evaluate('''()=>{window.__profile={};for(const name of ['evaluate','drawChart','refreshRouteMath','refreshGainBudget','refreshRouteTools','renderCascade','renderRoute','renderMeters','refreshResults','saveLocal']){const old=eval(name);window.__profile[name]={calls:0,ms:0};eval(name+'=function(...args){const t=performance.now();try{return old(...args);}finally{window.__profile["'+name+'"].calls++;window.__profile["'+name+'"].ms+=performance.now()-t;}}');}}''')
   page.evaluate('''()=>{window.__profile['HFC.run']={calls:0,ms:0};const original=HFC.run;HFC.run=function(...args){const t=performance.now();try{return original(...args);}finally{window.__profile['HFC.run'].calls++;window.__profile['HFC.run'].ms+=performance.now()-t;}};refreshResults();}''')
   counts=page.evaluate('window.__profile')
   layout=page.evaluate('''()=>{const e=document.getElementById('cascadeStrip'),route=document.getElementById('route');const b=e.getBoundingClientRect();return {cascadeHeight:b.height,cascadeScrollHeight:e.scrollHeight,cascadeWidth:e.clientWidth,cascadeScrollWidth:e.scrollWidth,firstPointTop:route.getBoundingClientRect().top,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,domNodes:document.querySelectorAll('*').length};}''')
   if size==9:page.screenshot(path=str(OUT/('cascade-'+args.phase+'-390.png')),full_page=True)
   values=page.evaluate('''()=>({job:JSON.stringify(state),low:evaluate(54).results.map(r=>r.outputs.map(p=>p.level)),high:evaluate(860).results.map(r=>r.outputs.map(p=>p.level)),power:HFC.powerRun(state.power,catalog).rows.map(r=>[r.id,r.voltage,r.deviceCurrent])})''')
   scenario={'routeRows':size,'refreshMs':stats,'refreshMedianMs':statistics.median(stats),'renderAllMs':render,'functions':counts,'layout':layout,'errors':errors,'stateAndNumericsSha256':hashlib.sha256(json.dumps(values,sort_keys=True).encode()).hexdigest()};record['scenarios'].append(scenario)
   print(json.dumps(scenario),flush=True);context.close()
  browser.close()
 (OUT/('performance-'+args.phase+'.json')).write_text(json.dumps(record,indent=2)+'\n')
finally:server.shutdown();server.server_close()
