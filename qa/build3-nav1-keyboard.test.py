#!/usr/bin/env python3
"""Real-keyboard entry into a filtered Plan, Field or Tools list.

Search must not change the selected screen. Tab and ArrowDown must land on the
only visible result, and Enter on that result must open it. Desktop Chromium
at phone widths in the night palette. Not a physical-device test."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, shutil, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
serve = Path(tempfile.mkdtemp(prefix='cn-nav-keys-'))
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
CASES = [
    ('projects', 'what-if', 'power', 'Load & what-if'),
    ('sweepSetup', 'night log', 'nightLog', 'Night log'),
    ('calculators', 'fiber', 'fiber', 'Fiber'),
]

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

def run_case(page, width, start, query, target, label):
    page.evaluate('id => WorkflowUI.go(id)', start)
    page.locator('#taskTabs .task-picker').evaluate('(el)=>el.open=true')
    box = page.locator('[data-task-search]')
    box.fill(query)
    visible = page.evaluate("""() => [...document.querySelectorAll('#taskTabs button')].filter(b => !b.hidden).map(b => b.textContent)""")
    name = f'{width}px {label}'
    check(f'{name}: search leaves {start} selected', page.evaluate('WorkflowUI.current()') == start and visible == [label])
    box.press('Tab')
    reached = page.evaluate('document.activeElement && document.activeElement.dataset.task')
    check(f'{name}: Tab reaches the only visible result', reached == target and page.evaluate('WorkflowUI.current()') == start)
    page.keyboard.press('Enter')
    check(f'{name}: Enter on that result opens it', page.evaluate('WorkflowUI.current()') == target)
    page.keyboard.press('Escape')
    check(f'{name}: Escape closes the picker and focuses the chosen screen', page.evaluate("!document.querySelector('.task-picker').open && document.activeElement===document.querySelector('#screenTitle h2')"))

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
        for width in (320, 360, 390, 430):
            context, page = open_page(browser, width)
            theme = page.evaluate("document.documentElement.dataset.theme || 'night'")
            check(f'{width}px night palette', theme == 'night')
            for start, query, target, label in CASES:
                run_case(page, width, start, query, target, label)
            check(f'{width}px no page errors', not errors)
            context.close()
        context, page = open_page(browser, 390)
        page.evaluate("WorkflowUI.go('calculators')")
        page.locator('#taskTabs .task-picker').evaluate('(el)=>el.open=true')
        box = page.locator('[data-task-search]')
        box.fill('fiber')
        box.press('Enter')
        check('Enter in the search box focuses Fiber and does not navigate', page.evaluate("document.activeElement && document.activeElement.dataset.task") == 'fiber' and page.evaluate('WorkflowUI.current()') == 'calculators')
        box.press('ArrowDown')
        check('ArrowDown in the search box focuses Fiber without navigating', page.evaluate("WorkflowUI.current()") == 'calculators' and page.evaluate("document.activeElement && document.activeElement.dataset.task") == 'fiber')
        context.close()
        browser.close()
finally:
    server.shutdown()
    shutil.rmtree(serve, ignore_errors=True)

print(f'Build3 navigation keyboard: {len(checks)} checks passed')
if errors:
    raise SystemExit('page errors: ' + '; '.join(errors))
