#!/usr/bin/env python3
"""Independent reference values for the build 3 field calculators.

Written separately from night-sweep/field-calcs.js. Uses Python's decimal module at
50 significant digits and exact definitions: c = 299,792,458 m/s and 1 ft = 0.3048 m.
Writes research/build3/field-calcs-reference.json, which qa/build3-field-calcs.test.cjs
compares against the app's actual output. Synthetic inputs only.
"""
from decimal import Decimal as D, getcontext
from pathlib import Path
import json

getcontext().prec = 50
C = D(299792458) / D('0.3048') / D(10) ** 6          # ft per microsecond
TEN = D(10)

def log10(x):
    return D(x).log10()

def level(value, unit, ohms):
    value, ohms = D(str(value)), D(ohms)
    offset = TEN * log10(D(1000) * ohms)              # dBm = dBmV - offset
    if unit == 'dBmV': dbmv = value
    elif unit == 'dBuV': dbmv = value - 60
    elif unit == 'dBm': dbmv = value + offset
    elif unit == 'mV': dbmv = 20 * log10(value)
    elif unit == 'mW': dbmv = TEN * log10(value) + offset
    dbm = dbmv - offset
    return {'dBmV': dbmv, 'dBm': dbm, 'dBuV': dbmv + 60, 'mV': TEN ** (dbmv / 20), 'mW': TEN ** (dbm / 10), 'offset': offset}

def ripple(spacing, vp):
    return {'feet': C / 2 * D(str(vp)) / D(str(spacing))}

def preeq(tap, main, rate, vp):
    per = C * D(str(vp)) / D(str(rate)) / 2           # period (us) = 1 / Msym/s
    n = D(tap - main)
    return {'perTap': per, 'feet': n * per, 'low': (n - D('0.5')) * per, 'high': (n + D('0.5')) * per}

def ofdm(power, basis, occupied):
    p, a = D(str(power)), D(str(basis))
    at = lambda b: p + TEN * log10(D(str(b)) / a)
    return {'total': at(occupied), 'per6': at(6), 'per24': at(24), 'per1_6': at('1.6')}

def echo(length, vp):
    ns_per_ft = 1000 / C
    return {'ns': 2 * D(str(length)) * ns_per_ft / D(str(vp))}

cases = {
    'level': [dict(input=[v, u, r], expected=level(v, u, r)) for v, u, r in [
        (10, 'dBmV', 75), (10, 'dBmV', 50), (0, 'dBm', 75), (0, 'dBm', 50), (60, 'dBuV', 75),
        (1, 'mV', 75), (1, 'mW', 75), (1, 'mW', 50), (-12.5, 'dBmV', 75), ('0.0316227766', 'mV', 50)]],
    'ripple': [dict(input=[s, v], expected=ripple(s, v)) for s, v in [(6, '0.87'), ('2.08', '0.87'), ('4.27', '0.87'), (8, '0.87'), ('0.4', '0.87'), (3, '0.93')]],
    'preeq': [dict(input=[t, m, r, v], expected=preeq(t, m, r, v)) for t, m, r, v in [
        (9, 8, '5.12', '0.87'), (9, 8, '5.12', '0.9'), (9, 8, '2.56', '0.87'), (12, 8, '5.12', '0.87'), (24, 8, '1.28', '0.85'), (5, 4, '5.12', '0.87')]],
    'ofdm': [dict(input=[p, a, b], expected=ofdm(p, a, b)) for p, a, b in [(42, 6, 192), (48, 24, 96), (30, '1.6', '95'), (-3, 6, 24)]],
    'echo': [dict(input=[l, v], expected=echo(l, v)) for l, v in [(100, '0.87'), (100, '0.85'), (1068, '0.87'), ('53.5', '0.87')]],
}
# Published worked numbers from the build list and the checked sources, at their stated rounding.
published = [
    {'calc': 'ripple', 'input': [6, 0.87], 'field': 'feet', 'value': 71.3, 'digits': 1, 'source': 'docs/BUILD_LIST.md item 4'},
    {'calc': 'ripple', 'input': [8, 0.87], 'field': 'feet', 'value': 53.5, 'digits': 1, 'source': 'CableLabs CM-GL-PNM-HFC-V02-260130 example'},
    {'calc': 'ripple', 'input': [4.27, 0.87], 'field': 'feet', 'value': 100, 'digits': 0, 'source': 'Hranac, Linear Distortions Part 1 (2005) and PNMP-V03 Appendix I'},
    {'calc': 'preeq', 'input': [9, 8, 5.12, 0.87], 'field': 'feet', 'value': 84, 'digits': 0, 'source': 'docs/BUILD_LIST.md item 4'},
    {'calc': 'preeq', 'input': [9, 8, 5.12, 0.9], 'field': 'feet', 'value': 86, 'digits': 0, 'source': 'docs/BUILD_LIST.md item 4'},
    {'calc': 'preeq', 'input': [9, 8, 2.56, 0.87], 'field': 'feet', 'value': 167, 'digits': 0, 'source': 'docs/BUILD_LIST.md item 4'},
    {'calc': 'ofdm', 'input': [42, 6, 192], 'field': 'total', 'value': 57.05, 'digits': 2, 'source': 'docs/BUILD_LIST.md item 4; CM-SP-PHYv3.1-I20 7.5.9.1 formula'},
    {'calc': 'echo', 'input': [100, 0.87], 'field': 'ns', 'value': 234, 'digits': 0, 'source': 'Hranac, What is a Micro-Reflection? (2009); PNMP-V03 Appendix I.5'},
    {'calc': 'level', 'input': [0, 'dBm', 75], 'field': 'dBmV', 'value': 48.75, 'digits': 2, 'source': 'docs/BUILD_LIST.md item 4'},
    {'calc': 'level', 'input': [0, 'dBm', 50], 'field': 'dBmV', 'value': 46.99, 'digits': 2, 'source': 'docs/BUILD_LIST.md item 4'},
]
def plain(x):
    if isinstance(x, D): return str(x)
    if isinstance(x, dict): return {k: plain(v) for k, v in x.items()}
    if isinstance(x, list): return [plain(v) for v in x]
    return x
out = {'generator': 'research/build3/field-calcs-reference.py', 'precision_digits': 50,
       'constants': {'c_ft_per_us': str(C), 'ns_per_ft_vacuum': str(1000 / C)},
       'scope': 'Independent decimal arithmetic for synthetic inputs. Checks the arithmetic, not the field applicability of each formula.',
       'cases': plain(cases), 'published': published}
target = Path(__file__).with_name('field-calcs-reference.json')
target.write_text(json.dumps(out, indent=1) + '\n')
print(f"Reference cases: {sum(len(v) for v in cases.values())} computed, {len(published)} published values · c = {C:.10f} ft/us")
