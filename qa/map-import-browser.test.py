#!/usr/bin/env python3
"""Actual local file decoding; no supplied OCR tokens or mock PDF parser."""
import base64,json,os,tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];vendor=root/'night-sweep/vendor/map'
assets={f['name']:base64.b64encode((vendor/f['name']).read_bytes()).decode() for f in json.loads((vendor/'manifest.json').read_text())['files']}
module=root/'night-sweep/map-import.js'
html='<meta charset="utf-8"><div id="import"></div><script id="map-import-assets" type="application/json">'+json.dumps(assets)+'</script><script>'+module.read_text()+'</script>'
checks=0
def check(condition,message):
 global checks
 assert condition,message
 checks+=1
with tempfile.TemporaryDirectory(prefix='cn-map-') as d,sync_playwright() as pw:
 path=Path(d)/'map.html';path.write_text(html)
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('NIGHTSWEEP_CHROMIUM'):options['executable_path']=os.environ['NIGHTSWEEP_CHROMIUM']
 browser=pw.chromium.launch(**options);page=browser.new_page();external=[];errors=[]
 page.on('request',lambda req:external.append(req.url) if req.url.startswith(('http:','https:')) else None)
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto(path.as_uri());page.context.set_offline(True)
 check(page.evaluate('!!globalThis.NightSweepMapImport'),'Local map file importer exists')
 check(page.evaluate('!globalThis.pdfjsLib&&!globalThis.Tesseract'),'Heavy libraries load lazily')
 page.evaluate('()=>{globalThis.originalFetch=fetch;}')
 for name in ['synthetic-marked.pdf','synthetic-raster.png']:
  encoded=base64.b64encode((root/'qa/fixtures/maps'/name).read_bytes()).decode()
  result=page.evaluate('''async ({name,encoded})=>{const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const doc=await NightSweepMapImport.read(new File([bytes],name));globalThis.lastMap=doc;const byName=t=>doc.candidates.find(c=>c.name.startsWith(t));if(!byName('North Launch')||!byName('Oak Amp')||!byName('South Amp'))return {error:'missing candidates',candidates:doc.candidates};const draft=NightSweepMapImport.buildDraft(doc,{launchId:byName('North Launch').id,port:'Main',destinationIds:[byName('Oak Amp').id,byName('South Amp').id]});return {draft,candidates:doc.candidates,annotations:doc.pages.flatMap(p=>p.annotations),segments:doc.pages[0].segments.length};}''',{'name':name,'encoded':encoded})
  check(not result.get('error'),result)
  rows=result['draft']['rows'];names=[r['name'] for r in rows]
  check('Oak Amp - A' in names,names)
  check('South Amp / B' in names,names)
  check('Branch Splitter' in names,names)
  check('Proposed Booster' not in names,names)
  a=next(r for r in rows if r['name']=='Oak Amp - A');b=next(r for r in rows if r['name']=='South Amp / B');s=next(r for r in rows if r['name']=='Branch Splitter')
  check(a['parent']==s['id']+'::through' and b['parent']==s['id']+'::through','Automatic branching preserves shared passive')
  check(a['length']==80,a)
  check(b['length']==60,b)
  check(s['length']==120,s)
  check(a['cable']=='p3_500',a)
  check(b['cable']=='',b)
  check(b['device']=='none','LE control variant remains unverified')
  check(all(r['mapImport']['connectionConfirmed'] is False for r in rows),'Every link remains draft')
  check(all(r['name']==next(c['name'] for c in result['candidates'] if c['tag']==r['mapImport']['tag']) for r in rows),'NAME copied verbatim from recognized schedule')
  check(set(s['mapImport']['ports'])=={'1','2'},'Readable passive ports retained separately')
  check(result['segments']>=3,'Actual cable geometry extracted including the blue branch')
  if name.endswith('.pdf'):
   check(any('ABSENT' in a.get('text','') for a in result['annotations']),'Visible PDF absent annotation read')
   check(any(a.get('type')=='Ink' for a in result['annotations']),'Visible PDF ink annotation read')
  else:
   check(any('OCR text' in reason for reason in a['mapImport']['reasons']),'OCR uncertainty stays at affected row')
  print(name+': actual file decoded; branching/NAME/lengths/ports/marked absence checked',flush=True)
 # Exercise the actual file picker and selection UI, with host replacement declined.
 page.evaluate("()=>{globalThis.mapDraftCallbackRows=null;globalThis.cancelContextReceived=false;NightSweepMapImport.mount(document.getElementById('import'),{getContext:()=>({job:'cancel'}),matchesContext:(captured,current)=>captured.job===current.job,onDraft:(draft,context)=>{globalThis.mapDraftCallbackRows=draft.rows.length;globalThis.cancelContextReceived=context.job==='cancel';return false;}});}")
 page.get_by_label('Choose a local map').set_input_files(root/'qa/fixtures/maps/synthetic-marked.pdf')
 page.get_by_role('button',name='Build editable route draft').wait_for(state='visible',timeout=60000)
 page.get_by_label('Launch output port').fill('Main')
 page.get_by_label('Oak Amp - A · A1').check()
 page.get_by_label('South Amp / B · A2').check()
 page.get_by_role('button',name='Build editable route draft').click()
 check(page.evaluate('mapDraftCallbackRows')==3,'Actual PDF selection built the shared branch before host declined')
 cancellation=page.locator('#import [role=status]').inner_text()
 check('cancelled' in cancellation.lower() and 'existing route unchanged' in cancellation.lower(),cancellation)
 check('points added' not in cancellation,cancellation)
 check(page.evaluate('cancelContextReceived'),'Host receives the captured context with a matching custom context predicate')
 # A real async PDF read must remain bound to the job where it started.
 page.evaluate("()=>{globalThis.mapJobContext={job:'A'};globalThis.staleDraftCalls=0;NightSweepMapImport.mount(document.getElementById('import'),{getContext:()=>globalThis.mapJobContext,onDraft:()=>{globalThis.staleDraftCalls++;return true;}});}")
 page.get_by_label('Choose a local map').set_input_files(root/'qa/fixtures/maps/synthetic-marked.pdf')
 page.evaluate("()=>{globalThis.mapJobContext={job:'B'};}")
 page.wait_for_function("()=>{const s=document.querySelector('#import [role=status]').textContent;return s.includes('Job changed')||s.includes('points recognized');}",timeout=60000)
 stale_read_status=page.locator('#import [role=status]').inner_text()
 stale_read_buttons=page.get_by_role('button',name='Build editable route draft').count()
 # A job switch after recognition must also block the apply button.
 page.evaluate("()=>{globalThis.mapJobContext={job:'C'};globalThis.staleApplyCalls=0;NightSweepMapImport.mount(document.getElementById('import'),{getContext:()=>globalThis.mapJobContext,onDraft:()=>{globalThis.staleApplyCalls++;return true;}});}")
 page.get_by_label('Choose a local map').set_input_files(root/'qa/fixtures/maps/synthetic-marked.pdf')
 page.get_by_role('button',name='Build editable route draft').wait_for(state='visible',timeout=60000)
 page.get_by_label('Launch output port').fill('Main')
 page.get_by_label('Oak Amp - A · A1').check()
 page.evaluate("()=>{globalThis.mapJobContext={job:'D'};}")
 page.get_by_role('button',name='Build editable route draft').click()
 stale_apply_status=page.locator('#import [role=status]').inner_text()
 check('Job changed' in stale_read_status and 'Read the map again' in stale_read_status,stale_read_status)
 check(stale_read_buttons==0,'A stale completed read cannot leave a usable draft button')
 check(page.evaluate('staleDraftCalls')==0,'Stale read never reaches the host callback')
 check('Job changed' in stale_apply_status and 'Read the map again' in stale_apply_status,stale_apply_status)
 check(page.evaluate('staleApplyCalls')==0,'Stale apply never reaches the host callback')
 check('points added' not in stale_apply_status,stale_apply_status)
 # Capture the job before the native picker opens, not only after selection.
 page.evaluate("()=>{globalThis.mapJobContext={job:'picker-old'};NightSweepMapImport.mount(document.getElementById('import'),{getContext:()=>mapJobContext,onDraft:()=>{throw Error('A stale picker must not apply');}});document.querySelector('#import input[type=file]').dispatchEvent(new Event('click'));globalThis.mapJobContext={job:'picker-new'};}")
 page.get_by_label('Choose a local map').set_input_files(root/'qa/fixtures/maps/synthetic-marked.pdf')
 check('Job changed' in page.locator('#import [role=status]').inner_text(),'Job switch while picker open rejects the old picker context')
 check(page.get_by_label('Choose a local map').input_value()=='','Stale picker selection clears so the same map can be read again')
 # Input/error limits exercise the actual reader and decoder.
 limits=page.evaluate('''async()=>{const out={};for(const [key,file] of [['empty',new File([],'empty.pdf')],['oversize',new File([new Uint8Array(20*1024*1024+1)],'large.pdf')],['type',new File(['x'],'map.svg')],['pdf',new File(['not a PDF'],'broken.pdf')],['image',new File(['not an image'],'broken.png')]]){try{await NightSweepMapImport.read(file);out[key]='accepted';}catch(e){out[key]=e.message;}}return out;}''')
 for key,expected in [('empty','empty'),('oversize','20 MiB'),('type','Choose a PDF'),('pdf','could not be decoded'),('image','could not be decoded')]:check(expected in limits[key],limits)

 nine=base64.b64encode((root/'qa/fixtures/maps/synthetic-nine-pages.pdf').read_bytes()).decode()
 bounds=page.evaluate('''async encoded=>{const out={};try{await NightSweepMapImport.read(new File([Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))],'nine.pdf'));out.pages='accepted';}catch(e){out.pages=e.message;}const c=document.createElement('canvas');c.width=5000;c.height=4000;const blob=await new Promise(resolve=>c.toBlob(resolve));c.width=c.height=1;try{await NightSweepMapImport.read(new File([blob],'large.png'));out.pixels='accepted';}catch(e){out.pixels=e.message;}return out;}''',nine)

 complex_map=base64.b64encode((root/'qa/fixtures/maps/synthetic-complex.pdf').read_bytes()).decode()
 complex_error=page.evaluate('''async encoded=>{try{await NightSweepMapImport.read(new File([Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))],'complex.pdf'));return 'accepted';}catch(e){return e.message;}}''',complex_map)
 check('4000 cable segments' in complex_error and 'Split' in complex_error,complex_error)
 check('8-page' in bounds['pages'],bounds)
 check('16-million-pixel' in bounds['pixels'],bounds)
 check(page.evaluate('originalFetch===fetch'),'OCR worker network guard does not modify window fetch')
 check(not external,external)
 check(not errors,errors)
 browser.close()
print(f'map-import-browser: {checks} checks passed; file:// PDF + raster offline; 0 network requests')
