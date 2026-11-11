# Leakage tools: sources and how they were checked

November 11, 2026 · Lane B (Claude) · build list item 7 · app code in `night-sweep/leakage.js`

FCC rules (47 CFR) are government text and may be quoted; the one-line statements in the app are our own paraphrase with the section named. SCTE material is paraphrased and cited by document number and year only. The leak log is a personal notebook; nothing here is a filing or the operator's official record.

## What was read, and where

| Figure or rule used | Value | Source | Read in this session |
| --- | --- | --- | --- |
| Leakage limits | analog 15 µV/m and digital 13.1 µV/m at 30 m for 54 MHz and below and over 216 MHz; analog 20 µV/m and digital 17.4 µV/m at 3 m over 54 MHz up to and including 216 MHz | 47 CFR 76.605(c), Table 1 to paragraph (c), eCFR text (section last amended 83 FR 7627, February 22, 2018) | Yes, eCFR page fetched with Exa; matches the build list |
| CLI formula | I∞ = (1 ÷ θ) × Σ Ei², Ei in µV/m at 3 m for leaks of 50 µV/m or more; θ = strand length tested ÷ total strand length; 10·log10(I∞) equal to or less than 64 | 47 CFR 76.611(a)(1) (section last amended 83 FR 7629, February 22, 2018) | Yes. The eCFR prints the equation as an image; the Cornell LII copy of the same section carries it as text (I∞ = 1/θ Σ Ei²). An FCC calculator page and a third-party calculator describe the same formula |
| CLI conditions | annual test, no more than 12 months apart, sample of at least 75% of the strand including suspect parts; test signal in 108–137 MHz or correlated to it | 47 CFR 76.611(a)(1), (b); FCC Signal Leakage Report Form 320 Q&A (CLI once a year, 12-month spacing, up to 90 days to run, correlation outside 108–137 MHz) | Yes |
| New plant | no individual leak above 20 µV/m (analog) or 17.4 µV/m (digital) at 3 m | 47 CFR 76.611(e)(2) | Yes; recorded here, not a separate card |
| Leak log | date and location of each leakage source identified under § 76.614, date repaired, probable cause; kept two years; five years for a system under 1,000 subscribers that uses its § 76.614 monitoring and log to meet the leakage-testing duty (47 CFR 76.601(d), text read on the Cornell LII copy) | 47 CFR 76.1706 | Yes |
| Inverse-distance restatement | E at 3 m ≈ E at d × d ÷ 3; near-field edge ≈ wavelength ÷ 2π (rule of thumb) | Far-field relation (power density falls with the square of distance, so field strength with distance). **SCTE 221 2020 (R2026)**, Field Strength Tutorial & Calculation of LTE User Equipment Field Strength, defines the far field and says leakage field-strength measurements are made there. SCTE 293-12 2025, the series monograph on signal leakage field strength, was identified from its catalog summary only | **Secondary.** SCTE 221: title page, number, year and the reaffirmation (R2026) confirmed on the CableLabs library copy; its definitions (§ 5.2) and field-strength section (§ 6) were read by an independent review agent, not re-read by me. SCTE 293-12's body was not read, so nothing is credited to it. The one-line relation is derived, not quoted. Before the review this row credited the far-field statement to 293-12, which the review showed was not what had been read |
| Detector calibration methods | a directly connected RF source (general accuracy) and a calibrated field strength, called a calibrated leak (outdoor check) | SCTE 289, Operational Practice for Building and Using Calibrated Leaks, 2024r1 | **Secondary.** SCTE catalog summary only; the practice was not read |

## Choices the tools make

- **The CLI counts only leaks of 50 µV/m or more at 3 m.** Smaller entries are listed as not counted. A leak of exactly 50 counts.
- **No leaks counted gives no index.** The sum is zero, 10·log10 of zero is not a number, and the card says so instead of showing 0 or minus infinity.
- **The card does not correlate frequencies.** The rule and the FCC's own calculator correlate a test frequency outside 108–137 MHz to that band. The correlation is not implemented; the card says strengths must already be on the 108–137 MHz basis.
- **A reading at another distance is restated by the inverse-distance relation and flagged approximate.** The limit check restates to the rule's own distance (3 m, or 30 m in the lower and upper bands); the 30 m limits are in Table 1, while § 76.609(h) fixes the dipole at 3 m, so restating between the two is the app's own approximation. A restated pass gets a neutral mark, not a green check. Under 3 m, or inside wavelength ÷ 2π at the entered frequency, the card warns that the relation may not hold.
- **A leak counts in the CLI only when it is measured 3 m from the leak, is at least 50 µV/m, and the test frequency is in 108–137 MHz (76.611(a)(1), (b)(1)).** Any other frequency, or no frequency, is shown as needing correlation or a frequency; a reading restated from another distance is shown as "would count".
- **Table 1 limits the field a system may produce; § 76.614 separately expects aeronautical-band leaks of 20 µV/m or more at 3 m to be noted and repaired in a reasonable period.** The review found the first draft said the limits were not repair targets and that many operators repair sooner, which had no source; both statements are gone. § 76.614 (read on the Cornell LII copy) has its own registry row. The company repair threshold is its own addition, starts unknown and is entered by the user.
- **The log stores a location and no customer data.** The screen tells the technician to use a pole, tap or cross street, and the entry fields are length-limited and stripped of control characters. CSV cells that a spreadsheet could read as a formula start with an apostrophe.
- **Storage is one device-local key, `nightsweep-leakage-v1`,** outside the job and its backups. Every write re-reads what is stored, so a second tab's entries are not erased, and re-applies any change this browser could not store, so nothing disappears after a failed write. Stored data is sanitized entry by entry when read (dates, ids, lengths and counts); unreadable data is copied to `nightsweep-leakage-v1-unreadable` before it is replaced, and data from a later version is never overwritten. Saved detector checks keep the tolerance in force when they were saved. Editing one company setting never changes the other.
- **The CLI card takes leaks separated by spaces, new lines or semicolons;** a comma counts only when a space follows it. A comma inside a number (1,500 or 120,5) is refused rather than read as two leaks. The fraction examined is limited to 0.001–1, and the fraction and strand miles cannot both be given.

## Not verified, and left out

- SCTE 289 and SCTE 293-12 bodies were not read. Re-check the detector-check wording against SCTE 289, and the normalizer's validity limit against both, when they can be opened. SCTE 221's far-field text was read by a review agent, not by me.
- The aeronautical-band monitoring cycle (every three months) and § 76.610's power thresholds are recorded in the registry row but not tracked or applied.
- The half-wave dipole voltage to field-strength conversion (two published constants, 20 and 0.021, differ by about 5%) is not implemented.
- The airspace-measurement alternative (10 µV/m at 450 m), per-job leak logs, GPS or live detector data, and the correlation for other test frequencies are not built.
- Company repair thresholds and detector tolerances are unknown until a person enters them.

## Tools used

Exa web fetch and search for the eCFR text, the Cornell LII copy and the FCC pages. Firecrawl was out of credits. The independent arithmetic is `leakage-reference.py` (Python `decimal`, 50 digits): it reproduces the build list worked example (leaks of 100, 60 and 50 µV/m at θ = 0.8 give a sum of squares of 16,100, I = 20,125 and 43.04 dB) and the FCC-calculator-style example (120, 85, 60, 250 and 50 at 0.8 give 50.52 dB). Wolfram was not available.
