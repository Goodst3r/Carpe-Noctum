#!/usr/bin/env python3
"""Independent reference values for the build 3 DOCSIS health card (build list item 5).

Written separately from night-sweep/docsis-health.js, from the specification statements
alone (see research/build3/DOCSIS_HEALTH_SOURCES.md). Uses Python's decimal module at 50
significant digits. Writes research/build3/docsis-health-reference.json, which
qa/build3-docsis-health.test.cjs compares against the app's actual output. Synthetic
readings only; nothing here came from a meter or modem.

Requirements used, all in dBmV:
  downstream SC-QAM, one 6 MHz channel ........ -15 to +15 (PHYv3.0 C01 Table 6-22)
  downstream OFDM, per 6 MHz (equivalent PSD) .. -15 to +15 (PHYv3.1 I20 Table 45)
  downstream OFDM, per 24 MHz .................. -9 to +21 (PHYv3.1 I20 Table 45)
  OFDM over B MHz (derived) .................... the 24 MHz row moved by 10*log10(B/24), shown and used
                                                 to 0.01 dB, rounded inward (low edge up, high edge down)
  total downstream input, DOCSIS 3.1 ........... strictly below 40
  total downstream input, DOCSIS 3.0 only ...... strictly below 33
  upstream Pmax, DOCSIS 3.1 modem on a 3.1 CMTS  65 (default and lowest allowed); other modes take
                                                 the modem's own maximum, typed in
"""
from decimal import Decimal as D, getcontext, ROUND_CEILING, ROUND_FLOOR
from pathlib import Path
import json

getcontext().prec = 50
TEN = D(10)


def log10(x):
    return D(x).log10()


def rng(reading, low, high):
    """Inclusive range. Outside: distance outside. Inside: distance to the nearest edge."""
    r = D(str(reading))
    if r < low:
        return {'status': 'below', 'margin': low - r}
    if r > high:
        return {'status': 'above', 'margin': r - high}
    return {'status': 'inside', 'margin': min(r - low, high - r)}


def scqam(level):
    out = rng(level, D(-15), D(15))
    out.update({'low': D(-15), 'high': D(15), 'compare': D(str(level))})
    return out


def ofdm_range(basis, occupied):
    if basis == '6':
        return D(-15), D(15), 6
    if basis == '24':
        return D(-9), D(21), 24
    if occupied == 24:
        return D(-9), D(21), 24
    shift = TEN * log10(D(occupied) / D(24))
    cent = D('0.01')
    return (D(-9) + shift).quantize(cent, rounding=ROUND_CEILING), (D(21) + shift).quantize(cent, rounding=ROUND_FLOOR), occupied


def ofdm(power, basis, occupied=None):
    low, high, width = ofdm_range(basis, occupied)
    out = rng(power, low, high)
    per6 = D(str(power)) - TEN * log10(D(width) / D(6))
    out.update({'low': low, 'high': high, 'width': width, 'per6': per6, 'compare': per6})
    return out


def total(reading, modem):
    limit = D(40) if modem == '3.1' else D(33)
    r = D(str(reading))
    return {'status': 'below-limit' if r < limit else 'at-or-over', 'margin': abs(limit - r), 'limit': limit, 'compare': r}


def upstream(reading, pmax=None):
    pm = D(65) if pmax is None else D(str(pmax))
    r = D(str(reading))
    headroom = pm - r
    return {'status': 'headroom' if headroom >= 0 else 'over-pmax', 'margin': abs(headroom), 'headroom': headroom, 'pmax': pm, 'compare': r}


def window(reading, lo, hi):
    r = D(str(reading))
    lo = None if lo is None else D(str(lo))
    hi = None if hi is None else D(str(hi))
    if lo is None and hi is None:
        return {'status': 'unknown'}
    if lo is not None and r < lo:
        return {'status': 'below', 'margin': lo - r}
    if hi is not None and r > hi:
        return {'status': 'above', 'margin': r - hi}
    edges = [x for x in (r - lo if lo is not None else None, hi - r if hi is not None else None) if x is not None]
    return {'status': 'inside', 'margin': min(edges)}


def ser(obj):
    """Decimals as strings so the test reads the full 50 digits."""
    return {k: (str(v) if isinstance(v, D) else v) for k, v in obj.items()}


