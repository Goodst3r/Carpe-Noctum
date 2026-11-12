#!/usr/bin/env python3
"""Reviewer probe of PR #23 (Station native-input retention): behaviour only, real keyboard, copies the built page."""
import sys, os, json, threading, functools, http.server, shutil, tempfile
from playwright.sync_api import sync_playwright
page_path = sys.argv[1]
tmp = tempfile.mkdtemp(prefix='a1nprobe-')
shutil.copy(page_path, os.path.join(tmp, 'index.html'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=tmp))
threading.Thread(target=srv.serve_forever, daemon=True).start()
NUM = '#station-forward-measuredLow'; DATE = '#station-balanced-date'
res = []; errors = []
def ck(name, ok, extra=''):
    res.append((name, bool(ok), extra)); print(('PASS ' if ok else 'FAIL ') + name + (' :: ' + str(extra) if extra and not ok else ''), flush=True)
def open_station(b, w):
    ctx = b.new_context(viewport={'width': w, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html')
    pg.wait_for_function('typeof WorkflowUI!=="undefined" && typeof StationView!=="undefined"')
    pg.evaluate("loadState(TrainingJob.makePractice('complete'));WorkflowUI.go('station')")
    pg.select_option('[data-station-target]', 'r1'); pg.wait_for_selector(NUM)
    return ctx, pg
sn = lambda pg: pg.evaluate("StationView.currentStage().forward.measuredLow")
sd = lambda pg: pg.evaluate("StationView.currentRecord().balanced.date")
fb = lambda pg, sel: pg.evaluate("""(s)=>{const e=document.querySelector(s);const f=document.getElementById(e.id+'-feedback');const r=f?f.getBoundingClientRect():null;const b=e.getBoundingClientRect();return {inv:e.getAttribute('aria-invalid'),txt:f?f.textContent:'',hidden:f?f.hidden:null,role:f&&f.getAttribute('role'),live:f&&f.getAttribute('aria-live'),gap:r?Math.round(r.top-b.bottom):null,inview:r?(r.top>=0&&r.bottom<=innerHeight):null,errmsg:e.getAttribute('aria-errormessage'),border:getComputedStyle(e).borderTopStyle+' '+getComputedStyle(e).borderTopWidth,fs:getComputedStyle(e).fontSize}}""", sel)
def leave(pg, sel):
    for _ in range(8):
        if not pg.evaluate("(s)=>document.activeElement&&document.activeElement.matches(s)", sel): return
        pg.keyboard.press('Tab')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM'), headless=True, args=['--no-sandbox'])
    for w in (320, 360, 390):
        ctx, pg = open_station(b, w); box = pg.locator(NUM)
        box.click(); pg.keyboard.type('12.5'); pg.keyboard.press('Tab'); pg.wait_for_timeout(120)
        ck(f'{w} num typed saved', sn(pg) == '12.5')
        box.click(); pg.keyboard.press('Control+A'); pg.keyboard.type('-'); pg.wait_for_timeout(120)
        ck(f'{w} num lone minus is badInput', box.evaluate('e=>e.value===""&&e.validity.badInput===true'))
        ck(f'{w} num saved not erased while typing', sn(pg) == '12.5', sn(pg))
        f = fb(pg, NUM); print('   typing feedback:', json.dumps(f))
        ck(f'{w} num invalid marked + message visible under box', f['inv'] == 'true' and f['txt'] and f['hidden'] is False and 0 <= f['gap'] <= 40 and f['inview'], f)
        ck(f'{w} num message names the field and says not saved', 'not saved' in f['txt'].lower() and ('Measured' in f['txt'] or 'measured' in f['txt'] or 'low' in f['txt'].lower()), f['txt'])
        pg.keyboard.press('Tab'); pg.wait_for_timeout(150)
        f2 = fb(pg, NUM); print('   after-leave feedback:', json.dumps(f2), 'boxvalue=', box.input_value())
        ck(f'{w} num leaving keeps saved reading', sn(pg) == '12.5')
        ck(f'{w} num after leaving the box shows the recorded value', box.input_value() == '12.5', box.input_value())
        ck(f'{w} num after leaving a visible message remains and is nonempty', f2['txt'] and f2['hidden'] is False and f2['inview'], f2)
        ck(f'{w} num message after leaving is announced (role/aria-live) ', f2['role'] in ('status','alert') or f2['live'], f2)
        box.click(); pg.keyboard.press('Control+A'); pg.keyboard.type('-3'); pg.wait_for_timeout(120)
        f3 = fb(pg, NUM)
        ck(f'{w} num finishing saves -3 and clears marking', sn(pg) == '-3' and f3['inv'] in ('false', None) and not f3['txt'], f3)
        box.click(); pg.keyboard.press('Control+A'); pg.keyboard.press('Backspace'); pg.keyboard.press('Tab'); pg.wait_for_timeout(150)
        f4 = fb(pg, NUM)
        ck(f'{w} num deliberate clear saves blank, no error', sn(pg) == '' and f4['inv'] in ('false', None) and 'Error' not in f4['txt'], f4)
        box.click(); pg.keyboard.type('-'); pg.keyboard.press('Tab'); pg.wait_for_timeout(150)
        f5 = fb(pg, NUM)
        ck(f'{w} num lone minus into blank leaves blank and says so', sn(pg) == '' and f5['txt'] != '' and box.input_value() == '', f5)
        ck(f'{w} num no sideways scroll / page errors', pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors, errors)
        ctx.close()
        # dates
        ctx, pg = open_station(b, w); box = pg.locator(DATE)
        box.click(); pg.keyboard.type('11112026'); pg.wait_for_timeout(150)
        ck(f'{w} date typed saved', sd(pg) == '2026-11-11', sd(pg))
        bb = box.bounding_box(); pg.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2); pg.keyboard.press('Backspace'); pg.wait_for_timeout(150)
        ck(f'{w} date month cleared is badInput', box.evaluate('e=>e.value===""&&e.validity.badInput===true'))
        ck(f'{w} date saved not erased while editing', sd(pg) == '2026-11-11', sd(pg))
        f = fb(pg, DATE); print('   date typing feedback:', json.dumps(f))
        ck(f'{w} date invalid marked + visible message', f['inv'] == 'true' and f['txt'] and 0 <= f['gap'] <= 40 and f['inview'], f)
        leave(pg, DATE); pg.wait_for_timeout(250)
        f2 = fb(pg, DATE); print('   date after leave:', json.dumps(f2), 'value=', box.input_value())
        ck(f'{w} date leaving keeps saved date', sd(pg) == '2026-11-11', sd(pg))
        ck(f'{w} date after leaving shows recorded date + message', box.input_value() == '2026-11-11' and f2['txt'], (box.input_value(), f2))
        bb = box.bounding_box(); pg.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2); pg.keyboard.type('10'); pg.wait_for_timeout(200)
        ck(f'{w} date finishing saves 2026-10-11', sd(pg) == '2026-10-11', sd(pg))
        pg.mouse.click(bb['x'] + 14, bb['y'] + bb['height'] / 2)
        for _ in range(3):
            pg.keyboard.press('Backspace'); pg.keyboard.press('Tab')
        leave(pg, DATE); pg.wait_for_timeout(250)
        f6 = fb(pg, DATE)
        ck(f'{w} date clearing every part saves blank', sd(pg) == '' and f6['inv'] in ('false', None) and 'Error' not in f6['txt'], (sd(pg), f6))
        ck(f'{w} date no sideways scroll / page errors', pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors, errors)
        ctx.close()
    # imported raw invalid survives mere focus/blur
    ctx, pg = open_station(b, 360)
    pg.locator(NUM).click(); pg.keyboard.type('5'); pg.keyboard.press('Tab'); pg.wait_for_timeout(100)
    pg.locator(DATE).click(); pg.keyboard.type('11112026'); pg.keyboard.press('Tab'); pg.wait_for_timeout(150)
    pg.evaluate("""(()=>{const r=StationView.currentRecord();r.stages.before.forward.measuredLow='abc';r.balanced.date='2026-13-45';})()""")
    pg.evaluate("WorkflowUI.go('route');WorkflowUI.go('station')"); pg.wait_for_timeout(200)
    pg.locator(NUM).click(); pg.keyboard.press('Tab'); pg.locator(DATE).click(); pg.keyboard.press('Tab'); pg.wait_for_timeout(200)
    ck('imported raw invalid number survives focus/blur', sn(pg) == 'abc', sn(pg)); ck('imported raw invalid date survives focus/blur', sd(pg) == '2026-13-45', sd(pg))
    ctx.close()
    # stale focusout must not write into other stage
    ctx, pg = open_station(b, 360); box = pg.locator(NUM)
    box.click(); pg.keyboard.type('7'); pg.keyboard.press('Tab'); pg.wait_for_timeout(120)
    box.click(); pg.keyboard.press('Control+A'); pg.keyboard.type('-'); pg.wait_for_timeout(100)
    pg.select_option('[data-station-scope="record"][data-station-field="stage"]', 'after'); pg.wait_for_timeout(200)
    after = pg.evaluate("StationView.currentRecord().stages.after.forward.measuredLow"); before = pg.evaluate("StationView.currentRecord().stages.before.forward.measuredLow")
    ck('switching stage mid half-edit keeps before=7 and after blank', before == '7' and after == '', (before, after))
    ctx.close(); b.close()
srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
bad = [r for r in res if not r[1]]
print(f'{len(res)-len(bad)}/{len(res)} passed; pageerrors={errors}')
sys.exit(1 if bad else 0)
