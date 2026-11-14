# GainMaker EQ evidence for the next build
Reviewed 2026-11-13 UTC. Research only; these are manufacturer catalog values, not a verified inventory of Spencer's truck stock. Confirm the installed module, EQ label and part family before recommending a part.

## Source register
- **A:** ATX, GigaXtend GMC Amplifier Accessories, **ANW1513 Rev.02/2021**. [OEM product page](https://atx.com/products/amplifiers/gigaxtend-gmc-amplifier-accessories/) and [OEM-authored PDF hosted by distributor Digicomm](https://digicomm.com/wp-content/uploads/2021/07/ANW1513_GigaXtend_GMC_Amp_Accessories.pdf). Pages 1–2: compatibility and forward cable EQs; pages 4–5: standard reverse EQs. Download SHA-256: `75b37fb522d73829d149e245028d2fe199c80eb163ed522aa5e904fe4e8e1d14`. Pages 2, 4 and 5 visually checked against the tables, not just extracted text.
- **B:** Cisco system-amplifier guide **OL-31156-01, February 2014**, printed pp.96,98,104,106. [OEM-manual mirror](https://manuals.plus/m/d2eb08707208f268def0b7521da0a8ff03c6fe6269ae602aeb025a42cc436bf7). Original Cisco link is retired. Mirror text, not a visually verified PDF.
- **C:** Cisco line-extender guide **OL-31155-01, May 2014**, printed pp.98,100,105,107. [OEM-manual transcription](https://studylib.net/doc/18909323/1-ghz-gainmaker-broadband-amplifier-platform-line). Standard 42 MHz return intermediate points textually cross-checked with B; endpoints also agree with A and D.
- **D:** Scientific Atlanta, GainMaker Amplifier Accessories, **716336 Rev D, October 2005**, pp.1,2,6. [OEM PDF mirror](https://www.edge-bbs.com/wp-content/uploads/2014/05/Scientific-Atlanta-Gainmaker-Amp-Access.pdf).
- **E:** Cisco 1.2 GHz LE **C78-736684-02, April 2019**, Table 8, and HGD **C78-736468-03, June 2019**, pp.10–11: Cisco accessory part families. [LE](https://www.cisco.com/c/en/us/products/collateral/video/gainmaker-amplifiers/datasheet-c78-736684.pdf), [HGD](https://www.cisco.com/c/en/us/products/collateral/video/gainmaker-amplifiers/datasheet-c78-736468.pdf). Retired links may fail; use A's independently named ATX parts without presenting them as Cisco-branded parts.

Publish factual values, citations and our calculations. Do not commit these vendor PDFs, proprietary config files, or SCTE/NCTI text.

## Four distinct families

| Family | Published nominal choices | Part identification | Source |
|---|---|---|---|
| Forward cable, 1 GHz / 1002 MHz, blue | 0 jumper; 1.5–30 dB in 1.5 dB steps | Cisco 4007228–4007248; ATX GAGM-EQC-1G-{value} | A p.2; B p.96; D p.2 |
| Forward cable, 1.2 GHz / 1218 MHz, green | 0 jumper; 1.5–30 dB in 1.5 dB steps | Cisco GM-EQC-1.2G-{value}=; ATX GAGM-EQC-1.2G-{value} | A p.2; E |
| Standard return, 42 MHz | 0 jumper; ordering values 1–12; 42 MHz labels differ as below | Cisco 589628–589639 / GM-EQREV-{1..12}-40M=; jumper 712719 / GM-EQREV-0=; ATX GAGM-EQREV-42M-{1..12} | A p.4; B p.98/106; C p.100/107; D p.6 |
| Standard return, 204 MHz | 0 jumper; 1–12 dB in 1 dB steps | Cisco GM-EQREV-204M-{1..12}=; ATX GAGM-EQREV-204M-{0..12} | A p.5; E |

Forward list expanded: **0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15, 16.5, 18, 19.5, 21, 22.5, 24, 25.5, 27, 28.5, 30 dB** [A p.2].
These are cable-equivalent nominal values. They are not the measured attenuation at one pilot or the actual tilt across a selected span. Forward linear EQ, inverse EQ, interstage EQ and return thermal EQ are separate families and are not interchangeable datasets.

ATX's 42 MHz zero row prints `GAGM-EQREV-204M-0`; retain that source anomaly in provenance. Do not invent a `42M-0` part number. All zero rows show dashes for insertion loss; a jumper is not a documented zero-loss curve.

A describes common accessories for GainMaker/GigaXtend system amplifiers and line extenders. This supports accessory compatibility, not permission to convert a 1 GHz/42 MHz amplifier into 1.2 GHz/204 MHz hardware. Match the installed module, diplex, direction and slot. No AOI plug-in EQ is implied.

## Standard return endpoint losses
All attenuation and nominal values are dB. Source A pp.4–5; 42 MHz endpoints cross-checked B/C/D. Typical values, not tolerances or acceptance limits. Bandwidth and per-channel/total power are not applicable to these passive insertion-loss ratios; measurement plane is across the EQ, with matched RF ports (75 ohm HFC application; no arbitrary 50 ohm conversion).

| Ordering value | 42 MHz printed nominal | 42-family loss at 5 MHz | at 42 MHz | 204-family loss at 5 MHz | at 204 MHz |
|---:|---:|---:|---:|---:|---:|
| 0 jumper | 0 | unknown | unknown | unknown | unknown |
| 1 | 1.0 | 1.7 | 1.0 | 1.9 | 1.0 |
| 2 | 2.0 | 2.3 | 1.0 | 2.7 | 1.0 |
| 3 | 3.1 | 3.0 | 0.9 | 3.6 | 1.0 |
| 4 | 4.1 | 3.6 | 0.9 | 4.4 | 1.0 |
| 5 | 5.1 | 4.3 | 0.9 | 5.3 | 1.0 |
| 6 | 6.1 | 4.9 | 0.9 | 6.1 | 1.0 |
| 7 | 7.2 | 5.6 | 0.8 | 7.0 | 1.0 |
| 8 | 8.2 | 6.2 | 0.8 | 7.8 | 1.0 |
| 9 | 9.2 | 6.9 | 0.8 | 8.7 | 1.0 |
| 10 | 10.2 | 7.5 | 0.8 | 9.5 | 1.0 |
| 11 | 11.3 | 8.2 | 0.7 | 10.4 | 1.0 |
| 12 | 12.3 | 8.9 | 0.7 | 11.2 | 1.0 |

B/C also publish standard 42-family losses at **5,10,15,20,25,30,35,40,42 MHz**. Example ordering value 6 (42-label 6.1):

| MHz | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 42 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Loss dB [B p.98; C p.100] | 4.9 | 4.1 | 3.4 | 2.8 | 2.3 | 1.8 | 1.4 | 1.0 | 0.9 |

**11 MHz is not a published point.** If the existing explicitly labelled piecewise-linear estimate policy is retained, the 6-part estimate at 11 MHz is `4.1+(3.4-4.1)*(11-10)/(15-10)=3.96 dB`. It must say estimated, not OEM exact. A-only 204 data has no intermediate points: no credible 11 MHz loss or complete 11–204 curve was found. Do not fit a line from 5 to 204 and call it verified.

## Forward loss reference rows
Source A p.2; 1 GHz also B/C/D. Same conditions as passive cases above, typical loss and no supplied hardware tolerance. Zero dashes remain unknown.

| MHz | 52 | 70 | 86 | 105 | 204 | 258 | 550 | 600 | 650 | 750 | 870 | 1002 | 1100 | 1218 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 12 dB 1 GHz cable EQ | 10.6 | 10.2 | 9.9 | — | — | — | 4.5 | 4.0 | 3.6 | 2.8 | 1.9 | 1.0 | — | — |
| 12 dB 1.2 GHz cable EQ | 10.8 | 10.5 | 10.2 | 9.9 | 8.6 | 8.0 | 5.4 | 5.0 | 4.6 | 3.9 | 3.1 | 2.3 | 1.7 | 1.0 |

Dashes in this summary are unavailable points, not zeros. Do not bridge the 1 GHz 86–550 MHz gap. B/C call the top column 1000 MHz; A/D call it 1002. Existing source-specific 1000/1002 provenance must survive refactoring.

## Independently calculated acceptance cases
Numerical arithmetic tolerance 1e-9 dB; display 0.1 dB. That is not a claimed manufacturing tolerance. Forward/return split and family must be explicit; these EQ-only cases need no node target, measurement bandwidth, transmitter power or company acceptance threshold.

1. **F1:** 1 GHz 12-part at 52 and 1002: `10.6-1.0=9.6 dB` relative tilt. Not 12 [A p.2].
2. **F2:** 1.2 GHz 12-part at 52 and 1218: `10.8-1.0=9.8 dB`; at 258 and 1218: `8.0-1.0=7.0 dB` [A p.2].
3. **F3:** 1.2 GHz change 6 to 12 at 258/1218: old losses 4.5/1.0, new 8.0/1.0. Output change `oldLoss-newLoss=-3.5/0.0 dB`; high-minus-low tilt increases 3.5 dB [A p.2].
4. **R1:** 42-family 6-part at 5/42: `4.9-0.9=4.0 dB` actual tilt, despite 6.1 nominal at 42 [A p.4].
5. **R2:** same part at 15/42: `3.4-0.9=2.5 dB`; 11/42 estimate `3.96-0.9=3.06 dB`, explicitly estimated [B p.98; C p.100].
6. **R3:** 204-family 6-part at 5/204: `6.1-1.0=5.1 dB`; at 11/204, loss and tilt are **unknown** [A p.5].
7. **Reject:** 204 EQ selected for a 42-only reverse module; 1 GHz curve above 1002; a forward part used as a return part; blank/nonfinite/negative frequency; nonexistent 13 dB standard return part; uncharted zero jumper used as a solver candidate; AOI automatic alignment treated as a GainMaker plug-in.
8. **Keep independent outputs:** unavailable 11 MHz loss does not hide the documented 204 MHz 1.0 dB loss or the part list.

Before implementation Grok reopens the cited tables and checks transcription; ChatGPT recomputes these calculations. Claude later checks only new-source transcription/remaining release issues, not another complete gate.
