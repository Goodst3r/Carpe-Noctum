#!/usr/bin/env python3
"""Replay the 27 exact-b34 document checks; requires git and pdftotext."""
from pathlib import Path
import argparse,re,subprocess,hashlib,json
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('app_root',type=Path)
p.add_argument('--receipt',type=Path)
args=p.parse_args()
root=args.app_root.resolve()
expected='b34b1db60571e758947ca5b592e14aeaf7f38d73'
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,encoding='utf-8').strip()
assert head==expected,head
checks=0
receipts={}
def ck(value,msg):
 global checks
 assert value,msg
 checks+=1
expected_screens={
'Home':['Home','Outage'],
'Plan':['Details','Setup','Cable route','Amp gain','Amp / node setup','Predicted levels','Load','What-if','Supply PM','Sweep due'],
'Field':['Meter setup','Station','Readings','TDR','ONX files','Leakage','Checklists','Night log'],
'Tools':['Calculators','Frequency','Limits','References','Catalog','DOCSIS health','Impairments','Fiber','High split','Why cards','Proof of performance','Study'],
'Closeout':['Acceptance','Run sheet']}
main=root/'docs/NightSweep_1.8_Alpha_README.md'
ck('The five main tabs are **Home, Plan, Field, Tools, and Closeout**.' in main.read_text(encoding='utf-8'),'MD main map')
for f in ['docs/NightSweep_1.8_Alpha_README.html','dist/guide.html']:
 ck('The five main tabs are <strong>Home, Plan, Field, Tools, and Closeout</strong>.' in (root/f).read_text(encoding='utf-8'),f)
ck((root/'night-sweep/README.md').read_bytes()==main.read_bytes(),'MD mirrors')
functions=(root/'docs/NightSweep_1.8_Alpha_Functions_README.md').read_text(encoding='utf-8')
for group,items in expected_screens.items():
 match=re.search(r'^\| '+re.escape(group)+r' \| ([^|]+)\|',functions,re.M)
 ck(bool(match),group+' row')
 ck([i.strip() for i in match.group(1).split(';')]==items,group+' expected screens')
for f in ['docs/NightSweep_1.8_Alpha_Functions_README.pdf','docs/NightSweep_1.8_Alpha_Android_iOS_Installation.pdf']:
 data=(root/f).read_bytes()
 text=subprocess.check_output(['pdftotext','-layout',str(root/f),'-'],encoding='utf-8')
 ck(not re.search(r'\b(?:Route|Test|Job|Power)\s*(?:→|->)|Home, Route|Save named job|Job\s*→\s*Safety|Safety and construction',text,re.I),f+' stale paths')
 paths=['Plan → Supply PM','Tools → Calculators','Home → Outage','Field → Night log','Closeout → Run sheet'] if 'Functions' in f else ['Plan → Details','Field → ONX files','Save now']
 for path in paths:ck(path in text,path)
 receipts[f]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'new_group_arrow_occurrences':{group:len(re.findall(r'\b'+group+r'\s*→',text)) for group in expected_screens}}
for source,public in [('docs/NightSweep_1.8_Alpha_README.html','dist/guide.html'),('docs/NightSweep_1.8_Alpha_Functions_README.html','dist/functions-guide.html'),('docs/NightSweep_1.8_Alpha_Android_iOS_Installation.html','dist/phone-installation.html')]:
 transformed=(root/source).read_text(encoding='utf-8').replace('href="NightSweep_1.8_Alpha_Android_iOS_Installation.md"','href="phone-installation.html"').replace('href="NightSweep_1.8_Alpha_Functions_README.md"','href="functions-guide.html"').replace('</head>','<meta name="robots" content="noindex,nofollow"></head>',1)
 ck(transformed==(root/public).read_text(encoding='utf-8'),source+' public link/noindex transform')
result=json.dumps({'head':head,'checks_passed':checks,'pdf_receipts':receipts},indent=2)+'\n'
if args.receipt: args.receipt.write_text(result,encoding='utf-8')
print(result,end='')
