exec(open('/tmp/review40-new-browser.py').read().split('with sync_playwright() as p:')[0])
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844},accept_downloads=True);page=c.new_page();page.goto(url);page.wait_for_function('typeof PowerPMUI!=="undefined"');page.evaluate('WorkflowUI.go("powerPm")')
 page.evaluate('''()=>{const val=(id,v)=>{const el=document.getElementById(id);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));};const cable=catalog.cables.find(c=>Number(c.dc?.loop_ohm_per_1000ft)>0);val('powerPmCable',cable.id);val('powerPmLength',0);val('powerPmCurrent',0);val('powerPmSupply',90);val('powerPmTemp',68);val('powerPmAlpha',0);val('powerPmName','PRACTICE 1001');val('powerPmDate','2026-11-12');for(let i=0;i<1001;i++)document.getElementById('powerPmAddSpan').click();document.getElementById('powerPmSave').click();}''')
 before=page.evaluate('JSON.parse(localStorage.getItem(PowerPM.KEY))');assert len(before['supplies'][0]['visits'][0]['spans'])==1001
 with page.expect_download() as d:page.locator('#powerPmExport').click()
 path='/tmp/review40-1001.json';d.value.save_as(path);size=len(open(path,'rb').read());page.evaluate('localStorage.removeItem(PowerPM.KEY)')
 with page.expect_file_chooser() as f:page.locator('#powerPmImport').click()
 f.value.set_files(path);page.wait_for_function('document.querySelector("#powerPmStatus").textContent.includes("Nothing was imported")');status=page.locator('#powerPmStatus').inner_text();assert page.evaluate('localStorage.getItem(PowerPM.KEY)') is None
 print(f'1001 actual Add span clicks saved; own downloaded export {size} bytes; import refused: {status}')
 b.close()
