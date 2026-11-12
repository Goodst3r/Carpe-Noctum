#!/usr/bin/env python3
"""Independent check of the numbers on Test -> FCC proof of performance (build list item 20).

Each entry below is a relevant excerpt of the operative clause of the rule, copied from the eCFR as read on November 11, 2026
(47 CFR is a US government work and may be quoted), together with the item it supports. These are selected excerpts, not whole
sections: for example the noise and isolation entries keep the conditions and numbers the screen states, and leave out the
amplifier, NCTA Recommended Practices and reflection paragraphs, which the source dialogs on the screen carry. This script pulls the numbers out of the clause
with its own parser (digits, and the number words the rules use) and writes them to pop-reference.json; the app is not read here.
qa/build3-pop.test.cjs checks that the screen states exactly those numbers for each item. Run: python3 research/build3/pop-reference.py"""
import json, re
from decimal import Decimal as D
from pathlib import Path

WORDS = {'twice': 2, 'once': 1, 'six': 6, 'seven': 7, 'five': 5, 'ten': 10}

CLAUSES = {
    'frequency': ('76.601(b)', 'at least twice each calendar year (at intervals not to exceed seven months)'),
    'points': ('76.601(b)(1)', 'For cable television systems with 1,000 or more subscribers but with 12,500 or fewer subscribers, measurements taken at six (6) widely separated points. However, within each cable system, one additional test point shall be added for every additional 12,500 subscribers or fraction thereof. At least one-third of the test points shall be representative of subscriber terminals most distant'),
    'channels': ('76.601(b)(2)', 'a minimum of five (5) channels for systems operating a total activated channel capacity of less than 550 MHz, and ten (10) channels for systems operating a total activated channel capacity of 550 MHz or greater'),
    'level': ('76.605(b)(3)', 'shall not be less than 1 millivolt across an internal impedance of 75 ohms (0 dBmV). Additionally, as measured at the end of a 30 meter (100 foot) cable drop, it shall not be less than 1.41 millivolts across an internal impedance of 75 ohms (+3 dBmV)'),
    'variation': ('76.605(b)(4)', 'as measured at the end of a 30 meter cable drop that is connected to the subscriber tap, shall not vary more than 8 decibels within any six-month interval, which must include four tests performed in six-hour increments during a 24-hour period in July or August and during a 24-hour period in January or February, and shall be maintained within 3 decibels (dB) of the visual signal level of any visual carrier within a 6 MHz nominal frequency separation; 10 dB of the visual signal level on any other channel on a cable television system of up to 300 MHz of cable distribution system upper frequency limit, with a 1 dB increase for each additional 100 MHz'),
    'aural': ('76.605(b)(2),(5)', 'The aural center frequency of the aural carrier must be 4.5 MHz ±5 kHz above the frequency of the visual carrier. The rms voltage of the aural signal shall be maintained between 10 and 17 decibels below the associated visual signal level'),
    'response': ('76.605(b)(6)', 'The amplitude characteristic shall be within a range of ±2 decibels from 0.75 MHz to 5.0 MHz above the lower boundary frequency'),
    'cnr': ('76.605(b)(7)', 'The ratio of RF visual signal level to system noise shall not be less than 43 decibels'),
    'coherent': ('76.605(b)(8)', 'shall not be less than 51 decibels for noncoherent channel cable television systems; frequency-coincident with the visual carrier shall not be less than 47 decibels for coherent channel cable systems'),
    'isolation': ('76.605(b)(9) and 76.609(g)', 'Shall not be less than 18 decibels. Measurements of terminal isolation are not required when either the manufacturer\'s specifications for subscriber tap isolation based on a representative sample of no less than 500 subscribers taps or laboratory tests performed by or for the operator of a cable television system on a representative sample of no less than 50 subscriber taps, indicates that the terminal isolation standard of § 76.605(a)(9) is met. To demonstrate compliance, the operator shall attach either such manufacturer\'s specifications or laboratory measurements as an exhibit to each proof-of-performance record.'),
    'hum': ('76.605(b)(10)', 'shall not exceed 3 percent of the visual signal level'),
    'headend': ('76.605(b)(11)', 'shall be within 170 nanoseconds; shall not exceed ±20%; shall not exceed ±10 degrees'),
    'noise': ('76.609(e)', 'summing the power indications to obtain the total noise power present over a 4 MHz band centered within the cable television channel. If it is established that the noise level is constant within this bandwidth, a single measurement may be taken which is corrected by an appropriate factor representing the ratio of 4 MHz to the noise bandwidth of the frequency-selective voltmeter.'),
    'retention': ('76.1704(a)', 'maintained on file at the operator\'s local business office for at least five years'),
}

def numbers(text):
    out = []
    text = re.sub(r'§?\s*76\.\d+(?:\([a-z0-9]+\))*', ' ', text)   # rule-section numbers are references, not limits
    for m in re.finditer(r'\d[\d,]*(?:\.\d+)?|\b(?:' + '|'.join(WORDS) + r')\b', text):
        tok = m.group(0)
        if tok in WORDS:
            out.append(WORDS[tok])
        else:
            v = D(tok.replace(',', ''))
            out.append(int(v) if v == v.to_integral() else float(v))
    return out

result = {}
for key, (rule, clause) in CLAUSES.items():
    nums = numbers(clause)
    # a number written as a word and again in brackets, e.g. "six (6)", counts once
    dedup = []
    for n in nums:
        if dedup and dedup[-1] == n and re.search(r'\b(?:%s)\b\s*\(\s*%s\s*\)' % ('|'.join(WORDS), re.escape(str(n))), clause):
            continue
        dedup.append(n)
    result[key] = {'rule': rule, 'numbers': sorted(set(dedup)), 'clause': clause}
Path(__file__).with_name('pop-reference.json').write_text(json.dumps(result, indent=1, ensure_ascii=False) + '\n')
print('wrote pop-reference.json:', {k: v['numbers'] for k, v in result.items()})