def build():
    cases = {'scqam': [], 'ofdm': [], 'total': [], 'upstream': [], 'window': [], 'errors': []}
    for level in ['-16', '-15.01', '-15', '-14.99', '-7.3', '0', '3.2', '14.99', '15', '15.01', '16']:
        cases['scqam'].append({'input': {'level': level}, 'expected': ser(scqam(level))})
    for power in ['-15.5', '-15', '-14.9', '-2.5', '0', '14.9', '15', '15.5']:
        cases['ofdm'].append({'input': {'power': power, 'basis': '6'}, 'expected': ser(ofdm(power, '6'))})
    for power in ['-9.5', '-9', '-8.9', '6', '20.9', '21', '21.5']:
        cases['ofdm'].append({'input': {'power': power, 'basis': '24'}, 'expected': ser(ofdm(power, '24'))})
    for occupied in [24, 30, 48, 96, 186, 192]:
        low, high, _ = ofdm_range('other', occupied)
        q = lambda x: x.quantize(D('0.01'))
        for power in [low - D('0.5'), low - D('0.01'), low, low + D('0.1'), q((low + high) / 2), high - D('0.1'), high, high + D('0.01'), high + D('0.5')]:
            p = str(power)
            cases['ofdm'].append({'input': {'power': p, 'basis': 'other', 'occupied': str(occupied)}, 'expected': ser(ofdm(p, 'other', occupied))})
    cases['ofdm_edges'] = [{'occupied': o, 'low': str(ofdm_range('other', o)[0]), 'high': str(ofdm_range('other', o)[1])} for o in (24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138, 144, 150, 156, 162, 168, 174, 180, 186, 192)]
    for modem, readings in (('3.1', ['28', '39.9', '39.99', '40', '40.01', '45']), ('3.0', ['20', '32.9', '32.99', '33', '33.1'])):
        for reading in readings:
            cases['total'].append({'input': {'total': reading, 'modem': modem}, 'expected': ser(total(reading, modem))})
    for reading in ['40', '55', '64.9', '65', '65.1']:
        cases['upstream'].append({'input': {'mode': '3.1', 'total': reading}, 'expected': ser(upstream(reading))})
    for pmax, readings in (('68', ['60', '68', '70']), ('72.5', ['50', '72.5'])):
        for reading in readings:
            cases['upstream'].append({'input': {'mode': '3.1', 'total': reading, 'pmax': pmax}, 'expected': ser(upstream(reading, pmax))})
    # A 3.0 modem, or a 3.1 modem on a 3.0 CMTS: only the modem's own typed-in maximum applies, and it may be below 65.
    for pmax, readings in (('57', ['40', '56.9', '57', '57.5']), ('61', ['50', '61'])):
        for reading in readings:
            cases['upstream'].append({'input': {'mode': 'other', 'total': reading, 'pmax': pmax}, 'expected': ser(upstream(reading, pmax)), 'specBasis': False})
    for reading, lo, hi in [('3', '-7', '7'), ('-7', '-7', '7'), ('7', '-7', '7'), ('-7.01', '-7', '7'), ('7.01', '-7', '7'),
                            ('5', '0', None), ('-1', '0', None), ('5', None, '4'), ('3', None, '4'), ('1', None, None), ('0', '0', '0')]:
        cases['window'].append({'reading': reading, 'min': lo, 'max': hi, 'expected': ser(window(reading, lo, hi))})
    # Inputs the card must refuse, each with a reason and no number.
    cases['errors'] = [
        {'id': 'scqam', 'input': {'level': ''}}, {'id': 'scqam', 'input': {'level': 'abc'}}, {'id': 'scqam', 'input': {'level': '151'}}, {'id': 'scqam', 'input': {'level': '-101'}},
        {'id': 'ofdm', 'input': {'power': '0', 'basis': 'other', 'occupied': '25'}}, {'id': 'ofdm', 'input': {'power': '0', 'basis': 'other', 'occupied': '18'}},
        {'id': 'ofdm', 'input': {'power': '0', 'basis': 'other', 'occupied': '198'}}, {'id': 'ofdm', 'input': {'power': '0', 'basis': 'other', 'occupied': ''}},
        {'id': 'ofdm', 'input': {'power': '0', 'basis': 'other', 'occupied': '48.5'}}, {'id': 'ofdm', 'input': {'power': '', 'basis': '6'}}, {'id': 'ofdm', 'input': {'power': '0', 'basis': 'bogus'}},
        {'id': 'total', 'input': {'total': '', 'modem': '3.1'}}, {'id': 'total', 'input': {'total': '30', 'modem': '2.0'}},
        {'id': 'total', 'input': {'total': '36'}}, {'id': 'total', 'input': {'total': '36', 'modem': ''}}, {'id': 'total', 'input': {'total': '36', 'modem': 'constructor'}},
        {'id': 'ofdm', 'input': {'power': '16'}}, {'id': 'ofdm', 'input': {'power': '16', 'basis': ''}},
        {'id': 'scqam', 'input': {'level': '0x10'}}, {'id': 'scqam', 'input': {'level': '0b11'}}, {'id': 'scqam', 'input': {'level': '1_0'}}, {'id': 'scqam', 'input': {'level': 'Infinity'}}, {'id': 'scqam', 'input': {'level': '--5'}},
        {'id': 'toString', 'input': {}}, {'id': '__proto__', 'input': {}},
        {'id': 'upstream', 'input': {'mode': '3.1', 'total': ''}}, {'id': 'upstream', 'input': {'total': '50'}}, {'id': 'upstream', 'input': {'mode': '', 'total': '50'}},
        {'id': 'upstream', 'input': {'mode': '3.1', 'total': '50', 'pmax': '64'}}, {'id': 'upstream', 'input': {'mode': '3.1', 'total': '50', 'pmax': 'x'}}, {'id': 'upstream', 'input': {'mode': '3.1', 'total': '50', 'pmax': '151'}},
        {'id': 'upstream', 'input': {'mode': 'other', 'total': '50'}}, {'id': 'upstream', 'input': {'mode': 'other', 'total': '50', 'pmax': '0'}}, {'id': 'upstream', 'input': {'mode': 'other', 'total': '50', 'pmax': 'x'}},
    ]
    return {
        'generated_by': 'research/build3/docsis-health-reference.py',
        'precision_digits': 50,
        'requirements_dBmV': {'scqam': [-15, 15], 'ofdm_per6': [-15, 15], 'ofdm_per24': [-9, 21], 'total_3_1_below': 40, 'total_3_0_below': 33, 'pmax_default_and_minimum': 65},
        'ofdm_per24_vs_per6_difference_dB': str(TEN * log10(D(4)) - D(6)),
        'cases': cases,
    }


if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'docsis-health-reference.json'
    data = build()
    out.write_text(json.dumps(data, indent=1) + '\n')
    n = sum(len(v) for v in data['cases'].values())
    print(f'{n} cases -> {out}')
