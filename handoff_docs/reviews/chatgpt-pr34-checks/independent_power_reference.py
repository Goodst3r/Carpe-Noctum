#!/usr/bin/env python3
"""Reviewer-owned Decimal oracle; no imports of author implementation/test code.

Derivation: L=10 log10(P/P0), so relative powers are 10**(L/10).
Addition sums powers; N equal carriers multiplies by N; subtraction removes
noise power before applying 10 log10. SNR is residual level minus noise level.
Direct Decimal powers/sum/difference at precision180 avoid binary app formulas.
"""
import decimal, json, pathlib, subprocess, sys, tempfile
D=decimal.Decimal
decimal.getcontext().prec=180
ROOT=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/Carpe-Noctum-pr34')
SCRIPTS=pathlib.Path(__file__).parent
OUT=pathlib.Path(sys.argv[2]) if len(sys.argv)>2 else pathlib.Path(tempfile.mkdtemp(prefix='carpe-pr34-math-'))
OUT.mkdir(parents=True,exist_ok=True)
shared=json.loads((ROOT/'handoff_docs/reviews/chatgpt-calculator-test-vectors.json').read_text())['calculators']['power_sum']
numeric=shared['worked_cases']+shared['extra_edge_cases']
refusals=shared['refusal_cases']
extra=[
 {'id':'OWN-ZERO','inputs':{'operation':'power_add','levels_dBmV':['0','0']}},
 {'id':'OWN-N1-NEG','inputs':{'operation':'equal_carriers','level_dBmV':'-2000','N':'1'}},
 {'id':'OWN-NEG','inputs':{'operation':'power_add','levels_dBmV':['-40','-47','-63']}},
 {'id':'OWN-NEAR','inputs':{'operation':'subtract_noise','total_dBmV':'0.000001','noise_dBmV':'0'}},
 {'id':'OWN-CANCEL','inputs':{'operation':'subtract_noise','total_dBmV':'10','noise_dBmV':'9.999999'}},
 {'id':'OWN-TINY','inputs':{'operation':'power_add','levels_dBmV':['0','-300']}},
 {'id':'OWN-REORDER','inputs':{'operation':'power_add','levels_dBmV':['-300','0']}},
 {'id':'OWN-MAX-COUNT','inputs':{'operation':'equal_carriers','level_dBmV':'0','N':'9007199254740991'}},
 {'id':'OWN-ENV-LOW','inputs':{'operation':'power_add','levels_dBmV':['-200','-200'],'registered_input_envelope_dBmV':['-200','200']}},
 {'id':'OWN-ENV-HIGH','inputs':{'operation':'power_add','levels_dBmV':['200','200'],'registered_input_envelope_dBmV':['-200','200']}},
 {'id':'OWN-UPPER','inputs':{'operation':'power_add','levels_dBmV':['3000','3000']}},
 {'id':'OWN-LOWER','inputs':{'operation':'power_add','levels_dBmV':['-3000','-3000']}},
]
more_refusals=[
 {'id':'OWN-UNSAFE','inputs':{'operation':'equal_carriers','level_dBmV':'0','N':'9007199254740993'},'expected_reason_text':'Count exceeds JavaScript safe-integer representation.'},
 {'id':'OWN-UNDER-ENV','inputs':{'operation':'power_add','levels_dBmV':['-200.000001','0'],'registered_input_envelope_dBmV':['-200','200']},'expected_reason_text':'Input is outside this explicitly declared software envelope; this is not an equipment rating.'},
 {'id':'OWN-OVER-ENV','inputs':{'operation':'power_add','levels_dBmV':['200.000001','0'],'registered_input_envelope_dBmV':['-200','200']},'expected_reason_text':'Input is outside this explicitly declared software envelope; this is not an equipment rating.'},
]
def oracle(inp,binary=False):
 def p(s): return D.from_float(float(s)) if binary else D(s)
 def power(s): return D(10)**(p(s)/10)
 def level(x): return D(10)*x.log10()
 op=inp['operation']
 if op=='power_add': return {'level_dBmV':level(sum((power(x) for x in inp['levels_dBmV']),D(0)))}
 if op=='equal_carriers': return {'level_dBmV':p(inp['level_dBmV'])+level(D(inp['N']))}
 t,n=inp['total_dBmV'],inp['noise_dBmV']
 signal=level(power(t)-power(n))
 return {'signal_dBmV':signal,'SNR_dB':signal-p(n)}
