#!/usr/bin/env python3
"""Real-browser regressions for the Station worksheet number and date boxes.

A number box holding only a minus sign, or a date box with one part cleared, reads as "" but is not blank
(validity.badInput is true). Assigning .value cannot make that happen, so this needs a real browser and a real keyboard.
Desktop Chromium with phone-sized viewports and touch emulation; not a physical phone. Synthetic text only."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, shutil, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
serve = Path(tempfile.mkdtemp(prefix='cn-station-real-'))
shutil.copy(ROOT / 'outputs' / 'Night_Sweep.html', serve / 'index.html')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []
NUM = '#station-forward-measuredLow'
DATE = '#station-balanced-date'

def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

def open_station(browser, width):
    context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
    page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof StationView!=="undefined"')
    page.evaluate("loadState(TrainingJob.makePractice('complete'));WorkflowUI.go('station')")
    page.select_option('[data-station-target]', 'r1')
    page.wait_for_selector(NUM)
    return context, page

def saved_number(page):
    return page.evaluate("StationView.currentStage().forward.measuredLow")

def saved_date(page):
    return page.evaluate("StationView.currentRecord().balanced.date")

def leave(page, selector):
    for _ in range(8):
        if not page.evaluate("(s)=>document.activeElement&&document.activeElement.matches(s)", selector):
            return
        page.keyboard.press('Tab')

def number_checks(browser, width):
    context, page = open_station(browser, width)
    box = page.locator(NUM)
    box.click(); page.keyboard.type('12.5'); page.keyboard.press('Tab'); page.wait_for_timeout(120)
    check(f'{width}px number box: a typed reading is saved', saved_number(page) == '12.5')
    box.click(); page.keyboard.press('Control+A'); page.keyboard.type('-'); page.wait_for_timeout(120)
    check(f'{width}px number box: a lone minus sign reads as empty but is a bad entry', box.evaluate('e=>e.value===""&&e.validity.badInput===true'))
    check(f'{width}px number box: the saved reading is not erased', saved_number(page) == '12.5')
    problem = page.locator('.station-field-error')
    check(f'{width}px number box: the box is marked invalid and the reason is an alert naming the saved value', box.get_attribute('aria-invalid') == 'true' and problem.count() == 1 and problem.get_attribute('role') == 'alert' and problem.inner_text().startswith('Not saved') and '12.5' in problem.inner_text())
    pb, bb = problem.bounding_box(), box.bounding_box()
    check(f'{width}px number box: the reason sits right under the box and inside the screen', 0 <= pb['y'] - (bb['y'] + bb['height']) <= 40 and pb['y'] + pb['height'] <= 844 and pb['x'] >= 0 and pb['x'] + pb['width'] <= width + 1)
    page.keyboard.press('Tab'); page.wait_for_timeout(120)
    check(f'{width}px number box: leaving the box still keeps the saved reading', saved_number(page) == '12.5' and box.get_attribute('aria-invalid') == 'true')
    box.click(); page.keyboard.press('Control+A'); page.keyboard.type('-3'); page.wait_for_timeout(120)
    check(f'{width}px number box: finishing the entry saves the negative reading and clears the marking', saved_number(page) == '-3' and page.locator('.station-field-error').count() == 0 and box.get_attribute('aria-invalid') is None)
    box.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace'); page.keyboard.press('Tab'); page.wait_for_timeout(120)
    check(f'{width}px number box: clearing the whole box on purpose saves a blank with no error', saved_number(page) == '' and page.locator('.station-field-error').count() == 0)
    box.click(); page.keyboard.type('-'); page.keyboard.press('Tab'); page.wait_for_timeout(120)
    problem = page.locator('.station-field-error')
    check(f'{width}px number box: a lone minus left in an empty box says nothing is saved yet', saved_number(page) == '' and problem.count() == 1 and 'Nothing is saved' in problem.inner_text())
    check(f'{width}px number box: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
    context.close()

def date_checks(browser, width):
    context, page = open_station(browser, width)
    box = page.locator(DATE)
    box.click(); page.keyboard.type('11112026'); page.wait_for_timeout(150)
    check(f'{width}px date box: a typed date is saved', saved_date(page) == '2026-11-11')
    bb = box.bounding_box()
    page.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2); page.keyboard.press('Backspace'); leave(page, DATE); page.wait_for_timeout(200)
    check(f'{width}px date box: a date with the month cleared reads as empty but is a bad entry', box.evaluate('e=>e.value===""&&e.validity.badInput===true'))
    check(f'{width}px date box: the saved date is not erased', saved_date(page) == '2026-11-11')
    problem = page.locator('.station-field-error')
    check(f'{width}px date box: the box is marked invalid and the reason names the saved date', box.get_attribute('aria-invalid') == 'true' and problem.count() == 1 and '2026-11-11' in problem.inner_text() and problem.inner_text().startswith('Not saved'))
    bb = box.bounding_box(); page.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2); page.keyboard.type('10'); page.wait_for_timeout(200)
    check(f'{width}px date box: finishing the date saves it and clears the marking', saved_date(page) == '2026-10-11' and page.locator('.station-field-error').count() == 0 and box.get_attribute('aria-invalid') is None)
    page.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2)
    for _ in range(3):
        page.keyboard.press('Backspace'); page.keyboard.press('Tab')
    leave(page, DATE); page.wait_for_timeout(250)
    check(f'{width}px date box: clearing every part on purpose saves a blank with no error', saved_date(page) == '' and page.locator('.station-field-error').count() == 0 and box.get_attribute('aria-invalid') is None)
    check(f'{width}px date box: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
    context.close()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
    for width in (360, 390):
        number_checks(browser, width)
        date_checks(browser, width)
    browser.close()
server.shutdown()
print(f'Build3 station real browser: {len(checks)} checks passed')
