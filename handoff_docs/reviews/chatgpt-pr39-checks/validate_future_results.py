#!/usr/bin/env python3
"""Compare actual future app output to the frozen independent reference.

No app/adapter is implemented here. Reason wording differences block a result
until an explicit same-head semantic review is supplied. Conditional stress and
documented UI-minimum refusals require a source-verified software-bound record.
"""
import argparse,hashlib,json,pathlib,re,sys
from cascade_oracle import D,six,HERE

def dec_number(raw):
 if isinstance(raw,bool) or not isinstance(raw,(int,float)):raise ValueError('actual numeric output must be a JSON number')
 value=D.from_float(raw) if isinstance(raw,float) else D(raw)
 if not value.is_finite():raise ValueError('actual output must be finite')
 return value

def allowed_software_refusal(case,record,head,reason):
 # Exceptions must be verified by the human reviewer against the real registry.
 if not(case.get('application_disposition') or case['id'].startswith('OWN-')):return False
 if not record or record.get('head_sha')!=head or record.get('label')!='unknown' or record.get('manually_verified') is not True:return False
 if not record.get('registry_id') or record.get('accepted_reason')!=reason:return False
 field=record.get('input_field');value=case['inputs'].get(field)
 if value is None:return False
 values=value if isinstance(value,list) else [value]
 if record.get('minimum_items') is not None and isinstance(value,list) and len(value)<int(record['minimum_items']):return True
 lo=record.get('minimum');hi=record.get('maximum')
 return any((lo is not None and D(x)<D(str(lo))) or (hi is not None and D(x)>D(str(hi))) for x in values)

def main(result_path,vectors,require_ui=False):
 result_path=pathlib.Path(result_path);data=json.loads(result_path.read_text())
 refs=json.loads((HERE/'cascade-reference.json').read_text());receipt=json.loads((HERE/'cascade-reference-receipt.json').read_text())
 cases={c['id']:c for c in json.loads((HERE/'cascade-raw-cases.json').read_text())}
 shared=json.loads(pathlib.Path(vectors).read_text())['calculators']['cascade']
 expected_reasons={c['id']:c['expected_reason_text'] for c in shared['refusal_cases']}
 checks=0;failures=[];rows=[];exceptions=[];head=data.get('head_sha','')
 def check(ok,label):
  nonlocal checks
  checks+=1
  if not ok:failures.append(label)
 check(bool(re.fullmatch('[0-9a-f]{40}',head)),'head must be pinned full SHA')
 check(data.get('reference_sha256')==receipt['reference_sha256'],'frozen reference hash mismatch')
 check(hashlib.sha256((HERE/'cascade-reference.json').read_bytes()).hexdigest()==receipt['reference_sha256'],'local reference was changed without receipt')
 artifacts=data.get('artifacts',{})
 check(set(artifacts)=={'source','standalone','pwa'},'must run real source, standalone and PWA functions')
 for artifact,results in artifacts.items():
  for name,case in cases.items():
   reference=refs[name];actual=results.get(name)
   check(isinstance(actual,dict),f'{artifact} {name}: missing actual case')
   if not isinstance(actual,dict):continue
   check(isinstance(actual.get('raw_result'),dict),f'{artifact} {name}: preserve raw real-function result')
   if 'refusal_category' in reference:
    reason=actual.get('error');category=reference['refusal_category']
    check(actual.get('ok') is False,f'{artifact} {name}: must refuse')
    check(isinstance(reason,str) and bool(reason.strip()),f'{artifact} {name}: refusal needs reason')
    check(not actual.get('outputs'),f'{artifact} {name}: refused case has numerical outputs')
    exact=name in expected_reasons and reason==expected_reasons[name]
    review=data.get('semantic_reason_reviews',{}).get(name,{})
    equivalent=review.get('head_sha')==head and review.get('category')==category and review.get('accepted_reason')==reason and review.get('reviewed_by')=='ChatGPT'
    check(exact or equivalent,f'{artifact} {name}: independently review refusal meaning ({category})')
    continue
   if actual.get('ok') is False:
    record=data.get('software_bound_exceptions',{}).get(name)
    allowed=allowed_software_refusal(case,record,head,actual.get('error'))
    check(allowed,f'{artifact} {name}: unexpected refusal without source-verified conditional software bound')
    if allowed:exceptions.append({'artifact':artifact,'case':name,'record':record})
    continue
   check(actual.get('ok') is True,f'{artifact} {name}: expected numeric success')
   for key,expected in reference['outputs'].items():
    try:value=dec_number(actual.get('outputs',{}).get(key))
    except (ValueError,TypeError) as error:
     check(False,f'{artifact} {name}.{key}: {error}');continue
    want=D(expected['decimal']);limit=D(expected['absolute_error_bound']);error=abs(value-want)
    check(error<=limit,f'{artifact} {name}.{key}: unrounded error{error}>bound{limit}')
    wanted_sign=expected['required_sign'];actual_sign=-1 if value<0 else 1 if value>0 else 0
    check(actual_sign==wanted_sign,f'{artifact} {name}.{key}: incorrect sign/zero (tiny result cannot vanish)')
    check(six(value)==expected['six_significant'],f'{artifact} {name}.{key}: six-significant numeric value mismatch')
    ui=data.get('ui',{}).get(artifact,{}).get(name,{}).get(key)
    if ui is not None or (require_ui and artifact in ['standalone','pwa'] and not name.startswith('OWN-')):
     check(ui==expected['six_significant'],f'{artifact} {name}.{key}: exact six-significant DOM text/trailing zero mismatch')
    rows.append({'artifact':artifact,'case':name,'output':key,'absolute_error':str(error),'bound':str(limit),'six_significant':expected['six_significant']})
 summary={'head_sha':head,'checks':checks,'failures':failures,'software_bound_exceptions':exceptions,'require_ui':require_ui,'app_test_run':True,'rows':rows}
 destination=result_path.with_suffix('.validation.json');destination.write_text(json.dumps(summary,indent=2)+'\n')
 print(f'Future cascade actual-output validation: {checks} checks; {len(failures)} failures; head{head}; require_ui={require_ui}')
 for f in failures:print('FAIL',f)
 return bool(failures)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('actual_results');p.add_argument('vectors');p.add_argument('--require-ui',action='store_true');a=p.parse_args();sys.exit(main(a.actual_results,a.vectors,a.require_ui))
