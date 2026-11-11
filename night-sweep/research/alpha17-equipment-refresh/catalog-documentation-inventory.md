# NightSweep 1.7 Alpha equipment documentation inventory

Catalog `2026-11-10-build17`; generated 2026-11-10T23:56:56.208124+00:00.

Every current selection has an inventory row and all numerical curves receive structural checks. Source documentation was reviewed at family/configuration level using retained same-session evidence plus one bounded fresh historical mainline review. This is not independent re-transcription of every inherited table cell or hardware validation.

The JSON companion lists every selection ID, curve bounds/basis/source, all source URL fields, mapped setup manuals and revision, per-family evidence, missing data and configuration qualifications. The script is reproducible and does not modify app data.

## Coverage and checks

556 currently selectable records, plus 5 retired compatibility records. Current RF: 514 (23 active, 491 nonactive); cables: 17; power: 22; nodes: 3. The full retained catalog has 561 records in 36 RF families. These are selection records, not distinct physical models. All 1,324 numerical curves / 14,126 rows passed the structural audit, including retained legacy curves; 8 companion watt tables are checked and counted separately. No new numerical correction was identified.

Registry: 37 records (19 manuals, 14 datasheets, 4 exact-manual/source requests). Every current active RF, node and power ID maps to at least one record; a datasheet/request mapping does not mean an exact setup manual exists.

Data validate-data and analyze-data-quality methods were applied. The connected Data namespace exposes an intake form only, so reproducible local Python/Node performs the actual table checks. No separate app or blocking intake was created.

## Current limits and findings

- **retained-guardrail**: Actual installed equipment identity remains user-confirmed; family title alone is insufficient for split, selected output, supply, firmware, control and source revision.
- **current-equipment-scope**: UBT main/aux RF and three UBT power presets are retired from current pickers/workflows; retained only for legacy saved-job readback. HGBT and passive unbalanced three-way outputs remain current.
- **manual-gap**: Exact Quantum18 LE and BA setup manuals remain unavailable; EN9000 commissioning guide requires manufacturer customer access; exact legacy GaN 42/54 source remains unresolved.
- **source-gap**: Some legacy cable PDFs are unavailable or product-family fallbacks. Original curve/DC source is preserved separately; fallback page availability does not certify numeric cells.
- **calculation-qualification**: Passive point interpolation is linear and cable interpolation is square-root frequency between printed points; these are estimates, not measured responses. Source band gaps stay unavailable unless the individual curve explicitly declares adjacent-maximum budgeting.
- **corrected-before-this-inventory**: Printed band upper endpoints now return their source bound; exactly 21 legacy SA Multimedia maximum-through curves carry adjacent-maximum fractional-gap policy. Current source inspected; new runtime check recorded separately.
- **source-provenance-recovered**: Scientific-Atlanta Multimedia mainline original archived document revision recovered and all 72 printed maximum insertion-loss cells plus 3 nominal coupling values matched; no numeric source edits needed.
- **not-zero**: 15 custom-data RF selections need exact entered loss; 6 manual power selections need entered load. Missing manufacturer table is not zero. Cable-only is an explicit zero equipment path.
- **not-watts**: Current curves cannot establish true watts or PF when companion real-power values are absent; passing-current and supply maximum ratings are not station consumption.
- **operating-range**: App RF calculations are limited to 5–1800MHz even when a preserved source table extends to 1825/2000/2050MHz. Table ranges do not automatically establish safe operating voltage or local acceptance targets.
- **temperature**: Built-in cable attenuation and loop resistance use documented engineering temperature factors; passive and equipment load temperature effects are not automatically modeled. Custom actual-condition tables are not corrected twice.

## Family documentation matrix

