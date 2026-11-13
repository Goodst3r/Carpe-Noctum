# P3 GainMaker EQ transcription packet

Prepared for Grok’s postimplementation source cross-check. This packet is selected facts and citations, not a copy of the OEM PDFs. The independent raw-source fixture was parsed before production code existed. `qa/gainmaker-eq.test.cjs` compares every production loss cell, all standard 42 nominal labels/endpoints and the 24 published B tilt values against that fixture, then checks F1–F3/R1–R3 and physical/domain invariants.

## Evidence and access

- A: ATX ANW1513 Rev.02/2021, p.2 forward cable 1/1.2 GHz, p.4 standard 42 endpoints, p.5 standard 204 endpoints. Download SHA256 `75b37fb522d73829d149e245028d2fe199c80eb163ed522aa5e904fe4e8e1d14`; p.2/4/5 reopened visually in this P3 session. [PDF](https://digicomm.com/wp-content/uploads/2021/07/ANW1513_GigaXtend_GMC_Amp_Accessories.pdf).
- B: Cisco OL-31156-01, February 2014, p.98 standard 42 nine-column loss table; pp.104/106 orderable/legacy aliases. Direct mirror 403; indexed manufacturer text retrieved through Firecrawl. All 24 5/42 endpoints and 12 nominal 42 labels match A. Not a visual Cisco PDF check. [Mirror](https://manuals.plus/m/d2eb08707208f268def0b7521da0a8ff03c6fe6269ae602aeb025a42cc436bf7).
- D: Scientific Atlanta 716336 Rev D, October 2005, pp.2/6; direct mirror 406, Firecrawl indexed manufacturer PDF content retrieved. p.6 5/40/42 endpoint facts agree with B; source conditions 20°C. A’s temperature/tolerance remains unspecified. [Mirror](https://www.edge-bbs.com/wp-content/uploads/2014/05/Scientific-Atlanta-Gainmaker-Amp-Access.pdf).
- C: current retrieval exposed the viewer only. The earlier source-register cross-check remains attributed to that earlier review; no new C table verification is claimed.
- E: retired LE PDF redirected repeatedly. Cisco 1.2 GHz exact aliases and input+output slot warning use the supplied [Grok preimplementation review](https://github.com/Goodst3r/Carpe-Noctum/pull/52#pullrequestreview-5886789366), not a claimed new live PDF open. The reviewed LE Table 8 conflicts with ATX about 1002/1218 nominal basis; ATX loss data controls.

## Cross-check map

| Dataset | Numeric loss cells | Dash cells | Source columns |
|---|---:|---:|---|
| forward-cable-1g |180|9|A p.2:52/70/86/550/600/650/750/870/1002 MHz|
| forward-cable-1p2g |280|14|A p.2:52/70/86/105/204/258/550/600/650/750/870/1002/1100/1218 MHz|
| standard-return-42 |108|3|B p.98:5/10/15/20/25/30/35/40/42 MHz|
| standard-return-204 |24|2|A p.5:5/204 MHz|

Total 68 nominal choices; 592 numeric loss cells and 28 source-dash cells. Zero rows are known parts with no numeric curve. The 42 jumper has published dash cells at 5/40/42 only (D p.6); its uncharted intermediate frequencies are unknown and are not transcribed as source cells. The 42 zero ATX printed 204M anomaly is metadata, never an invented 42M-0 identifier; Cisco 204 zero alias is absent. The 20 legacy 1 GHz adapters retain exact prior labels and points, including Cisco 1000 and D 1002 columns.

## Independently parsed source facts

### A p.2, 1 GHz blue

Loss vector frequencies (MHz): `52, 70, 86, 550, 600, 650, 750, 870, 1002`.

| Order | Printed 42 nominal (if applicable) | Loss vector (dB) |
|---:|---:|---|
|0.0|—|-, -, -, -, -, -, -, -, -|
|1.5|—|2.2, 2.2, 2.1, 1.4, 1.4, 1.3, 1.2, 1.1, 1.0|
|3.0|—|3.4, 3.3, 3.2, 1.9, 1.8, 1.7, 1.5, 1.2, 1.0|
|4.5|—|4.6, 4.4, 4.3, 2.3, 2.1, 2.0, 1.7, 1.4, 1.0|
|6.0|—|5.8, 5.6, 5.4, 2.7, 2.5, 2.3, 1.9, 1.5, 1.0|
|7.5|—|7.0, 6.7, 6.5, 3.2, 2.9, 2.6, 2.1, 1.6, 1.0|
|9.0|—|8.2, 7.9, 7.7, 3.6, 3.3, 3.0, 2.4, 1.7, 1.0|
|10.5|—|9.4, 9.0, 8.8, 4.0, 3.7, 3.3, 2.6, 1.8, 1.0|
|12.0|—|10.6, 10.2, 9.9, 4.5, 4.0, 3.6, 2.8, 1.9, 1.0|
|13.5|—|11.8, 11.3, 11.0, 4.9, 4.4, 3.9, 3.1, 2.0, 1.0|
|15.0|—|13.0, 12.5, 12.1, 5.3, 4.8, 4.3, 3.3, 2.2, 1.0|
|16.5|—|14.2, 13.6, 13.2, 5.8, 5.2, 4.6, 3.5, 2.3, 1.0|
|18.0|—|15.4, 14.8, 14.3, 6.2, 5.5, 4.9, 3.7, 2.4, 1.0|
|19.5|—|16.6, 15.9, 15.4, 6.6, 5.9, 5.3, 4.0, 2.5, 1.0|
|21.0|—|17.8, 17.1, 16.5, 7.1, 6.3, 5.6, 4.2, 2.6, 1.0|
|22.5|—|19.5, 18.7, 18.1, 8.0, 7.2, 6.4, 4.9, 3.2, 1.5|
|24.0|—|20.7, 19.9, 19.2, 8.4, 7.6, 6.7, 5.2, 3.4, 1.5|
|25.5|—|21.9, 21.0, 20.3, 8.8, 7.9, 7.1, 5.4, 3.5, 1.5|
|27.0|—|23.1, 22.2, 21.5, 9.3, 8.4, 7.4, 5.6, 3.6, 1.5|
|28.5|—|24.3, 23.3, 22.6, 9.7, 8.7, 7.7, 5.8, 3.7, 1.5|
|30.0|—|25.5, 24.5, 23.7, 10.1, 9.1, 8.0, 6.1, 3.8, 1.5|

### A p.2, 1.2 GHz green

Loss vector frequencies (MHz): `52, 70, 86, 105, 204, 258, 550, 600, 650, 750, 870, 1002, 1100, 1218`.

| Order | Printed 42 nominal (if applicable) | Loss vector (dB) |
|---:|---:|---|
|0.0|—|-, -, -, -, -, -, -, -, -, -, -, -, -, -|
|1.5|—|2.23, 2.19, 2.15, 2.11, 1.95, 1.87, 1.55, 1.50, 1.45, 1.37, 1.27, 1.16, 1.09, 1.00|
|3.0|—|3.5, 3.4, 3.3, 3.2, 2.9, 2.7, 2.1, 2.0, 1.9, 1.7, 1.5, 1.3, 1.2, 1.0|
|4.5|—|4.7, 4.6, 4.4, 4.3, 3.8, 3.6, 2.6, 2.5, 2.4, 2.1, 1.8, 1.5, 1.3, 1.0|
|6.0|—|5.9, 5.7, 5.6, 5.4, 4.8, 4.5, 3.2, 3.0, 2.8, 2.5, 2.1, 1.6, 1.3, 1.0|
|7.5|—|7.2, 6.9, 6.7, 6.6, 5.7, 5.4, 3.7, 3.5, 3.2, 2.8, 2.3, 1.8, 1.4, 1.0|
|9.0|—|8.4, 8.1, 7.9, 7.7, 6.7, 6.2, 4.3, 4.0, 3.7, 3.2, 2.6, 2.0, 1.5, 1.0|
|10.5|—|9.6, 9.3, 9.0, 8.8, 7.6, 7.1, 4.8, 4.5, 4.2, 3.6, 2.9, 2.1, 1.6, 1.0|
|12.0|—|10.8, 10.5, 10.2, 9.9, 8.6, 8.0, 5.4, 5.0, 4.6, 3.9, 3.1, 2.3, 1.7, 1.0|
|13.5|—|12.1, 11.7, 11.3, 11.0, 9.5, 8.9, 5.9, 5.5, 5.1, 4.3, 3.4, 2.4, 1.8, 1.0|
|15.0|—|13.3, 12.9, 12.5, 12.1, 10.5, 9.7, 6.5, 6.0, 5.5, 4.6, 3.6, 2.6, 1.9, 1.0|
|16.5|—|14.5, 14.0, 13.7, 13.2, 11.4, 10.6, 7.0, 6.5, 6.0, 5.0, 3.9, 2.8, 1.9, 1.0|
|18.0|—|15.8, 15.2, 14.8, 14.3, 12.4, 11.5, 7.6, 7.0, 6.4, 5.4, 4.2, 2.9, 2.0, 1.0|
|19.5|—|17.0, 16.4, 16.0, 15.4, 13.3, 12.3, 8.1, 7.5, 6.9, 5.7, 4.4, 3.1, 2.1, 1.0|
|21.0|—|18.2, 17.6, 17.1, 16.6, 14.3, 13.2, 8.7, 8.0, 7.3, 6.1, 4.7, 3.2, 2.2, 1.0|
|22.5|—|20.0, 19.3, 18.8, 18.2, 15.2, 14.1, 9.7, 9.0, 8.3, 7.0, 5.5, 3.9, 2.8, 1.0|
|24.0|—|21.2, 20.5, 19.9, 19.3, 16.2, 15.0, 10.3, 9.5, 8.8, 7.3, 5.7, 4.1, 2.9, 1.0|
|25.5|—|22.4, 21.7, 21.1, 20.4, 17.1, 15.8, 10.8, 10.0, 9.2, 7.7, 6.0, 4.2, 3.0, 1.0|
|27.0|—|23.6, 22.8, 22.2, 21.5, 18.1, 16.7, 11.3, 10.5, 9.7, 8.1, 6.3, 4.4, 3.0, 1.0|
|28.5|—|24.9, 24.0, 23.4, 22.6, 19.0, 17.6, 11.9, 11.0, 10.1, 8.4, 6.5, 4.5, 3.1, 1.5|
|30.0|—|26.1, 25.2, 24.5, 23.7, 20.0, 18.4, 12.5, 11.5, 10.6, 8.8, 6.8, 4.7, 3.2, 1.5|

### B p.98,standard 42

Loss vector frequencies (MHz): `5, 10, 15, 20, 25, 30, 35, 40, 42`.

| Order | Printed 42 nominal (if applicable) | Loss vector (dB) |
|---:|---:|---|
|1|1|1.7, 1.5, 1.4, 1.3, 1.2, 1.1, 1.1, 1.0, 1.0|
|2|2|2.3, 2.0, 1.8, 1.6, 1.4, 1.3, 1.1, 1.0, 1.0|
|3|3.1|3.0, 2.5, 2.2, 1.9, 1.6, 1.4, 1.2, 1.0, 0.9|
|4|4.1|3.6, 3.0, 2.6, 2.2, 1.9, 1.6, 1.3, 1.0, 0.9|
|5|5.1|4.3, 3.5, 3.0, 2.5, 2.1, 1.7, 1.3, 1.0, 0.9|
|6|6.1|4.9, 4.1, 3.4, 2.8, 2.3, 1.8, 1.4, 1.0, 0.9|
|7|7.2|5.6, 4.6, 3.8, 3.1, 2.5, 2.0, 1.5, 1.0, 0.8|
|8|8.2|6.2, 5.1, 4.2, 3.4, 2.7, 2.1, 1.5, 1.0, 0.8|
|9|9.2|6.9, 5.6, 4.6, 3.7, 2.9, 2.2, 1.6, 1.0, 0.8|
|10|10.2|7.5, 6.1, 5.0, 4.0, 3.2, 2.4, 1.7, 1.0, 0.8|
|11|11.3|8.2, 6.6, 5.4, 4.3, 3.4, 2.5, 1.7, 1.0, 0.7|
|12|12.3|8.9, 7.1, 5.8, 4.6, 3.6, 2.7, 1.8, 1.0, 0.7|
|0|0|source dashes; all losses unknown|

### A p.5,standard 204

Loss vector frequencies (MHz): `5, 204`.

| Order | Printed 42 nominal (if applicable) | Loss vector (dB) |
|---:|---:|---|
|1|—|1.9, 1.0|
|2|—|2.7, 1.0|
|3|—|3.6, 1.0|
|4|—|4.4, 1.0|
|5|—|5.3, 1.0|
|6|—|6.1, 1.0|
|7|—|7.0, 1.0|
|8|—|7.8, 1.0|
|9|—|8.7, 1.0|
|10|—|9.5, 1.0|
|11|—|10.4, 1.0|
|12|—|11.2, 1.0|
|0|0|source dashes; all losses unknown|

## Focus checks for the reviewer

- Check every row above against source pages, including 1.2 GHz 1.5 row’s two decimals and 28.5/30 endpoint 1.5. Check 42 standard values separately from thermal. Confirm B 40 MHz column 1.0 differs from 42 MHz for orders 3–12.
- At 11 MHz, 42 order 6 = 3.96 estimated; strictly 5–10 unknown. 204 interior unknown at every frequency. 1 GHz 86–550 and 1.2 GHz 105–204/258–550 gaps unlicensed under max ratio 1.5.
- F3 old 6→new 12 at 258/1218 output −3.5/0; high-minus-low output tilt change +3.5. Nominal 6.1 is not actual 42 tilt 4.0.
- Existing installed-model 1 GHz profiles/procedure/pads remain unchanged; no new 1.2 GHz models or reverse solver. Library compatibility refuses wrong model/split/direction/slot and AOI plug-ins. Tools catalog/reference calculation is independent of installed hardware.
- Reference selectors are transient and never write saved criteria, measurements, histories or original evidence. Known endpoints remain visible beside unknown dependent outputs.

Files: `night-sweep/gainmaker-eq.js`; independent source fixture `qa/fixtures/gainmaker-eq/source-facts.json`; preexisting adapter fixture `qa/fixtures/gainmaker-eq/legacy-forward-items.json`; tests `qa/gainmaker-eq.test.cjs` and `qa/gainmaker-eq-layout.test.py`. Raw PDFs/index extracts remain outside the repository.
