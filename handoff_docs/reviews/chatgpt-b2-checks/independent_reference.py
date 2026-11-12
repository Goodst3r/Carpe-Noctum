#!/usr/bin/env python3
"""Raw-input-only B2 math references, no author code/reference imports."""
from decimal import Decimal as D,getcontext
import json,pathlib,hashlib
getcontext().prec=200
OUT=pathlib.Path(__file__).parent
def derive(i,binary=False):
 p=lambda s:D.from_float(float(s)) if binary else D(s)
 if i['operation']=='bandwidth':
  delta=D(10)*(p(i['to_MHz'])/p(i['from_MHz'])).log10()
  return {'total':p(i['level_dBmV'])+delta,'delta':delta}
 return {'margin':p(i['reference_Pmax_dBmV'])-p(i['simultaneous_total_dBmV'])}
def six(v):
 if not v:return '0.00000'
 rounded=v.quantize(D(1).scaleb(v.adjusted()-5));e=rounded.adjusted()
 if e < -6 or e >=6:return format(rounded.scaleb(-e),'.5f')+'E'+format(e,'+d')
 return format(rounded,f'.{max(0,5-e)}f')
def bound(w,b):
 q=abs(w-b);floor=abs(b)*D('1e-14') if 0<abs(b)<D('1e-12') else D('1e-13')
 return q+max(floor,abs(b)*D(64)*D(2)**-52)
raw=json.loads((OUT/'raw-cases.json').read_text())
numeric=raw[:15]
refs={}
for c in numeric:
 w=derive(c['inputs']);b=derive(c['inputs'],True)
 refs[c['id']]={k:{'reference':str(v),'binary_reference':str(b[k]),'bound':str(bound(v,b[k])),'six':six(v)} for k,v in w.items()}
(OUT/'raw-cases.json').write_text(json.dumps(raw,indent=2)+'\n')
(OUT/'independent-references.json').write_text(json.dumps(refs,indent=2)+'\n')
print('Frozen raw-input references',hashlib.sha256((OUT/'independent-references.json').read_bytes()).hexdigest(),'numeric cases',len(numeric))
for name,outputs in refs.items():print(name,{k:v['six'] for k,v in outputs.items()})
