#!/usr/bin/env python3
"""Independent reference values for the build 3 leakage tools (build list item 7).

Written separately from night-sweep/leakage.js, from the rule text alone (47 CFR 76.605(c)
Table 1, 76.611(a)(1)) and the inverse-distance relation. Uses Python's decimal module at 50
significant digits. Writes research/build3/leakage-reference.json, which
qa/build3-leakage.test.cjs compares against the app's actual output. Synthetic readings only.

Rules used:
  FCC limits (47 CFR 76.605(c) Table 1):  analog or digital, over 54 up to and including 216 MHz:
      20 / 17.4 uV/m at 3 m;  54 MHz and below, and over 216 MHz:  15 / 13.1 uV/m at 30 m
  CLI (47 CFR 76.611(a)(1)):  I = (1 / theta) * sum(Ei^2) over leaks Ei >= 50 uV/m at 3 m;
      index = 10 * log10(I);  must be equal to or less than 64
  Restating a reading at another distance (expert, far field):  E at D = E at d * d / D
  Detector check:  difference = 20 * log10(read / expected)
"""
from decimal import Decimal as D, getcontext
from pathlib import Path
import json

getcontext().prec = 50
TEN, TWENTY = D(10), D(20)
FT = D('0.3048')


def log10(x):
    return D(x).log10()


def metres(value, unit):
    return D(str(value)) * (FT if unit == 'ft' else D(1))


def limit_rule(freq, kind):
    f = D(str(freq))
    near = f > 54 and f <= 216
    table = {('analog', True): (20, 3), ('digital', True): (D('17.4'), 3), ('analog', False): (15, 30), ('digital', False): (D('13.1'), 30)}
    limit, dist = table[(kind, near)]
    return D(str(limit)), D(dist)


def check_limit(freq, kind, field, dist, unit):
    limit, rule_d = limit_rule(freq, kind)
    d = metres(dist, unit)
    at_rule = D(str(field)) * d / rule_d
    return {'limit': limit, 'ruleDistance': rule_d, 'atRule': at_rule, 'status': 'within' if at_rule <= limit else 'over',
            'ratioDb': TWENTY * log10(at_rule / limit), 'metres': d, 'converted': d != rule_d,
            'countsForCli': (D(str(field)) * d / D(3)) >= 50}


def normalize(field, dist, unit):
    d = metres(dist, unit)
    e = D(str(field))
    return {'at3': e * d / 3, 'at30': e * d / 30, 'metres': d, 'feet': d / FT}


def cli(leaks, theta):
    theta = D(str(theta))
    counted = [D(str(x)) for x in leaks if D(str(x)) >= 50]
    total = sum((x * x for x in counted), D(0))
    index = total / theta
    out = {'theta': theta, 'entered': len(leaks), 'counted': len(counted), 'ignored': len(leaks) - len(counted), 'sumSquares': total, 'index': index}
    if not counted:
        out.update({'cli': None, 'status': 'none-counted'})
        return out
    value = TEN * log10(index)
    out.update({'cli': value, 'status': 'at-or-below' if value <= 64 else 'above', 'margin': abs(D(64) - value),
                'strongest': TEN * log10(max(counted) ** 2 / theta)})
    return out


def detector(expected, read):
    e, r = D(str(expected)), D(str(read))
    return {'diffDb': TWENTY * log10(r / e), 'percent': (r - e) / e * 100}


def ser(obj):
    return {k: (str(v) if isinstance(v, D) else v) for k, v in obj.items()}


