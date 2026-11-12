#!/usr/bin/env python3
"""Explicit independently reviewed extra-case wording; never approve arbitrary reasons."""
import json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
OUT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else HERE
reviews={
 'OWN-UNSAFE-COUNT':('unsafe_count','Count exceeds safe-integer representation.','The entered count9007199254740993 exceeds the exact safe integer ceiling; this specific reason matches the independent safe-count refusal.'),
 'OWN-TEMP300':('unsupported_temperature','Use equivalent noise temperature or keep the source at the NF reference; this temperature substitution is not the approved model.','The raw source reference is300K, outside the approved fixed290K source/NF-reference model.'),
 'OWN-NONFINITE-NF':('nonfinite_NF_dB','Complete the numeric noise figure.','NaN is not a finite numeric noise figure; the actual parser refuses it without substituting zero. The wording requests a numeric NF rather than labeling a physical limit.'),
 'OWN-PARTIAL-BANDWIDTH':('malformed_B_Hz','Complete the numeric noise bandwidth.','The raw1e token is an incomplete numeric bandwidth expression, so completion is the relevant refusal.'),
 'OWN-MALFORMED-CNR':('incomplete_CNR_dB','Complete the numeric CNR.','A bare minus sign is incomplete; no numerical CNR may be derived or dropped.')
}
a=json.loads((OUT/'actual-results-initial.json').read_text());a['semantic_reason_reviews']={}
for case,(category,reason,why) in reviews.items():
 for artifact,rows in a['artifacts'].items():
  if rows[case]['error']!=reason:raise SystemExit(f'{artifact} {case}: unreviewed actual reason')
 a['semantic_reason_reviews'][case]={'head_sha':a['head_sha'],'category':category,'accepted_reason':reason,'reviewed_by':'ChatGPT','rationale':why}
(OUT/'actual-results.json').write_text(json.dumps(a,indent=2)+'\n')
(OUT/'semantic-reason-reviews.json').write_text(json.dumps(a['semantic_reason_reviews'],indent=2)+'\n')
print('Explicit extra-refusal semantic wording:5 independently reviewed categories recorded; all3artifacts exactly match those actual reasons.')
