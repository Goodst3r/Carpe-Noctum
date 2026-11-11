#!/usr/bin/env python3
"""Diagnostic for a failed rendered layout check on a hosted runner. It prints, never asserts.

The CI workflow runs this only after a gate step fails. For each viewport width it opens the built standalone page on the
Calculators screen (filled the way qa/build3-layout.test.py fills it), reports the browser version, the width the page was
laid out in, any scrollbar, the elements that reach past the right edge and the fonts the browser actually used, and saves
a screenshot under qa/ci-diagnostics/ for the run record. It changes no tracked file."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, re, shutil, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'qa' / 'ci-diagnostics'
OUT.mkdir(exist_ok=True)
serve = Path(tempfile.mkdtemp(prefix='cn-ci-diagnose-'))
shutil.copy(ROOT / 'outputs' / 'Night_Sweep.html', serve / 'index.html')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()

fill = ''
try:
    source = (ROOT / 'qa' / 'build3-layout.test.py').read_text()
    match = re.search(r"FILL = '''(.*?)'''", source, re.S)
    fill = match.group(1) if match else ''
except OSError:
    pass

REPORT = '''() => {
  const edge = innerWidth + 1;
  const wide = [...document.querySelectorAll('body *')].filter(e => e.offsetParent && e.getBoundingClientRect().right > edge)
    .map(e => { const r = e.getBoundingClientRect(); return { el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().replace(/\\s+/g, '.') : ''), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), text: (e.textContent || '').trim().slice(0, 40) }; })
    .sort((a, b) => b.right - a.right).slice(0, 12);
  return { innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, bodyFont: getComputedStyle(document.body).fontFamily, wide };
}'''

def platform_fonts(page, selector):
    try:
        cdp = page.context.new_cdp_session(page)
        cdp.send('DOM.enable'); cdp.send('CSS.enable')
        root = cdp.send('DOM.getDocument')['root']['nodeId']
        node = cdp.send('DOM.querySelector', {'nodeId': root, 'selector': selector})['nodeId']
        fonts = cdp.send('CSS.getPlatformFontsForNode', {'nodeId': node})['fonts']
        return [f"{f['familyName']} x{f['glyphCount']}" for f in fonts]
    except Exception as error:
        return [f'unavailable: {error}']

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
    print('Chromium', browser.version)
    for width in [768, 1280, 390, 360, 320]:
        mobile = width < 600
        context = browser.new_context(viewport={'width': width, 'height': 800}, is_mobile=mobile, has_touch=mobile)
        page = context.new_page()
        page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
        page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof FieldCalcs!=="undefined"')
        page.evaluate("WorkflowUI.go('calculators')")
        if fill:
            page.evaluate(fill)
        report = page.evaluate(REPORT)
        print(f'--- {width}px: layout width {report["clientWidth"]}, scrollWidth {report["scrollWidth"]}, innerWidth {report["innerWidth"]}, body scrollWidth {report["bodyScrollWidth"]}')
        print('    body font-family:', report['bodyFont'])
        print('    fonts used by <body>:', ', '.join(platform_fonts(page, 'body')))
        print('    fonts used by the first calculator card:', ', '.join(platform_fonts(page, '#calculatorPanel .calc-card')))
        for item in report['wide']:
            print(f"    reaches past the edge: {item['el']} left {item['left']} right {item['right']} width {item['width']} '{item['text']}'")
        page.screenshot(path=str(OUT / f'calculators-{width}.png'), full_page=True)
        context.close()
    browser.close()
server.shutdown()
