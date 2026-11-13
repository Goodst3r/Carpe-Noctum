#!/usr/bin/env python3
"""Build the offline 2.0 Alpha build 3 app with technician task navigation."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parent
subprocess.run(['node',str(root/'selfcheck.js')],check=True,stdout=subprocess.DEVNULL)
shell=(root/'shell.html').read_text()
# One module per line, in splice order. To add a module, put its placeholder in
# shell.html and add one line below (placeholder, then file name). Keep sample
# entries out of comments: some tests read this file with a pattern match.
MODULES = [
    ('<!--STYLE-->', 'style.css'),
    ('<!--SWEEPSTYLE-->', 'sweep-setup.css'),
    ('<!--SWEEPGUIDE-->', 'sweep-guide.js'),
    ('<!--SWEEPSETUP-->', 'sweep-setup.js'),
    ('<!--CATALOG-->', 'catalog.json'),
    ('<!--ENGINE-->', 'engine.js'),
    ('<!--PROJECTS-->', 'projects.js'),
    ('<!--COMPANYTARGETS-->', 'company-targets.js'),
    ('<!--GAINMAKEREQ-->', 'gainmaker-eq.js'),
    ('<!--FREQUENCY-->', 'frequency.js'),
    ('<!--EVIDENCE-->', 'evidence.js'),
    ('<!--BROWSERFILES-->', 'browser-files.js'),
    ('<!--EVIDENCEUI-->', 'evidence-ui.js'),
    ('<!--NODES-->', 'nodes.js'),
    ('<!--FIELDWORK-->', 'field-work.js'),
    ('<!--FIELDREFERENCE-->', 'field-reference.js'),
    ('<!--LAUNCHSOURCE-->', 'launch-source.js'),
    ('<!--EQUIPMENTSETUP-->', 'equipment-setup.js'),
    ('<!--APP-->', 'app.js'),
    ('<!--SELFCHECK-->', 'selfcheck.js'),
    ('<!--METERS-->', 'meter.js'),
    ('<!--ROUTETOOLS-->', 'route-tools.js'),
    ('<!--JOBS-->', 'jobs.js'),
    ('<!--FIELDREPORT-->', 'field-report.js'),
    ('<!--WORKFLOW-->', 'workflow.js'),
    ('<!--TRAINING-->', 'training.js'),
    ('<!--THRESHOLDS-->', 'thresholds.js'),
    ('<!--ALIGNMENT-->', 'alignment.js'),
    ('<!--FIELDCALCS-->', 'field-calcs.js'),
    ('<!--DOCSISHEALTH-->', 'docsis-health.js'),
    ('<!--LEAKAGE-->', 'leakage.js'),
    ('<!--CHECKLIST-->', 'checklist.js'),
    ('<!--OUTAGE-->', 'outage.js'),
    ('<!--IMPAIRMENTS-->', 'impairments.js'),
    ('<!--FIBERTOOLS-->', 'fiber-tools.js'),
    ('<!--HIGHSPLIT-->', 'highsplit.js'),
    ('<!--WHYCARDS-->', 'why-cards.js'),
    ('<!--POP-->', 'proof-of-performance.js'),
    ('<!--STUDY-->', 'study-mode.js'),
    ('<!--POWERPM-->', 'power-pm.js'),
    ('<!--STATION-->', 'station.js'),
    ('<!--STATIONSTYLE-->', 'station.css'),
    ('<!--NIGHTLOG-->', 'night-log.js'),
    ('<!--NIGHTLOGSTYLE-->', 'night-log.css'),
    ('<!--SWEEPDUE-->', 'sweep-due.js'),
    ('<!--SWEEPDUESTYLE-->', 'sweep-due.css'),
    ('<!--EVIDENCEARCHIVE-->', 'evidence-archive.js'),
    ('<!--SWEEPGRADING-->', 'sweep-grading.js'),
    ('<!--SWEEPGRADINGUI-->', 'sweep-grading-ui.js'),
]
for token,name in MODULES:
    if token not in shell:raise ValueError(f'Missing build token {token}')
    data=(root/name).read_text()
    if name=='catalog.json' and (root/'setup-manuals.json').exists():
        import json
        cat=json.loads(data);cat['setupManuals']=json.loads((root/'setup-manuals.json').read_text());data=json.dumps(cat,separators=(',',':'),ensure_ascii=False)
    shell=shell.replace(token,data)
shell=shell.replace('<!--DSIMPILOTCODES-->',(root/'dsim-pilot-codes.js').read_text())
out=root.parent/'outputs'/'Night_Sweep.html'
out.parent.mkdir(exist_ok=True)
out.write_text(shell)
print(out)