# Complete independent decimal results before invoking application functions.
references={c['id']:{k:str(v) for k,v in oracle(c['inputs']).items()} for c in numeric+extra}
(OUT/'decimal-reference.json').write_text(json.dumps(references,indent=2)+'\n')
cases=numeric+extra+refusals+more_refusals
(OUT/'cases.json').write_text(json.dumps(cases,indent=2)+'\n')
run=subprocess.run(['node',str(SCRIPTS/'run_real_functions.cjs'),str(ROOT),str(OUT/'cases.json')],text=True,capture_output=True)
if run.returncode: print(run.stderr);sys.exit(run.returncode)
actual=json.loads(run.stdout)
(OUT/'real-function-results.json').write_text(json.dumps(actual,indent=2)+'\n')
checks=0; failures=[]; rows=[]
for artifact,results in actual.items():
 for c in numeric+extra:
  name=c['id']; result=results[name]; expected=oracle(c['inputs']); parsed=oracle(c['inputs'],True)
  checks+=1
  if not result.get('ok'): failures.append(f'{artifact} {name}: unexpected refusal {result}');continue
  for key,want in expected.items():
   # Include independently computed decimal->binary input quantization.64eps
   # roundoff budget, scaled to output; absolute1e-13 except tiny-positive sums
   # need relative accuracy so a zero cannot pass PX09/OWN-TINY.
   quant=abs(parsed[key]-want)
   floor=abs(parsed[key])*D('1e-14') if 0<abs(parsed[key])<D('1e-12') else D('1e-13')
   bound=quant+max(floor,abs(parsed[key])*D(64)*D(2)**-52)
   value=D.from_float(result[key]); err=abs(value-want)
   checks+=2
   if err>bound: failures.append(f'{artifact} {name}.{key} error {err} > bound {bound}')
   six=D(format(value,'.6g')); ref_six=D(format(want,'.6g'))
   if six!=ref_six: failures.append(f'{artifact} {name}.{key} 6sf actual={six} reference={ref_six}')
   # Compare shared printed values only after independent derivation.
   if 'expected_6sf' in c:
    checks+=1
    if D(c['expected_6sf'][key])!=ref_six: failures.append(f'{name}.{key} shared6sf differs from independent6sf')
   rows.append({'artifact':artifact,'case':name,'output':key,'actual':str(value),'reference':str(want),'reference_6sf':str(ref_six),'absolute_error':str(err),'bound':str(bound)})
 for c in refusals+more_refusals:
  result=results[c['id']]; checks+=2
  if result.get('ok') is not False: failures.append(f'{artifact} {c["id"]}: did not refuse')
  if result.get('error')!=c['expected_reason_text']: failures.append(f'{artifact} {c["id"]}: reason differs: {result}')
summary={'checks':checks,'artifacts':list(actual),'numeric_cases':len(numeric+extra),'refusal_cases':len(refusals+more_refusals),'failures':failures,'results':rows,'refusals':{a:{c['id']:r[c['id']] for c in refusals+more_refusals} for a,r in actual.items()}}
(OUT/'independent-results.json').write_text(json.dumps(summary,indent=2)+'\n')
for row in rows:
 if row['artifact']=='source': print(f"{row['case']} {row['output']}: reference6sf={row['reference_6sf']} absolute_error={float(row['absolute_error']):.6g} bound={float(row['bound']):.6g}")
for c in refusals: print(f"{c['id']}: {actual['source'][c['id']]['error']}")
print(f"Independent: {checks} checks; {len(actual)} artifacts; {len(numeric+extra)} numeric cases; {len(refusals+more_refusals)} refusal cases; {len(failures)} failures")
for fail in failures: print('FAIL',fail)
sys.exit(bool(failures))
