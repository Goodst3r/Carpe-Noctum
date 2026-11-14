#!/usr/bin/env python3
"""Real native Station editing in desktop Chromium; no physical-device claim."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []

def check(name, condition):
    assert condition, name
    checks.append(name)
    print('PASS ' + name, flush=True)

SEED = '''() => {
 loadState({version:1,setup:{...defaultSetup,sourceType:'active',sourceModel:'active_gm_hgd',sourceAsset:'SYNTHETIC SOURCE',sourcePort:'main'},rows:[{id:'r1',name:'SYNTHETIC ACTIVE',parent:'source',length:300,cable:'p3_625',device:'active_gm_hgd',customLoss:'',customCable:'',terminal:false}]});
 WorkflowUI.go('station');const p=document.querySelector('[data-station-target]');p.value='r1';p.dispatchEvent(new Event('change',{bubbles:true}));
 for(const[k,v]of Object.entries({lowMHz:'54',highMHz:'860',targetLow:'39',targetHigh:'49',measuredLow:'36.4',measuredHigh:'49.6'})){const e=document.querySelector('[data-station-scope="forward"][data-station-field="'+k+'"]');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}
 for(const[k,v]of [['balanced','2026-11-10'],['swept','2026-11-11']]){const e=document.querySelector('[data-station-scope="'+k+'"][data-station-field="date"]');e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));}
 for(const scope of ['balanced','swept']){const done=document.querySelector('[data-station-scope="'+scope+'"][data-station-field="done"]');done.checked=true;done.dispatchEvent(new Event('change',{bubbles:true}));}saveLocal();
}'''
SNAP = '() => ({state:JSON.stringify(state),store:localStorage.getItem("hfc-route-v1")})'

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True)
        for width in [320, 360, 390, 430]:
            context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True, locale='en-US', color_scheme='dark')
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}/outputs/Night_Sweep.html')

            def control(scope, key):
                return page.locator(f'[data-station-scope="{scope}"][data-station-field="{key}"]')

            def focus(input):
                input.evaluate('(e)=>{e.focus();e.scrollIntoView({block:"center"})}')

            def leave(input):
                # Native date controls expose several internal tab stops.
                for _ in range(8):
                    if not input.evaluate('(e)=>document.activeElement===e'):
                        break
                    page.keyboard.press('Tab')
                assert not input.evaluate('(e)=>document.activeElement===e'), 'Actual native focus departure'

            def partial_date(input):
                focus(input)
                for _ in range(5):
                    page.keyboard.press('ArrowLeft')
                page.keyboard.press('Backspace')
                assert input.evaluate('(e)=>e.value==="" && e.validity.badInput'), 'Real incomplete native date precondition'

            page.evaluate(SEED)
            before = page.evaluate(SNAP)
            input = control('forward', 'measuredLow')
            focus(input)
            page.keyboard.press('Control+A')
            page.keyboard.press('-')
            check(f'{width}px real minus is native badInput', input.evaluate('(e)=>e.value==="" && e.validity.badInput'))
            check(f'{width}px incomplete reading preserves full state and autosave', page.evaluate(SNAP) == before)
            exported = page.evaluate('async()=>JSON.stringify((await evidenceExportProject(state)).stationView)')
            check(f'{width}px portable export keeps the recorded reading', '"measuredLow":"36.4"' in exported)
            geometry = input.evaluate('''e=>{const f=document.getElementById(e.getAttribute('aria-describedby')),r=e.getBoundingClientRect(),x=f?.getBoundingClientRect(),css=getComputedStyle(e);return {invalid:e.getAttribute('aria-invalid'),text:f?.textContent,gap:x?x.top-r.bottom:999,bottom:x?.bottom,border:css.borderStyle,height:r.height}}''')
            check(f'{width}px named adjacent live error and noncolor marking', geometry['invalid'] == 'true' and 'Low reading (dBmV)' in (geometry['text'] or '') and 'not saved' in (geometry['text'] or '').lower() and 0 <= geometry['gap'] < 24 and geometry['bottom'] <= 844 and geometry['border'] == 'double' and geometry['height'] >= 44)
            leave(input)
            check(f'{width}px incomplete blur restores recorded value without a write', input.input_value() == '36.4' and input.get_attribute('aria-invalid') != 'true' and page.evaluate(SNAP) == before)

            input.fill('0')
            zero = page.evaluate(SNAP)
            focus(input)
            page.keyboard.press('Control+A')
            page.keyboard.press('-')
            check(f'{width}px recorded zero survives native invalid draft', page.evaluate(SNAP) == zero)
            leave(input)
            check(f'{width}px zero is restored as zero rather than blank', input.input_value() == '0' and page.evaluate(SNAP) == zero)
            input.fill('12')
            exponent = page.evaluate(SNAP)
            focus(input)
            page.keyboard.press('End')
            page.keyboard.press('e')
            check(f'{width}px partial exponent preserves latest committed value', input.evaluate('(e)=>e.validity.badInput') and page.evaluate(SNAP) == exponent)
            page.evaluate('WorkflowUI.go("home");WorkflowUI.go("station")')
            check(f'{width}px explicit return restores cached reading control', control('forward', 'measuredLow').input_value() == '12' and page.evaluate(SNAP) == exponent)
            input = control('forward', 'measuredLow')
            focus(input)
            page.keyboard.press('Control+A')
            page.keyboard.press('Backspace')
            check(f'{width}px intentional numeric clear still records unknown', not input.evaluate('(e)=>e.validity.badInput') and page.evaluate('StationView.currentStage().forward.measuredLow') == '')

            for scope, recorded, other, other_date in [('balanced','2026-11-10','swept','2026-11-11'),('swept','2026-11-11','balanced','2026-11-10')]:
                page.evaluate(SEED)
                before = page.evaluate(SNAP)
                date = control(scope, 'date')
                partial_date(date)
                check(f'{width}px partial {scope} date preserves raw records and autosave', page.evaluate(SNAP) == before and date.get_attribute('aria-invalid') == 'true')
                leave(date)
                check(f'{width}px incomplete {scope} blur restores exact date and independent facts', date.input_value() == recorded and page.evaluate(SNAP) == before)
                partial_date(date)
                for key in ['ArrowRight','Backspace','ArrowRight','Backspace']:
                    page.keyboard.press(key)
                check(f'{width}px complete segmented {scope} clear becomes natively valid', date.input_value() == '' and not date.evaluate('(e)=>e.validity.badInput'))
                leave(date)
                check(f'{width}px touched {scope} complete clear is committed after actual focus departure', page.evaluate('(s)=>StationView.currentRecord()[s].date', scope) == '' and page.evaluate('(s)=>StationView.currentRecord()[s].date', other) == other_date and page.evaluate('StationView.currentRecord().balanced.done===true && StationView.currentRecord().swept.done===true'))

            page.evaluate(SEED)
            page.evaluate('StationView.currentRecord().stages.before.forward.measuredLow="+19";StationView.currentRecord().balanced.date="2026-02-30";loadState(JSON.parse(JSON.stringify(state)));WorkflowUI.go("station")')
            imported = page.evaluate(SNAP)
            for scope,key in [('forward','measuredLow'),('balanced','date')]:
                hidden = control(scope,key)
                check(f'{width}px invalid imported {scope} raw is hidden by native control', hidden.input_value() == '' and not hidden.evaluate('(e)=>e.validity.badInput'))
                focus(hidden)
                leave(hidden)
            check(f'{width}px untouched hidden invalid raw survives ordinary focus and blur', page.evaluate(SNAP) == imported)
            check(f'{width}px native feedback fits the phone', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            context.close()
        check('No Station native-input browser errors', not errors)
        browser.close()
    print(f'Build3 station native layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
