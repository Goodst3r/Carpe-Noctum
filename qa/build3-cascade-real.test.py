#!/usr/bin/env python3
"""Real-keyboard check for the thermal CNR card.

A type=number box reports a half-typed value as empty with validity.badInput.
That must not be dropped as a blank. Desktop Chromium, phone viewports, touch
emulation. Not a physical phone."""
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

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT / 'outputs')))
Thread(target=server.serve_forever, daemon=True).start()
checks = []

def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

def result_text(page):
    return page.locator('#calc-cascade-result').inner_text().replace('\n', ' ')

def field(page, name):
    return page.locator(f'[data-calc="cascade"][data-field="{name}"]')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
    for width in (320, 375, 390, 430):
        context = browser.new_context(viewport={'width': width, 'height': 800}, is_mobile=width < 600, has_touch=width < 600)
        context.add_init_script("try{localStorage.setItem('nightsweep-theme-v1','night')}catch(e){}")
        page = context.new_page()
        page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html')
        page.wait_for_function("typeof WorkflowUI!=='undefined' && typeof FieldCalcs!=='undefined'")
        page.evaluate("WorkflowUI.go('calculators')")
        field(page, 'bandwidth').click(); page.keyboard.type('6400000')
        field(page, 'input').click(); page.keyboard.type('15')
        field(page, 'nf').click(); page.keyboard.type('8')
        field(page, 'count').click(); page.keyboard.type('10')
        field(page, 'optical').click(); page.keyboard.type('45')
        page.wait_for_timeout(50)
        text = result_text(page)
        check(f'{width}px C1 shows the four six-figure results', all(part in text for part in ('-57.1628', '64.1628', '54.1628', '44.5029')))
        nf = field(page, 'nf')
        nf.click(); page.keyboard.press('Control+A'); page.keyboard.type('-'); page.wait_for_timeout(50)
        text = result_text(page)
        check(f'{width}px a half-typed noise figure is refused', 'Finish the number' in text and '64.1628' not in text)
        page.keyboard.press('Backspace'); page.keyboard.type('8'); page.wait_for_timeout(50)
        check(f'{width}px restoring the noise figure brings C1 back', '44.5029' in result_text(page))
        page.locator('[data-calc="cascade"][data-field="operation"]').select_option('combine_cnr')
        page.wait_for_timeout(50)
        boxes = page.locator('[data-cascade-cnr]')
        check(f'{width}px combine starts with two boxes and no thermal input', boxes.count() == 2 and field(page, 'bandwidth').count() == 0)
        boxes.nth(0).click(); page.keyboard.type('40')
        boxes.nth(1).click(); page.keyboard.type('40')
        page.wait_for_timeout(50)
        check(f'{width}px two 40 dB CNR values show 36.9897', '36.9897' in result_text(page))
        boxes.nth(1).click(); page.keyboard.press('Control+A'); page.keyboard.type('1e'); page.wait_for_timeout(50)
        text = result_text(page)
        check(f'{width}px an unfinished CNR exponent is refused', 'Finish the number' in text and '36.9897' not in text)
        context.close()
    browser.close()
server.shutdown()
print(f'Build3 cascade real browser: {len(checks)} checks passed')
