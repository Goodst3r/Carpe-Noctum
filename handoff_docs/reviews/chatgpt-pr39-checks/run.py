#!/usr/bin/env python3
"""Run real cascade reference/guard checks without writing inside the app or bundle."""
import argparse,json,subprocess,tempfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('app_root',type=Path);p.add_argument('--expected-head',required=True);p.add_argument('--output',type=Path);a=p.parse_args();root=a.app_root.resolve();here=Path(__file__).resolve().parent;out=a.output.resolve() if a.output else Path(tempfile.mkdtemp(prefix='cn-pr39-math-'))
out.mkdir(parents=True,exist_ok=True)
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
if head!=a.expected_head:raise SystemExit('Expected head mismatch: '+head)
if subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True):raise SystemExit('App worktree is dirty')
commands=[['node',str(here/'run_real_cascade.cjs'),str(root),str(out)],['python3',str(here/'annotate_semantic_reviews.py'),str(out)],['python3',str(here/'validate_future_results.py'),str(out/'actual-results.json'),str(root/'handoff_docs/reviews/chatgpt-calculator-test-vectors.json')],['node',str(here/'check_real_guards.cjs'),str(root),str(out)]]
receipt={'head':head,'output':str(out),'commands':[]}
for n,cmd in enumerate(commands):
 log=out/f'run-{n}.log'
 with log.open('w') as f:r=subprocess.run(cmd,cwd=root,text=True,stdout=f,stderr=subprocess.STDOUT)
 row={'command':cmd,'exit':r.returncode,'log':str(log)};receipt['commands'].append(row);print(json.dumps(row),flush=True)
 if r.returncode:
  print(log.read_text()[-12000:],flush=True);break
receipt['head_after']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();receipt['status_after']=subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True);(out/'run-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print('Receipt '+str(out/'run-receipt.json'),flush=True)
raise SystemExit(r.returncode or int(receipt['head_after']!=head or bool(receipt['status_after'])))
