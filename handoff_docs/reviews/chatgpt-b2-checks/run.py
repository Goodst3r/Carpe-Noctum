#!/usr/bin/env python3
"""Run the preserved B2 coauthor checks in a separate temporary output directory.

Only reads the selected app root. No install, build, generic gate, git mutation,
generated app/evidence write or upstream action is performed.
"""
import argparse,datetime,hashlib,json,os,pathlib,shutil,subprocess,sys,tempfile

HERE=pathlib.Path(__file__).resolve().parent
FILES=['independent_reference.py','real_functions.cjs','validate_results.py',
       'native_ui.py','length_boundary.cjs','raw-cases.json','own-cases.json',
       'independent-references.json','provenance.json']

def git(root,*args):
 return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()

def within(path,parent):
 try:path.relative_to(parent);return True
 except ValueError:return False

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('root',type=pathlib.Path,help='Existing Carpe Noctum app checkout/worktree')
 p.add_argument('--expected-head',help='Require this exact full commit before/after checks')
 p.add_argument('--chromium',help='Existing Chromium executable; defaults to NIGHTSWEEP_CHROMIUM or PATH')
 p.add_argument('--output-dir',type=pathlib.Path,help='Empty output directory outside app and report worktrees; default is a new system temp directory')
 args=p.parse_args();root=args.root.resolve();report_root=HERE.parents[2]
 head=git(root,'rev-parse','HEAD');status=git(root,'status','--porcelain')
 if args.expected_head and head!=args.expected_head:p.error('app HEAD differs from --expected-head')
 if status:p.error('app worktree must start clean; this runner never resets files')
 report_head=git(report_root,'rev-parse','HEAD');report_status=git(report_root,'status','--porcelain')
 out=args.output_dir.resolve() if args.output_dir else pathlib.Path(tempfile.mkdtemp(prefix='cn-b2-coauthor-'))
 if within(out,root) or within(out,report_root):p.error('output directory must be outside app and report worktrees')
 if args.output_dir:
  if out.exists() and any(out.iterdir()):p.error('--output-dir must be empty')
  out.mkdir(parents=True,exist_ok=True)
 provenance=json.loads((HERE/'provenance.json').read_text())
 for file,key in [('raw-cases.json','raw_cases_sha256'),('own-cases.json','own_cases_sha256'),('independent-references.json','independent_references_sha256')]:
  if hashlib.sha256((HERE/file).read_bytes()).hexdigest()!=provenance[key]:p.error('preserved data hash mismatch: '+file)
 supplied=json.loads((root/provenance['source_vectors_relative_path']).read_text())['calculators']['headroom']
 raw=[{k:c[k] for k in provenance['raw_case_fields'] if k in c} for group in supplied.values() for c in group]
 if raw!=json.loads((HERE/'raw-cases.json').read_text()):p.error('selected app raw H/HX/HR cases differ from the reviewed frozen inputs')
 for name in FILES:shutil.copyfile(HERE/name,out/name)
 env=os.environ.copy()
 if args.chromium:env['NIGHTSWEEP_CHROMIUM']=str(pathlib.Path(args.chromium).resolve())
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();steps=[]
 commands=[
  ('reference',[sys.executable,str(out/'independent_reference.py')]),
  ('real-functions',['node',str(out/'real_functions.cjs'),str(root)]),
  ('numerical-validation',[sys.executable,str(out/'validate_results.py')]),
  ('native-ui',[sys.executable,str(out/'native_ui.py'),str(root)]),
  ('length-policy',['node',str(out/'length_boundary.cjs'),str(root)])]
 code=0
 try:
  for name,command in commands:
   result=subprocess.run(command,cwd=out,env=env,text=True,capture_output=True)
   (out/(name+'.log')).write_text(result.stdout+result.stderr)
   steps.append({'name':name,'command':command,'exit':result.returncode})
   print(name+': exit '+str(result.returncode),flush=True)
   if result.stdout:print(result.stdout.rstrip(),flush=True)
   if result.returncode:
    if result.stderr:print(result.stderr,file=sys.stderr)
    code=result.returncode if result.returncode>0 else 1;break
   if name=='reference' and hashlib.sha256((out/'independent-references.json').read_bytes()).hexdigest()!=provenance['independent_references_sha256']:
    raise RuntimeError('regenerated independent references differ from the preserved exact data')
  if not code:
   numeric=json.loads((out/'validation.json').read_text());native=json.loads((out/'native-ui-results.json').read_text());length=json.loads((out/'length-boundary-results.json').read_text())
   actual={'real_function':numeric['checks'],'native_ui':len(native['checks']),'length_policy':length['checks']}
   if actual!=provenance['expected_checks'] or numeric['failures'] or native['failed'] or length['failures']:raise RuntimeError('preserved check counts or failure results differ')
 except Exception as error:
  print(str(error),file=sys.stderr);code=1
 finally:
  final_head=git(root,'rev-parse','HEAD');final_status=git(root,'status','--porcelain')
  final_report_head=git(report_root,'rev-parse','HEAD');final_report_status=git(report_root,'status','--porcelain')
  unchanged=final_head==head and final_status==status and final_report_head==report_head and final_report_status==report_status
  if not unchanged:print('HEAD or tracked/untracked worktree status changed during run; inspect the receipt.',file=sys.stderr);code=1
  receipt={'started_utc':started,'finished_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'app_root':str(root),'head_before':head,'head_after':final_head,'app_status_before':status,'app_status_after':final_status,
    'report_head_before':report_head,'report_head_after':final_report_head,'report_status_before':report_status,'report_status_after':final_report_status,
    'worktrees_unchanged':unchanged,'output_directory':str(out),'steps':steps,'exit':code,
    'expected_checks':provenance['expected_checks'],'reference_sha256':provenance['independent_references_sha256'],
    'scope':'Supplemental coauthor checks; not Grok review, author full gate, hosted QA or physical-device evidence'}
  (out/'run-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print('Results: '+str(out),flush=True)
 return code

if __name__=='__main__':sys.exit(main())
