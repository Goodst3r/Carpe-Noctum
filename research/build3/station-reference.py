#!/usr/bin/env python3
"""Independent decimal fixtures, without importing any application code.
All levels are dBmV, differences and insertion loss dB. Synthetic only.
Injection = target at reference point + net loss from injection point to that plane.
Receiver delta = actual receiver level - same-plane saved receiver reference.
"""
from decimal import Decimal as D
import json
from pathlib import Path
rows=[('gainmaker-example','19','20','39','-1.25','-3.5'),
      ('signed-level','-2.5','20','17','-5','-2'),
      ('zero-is-entered','0','0','0','0','0')]
cases=[]
for name,target,loss,actual,reading,reference in rows:
    injection=D(target)+D(loss)
    cases.append(dict(id=name,input=dict(referencePointTarget=target,insertionLoss=loss,actualInjection=actual,receiverReading=reading,receiverReference=reference),expected=dict(requiredInjection=float(injection),injectionDelta=float(D(actual)-injection),receiverDelta=float(D(reading)-D(reference)))))
result=dict(method='Python Decimal addition/subtraction from literal decimal strings; no application imports',derivation='required injection = reference-point target + net insertion loss; injection delta = actual - required; receiver delta = reading - reference at identical receiver plane and convention',external_check='WolframAlpha independently returned {39,17.5,0,2.25} for {19+20,-2.5+20,0+0,-1.25-(-3.5)} on 2026-11-11',external_url='https://www.wolframalpha.com/input?i=%7B19%2B20%2C+-2.5%2B20%2C+0%2B0%2C+-1.25-%28-3.5%29%7D',cases=cases)
Path(__file__).with_name('station-cases.json').write_text(json.dumps(result,indent=2)+'\n')
