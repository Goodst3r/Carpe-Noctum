#!/usr/bin/env python3
"""Rendered catalog/reference and Station checks; synthetic desktop Chromium phone viewports."""
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
            for palette in ['night', 'sun']:
                context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
                page = context.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.on('dialog', lambda dialog: dialog.accept())
                page.goto(f'http://127.0.0.1:{server.server_port}/outputs/Night_Sweep.html')
                page.evaluate(f'loadState(TrainingJob.makePractice("complete"));document.documentElement.dataset.theme="{palette}";WorkflowUI.go("references");document.querySelector("#fieldReferencePanel > details").open=true;document.querySelector("#gainmakerEqReference").open=true')
                tag = f'{width}px {palette}'
                check(tag+' four distinct families and all nominal choices', page.locator('[data-eq-reference="family"] option').count() == 4 and page.locator('[data-eq-reference="part"] option').count() == 21)
                check(tag+' reference controls have labels and44px targets', page.locator('#gainmakerEqReference input,#gainmakerEqReference select').evaluate_all('(els)=>els.every(e=>e.labels.length===1&&e.getBoundingClientRect().height>=44)'))
                page.select_option('[data-eq-reference="family"]', 'standard-return-204')
                page.select_option('[data-eq-reference="part"]', 'standard-return-204/6')
                page.locator('[data-eq-reference="low"]').fill('11')
                text = page.locator('#gainmakerEqResult').inner_text()
                check(tag+' unknown11MHz retains documented204MHz loss and complete part list', 'Low attenuation: — · unknown' in text and 'High attenuation: 1.0 dB · known' in text and page.locator('[data-eq-reference="part"] option').count() == 13)
                page.select_option('[data-eq-reference="family"]', 'standard-return-42')
                page.select_option('[data-eq-reference="part"]', 'standard-return-42/6')
                page.locator('[data-eq-reference="low"]').fill('11')
                check(tag+' 42MHz estimate is labelled separately from nominal6.1', 'Low attenuation: 4.0 dB · estimated' in page.locator('#gainmakerEqResult').inner_text() and '3.1 dB · estimated' in page.locator('#gainmakerEqResult').inner_text() and '6.1 dB at 42 MHz' in page.locator('[data-eq-reference="part"]').inner_text())
                page.select_option('[data-eq-reference="family"]', 'forward-cable-1p2g')
                page.select_option('[data-eq-reference="part"]', 'forward-cable-1p2g/6')
                page.select_option('[data-eq-reference="change"]', 'forward-cable-1p2g/12')
                page.locator('[data-eq-reference="low"]').fill('258')
                check(tag+' F3 displays old-minus-new and positive output tilt change with independent statuses', '-3.5 dB · known' in page.locator('[data-eq-change="low"]').inner_text() and '0.0 dB · known' in page.locator('[data-eq-change="high"]').inner_text() and '+3.5 dB · known' in page.locator('[data-eq-change="tilt"]').inner_text())
                page.select_option('[data-eq-reference="family"]', 'forward-cable-1g')
                page.select_option('[data-eq-reference="part"]', 'forward-cable-1g/6')
                page.select_option('[data-eq-reference="change"]', 'forward-cable-1g/12')
                page.locator('[data-eq-reference="low"]').fill('300')
                page.locator('[data-eq-reference="high"]').fill('900')
                check(tag+' partial output change retains its own estimated status and source', '— · unknown' in page.locator('[data-eq-change="low"]').inner_text() and '-0.3 dB · estimated' in page.locator('[data-eq-change="high"]').inner_text() and 'ATX ANW1513' in page.locator('[data-eq-change="high"]').inner_text() and '— · unknown' in page.locator('[data-eq-change="tilt"]').inner_text())
                check(tag+' references wrap without page overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                page.select_option('[data-eq-reference="family"]', 'standard-return-42')
                page.select_option('[data-eq-reference="part"]', 'standard-return-42/0')
                page.locator('#gainmakerEqReference > details > summary').click()
                check(tag+' zero anomaly remains visible with dash losses', 'Source anomaly: GAGM-EQREV-204M-0' in page.locator('#gainmakerEqPart').inner_text() and 'unknown · source dash' in page.locator('#gainmakerEqPart').inner_text())
                page.evaluate('WorkflowUI.go("parts")')
                page.locator('#catalogSearch').fill('GM-EQC-1.2G-1.5=')
                page.locator('#catalogItems details > summary').click()
                page.wait_for_function('document.querySelector("#catalogItems table") !== null')
                check(tag+' catalog preserves source precision and branding', '2.23' in page.locator('#catalogItems').inner_text() and 'Cisco GM-EQC-1.2G-1.5=' in page.locator('#catalogItems').inner_text() and 'ATX GAGM-EQC-1.2G-1.5' in page.locator('#catalogItems').inner_text())
                check(tag+' catalog source text wraps without page overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                page.evaluate('WorkflowUI.go("station")')
                page.select_option('[data-station-target]', 'r1')
                for key, value in {'lowMHz':'300','highMHz':'1002','eq':'12'}.items():
                    el = page.locator(f'[data-station-scope="forward"][data-station-field="{key}"]')
                    el.select_option(value) if key == 'eq' else el.fill(value)
                page.locator('[data-station-eq-loss] > summary').click()
                check(tag+' Station partial EQ lookup preserves known high loss', 'Low attenuation: — · unknown' in page.locator('[data-station-eq-loss]').inner_text() and 'High attenuation: 1.0 dB · known' in page.locator('[data-station-eq-loss]').inner_text())
                page.locator('[data-station-scope="forward"][data-station-field="highMHz"]').fill('1000')
                check(tag+' Station pilot refresh preserves the open disclosure', page.locator('[data-station-eq-loss]').evaluate('(e)=>e.open') and 'High attenuation: 1.0 dB · known' in page.locator('[data-station-eq-loss]').inner_text())
                check(tag+' Station reference wraps without page overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                page.evaluate('loadState(TrainingJob.makePractice("complete"));state.rows[0].device="active_gm_lgd_65";renderAll();WorkflowUI.go("station")')
                page.select_option('[data-station-target]', 'r1')
                page.locator('[data-station-scope="forward"][data-station-field="lowMHz"]').fill('86')
                page.locator('[data-station-scope="forward"][data-station-field="highMHz"]').fill('1002')
                page.select_option('[data-station-scope="forward"][data-station-field="eq"]', '12')
                page.locator('[data-station-eq-loss] > summary').click()
                check(tag+' LGD65 hardware permits known EQ losses while local workflow stays unconfigured', 'Low attenuation: 9.9 dB · known' in page.locator('[data-station-eq-loss]').inner_text() and 'High attenuation: 1.0 dB · known' in page.locator('[data-station-eq-loss]').inner_text() and page.evaluate('(()=>{const t=StationView.targets().find(t=>t.key===StationView.currentTarget().key);return t.returnCeiling===65&&t.split===""})()'))
                page.evaluate('WorkflowUI.go("sweepSetup")')
                check(tag+' Meter setup explains204endpoint limit and manual return selection', 'known endpoint losses only' in page.locator('[data-gainmaker-sweep-reference]').inner_text() and 'automatic return part recommendation' in page.locator('[data-gainmaker-sweep-reference]').inner_text())
                page.evaluate('WorkflowUI.go("references");document.querySelector("#fieldReferencePanel > details").open=true;document.querySelector("#gainmakerEqReference").open=true')
                page.emulate_media(media='print')
                check(tag+' transient reference follows existing Tools print exclusion', not page.locator('#gainmakerEqReference').is_visible())
                context.close()
        browser.close()
    check('No browser page errors', not errors)
    print(f'GainMaker EQ layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
