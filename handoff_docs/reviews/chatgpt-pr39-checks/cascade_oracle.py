#!/usr/bin/env python3
"""Reviewer-owned A2 reference, written before inspecting any A2 implementation.

This generates independent references. It does not invoke or stand in for the app.
Only raw input/context fields are accessed until the references have been written.
"""
import argparse, decimal, hashlib, json, pathlib, re
D=decimal.Decimal
decimal.getcontext().prec=220
K=D('1.380649e-23'); T0=D('290'); R=D('75'); MAX_SAFE=9007199254740991
HERE=pathlib.Path(__file__).resolve().parent

def tenlog(x):return D(10)*x.log10()
def parse_number(raw,binary=False):
 value=D(str(raw))
 return D.from_float(float(value)) if binary else value

def independent_refusal_category(i):
 """Semantic domains fixed before reading any expected refusal wording."""
 op=i.get('operation')
 if op not in ['thermal_chain','combine_cnr']:return 'unsupported_operation'
 if any(x!='CNR' for x in i.get('kinds',[])):return 'mixed_CNR_and_other_metric'
 if 'cumulative_chain' in i.get('contributions',[]) and 'constituent_of_chain' in i.get('contributions',[]):return 'double_count_cumulative_and_constituent'
 if i.get('correlation')=='common_ingress':return 'correlated_noise'
 if i.get('equal_receiver_referred_noise')=='unknown' or i.get('equal_independent_receiver_referred_noise') is False:return 'equal_receiver_referred_noise_unknown'
 if i.get('return_leg_gains_losses')=='unknown':return 'receiver_noise_weights_unknown'
 if i.get('NF_datasheet_conditions_match') is False:return 'noise_figure_conditions_mismatch'
 for field in ['source_reference_K','source_K','NF_ref_K']:
  if field not in i:continue
  try:temperature=D(str(i[field]))
  except decimal.InvalidOperation:return 'unsupported_temperature'
  if not temperature.is_finite() or temperature!=T0:return 'unsupported_temperature'
 if 'Rsource_ohm' in i and 'Rload_ohm' in i and D(i['Rsource_ohm'])!=D(i['Rload_ohm']):return 'unmatched_source_load'
 if 'load_ohm' in i and D(i['load_ohm'])!=R:return 'unsupported_impedance'
 if any('unknown' in str(x).lower() for x in i.get('bandwidths',[])):return 'bandwidth_conventions_unknown'
 if any('unknown' in str(x).lower() for x in i.get('measurement_planes',[])):return 'measurement_plane_unknown'
 if op=='combine_cnr':
  if not i.get('CNR_dB'):return 'no_CNR_contributions'
  fields=[('CNR_dB',x) for x in i['CNR_dB']]
 else:
  fields=[(name,i.get(name)) for name in ['B_Hz','input_dBmV','NF_dB','N']]
  if 'optical_CNR_dB' in i:fields.append(('optical_CNR_dB',i['optical_CNR_dB']))
 for name,raw in fields:
  if raw is None or str(raw).strip()=='':return 'missing_'+name
  if str(raw).strip() in ['-','+']:return 'incomplete_'+name
  try:v=D(str(raw))
  except decimal.InvalidOperation:return 'malformed_'+name
  if not v.is_finite():return 'nonfinite_'+name
  if name=='B_Hz' and v<=0:return 'nonpositive_bandwidth'
  if name=='NF_dB' and v<0:return 'negative_noise_figure'
  if name=='N':
   if v>MAX_SAFE:return 'unsafe_count'
   if v<=0 or v!=v.to_integral_value():return 'nonpositive_or_fractional_count'
 return None

def derive(i,binary_inputs=False):
 """Direct linear-power equations, independent of future stable app formulas."""
 reason=independent_refusal_category(i)
 if reason:raise ValueError(reason)
 p=lambda s:parse_number(s,binary_inputs)
 def inverse_cnr(c):return D(10)**(-p(c)/10)
 if i['operation']=='combine_cnr':
  return {'combined_CNR_dB':-tenlog(sum((inverse_cnr(x) for x in i['CNR_dB']),D(0)))}
 # Exact SI constant, fixed reference temperature and matched load remain exact
 # in both references. Only user-entered decimal values undergo binary64 parse.
 b=p(i['B_Hz']);input_level=p(i['input_dBmV']);nf=p(i['NF_dB']);n=D(i['N'])
 noise_w=K*T0*b
 carrier_w=D('1e-6')*(D(10)**(input_level/10))/R
 single_noise_w=noise_w*(D(10)**(nf/10))
 chain_noise_w=n*single_noise_w
 result={'thermal_noise_dBmV':tenlog(noise_w*R/D('1e-6')),
         'single_CNR_dB':tenlog(carrier_w/single_noise_w),
         'equal_chain_CNR_dB':tenlog(carrier_w/chain_noise_w)}
 if 'optical_CNR_dB' in i:
  # Both contributions are normalized to one desired carrier. Independent
  # segment noise ratios add; this is not addition of cumulative and component.
  inverse_chain=chain_noise_w/carrier_w
  result['combined_CNR_dB']=-tenlog(inverse_chain+inverse_cnr(i['optical_CNR_dB']))
 return result

