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
import hashlib, json, os, subprocess, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
html = (subprocess.run(['node', '-e', "process.stdout.write(require('./qa/build2-source-harness.cjs').assembleHtml())"], cwd=ROOT, check=True, capture_output=True, text=True).stdout
        if os.environ.get('NIGHTSWEEP_BUILD2_SOURCE_TEST') == '1' else (ROOT / 'outputs/Night_Sweep.html').read_text())
serve = Path(tempfile.mkdtemp(prefix='cn-build3-layout-'))
(serve / 'index.html').write_text(html)
OUT = Path(os.environ.get('NIGHTSWEEP_LAYOUT_RESULTS') or ROOT / 'qa/build3-layout-results.json')

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
  set('[data-calc="ofdm"][data-field="power"]', '42'); set('[data-calc="ofdm"][data-field="occupied"]', '1794'); set('[data-calc="ofdm"][data-field="context"]', 'confirmed', 'change');
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
  set('[data-health="upstream"][data-field="mode"]', '3.1', 'change'); set('[data-health="upstream"][data-field="total"]', '70'); set('[data-health="upstream"][data-field="pmax"]', '68.5'); set('[data-health="upstream"][data-field="basis"]', 'confirmed', 'change');
  document.querySelectorAll('.health-window').forEach(d => { d.open = true; });
  set('[data-health-window="scqam"][data-field="min"]', '-7', 'change'); set('[data-health-window="scqam"][data-field="max"]', '7', 'change');
}'''
FILL_LEAK = '''() => {
  const set = (sel, v, type = 'input') => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event(type, { bubbles: true })); };
  set('[data-leak="limit"][data-field="frequency"]', '121.2625'); set('[data-leak="limit"][data-field="kind"]', 'analog', 'change');
  set('[data-leak="limit"][data-field="field"]', '2500.125'); set('[data-leak="limit"][data-field="distance"]', '33'); set('[data-leak="limit"][data-field="unit"]', 'ft', 'change');
  set('[data-leak="normalize"][data-field="field"]', '4000000'); set('[data-leak="normalize"][data-field="distance"]', '0.5'); set('[data-leak="normalize"][data-field="unit"]', 'm', 'change');
  set('[data-leak="cli"][data-field="leaks"]', '120 85 60 250 50 1000000 49 12'); set('[data-leak="cli"][data-field="theta"]', '0.5');
  set('[data-leak="detector"][data-field="method"]', 'dipole', 'change'); set('[data-leak="detector"][data-field="expected"]', '20'); set('[data-leak="detector"][data-field="read"]', '31.5');
  set('[data-leak="log"][data-field="found"]', '2026-11-10'); set('[data-leak="log"][data-field="location"]', 'Pole 14 at the corner of Elm Street and Third Avenue near the substation');
  set('[data-leak="log"][data-field="cause"]', 'Loose drop connector at the tap port'); set('[data-leak="log"][data-field="field"]', '80'); set('[data-leak="log"][data-field="distance"]', '10'); set('[data-leak="log"][data-field="frequency"]', '121.2625');
  document.getElementById('leakAdd').click();
  // the worst cases for a narrow screen: a place and notes with no break to wrap at, a repaired leak, a leak with no distance, a flagged open leak, a saved check
  set('[data-leak="log"][data-field="found"]', '2026-11-11'); set('[data-leak="log"][data-field="location"]', 'P'.repeat(120)); set('[data-leak="log"][data-field="cause"]', 'C'.repeat(120));
  set('[data-leak="log"][data-field="field"]', '900'); set('[data-leak="log"][data-field="distance"]', ''); set('[data-leak="log"][data-field="frequency"]', ''); set('[data-leak="log"][data-field="notes"]', 'N'.repeat(300));
  document.getElementById('leakAdd').click();
  set('[data-leak="log"][data-field="found"]', '2026-11-09'); set('[data-leak="log"][data-field="location"]', 'Tap 9-' + 'A'.repeat(50)); set('[data-leak="log"][data-field="cause"]', ''); set('[data-leak="log"][data-field="field"]', '200'); set('[data-leak="log"][data-field="distance"]', '3'); set('[data-leak="log"][data-field="frequency"]', '750'); set('[data-leak="log"][data-field="notes"]', '');
  document.getElementById('leakAdd').click();
  document.querySelector('[data-leak-mark]').click();
  document.querySelectorAll('.health-window').forEach(d => { d.open = true; });
  set('[data-leak-company="repair"]', '25', 'change'); set('[data-leak-company="tolerance"]', '1', 'change');
  set('[data-leak="detector"][data-field="date"]', '2026-11-11'); document.getElementById('leakCheckSave').click();
  set('[data-leak="limit"][data-field="frequency"]', '10'); set('[data-leak="limit"][data-field="kind"]', 'digital', 'change'); set('[data-leak="limit"][data-field="field"]', '5'); set('[data-leak="limit"][data-field="distance"]', '3'); set('[data-leak="limit"][data-field="unit"]', 'm', 'change');
}'''
FILL_OUTAGE = '''() => {
  const set = (sel, v, type = 'change') => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event(type, { bubbles: true })); };
  for (const id of ['scope-what', 'power-ac', 'node-lights', 'act-order', 'tell-roc']) { const el = document.querySelector(`[data-check="${id}"]`); el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); }
  set('[data-check-field="where"]', 'W'.repeat(120)); set('[data-check-field="arrived"]', '08:15'); set('[data-check-field="cause"]', 'C'.repeat(120)); set('[data-check-field="tellwho"]', 'T'.repeat(80)); set('[data-check-field="damage"]', 'D'.repeat(120)); set('[data-check-field="damagetime"]', '09:40');
}'''
FILL_OUTAGE_EDIT = '''() => {
  const set = (sel, v, type = 'change') => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event(type, { bubbles: true })); };
  document.getElementById('outage-edit').click();
  set('[data-check-add-group]', 'Power'); set('[data-check-add-text]', 'Q'.repeat(160));
  document.querySelector('[data-check-add]').click();
  set('[data-check-text="scope-what"]', 'Reworded '.repeat(17).trim());
  document.querySelector('[data-check-hide="rec-restored"]').click();
}'''
FILL_IMP = '''() => {
  const pick = id => { const el = document.querySelector(`input[name=impShape][value="${id}"]`); el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); };
  const set = (sel, v) => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
  pick('ripple');
  state.rows[0].name = 'N'.repeat(70);
  set('[data-imp=spacing]', '1'); set('[data-imp=vp]', '0.87');
}'''
FILL_FIBER = '''() => {
  const set = (sel, v) => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
  set('[data-fiber="finder"][data-field="fiber"]', '240');
  const b = (n, v) => set(`[data-fiber="budget"][data-field="${n}"]`, v);
  b('length', '499.999'); b('attenuation', '0.35'); b('connectors', '4'); b('connectorLoss', '0.3'); b('splices', '6'); b('spliceLoss', '0.1'); b('other', '3.5'); b('margin', '3'); b('tx', '3'); b('rx', '-24');
}'''
CHECK_CONTRAST = '''(sel) => {
  const lum = c => { const v = c.match(/[\\d.]+/g).slice(0, 3).map(Number).map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const bg = el => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const m = c.match(/[\\d.]+/g); if (m && (m.length < 4 || Number(m[3]) > 0.99)) return c; } return 'rgb(255,255,255)'; };
  return [...document.querySelectorAll(sel)].filter(e => e.offsetParent).map(e => { const a = lum(getComputedStyle(e).color), b = lum(bg(e)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); });
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
    page.select_option('[data-health="upstream"][data-field="basis"]', 'confirmed')
    page.locator('[data-health="upstream"][data-field="total"]').click(); page.keyboard.type('52')
    check('DOCSIS real keyboard: a blank Pmax on a 3.1 modem uses the 65 dBmV minimum', '+13.0000 dB' in result('upstream'))
    pm = page.locator('[data-health="upstream"][data-field="pmax"]')
    pm.click(); page.keyboard.type('-')
    check('DOCSIS real keyboard: a lone minus sign in Pmax is refused and not read as the default', pm.evaluate('el=>el.validity.badInput===true') and 'as a number' in result('upstream') and 'headroom' not in result('upstream'))
    pm.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace')
    check('DOCSIS real keyboard: emptying Pmax goes back to the default', '+13.0000 dB' in result('upstream'))
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

