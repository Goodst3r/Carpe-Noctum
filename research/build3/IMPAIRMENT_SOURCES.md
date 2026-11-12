# Impairment cards and standing-wave search: sources and how they were checked

November 11, 2026 · Lane B (Claude) · build list item 11 · code in `night-sweep/impairments.js`

SCTE material is paraphrased and cited by document number, year and section only; nothing is copied. Every card says it
is the technician's own aid and not a company procedure. Nothing is read from a meter or modem and nothing is stored.

## What was read, and where

| Used for | Source | Read in this session |
| --- | --- | --- |
| Table of contents of the impairment catalog (sections 9.1 to 9.10); definitions and causes for standing waves (9.7, 9.7.1, 9.7.2), suckout (9.3, 9.3.1, 9.3.2), resonant peaking (9.5, 9.5.1), roll-off (9.6 to 9.6.2), cellular and VHF/UHF ingress (9.4.3, 9.4.4), power-line gap noise (9.4.6), common path distortion (9.4.7) | SCTE 280 2022, Understanding and Troubleshooting Cable RF Spectrum (Industry Reference, Network Operations Subcommittee), the CableLabs/SCTE library PDF `account.scte.org/documents/5475/SCTE_280_2022.pdf` | **Yes, the text** of those sections, through the first part of the document. The text after section 9.7.2 was not retrieved, so sections 9.8 (tilt), 9.9 (excessive flat loss) and 9.10 (pullout) were read **as headings only** |
| The ripple-to-distance rule: distance in feet = 492 × velocity of propagation ÷ peak-to-peak spacing in MHz | SCTE 280 2022 section 9.7 | **Yes.** It is the same relation as the existing Test → Calculators "Ripple to distance" card (half the speed of light, 491.79 ft per microsecond, used unrounded by the app) |
| The five-step workflow: analyze, localize, prioritize, repair, validate; the names of the five course groups and the impairment types in each (reflection, impedance and distortion; frequency and response filtering; signal level and balance; noise and distortion) | SCTE, "New SCTE PNM Series: A Standards-Based Approach to Proactive Network Maintenance," April 30, 2026, <https://www.scte.org/blog/new-scte-pnm-series-a-standards-based-approach-to-proactive-network-maintenance/> | **Yes**, the whole blog post |
| Upstream emphasis for ingress, CPD and impulse | SCTE 294 2024r1, Understanding and Troubleshooting Cable Upstream RF Spectrum | **Catalog summary only** (it complements SCTE 280 for the upstream); its body was not read. Ripple and CPD wording comes from SCTE 280 |

## Choices the cards make

- **Ten cards for ten pictures**, in three groups: ripple and reflections (standing wave), level and frequency response (suckout, resonant peaking, roll-off, tilt, flat loss) and noise and ingress (ingress, cellular ingress, CPD, impulse). They are the ten the build list names (suckout, standing wave, tilt, roll-off, flat loss, resonant peaking, ingress type, CPD, LTE, impulse). Other impairments in the SCTE series (amplifier distortion noise, HPNA, OBI, filters and missing channels, pullout, adjacent-channel alignment) are not built.
- **What it looks like and what causes it follow SCTE 280.** The **five steps under each card are general practice, labeled Expert**, not text from SCTE: SCTE 280 describes the impairments and, in places, how to localize them, but the step-by-step wording is ours. The footer of every card says so.
- **Tilt and excessive flat loss are marked "body not read".** The headings and the PNM course description were read; the section text was not retrieved, so these two cards carry a warning on the screen and are `unverified` in the data. Re-check them against SCTE 280 sections 9.8 and 9.9 when the full text can be read.
- **A candidate is a pair of points on one path of the saved route** (the launch point or an earlier point's end of its span, and a later point's end of its span) whose cable distance is within a search width of the ripple distance. Parallel branches are never added. It follows the route code's own distance (`HFC.routeDistances`) and never touches the route.
- **The search width (±10 percent) is this app's own choice.** No source sets it; it is registered in the Limits list as an Expert value with `unverified` provenance and can be changed for one search. Reading peak spacing off a display is imprecise.
- **No numbers other than the distance rule and descriptive ranges** (for example, cellular interference above about 600 MHz, from SCTE 280 section 9.4.3). No level or depth limit is given: those are a company's.
- **Nothing is stored.** The picker, the spacing, VP and width are only in the page. A test compares the exported project and every storage key before and after.

## Not verified, and left out

- SCTE 280 sections 9.8 to 9.10 and everything after 9.7.2 were not read in full; SCTE 294's body was not read; SCTE's PNM course content (video and exercises) was not seen, only the announcement.
- The cards were not reviewed by a supervisor or field trainer; wording such as "ask the utility RFI group for a power-line source" is a general suggestion, not a company rule.
- No real sweep, spectrum or modem data was used. Every example is synthetic.

## Tools used

Exa web fetch and search for the SCTE 280 PDF, the PNM blog and the SCTE catalog pages. Firecrawl was out of credits.
The independent arithmetic is `impairments-reference.py` (Python `decimal`, 50 digits): it reproduces the app's ripple distance
and its candidate search on the complete practice route with five length variants, fourteen distances and five widths
(350 candidate cases, 1,940 comparisons in the suite). Wolfram was not available.

## Corrections after Lane A's review of PR #13 (Nov 11, 2026)

- **Broadband ingress.** The CPD card used to say that ingress is at fixed frequencies rather than a smooth floor. Lane A read the body of SCTE 280 (2022), section 9.4 and the sections after it, and found that it distinguishes narrow-band from wide-band ingress and that a raised floor alone cannot exclude ingress or identify CPD. The CPD and ingress cards now keep wide-band interference among the look-alikes. I have **not** read that body myself; the earlier attribution of these cards to SCTE 280 rests on the section headings, as stated above, and this correction rests on Lane A's reading.
- **Very long cable** is no longer listed as a cause of flat loss: extra cable is frequency-dependent loss (tilt), and the flat-loss card now says so. Lane A cites SCTE 280 section 9.9 for the cable-loss versus flat-loss distinction; I have not read it.
- **Route search.** The candidate places are recomputed from the current route each time the screen is opened, and a native number box holding only a minus sign is refused with a reason instead of falling back to the 10 % default width (a deliberately empty width box still uses the stated default).
