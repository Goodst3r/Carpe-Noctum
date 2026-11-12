#!/usr/bin/env python3
"""Focused sweep-due rendering in desktop Chromium at phone widths; synthetic jobs only."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []
def check(name, value):
    assert value, name
    checks.append(name)
    print('PASS ' + name, flush=True)

# Dates and as-of are fixed together; this fixture must not change with the machine's month.
FIXTURE = '''() => {
 const dates=['2026-11-11','2025-11-11','2025-04-11'];
 for(const [i,date] of dates.entries()){
  const owner=TrainingJob.makePractice('aoi-six-active');
  owner.job.name='SYNTHETIC SWEEP '+i+' '+('Long unbroken name '.repeat(12));
  owner.stationView={selected:'r1',stations:{}};
  for(const [index,t] of StationView.targets(owner).entries()){
   const identity='layout_'+index;t.holder.stationIdentity=identity;
   owner.stationView.stations[identity]={pointId:t.key,equipmentId:t.id,bindingVersion:2,equipmentContext:t.context,swept:{done:true,date},balanced:{done:true,date:'2026-01-01'}};
  }
  loadState(owner);JobsUI.saveNamed();
 }
 state.sweepDue={intervalMonths:'18'};WorkflowUI.go('sweepDue');SweepDue.render('2026-11-11');
}'''
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('NIGHTSWEEP_CHROMIUM') or None, headless=True, args=['--no-sandbox'])
        for width in [320, 360, 390, 430]:
            context = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('dialog', lambda dialog: dialog.accept())
            page.goto(f'http://127.0.0.1:{server.server_port}/outputs/Night_Sweep.html')
            page.evaluate(FIXTURE)
            check(f'{width}px Sweep due visible as final Plan screen', page.locator('#sweepDuePanel').is_visible() and page.locator('#taskTabs [data-task]').last.get_attribute('data-task') == 'sweepDue')
            check(f'{width}px all named synthetic jobs/rows visible', page.locator('.sweep-due-job').count() == 3 and page.locator('[data-sweep-due-row]').count() == 21)
            check(f'{width}px 0/12/19 reminder words and colors', all(page.locator(f'.sweep-due-{color}').count() == 7 for color in ['green', 'yellow', 'red']) and all(text in page.locator('#sweepDueList').inner_text() for text in ['Before reminder window', 'Reminder window', 'Due / overdue']))
            check(f'{width}px separate sweep and balance labels/dates', page.locator('.sweep-due-event h4').all_text_contents().count('Last recorded sweep') == 21 and page.locator('.sweep-due-event h4').all_text_contents().count('Last recorded balance') == 21)
            check(f'{width}px practice counts and source labels explicit', 'Practice / sample reminders: 7 before window, 7 in window, 7 due / overdue' in page.locator('#sweepDueSummary').inner_text() and page.locator('#sweepDueList').inner_text().count('SYNTHETIC TRAINING') == 3)
            check(f'{width}px long names wrap without page overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'))
            check(f'{width}px interval is text with numeric keyboard and exactly one clean label', page.locator('#sweepDueInterval').evaluate('(e)=>e.type==="text" && e.inputMode==="numeric" && e.labels.length===1 && e.labels[0].textContent==="Sweep reminder interval (whole calendar months)"'))
            check(f'{width}px source buttons are outside labels', page.locator('#sweepDuePanel label [data-threshold]').count() == 0)
            check(f'{width}px visible controls have 44px tap targets', page.locator('#sweepDuePanel button,#sweepDuePanel input,#sweepDuePanel summary').evaluate_all('(els)=>els.filter(e=>e.getBoundingClientRect().width).every(e=>e.getBoundingClientRect().height>=44 && e.getBoundingClientRect().width>=44)'))
            page.locator('label[for="sweepDueInterval"]').click()
            check(f'{width}px tapping interval label focuses without opening source', page.locator('#sweepDueInterval').evaluate('(e)=>document.activeElement===e') and page.locator('dialog.source-sheet[open]').count() == 0)
            page.locator('#sweepDueInterval').fill('18x')
            check(f'{width}px malformed input remains focused/visible with nearby error', page.locator('#sweepDueInterval').input_value() == '18x' and page.locator('#sweepDueInterval').evaluate('(e)=>document.activeElement===e') and 'Interval invalid' in page.locator('#sweepDueIntervalStatus').inner_text() and page.locator('.sweep-due-green,.sweep-due-yellow,.sweep-due-red').count() == 0)
            page.locator('#sweepDueInterval').fill('')
            check(f'{width}px clearing returns to unknown without rewriting Station dates', 'Interval unknown' in page.locator('#sweepDueIntervalStatus').inner_text() and page.evaluate('state.stationView.stations.layout_1.swept.date') == '2025-04-11')
            page.locator('#sweepDuePanel [data-threshold="company.sweepDue.intervalMonths"]').click()
            check(f'{width}px source sheet opens with correct edit destination', page.locator('dialog.source-sheet[open]').count() == 1 and page.locator('dialog [data-task="sweepDue"]').count() == 1)
            page.locator('dialog button[data-source-close]').last.click()
            check(f'{width}px closing source restores source-button focus', page.locator('#sweepDuePanel [data-threshold="company.sweepDue.intervalMonths"]').evaluate('(e)=>document.activeElement===e'))
            page.evaluate('JobsUI.snapshots=()=>{throw Error("Synthetic unreadable library")};SweepDue.render("2026-11-11")')
            check(f'{width}px unreadable library preserves current and visible error', 'Saved jobs unavailable' in page.locator('#sweepDueDiagnostics').inner_text() and page.locator('[data-sweep-due-row]').count() == 7)
            page.evaluate('state.stationView.stations.layout_1.swept.date="2020-01-01"')
            page.locator('#sweepDueRefresh').click()
            check(f'{width}px Refresh reads actual changed Station record', '2020-01-01' in page.locator('#sweepDueList').inner_text())
            page.evaluate('JobsUI.snapshots=()=>Array.from({length:8},(_,i)=>({...state,job:{...state.job,id:"job_layout_"+i}}));SweepDue.render("2026-11-11")')
            check(f'{width}px full counts with bounded first page', page.locator('[data-sweep-due-row]').count() == 25 and '63 stations' in page.locator('#sweepDueSummary').inner_text() and 'Page 1 of 3' in page.locator('#sweepDuePagination').inner_text())
            page.locator('[data-sweep-due-page="next"]').click()
            check(f'{width}px next page navigates bounded cards without overflow', page.locator('[data-sweep-due-row]').count() == 25 and 'Page 2 of 3' in page.locator('#sweepDuePagination').inner_text() and page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'))
            # Use browser-generated Enter events: replacing the focused navigation button
            # used to leave focus on BODY and subsequent Tab traversal at the page bottom.
            page.locator('#sweepDueInterval').fill('0018')
            check(f'{width}px interval editing retains its focus with multiple pages', page.locator('#sweepDueInterval').evaluate('(e)=>document.activeElement===e') and page.evaluate('state.sweepDue.intervalMonths') == '0018')
            page.evaluate('SweepDue.render("2026-11-11")')
            before_navigation = page.evaluate('JSON.stringify([state,localStorage.getItem(JobsUI.storeKey),localStorage.getItem("hfc-route-v1")])')
            for direction, expected_page, expected_rows in [('next', 2, 25), ('next', 3, 13), ('previous', 2, 25), ('previous', 1, 25)]:
                page.locator(f'[data-sweep-due-page="{direction}"]').focus()
                page.keyboard.press('Enter')
                active = page.evaluate('document.activeElement.id || document.activeElement.tagName')
                check(f'{width}px keyboard {direction} to page {expected_page} focuses page context (actual {active})', active == 'sweepDuePageSummary')
                check(f'{width}px keyboard page {expected_page} starts with visible summary and bounded records', page.locator('#sweepDuePageSummary').inner_text().startswith(f'Page {expected_page} of 3') and page.locator('#sweepDuePageSummary').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.top>=0 && r.bottom<innerHeight;}') and page.locator('[data-sweep-due-row]').count() == expected_rows)
                if expected_page == 3:
                    check(f'{width}px last page disables Next and permits Previous', page.locator('[data-sweep-due-page="next"]').is_disabled() and page.locator('[data-sweep-due-page="previous"]').is_enabled())
                if expected_page == 1:
                    check(f'{width}px first page disables Previous and permits Next', page.locator('[data-sweep-due-page="previous"]').is_disabled() and page.locator('[data-sweep-due-page="next"]').is_enabled())
            check(f'{width}px keyboard pagination preserves interval, work dates and stored jobs', page.evaluate('JSON.stringify([state,localStorage.getItem(JobsUI.storeKey),localStorage.getItem("hfc-route-v1")])') == before_navigation and page.locator('#sweepDueInterval').input_value() == '0018')
            # Historical cards retain exact recorded work facts, without current-service wording.
            for mode in ['legacy', 'ubt']:
                for date, age in [('2024-01-01', 34), ('2025-11-11', 12), ('2026-08-01', 3)]:
                    page.evaluate('''({mode,date}) => {
                      const owner=TrainingJob.makePractice('aoi-six-active');owner.job.id='job_native_history';
                      if(mode==='ubt')owner.rows[0].device='active_gm_ubt_main';
                      const t=StationView.targets(owner).find(t=>t.key==='r1');t.holder.stationIdentity='native_historical';
                      owner.sweepDue={intervalMonths:'18'};owner.stationView={selected:'r1',stations:{native_historical:{pointId:'r1',equipmentId:t.id,...(mode==='ubt'?{bindingVersion:2,equipmentContext:t.context}:{}),swept:{done:true,date},balanced:{done:true,date:'2026-01-01'}}}};
                      loadState(owner);JobsUI.snapshots=()=>[];WorkflowUI.go('sweepDue');SweepDue.render('2026-11-11');
                      window.__sweepHistoryBefore=JSON.stringify([state,localStorage.getItem('hfc-route-v1'),localStorage.getItem(JobsUI.storeKey)]);
                    }''', {'mode': mode, 'date': date})
                    historical = page.evaluate('''() => {
                      const r=SweepDue.readView('2026-11-11').groups[0].rows.find(r=>r.pointId==='r1'),card=[...document.querySelectorAll('[data-sweep-due-row]')].find(e=>e.textContent.includes('Route point r1 ·'));
                      return {row:r,text:card.textContent,noWrites:window.__sweepHistoryBefore===JSON.stringify([state,localStorage.getItem('hfc-route-v1'),localStorage.getItem(JobsUI.storeKey)])};
                    }''')
                    text, row = historical['text'], historical['row']
                    check(f'{width}px {mode} {date} historical card has neutral facts without current reminder words', 'Reminder unavailable' in text and date in text and f'{age} completed calendar months old' in text and 'Sweep recorded' in text and not any(word.lower() in text.lower() for word in ['Due / overdue', 'Reminder window', 'Before reminder window']) and ('binding unconfirmed' if mode == 'legacy' else 'Read-only historical') in text)
                    check(f'{width}px {mode} {date} retains done/date/validity/age with no job or stored-data write', historical['noWrites'] and row['sweep']['done'] and row['sweep']['date'] == date and row['sweep']['validity'] == 'Valid civil date' and row['sweep']['age'] == age and row['sweep']['status'] == 'neutral' and row['sweep']['warning'] is None and row['sweep']['due'] is None)
            page.evaluate('''() => {loadState({version:1,setup:{...defaultSetup,sourceType:'manual'},rows:[]});WorkflowUI.go('sweepDue');}''')
            check(f'{width}px empty state explains that interval belongs to open job without creating preference', 'interval belongs to the open job' in page.locator('#sweepDueList').inner_text().lower() and page.evaluate('state.sweepDue===undefined'))
            before_quota = page.evaluate('localStorage.getItem("hfc-route-v1")')
            page.evaluate('''() => {window.__sweepPeerStorage=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='hfc-route-v1')throw Error('Synthetic autosave failure');return window.__sweepPeerStorage.call(this,key,value);};}''')
            page.locator('#sweepDueInterval').fill('25')
            page.locator('#sweepDueInterval').evaluate('(e)=>e.scrollIntoView({block:"center"})')
            warning = page.locator('#sweepDueSaveStatus')
            check(f'{width}px unsaved interval warning is named, linked and directly next to input', warning.evaluate('(e)=>{const input=document.getElementById("sweepDueInterval"),r=e.getBoundingClientRect();return input.nextElementSibling===e&&input.getAttribute("aria-describedby").split(/\s+/).includes(e.id)&&e.closest(".sweep-due-setting")===input.closest(".sweep-due-setting")&&e.classList.contains("warning")&&r.top>=0&&r.bottom<=innerHeight;}') and 'Not saved' in warning.inner_text() and 'Autosave failed' in warning.inner_text() and 'Export a project backup' in warning.inner_text())
            check(f'{width}px failed autosave keeps raw interval in memory and prior stored bytes exact', page.evaluate('state.sweepDue.intervalMonths') == '25' and page.evaluate('localStorage.getItem("hfc-route-v1")') == before_quota)
            page.locator('#sweepDueRefresh').click()
            check(f'{width}px same-owner refresh retains unsaved warning', 'Not saved' in warning.inner_text())
            page.evaluate('''() => {Storage.prototype.setItem=window.__sweepPeerStorage;loadState({version:1,setup:{...defaultSetup,sourceType:'manual'},rows:[],sweepDue:{intervalMonths:'25'}});WorkflowUI.go('sweepDue');}''')
            check(f'{width}px a different job does not inherit old interval save feedback', warning.inner_text() == '')
            context.close()
        check('No browser page errors', not errors)
        browser.close()
finally:
    server.shutdown()
    server.server_close()
print(f'Build3 sweep due layout: {len(checks)} checks passed')
