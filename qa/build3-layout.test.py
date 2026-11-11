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
FILL_DOCSIS = '''() => {
  const set = (sel, v, type = 'input') => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event(type, { bubbles: true })); };
  set('[data-health="scqam"][data-field="level"]', '-15.5');
  set('[data-health="ofdm"][data-field="basis"]', 'other', 'change'); set('[data-health="ofdm"][data-field="occupied"]', '96'); set('[data-health="ofdm"][data-field="power"]', '-9.5');
  set('[data-health="total"][data-field="modem"]', '3.0', 'change'); set('[data-health="total"][data-field="total"]', '41.25');
  set('[data-health="upstream"][data-field="mode"]', '3.1', 'change'); set('[data-health="upstream"][data-field="total"]', '70'); set('[data-health="upstream"][data-field="pmax"]', '68.5');
  document.querySelectorAll('.health-window').forEach(d => { d.open = true; });
  set('[data-health-window="scqam"][data-field="min"]', '-7', 'change'); set('[data-health-window="scqam"][data-field="max"]', '7', 'change');
}'''
def docsis_real_input_checks(browser):
    """A lone minus sign in a number box reads as empty but is not blank, and the job's plant keeps its own company windows.
    These need a real browser: assigning .value cannot make a number box invalid the way typing does."""
    port = server.server_port
    context = browser.new_context(viewport={'width': 390, 'height': 900})
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{port}/index.html')
    page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof DocsisHealth!=="undefined"')
    page.evaluate("(()=>{const d=SweepSetup.draft();d.selected='42';state.sweepSetup=d;})()")
    page.evaluate("WorkflowUI.go('docsisHealth')")
    note = lambda id: page.evaluate(f"document.getElementById('health-{id}-window-note').textContent")
    stored = lambda: page.evaluate("JSON.parse(localStorage.getItem('nightsweep-docsis-windows-v1')||'null')")
    result = lambda id: page.evaluate("id=>document.getElementById('health-'+id+'-result').textContent.replace(/\\s+/g,' ')", id)
    page.locator('[data-health-window-box="scqam"] summary').click()
    hi = page.locator('[data-health-window="scqam"][data-field="max"]')
    hi.click(); page.keyboard.type('7'); page.keyboard.press('Tab')
    check('DOCSIS real keyboard: a typed highest level is saved for the 42/54 plant', stored()['plants']['42']['scqam']['max'] == 7 and 'Saved on this device' in note('scqam'))
    hi.click(); page.keyboard.press('Control+A'); page.keyboard.type('-')
    check('DOCSIS real keyboard: a lone minus sign leaves the box empty and marked badInput', hi.evaluate('el=>el.value===""&&el.validity.badInput===true'))
    page.keyboard.press('Tab')
    check('DOCSIS real keyboard: that entry is refused and says the saved window is still in use', 'Not saved.' in note('scqam') and 'Still using at most +7 dBmV' in note('scqam'))
    check('DOCSIS real keyboard: the saved window is not cleared by the lone minus sign', stored()['plants']['42']['scqam']['max'] == 7)
    check('DOCSIS real keyboard: the refused box shows the window still in use, not an empty-looking box', hi.evaluate('el=>el.value==="7"&&el.validity.badInput===false'))
    hi.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace'); page.keyboard.press('Tab')
    check('DOCSIS real keyboard: emptying the box on purpose still clears the window', stored()['plants']['42']['scqam']['max'] is None and 'Saved on this device' in note('scqam'))
    hi.click(); page.keyboard.type('7'); page.keyboard.press('Tab')
    page.select_option('[data-health="upstream"][data-field="mode"]', '3.1')
    page.locator('[data-health="upstream"][data-field="total"]').click(); page.keyboard.type('52')
    check('DOCSIS real keyboard: a blank Pmax on a 3.1 modem uses the 65 dBmV minimum', '13.0 dB of headroom' in result('upstream'))
    pm = page.locator('[data-health="upstream"][data-field="pmax"]')
    pm.click(); page.keyboard.type('-')
    check('DOCSIS real keyboard: a lone minus sign in Pmax is refused and not read as the default', pm.evaluate('el=>el.validity.badInput===true') and 'as a number' in result('upstream') and 'headroom' not in result('upstream'))
    pm.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace')
    check('DOCSIS real keyboard: emptying Pmax goes back to the default', '13.0 dB of headroom' in result('upstream'))
    page.locator('[data-health="scqam"][data-field="level"]').click(); page.keyboard.type('9')
    check("DOCSIS real keyboard: a reading is compared with the window of the job's plant", '2.0 dB above your window' in result('scqam'))
    page.evaluate("WorkflowUI.go('sweepSetup')")
    page.locator('[data-sweep-split="204"]').click()
    page.evaluate("WorkflowUI.go('docsisHealth')")
    check('DOCSIS plants: after choosing 204/258 the company window box is empty and the plant is named', page.evaluate("document.querySelector('[data-health-window=\"scqam\"][data-field=\"max\"]').value===''&&/204\\/258 MHz plant/.test(document.querySelector('[data-health-plant]').textContent)"))
    check('DOCSIS plants: the 42/54 window is not applied to the 204/258 plant', 'above your window' not in result('scqam') and 'Unknown — not entered for the 204/258 MHz plant' in result('scqam'))
    if not page.locator('[data-health-window="scqam"][data-field="max"]').is_visible():
        page.locator('[data-health-window-box="scqam"] summary').click()
    page.locator('[data-health-window="scqam"][data-field="max"]').click(); page.keyboard.type('12'); page.keyboard.press('Tab')
    check('DOCSIS plants: the 204/258 window is kept apart from the 42/54 one', stored()['plants']['204']['scqam']['max'] == 12 and stored()['plants']['42']['scqam']['max'] == 7)
    page.reload(); page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof DocsisHealth!=="undefined"')
    check('DOCSIS plants: both windows are read back after a reload, each for its own plant', page.evaluate("DocsisHealth.getWindow('scqam','42').max===7&&DocsisHealth.getWindow('scqam','204').max===12"))
    context.close()

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
                cards = page.evaluate("[...document.querySelectorAll('#calculatorPanel .calc-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} every calculator card stays inside the viewport', len(cards) == 6 and all(l >= -1 and r <= width + 1 for l, r in cards))
                check(f'{label} long results wrap inside their cards', page.evaluate("[...document.querySelectorAll('.calc-stats strong')].every(s=>s.scrollWidth<=s.clientWidth+1)"))
                sizes = page.evaluate("[...document.querySelectorAll('#calculatorPanel .source-tag')].map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} calculator source tags are at least 24 px tap targets', sizes and all(w >= 24 and h >= 24 for w, h in sizes))
                ratios = page.evaluate(CONTRAST)
                check(f'{label} calculator tag text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                inputs = page.evaluate("[...document.querySelectorAll('#calculatorPanel input,#calculatorPanel select')].map(e=>e.getBoundingClientRect().height)")
                check(f'{label} calculator inputs keep field-sized controls', min(inputs) >= 40)
                page.evaluate("WorkflowUI.go('docsisHealth')")
                page.evaluate(FILL_DOCSIS)
                check(f'{label} DOCSIS health fits without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                cards = page.evaluate("[...document.querySelectorAll('.health-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} every DOCSIS health card stays inside the viewport', len(cards) == 4 and all(l >= -1 and r <= width + 1 for l, r in cards))
                check(f'{label} DOCSIS health results wrap inside their cards', page.evaluate("[...document.querySelectorAll('.health-row strong, .health-status')].every(s=>s.scrollWidth<=s.clientWidth+1)"))
                sizes = page.evaluate("[...document.querySelectorAll('#docsisHealthPanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} DOCSIS health source tags are at least 24 px tap targets', len(sizes) >= 8 and all(w >= 24 and h >= 24 for w, h in sizes))
                ratios = page.evaluate(CONTRAST)
                check(f'{label} DOCSIS health tag text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                inputs = page.evaluate("[...document.querySelectorAll('#docsisHealthPanel input,#docsisHealthPanel select')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} DOCSIS health inputs keep field-sized controls', inputs and min(inputs) >= 40)
                check(f'{label} DOCSIS health company-window headings are 44 px tap targets', page.evaluate("[...document.querySelectorAll('.health-window>summary')].every(s=>s.getBoundingClientRect().height>=44)"))
                check(f'{label} DOCSIS health states each result in words, not color alone', page.evaluate("[...document.querySelectorAll('.health-status')].length>=4&&[...document.querySelectorAll('.health-status')].every(s=>/^(✓|⚠|•)/.test(s.textContent.trim()))"))
                check(f'{label} DOCSIS health shows the derived OFDM range with its long text inside the card', page.evaluate("(()=>{const r=document.getElementById('health-ofdm-result');return /Derived range, over 96 MHz/.test(r.textContent)&&r.scrollWidth<=r.clientWidth+1})()"))
                page.evaluate("document.querySelector('[data-health=\"ofdm\"][data-field=\"basis\"]').value='6';document.querySelector('[data-health=\"ofdm\"][data-field=\"basis\"]').dispatchEvent(new Event('change',{bubbles:true}))")
                check(f'{label} the occupied-bandwidth field is really hidden unless another bandwidth is chosen', page.evaluate("getComputedStyle(document.querySelector('[data-health-other]')).display==='none'"))
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
                check(f'{label} print report leaves out calculators and the registry', page.evaluate("['calculatorPanel','limitsPanel','docsisHealthPanel'].every(id=>getComputedStyle(document.getElementById(id)).display==='none')"))
                page.emulate_media(media='screen')
                context.close()
        docsis_real_input_checks(browser)
        check('No uncaught application errors', not errors)
        browser.close()
    OUT.write_text(json.dumps({'checks': len(checks), 'passed': True, 'cases': checks, 'standalone_sha256': hashlib.sha256(html.encode()).hexdigest(),
                               'scope': 'Desktop Chromium with phone-sized viewports and touch emulation, both palettes. Not a physical Android/iPhone, Safari or WebView test.'}, indent=2) + '\n')
    print(f'Build3 layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