def ofdm_real_input_checks(browser):
    # Real keyboard and source-built existing converter; no physical-device claim.
    for width in (320, 360, 390, 430):
        context = browser.new_context(viewport={'width': width, 'height': 800}, is_mobile=True, has_touch=True, color_scheme='dark')
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
        page.wait_for_function('typeof FieldCalc!=="undefined" && typeof WorkflowUI!=="undefined"')
        page.evaluate("WorkflowUI.go('calculators')")
        field = lambda name: page.locator(f'[data-calc="ofdm"][data-field="{name}"]')
        text = lambda: page.locator('#calc-ofdm-result').inner_text().replace('\n', ' ')
        first = lambda: page.locator('#calc-ofdm-result .calc-stats strong').first.inner_text().replace('\n', ' ')
        label = f'{width}px OFDM restatement'
        check(label + ' starts with explicit unconfirmed context', field('context').input_value() == '')
        field('power').fill('48'); field('occupied').fill('6.4'); field('basis').select_option('1.6')
        check(label + ' has no numeric result before confirmation', page.locator('#calc-ofdm-result .calc-stats').count() == 0 and 'Confirm flat PSD' in text())
        field('context').select_option('confirmed')
        check(label + ' prints H1 total and delta at six significant figures', first() == '54.0206 dBmV' and '+6.02060 dB' in text())
        field('basis').select_option('6.4'); field('power').fill('54'); field('occupied').fill('1.6')
        check(label + ' exposes reverse6.4 basis and prints H2 at six significant figures', first() == '47.9794 dBmV' and '-6.02060 dB' in text())
        check(label + ' keeps instantaneous total and headroom unavailable', 'does not determine instantaneous OFDMA total power' in text() and 'headroom: Unknown' in text())
        for name in ('power', 'occupied'):
            box = field(name)
            for unfinished in ('-', '1e'):
                box.click(); page.keyboard.press('Control+A'); page.keyboard.type(unfinished)
                check(label + f' refuses real {unfinished} badInput in {name}', box.evaluate('el=>el.validity.badInput') and page.locator('#calc-ofdm-result .calc-stats').count() == 0 and 'half-typed' in text())
            box.fill('54' if name == 'power' else '1.6')
        field('context').select_option('')
        check(label + ' clearing context removes stale numeric output', page.locator('#calc-ofdm-result .calc-stats').count() == 0)
        field('context').select_option('confirmed')
        check(label + ' fits its card and controls without horizontal overflow', page.evaluate("""(()=>{const c=document.querySelector('[data-calc-card="ofdm"]');return document.documentElement.scrollWidth<=innerWidth+1&&[c,...c.querySelectorAll('input,select,.calc-result')].every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&e.scrollWidth<=e.clientWidth+1})})()"""))
        context.close()

