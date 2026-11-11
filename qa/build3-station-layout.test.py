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
            page.evaluate('state.rows.find(r=>r.id==="r1").device="active_gm_ubt_main";StationView.render()')
            check(f'{width}px legacy station visible and read-only', 'read-only' in page.locator('#stationPanel').inner_text() and page.locator('[data-station-scope="forward"][data-station-field="targetLow"]').is_disabled())
            check(f'{width}px legacy screen fits', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            context.close()
        check('No uncaught station browser errors', not errors)
        browser.close()
    print(f'Build3 station layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
