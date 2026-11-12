#!/usr/bin/env python3
from decimal import Decimal as D,getcontext
import json,pathlib,re,sys
getcontext().prec=200
OUT=pathlib.Path(__file__).parent
refs=json.loads((OUT/'independent-references.json').read_text());raw=json.loads((OUT/'raw-cases.json').read_text());own=json.loads((OUT/'own-cases.json').read_text());actual=json.loads((OUT/'actual-results.json').read_text())
checks=0;fails=[];rows=[]
def check(ok,label):
 global checks
 checks+=1
 if not ok:fails.append(label)
def bound(w,b):return abs(w-b)+max(abs(b)*D('1e-14') if 0<abs(b)<D('1e-12') else D('1e-13'),abs(b)*D(64)*D(2)**-52)
def compare(a,w,b,label,decimal_six=True):
 v=D.from_float(a) if isinstance(a,float) else D(a)
 e=abs(v-w);limit=bound(w,b)
 check(e<=limit,f'{label} {e}>{limit}')
 check((v>0)-(v<0)==(w>0)-(w<0),label+' sign/zero')
 # Shared references require exact-decimal six-figure agreement. The two extra
 # 1e-10 cancellation probes establish sign and computed-result presentation;
 # their binary64 input quantization already changes the sixth printed digit.
 display_reference=w if decimal_six else b
 check(D(format(v,'.6g'))==D(format(display_reference,'.6g')),label+' 6sf numeric')
 rows.append({'output':label,'actual':str(v),'reference':str(w),'binary_input_reference':str(b),'error':str(e),'bound':str(limit),'decimal_six_required':decimal_six})
patterns={
 'HR01':r'measured.*(?:number|decimal|power)', 'HR02':r'measured.*(?:number|decimal|power)', 'HR03':r'finite',
 'HR04':r'bandwidth.*above 0','HR05':r'bandwidth.*above 0','HR06':r'bandwidth.*measured in',
 'HR07':r'blank Pmax.*no supported','HR08':r'below 65','HR09':r'normalized|per.channel','HR10':r'modem.*working|mode',
 'HR11':r'F.connector.*plane','HR12':r'flat PSD','HR13':r'Normalize.*units','HR14':r'per.channel/DRW',
 'HR16':r'Pmax.*number','HR17':r'finite','HR18':r'2,000 MHz','HR19':r'instantaneous OFDMA',
 'OWN-NO-CONTEXT-16':r'flat PSD','OWN-NO-CONTEXT-6':r'flat PSD','OWN-NO-CONTEXT-64':r'flat PSD','OWN-NO-CONTEXT-24':r'flat PSD',
 'OWN-BW-OVER':r'2,000 MHz','OWN-LEVEL-OVER':r'±200','OWN-MTC-OFF':r'MTC','OWN-PROVENANCE-UNKNOWN':r'provenance|comparable'
}
for artifact,results in actual.items():
 for c in raw:
  name=c['id'];r=results[name]
  if name=='HR15':
   for plant in ['42','204']:
    check(r[plant]['result']=={'status':'unknown'},artifact+' HR15 real company Unknown '+plant)
    check('Unknown' in r[plant]['text'],artifact+' HR15 real window text '+plant)
   continue
  if name=='HX07' or name.startswith('HR'):
   check(r.get('ok') is False,artifact+' '+name+' refuses')
   check(set(r)=={'ok','error'},artifact+' '+name+' no partial outputs')
   check(bool(re.search('outside ±200' if name=='HX07' else patterns[name],r.get('error',''),re.I)),artifact+' '+name+' semantic reason')
   continue
  check(r.get('ok') is True,artifact+' '+name+' accepted')
  for key,ref in refs[name].items():
   compare(r['compositeMargin'] if key=='margin' else r[key],D(ref['reference']),D(ref['binary_reference']),artifact+' '+name+'.'+key)
  if c['inputs']['operation']=='composite_margin':
   check(r['headroom']==r['compositeMargin'] and r['margin']==abs(r['compositeMargin']),artifact+' '+name+' legacy aliases')
   expected='over-pmax' if D(refs[name]['margin']['reference'])<0 else 'at-pmax' if D(refs[name]['margin']['reference'])==0 else 'headroom'
   check(r['status']==expected,artifact+' '+name+' exact unrounded status')
   check(r['defaultPmax']==(name=='H4'),artifact+' '+name+' default provenance')
 for c in own:
  name=c['id'];r=results[name]
  if name in patterns:
   check(r.get('ok') is False,artifact+' '+name+' refuses');check(set(r)=={'ok','error'},artifact+' '+name+' no partial output');check(bool(re.search(patterns[name],r.get('error',''),re.I)),artifact+' '+name+' reason');continue
  check(r.get('ok') is True,artifact+' '+name+' accepted')
  if c['api']=='margin':
   p,t=c['input']['pmax'],c['input']['total'];w=D(p)-D(t);b=D.from_float(float(p))-D.from_float(float(t));compare(r['compositeMargin'],w,b,artifact+' '+name+'.margin',name not in ['OWN-TINY-POS','OWN-TINY-NEG'])
   check(r['status']==('over-pmax' if w<0 else 'at-pmax' if not w else 'headroom'),artifact+' '+name+' exact status')
  else:
   p,a,b=c['args'][:3];w=D(p)+D(10)*(D(b)/D(a)).log10();rb=D.from_float(float(p))+D(10)*(D.from_float(float(b))/D.from_float(float(a))).log10();compare(r['total'],w,rb,artifact+' '+name+'.total')
out={'checks':checks,'failures':fails,'outputs':rows,'artifacts':list(actual)}
(OUT/'validation.json').write_text(json.dumps(out,indent=2)+'\n')
for f in fails:print('FAIL',f)
print(f'B2 independent real-function review: {checks} checks; 3 artifacts; {len(fails)} failures')
sys.exit(bool(fails))
