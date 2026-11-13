#!/usr/bin/env python3
"""Company reference selection in rendered Chromium; synthetic phone viewports, no device claim."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
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
def check(name, value):
    assert value, name
    checks.append(name)
    print('PASS ' + name, flush=True)
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or '/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        for width in [320, 360, 390, 430]:
            context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('dialog', lambda dialog: dialog.accept())
            page.goto(f'http://127.0.0.1:{server.server_port}/outputs/Night_Sweep.html')
            page.evaluate('loadState(TrainingJob.makePractice("complete"));WorkflowUI.go("setup")')
            check(f'{width}px legacy anchors stay unchanged before explicit apply', page.evaluate('(()=>{const s=effectiveLaunchSetup();return [s.lowF,s.highF,s.lowLevel,s.highLevel].join()})()') == '54,860,31,43')
            page.locator('#companyLaunchReference > details > summary').click()
            page.select_option('#companyTargetProfile', 'company-42-20261113')
            page.locator('#applyCompanyTarget').click()
            check(f'{width}px explicit company node design uses linear MHz and output plane', page.evaluate('state.setup.highF===753&&state.setup.lowLevel===32&&state.setup.highLevel===43&&state.setup.launchMode==="linear"&&!state.setup.launchTestPoint'))
            page.locator('#companyLaunchReference > details > summary').click()
            check(f'{width}px launch control has one label and visible tap target', page.locator('#companyTargetProfile').evaluate('(e)=>e.labels.length===1&&e.getBoundingClientRect().height>=44') and page.locator('#applyCompanyTarget').evaluate('(e)=>e.getBoundingClientRect().height>=44'))
            check(f'{width}px company launch wraps without page overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            page.evaluate('WorkflowUI.go("station")')
            page.select_option('[data-station-target]', 'source')
            for key, value in {'lowMHz':'54','highMHz':'753','measuredLow':'32','plane':'node-output'}.items():
                page.locator(f'[data-station-scope="forward"][data-station-field="{key}"]').fill(value)
            check(f'{width}px independent targets display while company errors remain unknown', '32.0 / 43.0 dBmV' in page.locator('[data-station-forward-result]').inner_text() and page.evaluate('StationView.results().pilots.errorLow===null&&StationView.results().pilots.errorHigh===null'))
            page.select_option('[data-station-target]', 'r1')
            check(f'{width}px node targets never populate amplifier worksheet', page.locator('[data-station-scope="forward"][data-station-field="targetLow"]').input_value() == '' and page.locator('[data-station-scope="forward"][data-station-field="targetHigh"]').input_value() == '')
            page.evaluate('WorkflowUI.go("references");document.querySelector("#fieldReferencePanel > details").open=true')
            check(f'{width}px Tools references contains both company domains', page.locator('#fieldReferencePanel [data-company-reference]').count() == 2)
            page.evaluate('WorkflowUI.go("limits")')
            check(f'{width}px all four source rows validate and appear in Limits', page.evaluate('CompanyTargets.registry.every(r=>Thresholds.matches(r.id)===1&&Thresholds.checkRow(Thresholds.get(r.id)).length===0)') and 'Company node' in page.locator('#limitsList').inner_text())
            page.evaluate('loadState(TrainingJob.makePractice("aoi-six-active"));WorkflowUI.go("setup")')
            page.locator('#companyLaunchReference > details > summary').click()
            page.select_option('#companyTargetProfile', 'company-aoi-v15')
            page.locator('#applyCompanyTarget').click()
            page.locator('#companyLaunchReference > details > summary').click()
            check(f'{width}px AOI markers show mains and intended calculated levels', page.locator('#companyLaunchReference tbody tr').count() == 4 and '34.7' in page.locator('#companyLaunchReference').inner_text() and page.locator('#companyLaunchReference tbody').inner_text().count('ALSC main pilot') == 2)
            page.locator('#companyLaunchReference [data-company-reference] details > summary').click()
            details = page.locator('#companyLaunchReference').inner_text()
            check(f'{width}px AOI provenance stays unverified with source mismatch and unnamed timers', all(value in details for value in ['not file-verified','Config 860/750 MHz ver 1.1','2.22.3','2.2.1a','3600 / 3600 / 1800','timer keys/meaning unverified']))
            check(f'{width}px AOI metadata wraps without page overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            page.reload()
            check(f'{width}px cold reload retains company choice and high anchors', page.evaluate('state.setup.companyTargetProfile==="company-aoi-v15"&&state.setup.lowF===261&&state.setup.highF===1215&&state.setup.lowLevel===34&&state.setup.highLevel===49'))
            context.close()
        browser.close()
    check('No browser page errors', not errors)
    print(f'Company targets layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
