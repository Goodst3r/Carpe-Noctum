import json, os, hashlib, threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = Path('/tmp/chatgpt-pr40-review')
OUT.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT / 'outputs')))
threading.Thread(target=server.serve_forever, daemon=True).start()
checks = []
def check(name, value):
    assert value, name
    checks.append(name)
    print('PASS ' + name, flush=True)
KEY = 'nightsweep-power-pm-v1'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM', '/usr/bin/chromium'), args=['--no-sandbox'])
    context = browser.new_context(viewport={'width':390, 'height':844}, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html')
    page.wait_for_function('typeof PowerPMUI !== "undefined" && typeof WorkflowUI !== "undefined"')
    page.evaluate("WorkflowUI.go('powerPm')")
    page.locator('#powerPmCable').select_option(page.locator('#powerPmCable option').evaluate_all("es=>es.find(e=>e.value&&!e.textContent.includes('no published')).value"))
    for name, value in {'Length':'0', 'Slack':'0', 'Current':'0', 'Supply':'90', 'Temp':'68', 'Alpha':'0'}.items():
        page.locator('#powerPm' + name).fill(value)
    page.locator('#powerPmName').fill('PRACTICE native chooser 1001')
    page.locator('#powerPmDate').fill('2026-11-12')
    page.evaluate("()=>{for(let i=0;i<1001;i++)document.getElementById('powerPmAddSpan').click()}")
    check('real Add this span controls accept 1001 spans', page.locator('#powerPmChain tr').count() == 1001)
    page.locator('#powerPmSave').click()
    original = page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).supplies', KEY)
    check('real Save this visit stores all 1001 spans', len(original[0]['visits'][0]['spans']) == 1001)
    job = page.evaluate("localStorage.getItem('hfc-route-v1')")
    with page.expect_download() as info:
        page.locator('#powerPmExport').click()
    exported = OUT / '1001-spans-export.json'
    info.value.save_as(exported)
    file = json.loads(exported.read_text())
    check('native browser download contains all 1001 spans', len(file['supplies'][0]['visits'][0]['spans']) == 1001)
    check('export asks user to check Downloads before uninstalling', 'check that it is there before you uninstall' in page.locator('#powerPmStatus').inner_text())
    check('native notebook export leaves job bytes unchanged', page.evaluate("localStorage.getItem('hfc-route-v1')") == job)
    page.evaluate('(key)=>localStorage.removeItem(key)', KEY)
    page.reload()
    page.evaluate("WorkflowUI.go('powerPm')")
    job_after_startup = page.evaluate("localStorage.getItem('hfc-route-v1')")
    with page.expect_file_chooser() as chosen:
        page.locator('#powerPmImport').click()
    chosen.value.set_files(exported)
    page.wait_for_function("document.getElementById('powerPmStatus').textContent.includes('Imported 1 supply')")
    restored = page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).supplies', KEY)
    def content(supplies):
        return [{'name':s['name'], 'visits':[{k:v for k,v in visit.items() if k!='id'} for visit in s['visits']]} for s in supplies]
    check('FileChooser restores every field and ordered span, ignoring fresh visit IDs', content(restored) == content(original))
    check('import generates fresh supply and visit IDs', restored[0]['id'] != original[0]['id'] and restored[0]['visits'][0]['id'] != original[0]['visits'][0]['id'])
    once = page.evaluate('(key)=>localStorage.getItem(key)', KEY)
    with page.expect_file_chooser() as chosen:
        page.locator('#powerPmImport').click()
    chosen.value.set_files(exported)
    page.wait_for_function("document.getElementById('powerPmStatus').textContent.includes('Nothing new to import')")
    check('native repeated import adds nothing and preserves exact stored bytes', page.evaluate('(key)=>localStorage.getItem(key)', KEY) == once)
    check('native notebook imports leave post-startup job bytes unchanged', page.evaluate("localStorage.getItem('hfc-route-v1')") == job_after_startup)
    check('no uncaught browser error', not errors)
    check('390px page has no horizontal overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    context.close()
    for width in [320, 430]:
        context = browser.new_context(viewport={'width':width, 'height':844}, accept_downloads=True)
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html')
        page.evaluate("WorkflowUI.go('powerPm')")
        evil = '<img src=x onerror=window.p=1>'
        for name, value in {'Name':evil, 'Date':'2026-11-12', 'BatterySlot':evil, 'BatteryVolts':'13.2'}.items():
            page.locator('#powerPm' + name).fill(value)
        page.locator('#powerPmAddBattery').click()
        page.locator('#powerPmSave').click()
        initial = page.evaluate('(key)=>localStorage.getItem(key)', KEY)
        with page.expect_download() as info:
            page.locator('#powerPmExport').click()
        own_file = OUT / f'literal-{width}.json'
        info.value.save_as(own_file)
        check(f'{width}px actual export contains literal battery name', json.loads(own_file.read_text())['supplies'][0]['visits'][0]['batteries'][0]['slot'] == evil)
        with page.expect_file_chooser() as chosen:
            page.locator('#powerPmImport').click()
        chosen.value.set_files(own_file)
        page.wait_for_function("document.getElementById('powerPmStatus').textContent.includes('Nothing new to import')")
        check(f'{width}px own-file dedupe keeps exact stored bytes', page.evaluate('(key)=>localStorage.getItem(key)', KEY) == initial)
        page.evaluate('(key)=>localStorage.removeItem(key)', KEY)
        page.reload()
        page.evaluate("WorkflowUI.go('powerPm')")
        with page.expect_file_chooser() as chosen:
            page.locator('#powerPmImport').click()
        chosen.value.set_files(own_file)
        page.wait_for_function("document.getElementById('powerPmStatus').textContent.includes('Imported 1 supply')")
        page.locator('#powerPmSupplyPick').select_option(page.locator('#powerPmSupplyPick option').evaluate_all('es=>es[1].value'))
        check(f'{width}px imported markup appears literally in saved visit', evil in page.locator('#powerPmVisits').inner_text())
        check(f'{width}px imported markup creates no image and executes no handler', page.locator('#powerPmPanel img').count() == 0 and page.evaluate('window.p === undefined'))
        before_fault = page.evaluate('(key)=>localStorage.getItem(key)', KEY)
        page.evaluate("()=>{window.savedCreateURL=URL.createObjectURL;URL.createObjectURL=()=>{throw Error('review simulated Blob URL denial')}}")
        page.locator('#powerPmExport').click()
        page.wait_for_function("document.getElementById('powerPmStatus').textContent.includes('Nothing was exported')")
        check(f'{width}px actual BrowserFiles denial propagates to PM', 'not saved' in page.locator('#powerPmStatus').inner_text() and 'Could not start the download' in page.locator('#browserFileStatus').inner_text())
        page.evaluate("()=>{URL.createObjectURL=window.savedCreateURL;Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:()=>Promise.reject(new DOMException('review simulated cancel','AbortError'))})}")
        page.locator('#powerPmExport').click()
        page.wait_for_function("document.getElementById('powerPmStatus').textContent.includes('cancelled')")
        check(f'{width}px actual BrowserFiles AbortError propagates to PM', 'Nothing was exported' in page.locator('#powerPmStatus').inner_text() and 'Sharing cancelled' in page.locator('#browserFileStatus').inner_text())
        check(f'{width}px export error/cancel leaves notebook byte-identical', page.evaluate('(key)=>localStorage.getItem(key)', KEY) == before_fault)
        check(f'{width}px no horizontal page overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
        context.close()
    check('all browser contexts have no uncaught page errors', not errors)
    browser.close()
server.shutdown()
receipt = {'checks': len(checks), 'passed': checks, 'standalone_sha256':hashlib.sha256((ROOT/'outputs/Night_Sweep.html').read_bytes()).hexdigest(), 'export_sha256':hashlib.sha256(exported.read_bytes()).hexdigest()}
(OUT/'filechooser-result.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(f'PR40 native FileChooser: {len(checks)} checks passed', flush=True)
