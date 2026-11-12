#!/usr/bin/env python3
"""Independent Decimal arithmetic for synthetic, format-independent sweep grading.

No application imports and no native meter schema. Only validated normalized
sample fixtures enter this arithmetic reference; input rejection is tested in Node.
"""
from decimal import Decimal, getcontext
import json
from pathlib import Path

getcontext().prec = 50


def decimal(value):
    return Decimal(str(value))


def reference(series, profile):
    # Work in exact decimal arithmetic, independently of the JavaScript core.
    low, high = decimal(profile['lowFrequencyMHz']), decimal(profile['highFrequencyMHz'])
    samples = {decimal(frequency): decimal(value) for frequency, value in series['points']}
    values = [value for frequency, value in samples.items() if low <= frequency <= high]
    low_value, high_value = samples[low], samples[high]
    tilt = high_value - low_value
    absolute = series['unit'] == 'dBmV'
    low_error = low_value - decimal(profile['lowTargetDbmv']) if absolute and 'lowTargetDbmv' in profile else None
    high_error = high_value - decimal(profile['highTargetDbmv']) if absolute and 'highTargetDbmv' in profile else None
    tilt_error = tilt - decimal(profile['tiltTargetDb']) if 'tiltTargetDb' in profile else None
    metrics = dict(ptvDb=max(values)-min(values), lowValue=low_value, highValue=high_value,
                   measuredTiltDb=tilt, lowLevelErrorDb=low_error,
                   highLevelErrorDb=high_error, tiltErrorDb=tilt_error)

    def status(value, limit):
        if value is None or limit not in profile:
            return 'unknown'
        return 'pass' if abs(value) <= decimal(profile[limit]) else 'fail'

    checks = dict(ptv=status(metrics['ptvDb'], 'ptvLimitDb'),
                  lowLevel=status(low_error, 'maxLevelErrorDb'),
                  highLevel=status(high_error, 'maxLevelErrorDb'),
                  tilt=status(tilt_error, 'maxTiltErrorDb'))
    overall = 'fail' if 'fail' in checks.values() else 'pass' if set(checks.values()) == {'pass'} else 'unknown'
    return dict(metrics={key: str(value) if value is not None else None for key, value in metrics.items()},
                checks=checks, overall=overall)


def fixture(identifier, unit, points, profile):
    series = dict(unit=unit, points=points)
    return dict(id=identifier, series=series, profile=profile, expected=reference(series, profile))


base = dict(lowFrequencyMHz=54, highFrequencyMHz=860)
cases = [fixture('raw-ptv-' + str(peak), 'dB', [[54, 0], [400, peak], [860, half]],
                 dict(base, ptvLimitDb=3))
         for peak, half in [(1, 0.5), (2.5, 1.25), (4, 2), (3, 1.5)]]