def leakage_real_input_checks(browser):
    """A lone minus sign in a company-setting box must not clear what is saved, and a blank date must not become today.
    Typing into a real number box is the only way to reach the empty-but-invalid state."""
    port = server.server_port
    context = browser.new_context(viewport={'width': 390, 'height': 900})
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{port}/index.html')
    page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof Leakage!=="undefined"')
    page.evaluate("WorkflowUI.go('leakage')")
    stored = lambda: page.evaluate("JSON.parse(localStorage.getItem('nightsweep-leakage-v1')||'null')")
    text = lambda id: page.evaluate("id=>document.getElementById(id).textContent.replace(/\\s+/g,' ')", id)
    page.evaluate("document.getElementById('leakCompany').open=true")
    repair = page.locator('[data-leak-company="repair"]')
    tol = page.locator('[data-leak-company="tolerance"]')
    repair.click(); page.keyboard.type('25'); page.keyboard.press('Tab')
    tol.click(); page.keyboard.type('1'); page.keyboard.press('Tab')
    check('Leakage real keyboard: typed company settings are saved', stored()['company'] == {'repair': 25, 'tolerance': 1})
    repair.click(); page.keyboard.press('Control+A'); page.keyboard.type('-')
    check('Leakage real keyboard: a lone minus sign leaves the box empty and marked badInput', repair.evaluate('el=>el.value===""&&el.validity.badInput===true'))
    page.keyboard.press('Tab')
    check('Leakage real keyboard: that entry is refused and says what is still in use', 'Not saved.' in text('leak-company-note') and 'Still using repair threshold 25 µV/m and tolerance 1 dB' in text('leak-company-note'))
    check('Leakage real keyboard: the saved settings are not cleared and the box shows the value in use', stored()['company'] == {'repair': 25, 'tolerance': 1} and repair.evaluate('el=>el.value==="25"&&el.validity.badInput===false'))
    tol.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace'); page.keyboard.press('Tab')
    check('Leakage real keyboard: emptying a box on purpose still clears that one setting', stored()['company'] == {'repair': 25, 'tolerance': None})
    # dates
    today = page.evaluate("(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()")
    check('Leakage dates: the check date starts as today', page.locator('[data-leak="detector"][data-field="date"]').input_value() == today)
    page.select_option('[data-leak="detector"][data-field="method"]', 'direct')
    page.locator('[data-leak="detector"][data-field="expected"]').click(); page.keyboard.type('20')
    page.locator('[data-leak="detector"][data-field="read"]').click(); page.keyboard.type('22')
    date = page.locator('[data-leak="detector"][data-field="date"]')
    date.click(); page.keyboard.press('Backspace'); page.keyboard.press('Tab'); page.keyboard.press('Backspace')
    page.locator('[data-leak="detector"][data-field="date"]').fill('')
    page.locator('#leakCheckSave').click()
    check('Leakage dates: a blank check date is refused with a reason and no check is saved', 'Enter the date of the detector check' in text('leak-detector-result') and page.evaluate('Leakage.snapshot().checks.length') == 0)
    page.locator('[data-leak="log"][data-field="found"]').fill('2026-11-05')
    page.locator('[data-leak="log"][data-field="location"]').fill('Pole 14 at Elm and 3rd')
    page.locator('#leakAdd').click()
    leak = page.evaluate("Leakage.snapshot().leaks[0].id")
    page.locator(f'[data-leak-repair="{leak}"]').fill('')
    page.locator(f'[data-leak-mark="{leak}"]').click()
    check('Leakage dates: Mark repaired with a cleared date is refused and the leak stays open', 'Enter the repair date' in text('leak-log-note') and stored()['leaks'][0]['repaired'] == '')
    page.locator(f'[data-leak-repair="{leak}"]').fill('2026-11-09')
    page.locator(f'[data-leak-mark="{leak}"]').click()
    check('Leakage dates: the date that was chosen is the date kept', stored()['leaks'][0]['repaired'] == '2026-11-09')
    context.close()

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
        for theme in ['night', 'sun']:
            for width in [320, 360, 390, 430, 768, 1280]:
                mobile = width < 600
                context = browser.new_context(viewport={'width': width, 'height': 800}, is_mobile=mobile, has_touch=mobile)
                context.add_init_script(f"try{{localStorage.setItem('nightsweep-theme-v1','{theme}')}}catch(e){{}}")
                page = context.new_page()
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
                page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof FieldCalcs!=="undefined" && typeof Thresholds!=="undefined"')
                label = f'{theme} {width}px'
                check(f'{label} palette applied', page.evaluate("document.documentElement.dataset.theme||'night'") == theme)
                if theme == 'night' and width <= 430:
                    page.evaluate("WorkflowUI.go('projects')")
                    tabs = page.evaluate("[...document.querySelectorAll('#taskTabs button[data-task]')].map(b=>({task:b.dataset.task,label:b.textContent.trim(),controls:(b.getAttribute('aria-controls')||'').split(/\\s+/).filter(Boolean)}))")
                    check(f'{label} Job has eight named tabs with existing panels and no empty Safety tab', len(tabs) == 8 and all(t['label'] and t['task'] != 'safety' and t['controls'] for t in tabs) and page.evaluate("typeof Safety==='undefined'&&!document.getElementById('safetyPanel')&&!document.querySelector('[data-task=\"safety\"],[data-go=\"safety\"],[href=\"#safetyPanel\"]')"))
                    for tab in tabs:
                        page.locator(f'#taskTabs [data-task="{tab["task"]}"]').click()
                        check(f'{label} Job → {tab["label"]} opens its existing content', page.evaluate("([task,ids])=>WorkflowUI.current()===task&&ids.every(id=>document.getElementById(id))&&ids.some(id=>{const e=document.getElementById(id);return !e.hidden&&getComputedStyle(e).display!=='none'&&e.textContent.trim().length>0})", [tab['task'], tab['controls']]))
                    check(f'{label} no rendered link points to Job → Safety', page.evaluate("!Array.from(document.querySelectorAll('button,a')).some(e=>/Job\\s*→\\s*Safety|^Safety$/.test(e.textContent.trim()))"))
                page.evaluate("WorkflowUI.go('calculators')")
                page.evaluate(FILL)
                check(f'{label} calculators fit without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                cards = page.evaluate("[...document.querySelectorAll('#calculatorPanel .calc-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} every calculator card stays inside the viewport', len(cards) == 8 and all(l >= -1 and r <= width + 1 for l, r in cards))
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
                check(f'{label} DOCSIS health company-window headings are 44 px tap targets', page.evaluate("[...document.querySelectorAll('#docsisHealthPanel .health-window>summary')].every(s=>s.getBoundingClientRect().height>=44)"))
                check(f'{label} DOCSIS health states each result in words, not color alone', page.evaluate("[...document.querySelectorAll('.health-status')].length>=4&&[...document.querySelectorAll('.health-status')].every(s=>/^(✓|⚠|•)/.test(s.textContent.trim()))"))
                check(f'{label} DOCSIS health shows the derived OFDM range with its long text inside the card', page.evaluate("(()=>{const r=document.getElementById('health-ofdm-result');return /Derived range, over 96 MHz/.test(r.textContent)&&r.scrollWidth<=r.clientWidth+1})()"))
                page.evaluate("document.querySelector('[data-health=\"ofdm\"][data-field=\"basis\"]').value='6';document.querySelector('[data-health=\"ofdm\"][data-field=\"basis\"]').dispatchEvent(new Event('change',{bubbles:true}))")
                check(f'{label} the occupied-bandwidth field is really hidden unless another bandwidth is chosen', page.evaluate("getComputedStyle(document.querySelector('[data-health-other]')).display==='none'"))
                page.evaluate("WorkflowUI.go('leakage')")
                page.evaluate(FILL_LEAK)
                check(f'{label} Leakage fits without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                cards = page.evaluate("[...document.querySelectorAll('.leak-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} every Leakage card stays inside the viewport', len(cards) == 5 and all(l >= -1 and r <= width + 1 for l, r in cards))
                check(f'{label} Leakage results and log entries wrap inside their cards', page.evaluate("[...document.querySelectorAll('.leak-card .health-row strong, .leak-card .health-status, .leak-item strong, .leak-item .note')].filter(e=>e.offsetParent).every(s=>s.scrollWidth<=s.clientWidth+1)"))
                check(f'{label} the FCC limits table scrolls inside its own region, not the page', page.evaluate("(()=>{const r=document.querySelector('.leak-card .table-scroll'),tb=r&&r.querySelector('table');return !!r&&r.getAttribute('tabindex')==='0'&&getComputedStyle(r).overflowX==='auto'&&r.getBoundingClientRect().right<=innerWidth+1&&tb.scrollWidth>=440&&(r.scrollWidth<=r.clientWidth+1||r.scrollWidth>r.clientWidth)&&document.documentElement.scrollWidth<=innerWidth+1})()"))
                check(f'{label} a long place, cause and notes with no break wrap inside the log entry instead of widening the card', page.evaluate("(()=>{const items=[...document.querySelectorAll('.leak-item')];const wide=items.filter(i=>/P{100}/.test(i.textContent));return wide.length===1&&items.every(i=>{const r=i.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&[...i.querySelectorAll('strong,.note,.health-status')].every(s=>s.scrollWidth<=s.clientWidth+1)})})()"))
                check(f'{label} the log shows a repaired leak, a flagged open leak, a leak with no distance and a saved check in words', page.evaluate("(()=>{const t=document.getElementById('leakagePanel').textContent;return /Reopen/.test(t)&&/still open/.test(t)&&/No distance was entered/.test(t)&&/you had set then/.test(t)&&document.querySelectorAll('[data-leak-reopen]').length===1&&/near field reaches about 4\\.8 m/.test(document.getElementById('leak-limit-result').textContent)})()"))
                sizes = page.evaluate("[...document.querySelectorAll('#leakagePanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} Leakage source tags are at least 24 px tap targets', len(sizes) >= 10 and all(w >= 24 and h >= 24 for w, h in sizes))
                ratios = page.evaluate(CONTRAST)
                check(f'{label} Leakage tag text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                inputs = page.evaluate("[...document.querySelectorAll('#leakagePanel input,#leakagePanel select')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Leakage inputs keep field-sized controls', inputs and min(inputs) >= 40)
                buttons = page.evaluate("[...document.querySelectorAll('#leakagePanel button:not(.source-tag)')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Leakage buttons are large controls', buttons and min(buttons) >= 40)
                check(f'{label} Leakage marks an open leak and states results in words, not color alone', page.evaluate("document.querySelector('.leak-item.open')!==null&&[...document.querySelectorAll('#leakagePanel .health-status')].every(s=>/^(✓|⚠|•)/.test(s.textContent.trim()))"))
                page.evaluate("WorkflowUI.go('outage')")
                page.evaluate(FILL_OUTAGE)
                check(f'{label} Outage tick boxes are at least 24 px and each row is a 44 px target', page.evaluate("(()=>{const rows=[...document.querySelectorAll('#outagePanel .check-item')].filter(e=>e.offsetParent);return rows.length>=20&&rows.every(r=>r.getBoundingClientRect().height>=44&&r.querySelector('input').getBoundingClientRect().width>=24&&r.querySelector('input').getBoundingClientRect().height>=24)})()"))
                page.evaluate(FILL_OUTAGE_EDIT)
                check(f'{label} Outage fits without sideways scrolling, with long notes and a long added item', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                boxes = page.evaluate("[...document.querySelectorAll('#outagePanel .check-section, #outagePanel .check-notes, #outagePanel .check-add')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} every Outage section stays inside the viewport', len(boxes) >= 8 and all(l >= -1 and r <= width + 1 for l, r in boxes))
                check(f'{label} Outage wording and labels wrap inside their rows (a long value in a text box scrolls inside the box, not the page)', page.evaluate("[...document.querySelectorAll('#outagePanel .check-item span, #outagePanel .check-policy, #outagePanel .check-progress, #outagePanel .note, #outagePanel legend, #outagePanel label')].every(s=>s.scrollWidth<=s.clientWidth+1)"))
                inputs = page.evaluate("[...document.querySelectorAll('#outagePanel input:not([type=checkbox]),#outagePanel select')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Outage inputs keep field-sized controls', len(inputs) >= 5 and min(inputs) >= 40)
                buttons = page.evaluate("[...document.querySelectorAll('#outagePanel button')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Outage buttons are large controls', len(buttons) >= 5 and min(buttons) >= 40)
                ratios = page.evaluate(CHECK_CONTRAST, '#outagePanel .check-policy, #outagePanel .check-item span, #outagePanel legend, #outagePanel .note, #outagePanel button')
                check(f'{label} Outage text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                check(f'{label} Outage opens with the company-policy line before any checklist item', page.evaluate("(()=>{const p=document.querySelector('#outagePanel .check-policy'),s=document.querySelector('#outagePanel .check-section');return /^Follow your company’s outage procedure/.test(p.textContent)&&!!(p.compareDocumentPosition(s)&4)})()"))
                check(f'{label} Outage shows the count in words', page.evaluate("/^\\d+ of \\d+ ticked$/.test(document.querySelector('#outagePanel .check-progress').textContent.trim())"))
                page.evaluate("WorkflowUI.go('impairments')")
                page.evaluate(FILL_IMP)
                check(f'{label} Impairments fits without sideways scrolling, with a 70-character unbroken point name in the candidate table', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                boxes = page.evaluate("[...document.querySelectorAll('#impairmentsPanel .imp-picker, #impairmentsPanel .imp-card, #impairmentsPanel .imp-tool')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} the Impairments picker, card and tool stay inside the viewport', len(boxes) >= 3 and all(l >= -1 and r <= width + 1 for l, r in boxes))
                check(f'{label} Impairments text wraps inside its box and the candidate table scrolls inside its own region', page.evaluate("(()=>{const region=document.querySelector('#impairmentsPanel .table-scroll');return !!region&&getComputedStyle(region).overflowX==='auto'&&[...document.querySelectorAll('#impairmentsPanel .imp-shape span, #impairmentsPanel .imp-card li, #impairmentsPanel .imp-card p')].every(s=>s.scrollWidth<=s.clientWidth+1)})()"))
                check(f'{label} each Impairments picture is a 44 px row with a tick target of at least 24 px', page.evaluate("(()=>{const rows=[...document.querySelectorAll('#impairmentsPanel .imp-shape')];return rows.length===10&&rows.every(r=>r.getBoundingClientRect().height>=44&&r.querySelector('input').getBoundingClientRect().width>=24)})()"))
                inputs = page.evaluate("[...document.querySelectorAll('#impairmentsPanel input[type=number]')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Impairments inputs keep field-sized controls', len(inputs) == 3 and min(inputs) >= 40)
                sizes = page.evaluate("[...document.querySelectorAll('#impairmentsPanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} Impairments source tags are at least 24 px tap targets', len(sizes) >= 2 and all(w >= 24 and h >= 24 for w, h in sizes))
                ratios = page.evaluate(CHECK_CONTRAST, '#impairmentsPanel .imp-shape span, #impairmentsPanel .imp-card p, #impairmentsPanel .imp-card li, #impairmentsPanel legend, #impairmentsPanel .note, #impairmentsPanel .health-status')
                check(f'{label} Impairments text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                check(f'{label} Impairments shows the distance and the candidate places in words', page.evaluate("(()=>{const t=document.getElementById('impRippleResult').textContent;return /Distance between the two mismatches\\s*427\\.\\d ft/.test(t)&&/2 candidate places on the saved route/.test(t)})()"))
                page.evaluate("WorkflowUI.go('fiber')")
                page.evaluate(FILL_FIBER)
                check(f'{label} Fiber fits without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                boxes = page.evaluate("[...document.querySelectorAll('#fiberPanel .calc-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} both Fiber cards stay inside the viewport', len(boxes) == 2 and all(l >= -1 and r <= width + 1 for l, r in boxes))
                check(f'{label} Fiber results and tables wrap or scroll inside their cards', page.evaluate("(()=>{const regions=[...document.querySelectorAll('#fiberPanel .table-scroll')];return regions.length===2&&regions.every(r=>getComputedStyle(r).overflowX==='auto')&&[...document.querySelectorAll('#fiberPanel .health-row strong, #fiberPanel .health-status, #fiberPanel .note')].every(s=>s.scrollWidth<=s.clientWidth+1)})()"))
                inputs = page.evaluate("[...document.querySelectorAll('#fiberPanel input')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Fiber inputs keep field-sized controls', len(inputs) == 13 and min(inputs) >= 40)
                buttons = page.evaluate("[...document.querySelectorAll('#fiberPanel button:not(.source-tag)')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Fiber buttons are 44 px controls', len(buttons) == 2 and min(buttons) >= 44)
                sizes = page.evaluate("[...document.querySelectorAll('#fiberPanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} Fiber source tags are at least 24 px tap targets', len(sizes) >= 6 and all(w >= 24 and h >= 24 for w, h in sizes))
                ratios = page.evaluate(CHECK_CONTRAST, '#fiberPanel .note, #fiberPanel .health-row, #fiberPanel .health-status, #fiberPanel th, #fiberPanel td, #fiberPanel label')
                check(f'{label} Fiber text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                check(f'{label} Fiber states each result in words, and a color name sits beside every swatch', page.evaluate("(()=>{const t=document.getElementById('fiber-budget-result').textContent;const rows=[...document.querySelectorAll('#fiberPanel .fiber-swatch')];return /Estimated link loss/.test(t)&&/optics budget is left|Short by/.test(t)&&rows.length>=14&&rows.every(s=>s.parentElement.textContent.trim().length>=3)})()"))
                page.evaluate("WorkflowUI.go('highSplit')")
                check(f'{label} High split fits without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                boxes = page.evaluate("[...document.querySelectorAll('#highSplitPanel .calc-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} the three High split cards stay inside the viewport', len(boxes) == 3 and all(l >= -1 and r <= width + 1 for l, r in boxes))
                check(f'{label} High split tables scroll inside their own region and every region can take focus', page.evaluate("(()=>{const regions=[...document.querySelectorAll('#highSplitPanel .table-scroll')];return regions.length===3&&regions.every(r=>getComputedStyle(r).overflowX!=='visible'&&r.tabIndex===0&&r.getAttribute('role')==='region'&&r.getAttribute('aria-label'))})()"))
                check(f'{label} High split long source lines and statements wrap inside their cards', page.evaluate("[...document.querySelectorAll('#highSplitPanel .hs-source, #highSplitPanel li, #highSplitPanel p')].every(e=>e.scrollWidth<=e.clientWidth+1)"))
                sizes = page.evaluate("[...document.querySelectorAll('#highSplitPanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} High split source tags are at least 24 px tap targets', len(sizes) >= 8 and all(w >= 24 and h >= 24 for w, h in sizes))
                ratios = page.evaluate(CHECK_CONTRAST, '#highSplitPanel .note, #highSplitPanel .hs-source, #highSplitPanel li, #highSplitPanel th, #highSplitPanel td, #highSplitPanel .status')
                check(f'{label} High split text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                check(f'{label} High split states the Vecima gap in words in a visible warning, and every R-PHY step names its source', page.evaluate("(()=>{const w=document.querySelector('#highSplitPanel .status.warning');const steps=[...document.querySelectorAll('#highSplitPanel .hs-steps li')];return !!w&&/Customer Portal/.test(w.textContent)&&steps.length===8&&steps.every(s=>s.querySelector('.hs-source')&&/I\\d\\d/.test(s.querySelector('.hs-source').textContent))})()"))
                page.evaluate("WorkflowUI.go('why')")
                page.evaluate("document.querySelectorAll('#whyPanel details.why-card').forEach(d=>{d.open=true})")
                check(f'{label} Why cards fit without sideways scrolling with every card open', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                boxes = page.evaluate("[...document.querySelectorAll('#whyPanel .why-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} all fourteen Why cards stay inside the viewport', len(boxes) == 14 and all(l >= -1 and r <= width + 1 for l, r in boxes))
                check(f'{label} Why card text, citations and sources wrap inside their cards', page.evaluate("[...document.querySelectorAll('#whyPanel .why-body p, #whyPanel .why-cite, #whyPanel summary')].every(e=>e.scrollWidth<=e.clientWidth+1)"))
                heights = page.evaluate("[...document.querySelectorAll('#whyPanel summary, #whyPanel .why-go')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Why card headings and link buttons are 44 px controls', len(heights) == 14 + page.evaluate('WhyCards.TOPICS.reduce((a,t)=>a+t.tools.length,0)') and min(heights) >= 44)
                sizes = page.evaluate("[...document.querySelectorAll('#whyPanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} Why card source tags are at least 44 px tap targets', len(sizes) >= 8 and all(w >= 44 and h >= 44 for w, h in sizes))
                ratios = page.evaluate(CHECK_CONTRAST, '#whyPanel .note, #whyPanel .why-cite, #whyPanel p, #whyPanel summary')
                check(f'{label} Why card text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                check(f'{label} each Why card names its SCTE 293 monograph and year', page.evaluate("(()=>{const s=[...document.querySelectorAll('#whyPanel summary')];return s.length===14&&s.every((x,i)=>x.textContent.includes('SCTE 293-'+(i+1)+' 20'))})()"))
                page.evaluate("WorkflowUI.go('pop')")
                check(f'{label} Proof of performance fits without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                boxes = page.evaluate("[...document.querySelectorAll('#popPanel .calc-card')].map(c=>{const r=c.getBoundingClientRect();return [r.left,r.right]})")
                check(f'{label} the four Proof of performance cards stay inside the viewport', len(boxes) == 4 and all(l >= -1 and r <= width + 1 for l, r in boxes))
                check(f'{label} Proof of performance tables scroll inside their own focusable region', page.evaluate("(()=>{const regions=[...document.querySelectorAll('#popPanel .table-scroll')];return regions.length===4&&regions.every(r=>getComputedStyle(r).overflowX!=='visible'&&r.tabIndex===0&&r.getAttribute('role')==='region'&&r.getAttribute('aria-label'))})()"))
                check(f'{label} Proof of performance statements wrap inside their cells', page.evaluate("[...document.querySelectorAll('#popPanel td, #popPanel th, #popPanel p')].every(e=>e.scrollWidth<=e.clientWidth+1||e.closest('.table-scroll'))"))
                sizes = page.evaluate("[...document.querySelectorAll('#popPanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} Proof of performance source tags are at least 44 px tap targets', len(sizes) >= 14 and all(w >= 44 and h >= 44 for w, h in sizes))
                check(f'{label} Proof of performance rule text keeps a readable width, no table scrolls sideways and none grows past 2,800 px', page.evaluate("(()=>{const w=innerWidth,cells=[...document.querySelectorAll('#popPanel tbody tr td:nth-child(2)')],regs=[...document.querySelectorAll('#popPanel .table-scroll')];return cells.length>=14&&Math.min(...cells.map(c=>c.getBoundingClientRect().width))>=(w<=700?Math.min(200,w-80):300)&&regs.every(r=>r.scrollWidth<=r.clientWidth+1)&&Math.max(...regs.map(r=>r.scrollHeight))<=2800})()"))
                check(f'{label} Proof of performance row names wrap instead of taking the table', page.evaluate("[...document.querySelectorAll('#popPanel tbody th')].every(h=>getComputedStyle(h).whiteSpace!=='nowrap')"))
                ratios = page.evaluate(CHECK_CONTRAST, '#popPanel .note, #popPanel td, #popPanel th, #popPanel p')
                check(f'{label} Proof of performance text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                check(f'{label} every Proof of performance row names its rule section', page.evaluate("(()=>{const rows=[...document.querySelectorAll('#popPanel tbody tr')];return rows.length>=14&&rows.every(r=>/47 CFR 76\\.\\d+/.test(r.children[2].textContent))})()"))
                page.evaluate("WorkflowUI.go('study')")
                page.select_option('#studyDomain', 'signals')
                check(f'{label} Study fits without sideways scrolling with a number question open', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                page.fill('#studyNumber', '-12.5'); page.click('#studyCheck')
                check(f'{label} Study shows a wrong answer, the right one and its working inside the card', page.evaluate("(()=>{const f=document.getElementById('studyFeedback');const c=document.querySelector('#studyPanel .study-card').getBoundingClientRect();return /Not quite/.test(f.textContent)&&/Working/.test(f.textContent)&&f.scrollWidth<=f.clientWidth+1&&c.left>=-1&&c.right<=innerWidth+1})()"))
                page.select_option('#studyDomain', 'architectures')
                radios = page.evaluate("[...document.querySelectorAll('#studyPanel .study-choice')].map(l=>{const r=l.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} Study answer choices are 44 px rows with a radio button each', len(radios) == 2 and all(h >= 44 for w, h in radios) and page.evaluate("[...document.querySelectorAll('#studyPanel input[name=studyAnswer]')].every(i=>i.labels.length===1&&i.getBoundingClientRect().width>=24)"))
                heights = page.evaluate("[...document.querySelectorAll('#studyPanel button, #studyPanel select, #studyPanel input[type=number]')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Study buttons and fields are 40 px or taller', len(heights) >= 4 and min(heights) >= 40)
                ratios = page.evaluate(CHECK_CONTRAST, '#studyPanel .note, #studyPanel .study-prompt, #studyPanel label, #studyPanel .study-feedback p')
                check(f'{label} Study text contrast is at least 4.5:1', ratios and min(ratios) >= 4.5)
                page.fill('#studyPanel #studyNumber', '') if page.locator('#studyNumber').count() else None
                check(f'{label} Study says in words that nothing is saved and a score is not a test result', page.evaluate("/Nothing is saved/.test(document.getElementById('studyScore').textContent)&&/not an exam/.test(document.getElementById('studyPanel').textContent)"))
                page.evaluate("WorkflowUI.go('powerPm')")
                page.select_option('#powerPmCable', 'p3_625')
                page.fill('#powerPmLength', '1000')
                page.fill('#powerPmCurrent', '5')
                page.fill('#powerPmSupply', '90')
                page.fill('#powerPmTemp', '68')
                page.fill('#powerPmAlpha', '0.004')
                page.select_option('#powerPmActive', 'gm-le-12-thermal')
                check(f'{label} Supply PM fits without sideways scrolling', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                check(f'{label} Supply PM states the worked span drop and the published minimum in words', page.evaluate("(()=>{const t=document.getElementById('powerPmResult').textContent;const c=document.querySelector('#powerPmPanel .calc-card').getBoundingClientRect();return /5\\.5 V/.test(t)&&/84\\.5 V/.test(t)&&/35 V/.test(t)&&/at or above/.test(t)&&/not a company limit/.test(t)&&c.left>=-1&&c.right<=innerWidth+1&&document.getElementById('powerPmResult').scrollWidth<=document.getElementById('powerPmResult').clientWidth+1})()"))
                heights = page.evaluate("[...document.querySelectorAll('#powerPmPanel button, #powerPmPanel select, #powerPmPanel input')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height)")
                check(f'{label} Supply PM controls are at least 44 px', len(heights) >= 8 and all(h >= 44 for h in heights))
                sizes = page.evaluate("[...document.querySelectorAll('#powerPmPanel .source-tag')].filter(t=>t.offsetParent).map(t=>{const r=t.getBoundingClientRect();return [r.width,r.height]})")
                check(f'{label} Supply PM source tag is at least 24 px', len(sizes) == 1 and all(w >= 24 and h >= 24 for w, h in sizes))
                page.click('#powerPmAddSpan')
                check(f'{label} Supply PM keeps the added span inside a focusable region', page.evaluate("(()=>{const r=document.querySelector('#powerPmPanel .table-scroll');return /5\\.5 V drop/.test(document.getElementById('powerPmChain').textContent)&&r.tabIndex===0&&r.getAttribute('role')==='region'&&r.scrollWidth<=r.clientWidth+1})()"))
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
                check(f'{label} print report leaves out calculators and the registry', page.evaluate("['calculatorPanel','limitsPanel','docsisHealthPanel','leakagePanel','outagePanel','impairmentsPanel','fiberPanel','highSplitPanel','whyPanel','popPanel','studyPanel','powerPmPanel'].every(id=>getComputedStyle(document.getElementById(id)).display==='none')"))
                page.emulate_media(media='screen')
                context.close()
        docsis_real_input_checks(browser)
        ofdm_real_input_checks(browser)
        leakage_real_input_checks(browser)
        check('No uncaught application errors', not errors)
        browser.close()
    OUT.write_text(json.dumps({'checks': len(checks), 'passed': True, 'cases': checks, 'standalone_sha256': hashlib.sha256(html.encode()).hexdigest(),
                               'scope': 'Desktop Chromium with phone-sized viewports and touch emulation, both palettes. Not a physical Android/iPhone, Safari or WebView test.'}, indent=2) + '\n')
    print(f'Build3 layout: {len(checks)} checks passed')
finally:
    server.shutdown()
    server.server_close()
