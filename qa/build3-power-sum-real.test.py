#!/usr/bin/env python3
"""Real-keyboard check for the power-sum card.

A type=number box reports a half-typed value as empty with validity.badInput.
That must not be dropped as an unused trailing blank. Desktop Chromium, phone
viewports, touch emulation. Not a physical phone."""
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
    return page.locator('#calc-power-result').inner_text().replace('\n', ' ')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
    for width in (320, 375, 390, 430):
        context = browser.new_context(viewport={'width': width, 'height': 800}, is_mobile=width < 600, has_touch=width < 600)
        context.add_init_script("try{localStorage.setItem('nightsweep-theme-v1','night')}catch(e){}")
        page = context.new_page()
        page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html')
        page.wait_for_function("typeof WorkflowUI!=='undefined' && typeof FieldCalcs!=='undefined'")
        page.evaluate("WorkflowUI.go('calculators')")
        boxes = page.locator('[data-power-level]')
        boxes.nth(0).click(); page.keyboard.type('40')
        boxes.nth(1).click(); page.keyboard.type('37')
        page.wait_for_timeout(50)
        check(f'{width}px 40 and 37 show 41.7643', '41.7643' in result_text(page))
        page.locator('[data-power-add]').click()
        third = page.locator('[data-power-level]').nth(2)
        third.click(); page.keyboard.type('-'); page.wait_for_timeout(50)
        text = result_text(page)
        check(f'{width}px a lone minus is refused and is not summed as a blank', 'Finish the number' in text and '41.7643' not in text)
        for _ in range(4):
            page.keyboard.press('Backspace')
        page.wait_for_timeout(50)
        check(f'{width}px clearing the extra box on purpose returns the two-level sum', '41.7643' in result_text(page))
        third.click(); page.keyboard.type('1e'); page.wait_for_timeout(50)
        text = result_text(page)
        check(f'{width}px an unfinished exponent is refused and is not summed as a blank', 'Finish the number' in text and '41.7643' not in text)
        for _ in range(4):
            page.keyboard.press('Backspace')
        page.wait_for_timeout(50)
        third.click(); page.keyboard.type('34'); page.wait_for_timeout(50)
        check(f'{width}px finishing the third level sums 40, 37 and 34', '42.4363' in result_text(page))
        context.close()
    browser.close()
server.shutdown()
print(f'Build3 power sum real browser: {len(checks)} checks passed')