| RF family | Current / retired | Document/revision or source scope | Evidence |
|---|---:|---|---|
| AOI Quantum18 | 16 / 0 | See exact variant-specific registry records<br>[source 1](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-BA-Datasheet_ES.pdf)<br>[source 2](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-HGBT-SA-Datasheet_ES.pdf)<br>[source 3](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-HGD-SA-Datasheet_ES.pdf)<br>[source 4](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-LE-Datasheet_ES.pdf)<br>[source 5](https://ao-inc.com/content-request-form/)<br>[source 6](https://ao-inc.com/products/hfc-networking/hfc-amplifiers/) | active-specialist-review |
| ATX GigaXtend SGP 1.2GHz AC continuity | 8 / 0 | ANW1524 / current ATX product table<br>[source 1](https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgp-1-2ghz-passives/) | primary-page-reviewed |
| ATX GigaXtend SGP 1.2GHz standard | 7 / 0 | ANW1480 / current ATX product table<br>[source 1](https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgp-1-2ghz-passives/) | primary-page-reviewed |
| ATX GigaXtend SGT 1.25GHz | 18 / 0 | ANW1479 / current ATX product table<br>[source 1](https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgt-1-25ghz-taps/) | primary-page-reviewed |
| ATX GigaXtend XS 2GHz | 7 / 0 | ANW1402 / current ATX product table<br>[source 1](https://atx.com/products/taps-passives/gigaxtend-xs-series-2ghz-taps-passives/gigaxtend-2ghz-hardline-passives/) | primary-page-reviewed |
| ATX GigaXtend XS 2GHz flat taps | 23 / 0 | Existing catalog source and prior audit only<br>[source 1](https://www.covertel.com.au/wp-content/uploads/2023/04/ATX_GigaXtend_2GHz_Taps_DataSheet.pdf) | not-freshly-cell-verified |
| ATX GigaXtend XS 2GHz slope taps — manual data | 11 / 0 | Distinct slope-tap models<br>[source 1](https://atx.com/wp-content/uploads/MD-Notice-Low-Value-Flat-Taps_032024-FINAL.pdf) | user-data-required |
| Antronix CMC5000 DROP / premises / AC-blocking | 3 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/08/CMC5000_Splitters.pdf) | not-freshly-cell-verified |
| Cable-only | 1 / 0 | No source required<br>Entered data / no equipment | not-equipment |
| Cisco Surge-Gap 1.25GHz | 7 / 0 | Existing catalog source and prior audit only<br>[source 1](https://www.cisco.com/c/en/us/products/collateral/video/surge-gap-passives/datasheet-c78-732059.pdf) | not-freshly-cell-verified |
| GainMaker 1 GHz | 7 / 2 | See exact variant-specific registry records<br>[source 1](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d3566.pdf)<br>[source 2](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d356b.pdf)<br>[source 3](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d3574.pdf)<br>[source 4](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d35ae.pdf)<br>[source 5](https://www.cisco.com/c/dam/en/us/products/collateral/video/65-86-mhz-split/product_data_sheet0900aecd806d363a.pdf)<br>[source 6](https://www.cisco.com/c/en/us/products/collateral/video/gainmaker-amplifiers/datasheet-c78-731589.pdf) | active-specialist-review |
| Manual / unidentified legacy | 4 / 0 | No manufacturer preset<br>Entered data / no equipment | user-data-required |
| Milenium 1.2 GHz E-option coupler | 1 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/09/MGDCH-FEC_Directional_Coupler.pdf) | not-freshly-cell-verified |
| Milenium 1.2 GHz G2 line passives | 7 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/09/MGLS_MGDC_MGPI_Line_Passives.pdf) | not-freshly-cell-verified |
| Milenium 1.2 GHz G2 taps | 28 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/09/MGT2000_Taps.pdf) | not-freshly-cell-verified |
| Milenium 1.2 GHz continuous RF/AC line passives | 7 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/08/MGLSH-CMGDCH-CMGPIH-C.pdf) | not-freshly-cell-verified |
| Milenium 1.8 GHz upgrade faceplate | 25 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/09/MGT2000SEP-G8_Tap_Faceplates.pdf) | not-freshly-cell-verified |
| Milenium NXT 2.0 GHz line passives | 7 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/07/MHLS_MHDC-MHPI_Line_Passives.pdf) | not-freshly-cell-verified |
| Milenium NXT 2.0 GHz taps | 24 / 0 | Existing catalog source and prior audit only<br>[source 1](https://antronix.com/wp-content/uploads/2026/07/MHT2000_Taps.pdf) | not-freshly-cell-verified |
| PPC 1.8 GHz mainline | 31 / 0 | Line Passives r3_06282024 pp2–3; Line Taps pp2–4<br>[source 1](https://www.ppc-online.com/hubfs/DOWNLOADABLE%20DOCUMENTS/Product_Spec_Sheets/1.8GHz-line-passives_spec-sheet.pdf)<br>[source 2](https://www.ppc-online.com/hubfs/DOWNLOADABLE%20DOCUMENTS/Product_Spec_Sheets/1.8GHz-line-taps_spec-sheet.pdf) | primary-pdf-reviewed |
| Regal RL12 1.2 GHz passives | 7 / 0 | CommScope copyright2022, p2<br>[source 1](https://webresources.commscope.com/download/assets/Regal+RL12+Series+1.2+GHz+System+Passives+Data+Sheet/d4d7ffbc3bd711f0b092ea1fa90d937b) | primary-pdf-reviewed |
| Regal RMT10 original 1 GHz | 30 / 0 | Existing catalog source and prior audit only<br>[source 1](https://documents.dps.ny.gov/search/Home/ViewDoc/Find?ext=pdf&id=%7BBE7E1CDA-DDFC-497E-8AA3-0E5E8A6D3B6A%7D) | not-freshly-cell-verified |
| Regal RMT2000 1 GHz narrow body | 19 / 0 | Existing catalog source and prior audit only<br>[source 1](https://dockets.alexandriava.gov/fy11/121410rm/di10c.pdf) | not-freshly-cell-verified |
| Regal RMT2000 1 GHz wide body | 27 / 0 | Existing catalog source and prior audit only<br>[source 1](https://dockets.alexandriava.gov/fy11/121410rm/di10c.pdf) | not-freshly-cell-verified |
| Regal RMT212 1.2 GHz narrow body | 17 / 0 | CommScope copyright2021, p2<br>[source 1](https://webresources.commscope.com/download/assets/Regal+Series+1.2+GHz+Full-Feature+Equalizable+Taps+Data+Sheet/acd7266c3bd911f0b87efaa31792deb3) | primary-pdf-reviewed |
| Regal RMT212 1.2 GHz wide body | 24 / 0 | CommScope copyright2021, p3<br>[source 1](https://webresources.commscope.com/download/assets/Regal+Series+1.2+GHz+Full-Feature+Equalizable+Taps+Data+Sheet/acd7266c3bd911f0b87efaa31792deb3) | primary-pdf-reviewed |
| Scientific-Atlanta Multimedia 1GHz | 24 / 0 | Existing catalog source and prior audit only<br>[source 1](https://manuals.plus/m/264e77f66cf8fb6b48ff531ca9c08c07b1568d2ca121f265dbf3d25350f130f3.pdf) | not-freshly-cell-verified |
| Scientific-Atlanta Multimedia Stretch 1GHz Rev.A | 24 / 0 | Existing catalog source and prior audit only<br>[source 1](https://documents.dps.ny.gov/search/Home/ViewDoc/Find?docTitle=Technical+Specs&ext=pdf&id=%7BF4517249-4256-410C-9C6F-4E8D9B36FA33%7D) | not-freshly-cell-verified |
| Scientific-Atlanta Multimedia mainline 1GHz | 7 / 0 | Scientific-Atlanta Multimedia Passives, Part Number 714414 Rev A, September 1999, p2<br>[source 1](https://www.scribd.com/document/157106375/Hoja-de-Datos-Pasivos) | Fresh Firecrawl retrieval of archived original manufacturer document; 72 maximum-loss cells and 3 nominal coupling values matched |
| Scientific-Atlanta Surge-Gap 1GHz | 7 / 0 | Existing catalog source and prior audit only<br>[source 1](https://manuals.plus/m/264e77f66cf8fb6b48ff531ca9c08c07b1568d2ca121f265dbf3d25350f130f3.pdf) | not-freshly-cell-verified |
| Technetix LH100 1.2 GHz mainline | 7 / 0 | 12/2023 EN/V1, pp1–2<br>[source 1](https://emea.technetix.com/wp-content/uploads/sites/2/2023/12/LH100_1.2GHz_Series_V1b_DS_EN.pdf) | primary-pdf-reviewed |
| Technetix LH100 1.8 GHz mainline | 6 / 0 | 05/2024 EN/V3, pp1–2<br>[source 1](https://emea.technetix.com/wp-content/uploads/sites/2/2024/07/19200547_LH100-1.8G_series_V3_DS_EN.pdf) | primary-pdf-reviewed |
| Technetix OTTZ 1.8 GHz | 24 / 0 | Existing catalog source and prior audit only<br>[source 1](https://emea.technetix.com/wp-content/uploads/sites/2/2026/04/19014593_OTTZ-2-xx_V3_DS_EN.pdf)<br>[source 2](https://emea.technetix.com/wp-content/uploads/sites/2/2026/04/19014602_OTTZ-4-xx_V3_DS_EN.pdf)<br>[source 3](https://emea.technetix.com/wp-content/uploads/sites/2/2026/04/19014610_OTTZ-8-xx_V3_DS_EN.pdf) | not-freshly-cell-verified |
| Technetix XFO Regal Narrow 1.8 GHz upgrade | 17 / 0 | 06/2026 AE/V8, pp3–5<br>[source 1](https://docs.technetix.com/datasheets/19015208_XFORNZ-4-14_DS_AE.pdf) | primary-pdf-reviewed |
| Technetix XFO Regal Wide 1.8 GHz upgrade | 24 / 0 | 06/2026 AE/V8, pp3–6<br>[source 1](https://docs.technetix.com/datasheets/19015183_XFORWZ-4-14_DS_AE.pdf) | primary-pdf-reviewed |
| Technetix XG 1.8 GHz mainline | 8 / 0 | 05/2025 EN/V14, pp2–3<br>[source 1](https://emea.technetix.com/wp-content/uploads/sites/2/2025/05/19013833_XGS1800-33_DS_EN-3.pdf) | primary-pdf-reviewed |

## Cable coverage

| ID | Source table | Frequency domain MHz | DC loop data | Verification qualification |
|---|---|---|---|---|
| `p3_500` | [original](https://www.commscope.com/globalassets/digizuite/114325-p360-530091803-external.pdf); p2 | 5–1800 | 1.72 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `p3_625` | [original](https://www.commscope.com/globalassets/digizuite/114385-p360-5308003-external.pdf); p2–3 | 5–1800 | 1.1 Ω/1000ft | reused-same-session-exact-SKU evidence: all attenuation points corroborated by indexed 5308003 manufacturer text; live manufacturer page DC confirmed |
| `p3_700` | [original](https://www.commscope.com/globalassets/digizuite/118114-p360-5727603-external.pdf); p2–3 | 5–1800 | 0.84 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `p3_750` | [original](https://www.commscope.com/globalassets/digizuite/114365-p360-5304002-external.pdf); p2 | 5–1800 | 0.76 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `p3_875` | [original](https://www.commscope.com/globalassets/digizuite/114399-p360-5309003-external.pdf); p2–3 | 5–1800 | 0.55 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `qr_540` | [original](https://www.commscope.com/globalassets/digizuite/114515-p360-5506302-external.pdf); p2 | 5–1800 | 1.61 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `qr_715` | [original](https://www.commscope.com/globalassets/digizuite/114556-p360-5522802-external.pdf); p2–3 | 5–1800 | 1.0 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `qr_860` | [original](https://www.commscope.com/globalassets/digizuite/114513-p360-5501302-external.pdf); p2 | 5–1800 | 0.73 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `mc2_500` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-11 | 5–1000 | 1.55 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `mc2_650` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-11 | 5–1000 | 1 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `mc2_750` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-11 | 5–1000 | 0.69 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `p3_1000` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-9 | 5–1000 | 0.4 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `p3_565` | [original](https://www.tvcinc.com/shared-downloads/CommScope%20P3%20565-2.pdf); p2 | 5–1000 | 1.3 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `mc2_440` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-11 | 5–1000 | 1.95 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `mc2_1000` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-11 | 5–1000 | 0.41 Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `commscope_rg6` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-7 | 5–1218 | not published Ω/1000ft | retained-provenance-and-all-entry-structural-audit |
| `commscope_rg11` | [original](https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf); p6-7 | 5–1218 | not published Ω/1000ft | retained-provenance-and-all-entry-structural-audit |

## Power and node documentation

| Selection ID | Mode/type | Matched registry documents | Qualification |
|---|---|---|---|
| `gm-le-12-thermal` | curve | gm-le-12-archive (©2016 Cisco; exact publication number not recovered; manual) | retained-provenance-and-all-entry-structural-audit |
| `gm-le-12-agc` | curve | gm-le-12-archive (©2016 Cisco; exact publication number not recovered; manual) | retained-provenance-and-all-entry-structural-audit |
| `gm-le-870-thermal` | curve | gm-le-870-source (Legacy manufacturer document retained in catalog; revision not recovered; datasheet) | retained-provenance-and-all-entry-structural-audit |
| `gm-le-870-agc` | curve | gm-le-870-source (Legacy manufacturer document retained in catalog; revision not recovered; datasheet) | retained-provenance-and-all-entry-structural-audit |
| `gm-le-870-agc-status` | curve | gm-le-870-source (Legacy manufacturer document retained in catalog; revision not recovered; datasheet) | retained-provenance-and-all-entry-structural-audit |
| `gm-hgd-1000-thermal` | curve | gm-hgd-thermal-alpha17-20261110 (OL-31156-01, February 2014; manual) | retained-provenance-and-all-entry-structural-audit |
| `gm-hgd-1000-agc` | curve | gm-hgd-oem-agc-alpha17-20261110 (OL-31156-01, February 2014; manual) | retained-provenance-and-all-entry-structural-audit |
| `gm-hgd-1000-agc-status` | curve | gm-hgd-oem-agc-alpha17-20261110 (OL-31156-01, February 2014; manual) | retained-provenance-and-all-entry-structural-audit |
| `gm-ubt-1000-thermal` | Retired compatibility — curve | Retired compatibility only; no current workflow mapping | retained-provenance-and-all-entry-structural-audit |
| `gm-ubt-1000-agc` | Retired compatibility — curve | Retired compatibility only; no current workflow mapping | retained-provenance-and-all-entry-structural-audit |
| `gm-ubt-1000-agc-status` | Retired compatibility — curve | Retired compatibility only; no current workflow mapping | retained-provenance-and-all-entry-structural-audit |
| `gm-hgd-gan-1g-thermal` | amps | gm-gan-setup-request-alpha17-20261110 (Exact GaN I&O revision not recovered; request) | manual-installed-load-required; no borrowed curve |
| `gm-amp-dsim-manual` | amps | aci-dsim-sg (Rev H, April 8, 2021; manual); aci-dsim-app (Rev B, March 24, 2021; manual) | manual-installed-load-required; no borrowed curve |
| `gm-le-dsim-manual` | amps | aci-dsim-sg (Rev H, April 8, 2021; manual); aci-dsim-app (Rev B, March 24, 2021; manual) | manual-installed-load-required; no borrowed curve |
| `aoi_quantum18_hgd_v09052024` | curve | aoi-quantum18-sa-v02102025-alpha17-20261110 (V02102025; manual) | retained-provenance-and-all-entry-structural-audit |
| `aoi_quantum18_le_v09052024` | curve | aoi-le-missing-alpha17-20261110 (Exact installation/operation revision not publicly recovered; request) | retained-provenance-and-all-entry-structural-audit |
| `gs7000-1g-1rx-1tx` | curve | gs7000-1g-manual (OL-29643-02; Cisco support index updated October 12, 2017; manual) | reused-node-specialist-original-table-review |
| `gs7000-1g-4rx-4tx` | curve | gs7000-1g-manual (OL-29643-02; Cisco support index updated October 12, 2017; manual) | reused-node-specialist-original-table-review |
| `gs7000-12g-1rx-1tx` | curve | gs7000-12g-manual (First published October2015; Cisco support listing November19,2015. Original PDF retrieved in full; no separate revision code printed in extracted cover.; manual) | reused-node-specialist-original-table-review |
| `gs7000-12g-4rx-4tx` | curve | gs7000-12g-manual (First published October2015; Cisco support listing November19,2015. Original PDF retrieved in full; no separate revision code printed in extracted cover.; manual) | reused-node-specialist-original-table-review |
| `gs7000-12g-fiberdeep` | curve | gs7000-sho-manual (First published August 2016; support index August 18, 2016; manual) | reused-node-specialist-original-table-review |
| `gs7000-12g-intelligent` | curve | gs7000-intelligent-manual (Cisco support index March 23, 2018; chapter update March 21, 2018; manual); gs7000-intelligent-lcs (Software guide main update September27,2018; Local Control chapter March21,2018; manual); gs7000-intelligent-manager24 (Release24.1, June12,2024; newest manager user guide located in current Cisco index; manual) | reused-node-specialist-original-table-review |
| `vecima-en9000-manual` | watts | en9000-2025-brief (Publish date February 2025; datasheet); en9000-2024-brief (May 2024; datasheet); vecima-manual-access (Web page checked November 10, 2026; request); en9000-2026-brief (Printed publish date September2026; located via Parallel onNovember10,2026; datasheet); en9000-erm3-2026-brief (Printed publish date September2026; datasheet); en9000-erm4-2026-brief (September2026 filename/search publication, but PDF body prints March2026; revision-date discrepancy retained; datasheet) | reused-node-specialist-original-table-review |
| `aoi_quantum18_hgbt_manual` | amps | aoi-quantum18-sa-v02102025-alpha17-20261110 (V02102025; manual) | manual-installed-load-required; no borrowed curve |
| `aoi_quantum18_ba_manual` | amps | aoi-ba-missing-alpha17-20261110 (Exact installation/operation revision not publicly recovered; request) | manual-installed-load-required; no borrowed curve |
| `vecima-en9000` | node-launch-profile | en9000-2025-brief (Publish date February 2025; datasheet); en9000-2024-brief (May 2024; datasheet); vecima-manual-access (Web page checked November 10, 2026; request); en9000-2026-brief (Printed publish date September2026; located via Parallel onNovember10,2026; datasheet); en9000-erm3-2026-brief (Printed publish date September2026; datasheet); en9000-erm4-2026-brief (September2026 filename/search publication, but PDF body prints March2026; revision-date discrepancy retained; datasheet) | reused-node-specialist-original-band-and-TP-review |
| `gs7000-1g` | node-launch-profile | gs7000-1g-manual (OL-29643-02; Cisco support index updated October 12, 2017; manual) | reused-node-specialist-original-band-and-TP-review |
| `gs7000-12g` | node-launch-profile | gs7000-12g-manual (First published October2015; Cisco support listing November19,2015. Original PDF retrieved in full; no separate revision code printed in extracted cover.; manual) | reused-node-specialist-original-band-and-TP-review |

## Link states, age and revision

The catalog records 81 earlier link checks on 2026-11-10: 62 verified, 15 unavailable, 3 redirected and 1 blocked. Those states are preserved as recorded evidence and were not all freshly fetched for this inventory. A verified URL or live product page is not proof that every numeric curve cell or exact setup variant was checked. Older publication dates identify historical applicability; age alone is not an error.

Fresh bounded gap review: the archived Scientific-Atlanta *Multimedia Passives* original is Part Number 714414 Rev A, September 1999, p2. All 72 maximum insertion-loss cells across 8 rows and the 8.5/12.5/16dB nominal coupling values match the current catalog. The archive is third party; the original text, not the host AI summary, controlled the comparison. See the JSON fixture and scrape ID. No manufacturer-hosted original was located.

Missing exact setup manuals remain explicit for Quantum18 LE/BA and EN9000 commissioning; the historical legacy GaN 42/54 datasheet gap remains explicit. Existing manual revisions are copied verbatim into the per-ID mapping. Actual installed module/firmware applicability must be confirmed on the job.

ACI pilot codes are separately sourced to user-supplied historical Rev A guide photos pp2–5, not inferred from a formula. The 86 provided rows cover 52–94 and 100–142; missing 95–99 and 303 are not fabricated. Channel 100 is a source exception and cannot be copied until confirmed. This does not verify hardware or app/firmware compatibility. SG Rev E pad procedure and current SG Rev H H0 procedure are not interchangeable; DSIM-A Rev T does not certify the 1218 variant.

## Reproduce and interpret

Run `python night-sweep/research/alpha17-equipment-refresh/audit_catalog.py`, then `node qa/catalog-audit.cjs`. This inventory includes input SHA-256 hashes so a later shared-workspace catalog change can be detected. The machine-readable output records structural errors rather than silently treating missing data as zero. Runtime numerical boundary checks are recorded separately by `runtime-curve-check.cjs`.

Related evidence: `../alpha17-manuals/catalog-audit.json`, `active-manuals.json`, `node-manuals.json`, and `dsim-pilot-guide-review.md`. Earlier equipment/source reviews are reused with their original scope. No physical-device testing, new Wolfram checks, app build or release validation is claimed here.
