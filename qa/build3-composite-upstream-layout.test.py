#!/usr/bin/env python3
"""Source-assembled Chromium checks for the existing upstream composite card.

Uses temporary HTML only; never rebuilds or writes tracked evidence. Viewports
emulate phones in desktop Chromium, not physical Android/iPhone or WebView.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os
import re
import shutil
import subprocess
import tempfile

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent.parent
CARD = '[data-health-card="upstream"]'
RESULT = '#health-upstream-result'
NUMBER = RESULT + ' [data-composite-margin]'
FIELDS = {name: f'[data-health="upstream"][data-field="{name}"]'
          for name in ['mode', 'basis', 'total', 'pmax']}
checks = 0
errors = []


def check(name, value):
    global checks
    if not value:
        raise AssertionError(name)
    checks += 1
    print('PASS ' + name, flush=True)


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def words(page, selector=RESULT):
    return re.sub(r'\s+', ' ', page.locator(selector).inner_text()).strip()


def fill(page, name, value):
    page.locator(FIELDS[name]).fill(value)


def choose(page, name, value):
    page.select_option(FIELDS[name], value)


def no_number(page):
    return page.locator(NUMBER).count() == 0


def number_is(page, expected):
    return page.locator(NUMBER).count() == 1 and words(page, NUMBER) == expected


def exercise(browser, url, width):
    label = f'{width}px upstream composite'
    context = browser.new_context(viewport={'width': width, 'height': 900},
                                  device_scale_factor=2, is_mobile=True,
                                  has_touch=True, color_scheme='dark')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        page.goto(url)
        page.wait_for_function('typeof WorkflowUI!=="undefined" && typeof DocsisHealth!=="undefined"')
        page.evaluate("WorkflowUI.go('docsisHealth')")
        check(label + ' names the existing card as composite margin',
              words(page, '#health-upstream-title') == 'Upstream composite margin to Pmax')
        check(label + ' declares MTC enabled with applicable 3.1 mode',
              re.search(r'MTC.*enabled', page.locator(FIELDS['mode'] + ' option[value="3.1"]').inner_text(), re.I))
        check(label + ' requires explicit confirmation instead of preselecting it',
              page.locator(FIELDS['basis']).input_value() == '' and
              page.locator(FIELDS['basis'] + ' option[value="confirmed"]').count() == 1)
        card_text = words(page, CARD)
        check(label + ' explains actual simultaneous total, connector plane and comparable reference',
              all(re.search(pattern, card_text, re.I) for pattern in
                  ['simultaneous', 'F.connector', 'comparable', 'reference|Pmax']))

        choose(page, 'mode', '3.1')
        fill(page, 'total', '60')
        fill(page, 'pmax', '68')
        check(label + ' leaves margin unavailable until basis is confirmed',
              no_number(page) and re.search(r'confirm|simultaneous|unknown', words(page), re.I))
        choose(page, 'basis', 'confirmed')
        check(label + ' H3 shows signed six-significant entered-reference margin',
              number_is(page, '+8.00000 dB'))
        check(label + ' distinguishes entered 68 from an assumed reference',
              re.search(r'entered|your entry', words(page), re.I) and
              '68' in words(page) and not re.search(r'assumed', words(page), re.I))

        fill(page, 'pmax', '')
        check(label + ' H4 shows signed six-significant assumed-reference margin',
              number_is(page, '+5.00000 dB'))
        check(label + ' labels blank 65 as assumed and not reported capability',
              re.search(r'assumed', words(page), re.I) and '65' in words(page) and
              re.search(r'not.{0,45}(?:reported|actual|capability)|does not.{0,45}capability', words(page), re.I))

        fill(page, 'pmax', '65')
        fill(page, 'total', '66')
        check(label + ' H5 keeps negative margin and says over the reference',
              number_is(page, '−1.00000 dB') and
              re.search(r'over (?:the )?reference', words(page), re.I) and
              not page.locator(RESULT).evaluate("el=>el.classList.contains('error')"))
        fill(page, 'total', '65')
        check(label + ' exact zero alone says At the reference with neutral status',
              number_is(page, '0.00000 dB') and
              re.search(r'At the reference', words(page), re.I) and
              page.locator(RESULT + ' .health-status.neutral').count() >= 1)
        fill(page, 'total', '64.999999')
        check(label + ' tiny positive margin stays below the reference',
              number_is(page, '+1.00000e-6 dB') and
              re.search(r'below (?:the )?reference', words(page), re.I) and
              not re.search(r'At the reference', words(page), re.I))
        fill(page, 'total', '65.000001')
        check(label + ' HX09 shows six-significant negative scientific notation',
              number_is(page, '−1.00000e-6 dB') and
              re.search(r'over (?:the )?reference', words(page), re.I))

        choose(page, 'mode', 'other')
        choose(page, 'basis', 'confirmed')
        fill(page, 'total', '52')
        fill(page, 'pmax', '57')
        check(label + ' keeps a comparable entered other-mode reference generic',
              number_is(page, '+5.00000 dB') and
              re.search(r'entered|your entry', words(page), re.I) and '57' in words(page))
        card_text = words(page, CARD)
        check(label + ' explains compatibility and per-channel DRW limits',
              re.search(r'3\.0|compatibility', card_text, re.I) and
              re.search(r'per.channel', card_text, re.I) and 'DRW' in card_text and
              not re.search(r'of headroom below|room to raise|No headroom', card_text, re.I))
        fill(page, 'pmax', '')
        check(label + ' refuses blank Pmax in other mode without a stale margin',
              no_number(page) and re.search(r'Pmax|maximum|reference', words(page), re.I))

        choose(page, 'mode', '3.1')
        choose(page, 'basis', 'confirmed')
        fill(page, 'total', '60')
        check(label + ' returning to applicable mode restores its assumed reference',
              number_is(page, '+5.00000 dB') and re.search(r'assumed', words(page), re.I))
        pmax = page.locator(FIELDS['pmax'])
        for invalid in ['-', '1e']:
            pmax.click()
            page.keyboard.press('Control+A')
            page.keyboard.type(invalid)
            check(label + f' real keyboard {invalid!r} reaches badInput',
                  pmax.evaluate('el=>el.value==="" && el.validity.badInput===true'))
            check(label + f' real keyboard {invalid!r} refuses instead of assuming 65',
                  no_number(page) and re.search(r'Pmax|maximum.{0,30}number|numeric', words(page), re.I) and
                  not re.search(r'assumed', words(page), re.I))
            page.keyboard.press('Control+A')
            page.keyboard.press('Backspace')
            check(label + f' deliberately clearing {invalid!r} restores blank default',
                  pmax.evaluate('el=>el.value==="" && el.validity.badInput===false') and
                  number_is(page, '+5.00000 dB'))

        choose(page, 'basis', '')
        check(label + ' clearing context removes the previous numeric comparison', no_number(page))
        choose(page, 'basis', 'confirmed')
        check(label + ' reconfirming context recomputes the current values', number_is(page, '+5.00000 dB'))
        choose(page, 'mode', '')
        check(label + ' clearing operating mode removes the previous comparison', no_number(page))
        choose(page, 'mode', '3.1')
        choose(page, 'basis', 'confirmed')
        fill(page, 'total', '-100')
        fill(page, 'pmax', '150')
        check(label + ' signed large margin remains readable in its card', number_is(page, '+250.000 dB'))

        check(label + ' uses the dark theme', page.evaluate(r'''() => {
          const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number);
          return getComputedStyle(document.documentElement).colorScheme.includes('dark') &&
            c.slice(0, 3).every(v => v < 100) && (c.length < 4 || c[3] > 0.99);
        }'''))
        check(label + ' fits the page without horizontal overflow',
              page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        geometry = page.locator(CARD + ' input, ' + CARD + ' select').evaluate_all('''els =>
          els.filter(el => el.offsetParent).map(el => {
            const r = el.getBoundingClientRect(); return [r.left, r.right, r.height];
          })''')
        check(label + ' has field-sized controls contained inside the viewport',
              len(geometry) >= 4 and all(left >= -1 and right <= width + 1 and height >= 40
                                         for left, right, height in geometry))
        check(label + ' wraps explanation and numeric results inside the card',
              page.locator(CARD + ' p, ' + CARD + ' label, ' + CARD + ' strong').evaluate_all(
                  'els=>els.filter(el=>el.offsetParent).every(el=>el.scrollWidth<=el.clientWidth+1)'))
        check(label + ' reports company comparison as Unknown until entered',
              re.search(r'Company window.*Unknown', words(page), re.I))
        check(label + ' has no script errors', not errors)
    finally:
        context.close()


def main():
    chromium = os.environ.get('NIGHTSWEEP_CHROMIUM') or shutil.which('chromium')
    print('Chromium: ' + (chromium or 'Playwright bundled default'), flush=True)
    assembled = subprocess.run(
        ['node', '-e', "process.stdout.write(require('./qa/build2-source-harness.cjs').assembleHtml())"],
        cwd=ROOT, check=True, capture_output=True, text=True).stdout
    with tempfile.TemporaryDirectory(prefix='cn-composite-upstream-') as temporary:
        Path(temporary, 'index.html').write_text(assembled)
        server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=temporary))
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(executable_path=chromium, headless=True,
                                                     args=['--no-sandbox'])
                try:
                    url = f'http://127.0.0.1:{server.server_port}/index.html'
                    for width in [320, 360, 390, 430]:
                        exercise(browser, url, width)
                finally:
                    browser.close()
        finally:
            server.shutdown()
            server.server_close()
            thread.join()
    print(f'Build3 upstream composite Chromium: {checks} checks passed; source assembly; no physical-device test', flush=True)


if __name__ == '__main__':
    main()
