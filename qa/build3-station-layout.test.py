#!/usr/bin/env python3
"""Rendered station checks in desktop Chromium at phone widths; no device claim."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
serve = Path(tempfile.mkdtemp(prefix='cn-station-layout-'))
(serve / 'index.html').write_bytes((ROOT / 'outputs/Night_Sweep.html').read_bytes())

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []

def check(name, value):
    assert value, name
    checks.append(name)
    print('PASS ' + name, flush=True)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
        for width in [320, 360, 390, 430]:
            context = browser.new_context(viewport={'width': width, 'height': 800}, is_mobile=True, has_touch=True)
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
            check(f'{width}px station module available', page.evaluate('typeof StationView === "object"'))
            page.evaluate('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("station")')
            picker = page.locator('[data-station-target]')
            picker.select_option('r1')
            def fill(scope, key, value):
                page.locator(f'[data-station-scope="{scope}"][data-station-field="{key}"]').fill(value)
            for key, value in dict(lowMHz='54', highMHz='860', measuredLow='36.4', measuredHigh='49.6', targetLow='39', targetHigh='49').items():
                fill('forward', key, value)
            page.locator('[data-station-field="pad"][data-station-scope="forward"]').select_option('6')
            page.locator('[data-station-field="eq"][data-station-scope="forward"]').select_option('9')
            for key, value in dict(referencePointTarget='19', insertionLoss='20', actualInjection='39', receiverReading='-1.25', receiverReference='-3.5').items():
                fill('returns', key, value)
            check(f'{width}px station screen visible', page.locator('#stationPanel').is_visible())
            check(f'{width}px forward solver rendered', '4.5' in page.locator('[data-station-forward-result]').inner_text())
            check(f'{width}px signed receiver delta rendered', '+2.25' in page.locator('[data-station-return-result]').inner_text())
            check(f'{width}px lower-split reminder excludes HGD high-split recommendation', '9 dBmV' not in page.locator('[data-station-return-reference]').inner_text() and page.locator('#stationPanel [data-threshold="company.sweep42.txReference"]').count() == 1)
            check(f'{width}px signed fields allow the platform keyboard with a minus key', page.locator('[data-station-scope="forward"][data-station-field="measuredLow"],[data-station-scope="returns"][data-station-field="receiverReading"],[data-station-scope="returns"][data-station-field="eq"]').evaluate_all('(els)=>els.every(e=>!e.hasAttribute("inputmode"))'))
            check(f'{width}px source buttons are outside input labels', page.locator('#stationPanel label [data-threshold]').count() == 0)
            label_input = page.locator('[data-station-scope="forward"][data-station-field="targetLow"]')
            check(f'{width}px target input has a clean accessible label', label_input.evaluate('(el)=>el.labels.length===1 && el.labels[0].textContent.trim()==="Low target (dBmV)"'))
            page.get_by_label('Low target (dBmV)', exact=True).fill('39')
            label_input.evaluate('(el)=>el.labels[0].click()')
            check(f'{width}px tapping the input label focuses the field without opening a source', label_input.evaluate('(el)=>document.activeElement===el') and page.locator('dialog.source-sheet[open]').count() == 0)
            tag_sizes = page.locator('#stationPanel [data-threshold]').evaluate_all('(els)=>els.filter(e=>e.getBoundingClientRect().width).map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})')
            check(f'{width}px station source buttons have 44px tap targets', bool(tag_sizes) and all(w >= 44 and h >= 44 for w, h in tag_sizes))
            check(f'{width}px page fits viewport', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            boxes = page.locator('#stationPanel input:not([type=checkbox]),#stationPanel select,#stationPanel textarea,#stationPanel .check').evaluate_all('(els)=>els.filter(e=>e.getBoundingClientRect().width).map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height}})')
            check(f'{width}px fields fit and remain touch sized', bool(boxes) and all(b['left'] >= -1 and b['right'] <= width + 1 and b['height'] >= 40 for b in boxes))
            check(f'{width}px result text wraps', page.locator('[data-station-forward-result],[data-station-return-result]').evaluate_all('(els)=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'))
            page.locator('#stationPanel [data-threshold="station.return.injection"]').click()
            check(f'{width}px source opens on tap', page.locator('dialog.source-sheet[open]').is_visible())
            page.keyboard.press('Escape')
            fill('returns', 'insertionLoss', '-1')
            check(f'{width}px invalid loss has a reason', 'nonnegative' in page.locator('[data-station-return-result]').inner_text())
            page.locator('[data-station-scope="record"][data-station-field="stage"]').select_option('after')
            check(f'{width}px stage change shows separate readings', page.locator('[data-station-scope="returns"][data-station-field="actualInjection"]').input_value() == '')
            fill('returns', 'insertionLoss', '20')
            for value in ['+19', ' 19 ', '0x10', '0b10', '19.', '1e309']:
                page.evaluate('(v)=>{StationView.currentRecord().stages.after.returns.referencePointTarget=v;loadState(JSON.parse(JSON.stringify(state)));WorkflowUI.go("station")}', value)
                check(f'{width}px invisible imported operand {value!r} gives no injection', page.locator('[data-station-scope="returns"][data-station-field="referencePointTarget"]').input_value() == '' and not page.evaluate('StationView.results().returns.requiredInjection.ok') and page.evaluate('StationView.currentStage().returns.referencePointTarget') == value)
            picker.select_option('source')
            fill('returns', 'referencePointTarget', '19')
            fill('returns', 'insertionLoss', '20')
            fill('balanced', 'date', '2026-11-10')
            page.locator('[data-station-scope="balanced"][data-station-field="done"]').check()
            saved_source = page.evaluate('JSON.stringify(state)')
            page.evaluate('(text)=>{catalog.nodeProfiles.find(n=>n.id===state.node.model).bands[0].forwardFloor=55;loadState(JSON.parse(text));WorkflowUI.go("station")}', saved_source)
            check(f'{width}px catalog correction keeps the saved source worksheet bound', page.evaluate('StationView.results().returns.requiredInjection.value===39 && StationView.currentRecord().balanced.done') and page.locator('[data-station-scope="returns"][data-station-field="referencePointTarget"]').input_value() == '19')
            page.evaluate('catalog.nodeProfiles.find(n=>n.id===state.node.model).bands[0].forwardFloor=54;StationView.render()')
            page.evaluate('const old=StationView.currentRecord();delete old.bindingVersion;old.equipmentContext=JSON.stringify([state.node.model,42,[54,1218],"node",state.node.asset,state.node.port,state.node.module]);loadState(JSON.parse(JSON.stringify(state)));WorkflowUI.go("station")')
            legacy_id = page.evaluate('state.setup.stationIdentity')
            legacy_record = page.evaluate('StationView.currentRecord()')
            check(f'{width}px legacy binding notice preserves visible read-only measurements', page.locator('[data-station-binding-notice]').is_visible() and page.locator('[data-station-scope="returns"][data-station-field="referencePointTarget"]').is_disabled() and page.evaluate('StationView.results().returns.requiredInjection.value===39'))
            page.locator('[data-station-confirm-binding]').click()
            check(f'{width}px explicit binding confirmation archives the original', page.evaluate('state.setup.stationIdentity') != legacy_id and page.evaluate('(id)=>state.stationView.stations[id]', legacy_id) == legacy_record and page.locator('[data-station-scope="returns"][data-station-field="referencePointTarget"]').is_enabled())
            page.evaluate('WorkflowUI.go("setup")')
            for field in ['asset', 'port', 'module']:
                page.locator(f'[data-launch-node="{field}"]').fill('SYNTHETIC changed ' + field)
            page.evaluate('WorkflowUI.go("station")')
            check(f'{width}px changed launch identity starts unknown with no inherited done record', not page.evaluate('StationView.results().returns.requiredInjection.ok') and not page.evaluate('StationView.currentRecord().balanced.done'))
            picker.select_option('r1')
            page.evaluate('state.rows.find(r=>r.id==="r1").device="active_gm_ubt_main";StationView.render()')
            check(f'{width}px legacy station visible and read-only', 'read-only' in page.locator('#stationPanel').inner_text() and page.locator('[data-station-scope="forward"][data-station-field="targetLow"]').is_disabled())
            check(f'{width}px legacy screen fits', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            page.evaluate('state.rows.find(r=>r.id==="r1").device="active_aoi_hgd";StationView.render()')
            check(f'{width}px HGD reminder uses only its high-split recommendation', '9 dBmV per 6.4 MHz' in page.locator('[data-station-return-reference]').inner_text() and '38 dBmV' not in page.locator('[data-station-return-reference]').inner_text() and page.locator('#stationPanel [data-threshold="company.sweep42.txReference"]').count() == 0)
            page.evaluate('state.rows.find(r=>r.id==="r1").device="active_aoi_le";StationView.render()')
            check(f'{width}px LE never receives the HGD input recommendation', '9 dBmV' not in page.locator('[data-station-return-reference]').inner_text() and page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            context.close()
        check('No uncaught station browser errors', not errors)
        browser.close()
    print(f'Build3 station layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
