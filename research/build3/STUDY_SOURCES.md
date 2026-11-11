# Study mode: how the questions are made and checked

November 11, 2026 · Lane B (Claude) · build list item 19 · code in `night-sweep/study-mode.js`, screen Test → Study

## No outside questions

The build list says study mode is "original practice questions built from the app's own calculators and exercises, tagged by the five SCTE BDS domains … Never copies SCTE or NCTI questions." No SCTE or NCTI question, answer key, exam blueprint or item bank was read or used. The five domains (architectures; distribution components; signal types; maintenance and troubleshooting; safety and construction) are the build list's wording for the grouping; the questions do not claim to follow any exam.

## How a question is made

Nineteen generators, each tied to the screen it practices: three architecture questions (aeronautical-band direction, which split starts at an edge, the gap between the edges), four distribution-component questions (ideal splitter loss, fiber link loss, fiber color, unity gain), five signal-type questions (dBm, dBµV, OFDM power per 6 MHz, an SC-QAM range check, the OFDM level basis), five maintenance and troubleshooting questions (ripple to distance, a leak restated at 3 m, the cumulative leakage index, which impairment card fits a trace, the FCC carrier-to-noise limit) and two safety-and-construction questions (which section of the pre-work safety or outage card holds a reminder). Numbers are picked from a fixed grid by a seeded generator (the same question number and seed always give the same question). Each answer comes from the same function the app uses, so a question cannot disagree with its screen; the working shown after an answer states the formula and the substitution.

## How it was checked

`research/build3/study-reference.py` recomputes the ten numeric answers from each question's own parameters with Python `decimal` (50 digits), using the formulas written out in the script (dBm = dBmV − 10·log10(75 000), dBµV = dBmV + 60, OFDM per 6 MHz, ideal splitter, fiber budget, unity gain, the edge gap, ripple distance from the speed of light, the 3 m restatement and the cumulative leakage index over leaks of 50 µV/m or more). `qa/build3-study.test.cjs` generates 14 seeds of every generator, writes the numeric parameters to a temporary file, runs the script and compares every answer (296 comparisons together with the other checks). Ten deliberate breakages of the generators and the answer check (a wrong formula, a wrong impedance, a blank read as zero, a bad-input box read as blank, a lost right answer, a wrong choice index, parameters that disagree with the prompt) were each caught.

## Choices and limits

- **Answer checking:** a plain decimal only; a blank, a lone minus sign, text, hex or an exponent is refused with a reason and not scored. A refused box (including a number box in the browser's "bad input" state) is never read as an empty answer.
- **Tolerance:** stated per question (0.05 dB, 0.01 dB, 0.5 percent, 1 percent, 0 for whole MHz).
- **Nothing is stored:** the score lives in the page until it is closed; no storage key, no job field.
- **Safety and construction is thin on purpose:** the app holds no construction standard, and a safety quiz that goes beyond the app's own reminder lists would be inventing practice. Those two questions test knowledge of the app's own cards and say so.
- **Not built:** a question bank import, an exam blueprint, spaced repetition, a timer, a printed quiz, questions for the DOCSIS 4.0 ultra-high splits, and anything that needs an answer key from outside the app.

## Not verified

Whether the grouping into the five domains matches how a given exam divides topics. The wording of each question has not been reviewed by an instructor.

## Corrections after Lane A's review of PR #20 (Nov 11, 2026)

- **OFDM power per 6 MHz.** The question gave a total power over a channel width and asked for the power per 6 MHz, which is only meaningful when the power is spread evenly. The prompt now says the channel occupies the stated bandwidth with flat power spectral density, asks for the average per 6 MHz, and the working states the assumption and that an uneven channel's individual 6 MHz segments differ from the average. Lane A cites SCTE 293-10 (2025) section 5.8 with its footnote 6 on per-6 MHz variation, and SCTE 258 (2026) section 6.2.1 note 4 with the official update, which limit the flat-PSD calculation and use a different approach for tilted DAA; I have not read those two sections myself, and the question's arithmetic is unchanged.
- **Tolerance.** The guide says each answer has a stated tolerance, but the screen did not show it. Every number question now says what counts as right (a number of units, a percentage of the correct value, or the exact whole number) beside the answer box.
