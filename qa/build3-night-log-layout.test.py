#!/usr/bin/env python3
"""Actual rendered night-log controls in isolated desktop Chromium. Synthetic data only."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os,tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'outputs')))
Thread(target=server.serve_forever,daemon=True).start()
checks=[]; errors=[]
def check(name,value):
    assert value,name
    checks.append(name);print('PASS '+name,flush=True)
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or '/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width in [320,360,390,430]:
            context=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
            page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html')
            page.evaluate('WorkflowUI.go("nightLog")')
            check(f'{width}px empty state offers general note and Station',page.locator('[data-night-draft="stationIdentity"]').input_value()=='' and page.locator('#nightLogPanel [data-task="station"]').is_visible())
            fixture=page.evaluate((ROOT/'qa/night-log-fixture.js').read_text())
            check(f'{width}px five actual-handler captures',fixture['entries']==5 and all(f'{i}. A{i}' in fixture['preview'] for i in range(1,6)))
            for theme in ['night','sun']:
                page.evaluate('(theme)=>document.documentElement.dataset.theme=theme',theme)
                check(f'{width}px {theme} no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1 && document.querySelector("#nightHandoffPreview").scrollWidth<=document.querySelector("#nightHandoffPreview").clientWidth+1'))
                check(f'{width}px {theme} labeled 44px controls',page.locator('#nightLogPanel button,#nightLogPanel input,#nightLogPanel select').evaluate_all('(els)=>els.filter(e=>e.getBoundingClientRect().height>0).every(e=>e.getBoundingClientRect().height>=44 && (e.closest("label")||e.textContent.trim()))'))
            if width==390:
                size=page.locator('#nightHandoffPreview').evaluate('(e)=>({height:e.getBoundingClientRect().height,scroll:e.scrollHeight,client:e.clientHeight,width:e.scrollWidth,cwidth:e.clientWidth})')
                check('defined 390×844 handoff fits one preview without clipping',size['height']<=744 and size['scroll']<=size['client']+1 and size['width']<=size['cwidth']+1)
                page.locator('#nightHandoffPreview').scroll_into_view_if_needed()
                check('all five handoff entries represented without truncation',fixture['preview']==page.locator('#nightHandoffPreview').input_value())
            page.locator('.night-window').evaluate('(e)=>e.open=true')
            for key in ['windowStart','windowEnd']:
                window=page.locator(f'[data-night-window="{key}"]')
                window.fill('2026-11-11T21:30');page.evaluate('NightLog.render(true)');page.locator('.night-window').evaluate('(e)=>e.open=true');stored=page.evaluate('localStorage.getItem("hfc-route-v1")');window.press('End');window.press('Backspace')
                check(f'{width}px {key} partial keyboard edit is visibly invalid without replacing saved time',page.evaluate(f'state.nightLog.{key}==="2026-11-11T21:30"') and window.input_value()=='2026-11-11T21:3' and window.get_attribute('aria-invalid')=='true' and page.evaluate('localStorage.getItem("hfc-route-v1")')==stored)
                window.evaluate('(e)=>e.scrollIntoView({block:"center"})')
                feedback=page.locator('#'+window.get_attribute('aria-describedby'))
                check(f'{width}px {key} field-specific format error is beside the field within the viewport',feedback.evaluate('(e)=>{const input=document.querySelector(`[aria-describedby="${e.id}"]`),a=input.getBoundingClientRect(),b=e.getBoundingClientRect(),s=getComputedStyle(input);return !e.hidden&&b.top>=a.bottom&&b.top-a.bottom<32&&b.bottom<=innerHeight&&b.top>=0&&/Window (start|end)/.test(e.textContent)&&/YYYY-MM-DDTHH:mm/.test(e.textContent)&&/not saved|retained/i.test(e.textContent)&&s.borderStyle.includes("double")&&input.labels.length===1;}'))
                window.press('Tab')
                check(f'{width}px {key} blur restores saved time with an adjacent explanation',window.input_value()=='2026-11-11T21:30' and window.get_attribute('aria-invalid')!='true' and 'restored' in feedback.inner_text().lower())
                window.focus();window.press('End');window.press('Backspace');page.evaluate('WorkflowUI.go("station");WorkflowUI.go("nightLog")')
                page.locator('.night-window').evaluate('(e)=>e.open=true')
                check(f'{width}px {key} leaving and returning shows the saved value',window.input_value()=='2026-11-11T21:30' and window.get_attribute('aria-invalid')!='true' and page.evaluate(f'state.nightLog.{key}==="2026-11-11T21:30"'))
                window.fill('');window.press('Tab')
                check(f'{width}px {key} intentional complete clear stays unknown',page.evaluate(f'state.nightLog.{key}===""'))
            page.locator('.night-window').evaluate('(e)=>e.open=false')
            large=page.add_style_tag(content='#nightLogPanel :is(button,input,select,textarea) {font-size:20px!important;}')
            check(f'{width}px enlarged controls have no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            large.evaluate('(e)=>e.remove()')
            editor=page.locator('[data-night-draft="action"]');editor.fill('Long label '+('Ω<> &'*100));editor.focus();editor.type(' kept')
            check(f'{width}px typing retains focus',editor.evaluate('(e)=>document.activeElement===e') and editor.input_value().endswith(' kept'))
            page.locator('[data-night-draft="asset"]').fill('Very long synthetic label '+('W'*160));page.locator('[data-night-action="add"]').click()
            check(f'{width}px long notes/labels wrap',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            page.locator('[data-night-entry-id]').first.locator('summary').click()
            entry=page.locator('[data-night-entry-id]').first.locator('[data-night-entry="action"]');entry.fill('Edited captured note')
            check(f'{width}px entry text edit persists',page.evaluate('state.nightLog.entries[0].action==="Edited captured note"'))
            page.locator('[data-night-action="generate"]').click();preview=page.locator('#nightHandoffPreview')
            check(f'{width}px generated preview includes the current note','Edited captured note' in preview.input_value())
            entry.fill('New saved note after preview')
            check(f'{width}px editing an entry clears the stale preview',preview.input_value()=='' and 'changed' in preview.get_attribute('placeholder').lower() and page.evaluate('NightLog.handoffText().includes("New saved note after preview")'))
            page.emulate_media(media='print');check(f'{width}px ordinary print hides log editor',not page.locator('#nightLogPanel').is_visible())
            context.close()
        check('no application runtime errors',not errors);browser.close()
finally:
    server.shutdown();server.server_close()
print(f'Build3 night log layout: {len(checks)} checks passed')
