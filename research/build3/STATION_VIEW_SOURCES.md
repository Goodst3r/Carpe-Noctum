# Build 3 sources for the station view (build list item 3)

November 11, 2026 · researched with Firecrawl only

Build list item 3 is a per-amplifier station view with a return unity-gain worksheet (injection level, level at the receiver, return pad and EQ, difference from the company target) and a done check that separates "balanced" from "swept". Nothing here is built yet. The full findings are in `station-view-research.json`.

## Method and coverage

Three research agents (SCTE references, GainMaker reverse balancing, Quantum18 return and VIAVI return sweep) used only Firecrawl search and scrape, including its PDF parser. A skeptic agent per cluster re-opened every source with Firecrawl. The SCTE and Quantum18/VIAVI checks completed. **Firecrawl credits ran out during the GainMaker check** after it had re-read the system amplifier guide's reverse-balancing section, so its line extender, data sheet and reverse EQ items are marked "not re-verified". The reverse pad values, reverse EQ values and the 42/40 MHz and 65 MHz reverse EQ loss charts were already confirmed against primary sources in `pad-eq-research.json`.

## What the sources establish

| Point | Source | Status |
| --- | --- | --- |
| Unity gain: each amplifier's gain equals the loss of the span upstream of it, so amp to amp is 0 dB. Forward reference point: amplifier output. Return reference point: each return amplifier's input, at the common point of the output diplex filter. Equalizer insertion loss counts. | SCTE 293-5 2024, *What is … Unity Gain?*, §4.2, §5.1–5.1.2, footnotes 6–7 | Primary, free from the CableLabs library |
| **Balanced and swept are different states.** Rough balance sets near-correct levels with a signal level meter; system alignment is amplitude-versus-frequency (sweep) alignment; verification tests follow both. | SCTE 180 2025, *Recommended Practices for Coaxial Cable Construction and Testing*, §13.2.2, §13.3, §13.4 | Primary, free since its 2025 release |
| Return amps are set for a constant input at the unity gain reference point. Source level = level wanted at the reference point + (test point loss + loss from test point to gain block − loss from reference point to gain block). Pad and EQ are adjusted until the headend response matches the reference stored with the source at the node. Keep a per-amplifier history. | SCTE 180 2025 §13.2.2.2, §13.3.1.2, §13.7.1–13.7.2 (Tables 12 and 13 are sample values) | Primary |
| Long loop ALC is DOCSIS station maintenance toward the CMTS receive set point (0 dBmV default, configurable). It is not amplifier alignment. | SCTE 293-7 2025, *What is … Long Loop Automatic Level Control?* | Primary |
| 1.8 GHz FDD amplifiers: −20 dB test points (upstream ±1 dB), an upstream injection point on the diplex common path, and electronic (not plug-in) upstream attenuation and EQ. No mention of unity gain. | ANSI/SCTE 279 2022 §7.2.7, §7.3.2–7.3.7, §7.5 | Primary |
| GainMaker reverse balancing: fiber link first, then from the amplifier nearest the node outward. Inject at the −20 dB forward output / reverse injection test point at the design reverse port input level + 20 dB (guide example 19 + 20 = 39 dBmV). Either fit a temporary 0 dB reverse input pad or expect the receive level lower by that pad. Read at the node's reverse optical receiver test point. Set tilt with the reverse output EQ and level with the reverse output pad (1 dB of pad = 1 dB of receive level). Done when the receive level and tilt match the reference. No numeric reverse tolerance and no "unity" wording. | Cisco OL-31156-01 (Feb. 2014) Chapter 3, Balancing the Reverse Path pp.72–76; same in OL-31155-01 | Secondary (third-party mirror; reproduced by the skeptic for the system amplifier guide) |
| Quantum18 upstream: after downstream alignment of the whole cascade, start at the last amplifier, Auto or Manual (Gain and Tilt only, with a VIAVI ONX-630 in DOCSIS Expert mode), then switch ALSC on for every amplifier. HGD reverse data sheet values (204 split): 27 dB minimum gain, 0 dB internal tilt, 9 dBmV recommended input per 6.4 MHz channel. | AOI Quantum18 SA guide V02102025 printed pp.47–50 (ManualsLib mirror); AOI QB18 HGD data sheet (Internet Archive copy, preliminary) | Secondary / primary |
| VIAVI return sweep: the meter shows, per marker, the level received at the headend, the meter's transmit level and the delta; a saved reference gives referenced deltas. SCU-1800 recommended reverse input 0 dBmV (±20 dB range). On DAA nodes XPERTrak RCI replaces the SCU-1800 with the same meter workflow. | VIAVI OneExpert CATV 630 Extended Quick Start Guide v5.5 (July 2021); ONX/SCU-1800 data sheet; VIAVI R-PHY brief and app note | Primary (slide numbers from extraction, not verified) |

## Values to keep apart in the worksheet

- The **design reverse port input** (from the design print) and the **level wanted at the unity gain reference point** are company or design values. They start unknown.
- The **injection level** is derived: reference-point level + insertion loss. The test point loss is a manufacturer value (−20 dB).
- The **headend or receiver reference** is a system value stored with the source at the node. No source gives a universal number.
- The **38 dBmV return TX reference**, the **SCU-1800's 0 dBmV recommended input**, the **CMTS 0 dBmV receive set point** and the **Quantum18 9 dBmV recommended input** are four different things in four different places.
- GainMaker forward procedures give a ±0.5 dB window; the reverse procedure gives none, so any return tolerance is a company value.

## Not found or not verified

- No source gives a numeric pass/fail rule for "balanced" versus "swept"; SCTE 180 defines them as different activities. The company sets the criteria.
- SCTE 183 2023 (Measurement Recommended Practices, fifth edition) has a return-plant setup tutorial (§16.4) but timed out in Firecrawl; not read.
- The Quantum18 guide's "Example of US settings for 750MHz" table is an image only; not read.
- A claimed ONX rule that reverse TPC plus injection must not exceed 53 was not found in the text; do not implement it.
