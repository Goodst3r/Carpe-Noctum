# Carpe Noctum build list

November 11, 2026 · Claude, for Spencer and ChatGPT/Codex

This is the merged, prioritized list of features to build next. It combines three inputs:

1. Research on the public Spectrum Maintenance Technician job postings and day-to-day duties (Nov 10, 2026).
2. Deep research into NCTI course outlines and SCTE standards, operational practices and certification curricula (Nov 11, 2026).
3. The existing roadmap (`docs/ROADMAP.md`, open in pull request #1).

Nothing here changes the app yet. Each item is a separate, reviewable task. One assistant writes a task on its own branch; the other reviews the same commit.

## Rules every item follows

- **Offline only.** No live modem, CMTS, RPD or smart-amp polling, no XPERTrak or StrataSync sync, no map editing, no accounts, cloud, telemetry or AI. Importing a file the tech already exported is allowed (native ONX exports preferred, no OCR, no values read from screenshots).
- **Every limit is labeled.** Each threshold or target shows where it came from: **spec** (FCC rule, CableLabs spec, SCTE standard), **expert** (published expert guidance), **company** (a local target the tech enters), or **unknown**. It keeps its source, revision, page or table, units, conditions and date. Company targets start as unknown until someone enters them.
- **Keep the plants apart.** 42/54 MHz (GS7000, GainMaker) and 204/258 MHz (Vecima, AOI) stay separate workflows. The 31 dBmV @ 54 MHz / 43 dBmV @ 860 MHz forward references and the 38 dBmV return TX target are company values and stay editable. OEM AGC, ACI DSIM and manual/thermal setups stay separate. No invented pilot codes or borrowed commissioning steps. UBT stays out of new selections; legacy jobs stay readable.
- **Check the math independently.** Every new formula gets a worked example computed outside the app and a regression test against the app's actual output.
- **Respect copyright.** SCTE standards are free to download but copyrighted, and NCTI course material is proprietary. Explain things in our own words and cite the document number and year. Don't copy text, tables, figures or exam questions. FCC rules (47 CFR) are government text and can be quoted.

Sizes assume AI-assisted coding: **S** is an evening, **M** a few evenings, **L** about two weeks.

## The list

### Tier 1: foundation and every-night tools (2.0 alpha)

**1. Threshold and source registry** · M · new (formalizes the "label" idea)
One table of every limit and target the app uses. Tapping a value's tag shows its label, source, revision, page/table, units, conditions and date. Company values are editable and start as unknown.
*Test:* every registry row has its required fields; every registered value the app shows resolves to exactly one row; labels are limited to spec / expert / company / unknown.

**2. Tilt/EQ/pad solver (engine)** · L · refines roadmap item
Inputs: readings at the two pilots (or actual carriers mapped to the 54/860 MHz anchors on 42/54 plant), the station's targets at both pilots, and the pad and EQ values that exact model variant actually accepts. Output: the pad and EQ change that brings level and tilt to target, plus the leftover error. Only catalog values are offered.
*Sources:* NCTI System Technician and Service Technician (amp alignment); Hranac, Broadband Library, Feb 2022 (balance sets pad, EQ, level and tilt from the low and high signals, and does not replace sweep).
*Test:* three hand-worked cases per amp family (flat, high tilt, low level) checked against a spreadsheet; the solver never outputs a value missing from that model's catalog entry.

**3. Station view with split-aware profiles and a unity-gain worksheet** · M (after #2) · merges roadmap station view + Tech III #1
One screen per amp or node: a split banner (42/54 or 204/258), pilots, targets at both pilots, readings, "change pad X→Y, EQ A→B", the return method (Sweepless Sweep or XPERTrak) and a done check. The return side is a worksheet: injection level, result at the receiver, return pad and EQ, and the difference from the company target. The done check separates "balanced" from "swept".
*Sources:* Spectrum MT postings ("set up amplifier (unity gain) and complete distribution sweep"); NCTI Broadband HFC Network Testing and Measurements (return balancing of node, distribution amp and line extender; test-carrier injection); SCTE 293-5 2024 (unity gain); SCTE 293-7 2025 (long-loop ALC).
*Test:* a practice job gives identical station results before and after a backup/restore.

**4. Calculator bundle** · S each · merges roadmap converters, adds two new tools
- **dB converter:** dBmV, dBm, dBµV, mV, mW at 75 Ω and 50 Ω. dBµV = dBmV + 60; dBm = dBmV − 48.75 (75 Ω) or − 46.99 (50 Ω).
- **Ripple to distance:** D (ft) = 492 × VP ÷ ΔF (MHz). Example: VP 0.87, peaks 6 MHz apart → 71.3 ft. Label: expert (Hranac; same relationship in SCTE 280 2022). VP comes from the cable's catalog entry.
- **Pre-EQ tap to distance (new):** for DOCSIS 2.0/3.0 single-carrier upstream (24 taps, main tap usually 8), one tap ≈ 983.6 × VP × symbol period (µs) ÷ 2 ft. At 5.12 Msym/s and VP 0.87 that's about 84 ft (86 ft at VP 0.9); at 2.56 Msym/s about 167 ft. The tech types the tap number from a tool he already has; the app never reads a modem. Show ±½ tap. Not valid for DOCSIS 3.1 OFDMA. Basis: SCTE 297 2025r1, SCTE 280 2022.
- **OFDM power:** total = per-6 MHz power + 10·log10(occupied MHz ÷ 6). Example: 42 dBmV per 6 MHz over 192 MHz → 57.05 dBmV. Label: spec (DOCSIS 3.1 PHY, SCTE 258). Show SCTE 258 2026's warning that this assumes flat power across the band, so it doesn't fit tilted DAA outputs.
- **Micro-reflection delay (new):** delay (ns) = 2 × length (ft) × 1.017 ÷ VP. Label: expert.

*Test:* unit tests with the worked numbers above, cross-checked against SCTE 270 2021r1 (Mathematics of Cable) when coding.

**5. DOCSIS health card** · S · refines roadmap item
Shows a modem or meter reading against the spec range and the company target, each labeled. Spec ranges are capability limits, not operating targets; company windows start as unknown.
*Values to confirm against CableLabs CM-SP-PHYv3.1-I20-230419 (April 2023) before shipping:* downstream −15 to +15 dBmV per 6 MHz; OFDM −9 to +21 dBmV per 24 MHz; total input under 40 dBmV (all three from secondary sources so far); upstream total average output up to 65 dBmV (primary text, issue I08). Anything not confirmed in I20 stays tagged "secondary source".

### Tier 2: night records and compliance (2.0 beta)

**6. Night log and shift handoff** · M · merges roadmap maintenance-window log + shift handoff + Tech III #2
A running log for the window: ticket or change number, node/amp, before/after levels taken from the station view, actions, ROC/dispatch updates, gas and mileage, as-built discrepancies. One tap makes a plain-text handoff note.
*Sources:* Spectrum MT postings (daily logs, time worked, gas sheets; verify as-builts; update ROC/dispatch).
*Test:* a five-station practice night fits its handoff note on one screen; the CSV export reopens cleanly.

**7. Leak log, FCC limits card, distance normalizer, CLI estimator and detector check** · M · merges roadmap leakage card + leak log + Tech III #3
- Limits, 47 CFR 76.605(c), spec: over 54 up to 216 MHz, 20 µV/m at 3 m analog and 17.4 µV/m digital; at or below 54 MHz and above 216 MHz, 15 µV/m at 30 m analog and 13.1 µV/m digital.
- CLI, 47 CFR 76.611, spec: 10·log I∞ ≤ 64, I∞ = (1/θ)·ΣEi², counting leaks ≥ 50 µV/m; θ is the fraction of plant examined.
- Logs, 47 CFR 76.1706, spec: date and location found, date repaired, probable cause, kept two years.
- Company repair threshold: unknown until entered (Hranac notes many operators repair at 10 or 5 µV/m).
- Normalizer, expert: E(3 m) ≈ E(d) × d ÷ 3 (inverse distance; not valid very close to the leak). See SCTE 293-12 2025.
- Detector check: date, method (direct-connected source or half-wave dipole calibrated leak, per SCTE 289 2024r1), expected vs. read.
- High split: note that leakage in the 108–137 MHz aeronautical band is detected from modem OUDP bursts on 204/258 plant.

The app is a personal notebook, not the company's official leak record.
*Test:* leaks of 100, 60 and 50 µV/m with θ = 0.8 → ΣE² = 16,100, ÷ 0.8 = 20,125, 10·log = 43.0 (passes); cross-check against the FCC's sample calculation.

**8. Outage first-response card** · S–M · new (Tech III #7)
Confirm scope, check power, node optics, actives in order, notify ROC, record times. Optional "damage or theft suspected" fields (what was found, times, who was told), following the evidence-collection focus of SCTE's new Critical Infrastructure Protection Subcommittee (2026). Never stores customer identifiers.
*Test:* supervisor reviews it against the local outage procedure before release.

**9. Pre-work safety card** · S · new
Editable checklist before climbing or opening a pedestal: PPE, ladder, climbing gear, traffic control, voltage check, fiber/laser precautions, and a "who knows where I am" time. Opens with "follow company policy" and never claims to be the company procedure.
*Sources:* NCTI Field Safety; SCTE BDS Safety and Construction domain.

**10. Sweep-due tracker** · S · new
Amps from saved jobs with the last sweep and last balance dates, colored by an interval the user sets (default unknown). An 18-month starting interval attributed to Hranac is shown only as unverified guidance until re-checked.
*Test:* synthetic jobs dated 0, 12 and 19 months back show green, yellow and red at an 18-month setting.

### Tier 3: troubleshooting and plant records (2.1)

**11. Impairment decision tree and signature cards** · L · refines roadmap item, merges Tech III #4
Pick what the meter shows (suckout, standing wave, tilt, roll-off, flat loss, resonant peaking, ingress type, CPD, LTE, impulse). Each card follows SCTE's five-step troubleshooting flow: analyze, localize, prioritize, repair, validate. Standing-wave cards open ripple-to-distance and mark candidate spans on the saved route.
*Sources:* SCTE 280 2022 (downstream), SCTE 294 2024r1 (upstream), SCTE PNM course series (Apr 2026), NCTI Return Path Operations.
*Test:* five practice symptoms each lead to the planted fault.

**12. Return path and high-split toolkit** · M · merges roadmap high-split pieces + Tech III #5
A 5–42 and 5–204 MHz band overlay marking FM (88–108) and aeronautical (108–137) bands and the split edges; a divide-and-conquer ingress log; a return injection worksheet; and a noise-funneling calculator.
*Funneling math (expert, to verify against SCTE 293-11, 293-13 and 270):* thermal noise ≈ −57.2 dBmV in 6.4 MHz; one amp's CNR ≈ input − NF + 57.2; N identical amps → subtract 10·log N; combine with the optical link by power addition. Example: 15 dBmV input, NF 8 dB → 64.2 dB; 10 amps → 54.2 dB; with a 45 dB link → 44.5 dB.

**13. Imported sweep grading** · M · new (needs supervisor OK)
Grade a VIAVI sweep export already attached to a job against an editable profile: peak-to-valley, low/high level vs. target, tilt. Spencer clarified November 11 that his meter produces JSON, so the implementation must support the verified JSON structure instead of assuming the originally proposed CSV. Unknown formats or units produce a reason, never a grade. The old n/10 + x peak-to-valley rule is shown only as historical guidance; operators set their own limits.
*Test:* synthetic CSVs with 1.0, 2.5 and 4.0 dB peak-to-valley grade correctly at a 3 dB limit.

**14. Power supply PM record, battery trends and span voltage drop** · M · merges roadmap items
Per supply: input/output volts, load, inverter test, battery string readings by date, chemistry (VRLA, lithium, other), alarms; trend chart; voltage drop span by span (load current × loop resistance from the cable catalog) vs. the active's minimum input from its manual.
*Sources:* Spectrum MT postings (standby power records); NCTI Service Technician; SCTE 238; SCTE projects on outside-plant powering (2025) and lithium standby batteries (2026).

**15. Fiber tools** · M · merges roadmap fiber items
Loss budget, TIA-598 color code, OTDR and optical link acceptance record. The color code and a simple budget can ship early. Loss per km, splice and connector are company or manufacturer values.
*Sources:* NCTI Broadband HFC Network Testing and Measurements, NCTI Fiber Testing & Maintenance, SCTE 181 2025 (free).

**16. Construction and connector checklist in the done check** · S–M · new
*Source:* SCTE 180 2025 (free). Torque, pin length and similar numbers come only from the manufacturer manual stored in the catalog.

**17. High-split / 1.8 GHz guide and R-PHY bring-up checklist** · M each · refines roadmap items
Every step cites an OEM document revision; no invented steps or pilot codes.
*Sources:* SCTE 300 2024 (DOCSIS 4.0 readiness), SCTE 294, OEM documentation.

### Later

**18. "Why" cards from the SCTE 293 series** · M (content) · new
Short explanations in our own words of the 14 "What is…" topics (decibel, velocity of propagation, return loss, loss, unity gain, skin effect, long-loop ALC, S-parameters, RF, signal level, noise figure, leakage field strength, CNR, impedance), each linked to its calculator and citing "SCTE 293-n year".

**19. Study mode** · M · refines roadmap quizzes
Original practice questions built from the app's own calculators and exercises, tagged by the five SCTE BDS domains (architectures; distribution components; signal types; maintenance and troubleshooting; safety and construction). Never copies SCTE or NCTI questions.

**20. FCC proof-of-performance reference card** · S · new
Reference only, from SCTE 204 2025 and the NCTI testing course. Official results belong to engineering.

## Build order

1. Threshold and source registry (#1). Everything else reads from it.
2. Tilt/EQ/pad solver (#2). The station view depends on it.
3. Station view and unity-gain worksheet (#3). The most frequent task on a maintenance night.
4. Calculator bundle (#4). Cheap and used constantly; feeds the impairment cards.
5. DOCSIS health card (#5).
6. Night log and handoff (#6). Pulls before/after levels from the station view.
7. Leak log and FCC card (#7). The biggest compliance risk.
8. Safety and outage cards (#8, #9).

Quick wins that can slot in any time: dB converter, ripple to distance, pre-EQ tap distance, OFDM power, FCC limits and CLI, TIA-598 color code, safety card, sweep-due tracker.

## Don't build, or ask first

**Don't build:** live modem/CMTS/RPD/smart-amp polling (this includes SCTE 297 live pre-EQ capture and SCTE 298 amplifier telemetry), PNM analytics, XPERTrak/StrataSync sync, map editing, customer data, OCR, accounts, cloud, telemetry or AI.

**Ask a supervisor first:** importing company meter files; keeping company targets in a shared build; using the leak log as anything but a personal notebook; producing CLI or proof-of-performance numbers for filings; sharing the app with coworkers; photos or locations tied to addresses.

## Open questions for a supervisor

1. What are our targets for forward levels at both pilots, return injection and receiver levels, tilt, and sweep peak-to-valley, and can they go in the app?
2. What leak repair threshold do we use, and where is the official leak log?
3. Is there a required sweep interval per amp or node?
4. Can I import meter files I exported myself into a personal app?
5. Which Vecima and AOI bring-up documents (and revisions) can I reference?
6. Which NCTI courses and SCTE certifications are expected for each Maintenance Tech level?
7. What battery chemistries are in our standby supplies, and is lithium coming?
8. What should a tech record when vandalism or theft is suspected?
9. Can coworkers use the app, and does it need review before sharing?

## Unconfirmed points

- DOCSIS downstream ranges come from secondary sources and the older PHY issue I08. Confirm against issue I20 before coding.
- Pre-EQ tap distance depends on symbol rate, VP and how a tool numbers taps.
- The SCTE operational practice on automated sweep grading and the 18-month sweep interval were not re-verified.
- The noise-funneling math is standard practice but hasn't been checked against an SCTE primary source yet.
- NCTI's own pages disagree on System Technician seat hours (26 vs. 42).

## Main sources

- NCTI course pages: [Broadband HFC Network Testing and Measurements](https://ncti.com/broadband-hfc-network-testing-and-measurements/), [System Technician](https://ncti.com/system-technician/), [Service Technician](https://ncti.com/service-technician/), [Return Path Operations](https://ncti.com/return-path-operations/), [Field Safety](https://ncti.com/field-safety/), [Master Technician](https://ncti.com/master-technician/)
- SCTE: [standards catalog](https://account.scte.org/standards/library/catalog/), [standards updates](https://www.scte.org/standards/standards-updates/), [SCTE 258](https://account.scte.org/standards/library/catalog/scte-258-docsis3-1-downstream-ofdm-power-definition-calculation-and-measurement-techniques/), [SCTE 289](https://account.scte.org/standards/library/catalog/scte-289-operational-practice-for-building-and-using-calibrated-leaks/), [SCTE 297](https://account.scte.org/standards/library/catalog/scte_297-pre-equalization-based-upstream-frequency-response-measurements/), [SCTE 300](https://account.scte.org/standards/library/catalog/scte_300_best-practices-for-migrating-to-docsis-40/), [PNM course series](https://www.scte.org/blog/new-scte-pnm-series-a-standards-based-approach-to-proactive-network-maintenance/), [BDS certification](https://www.scte.org/bds)
- FCC: [47 CFR 76.605](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-K/section-76.605), [47 CFR 76.611](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-K/section-76.611)
- CableLabs DOCSIS 3.1 PHY issue list: [ITU-T J Suppl. 10 (2024)](https://www.itu.int/epublications/ru/publication/itu-t-j-suppl-10-2024-09-correspondence-between-cablelabs-docsis-specifications-and-itu-t-j-series-recommendations/en)
- Hranac: [Linear Distortions, Part 2](https://www.cablefax.com/archives/linear-distortions-part-2), [A Leak Is A Leak…Or Is It?](https://www.cablefax.com/technology/a-leak-is-a-leak-hellip-or-is-it), [Frequency Response Testing](https://broadbandlibrary.com/frequency-response-testing/)
