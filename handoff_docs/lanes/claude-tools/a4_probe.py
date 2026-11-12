#!/usr/bin/env python3
"""Reviewer probe of PR #14 (A4 sweep grading) at an exact head: phone widths, real keyboard and clicks, my own inputs.
Usage: a4_probe.py <path to outputs/Night_Sweep.html>. Copies the page; touches no tracked file."""
import sys, os, threading, functools, http.server, shutil, tempfile, json
from playwright.sync_api import sync_playwright

tmp = tempfile.mkdtemp(prefix='a4probe-')
shutil.copy(sys.argv[1], os.path.join(tmp, 'index.html'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=tmp))
threading.Thread(target=srv.serve_forever, daemon=True).start()
res, errors = [], []
def ck(name, ok, extra=''):
    res.append((name, bool(ok)))
    print(('PASS ' if ok else 'FAIL ') + name + ((' :: ' + str(extra)) if (extra and not ok) else ''), flush=True)

def setup(browser, width, csv):
    ctx = browser.new_context(viewport={'width': width, 'height': 850}, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html')
    pg.wait_for_function('typeof WorkflowUI!=="undefined"&&typeof SweepGradingUI!=="undefined"')
    pg.evaluate("WorkflowUI.go('evidence');document.getElementById('sweepGradingPanel').open=true")
    pg.select_option('#gradingPlant', '42'); pg.select_option('#gradingDirection', 'forward')
    pg.locator('#evidenceFiles').set_input_files({'name': 'SYNTHETIC.csv', 'mimeType': 'text/csv', 'buffer': csv})
    pg.wait_for_function('!EvidenceUI.isBusy()&&state.evidence?.length===1')
    pg.select_option('#gradingEvidence', pg.evaluate('state.evidence[0].id'))
    return ctx, pg

def fill(pg, vals):
    for k, v in vals.items():
        pg.locator('#grading-' + k).fill(v)

CSV = b'frequency_mhz,level_dbmv\n54,0.1\n100,0.2\n860,0.3'
OK = {'lowFrequencyMHz': '54', 'highFrequencyMHz': '860', 'ptvLimitDb': '3', 'lowTargetDbmv': '0.1', 'highTargetDbmv': '0.3', 'maxLevelErrorDb': '0.5', 'tiltTargetDb': '0.2', 'maxTiltErrorDb': '0.5'}

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ['NIGHTSWEEP_CHROMIUM'], headless=True, args=['--no-sandbox'])
    for w in (320, 360, 390, 430):
        ctx, pg = setup(b, w, CSV); fill(pg, OK)
        # labels: each criterion input has exactly one label with no source tag inside it
        lab = pg.evaluate("[...document.querySelectorAll('[data-grading-field]')].map(e=>({n:e.labels.length,tag:!!(e.labels[0]&&e.labels[0].querySelector('[data-threshold]')),name:e.labels[0]?e.labels[0].textContent.trim():''}))")
        ck(f'{w} eight inputs, each with exactly one label that holds no source tag', len(lab) == 8 and all(x['n'] == 1 and not x['tag'] and x['name'] for x in lab), lab)
        tags = pg.evaluate("[...document.querySelectorAll('#sweepGradingPanel [data-grading-tag] .source-tag')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]})")
        ck(f'{w} eight source tags are at least 44 px both ways', len(tags) == 8 and all(a >= 44 and c >= 44 for a, c in tags), tags)
        # unfinished number in the tilt target: lone minus
        t = pg.locator('#grading-tiltTargetDb'); t.click(); pg.keyboard.press('Control+A'); pg.keyboard.type('-'); pg.wait_for_timeout(120)
        ck(f'{w} lone minus is badInput and the box is marked', t.evaluate('e=>e.value===""&&e.validity.badInput===true') and t.get_attribute('aria-invalid') == 'true')
        note = pg.locator('#grading-error-tiltTargetDb')
        t.evaluate('e=>e.closest(".grading-field").scrollIntoView({block:"center"})'); pg.wait_for_timeout(80)
        nb, tb = note.bounding_box(), t.bounding_box()
        ck(f'{w} named message directly under the box and inside the screen', note.is_visible() and 'Signed tilt target' in note.inner_text() and 0 <= nb['y'] - (tb['y'] + tb['height']) <= 40 and nb['y'] + nb['height'] <= 850, note.inner_text())
        for attempt in (1, 2):
            pg.locator('#gradingRun').click(); pg.wait_for_timeout(300)
            ck(f'{w} Grade tap {attempt}: refused, text kept, error kept, nothing saved',
               pg.evaluate('(state.sweepGrading?.records.length||0)===0') and t.evaluate('e=>e.validity.badInput===true') and t.get_attribute('aria-invalid') == 'true' and note.is_visible() and 'Correct the criterion errors' in pg.locator('#gradingStatus').inner_text())
        t.fill('0.2'); pg.wait_for_timeout(100)
        # failing autosave beside the field
        pg.evaluate("()=>{window.__si=Storage.prototype.setItem;Storage.prototype.setItem=function(k,...a){if(k==='hfc-route-v1')throw new DOMException('x','QuotaExceededError');return window.__si.call(this,k,...a)}}")
        m = pg.locator('#grading-maxTiltErrorDb'); m.fill('0.6'); m.evaluate('e=>e.closest(".grading-field").scrollIntoView({block:"center"})'); pg.wait_for_timeout(100)
        mn = pg.locator('#grading-error-maxTiltErrorDb')
        mb, mnb = m.bounding_box(), mn.bounding_box()
        ck(f'{w} failed autosave: value kept in memory, message under the field, in view, and in the status', pg.evaluate('state.sweepGrading.profiles["42-forward"].maxTiltErrorDb===0.6') and mn.is_visible() and 'Not saved' in mn.inner_text() and 'autosave failed' in pg.locator('#gradingStatus').inner_text() and 0 <= mnb['y'] - (mb['y'] + mb['height']) <= 40 and mnb['y'] + mnb['height'] <= 850, mn.inner_text())
        pg.evaluate("()=>{Storage.prototype.setItem=window.__si}")
        m.fill('0.5'); pg.wait_for_timeout(100)
        ck(f'{w} after storage works again the warning clears', not mn.is_visible())
        # float formatting: low .1, high .3 -> tilt 0.19999999999999998 ; target .2 -> error ~ -2.8e-17
        pg.locator('#gradingRun').click(); pg.wait_for_function('state.sweepGrading.records.length===1', timeout=15000)
        panel = pg.locator('#sweepGradingPanel').inner_text()
        import re
        longnums = re.findall(r'-?\d+\.\d{9,}|\d\.\d+e-\d+', panel)
        ck(f'{w} no raw float noise on the screen (no numbers with 9+ decimals or exponents)', not longnums, longnums[:5])
        ck(f'{w} measured tilt is shown as 0.2 and the tilt error as 0 or ≈0', 'measured tilt: 0.2 dB' in panel and re.search(r'Tilt error: pass\s*\n?\s*(≈0|0) dB', panel) is not None, re.findall(r'measured tilt[^\n]*', panel))
        ck(f'{w} the stored number stays exact (record keeps the raw float)', pg.evaluate('(()=>{const r=state.sweepGrading.records[0].result.metrics;return Math.abs(r.measuredTiltDb-0.2)<1e-12&&r.measuredTiltDb!==0.2})()'))
        ck(f'{w} no sideways scroll, no page errors', pg.evaluate(f'document.documentElement.scrollWidth<={w}+1') and not errors, errors)
        ctx.close()
    b.close()
srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
bad = [r for r in res if not r[1]]
print(f'{len(res)-len(bad)}/{len(res)} passed; pageerrors={errors}')
sys.exit(1 if bad else 0)
