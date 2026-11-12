#!/usr/bin/env python3
"""Independent check of the numbers on Test -> High split (build list item 17).

The band edges are typed here from the rows the specification prints (quoted in the strings below, as read November 11, 2026
in CM-SP-PHYv4.0-I08-260928 Table 29 and Table 31 and CM-SP-PHYv3.1-I20-230419 Table 4), parsed by this script, and the derived
numbers (the gap between the two directions, the downstream width, which side of the split 108-137 MHz falls on) are
computed with Python decimal. The app is not read here: the JSON this writes is compared with the app by
qa/build3-highsplit.test.cjs. Run: python3 research/build3/highsplit-reference.py"""
import json, re
from decimal import Decimal as D
from pathlib import Path

ROWS_40 = {  # row text as printed in Table 29 (cells separated by |), with the split name
    'sub':  'Up to 42 MHz (support for SCTE 55-1,2) | 50 MHz to 54 MHz | 1584 MHz to 1590 MHz | Node Only',
    'mid':  '85 MHz (support for SCTE 55-1,2) | 108 MHz | 1644 MHz | Node Only',
    'high': 'High-Split | 5 MHz | 204 MHz | 258 MHz | 1794 MHz | Node and Cable Modem',
}
ULTRA_TXT = 'UHS-300 300 MHz 300-372 MHz; UHS-396 396 MHz 396-492 MHz; UHS-492 492 MHz 492-606 MHz; UHS-684 684 MHz 684-834 MHz; downstream top 1794 MHz'
AERO = (D(108), D(137))

def nums(text):
    return [D(x) for x in re.findall(r'\d+(?:\.\d+)?', text)]

def edges(plan, row):
    cells = [c.strip() for c in row.split('|')]
    if plan == 'high':
        up, lo, hi = D(204), D(258), D(1794)
        assert 'Node and Cable Modem' in row and nums(cells[2])[0] == up and nums(cells[3])[0] == lo and nums(cells[4])[0] == hi
        return {'upper': [up], 'dsLow': [lo], 'dsHigh': [hi]}
    up = nums(cells[0])  # 'Up to 42 MHz (support for SCTE 55-1,2)' -> first number is the edge
    lo = nums(cells[1]); hi = nums(cells[2])
    return {'upper': [up[0]], 'dsLow': lo, 'dsHigh': hi}

def side(upper, ds_low):
    if AERO[1] <= upper: return 'upstream'
    if AERO[0] >= ds_low[-1]: return 'downstream'
    if AERO[0] >= upper and AERO[1] <= ds_low[0]: return 'in the gap between them'
    return 'split between the two'

plans = {}
for plan, row in ROWS_40.items():
    e = edges(plan, row)
    gap_lo = e['dsLow'][0] - e['upper'][0]
    gap_hi = e['dsLow'][-1] - e['upper'][0]
    plans[plan] = {
        'upper': [int(x) for x in e['upper']], 'dsLow': [int(x) for x in e['dsLow']], 'dsHigh': [int(x) for x in e['dsHigh']],
        'gapMin': int(gap_lo), 'gapMax': int(gap_hi),
        'width': int(e['dsHigh'][0] - e['dsLow'][0]) if len(e['dsLow']) == 1 and len(e['dsHigh']) == 1 else None,
        'aeroSide': side(e['upper'][0], e['dsLow']),
    }

ultra = []
for chunk in ULTRA_TXT.split(';')[:4]:
    n = nums(chunk)  # UHS-300 300 MHz 300-372 MHz -> [300, 300, 300, 372]
    ultra.append({'upper': int(n[1]), 'dsLow': [int(n[2]), int(n[3])]})

out = {
    'source': 'CM-SP-PHYv4.0-I08-260928 Table 29 and Table 31; CM-SP-PHYv3.1-I20-230419 Section 7.2 and Table 4',
    'plans': plans,
    'ultra': ultra,
    'ultraTop': 1794,
    'd31': {'upstreamEdges': [42, 65, 85, 117, 204], 'downstreamLowMust': 258, 'downstreamDemodulateTo': 1218, 'downstreamOptionalTo': 1794},
    'aeroBand': [int(AERO[0]), int(AERO[1])],
}
# Cross-checks that do not depend on the app: widths of the two single-edge plans are equal, and ultra-high edges grow.
assert plans['mid']['width'] == plans['high']['width'] == 1536
assert [u['upper'] for u in ultra] == sorted(u['upper'] for u in ultra)
assert all(u['dsLow'][0] == u['upper'] for u in ultra)
Path(__file__).with_name('highsplit-reference.json').write_text(json.dumps(out, indent=1) + '\n')
print('wrote highsplit-reference.json:', {k: (v['gapMin'], v['gapMax'], v['aeroSide']) for k, v in plans.items()})
