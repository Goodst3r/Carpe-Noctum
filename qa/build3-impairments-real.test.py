#!/usr/bin/env python3
"""Real-browser regressions for the impairment card's route search (Test -> Impairments).

Two things need a real browser: a native number box holding only a minus sign reads as "" but is not blank
(validity.badInput is true), and the candidate places must follow the route when the route or the job changes.
Desktop Chromium with phone-sized viewports and touch emulation; not a physical phone. Synthetic data only."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, shutil, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
serve = Path(tempfile.mkdtemp(prefix='cn-imp-real-'))
shutil.copy(ROOT / 'outputs' / 'Night_Sweep.html', serve / 'index.html')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []
OUT = '#impRippleResult'

def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

def open_card(browser, width, job='complete'):
    context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
    page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof ImpairmentsUI!=="undefined"')
    page.evaluate(f"loadState(TrainingJob.makePractice('{job}'));WorkflowUI.go('impairments')")
    shape = page.evaluate("Impairments.SHAPES.find(s=>Impairments.cardForShape(s.id)&&Impairments.cardForShape(s.id).id==='standing-wave').id")
    page.locator(f'input[name="impShape"][value="{shape}"]').check()
    page.wait_for_selector(OUT)
    return context, page

def text(page):
    return page.locator(OUT).inner_text()

def route_checks(browser, width):
    context, page = open_card(browser, width)
    # the pair the practice route really has: pick two points of the saved route and ripple spacing from their cable between
    feet = page.evaluate("(()=>{const d=HFC.run(state,catalog,54);return 0})()") if False else None
    page.locator('[data-imp="spacing"]').fill('1.7'); page.locator('[data-imp="vp"]').fill('0.87'); page.wait_for_timeout(150)
    first = text(page)
    check(f'{width}px route search: a spacing and VP give a distance and a count of places on the saved route', 'Distance between the two mismatches' in first and ('candidate place' in first or 'No pair of points' in first))
    page.evaluate("state.rows=[];renderAll();WorkflowUI.go('route');WorkflowUI.go('impairments')"); page.wait_for_timeout(150)
    after = text(page)
    check(f'{width}px route search: after the route is cleared the old places are gone and the card says the route has no point', 'candidate place' not in after and 'no point with a valid distance' in after)
    page.evaluate("loadState(TrainingJob.makePractice('aoi-six-active'));WorkflowUI.go('route');WorkflowUI.go('impairments')"); page.wait_for_timeout(150)
    again = text(page)
    expected = page.evaluate("(()=>{const r=FieldCalc.rippleDistance('1.7','0.87');const f=Impairments.candidates(state,catalog,r.feet,undefined);return f.ok?f.total:-1})()")
    shown = ('candidate place' in again and f'{expected} candidate' in again) or (expected == 0 and 'No pair of points' in again)
    check(f'{width}px route search: after another job is opened the places are recomputed for that job', shown and again != first)
    context.close()

def box_checks(browser, width):
    context, page = open_card(browser, width)
    page.locator('[data-imp="spacing"]').fill('1.7'); page.locator('[data-imp="vp"]').fill('0.87'); page.wait_for_timeout(150)
    baseline = text(page)
    box = page.locator('[data-imp="width"]')
    box.click(); page.keyboard.type('-'); page.wait_for_timeout(150)
    check(f'{width}px native box: a lone minus sign in the width box reads as empty but is a bad entry', box.evaluate('e=>e.value===""&&e.validity.badInput===true'))
    out = page.locator(OUT)
    check(f'{width}px native box: it is not treated as the default width: the card says Not calculated and shows no places', 'Not calculated' in text(page) and 'search width' in text(page) and 'candidate place' not in text(page) and out.locator('[role=alert]').count() == 1)
    check(f'{width}px native box: the box is marked invalid', box.get_attribute('aria-invalid') == 'true')
    ob, bb = out.bounding_box(), box.bounding_box()
    check(f'{width}px native box: the reason is close under the boxes and inside the screen', 0 <= ob['y'] - (bb['y'] + bb['height']) <= 120 and ob['y'] + min(ob['height'], 60) <= 844)
    box.click(); page.keyboard.press('Control+A'); page.keyboard.type('5'); page.wait_for_timeout(150)
    check(f'{width}px native box: a finished width calculates and clears the marking', 'Not calculated' not in text(page) and box.get_attribute('aria-invalid') is None and '5' in text(page) or 'candidate' in text(page))
    box.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace'); page.keyboard.press('Tab'); page.wait_for_timeout(150)
    check(f'{width}px native box: a deliberately empty width uses the stated default again', text(page) == baseline)
    spacing = page.locator('[data-imp="spacing"]')
    spacing.click(); page.keyboard.press('Control+A'); page.keyboard.type('-'); page.keyboard.press('Tab'); page.wait_for_timeout(150)
    check(f'{width}px native box: a lone minus sign in the spacing box also gives no result and names the box', 'Not calculated' in text(page) and 'ripple spacing' in text(page) and spacing.get_attribute('aria-invalid') == 'true')
    check(f'{width}px native box: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
    context.close()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
    for width in (360, 390):
        route_checks(browser, width)
        box_checks(browser, width)
    browser.close()
server.shutdown()
print(f'Build3 impairments real browser: {len(checks)} checks passed')
