#!/usr/bin/env python3
"""Independent answers for the numeric Study mode questions (build list item 19).

qa/build3-study.test.cjs generates questions from many seeds, writes each numeric question's generator id and parameters to a
JSON file and runs this script on it. The script recomputes every answer from the parameters with Python decimal (50 digits)
from the formulas written out below, not from the app, and prints them as JSON for the test to compare with the app's answers.
Usage: python3 research/build3/study-reference.py cases.json"""
import json, sys
from decimal import Decimal as D, getcontext

getcontext().prec = 50
C_FT_PER_US = D(299792458) / D('0.3048') / D(1000000)   # speed of light, feet per microsecond (exact from the metre definition)

def log10(x): return D(x).log10()

def answer(gen, p):
    d = lambda k: D(str(p[k]))
    if gen == 'dbm':        return d('level') - 10 * log10(1000 * 75)                      # dBm = dBmV - 10 log10(1000 R), R = 75
    if gen == 'dbuv':       return d('level') + 60
    if gen == 'ofdm6':      return d('power') - 10 * log10(d('bandwidth') / 6)             # power in 6 MHz from the power in B MHz
    if gen == 'splitter':   return d('level') - 10 * log10(d('ways'))
    if gen == 'fiberbudget':return d('length') * d('attenuation') + d('connectors') * D('0.3') + d('splices') * D('0.1')
    if gen == 'unity':      return d('cable') + d('passives')
    if gen == 'gap':        return d('dsLow') - d('upper')
    if gen == 'ripple':     return C_FT_PER_US / 2 * d('vp') / d('spacing')               # feet between mismatches, one way
    if gen == 'leak3m':     return d('field') * d('distance') / 3
    if gen == 'cli':
        counted = [D(str(v)) for v in p['leaks'] if D(str(v)) >= 50]                      # leaks of 50 uV/m or more count
        return 10 * log10(sum(v * v for v in counted) / d('theta'))
    raise SystemExit('unknown generator ' + gen)

cases = json.load(open(sys.argv[1]))
print(json.dumps([{'gen': c['gen'], 'answer': float(answer(c['gen'], c['params']))} for c in cases]))
