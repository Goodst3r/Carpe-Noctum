#!/usr/bin/env python3
"""Independent reference values for the standing-wave candidate search (build list item 11).

Written separately from night-sweep/impairments.js, from the rule alone: two mismatches on one cable path give a
ripple whose peak spacing is df MHz, and the cable length between them is D = 492 x VP / df feet (SCTE 280 2022
section 9.7; the constant is half the speed of light in feet per microsecond, 983.57 / 2 = 491.78, rounded to 492
in the SCTE text and used unrounded by the app's ripple calculator, whose value this file also reproduces).
A candidate is a pair of points on one path of the route, the launch point or any earlier point's end of its span
and a later point's end of its span, whose cable distance is within +/- w percent of D. Branches are never added.
Uses Python's decimal module at 50 significant digits. Writes research/build3/impairments-reference.json, which
qa/build3-impairments.test.cjs compares with the app's output on the complete practice route. Synthetic only.
"""
from decimal import Decimal as D, getcontext
from pathlib import Path
import json

getcontext().prec = 50
C_FT_PER_US = D(299792458) / D('0.3048') / D(1000000)   # speed of light in feet per microsecond (exact 299,792,458 m/s)
HALF_C = C_FT_PER_US / 2

# The complete practice route: id -> (parent, name). Lengths are supplied by each case.
TREE = [('r1', 'source'), ('r2', 'r1'), ('r3', 'r2'), ('r4', 'r3'), ('r5', 'r4'), ('r6', 'r5'), ('r7', 'r4'), ('r8', 'r7'), ('r9', 'r8')]


def ends(lengths):
    out = {}
    for rid, parent in TREE:
        start = D(0) if parent == 'source' else out[parent]
        out[rid] = start + D(str(lengths[rid]))
    return out


def ancestors(rid):
    chain = []
    parent = dict(TREE)[rid]
    while parent != 'source':
        chain.append(parent)
        parent = dict(TREE)[parent]
    return chain


def distance(spacing, vp):
    return HALF_C * D(str(vp)) / D(str(spacing))


def candidates(lengths, feet, width):
    e = ends(lengths)
    found = []
    for rid, _ in TREE:
        for a in ['source'] + ancestors(rid):
            start = D(0) if a == 'source' else e[a]
            d = e[rid] - start
            if d <= 0:
                continue
            err = (d - feet) / feet * 100
            if abs(err) <= D(str(width)):
                found.append({'from': a, 'to': rid, 'feet': d, 'errorPercent': err})
    found.sort(key=lambda c: (abs(c['errorPercent']), c['feet'], c['to'], c['from']))
    return found[:12], len(found)


def ser(obj):
    if isinstance(obj, D):
        return str(obj)
    if isinstance(obj, dict):
        return {k: ser(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [ser(x) for x in obj]
    return obj


def build():
    base = {'r1': 820, 'r2': 260, 'r3': 620, 'r4': 110, 'r5': 310, 'r6': 260, 'r7': 210, 'r8': 100, 'r9': 100}
    cases = {'distance': [], 'candidates': []}
    for spacing, vp in [('1.7', '0.87'), ('6', '0.87'), ('0.5', '0.85'), ('12', '0.9'), ('1800', '0.5'), ('0.25', '1'), ('3.3333', '0.87')]:
        cases['distance'].append({'input': {'spacing': spacing, 'vp': vp}, 'expected': ser({'feet': distance(spacing, vp), 'meters': distance(spacing, vp) * D('0.3048')})})
    variants = {
        'practice': dict(base),
        'equal spans': {k: 200 for k in base},
        'two near-equal spans': {**base, 'r2': 260, 'r3': 262, 'r6': 258},
        'slack and short spans': {'r1': 12.5, 'r2': 0.5, 'r3': 33.25, 'r4': 99, 'r5': 100, 'r6': 101, 'r7': 99.9, 'r8': 100.1, 'r9': 100},
        'long run': {'r1': 2500, 'r2': 2500, 'r3': 2500, 'r4': 2500, 'r5': 2500, 'r6': 2500, 'r7': 2500, 'r8': 2500, 'r9': 2500},
    }
    queries = [260, 250.3, 430, 1700, 100, 210, 99.95, 1080, 2500, 5000, 7.5, 1810, 620.0001, 3000]
    for name, lengths in variants.items():
        for feet in queries:
            for width in (10, 1, 5, 25, 50):
                got, total = candidates(lengths, D(str(feet)), width)
                cases['candidates'].append({'name': name, 'lengths': lengths, 'input': {'feet': str(feet), 'width': width}, 'expected': ser({'total': total, 'candidates': got})})
    return {'generated_by': 'research/build3/impairments-reference.py', 'precision_digits': 50, 'half_c_ft_per_us': str(HALF_C), 'tree': TREE, 'cases': cases}


if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'impairments-reference.json'
    data = build()
    out.write_text(json.dumps(data, indent=1) + '\n')
    print(f"{sum(len(v) for v in data['cases'].values())} cases -> {out}")
