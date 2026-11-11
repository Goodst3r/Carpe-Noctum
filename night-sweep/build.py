#!/usr/bin/env python3
"""Build the offline 2.0 Alpha build 1 app with technician task navigation."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parent
subprocess.run(['node',str(root/'selfcheck.js')],check=True,stdout=subprocess.DEVNULL)
shell=(root/'shell.html').read_text()
for token,name in [('<!--STYLE-->', 'style.css'), ('<!--SWEEPSTYLE-->', 'sweep-setup.css'), ('<!--SWEEPGUIDE-->', 'sweep-guide.js'), ('<!--SWEEPSETUP-->', 'sweep-setup.js'), ('<!--CATALOG-->', 'catalog.json'), ('<!--ENGINE-->', 'engine.js'), ('<!--PROJECTS-->', 'projects.js'), ('<!--FREQUENCY-->', 'frequency.js'), ('<!--EVIDENCE-->', 'evidence.js'), ('<!--BROWSERFILES-->', 'browser-files.js'), ('<!--EVIDENCEUI-->', 'evidence-ui.js'), ('<!--NODES-->', 'nodes.js'), ('<!--FIELDWORK-->', 'field-work.js'), ('<!--FIELDREFERENCE-->', 'field-reference.js'), ('<!--LAUNCHSOURCE-->', 'launch-source.js'), ('<!--EQUIPMENTSETUP-->', 'equipment-setup.js'), ('<!--APP-->', 'app.js'), ('<!--SELFCHECK-->', 'selfcheck.js'), ('<!--METERS-->', 'meter.js'), ('<!--ROUTETOOLS-->', 'route-tools.js'), ('<!--JOBS-->', 'jobs.js'), ('<!--FIELDREPORT-->', 'field-report.js'), ('<!--WORKFLOW-->', 'workflow.js'), ('<!--TRAINING-->', 'training.js')]:
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
