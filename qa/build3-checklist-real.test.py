#!/usr/bin/env python3
"""Real-browser regressions for the shared checklist engine through the Outage first-response card.

These need a real browser because they depend on things assigning .value cannot make happen: how a native time box
reports a half-edited value (value is empty but validity.badInput is true), and what the browser does when its real
localStorage quota runs out. Desktop Chromium with phone-sized viewports and touch emulation; not a physical phone.
Synthetic text only."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import json, os, shutil, sys, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
serve = Path(tempfile.mkdtemp(prefix='cn-checklist-real-'))
shutil.copy(ROOT / 'outputs' / 'Night_Sweep.html', serve / 'index.html')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []
KEY = 'nightsweep-outage-v1'
TIME = '[data-check-field="arrived"]'

def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

def open_outage(browser, width=390, init=None):
    context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
    if init:
        context.add_init_script(init)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
    page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof Outage!=="undefined"')
    page.evaluate("WorkflowUI.go('outage')")
    return context, page

def saved_field(page, name):
    return page.evaluate("([key,name])=>{const raw=localStorage.getItem(key);if(raw===null)return null;try{return JSON.parse(raw).fields[name]}catch(e){return 'UNREADABLE'}}", [KEY, name])

def leave_box(page):
    """Tab until focus is no longer in the time box (it has three parts, so a few presses)."""
    for _ in range(8):
        if not page.evaluate("document.activeElement&&document.activeElement.matches('%s')" % TIME):
            return
        page.keyboard.press('Tab')

def time_checks(browser):
    for width in (360, 390):
        context, page = open_outage(browser, width)
        box = page.locator(TIME)
        box.click(); page.keyboard.type('0230PM'); page.wait_for_timeout(150)
        check(f'{width}px real keyboard: a typed time is saved, and the box keeps focus (it is not redrawn)', saved_field(page, 'arrived') == '14:30' and page.evaluate("document.activeElement.matches('%s')" % TIME))
        # Half-edit it: clear only the hour, then leave the box.
        bb = box.bounding_box()
        page.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2); page.keyboard.press('Backspace'); leave_box(page); page.wait_for_timeout(200)
        check(f'{width}px real keyboard: the half-edited box reports a bad value, not an empty one', box.evaluate('e=>e.value===""&&e.validity.badInput===true'))
        check(f'{width}px real keyboard: a half-edited time does not erase the saved time', saved_field(page, 'arrived') == '14:30')
        problem = page.locator('.check-field-error')
        check(f'{width}px real keyboard: the box is marked invalid and the reason is announced', box.get_attribute('aria-invalid') == 'true' and problem.count() == 1 and problem.get_attribute('role') == 'alert')
        check(f'{width}px real keyboard: the reason says Not saved and names the time still saved', problem.inner_text().startswith('Not saved') and '14:30' in problem.inner_text())
        pb, bb = problem.bounding_box(), box.bounding_box()
        check(f'{width}px real keyboard: the reason sits right under the box and inside the screen', 0 <= pb['y'] - (bb['y'] + bb['height']) <= 60 and pb['y'] + pb['height'] <= 844 and pb['x'] >= 0 and pb['x'] + pb['width'] <= width + 1)
        # Finish the edit: typing the hour again makes a complete time, which saves and clears the marking.
        page.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2); page.keyboard.type('03'); page.wait_for_timeout(200)
        check(f'{width}px real keyboard: finishing the edit saves the new time and clears the marking', saved_field(page, 'arrived') == '15:30' and page.locator('.check-field-error').count() == 0 and box.get_attribute('aria-invalid') is None)
        # Clear every part on purpose: that is a blank, and it is saved as blank.
        page.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2)
        for _ in range(3):
            page.keyboard.press('Backspace'); page.keyboard.press('Tab')
        leave_box(page); page.wait_for_timeout(250)
        check(f'{width}px real keyboard: clearing every part on purpose saves a blank and shows no error', saved_field(page, 'arrived') == '' and box.evaluate('e=>e.validity.badInput===false&&e.value===""') and page.locator('.check-field-error').count() == 0 and box.get_attribute('aria-invalid') is None)
        # Leave the box with only the hour filled and nothing saved yet: it is refused on leaving, not silently blank.
        page.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2); page.keyboard.type('07'); leave_box(page); page.wait_for_timeout(250)
        check(f'{width}px real keyboard: an hour alone is refused when the box is left, with the reason shown and nothing saved', saved_field(page, 'arrived') == '' and box.get_attribute('aria-invalid') == 'true' and 'No time is saved yet' in page.locator('.check-field-error').inner_text())
        check(f'{width}px real keyboard: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
        context.close()

def guard_tag_checks(browser):
    """The three software caps are tagged beside the controls they bound; the tags are real 44 px targets that fit the screen."""
    for width in (320, 360, 390):
        context, page = open_outage(browser, width)
        page.locator('#outage-edit').click(); page.wait_for_timeout(100)
        tags = page.locator('#outagePanel h3 [data-threshold^="checklist."]')
        check(f'{width}px guard tags: the three caps are tagged beside Notes for this job and Add an item', tags.count() == 3)
        boxes = [tags.nth(i).bounding_box() for i in range(3)]
        check(f'{width}px guard tags: each tag is a 44 px target inside the screen', all(b['width'] >= 44 and b['height'] >= 44 and b['x'] >= 0 and b['x'] + b['width'] <= width + 1 for b in boxes))
        check(f'{width}px guard tags: none sits inside a label, and nothing scrolls sideways', page.evaluate("document.querySelectorAll('#outagePanel label [data-threshold]').length===0&&document.documentElement.scrollWidth<=innerWidth+1"))
        tags.nth(0).click(); page.wait_for_timeout(150)
        check(f'{width}px guard tags: a tap opens the Unknown source sheet for the cap', page.evaluate("(()=>{const d=document.querySelector('dialog[open]');return !!d&&/Unknown/.test(d.textContent)&&/application guard/i.test(d.textContent)})()"))
        context.close()

def quota_checks(browser):
    big = 3145729
    seed = f"if(localStorage.getItem('{KEY}')===null&&!sessionStorage.getItem('seeded')){{sessionStorage.setItem('seeded','1');localStorage.setItem('{KEY}','{{'+'x'.repeat({big}));}}"
    context, page = open_outage(browser, 390, seed)
    # The test only means something if this browser really has room for the original but not for a copy of it.
    room = page.evaluate("(n)=>{try{localStorage.setItem('probe-copy','y'.repeat(n));localStorage.removeItem('probe-copy');return true}catch(e){return false}}", big)
    check('quota: the real browser stores the unreadable original but has no room for a copy of it', not room and page.evaluate("(k)=>localStorage.getItem(k).length", KEY) == big + 1)
    page.locator('[data-check-field="tellwho"]').fill('dispatch'); page.keyboard.press('Tab'); page.wait_for_timeout(250)
    check('quota: the unreadable original is still there, whole', page.evaluate("(k)=>{const v=localStorage.getItem(k);return v&&v.length===arguments[0]}".replace('arguments[0]', str(big + 1)), KEY))
    check('quota: no copy was claimed or written', page.evaluate("(k)=>localStorage.getItem(k+'-unreadable')", KEY) is None)
    note = page.locator('#outage-note')
    check('quota: the screen says Not saved, plainly, and the typed note stays', note.inner_text().startswith('Not saved') and 'left exactly as it was' in note.inner_text() and page.locator('[data-check-field="tellwho"]').input_value() == 'dispatch')
    check('quota: the warning is an alert and nothing else was lost on the page', page.locator('#outagePanel [role="alert"]').count() >= 1 and not errors)
    # Free some space (a smaller unreadable value), then make another change: the copy now fits, the original is kept, and the held note is written too.
    page.evaluate("(k)=>localStorage.setItem(k,'{small broken')", KEY)
    page.locator('[data-check="scope-what"]').check(); page.wait_for_timeout(250)
    after = page.evaluate("(k)=>({side:localStorage.getItem(k+'-unreadable'),main:JSON.parse(localStorage.getItem(k))})", KEY)
    check('quota: once the copy fits it is made exactly, and the held note and the new tick are both written', after['side'] == '{small broken' and after['main']['fields'].get('tellwho') == 'dispatch' and 'scope-what' in after['main']['checked'])
    context.close()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
    which = sys.argv[1:] or ['time', 'quota', 'guards']   # a name on the command line runs just that part, for a mutation check
    if 'time' in which:
        time_checks(browser)
    if 'quota' in which:
        quota_checks(browser)
    if 'guards' in which:
        guard_tag_checks(browser)
    browser.close()
server.shutdown()
print(f'Build3 checklist real browser: {len(checks)} checks passed')
