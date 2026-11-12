#!/usr/bin/env python3
import functools,json,pathlib,re,threading,sys,os,shutil
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.sync_api import sync_playwright
from decimal import Decimal as D,getcontext
getcontext().prec=200
ROOT=pathlib.Path(sys.argv[1]).resolve();OUT=pathlib.Path(__file__).parent
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[];study=[]
def check(label,ok,detail=None):checks.append({'name':label,'pass':bool(ok),'detail':detail})
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 for artifact,url in [('standalone','/outputs/Night_Sweep.html'),('pwa','/dist/index.html')]:
  for width in [320,430]:
   prefix=f'{artifact} {width}';context=browser.new_context(viewport={'width':width,'height':900},color_scheme='dark',is_mobile=True,has_touch=True)
   page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(f'http://127.0.0.1:{server.server_port}'+url);page.wait_for_function('typeof WorkflowUI!=="undefined"')
   page.evaluate("WorkflowUI.go('docsisHealth')")
   card=page.locator('[data-health-card="upstream"]');result=page.locator('#health-upstream-result');number=page.locator('[data-composite-margin]')
   field=lambda name:card.locator(f'[data-health="upstream"][data-field="{name}"]')
   check(prefix+' defaults context Unknown',field('basis').input_value()=='')
   field('mode').select_option('3.1');field('total').fill('60')
   check(prefix+' missing confirmation removes margin',number.count()==0 and re.search('confirm|simultaneous',result.inner_text(),re.I))
   field('basis').select_option('confirmed')
   check(prefix+' H4 exact6sf and assumption',number.inner_text()==' +5.00000 dB'.strip() and re.search('Assumed Spec minimum/default',result.inner_text()))
   check(prefix+' Unknown perchannel and capability',all(s in result.inner_text() for s in ['Actual modem capability is Unknown','Available per-channel/DRW headroom: Unknown','Channel count and width: Unknown']))
   field('pmax').fill('68');check(prefix+' H3 exact6sf',number.inner_text()=='+8.00000 dB')
   field('pmax').fill('65');field('total').fill('66');check(prefix+' H5 exactnegative6sf',number.inner_text()=='−1.00000 dB' and 'Over the reference' in result.inner_text())
   field('total').fill('65');check(prefix+' exactzero neutral6sf',number.inner_text()=='0.00000 dB' and 'At the reference' in result.inner_text())
   field('total').fill('65.000001');check(prefix+' HX09 negative6sf scientific',number.inner_text()=='−1.00000e-6 dB' and 'Over the reference' in result.inner_text())
   for total,sign,direction in [('64.9999999999','+','Below the reference'),('65.0000000001','−','Over the reference')]:
    field('total').fill(total);text=number.inner_text();mantissa=text.split('e')[0].lstrip('+−').replace('.','')
    check(prefix+' own1e-10 computed direction '+sign,text.startswith(sign) and direction in result.inner_text() and len(mantissa)==6,text)
   for name in ['total','pmax']:
    for malformed in ['-','1e']:
     field('total').fill('60');field('pmax').fill('68');box=field(name);box.click();box.press('Control+A');page.keyboard.type(malformed)
     state=box.evaluate('e=>({value:e.value,bad:e.validity.badInput})')
     check(prefix+' native '+name+' '+malformed+' unavailable',state['bad'] and number.count()==0 and re.search('number|finite',result.inner_text(),re.I),{'state':state,'result':result.inner_text()})
     box.press('Control+A');box.press('Backspace');box.fill('60' if name=='total' else '68')
   field('mode').select_option('other');check(prefix+' modechange resets confirmation',field('basis').input_value()=='' and number.count()==0)
   field('pmax').fill('57');field('total').fill('52');field('basis').select_option('confirmed')
   check(prefix+' genericcomparison hasnoSpecentry',number.inner_text()=='+5.00000 dB' and re.search('Generic entered reference',result.inner_text()) and result.locator('[data-threshold="docsis.us.pmax.capability"]').count()==0)
   field('pmax').fill('');check(prefix+' otherblank refuses',number.count()==0 and re.search('blank Pmax',result.inner_text(),re.I))
   companies=page.evaluate("Object.fromEntries(['42','204'].map(p=>[p,{window:DocsisHealth.getWindow('upstream',p),text:DocsisHealth.windowText('upstream',p)}]))")
   check(prefix+' bothrealcompanywindows Unknown',all(x['window']=={'min':None,'max':None} and 'Unknown' in x['text'] for x in companies.values()),companies)
   reg=page.evaluate("['docsis.us.compositeMargin','calc.ofdm.softwareBounds','docsis.us.softwareBounds'].map(id=>({id,label:Thresholds.get(id).label,errors:Thresholds.checkRow(Thresholds.get(id))}))")
   check(prefix+' newregistrymetadata labels',all(not x['errors'] for x in reg) and [x['label'] for x in reg]==['expert','unknown','unknown'],reg)
   check(prefix+' downstream33and40 unchanged',page.evaluate("DocsisHealth.TOTAL_LIMIT['3.0']===33 && DocsisHealth.TOTAL_LIMIT['3.1']===40"))
   check(prefix+' Safetyremoved',page.locator('#safetyPanel').count()==0 and page.locator('[data-task="safety"]').count()==0)
   page.evaluate("WorkflowUI.go('calculators')")
   conv=page.locator('[data-calc-card="ofdm"]');cf=lambda name:conv.locator(f'[data-calc="ofdm"][data-field="{name}"]');cr=page.locator('#calc-ofdm-result');cn=cr.locator('.calc-stats strong').first
   check(prefix+' converterconfirmation Unknown',cf('context').input_value()=='')
   cf('power').fill('48');cf('basis').select_option('1.6');cf('occupied').fill('6.4')
   check(prefix+' conversion requires context',cr.locator('.calc-stats strong').count()==0)
   cf('context').select_option('confirmed');check(prefix+' H1 exact6sf',cn.inner_text()=='54.0206 dBmV' and '+6.02060 dB' in cr.inner_text())
   cf('basis').select_option('6.4');cf('power').fill('54');cf('occupied').fill('1.6');check(prefix+' H2 exact6sf',cn.inner_text()=='47.9794 dBmV' and '-6.02060 dB' in cr.inner_text())
   check(prefix+' conversionneverinstanttotal',all(s in cr.inner_text() for s in ['does not determine instantaneous OFDMA total power','Available transmit headroom: Unknown']))
   for name in ['power','occupied']:
    for malformed in ['-','1e']:
     cf('power').fill('48');cf('occupied').fill('6.4');box=cf(name);box.click();box.press('Control+A');page.keyboard.type(malformed);bad=box.evaluate('e=>e.validity.badInput')
     check(prefix+' converter native '+name+' '+malformed,bad and cr.locator('.calc-stats strong').count()==0 and 'half-typed' in cr.inner_text())
     box.press('Control+A');box.press('Backspace');box.fill('48' if name=='power' else '6.4')
   labels=page.evaluate("({conversion:Thresholds.get('calc.ofdm.bandwidth').label,pmax:Thresholds.get('docsis.us.pmax.capability').label})")
   check(prefix+' Expertconversion Speccapability',labels=={'conversion':'expert','pmax':'spec'})
   conv.locator('[data-threshold="calc.ofdm.softwareBounds"]').click();check(prefix+' Unknownsourceopens',page.locator('dialog.source-sheet').is_visible() and 'Software acceptance bounds only' in page.locator('dialog.source-sheet').inner_text())
   page.evaluate('Thresholds.close()')
   q=page.evaluate("[1,2,3,4,5].map(seed=>StudyMode.GENERATORS.find(g=>g.id==='ofdm6').make(StudyMode.rng(seed)))")
   for entry in q:
    p,b=entry['params']['power'],entry['params']['bandwidth'];want=D(str(p))+D(10)*(D(6)/D(str(b))).log10();value=D.from_float(entry['answer']);check(prefix+' validStudycaller '+str(b),abs(value-want)<D('1e-12') and 'flat power spectral density' in entry['prompt']);study.append(entry)
   check(prefix+' targeted nooverflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
   if artifact=='pwa' and width==320:conv.screenshot(path=str(OUT/'converter-pwa-320.png'))
   context.close()
 browser.close()
server.shutdown();check('no native page errors',not errors,errors)
out={'checks':checks,'passed':sum(x['pass'] for x in checks),'failed':sum(not x['pass'] for x in checks),'errors':errors,'study':study}
(OUT/'native-ui-results.json').write_text(json.dumps(out,indent=2)+'\n')
for c in checks:
 if not c['pass']:print('FAIL',c['name'],c['detail'])
print(f'B2 independent native UI: {out["passed"]} passed; {out["failed"]} failed; {len(checks)} total; committed standalone/PWA320and430')
sys.exit(bool(out['failed']))
