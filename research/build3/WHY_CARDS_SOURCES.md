# Why cards: sources and how they were checked

November 11, 2026 · Lane B (Claude) · build list item 18 · code in `night-sweep/why-cards.js`, screen Test → Why cards

## What was read

The SCTE Standards Catalog (account.scte.org/standards/library/catalog/) lists the fourteen documents below; the titles and years on the cards are copied from that table into `research/build3/why-cards-reference.json`, and `qa/build3-why-cards.test.cjs` compares the app with it. The SCTE FAQ states that all SCTE standards are free to download; SCTE keeps the copyright and the catalog says the documents are for the recipient's use only, so **nothing is copied: every card is our own wording** (a test fails if a card repeats a definition phrase from the monographs read).

| Card | Document | What was read |
| --- | --- | --- |
| 1 Decibel | SCTE 293-1 2024 | definitions and key takeaways (PDF text via the CableLabs library copy) |
| 2 Velocity of propagation | SCTE 293-2 2024 | scope, definition, the impedance relation (CableLabs library copy) |
| 3 Return loss | SCTE 293-3 2024 | catalog page (scope); the return-loss definition in 293-1 |
| 4 Loss (attenuation) | SCTE 293-4 2024 | introduction and sections 5.1 to 5.4 (CableLabs library copy) |
| 5 Unity gain | SCTE 293-5 2024 | catalog page (scope); the unity-gain paragraph in 293-4 section 5.4 |
| 6 Skin effect and skin depth | SCTE 293-6 2024 | PDF text (account.scte.org) |
| 7 Long loop ALC | SCTE 293-7 2025 | the SCTE Standards Updates description only |
| 8 S-parameters | SCTE 293-8 2025 | catalog page (scope) |
| 9 RF | SCTE 293-9 2025 | PDF text (account.scte.org), sections 1 and 5 |
| 10 Signal level | SCTE 293-10 2025 | PDF text via the CableLabs library copy, sections 5.5 to 5.9 and the definitions |
| 11 Noise figure | SCTE 293-11 2025 | catalog page (scope) |
| 12 Signal leakage field strength | SCTE 293-12 2025 | catalog page (scope); the dipole conversion is from the Broadband Library article on the same topic |
| 13 Carrier-to-noise ratio | SCTE 293-13 2026 | the SCTE Standards Updates description only; the CNR definition in 293-1 |
| 14 Impedance | SCTE 293-14 2026 | the SCTE Standards Updates description only |

**Cards 7, 13 and 14 rest on a description page, not the document.** The guide names all three (Lane A's review found it named only 13 and 14), and the 75 ohm nominal-impedance row is labeled secondary.

## Choices

- **No figure that is not a definition or a registered row.** The cards use only the base of the logarithm, the 1 millivolt dBmV reference, 75 ohms (`const.coax.impedance`, secondary), a 3 m distance and "per 6 MHz" (the OFDM basis the Calculators already register). Typical VoP percentages, the 13.33 nW reference, frequency ranges and the 1.6 MHz OFDMA basis are left out for that reason; a test fails if another figure appears.
- **Every link goes to a screen that exists** (tested by following each button), and the three topics with no screen in the app say so.
- **Not built:** quizzes (item 19), calculators for S-parameters, noise figure and CNR, and anything beyond a summary of each monograph.

## Not verified

SCTE 293-7, 293-13 and 293-14 were not read beyond their descriptions; 293-3, 293-5, 293-8, 293-11 and 293-12 were read as catalog scope text plus related monographs. Whether a newer issue of any of them exists was not checked.
