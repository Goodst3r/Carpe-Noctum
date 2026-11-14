#!/usr/bin/env python3
"""Rendered Chromium checks and synthetic exports; requires Playwright + Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import hashlib
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'qa'))
from evidence_path import evidence_path
OUT = evidence_path('research/build2/browser/results.json').parent
EXPORTS = {
    'complete': 'NightSweep_1.8_Alpha_build_2_Training_Job.json',
    'aoi-six-active': 'NightSweep_1.8_Alpha_build_2_Six_Active_Practice.json',
    'custom-curves': 'NightSweep_1.8_Alpha_build_2_Custom_Curves_Practice.json',
    'gainmaker-oem': 'NightSweep_1.8_Alpha_build_2_GainMaker_OEM_AGC_Practice.json',
    'gainmaker-dsim': 'NightSweep_1.8_Alpha_build_2_GainMaker_DSIM_Practice.json',
    'gainmaker-manual': 'NightSweep_1.8_Alpha_build_2_GainMaker_Manual_Thermal_Practice.json',
    'gs7k-node': 'NightSweep_1.8_Alpha_build_2_GS7K_Practice.json',
}
TASKS = ['setup', 'route', 'gain', 'equipmentSetup', 'parts', 'tdr', 'sweepSetup',
         'sweep', 'frequency', 'readings', 'references', 'power', 'trial',
         'projects', 'evidence', 'checklists', 'records', 'runsheet', 'help']
TASK_ALIASES = {'gain': 'route', 'readings': 'route', 'trial': 'power'}
checks, errors, offline_probes = [], [], []

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def checked(name, condition=True):
    if not condition:
        raise AssertionError(name)
    checks.append(name)
    print('PASS ' + name, flush=True)

def ready(page):
    page.wait_for_function('typeof TrainingJob !== "undefined" && typeof WorkflowUI !== "undefined"')
    page.wait_for_function('!window.evidenceIsBusy?.()')

def no_overflow(page, name):
    size = page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
    checked(name + ' fits viewport', size['scroll'] <= size['width'] + 1)

def reveal(page, selector):
    for details in page.locator(selector).locator('xpath=ancestor::details').all():
        if details.get_attribute('open') is None:
            details.locator(':scope > summary').click()

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None,
                                    headless=True, args=['--no-sandbox'])
        version = browser.version
        for width, height in [(360, 800), (390, 844), (768, 1024), (1280, 900)]:
            context = browser.new_context(viewport={'width': width, 'height': height},
                                          is_mobile=width < 768, has_touch=width < 768)
            page = context.new_page()
            page.on('dialog', lambda dialog: dialog.accept())
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base + '/', wait_until='load')
            ready(page)
            checked(f'{width}px loads current app', page.title() == 'Carpe Noctum 2.0 Alpha build 4')
            page.screenshot(path=str(OUT / f'home-{width}.png'), full_page=True)
            no_overflow(page, f'{width}px Home')
            page.evaluate('TrainingJob.open("complete")')
            ready(page)
            for task in TASKS:
                page.evaluate('(task) => WorkflowUI.go(task)', task)
                checked(f'{width}px {task} navigation', page.evaluate('document.body.dataset.task') == TASK_ALIASES.get(task, task))
                no_overflow(page, f'{width}px {task}')
            if width == 390:
                exercises = page.evaluate('TrainingJob.exercises.map(e => ({id:e.id,button:e.button}))')
                checked('Seven loadable examples exposed', {e['id'] for e in exercises} == set(EXPORTS))
                for exercise in exercises:
                    page.evaluate('WorkflowUI.go("home")')
                    reveal(page, '#' + exercise['button'])
                    page.locator('#' + exercise['button']).click()
                    page.wait_for_function('(id) => (state.job.trainingVariant || "complete") === id', arg=exercise['id'])
                    ready(page)
                    bundle = page.evaluate('evidenceExportProject(state)')
                    checked(exercise['id'] + ' retains synthetic identity', bundle['job']['training'] == 'guided-1.5')
                    evidence_path('release/' + EXPORTS[exercise['id']]).write_text(json.dumps(bundle, indent=2) + '\n')
                    if exercise['id'] == 'complete':
                        fleet = page.evaluate('''() => ({
                            node: state.node.model,
                            split: state.sweepSetup.selected,
                            activeIds: state.rows.filter(r => device(r.device)?.active).map(r => r.device),
                            passiveFamilies: state.rows.filter(r => !device(r.device)?.active).map(r => device(r.device)?.family || '')
                        })''')
                        checked('Complete workflow launches from GS7K', fleet['node'] == 'gs7000-12g')
                        checked('Complete workflow uses standard GainMaker HGD actives',
                                len(fleet['activeIds']) >= 2 and set(fleet['activeIds']) == {'active_gm_hgd'})
                        checked('Complete workflow selects 42/54 sweep setup', fleet['split'] == '42')
                        for brand in ['Scientific-Atlanta', 'GigaXtend', 'Technetix']:
                            checked('Complete workflow contains ' + brand + ' passives',
                                    any(brand in family for family in fleet['passiveFamilies']))
                        page.evaluate('WorkflowUI.go("route")')
                        page.screenshot(path=str(OUT / 'complete-gs7k-gan-route-390.png'), full_page=True)
                        page.evaluate('WorkflowUI.go("power")')
                        page.screenshot(path=str(OUT / 'complete-gs7k-gan-power-390.png'), full_page=True)
                    if exercise['id'] == 'aoi-six-active':
                        depth = page.evaluate('''() => {
                            const by = new Map(state.rows.map(r => [r.id,r]));
                            function depth(r, seen = new Set()) {
                                if (!r || seen.has(r.id)) return 0;
                                seen.add(r.id);
                                return (device(r.device)?.active ? 1 : 0) + depth(by.get(r.parent.split('::')[0]), seen);
                            }
                            return Math.max(...state.rows.map(r => depth(r)));
                        }''')
                        checked('Serial ancestry reaches six actives', depth >= 6)
                        page.evaluate('WorkflowUI.go("gain")')
                        page.screenshot(path=str(OUT / 'six-active-gain-390.png'), full_page=True)
                    # Exercise the public import path with its real IndexedDB originals.
                    awaitable = json.dumps(bundle)
                    page.evaluate('(text) => NightSweep.openProject(text)', awaitable)
                    ready(page)
                    imported = page.evaluate('evidenceExportProject(state)')
                    checked(exercise['id'] + ' portable rows/evidence round trip',
                            imported['rows'] == bundle['rows'] and
                            [x['sha256'] for x in imported.get('evidence', [])] ==
                            [x['sha256'] for x in bundle.get('evidence', [])])
                features = page.evaluate('TrainingJob.features.map(f => ({id:f.id,task:f.task,control:f.control}))')
                checked('Feature library covers every task screen', set(TASKS).issubset({f['task'] for f in features}))
                for feature in features:
                    page.evaluate('WorkflowUI.go("home")')
                    reveal(page, '#trainingFeatureSelect')
                    page.locator('#trainingFeatureSelect').select_option(feature['id'])
                    page.locator('#loadTrainingFeature').click()
                    page.wait_for_function('(task) => WorkflowUI.current() === task', arg=TASK_ALIASES.get(feature['task'], feature['task']))
                    ready(page)
                    checked('Feature loads seeded example: ' + feature['id'], page.evaluate('TrainingJob.isTraining()'))
                    checked('Feature reveals its control: ' + feature['id'], bool(feature.get('control')) and page.locator(feature['control']).first.is_visible())
                    no_overflow(page, 'Feature ' + feature['id'])
                page.evaluate('TrainingJob.open("complete")')
                ready(page)
                page.evaluate('saveLocal()')
                before = page.evaluate('({name:state.job.name,rows:state.rows,hashes:state.evidence.map(e=>e.sha256)})')
                checked('Offline persistence probe contains six real bundled originals', len(before['hashes']) == 6)
                page.wait_for_function('navigator.serviceWorker.controller !== null')
                # A fresh, non-asset URL bypasses the worker and cannot be satisfied
                # by its allowlisted shell cache. Prove the transport works first.
                probe_url = base + '/__offline_network_probe__?nonce=' + str(time.monotonic_ns())
                transport_probe = "async url => {try {const r=await fetch(url,{cache:'no-store'});return {reached:true,status:r.status};}catch(e){return {reached:false,error:e.name};}}"
                online_probe = page.evaluate(transport_probe, probe_url)
                checked('Offline transport probe reaches local server before emulation', online_probe == {'reached': True, 'status': 404})
                context.set_offline(True)
                response = page.reload(wait_until='load')
                ready(page)
                after = page.evaluate('({name:state.job.name,rows:state.rows,hashes:state.evidence.map(e=>e.sha256)})')
                checked('Offline reload comes from service worker', response.from_service_worker)
                checked('Offline reload retains saved practice job and six originals', before == after)
                second = context.new_page()
                second.on('pageerror', lambda error: errors.append(str(error)))
                response = second.goto(base + '/', wait_until='load')
                ready(second)
                offline_probe = second.evaluate(transport_probe, probe_url)
                # Chromium 151 can reset navigator.onLine to true on a controlled
                # navigation while transport remains offline. Record the signal;
                # require actual failed network access and a cache-backed 200.
                offline_probes.append({'first_navigator_online': page.evaluate('navigator.onLine'),
                                       'reopened_navigator_online': second.evaluate('navigator.onLine'),
                                       'online_control': online_probe, 'offline_transport': offline_probe,
                                       'from_service_worker': response.from_service_worker, 'status': response.status})
                print('Offline emulation diagnostic: ' + json.dumps(offline_probes[-1]), flush=True)
                checked('New tab reopens app while offline', response.from_service_worker and response.status == 200 and offline_probe == {'reached': False, 'error': 'TypeError'})
                reopened = second.evaluate('({name:state.job.name,rows:state.rows,hashes:state.evidence.map(e=>e.sha256)})')
                checked('New tab retains saved practice job and six originals', before == reopened)
                for name in ['guide.html', 'setup-guide.html', 'equipment-coverage.html', 'math-audit.html',
                             'install.html', 'android.html', 'iphone.html',
                             'functions-guide.html', 'phone-installation.html', 'training-coverage.html']:
                    response = second.goto(base + '/' + name, wait_until='load')
                    checked('Offline guide: ' + name, response.from_service_worker and response.status == 200)
                    no_overflow(second, name)
                second.close()
            checked(f'{width}px no JavaScript runtime errors', not errors)
            context.close()
        browser.close()
    report = {'browser': 'Chromium ' + version, 'checks': len(checks), 'passed': True, 'cases': checks,
              'page_errors': errors, 'offline_probes': offline_probes, 'standalone_sha256': hashlib.sha256((ROOT / 'outputs/Night_Sweep.html').read_bytes()).hexdigest(),
              'pwa_sha256': hashlib.sha256((ROOT / 'dist/index.html').read_bytes()).hexdigest(),
              'scope': 'Rendered desktop Chromium at 360/390/768/1280px, touch/mobile emulation, real IndexedDB import/export, service-worker offline reload and new-tab reopening. No physical Android/iPhone, Safari/WebView or signed APK verification.'}
    (OUT / 'results.json').write_text(json.dumps(report, indent=2) + '\n')
    print(f'Chromium rendered checks: {len(checks)} passed')
finally:
    server.shutdown()
