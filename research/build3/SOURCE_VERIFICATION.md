# Build 3 source verification

November 11, 2026 · Carpe Noctum 2.0 Alpha build 3 (in development)

This records how the citations in the threshold and source registry (`night-sweep/thresholds.js`) were checked. The structured findings are in `source-verification.json`; the independent arithmetic is in `field-calcs-reference.py` and its output `field-calcs-reference.json`.

## Method

A background research workflow split the claims into four clusters: the SCTE catalog, DOCSIS upstream pre-equalization, Hranac and SCTE 293-2, and DOCSIS 3.1 OFDM power. One researcher per cluster opened the sources. A second, independent agent then tried to reproduce every claimed document number, title, revision and locator, and downgraded anything it could not reproduce. All 36 findings kept their status after the second pass; two were "contradicted" on purpose (they were wrong assumptions in the prompt, listed below).

SCTE and CableLabs documents are copyrighted. The registry and guides paraphrase them and cite the document number, revision and section only. No text, tables, figures or exam questions are copied.

## What the registry cites

| Registry row | Label | Source as checked | Status |
| --- | --- | --- | --- |
| `const.speedOfLight` | Spec | SCTE 293-2 2024, *What is … Velocity of Propagation?*, section 4.1 (c₀ = 983,571,056.43 ft/s) | Primary, re-verified |
| `calc.db.dbuv`, `calc.db.dbm` | Spec | SCTE 270 2021r1, *Mathematics of Cable* (revision and title confirmed; section not opened). Identities re-derived | Derived |
| `calc.ofdm.bandwidth` | Spec | CableLabs CM-SP-PHYv3.1-I20-230419 sections 7.5.9 and 7.5.9.1 (p. 136); SCTE 258 2026 sections 5.2, 6.2.1 note 4 and 7.2 | Primary, re-verified |
| `calc.preeq.tapDistance` | Expert | CM-GL-PNMP-V03-160725 section 5.5 Table 1 (p. 37), 6.6.2 (p. 64) and 6.8.1.1 item 2 (p. 84), on CableLabs CM-SP-PHYv3.0-I04-070518 section 6.2.16 (pp. 62–64; same text in I09) and 6.2.11.1 | Derived: no document states it as one formula |
| `calc.ripple.distance` | Expert | Hranac, “Linear Distortions, Part 2,” *Communications Technology*, Aug. 2005; SCTE 280 2022 section 9.7 (p. 50) | Primary, re-verified |
| `calc.microreflection.delay` | Expert | Hranac, “Broadband: What is a Micro-Reflection?,” *Communications Technology*, Nov. 2009; SCTE 293-2 2024 section 4.1 (PNMP-V03 Appendix I.5 corroborates from a third-party copy and is not cited) | Primary, re-verified |
| `app.cable.temperatureCoefficient` | Unknown | CommScope MX0398 Rev U (2021) pocket guide, per `night-sweep/research/equipment-audit-build17/passives/README.md`; indexed copy only | Secondary |

Corrections the research made to the build list's wording:

- Cite these documents as **SCTE nnn yyyy**, not ANSI/SCTE. SCTE 280's real title is *Understanding and Troubleshooting Cable RF Spectrum*; its formal type is Industry Reference.
- **SCTE 258 2026** does not say the flat-power formula is invalid for tilted outputs; it says tilted outputs are not covered and points to **SCTE 270 2021r1 section 30.14** (total composite power). The app paraphrases it that way.
- In PHYv3.1 the per-6 MHz rule is the CMTS power-configuration rule, and downstream occupied bandwidth is a whole number of 6 MHz channels, at least 24 MHz, including the taper.
- The pre-EQ **main tap is set by the CMTS**. Tap 8 of 24 is typical practice (PNMP-V03), not a fixed requirement. DOCSIS 3.0 CMs must support 1.28, 2.56 and 5.12 Msym/s; the calculator offers only those three.
- The 492 constant is half the free-space wavelength of 1 MHz in feet (Bell System Practice 402-400-100, 1963, cross-checked with SCTE 293-2). The app uses the exact 491.79.
- The ripple result is the echo path length between two mismatches (CableLabs CM-GL-PNM-HFC-V02-260130), which may or may not start at the test point. The pre-EQ result is likewise the spacing between two mismatches, not the distance from the modem or node (PNMP-V03 section 6.8.1.1, p. 84).
- The pre-EQ distance formula combines the specification's symbol-spaced taps with the best-practice round-trip halving; no document states it as one formula, so the registry labels it Expert, verification Derived.

## Build list "Unconfirmed points" now checked

These are recorded for the next build-list items; no app feature uses them yet.

- **DOCSIS 3.1 CM input (build list item 5).** CM-SP-PHYv3.1-I20-230419 (April 19, 2023, the newest issue) Table 45, section 7.5.11: OFDM −9 to +21 dBmV per 24 MHz; total input below 40 dBmV from 54 to 1794 MHz. SC-QAM −15 to +15 dBmV per 6 MHz comes from CM-SP-PHYv3.0-C01-171207 Table 6-22, which PHYv3.1 section 6.4.2 points to. That DOCSIS 3.0 table gives total input below **33** dBmV, so the 40 dBmV figure must not be applied to a DOCSIS 3.0-only modem.
- **FCC leakage limits (build list item 7).** 47 CFR 76.605(c), Table 1 (eCFR current to Nov. 9, 2026): 15 µV/m at 30 m analog and 13.1 µV/m digital at or below 54 MHz and above 216 MHz; 20 µV/m at 3 m analog and 17.4 µV/m digital above 54 up to 216 MHz. 47 CFR 76.611 (CLI) and 76.1706 (logs) were not checked in this pass.
- **Leak repair practice.** Hranac, “A Leak Is A Leak…Or Is It?,” *Communications Technology* Mid-Day Report, May 2012: some operators repair at the FCC limit, many at roughly 10 or 5 µV/m. This is an observation, not a rule; the company threshold stays unknown until entered.
- **Balance versus sweep.** Hranac, “Frequency Response Testing,” Broadband Library, Feb. 19, 2022: balancing on two downstream signals does not replace sweep.

Still unconfirmed: the 18-month sweep interval, automated sweep grading practice and the noise-funneling math (build list items 10, 13 and 12).
