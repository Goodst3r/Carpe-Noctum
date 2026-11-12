"""Independent exact-head PM UI review; offline Chromium, generated artifact, synthetic data."""
from pathlib import Path
import json,re,hashlib,sys
from playwright.sync_api import sync_playwright
ROOT=Path('/workspace/scratch/pr40-independent-browser');HTML=(ROOT/'Night_Sweep.html').read_text();KEY='nightsweep-power-pm-v1';LIMIT=2*1024*1024
checks=[];findings=[];errors=[];downloads=[];reload_diagnostics=[]

def check(name,passed,width=None,actual=None,finding=None):
    record={'name':name,'width':width,'passed':bool(passed)}
    if actual is not None: record['actual']=actual
    checks.append(record);print(('PASS ' if passed else 'FAIL ')+str(width or '')+' '+name+((' '+json.dumps(actual,ensure_ascii=False)) if not passed else ''),flush=True)
    if not passed and finding:findings.append({'id':finding,**record})

def storage(page):return page.evaluate('Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]))')
def notebook(page):
    raw=page.evaluate('(key)=>localStorage.getItem(key)',KEY)
    return json.loads(raw) if raw else {'version':1,'supplies':[]}
def other_stores(page):return {k:v for k,v in storage(page).items() if k!=KEY}
def canonical(supplies):return [{'name':s['name'],'visits':[{k:v for k,v in visit.items() if k!='id'} for visit in s['visits']]} for s in supplies]
def pm_status(page):return page.locator('#powerPmStatus').inner_text()
def reset_writes(page):page.evaluate('window.__pmWrites=[]')
def writes(page):return page.evaluate('window.__pmWrites')
def open_pm(page):
    page.locator('[data-main-tab="plan"]').click();page.locator('#task-tab-powerPm').click()
def create_visit(page,name,date,volts):
    page.locator('#powerPmName').fill(name);page.locator('#powerPmDate').fill(date);page.locator('#powerPmChemistry').select_option('vrla')
    page.locator('#powerPmInput').fill('120');page.locator('#powerPmOutput').fill('89');page.locator('#powerPmLoad').fill('5');page.locator('#powerPmInverter').select_option('not-tested')
    page.locator('#powerPmAlarms').fill('Synthetic alarm observation Ω');page.locator('#powerPmBatterySlot').fill('Synthetic string A');page.locator('#powerPmBatteryVolts').fill(volts);page.locator('#powerPmAddBattery').click();page.locator('#powerPmSave').click()
def choose_file(page,path=None):
    with page.expect_file_chooser(timeout=10000) as chooser:page.locator('#powerPmImport').click()
    chooser.value.set_files([] if path is None else str(path))
def import_file(page,path,pattern):
    # A real New supply selection gives this asynchronous import a distinct starting status.
    page.locator('#powerPmSupplyPick').select_option('')
    choose_file(page,path);page.wait_for_function('(pattern)=>new RegExp(pattern,"i").test(document.getElementById("powerPmStatus").textContent)',arg=pattern)
def export_file(page,width,suffix):
    with page.expect_download(timeout=10000) as pending:page.locator('#powerPmExport').click()
    download=pending.value;destination=ROOT/f'{width}-{suffix}.json';download.save_as(destination)
    downloads.append({'width':width,'name':download.suggested_filename,'path':str(destination),'failure':download.failure(),'bytes':destination.stat().st_size,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()})
    return destination,download

def empty_notebook_ui(page):
    while notebook(page)['supplies']:
        page.locator('#powerPmSupplyPick').select_option(notebook(page)['supplies'][0]['id']);page.locator('#powerPmDelete').click()

def fixture(name,data):
    path=ROOT/name;path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')));return path