def bound(exact,binary):
 # Small/zero outputs need strict sign/presentation checks in addition to this
 # numerical comparison. Nonzero tiny outputs use relative error, never a floor
 # that would allow zero. Exactly-zero results have an absolute roundoff budget.
 q=abs(binary-exact)
 floor=abs(binary)*D('1e-14') if 0<abs(binary)<D('1e-12') else D('1e-13')
 return q+max(floor,abs(binary)*D(64)*D(2)**-52)

def six(value):
 # Explicit significant trailing zeroes and canonical uppercase exponent.
 if value==0:return '0.00000'
 rounded=value.quantize(D(1).scaleb(value.adjusted()-5))
 exponent=rounded.adjusted()
 if exponent < -6 or exponent >= 6:
  return format(rounded.scaleb(-exponent),'.5f')+'E'+format(exponent,'+d')
 return format(rounded,f'.{max(0,5-exponent)}f')

def own_cases():
 base={'operation':'thermal_chain','B_Hz':'6400000','input_dBmV':'15','NF_dB':'8','N':'1','source_reference_K':'290','load_ohm':'75','equal_independent_receiver_referred_noise':True}
 def thermal(name,**kw):return {'id':name,'inputs':dict(base,**kw),'origin':'reviewer_extra'}
 def cnr(name,values):return {'id':name,'inputs':{'operation':'combine_cnr','CNR_dB':values,'same_carrier_plane_and_noise_bandwidth':True,'standalone_independent_contributions':True},'origin':'reviewer_extra'}
 return [cnr('OWN-CNR-ZERO',['0']),cnr('OWN-CNR-EQUAL-ZERO',['0','0']),
  cnr('OWN-CNR-TINY',['0','200']),cnr('OWN-CNR-TINY-REORDER',['200','0']),
  cnr('OWN-CNR-SUBTINY',['0','1200']),
  thermal('OWN-N1-NF0',NF_dB='0',input_dBmV='0',B_Hz='1'),
  thermal('OWN-SAFE-COUNT',N=str(MAX_SAFE)),
  thermal('OWN-NEGATIVE-CNR',input_dBmV='-100',NF_dB='100',B_Hz='1000000000'),
  thermal('OWN-FRACTIONAL-INPUTS',B_Hz='6412345.6789',input_dBmV='15.0000001',NF_dB='8.1234567',N='3'),
  thermal('OWN-OPTICAL-NEGATIVE',optical_CNR_dB='-20'),
  thermal('OWN-UNSAFE-COUNT',N='9007199254740993'),
  thermal('OWN-TEMP300',source_reference_K='300'),
  thermal('OWN-NONFINITE-NF',NF_dB='NaN'),
  thermal('OWN-PARTIAL-BANDWIDTH',B_Hz='1e'),
  cnr('OWN-MALFORMED-CNR',['40','-']),
 ]

def generate(vector_path,out_dir):
 raw=json.loads(pathlib.Path(vector_path).read_text())['calculators']['cascade']
 # Discard expected/reference fields before deriving anything.
 shared=[{k:c[k] for k in ['id','inputs','context','label','application_disposition'] if k in c} for group in raw.values() for c in group]
 cases=shared+own_cases(); refs={};num=ref=0
 for case in cases:
  i=case['inputs'];why=independent_refusal_category(i)
  if why:refs[case['id']]={'refusal_category':why};ref+=1;continue
  exact=derive(i);binary=derive(i,True);num+=1
  refs[case['id']]={'outputs':{k:{'decimal':str(v),'six_significant':six(v),'binary_input_reference':str(binary[k]),'absolute_error_bound':str(bound(v,binary[k])),'required_sign':-1 if v<0 else 1 if v>0 else 0} for k,v in exact.items()}}
 out_dir=pathlib.Path(out_dir);out_dir.mkdir(parents=True,exist_ok=True)
 (out_dir/'cascade-raw-cases.json').write_text(json.dumps(cases,indent=2)+'\n')
 (out_dir/'cascade-reference.json').write_text(json.dumps(refs,indent=2)+'\n')
 frozen={'precision':decimal.getcontext().prec,'k_exact_J_per_K':str(K),'fixed_temperature_K':str(T0),'matched_load_ohm':str(R),'source_vector_sha256':hashlib.sha256(pathlib.Path(vector_path).read_bytes()).hexdigest(),'cases':len(cases),'numeric_cases':num,'refusal_cases':ref,'app_test_run':False,'formula':'direct linear powers; see cascade_oracle.py','reference_sha256':hashlib.sha256((out_dir/'cascade-reference.json').read_bytes()).hexdigest()}
 (out_dir/'cascade-reference-receipt.json').write_text(json.dumps(frozen,indent=2)+'\n')
 print(json.dumps(frozen,indent=2))
 return frozen

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('vectors');ap.add_argument('--out',default=str(HERE));a=ap.parse_args();generate(a.vectors,a.out)