def build():
    cases = {'rule': [], 'limit': [], 'normalize': [], 'cli': [], 'detector': [], 'tolerance': [], 'errors': []}
    for freq in ['5', '30', '54', '54.0001', '55', '121.2625', '216', '216.0001', '300', '750', '1218']:
        for kind in ('analog', 'digital'):
            limit, dist = limit_rule(freq, kind)
            cases['rule'].append({'input': {'frequency': freq, 'kind': kind}, 'expected': {'limit': str(limit), 'distance': str(dist)}})
    for freq, kind, field, dist, unit in [
        ('121.2625', 'analog', '20', '3', 'm'), ('121.2625', 'analog', '20.01', '3', 'm'), ('121.2625', 'digital', '17.4', '3', 'm'), ('121.2625', 'digital', '17.41', '3', 'm'),
        ('121.2625', 'analog', '10', '6', 'm'), ('121.2625', 'analog', '40', '10', 'ft'), ('121.2625', 'digital', '55', '1', 'm'), ('121.2625', 'analog', '3', '30', 'm'),
        ('750', 'analog', '15', '30', 'm'), ('750', 'digital', '13.2', '30', 'm'), ('750', 'digital', '13.1', '30', 'm'), ('750', 'analog', '1.4', '300', 'ft'),
        ('30', 'analog', '5', '100', 'ft'), ('216', 'digital', '17.4', '3', 'm'), ('216.0001', 'digital', '17.4', '3', 'm'), ('54', 'analog', '15', '30', 'm'), ('54.0001', 'analog', '20', '3', 'm'),
    ]:
        cases['limit'].append({'input': {'frequency': freq, 'kind': kind, 'field': field, 'distance': dist, 'unit': unit}, 'expected': ser(check_limit(freq, kind, field, dist, unit))})
    for field, dist, unit in [('40', '10', 'm'), ('40', '3', 'm'), ('100', '30', 'm'), ('25', '10', 'ft'), ('60', '1', 'm'), ('7.5', '100', 'ft'), ('12', '3.048', 'm'), ('250', '0.5', 'm')]:
        cases['normalize'].append({'input': {'field': field, 'distance': dist, 'unit': unit}, 'expected': ser(normalize(field, dist, unit))})
    for leaks, theta in [
        ([100, 60, 50], '0.8'),                       # build list example: sum of squares 16,100; I = 20,125; 43.0 dB
        ([120, 85, 60, 250, 50], '0.8'),
        ([49.99, 50, 50.01], '1'), ([10, 20, 30, 49], '0.9'), ([50], '1'), ([1000], '0.75'), ([1000, 1000, 1000, 1000, 1000, 1000], '0.5'),
        ([75, 75, 75, 75], '0.25'), ([55.5, 62.25, 48, 51], '0.6'), ([5000, 4000, 3000], '1'),
    ]:
        cases['cli'].append({'input': {'leaks': ' '.join(str(x) for x in leaks), 'theta': theta}, 'expected': ser(cli(leaks, theta))})
    # strand miles instead of a fraction
    for tested, total, leaks in [('160', '200', [120, 85, 60, 250, 50]), ('37.5', '50', [100, 60, 50]), ('10', '10', [200])]:
        theta = D(tested) / D(total)
        cases['cli'].append({'input': {'leaks': ' '.join(str(x) for x in leaks), 'tested': tested, 'total': total}, 'expected': ser(cli(leaks, theta))})
    for expected, read in [('20', '20'), ('20', '22'), ('20', '18'), ('100', '50'), ('30', '60'), ('15', '15.5')]:
        cases['detector'].append({'input': {'method': 'direct', 'expected': expected, 'read': read}, 'expected': ser(detector(expected, read))})
    for diff, tol in [('1.5', '2'), ('-1.5', '2'), ('2', '2'), ('2.01', '2'), ('-2.5', '2'), ('0', '0'), ('0.1', '0'), ('3', None), ('3', '')]:
        within = None if tol in (None, '') else abs(D(diff)) <= D(tol)
        cases['tolerance'].append({'diffDb': diff, 'tolerance': tol, 'expected': {'status': 'unknown' if within is None else ('within' if within else 'outside'),
                                   'margin': None if within is None else str(abs(D(tol) - abs(D(diff))))}})
    cases['errors'] = [
        {'fn': 'checkLimit', 'input': {'frequency': '', 'kind': 'analog', 'field': '10', 'distance': '3', 'unit': 'm'}},
        {'fn': 'checkLimit', 'input': {'frequency': '121', 'kind': '', 'field': '10', 'distance': '3', 'unit': 'm'}},
        {'fn': 'checkLimit', 'input': {'frequency': '121', 'kind': 'analog', 'field': '0', 'distance': '3', 'unit': 'm'}},
        {'fn': 'checkLimit', 'input': {'frequency': '121', 'kind': 'analog', 'field': '10', 'distance': '3', 'unit': ''}},
        {'fn': 'checkLimit', 'input': {'frequency': '121', 'kind': 'analog', 'field': '10', 'distance': '-3', 'unit': 'm'}},
        {'fn': 'checkLimit', 'input': {'frequency': '121', 'kind': 'analog', 'field': '0x10', 'distance': '3', 'unit': 'm'}},
        {'fn': 'checkLimit', 'input': {'frequency': '5000', 'kind': 'analog', 'field': '10', 'distance': '3', 'unit': 'm'}},
        {'fn': 'normalize', 'input': {'field': '', 'distance': '3', 'unit': 'm'}}, {'fn': 'normalize', 'input': {'field': '10', 'distance': '0', 'unit': 'm'}},
        {'fn': 'normalize', 'input': {'field': '10', 'distance': '5000', 'unit': 'm'}}, {'fn': 'normalize', 'input': {'field': '10', 'distance': '3'}},
        {'fn': 'normalize', 'input': {'field': '1e7', 'distance': '3', 'unit': 'm'}},
        {'fn': 'cli', 'input': {'leaks': '', 'theta': '0.8'}}, {'fn': 'cli', 'input': {'leaks': '100, abc', 'theta': '0.8'}}, {'fn': 'cli', 'input': {'leaks': '100, -5', 'theta': '0.8'}},
        {'fn': 'cli', 'input': {'leaks': '100 0', 'theta': '0.8'}}, {'fn': 'cli', 'input': {'leaks': '100', 'theta': ''}}, {'fn': 'cli', 'input': {'leaks': '100', 'theta': '0'}},
        {'fn': 'cli', 'input': {'leaks': '100', 'theta': '1.1'}}, {'fn': 'cli', 'input': {'leaks': '100', 'tested': '220', 'total': '200'}}, {'fn': 'cli', 'input': {'leaks': '100', 'tested': '50'}},
        {'fn': 'cli', 'input': {'leaks': '100', 'tested': '0', 'total': '200'}}, {'fn': 'cli', 'input': {'leaks': '0x64', 'theta': '0.8'}},
        {'fn': 'detector', 'input': {'method': '', 'expected': '20', 'read': '22'}}, {'fn': 'detector', 'input': {'method': 'direct', 'expected': '0', 'read': '22'}},
        {'fn': 'detector', 'input': {'method': 'direct', 'expected': '20', 'read': ''}}, {'fn': 'detector', 'input': {'method': 'constructor', 'expected': '20', 'read': '22'}},
    ]
    return {'generated_by': 'research/build3/leakage-reference.py', 'precision_digits': 50,
            'rules': {'limits': {'near_54_to_216_MHz': {'analog': 20, 'digital': 17.4, 'distance_m': 3}, 'far': {'analog': 15, 'digital': 13.1, 'distance_m': 30}}, 'cli_limit': 64, 'cli_min_leak': 50, 'cli_sampling': 0.75},
            'cases': cases}


if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'leakage-reference.json'
    data = build()
    out.write_text(json.dumps(data, indent=1) + '\n')
    print(f"{sum(len(v) for v in data['cases'].values())} cases -> {out}")