def visit(**extra):return {'date':'2026-11-11','chemistry':'vrla','inverter':'not-tested','alarms':'Synthetic import','inputVolts':120,'outputVolts':89,'loadAmps':5,'batteries':[{'slot':'Synthetic string A','volts':13.2}],'spans':[],**extra}
def envelope(supplies):return {'kind':'carpe-noctum-supply-pm-notebook','version':1,'supplies':supplies}

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width in [320,360,390,430]:
        context=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True,accept_downloads=True,offline=True)
        context.route('**/*',lambda route:route.fulfill(status=200,content_type='text/html',body=HTML) if route.request.is_navigation_request() else route.abort())
        context.add_init_script('''window.__pmWrites=[];const originalPmSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){window.__pmWrites.push(String(key));return originalPmSet.call(this,key,value)};''')
        page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)));page.goto('https://pr40-offline.invalid/index.html');open_pm(page);page.evaluate('document.documentElement.dataset.theme="night"')
        check('generated app has no Android bridge',page.evaluate('typeof window.NightSweepAndroid==="undefined"'),width)
        baseline_state=page.evaluate('JSON.stringify(state)');baseline_other=other_stores(page);reset_writes(page)
        create_visit(page,'SYNTHETIC browser supply','2026-11-11','13.2');create_visit(page,'SYNTHETIC browser supply','2026-11-12','12.9')
        before=notebook(page);check('real controls save one supply and two visits',len(before['supplies'])==1 and len(before['supplies'][0]['visits'])==2,width)
        check('PM Save writes only its device notebook and leaves job unchanged',set(writes(page))=={KEY} and other_stores(page)==baseline_other and page.evaluate('JSON.stringify(state)')==baseline_state,width,actual=writes(page))
        reset_writes(page);exported_path,download=export_file(page,width,'downloaded-notebook');exported=json.loads(exported_path.read_text())
        check('actual browser Blob download has the correct file envelope and content',download.suggested_filename=='CarpeNoctum_Supply_PM_notebook.json' and download.failure() is None and exported['kind']=='carpe-noctum-supply-pm-notebook' and exported['version']==1 and canonical(exported['supplies'])==canonical(before['supplies']),width)
        check('export creates no notebook/job/storage writes',not writes(page) and other_stores(page)==baseline_other and notebook(page)==before,width,actual=writes(page))
        import_file(page,exported_path,r'Imported|Nothing new to import');after_same=notebook(page)
        dedup_ok=after_same==before and 'Nothing new to import' in pm_status(page)
        check('reimporting an own UI-saved download skips the existing supply byte-for-byte',dedup_ok,width,actual={'beforeCount':len(before['supplies']),'afterCount':len(after_same['supplies']),'status':pm_status(page),'localVisitKeys':list(before['supplies'][0]['visits'][0]),'importedVisitKeys':list(after_same['supplies'][-1]['visits'][0])},finding='P2-local-export-dedupe')
        if not dedup_ok:page.locator('#powerPmSupplyPick').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/f'{width}-duplicate-after-own-export.png'),full_page=True)
        empty_notebook_ui(page);reset_writes(page);import_file(page,exported_path,r'Imported 1 supply');restored=notebook(page)
        check('actual file chooser restores original visit values with fresh unique IDs',canonical(restored['supplies'])==canonical(before['supplies']) and restored['supplies'][0]['id']!=before['supplies'][0]['id'] and len({v['id'] for v in restored['supplies'][0]['visits']})==2,width)
        check('successful import changes only notebook storage',set(writes(page))=={KEY} and other_stores(page)==baseline_other and page.evaluate('JSON.stringify(state)')==baseline_state,width,actual=writes(page))
        raw_before_reload=page.evaluate('(key)=>localStorage.getItem(key)',KEY);page.reload();open_pm(page)
        check('reload retains imported notebook bytes and renders saved visits',page.evaluate('(key)=>localStorage.getItem(key)',KEY)==raw_before_reload and page.locator('#powerPmSupplyPick option').count()==2,width)
        page.locator('#powerPmSupplyPick').select_option(restored['supplies'][0]['id']);check('saved visit records remain visible after real selection',page.locator('#powerPmVisits tr').count()==2 and '2026-11-12' in page.locator('#powerPmVisits').inner_text(),width)
        reloaded_state=page.evaluate('JSON.stringify(state)');reloaded_other=other_stores(page)
        diagnostic={'width':width,'changedStorageKeysDuringReload':[key for key in set(baseline_other)|set(reloaded_other) if baseline_other.get(key)!=reloaded_other.get(key)],'rowsBeforeReload':json.loads(baseline_state).get('rows'),'rowsAfterReload':json.loads(reloaded_state).get('rows')};reload_diagnostics.append(diagnostic);print('OBSERVED reload startup: '+json.dumps(diagnostic,ensure_ascii=False),flush=True)
        baseline_state=reloaded_state;baseline_other=reloaded_other
        reset_writes(page);once=page.evaluate('(key)=>localStorage.getItem(key)',KEY);import_file(page,exported_path,r'Nothing new to import')
        check('already imported canonical notebook deduplicates without writes',page.evaluate('(key)=>localStorage.getItem(key)',KEY)==once and not writes(page),width)
        merged_path=fixture(f'{width}-merge.json',envelope([exported['supplies'][0],{'name':'SYNTHETIC second supply','visits':[visit()]}]));reset_writes(page);import_file(page,merged_path,r'Imported 1 supply and skipped 1')
        check('merge adds new supply and skips canonical matching content',len(notebook(page)['supplies'])==2 and [s['name'] for s in notebook(page)['supplies']]==['SYNTHETIC browser supply','SYNTHETIC second supply'] and other_stores(page)==baseline_other,width)
        distinct_path=fixture(f'{width}-same-name-distinct.json',envelope([{'name':'SYNTHETIC browser supply','visits':[visit(date='2026-01-01')]}]));import_file(page,distinct_path,r'Imported 1 supply')
        current=notebook(page);ids=[s['id'] for s in current['supplies']]+[v['id'] for s in current['supplies'] for v in s['visits']]
        check('same name with different visits is retained separately with unique IDs',len(current['supplies'])==3 and len(ids)==len(set(ids)),width)
        bads={
            'not-json':('{nope',r'not readable'),
            'bad-version':(json.dumps({'kind':'carpe-noctum-supply-pm-notebook','version':2,'supplies':[]}),r'version'),
            'partial-bad-date':(json.dumps(envelope([{'name':'Valid first synthetic','visits':[visit()]},{'name':'Invalid second synthetic','visits':[visit(date='2026-02-31')]}])),r'calendar date'),
            'negative-battery':(json.dumps(envelope([{'name':'Invalid volts','visits':[visit(batteries=[{'slot':'Synthetic string','volts':-1}])]}])),r'battery volts'),
            '41-supplies':(json.dumps(envelope([{'name':'Synthetic '+str(i),'visits':[]} for i in range(41)])),r'more than 40')}
        for name,(text,pattern) in bads.items():
            path=ROOT/f'{width}-{name}.json';path.write_text(text);snapshot=storage(page);memory=page.evaluate('JSON.stringify(state)');reset_writes(page);import_file(page,path,pattern)
            check(name+' real file is refused atomically with adjacent feedback',storage(page)==snapshot and page.evaluate('JSON.stringify(state)')==memory and not writes(page) and 'Nothing was imported' in pm_status(page),width,actual={'status':pm_status(page),'writes':writes(page)})
        oversized=ROOT/f'{width}-oversize.json';oversized.write_bytes(b' '*(LIMIT+1));snapshot=storage(page);reset_writes(page);import_file(page,oversized,r'larger than 2 MiB')
        check('real 2MiB+1 byte file is refused without writes',storage(page)==snapshot and not writes(page),width,actual={'bytes':oversized.stat().st_size,'status':pm_status(page)})
        multibyte=ROOT/f'{width}-multibyte-oversize.json';multibyte.write_text('Ω'*(LIMIT//2+1));snapshot=storage(page);reset_writes(page);import_file(page,multibyte,r'larger than 2 MiB')
        check('UTF-8 bytes over cap are refused even when code-unit length is below cap',storage(page)==snapshot and not writes(page),width,actual={'bytes':multibyte.stat().st_size,'characters':LIMIT//2+1,'status':pm_status(page)})
        boundary=ROOT/f'{width}-exact-2mib.json';text=json.dumps(envelope([{'name':'SYNTHETIC exact size boundary','visits':[]}]),separators=(',',':'));boundary.write_bytes(text.encode()+b' '*(LIMIT-len(text.encode())));reset_writes(page);import_file(page,boundary,r'Imported 1 supply')
        check('exact 2MiB valid notebook file is accepted inclusively',len(notebook(page)['supplies'])==4 and boundary.stat().st_size==LIMIT and set(writes(page))=={KEY},width)
        before_cancel=storage(page);status_before=pm_status(page);reset_writes(page);choose_file(page,None)
        check('empty file-chooser selection cancels without writes or a false new import message',storage(page)==before_cancel and not writes(page) and pm_status(page)==status_before,width)
        page.locator('#powerPmStatus').scroll_into_view_if_needed();check('dark notebook export/import controls fit phone width and have 44px targets',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and page.locator('#powerPmExport,#powerPmImport').evaluate_all('(els)=>els.every(e=>e.getBoundingClientRect().height>=44)'),width)
        page.locator('[data-main-tab="tools"]').click();page.locator('#task-tab-limits').click();source=page.locator('#limitsList [data-threshold="power.pm.file.max"]');source.click();source_text=page.locator('#sourceSheet').inner_text()
        check('actual Unknown source dialog declares 2097152-byte import cap and atomic refusal', '2097152' in source_text and 'bytes' in source_text and 'Unknown' in source_text and 'larger file is refused whole' in source_text,width,actual=source_text)
        page.locator('#sourceSheet [data-source-close]').click();open_pm(page)
        check('all import/export/source operations leave unrelated job/device data unchanged',other_stores(page)==baseline_other and page.evaluate('JSON.stringify(state)')==baseline_state,width)
        hostile_path=fixture(f'{width}-literal-battery-text.json',envelope([{'name':'SYNTHETIC literal imported text','visits':[visit(batteries=[{'slot':'<img src=x onerror=window.p=1>','volts':13.2}])]}]));page.evaluate('window.p=0');import_file(page,hostile_path,r'Imported 1 supply');page.locator('#powerPmSupplyPick').select_option(notebook(page)['supplies'][-1]['id'])
        page.wait_for_function('window.p===1 || document.querySelectorAll("#powerPmVisits img").length===0')
        check('imported battery text remains literal without executing markup',page.locator('#powerPmVisits img').count()==0 and page.evaluate('window.p')==0,width,actual={'imgCount':page.locator('#powerPmVisits img').count(),'executedFlag':page.evaluate('window.p'),'visitsHTML':page.locator('#powerPmVisits').inner_html()},finding='P1-imported-markup-executes')
        if page.evaluate('window.p')==1:page.locator('#powerPmVisits').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/f'{width}-imported-battery-markup.png'),full_page=True)
        context.close()
    # Browser platform failures are isolated fault injections, not OS/native results.
    context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,accept_downloads=True,offline=True)
    context.route('**/*',lambda route:route.fulfill(status=200,content_type='text/html',body=HTML) if route.request.is_navigation_request() else route.abort())
    page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)));page.goto('https://pr40-platform-fault.invalid/index.html');open_pm(page);create_visit(page,'SYNTHETIC fault supply','2026-11-12','13.2');before_fault=storage(page)
    page.evaluate('() => { window.__originalBlobURL=URL.createObjectURL;URL.createObjectURL=()=>{throw new DOMException("Synthetic Blob URL denial","NotAllowedError")}; }')
    page.locator('#powerPmExport').click();page.wait_for_function('document.getElementById("browserFileStatus")?.textContent.includes("Could not start the download")')
    pm=pm_status(page);browser_status=page.locator('#browserFileStatus').inner_text();check('fault-injected Blob denial is reflected truthfully in PM export feedback',not pm.startswith('Exported '),390,actual={'pmStatus':pm,'browserStatus':browser_status},finding='P2-export-error-feedback')
    check('fault-injected export error leaves notebook and other storage unchanged',storage(page)==before_fault,390)
    page.evaluate('() => { URL.createObjectURL=window.__originalBlobURL;Object.defineProperty(navigator,"canShare",{configurable:true,value:()=>true});Object.defineProperty(navigator,"share",{configurable:true,value:async()=>{throw new DOMException("Synthetic Web Share cancellation","AbortError")}}); }')
    page.locator('#powerPmExport').click();page.wait_for_function('document.getElementById("browserFileStatus")?.textContent.includes("Sharing cancelled")')
    pm=pm_status(page);browser_status=page.locator('#browserFileStatus').inner_text();check('fault-injected Web Share cancellation is reflected truthfully in PM export feedback',not pm.startswith('Exported '),390,actual={'pmStatus':pm,'browserStatus':browser_status},finding='P2-export-cancel-feedback')
    check('fault-injected share cancellation leaves notebook and unrelated storage unchanged',storage(page)==before_fault and page.evaluate('typeof window.NightSweepAndroid==="undefined"'),390)
    page.screenshot(path=str(ROOT/'390-export-cancel-feedback.png'),full_page=True);context.close();browser.close()
check('no application runtime errors across browser cases',not errors,actual=errors)
summary={'head':'1c1e5414a40424d6999fafb105d862a7cf939345','checks':checks,'passed':sum(c['passed'] for c in checks),'failed':sum(not c['passed'] for c in checks),'findings':findings,'runtimeErrors':errors,'downloads':downloads,'reloadDiagnostics':reload_diagnostics,'scope':'offline desktop Chromium mobile viewports; no native Android bridge; Blob denial/Web Share abort are explicitly fault-injected platform boundaries'}
(ROOT/'results.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n')
print('PR40 independent browser: '+str(summary['passed'])+' passed, '+str(summary['failed'])+' failed; '+str(len(downloads))+' actual downloads',flush=True)
sys.exit(1 if summary['failed'] else 0)
