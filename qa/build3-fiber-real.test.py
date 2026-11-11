#!/usr/bin/env python3
"""Real-browser regressions for the fiber tools (Test -> Fiber).

A native number box holding only a minus sign reads as "" but is not blank (validity.badInput is true), so a string-level
test cannot see it. Before this check a lone minus in "Other loss" silently dropped that loss and showed a green result,
a lone minus in a transmitter power box was read as "no optics numbers", and a lone minus in the fiber number fell back to
the tube and position. Desktop Chromium with phone-sized viewports and touch emulation; not a physical phone."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os, shutil, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
serve = Path(tempfile.mkdtemp(prefix='cn-fiber-real-'))
shutil.copy(ROOT / 'outputs' / 'Night_Sweep.html', serve / 'index.html')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(serve)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []

def check(name, value):
    if not value:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

def box(page, card, name):
    return page.locator(f'[data-fiber="{card}"][data-field="{name}"]')

def result(page, card):
    return page.locator(f'#fiber-{card}-result').inner_text()

def open_fiber(browser, width):
    context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
    page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof FiberToolsUI!=="undefined"')
    page.evaluate("WorkflowUI.go('fiber')")
    return context, page

def fill_budget(page):
    for name, value in dict(length='12.4', attenuation='0.35', connectors='4', connectorLoss='0.3', splices='6', spliceLoss='0.1', other='3.5', margin='3', tx='3', rx='-8').items():
        box(page, 'budget', name).fill(value)
    page.wait_for_timeout(150)

def budget_checks(browser, width):
    context, page = open_fiber(browser, width)
    fill_budget(page)
    base = result(page, 'budget')
    check(f'{width}px budget: the worked example gives 9.64 dB estimated, 12.64 dB required and 1.64 dB short', '9.64' in base and '12.64' in base and 'Short by 1.64' in base)
    other = box(page, 'budget', 'other')
    other.click(); page.keyboard.press('Control+A'); page.keyboard.type('-'); page.wait_for_timeout(150)
    check(f'{width}px budget: a lone minus sign in Other loss reads as empty but is a bad entry', other.evaluate('e=>e.value===""&&e.validity.badInput===true'))
    shown = result(page, 'budget')
    check(f'{width}px budget: the loss is not silently dropped: the card says Not calculated and names the box', shown.startswith('Not calculated') and 'Other loss' in shown and 'Estimated link loss' not in shown and '6.14' not in shown)
    check(f'{width}px budget: the box is marked invalid and the reason is an alert inside the screen', other.get_attribute('aria-invalid') == 'true' and page.locator('#fiber-budget-result [role=alert]').count() == 1 and page.locator('#fiber-budget-result').bounding_box()['y'] + 20 <= 844 * 3)
    other.click(); page.keyboard.press('Control+A'); page.keyboard.type('3.5'); page.wait_for_timeout(150)
    check(f'{width}px budget: finishing the number restores exactly the earlier result and clears the marking', result(page, 'budget') == base and other.get_attribute('aria-invalid') is None)
    tx = box(page, 'budget', 'tx')
    tx.click(); page.keyboard.press('Control+A'); page.keyboard.type('-'); page.keyboard.press('Tab'); page.wait_for_timeout(150)
    shown = result(page, 'budget')
    check(f'{width}px budget: a lone minus sign in the transmitter power is not read as "no optics numbers"', shown.startswith('Not calculated') and 'Transmitter output power' in shown and 'No optics numbers' not in shown and tx.get_attribute('aria-invalid') == 'true')
    tx.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace'); page.keyboard.press('Tab'); page.wait_for_timeout(150)
    check(f'{width}px budget: a deliberately empty transmitter box is a clear, explained state (both optics boxes are needed)', 'Enter both the transmitter output power' in result(page, 'budget') and tx.get_attribute('aria-invalid') is None)
    check(f'{width}px budget: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
    context.close()

def finder_checks(browser, width):
    context, page = open_fiber(browser, width)
    box(page, 'finder', 'tube').fill('3'); box(page, 'finder', 'position').fill('6'); page.wait_for_timeout(150)
    base = result(page, 'finder')
    check(f'{width}px finder: tube 3 position 6 is fiber 30', 'Fiber 30' in base)
    fiber = box(page, 'finder', 'fiber')
    fiber.click(); page.keyboard.type('-'); page.keyboard.press('Tab'); page.wait_for_timeout(150)
    shown = result(page, 'finder')
    check(f'{width}px finder: a lone minus sign in the fiber box does not fall back to the tube and position', shown.startswith('Not calculated') and 'Fiber number' in shown and 'Fiber 30' not in shown and fiber.get_attribute('aria-invalid') == 'true')
    fiber.click(); page.keyboard.press('Control+A'); page.keyboard.press('Backspace'); page.keyboard.press('Tab'); page.wait_for_timeout(150)
    check(f'{width}px finder: clearing the fiber box on purpose goes back to the tube and position', result(page, 'finder') == base and fiber.get_attribute('aria-invalid') is None)
    check(f'{width}px finder: no sideways scroll and no page errors', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not errors)
    context.close()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
    for width in (360, 390):
        budget_checks(browser, width)
        finder_checks(browser, width)
    browser.close()
server.shutdown()
print(f'Build3 fiber real browser: {len(checks)} checks passed')
