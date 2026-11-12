#!/usr/bin/env python3
"""Context strip at phone width in the night palette. Not a physical-device test."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, shutil, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
serve = Path(tempfile.mkdtemp(prefix='cn-context-'))
shutil.copy(ROOT / 'outputs' / 'Night_Sweep.html', serve / 'index.html')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        pass

server = QuietServer(('127.0.0.1', 0), partial(Quiet, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []

def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

def open_page(browser, width):
    context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True, color_scheme='dark')
    context.add_init_script("try{localStorage.setItem('nightsweep-theme-v1','night')}catch(e){}")
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
    page.wait_for_function("typeof WorkflowUI!=='undefined'")
    return context, page

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
        for width in (320, 375, 390, 430):
            context, page = open_page(browser, width)
            theme = page.evaluate("document.documentElement.dataset.theme || 'night'")
            check(f'{width}px night palette', theme == 'night')
            page.evaluate("WorkflowUI.go('home')")
            fit = page.evaluate("""() => {
              const s = document.getElementById('contextStrip');
              const r = s.getBoundingClientRect();
              return !s.hidden && r.width > 0 && r.left >= -1 && r.right <= innerWidth + 1
                && document.documentElement.scrollWidth <= innerWidth + 1;
            }""")
            check(f'{width}px the strip fits on Home', fit)
            page.evaluate("WorkflowUI.go('calculators')")
            hidden = page.evaluate("document.getElementById('contextStrip').hidden === true")
            check(f'{width}px Tools hides the strip', hidden and page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            page.evaluate("WorkflowUI.go('station')")
            plane = page.evaluate("""() => {
              const s = document.getElementById('contextStrip');
              const p = s.querySelector('[data-context="plane"]');
              return !s.hidden && !p.hidden && /unknown|Plane:/.test(p.textContent);
            }""")
            check(f'{width}px Station shows the plane line', plane)
            check(f'{width}px no page errors', not errors)
            context.close()
        browser.close()
    print(f'Build3 context strip Chromium: {len(checks)} checks passed')
finally:
    server.shutdown()
    shutil.rmtree(serve, ignore_errors=True)
