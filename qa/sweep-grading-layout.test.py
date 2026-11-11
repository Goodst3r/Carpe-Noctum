#!/usr/bin/env python3
"""Real Chromium grading controls at phone widths. Synthetic interchange data only."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
serve=Path(tempfile.mkdtemp(prefix='cn-grading-layout-'))
(serve/'index.html').write_bytes((ROOT/'outputs/Night_Sweep.html').read_bytes())
class Handler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(serve)))
Thread(target=server.serve_forever,daemon=True).start()
checks=[]; errors=[]
def check(name,ok):
    if not ok: raise AssertionError(name)
    checks.append(name); print('PASS '+name,flush=True)
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or '/usr/bin/chromium',args=['--no-sandbox'],headless=True)
        for width in [320,360,390,430]:
            context=browser.new_context(viewport={'width':width,'height':850},is_mobile=True,has_touch=True)
            page=context.new_page();page.on('pageerror',lambda e: errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
            page.evaluate("WorkflowUI.go('evidence');document.getElementById('sweepGradingPanel').open=true")
            page.select_option('#gradingPlant','42');page.select_option('#gradingDirection','forward')
            page.locator('#evidenceFiles').set_input_files({'name':'SYNTHETIC.csv','mimeType':'text/csv','buffer':b'frequency_mhz,level_dbmv\n54,0\n100,2.5\n860,0'})
            page.wait_for_function('!EvidenceUI.isBusy()&&state.evidence?.length===1')
            page.select_option('#gradingEvidence',page.evaluate('state.evidence[0].id'))
            check(f'{width}px night palette',page.evaluate("(document.documentElement.dataset.theme||'night')==='night'"))
            check(f'{width}px exact measured span and native unknown shown', '54–860 MHz' in page.locator('#sweepGradingPanel').inner_text() and 'Native direction: unknown' in page.locator('#sweepGradingPanel').inner_text())
            for k,v in {'lowFrequencyMHz':'54','highFrequencyMHz':'860','ptvLimitDb':'3','lowTargetDbmv':'0','highTargetDbmv':'0','maxLevelErrorDb':'0','tiltTargetDb':'0','maxTiltErrorDb':'0'}.items():page.locator('#grading-'+k).fill(v)
            el=page.locator('#grading-ptvLimitDb');el.fill('');el.press('e')
            check(f'{width}px real browser badInput is surfaced',el.evaluate('(e)=>e.validity.badInput') and el.get_attribute('aria-invalid')=='true')
            el.evaluate('(e)=>e.closest(".grading-field").scrollIntoView({block:"center"})')
            error=page.locator('#grading-error-ptvLimitDb')
            relation=el.evaluate('''e=>{const note=document.getElementById(e.getAttribute('aria-errormessage')),r=e.getBoundingClientRect(),n=note.getBoundingClientRect(),style=getComputedStyle(note),border=getComputedStyle(e);return {linked:e.getAttribute('aria-describedby').split(' ').includes(note.id),sameParent:note.parentElement===e.parentElement,next:e.nextElementSibling===note,visible:!note.hidden&&n.top>=0&&n.bottom<=innerHeight,below:n.top>=r.bottom,gap:n.top-r.bottom,weight:Number(style.fontWeight),border:border.borderTopStyle,borderWidth:parseFloat(border.borderTopWidth),outline:border.outlineStyle,outlineWidth:parseFloat(border.outlineWidth)};}''')
            check(f'{width}px named error is visibly adjacent and linked to its criterion',relation['linked'] and relation['sameParent'] and relation['next'] and relation['visible'] and relation['below'] and 'Peak-to-valley limit' in error.inner_text())
            check(f'{width}px invalid field has a non-colour double border and outline',relation['border']=='double' and relation['borderWidth']>=3 and relation['outline']=='solid' and relation['outlineWidth']>=2)
            check(f'{width}px error has visibly emphasized text',relation['weight']>=600)
            tags=page.locator('#sweepGradingPanel [data-grading-tag] .source-tag').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,!!e.closest("label")]})')
            check(f'{width}px all eight source tags are separate 44px targets',len(tags)==8 and all(w>=44 and h>=44 and not inside for w,h,inside in tags))
            for attempt in [1,2]:
                page.locator('#gradingRun').click()
                page.wait_for_function('document.getElementById("gradingStatus").textContent.includes("Correct the criterion errors")')
                check(f'{width}px invalid Grade click {attempt} retains refusal and draft',page.evaluate('(state.sweepGrading?.records.length||0)===0') and el.evaluate('(e)=>e.validity.badInput') and el.get_attribute('aria-invalid')=='true' and error.is_visible())
            el.fill('3');page.locator('#gradingRun').click();page.wait_for_function('state.sweepGrading.records.length===1')
            check(f'{width}px real controls produce PTV 2.5 pass',page.evaluate('state.sweepGrading.records[0].result.metrics.ptvDb===2.5&&state.sweepGrading.records[0].result.overall==="pass"'))
            check(f'{width}px grading and history fit width',page.evaluate(f'document.documentElement.scrollWidth<={width}+1&&innerWidth<={width}+1'))
            history=page.locator('#sweepGradingPanel [data-grading-current="true"] li').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right,e.scrollWidth,e.clientWidth]})')
            check(f'{width}px saved criteria labels and units wrap inside the phone card',len(history)==8 and all(l>=0 and r<=width+1 and sw<=cw+1 for l,r,sw,cw in history))
            sizes=page.locator('#sweepGradingPanel input,#sweepGradingPanel select,#gradingRun').evaluate_all('(es)=>es.map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right,r.height]})')
            check(f'{width}px visible controls fit and retain 44px touch height',all(l>=-1 and r<=width+1 and h>=44 for l,r,h in sizes))
            check(f'{width}px every criterion carries a Company source tag',page.locator('#sweepGradingPanel [data-threshold][data-label="company"]').count()==8)
            page.locator('#grading-ptvLimitDb').fill('2')
            check(f'{width}px edit marks current grade stale', 'stale / unknown' in page.locator('#gradingStatus').inner_text())
            before_failed_save=page.evaluate('localStorage.getItem("hfc-route-v1")')
            page.evaluate('''()=>{window.__gradingSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,...args){if(k==='hfc-route-v1')throw new DOMException('Synthetic storage failure','QuotaExceededError');return window.__gradingSetItem.call(this,k,...args);};}''')
            try:
                el.fill('4');el.evaluate('(e)=>e.closest(".grading-field").scrollIntoView({block:"center"})')
                check(f'{width}px failed autosave retains in-memory criterion and previous stored job',page.evaluate('state.sweepGrading.profiles["42-forward"].ptvLimitDb===4') and page.evaluate('localStorage.getItem("hfc-route-v1")')==before_failed_save)
                check(f'{width}px failed autosave is named beside field and in status',error.is_visible() and 'Not saved: Peak-to-valley limit' in error.inner_text() and 'autosave failed' in error.inner_text() and 'autosave failed' in page.locator('#gradingStatus').inner_text() and el.get_attribute('data-grading-unsaved')=='true' and el.get_attribute('aria-invalid')=='false')
            finally:
                page.evaluate('Storage.prototype.setItem=window.__gradingSetItem;delete window.__gradingSetItem')
            el.fill('3')
            check(f'{width}px successful whole-job retry clears adjacent save warning',not error.is_visible() and el.get_attribute('data-grading-unsaved')=='false' and page.evaluate('JSON.parse(localStorage.getItem("hfc-route-v1")).sweepGrading.profiles["42-forward"].ptvLimitDb===3'))
            if width==320:
                import base64
                raw=(ROOT/'qa/fixtures/viavi-synthetic/reverse.json-1.gz').read_bytes()
                page.locator('#evidenceFiles').set_input_files({'name':'SYNTHETIC.json-1.gz','mimeType':'application/gzip','buffer':raw})
                page.wait_for_function('!EvidenceUI.isBusy()&&state.evidence.length===2')
                page.select_option('#gradingEvidence',page.evaluate('state.evidence[1].id'))
                page.select_option('#gradingDirection','reverse')
                for k,v in {'lowFrequencyMHz':'7','highFrequencyMHz':'15','ptvLimitDb':'3'}.items():page.locator('#grading-'+k).fill(v)
                page.locator('#gradingRun').click();page.wait_for_function('state.sweepGrading.records.length===2')
                check('320px native gzip uses browser decompression and raw unreferenced samples',page.evaluate('state.sweepGrading.records[1].result.metrics.ptvDb===2&&state.sweepGrading.records[1].source.native.referenceState==="unreferenced"&&state.sweepGrading.records[1].result.overall==="unknown"'))
                exported=page.evaluate('async()=>{const p=await evidenceExportProject(state);return p.evidenceFiles[1].base64}')
                check('320px native gzip original remains byte-identical in portable backup',exported==base64.b64encode(raw).decode())
            if width==390:
                page.locator('#evidenceFiles').set_input_files({'name':'SYNTHETIC float display.csv','mimeType':'text/csv','buffer':b'frequency_mhz,level_dbmv\n54,10.1\n100,10.2\n860,10.3'})
                page.wait_for_function('!EvidenceUI.isBusy()&&state.evidence.length===2')
                page.select_option('#gradingEvidence',page.evaluate('state.evidence[1].id'))
                for k,v in {'lowFrequencyMHz':'54','highFrequencyMHz':'860','ptvLimitDb':'1','lowTargetDbmv':'10.1','highTargetDbmv':'10.3','maxLevelErrorDb':'0','tiltTargetDb':'0.2','maxTiltErrorDb':'0'}.items():page.locator('#grading-'+k).fill(v)
                page.locator('#gradingRun').click();page.wait_for_function('state.sweepGrading.records.length===2')
                text=page.locator('[data-grading-current="true"]').inner_text()
                check('390px formatted float display removes tails and identifies computed roundoff', 'measured tilt: 0.2 dB' in text and '≈0 dB · limit 0 dB' in text and '0.20000000000000107' not in text and '1.0547118733938987e-15' not in text)
                check('390px exact raw float result and pass decision remain saved',page.evaluate('(()=>{const r=state.sweepGrading.records.at(-1);return r.result.metrics.measuredTiltDb===10.3-10.1&&r.result.metrics.tiltErrorDb===(10.3-10.1)-0.2&&r.result.overall==="pass";})()'))
            shot=page.screenshot(path=str(serve/f'grading-{width}.png'),full_page=True)
            check(f'{width}px saved screenshot retains the configured phone width',int.from_bytes(shot[16:20],'big')==width)
            context.close()
        browser.close()
    check('No runtime errors',not errors)
    print(f'Sweep grading layout: {len(checks)} checks passed')
finally:server.shutdown()
