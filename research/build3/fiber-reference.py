#!/usr/bin/env python3
"""Independent reference values for the build 3 fiber tools (build list item 15, first part).

Written separately from night-sweep/fiber-tools.js. Uses Python's decimal module at 50 significant digits and
writes research/build3/fiber-reference.json, which qa/build3-fiber.test.cjs compares with the app's own output.

Rules used:
  TIA-598 color code: twelve colors in a fixed order, the same for fibers and for buffer tubes; with 12 fibers
      in each tube, fiber n is in tube ceil(n / 12) at position ((n - 1) mod 12) + 1.
  Link loss budget: loss = length x attenuation + pairs x loss per pair + splices x loss per splice + other;
      required = loss + margin; optics budget = transmit power - receiver sensitivity (dBm - dBm = dB);
      headroom = optics budget - required.
"""
from decimal import Decimal as D, getcontext
from pathlib import Path
import json

getcontext().prec = 50
COLORS = ['Blue', 'Orange', 'Green', 'Brown', 'Slate', 'White', 'Red', 'Black', 'Yellow', 'Violet', 'Rose', 'Aqua']


def locate(n):
    tube = -(-n // 12)
    position = (n - 1) % 12 + 1
    return {'tube': tube, 'position': position, 'fiberColor': COLORS[position - 1], 'tubeColor': COLORS[(tube - 1) % 12], 'marked': tube > 12}


def budget(length, att, pairs, pair_loss, splices, splice_loss, other, margin, tx=None, rx=None):
    L, A, M = D(str(length)), D(str(att)), D(str(margin))
    fiber = L * A
    connectors = D(pairs) * D(str(pair_loss)) if pairs else D(0)
    spl = D(splices) * D(str(splice_loss)) if splices else D(0)
    oth = D(str(other)) if other is not None else D(0)
    total = fiber + connectors + spl + oth
    out = {'fiber': fiber, 'connectors': connectors, 'splices': spl, 'other': oth, 'estimated': total, 'required': total + M}
    if tx is not None:
        available = D(str(tx)) - D(str(rx))
        out['available'] = available
        out['headroom'] = available - out['required']
        out['status'] = 'within' if out['headroom'] >= 0 else 'short'
    return out


def ser(o):
    if isinstance(o, D):
        return str(o)
    if isinstance(o, dict):
        return {k: ser(v) for k, v in o.items()}
    return o


def build():
    cases = {'locate': [], 'fromTube': [], 'budget': [], 'errors': []}
    for n in list(range(1, 30)) + [35, 36, 37, 48, 49, 60, 72, 100, 143, 144, 145, 156, 240, 276, 287, 288]:
        cases['locate'].append({'input': {'fiber': n}, 'expected': locate(n)})
    for tube, pos in [(1, 1), (1, 12), (2, 1), (3, 6), (12, 12), (13, 1), (20, 8), (24, 12), (7, 7)]:
        cases['fromTube'].append({'input': {'tube': tube, 'position': pos}, 'expected': {'fiber': (tube - 1) * 12 + pos, **locate((tube - 1) * 12 + pos)}})
    base = dict(length='12.4', attenuation='0.35', connectors='4', connectorLoss='0.3', splices='6', spliceLoss='0.1', other='3.5', margin='3', tx='3', rx='-24')
    variants = [
        base,
        {**base, 'tx': '', 'rx': '', 'other': ''},
        {**base, 'connectors': '0', 'connectorLoss': '', 'splices': '0', 'spliceLoss': ''},
        {**base, 'length': '0', 'attenuation': '0.5', 'margin': '0'},
        {**base, 'length': '80', 'attenuation': '0.25', 'tx': '10', 'rx': '-28'},
        {**base, 'length': '100', 'attenuation': '0.5', 'tx': '3', 'rx': '-24'},
        {**base, 'connectors': '2', 'connectorLoss': '0.75', 'splices': '10', 'spliceLoss': '0.3', 'attenuation': '0.5', 'other': '', 'tx': '0', 'rx': '-14'},
        {**base, 'tx': '-3', 'rx': '-18.5', 'margin': '1.25'},
        {**base, 'length': '0.001', 'attenuation': '5', 'connectors': '500', 'connectorLoss': '0.001', 'splices': '1', 'spliceLoss': '0'},
        {**base, 'length': '12.4', 'attenuation': '0.35', 'connectors': '1', 'connectorLoss': '0.75', 'splices': '0', 'spliceLoss': '', 'other': '0', 'margin': '0', 'tx': '1', 'rx': '-5.304'},
    ]
    for v in variants:
        pairs = int(v['connectors']); splices = int(v['splices'])
        r = budget(v['length'], v['attenuation'], pairs, v['connectorLoss'] or 0, splices, v['spliceLoss'] or 0, v['other'] if v['other'] != '' else None, v['margin'],
                   v['tx'] if v['tx'] != '' else None, v['rx'] if v['rx'] != '' else None)
        cases['budget'].append({'input': v, 'expected': ser(r)})
    ok = base
    bad = [
        ('length', ''), ('length', 'abc'), ('length', '-1'), ('length', '501'), ('length', '0x10'), ('attenuation', ''), ('attenuation', '-0.1'), ('attenuation', '5.1'),
        ('connectors', ''), ('connectors', '1.5'), ('connectors', '-1'), ('connectors', '501'), ('connectorLoss', ''), ('connectorLoss', '-0.1'), ('connectorLoss', '5.1'),
        ('splices', ''), ('splices', '2.5'), ('spliceLoss', ''), ('other', '-1'), ('other', '51'), ('margin', ''), ('margin', '-1'), ('margin', '31'),
        ('tx', '41'), ('rx', ''), ('rx', '-81'), ('rx', '21'),
    ]
    for k, v in bad:
        cases['errors'].append({'fn': 'budget', 'input': {**ok, k: v}})
    cases['errors'] += [
        {'fn': 'budget', 'input': {**ok, 'tx': '', 'rx': '-24'}}, {'fn': 'budget', 'input': {**ok, 'tx': '-30', 'rx': '-24'}}, {'fn': 'budget', 'input': {**ok, 'tx': '-24', 'rx': '-24'}},
        {'fn': 'locate', 'input': {'fiber': ''}}, {'fn': 'locate', 'input': {'fiber': '0'}}, {'fn': 'locate', 'input': {'fiber': '289'}}, {'fn': 'locate', 'input': {'fiber': '1.5'}}, {'fn': 'locate', 'input': {'fiber': 'abc'}},
        {'fn': 'locate', 'input': {'fiber': '-3'}}, {'fn': 'locate', 'input': {'fiber': '0x10'}},
        {'fn': 'fromTube', 'input': {'tube': '0', 'position': '1'}}, {'fn': 'fromTube', 'input': {'tube': '25', 'position': '1'}}, {'fn': 'fromTube', 'input': {'tube': '1', 'position': '0'}},
        {'fn': 'fromTube', 'input': {'tube': '1', 'position': '13'}}, {'fn': 'fromTube', 'input': {'tube': '', 'position': '1'}}, {'fn': 'fromTube', 'input': {'tube': '2', 'position': ''}},
    ]
    return {'generated_by': 'research/build3/fiber-reference.py', 'precision_digits': 50, 'colors': COLORS, 'cases': cases}


if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'fiber-reference.json'
    data = build()
    out.write_text(json.dumps(data, indent=1) + '\n')
    print(f"{sum(len(v) for v in data['cases'].values())} cases -> {out}")
