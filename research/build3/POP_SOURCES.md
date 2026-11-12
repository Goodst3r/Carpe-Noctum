# FCC proof-of-performance card: sources and how they were checked

November 11, 2026 · Lane B (Claude) · build list item 20 · code in `night-sweep/proof-of-performance.js`, screen Test → Proof of performance

## What was read

I read the **current eCFR text** myself on November 11, 2026, for 47 CFR **76.601** (performance tests), **76.605** (technical standards, paragraphs (a) to (d)), **76.609** (measurements, paragraphs (a) to (j) in part) and **76.1704** (proof-of-performance test data). The FCC rules are a US government work and may be quoted; the screen restates them in plain words with the section named. The build list names SCTE 204 2025 and the NCTI testing course as sources: **SCTE 204 2025, *FCC Proof-of-Performance Checklist for Analog and Digital Signals*, was found in the SCTE catalog (its description says it highlights the FCC performance requirements, how often to test, where to test and references to SCTE 183 for how to test) and was not read**; the NCTI course was not used. The card is built from the rules directly, so it does not depend on either.

## What is on the screen, and the numbers

Fourteen limits or rules are registered as `fcc.pop.*` rows (spec, primary, scope all) with the section as the locator: test frequency (twice a year, seven months), test points (6, 12,500, a third), channels (5 below 550 MHz, 10 at or above), visual level (0 and +3 dBmV), variation (8 dB, 3 dB, 10 dB plus 1 dB per 100 MHz above 300 MHz), aural carrier (4.5 MHz ± 5 kHz, 10 to 17 dB), response (± 2 dB over 0.75 to 5.0 MHz), CNR (43 dB), coherent disturbances (51 and 47 dB), isolation (18 dB), hum (3 percent), headend video (170 ns, ± 20 percent, ± 10 degrees), the noise-measurement bandwidth (4 MHz) and the record retention (five years). The leakage row reuses `leak.fcc.analog.near` from the leakage tools.

`research/build3/pop-reference.py` holds a relevant excerpt of the operative clause of each rule (selected excerpts, not whole sections), copied from the eCFR text above, and its own small parser (digits and the number words the rules use: twice, six, seven, five, ten) writes `pop-reference.json`; `qa/build3-pop.test.cjs` checks that every number in the clause is on the screen for its item or its registry row and that neither states a number the clause does not (129 comparisons). Seven deliberate breakages (a changed screen figure, a changed registry figure, an added figure, a wrong section, an unknown rule, a wrong channel threshold, a changed hum limit) were each caught.

## Left out on purpose

- **QAM channels:** 76.605(a) requires ANSI/SCTE 40 2016, which was not read; the card says so and lists nothing for it.
- **A calculator for the number of test points** or channels (it would be easy but this item is "reference only"), the other 76.605 paragraphs ((d) and onward, class I channel detail beyond one sentence), the aural-remodulation variant beyond a mention, and 76.609(i) to (j).
- **Whether a system's franchise or the FCC has adopted different or additional tests:** 76.601(c) lets the Commission or the franchising authority require more.

## Not verified

The analog limits are law as the eCFR printed them on November 11, 2026; later amendments were not checked. Whether an operator has been relieved of the analog requirements (for example by an all-digital conversion) is a question for engineering.

## Corrections after Lane A's review of PR #19 (Nov 11, 2026)

I re-read the current eCFR text of 47 CFR 76.605 and 76.609 on Nov 11, 2026 (late evening) while making these changes.

- **Noise (76.609(e)).** The card offered "one reading corrected by the ratio of 4 MHz to the meter's noise bandwidth" as an alternative. The rule allows it only "if it is established that the noise level is constant within this bandwidth"; the card and the registry row now say so, and also that an amplifier ahead of the meter needs at least 4 MHz of bandwidth with corrections for its gain and noise figure, and that the NCTA Recommended Practices (2nd edition, November 1989) are an allowed alternative.
- **Terminal isolation (76.605(b)(9) and 76.609(g)).** The card said a maker's specification "can stand in for periodic testing". The rule excuses the measurement only when the maker's specifications for tap isolation are based on a representative sample of no fewer than 500 subscriber taps, or laboratory tests by or for the operator on a representative sample of no fewer than 50 subscriber taps, show the 18 dB standard is met, and the operator attaches that evidence as an exhibit to each proof-of-performance record. The card also now carries (b)(9)(ii): reflections from an open or shorted terminal must not cause visible picture impairments at any other terminal. 76.609(g) itself still refers to the standard as 76.605(a)(9); it is now paragraph (b)(9), which the card says.
- **Reference.** `pop-reference.py` now holds the relevant excerpts of the noise and isolation clauses (the constant-noise condition, the 500 and 50 sample minimums, the 18 dB figure and the exhibit), not the whole sections, and ignores rule-section numbers when it extracts limits, so 500 and 50 are in the reference numbers and the test also checks that the conditions are present.
- **Layout.** The tables stack as cards at 700 px and narrower (the global no-wrap rule on table headings had given the row names 274 px and the rule 77 px at 390 px, 3,788 px tall); the source tags are 44 px. "Every row has a source tag" was wrong: 16 of the 19 rows state a limit or a method and have one; the three rows about QAM channels, test conditions and the test report name their rule section and have none. The guide now says so.
