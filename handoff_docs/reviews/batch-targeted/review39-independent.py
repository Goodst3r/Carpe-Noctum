import json,subprocess,decimal
from decimal import Decimal as D
decimal.getcontext().prec=90
v=json.load(open('handoff_docs/reviews/chatgpt-calculator-test-vectors.json'))['calculators']['cascade'];cases=v['worked_cases']+v['extra_edge_cases']+v['refusal_cases']
js="const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('night-sweep/field-calcs.js','utf8')+';this.calc=FieldCalc',c);console.log(JSON.stringify(JSON.parse(fs.readFileSync(0,'utf8')).map(x=>c.calc.cascade(x))))"
r=json.loads(subprocess.check_output(['node','-e',js],input=json.dumps([c['inputs'] for c in cases]).encode()))
log10=lambda x:x.log10()
def combine(xs):return -10*log10(sum(D(10)**(-x/10) for x in xs))
checks=0;maxerr=D(0)
for c,a in zip(cases,r):
 i=c['inputs']
 if c in v['refusal_cases']:
  assert a=={'ok':False,'error':c['expected_reason_text']},(c['id'],a);checks+=1;continue
 assert a['ok'],(c['id'],a)
 if i['operation']=='thermal_chain':
  # Matched available power kTB, loaded RMS voltage squared P*75,
  # reference (1 mV)^2; NF scales noise power; independent noises add.
  floor=10*log10(D('1.380649e-23')*290*D(i['B_Hz'])*75/D('0.000001'))
  single=D(i['input_dBmV'])-D(i['NF_dB'])-floor
  equal=single-10*log10(D(i['N']))
  expected={'thermal_floor_dBmV':floor,'single_CNR_dB':single,'equal_contributions_CNR_dB':equal}
  if 'optical_CNR_dB' in i:expected['combined_CNR_dB']=combine([equal,D(i['optical_CNR_dB'])])
 else:expected={'combined_CNR_dB':combine([D(x) for x in i['CNR_dB']])}
 for k,e in expected.items():
  err=abs(D(str(a[k]))-e);maxerr=max(maxerr,err)
  assert err <= max(D('1e-12'),abs(e)*D('2e-15')),(c['id'],k,a[k],str(e),str(err))
  assert format(float(e),'.6g').lower()==format(a[k],'.6g').lower(),(c['id'],k)
  checks+=1
print(f'Independent Decimal90: {len(cases)} cases, {checks} numeric/refusal checks; max absolute error {maxerr}')