cases.extend([
    fixture('signed-errors', 'dBmV', [[54, 34], [400, 39], [860, 45]],
            dict(base, ptvLimitDb=12, lowTargetDbmv=31, highTargetDbmv=43,
                 maxLevelErrorDb=3, tiltTargetDb=12, maxTiltErrorDb=1)),
    fixture('negative-and-zero', 'dBmV', [[54, -4], [400, -2], [860, 0]],
            dict(base, ptvLimitDb=4, lowTargetDbmv=-4, highTargetDbmv=0,
                 maxLevelErrorDb=0, tiltTargetDb=4, maxTiltErrorDb=0)),
    fixture('descending', 'dBmV', [[54, 0], [400, -1], [860, -3]],
            dict(base, ptvLimitDb=3, lowTargetDbmv=0, highTargetDbmv=-3,
                 maxLevelErrorDb=0, tiltTargetDb=-3, maxTiltErrorDb=0)),
    fixture('decimal-equality', 'dBmV', [[54, 0.1], [400, 0.3], [860, 0.4]],
            dict(base, ptvLimitDb=0.3, lowTargetDbmv=0.1, highTargetDbmv=0.3,
                 maxLevelErrorDb=0.1, tiltTargetDb=0.2, maxTiltErrorDb=0.1)),
    fixture('band-only', 'dBmV', [[5, -100], [54, 10], [400, 15], [860, 12], [1800, 100]],
            dict(base, ptvLimitDb=5, lowTargetDbmv=10, highTargetDbmv=12,
                 maxLevelErrorDb=0, tiltTargetDb=2, maxTiltErrorDb=0)),
    fixture('unrounded-detail', 'dBmV', [[54, -1.23456789], [400, -0.123456789], [860, 0.000000001]],
            dict(base, ptvLimitDb=1.234567891, lowTargetDbmv=-1.23456789, highTargetDbmv=0.000000001,
                 maxLevelErrorDb=0, tiltTargetDb=1.234567891, maxTiltErrorDb=0)),
    fixture('decimal-tenth', 'dBmV', [[54, 0.3], [860, 0.4]],
            dict(base, ptvLimitDb=0.1, lowTargetDbmv=0.2, highTargetDbmv=0.3,
                 maxLevelErrorDb=0.1, tiltTargetDb=0.2, maxTiltErrorDb=0.1)),
    fixture('scalar-envelope-decimal', 'dBmV', [[54, 999999.2], [860, 999999.3]],
            dict(base, ptvLimitDb=0.1, lowTargetDbmv=999999.1, highTargetDbmv=999999.2,
                 maxLevelErrorDb=0.1, tiltTargetDb=0.2, maxTiltErrorDb=0.1)),
])

# Literal checks keep mistakes in the independent fixture setup visible.
assert [case['expected']['metrics']['ptvDb'] for case in cases[:4]] == ['1', '2.5', '4', '3']
assert cases[4]['expected']['metrics']['tiltErrorDb'] == '-1'
assert cases[5]['expected']['metrics']['highValue'] == '0'
assert cases[6]['expected']['metrics']['measuredTiltDb'] == '-3'
assert cases[7]['expected']['overall'] == 'pass'
assert cases[8]['expected']['metrics']['ptvDb'] == '5'
assert cases[9]['expected']['metrics']['ptvDb'] == '1.234567891'
assert cases[10]['expected']['metrics']['ptvDb'] == '0.1'
assert cases[11]['expected']['metrics']['ptvDb'] == '0.1'

out = dict(
    generator='research/build3/sweep-grading-reference.py', precision_digits=50,
    scope='Synthetic normalized series only. Decimal arithmetic does not verify native VIAVI JSON, units, measurement plane, equipment compatibility, or acceptance.',
    sources=[
        dict(path='handoff_docs/PARALLEL_TASKS.md', section='A4 detail and rule 8',
             purpose='Owner-entered unknown criteria, synthetic fixtures, independent math'),
        dict(path='docs/BUILD_LIST.md', section='Item 13', purpose='1, 2.5, 4 dB PTV cases at an entered 3 dB limit'),
        dict(path='night-sweep/projects.js', section='ProjectMath', purpose='Existing signed high-minus-low and measured-minus-target convention'),
        dict(url='https://www.wolframalpha.com/input?i=%7Bmax%28%7B0%2C1%2C0.5%7D%29-min%28%7B0%2C1%2C0.5%7D%29%2Cmax%28%7B0%2C2.5%2C1.25%7D%29-min%28%7B0%2C2.5%2C1.25%7D%29%2Cmax%28%7B0%2C4%2C2%7D%29-min%28%7B0%2C4%2C2%7D%29%2C+%2845-34%29-%2843-31%29%7D',
             purpose='Root-reported prior WolframAlpha arithmetic: PTV 1, 2.5, 4 dB; tilt error -1 dB. This script does not invoke Wolfram.'),
    ], cases=cases)
target = Path(__file__).with_suffix('.json')
target.write_text(json.dumps(out, indent=2) + '\n', encoding='utf-8')
print(f'{len(cases)} independent Decimal sweep cases written to {target.name}')
