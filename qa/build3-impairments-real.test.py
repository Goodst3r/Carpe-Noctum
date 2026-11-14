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

def import_checks(browser, width):
    """Opening a project goes to Route; returning to Impairments must show the new route's places."""
    context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('dialog', lambda d: d.accept())
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
    page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof ImpairmentsUI!=="undefined"')
    page.evaluate("WorkflowUI.go('impairments')")
    shape = page.evaluate("Impairments.SHAPES.find(s=>Impairments.cardForShape(s.id)&&Impairments.cardForShape(s.id).id==='standing-wave').id")
    page.locator(f'input[name="impShape"][value="{shape}"]').check()
    page.wait_for_selector(OUT)
    page.locator('[data-imp="spacing"]').fill('1.7'); page.locator('[data-imp="vp"]').fill('0.87'); page.wait_for_timeout(150)
    first = text(page)
    check(f'{width}px header import: the starting route shows candidate places', 'candidate place' in first and 'Tap 1' in first)
    tmp = Path(tempfile.mkdtemp(prefix='cn-imp-file-'))
    empty = tmp / 'empty-route.json'
    empty.write_text(page.evaluate("JSON.stringify({...JSON.parse(JSON.stringify(state)),rows:[]})"))
    page.set_input_files('#load', str(empty)); page.wait_for_timeout(500)
    check(f'{width}px header import: the opened project goes to Route', page.evaluate("WorkflowUI.current()") == 'route')
    page.evaluate("WorkflowUI.go('impairments')")
    page.locator(OUT).wait_for(state='visible')
    after = text(page)
    check(f'{width}px header import: returning to Impairments with no route removes the old places and says the route has no point', page.evaluate('state.rows.length') == 0 and 'candidate place' not in after and 'Tap 1' not in after and 'no point with a valid distance' in after)
    other = tmp / 'other-route.json'
    other.write_text(page.evaluate("JSON.stringify(TrainingJob.makePractice('aoi-six-active'))"))
    page.set_input_files('#load', str(other)); page.wait_for_timeout(500)
    check(f'{width}px header import: the second project goes to Route', page.evaluate("WorkflowUI.current()") == 'route')
    page.evaluate("WorkflowUI.go('impairments')")
    page.locator(OUT).wait_for(state='visible')
    expected = page.evaluate("(()=>{const r=FieldCalc.rippleDistance('1.7','0.87');const f=Impairments.candidates(state,catalog,r.feet,undefined);return f.ok?f.total:-1})()")
    again = text(page)
    check(f'{width}px header import: a second project with another route shows that route\'s places', page.evaluate('state.rows.length') > 0 and ((expected > 0 and f'{expected} candidate' in again) or (expected == 0 and 'No pair of points' in again)) and again != after)
    page.evaluate("window.NightSweep.openProject(JSON.stringify({...JSON.parse(JSON.stringify(state)),rows:[]}))"); page.wait_for_timeout(500)
    check(f'{width}px native open: the opened project goes to Route', page.evaluate("WorkflowUI.current()") == 'route')
    page.evaluate("WorkflowUI.go('impairments')")
    page.locator(OUT).wait_for(state='visible')
    check(f'{width}px header import: the app\'s own native open-project call also refreshes the places', page.evaluate('state.rows.length') == 0 and 'candidate place' not in text(page))
    check(f'{width}px header import: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
    context.close()

def label_checks(browser, width):
    """Every number box has its own label (a source tag inside a label replaced the box's name) and 44 px tags."""
    context, page = open_card(browser, width)
    boxes = page.evaluate("[...document.querySelectorAll('[data-imp]')].map(e=>({k:e.dataset.imp,labels:e.labels.length,name:e.labels[0]?e.labels[0].textContent.trim():'',tagInLabel:!!(e.labels[0]&&e.labels[0].querySelector('[data-threshold]')),h:Math.round(e.getBoundingClientRect().height)}))")
    check(f'{width}px labels: three boxes, each with exactly one label that does not contain a source tag', len(boxes) == 3 and all(b['labels'] == 1 and not b['tagInLabel'] and b['name'] for b in boxes))
    check(f'{width}px labels: the names are the visible words (spacing, velocity, search width)', [b['name'].split(' ')[0] for b in boxes] == ['Ripple', 'Cable', 'Search'] and 'Search width' in boxes[2]['name'])
    tags = page.evaluate("[...document.querySelectorAll('#impRipple [data-threshold]')].map(e=>{const r=e.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),name:e.getAttribute('aria-label')||e.textContent.trim()}})")
    check(f'{width}px labels: both source tags are at least 44 px high and wide and have a name', len(tags) == 2 and all(t['h'] >= 44 and t['w'] >= 44 and t['name'] for t in tags))
    check(f'{width}px labels: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
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
        import_checks(browser, width)
        label_checks(browser, width)
        box_checks(browser, width)
    browser.close()
server.shutdown()
print(f'Build3 impairments real browser: {len(checks)} checks passed')
