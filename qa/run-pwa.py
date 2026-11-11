#!/usr/bin/env python3
"""Build and validate the NightSweep PWA, offline updates and retained engineering workflows."""
from pathlib import Path
import hashlib,json,os,re,subprocess
root=Path(__file__).resolve().parent.parent
subprocess.run(['python3','night-sweep/build.py'],cwd=root,check=True,stdout=subprocess.DEVNULL)
subprocess.run(['python3','build-pwa.py'],cwd=root,check=True,stdout=subprocess.DEVNULL)
def snapshot():
    files=[*sorted((root/'dist').rglob('*')),root/'outputs/Night_Sweep.html']
    return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files if p.is_file()}
tested_build=snapshot()
logs=root/'qa/pwa-testlogs';logs.mkdir(exist_ok=True)
suites=[
 ('Build 3 threshold and source registry','build3-registry.test.cjs',r'Build3 registry: (\d+) checks passed'),
 ('Build 3 field calculators against independent references','build3-field-calcs.test.cjs',r'Build3 field calculators: (\d+) checks passed'),
 ('Build 3 tilt, EQ and pad solver against the recalculated spreadsheet','build3-alignment.test.cjs',r'Build3 alignment: (\d+) checks passed'),
 ('Build 3 DOCSIS health card against independent decimal references','build3-docsis-health.test.cjs',r'Build3 DOCSIS health: (\d+) checks passed'),
 ('Build 3 leakage tools against independent decimal references','build3-leakage.test.cjs',r'Build3 leakage: (\d+) checks passed'),
 ('2.0 Alpha design changes','v20-design.test.cjs',r'2\.0 design: (\d+) checks passed'),
 ('Build 2 TDR active-boundary regressions','build2-tdr-boundaries.test.cjs',r'Build2 TDR boundaries: (\d+) checks passed'),
 ('Build 2 RF and records property backtests','build2-rf-properties.test.cjs',r'Build2 RF properties: (\d+) checks passed'),
 ('Build 2 all seven examples frequency replay','build2-example-math.test.cjs',r'Build2 example math: (\d+) checks passed'),
 ('Build 2 power circuits and current-curve backtests','build2-power.test.cjs',r'Build2 power backtest: (\d+) checks passed'),
 ('Build 2 imported DSIM calendar dates','build2-dsim-dates.test.cjs',r'Build2 DSIM dates: (\d+) checks passed'),
 ('Build 2 calculation reuse and import boundaries','build2-frontend.test.cjs',r'Build2 frontend: (\d+) checks passed'),
 ('Build 2 rendered cascade and lazy-chart layout','build2-layout.test.py',r'Build2 layout: (\d+) checks passed'),
 ('Build 2 original-byte limits and atomic job operations','build2-reliability.test.cjs',r'(?:# tests|ℹ tests) (\d+)'),
 ('Build 2 native filename and print lifecycle','android-native-edge.test.py',r'Android native edges: (\d+) checks passed'),
 ('1.8 profile acceptance guards','alpha18-math.test.cjs',r'Alpha18 math: (\d+) checks passed'),
 ('1.8 independent arithmetic and curve integrity','alpha18-numeric.test.cjs',r'Alpha18 numeric audit: (\d+) checks passed'),
 ('1.8 corrected GS7K GaN complete practice independent math','complete-workflow-math.test.cjs',r'Complete workflow math: (\d+) checks passed'),
 ('1.8 release identity and documentation','alpha18-release.test.py',r'Alpha18 release: (\d+) checks passed'),
 ('Android source identity and rejected artifact isolation','android-preview.test.py',r'Android preview: (\d+) checks passed'),
 ('1.8 imported route and power ID boundaries','import-id-boundaries.test.cjs',r'Import ID boundaries: (\d+) checks passed'),
 ('1.8 seven practice exercises and seeded feature coverage','training-library.test.cjs',r'(?:# tests|ℹ tests) (\d+)'),
 ('1.6 to current release migration and portable example','upgrade01617.test.cjs',r'1\.6 to 1\.7 migration: (\d+) checks passed'),
 ('1.7 stable workflow rendering','alpha17-render.test.cjs',r'Render stability 1\.7: (\d+) checks passed'),
 ('1.7 source and equipment reports','alpha17-report.test.cjs',r'(\d+) report flow checks passed; 0 failed'),
 ('1.7 launch source workflow','launch-source.test.cjs',r'Launch source 1\.7: (\d+) checks passed'),
 ('1.7 equipment setup and DSIM','equipment-setup.test.cjs',r'Equipment setup: (\d+) checks passed'),
 ('1.7 local operator targets and available carriers','local-operator-preset.test.cjs',r'Local operator preset: (\d+) checks passed'),
 ('1.7 DSIM historical pilot-code lookup','dsim-pilot-codes.test.cjs',r'DSIM pilot codes: (\d+) checks passed'),
 ('1.7 separate installed gain-control paths','equipment-control.test.cjs',r'Equipment control paths: (\d+) checks passed'),
 ('1.7 current node setup references','node-setup-refresh.test.cjs',r'Node setup refresh: (\d+) checks passed; 0 failed'),
 ('1.7 retired UBT compatibility','retired-equipment.test.cjs',r'Retired equipment: (\d+) checks passed'),
 ('1.7 fresh independent numerical references','../night-sweep/research/alpha17-fresh-reference-check.cjs',r'Fresh Wolfram reference comparisons: (\d+) passed'),
 ('1.7 RF band and hidden view regressions','alpha17-engine.test.cjs',r'(\d+) Alpha flow engine checks passed; 0 failed'),
 ('1.7 evidence job context','evidence-context.test.cjs',r'(\d+) evidence context checks passed; 0 failed'),
 ('Wolfram record and measurement guards','wolfram-records.test.cjs',r'Wolfram records: (\d+) checks passed'),
 ('Wolfram RF, distance and sweep references','wolfram-rf.test.cjs',r'Wolfram RF audit: (\d+) grouped checks'),
 ('Wolfram power references and edge cases','wolfram-power.test.cjs',r'Wolfram power: (\d+) checks passed'),
 ('Guided sweep setup and 1.5 migration','sweep-setup.test.cjs',r'Sweep setup 1\.6: (\d+) checks passed'),
 ('Equipment reference catalog','equipment-reference.test.cjs',r'Equipment references: (\d+) checks passed'),
 ('PWA package and service worker','pwa-worker.test.cjs',r'PWA worker: (\d+) checks passed'),
 ('PWA install and update interface','pwa-client.test.cjs',r'PWA client: (\d+) checks passed'),
 ('Browser file export and sharing','browser-files.test.cjs',r'Browser files: (\d+) checks passed'),
 ('Guided training job and preserved work','training-job.test.cjs',r'Training job: (\d+) checks passed'),
 ('Production training buttons and fleet split','training-controls.test.cjs',r'(?:# tests|ℹ tests) (\d+)'),
 ('RF and power engine','engine.test.js',r'(\d+) engine checks passed'),
 ('Route distances, TDR and gain budgets','route14.test.cjs',r'(\d+) route/active/TDR checks passed'),
 ('Project records and acceptance','projects.test.js',r'Projects QA: (\d+) tests passed'),
 ('Frequency calculations','frequency-regression.cjs',r'Frequency regression: (\d+) assertions passed'),
 ('Retained interface behavior','dom-tests.cjs',r'DOM checks passed: (\d+)'),
 ('Active and TDR interface calculations','alpha14-ui.test.cjs',r'Alpha 1\.4 UI: (\d+) checks passed'),
 ('Technician task navigation and live controls','alpha15-ui.test.cjs',r'Alpha 1\.5 workflow UI: (\d+) checks passed'),
 ('Node profiles and current curves','nodes.test.cjs',r'Node QA: (\d+) tests passed'),
 ('Evidence parser and validation','evidence.test.cjs',r'Evidence core QA: (\d+) tests passed'),
 ('Evidence UI and storage','evidence-ui.test.cjs',r'Evidence UI/storage checks passed: (\d+)'),
 ('IndexedDB failure and commit boundaries','evidence-storage-failures.test.cjs',r'(?:# tests|ℹ tests) (\d+)'),
 ('Named jobs corruption and capacity','named-jobs-storage.test.cjs',r'Named jobs storage: (\d+) checks passed'),
 ('Legacy upgrade and portable backup','alpha011-integration.cjs',r'Alpha 0\.11 integration: (\d+) checks passed'),
 ('Retained field tools and named jobs','alpha012.test.cjs',r'Alpha 0.12 field checks passed: (\d+)'),
 ('0.13 APK backup migration','upgrade01314.test.cjs',r'0\.13 to 1\.5 upgrade: (\d+) checks passed'),
 ('1.4 backup and active/TDR migration','upgrade01415.test.cjs',r'1\.4 to 1\.5 upgrade: (\d+) checks passed'),
 ('Training, guide and app text names real screens and buttons','ui-names.test.cjs',r'UI names: (\d+) checks passed'),
 ('Built-in reference calculations','../night-sweep/selfcheck.js',None),
 ('Catalog structure','catalog-audit.cjs',None),
]
results=[]
for name,script,pattern in suites:
    command=['python3' if script.endswith('.py') else 'node','qa/'+script]
    try:
        proc=subprocess.run(command,cwd=root,text=True,capture_output=True,timeout=150,env={**os.environ,'NIGHTSWEEP_RELEASE_TEST':'1'})
        output=proc.stdout+proc.stderr;passed=proc.returncode==0
    except subprocess.TimeoutExpired as exc:
        output='TIMEOUT after 150s\n'+str(exc.stdout or '')+str(exc.stderr or '');passed=False
    match=re.search(pattern,output) if pattern else None
    if pattern and not match:passed=False;output+='\nExpected suite completion/check count was missing.'
    count=int(match.group(1)) if match and passed else 0
    if pattern and passed and count<1:passed=False;output+='\nSuite ran no checks.'
    if script=='../night-sweep/selfcheck.js' and passed:count=len(re.findall(r'^PASS ',output,re.M))
    (logs/(Path(script).name+'.txt')).write_text(output)
    result={'name':name,'script':script,'passed':passed,'checks':count};results.append(result)
    print(name+': '+('PASS' if passed else 'FAIL')+' ('+str(count)+' checks)',flush=True)
    if not passed:print(output,flush=True)
release=json.loads((root/'dist/release.json').read_text())
unchanged=tested_build==snapshot()
report={'release':release['version'],'version':release['appVersion'],'suites':results,'checks':sum(x['checks'] for x in results),'all_passed':all(x['passed'] for x in results) and unchanged,'build_unchanged_during_tests':unchanged,'html_sha256':hashlib.sha256((root/'dist/index.html').read_bytes()).hexdigest(),'standalone_sha256':hashlib.sha256((root/'outputs/Night_Sweep.html').read_bytes()).hexdigest(),'worker_sha256':hashlib.sha256((root/'dist'/release['worker']).read_bytes()).hexdigest(),'scope':'Synthetic calculations, real version-source migration, DOM interactions, simulated service-worker lifecycle/network/cache, and browser export contracts. No physical iPhone/Safari/offline-device or rendered browser layout claim.'}
if not unchanged:print('FAIL: Generated build changed during testing. Rerun against a frozen build.',flush=True)
(root/'qa/pwa-test-results.json').write_text(json.dumps(report,indent=2)+'\n')
raise SystemExit(0 if report['all_passed'] else 1)
