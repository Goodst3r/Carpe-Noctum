#!/usr/bin/env python3
"""Rendered Chromium checks for the build 3 Calculators and Limits screens.

Desktop Chromium with phone-sized viewports and touch emulation. This is not a
physical Android/iPhone, Safari or WebView result. Release mode reads the frozen
standalone unchanged.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import hashlib, json, os, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / 'outputs/Night_Sweep.html').read_text()
serve = Path(tempfile.mkdtemp(prefix='cn-build3-layout-'))
(serve / 'index.html').write_text(html)
OUT = ROOT / 'qa/build3-layout-results.json'

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []

def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

CONTRAST = '''() => {
  const lum = c => { const v = c.match(/[\\d.]+/g).slice(0, 3).map(Number).map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  return [...document.querySelectorAll('.source-tag')].filter(t => t.offsetParent).map(t => { const s = getComputedStyle(t), a = lum(s.color), b = lum(s.backgroundColor); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); });
}'''
FILL = '''() => {
  const set = (sel, v, type = 'input') => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event(type, { bubbles: true })); };
  set('[data-calc="db"][data-field="value"]', '-12.5');
  set('[data-calc="ripple"][data-field="spacing"]', '0.4'); set('[data-calc="ripple"][data-field="vp"]', '0.87');
  set('[data-calc="preeq"][data-field="tap"]', '24'); set('[data-calc-vp-source="preeq"]', 'mc2_1000', 'change');
  set('[data-calc="ofdm"][data-field="power"]', '42'); set('[data-calc="ofdm"][data-field="occupied"]', '1794');
  set('[data-calc="echo"][data-field="length"]', '99999'); set('[data-calc="echo"][data-field="vp"]', '0.5');
  set('[data-calc="balance"][data-field="model"]', 'active_gm_hgd', 'change');
  for (const [k, v] of Object.entries({ lowMHz: '54', highMHz: '860', measuredLow: '30', measuredHigh: '40', targetLow: '39', targetHigh: '49' })) set(`[data-calc="balance"][data-field="${k}"]`, v);
  set('[data-calc="balance"][data-field="pad"]', '0', 'change'); set('[data-calc="balance"][data-field="eq"]', '30', 'change');
}'''
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
        for theme in ['night', 'sun']:
            for width in [320, 360, 390, 768, 1280]:
                mobile = width < 600
                context = browser.new_context(viewport={'width': width, 'height': 800}, is_mobile=mobile, has_touch=mobile)
                context.add_init_script(f"try{{localStorage.setItem('nightsweep-theme-v1','{theme}')}}catch(e){{}}")
                page = context.new_page()
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
                page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof FieldCalcs!=="undefined" && typeof Thresholds!=="undefined"')
                label = f'{theme} {width}px'
                check(f'{label} palette applied', page.evaluate("document.documentElement.dataset.theme||'night'") == theme)
                page.evaluate("WorkflowUI.go('calculators')")
                page.evaluate(FILL)
                check(f'{label} calculators fit without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                cards = page.evaluate("[...document.querySelectorAll('.calc-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} every calculator card stays inside the viewport', len(cards) == 6 and all(l >= -1 and r <= width + 1 for l, r in cards))
                check(f'{label} long results wrap inside their cards', page.evaluate("[...document.querySelectorAll('.calc-stats strong')].every(s=>s.scrollWidth<=s.clientWidth+1)"))
                sizes = page.evaluate("[...document.querySelectorAll('#calculatorPanel .source-tag')].map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} calculator source tags are at least 24 px tap targets', sizes and all(w >= 24 and h >= 24 for w, h in sizes))
                ratios = page.evaluate(CONTRAST)
                check(f'{label} calculator tag text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                inputs = page.evaluate("[...document.querySelectorAll('#calculatorPanel input,#calculatorPanel select')].map(e=>e.getBoundingClientRect().height)")
                check(f'{label} calculator inputs keep field-sized controls', min(inputs) >= 40)
                page.evaluate("WorkflowUI.go('limits')")
                check(f'{label} limits list fits without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                ratios = page.evaluate(CONTRAST)
                check(f'{label} limits tag text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                page.locator('#limitsList [data-threshold="calc.preeq.tapDistance"]').click()
                page.wait_for_selector('dialog.source-sheet[open]')
                box = page.locator('dialog.source-sheet').bounding_box()
                check(f'{label} source sheet fits the viewport', box['x'] >= 0 and box['x'] + box['width'] <= width + 1 and box['height'] <= 800 * 0.86 + 2)
                check(f'{label} source sheet is a modal dialog with its title focused', page.evaluate("document.querySelector('dialog.source-sheet').matches(':modal')&&document.activeElement.id==='sourceSheetTitle'"))
                pad = page.evaluate("(()=>{const r=document.querySelector('dialog.source-sheet').getBoundingClientRect();return [r.left+4,r.top+4]})()")
                page.mouse.click(pad[0], pad[1])
                check(f'{label} a tap on the sheet padding keeps it open', page.locator('dialog.source-sheet[open]').count() == 1)
                page.keyboard.press('Escape')
                page.wait_for_function("!document.querySelector('dialog.source-sheet')")
                check(f'{label} Escape closes the sheet and returns focus to its tag', page.evaluate("document.activeElement?.dataset.threshold==='calc.preeq.tapDistance'"))
                page.emulate_media(media='print')
                check(f'{label} print report leaves out calculators and the registry', page.evaluate("['calculatorPanel','limitsPanel'].every(id=>getComputedStyle(document.getElementById(id)).display==='none')"))
                page.emulate_media(media='screen')
                context.close()
        check('No uncaught application errors', not errors)
        browser.close()
    OUT.write_text(json.dumps({'checks': len(checks), 'passed': True, 'cases': checks, 'standalone_sha256': hashlib.sha256(html.encode()).hexdigest(),
                               'scope': 'Desktop Chromium with phone-sized viewports and touch emulation, both palettes. Not a physical Android/iPhone, Safari or WebView test.'}, indent=2) + '\n')
    print(f'Build3 layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
