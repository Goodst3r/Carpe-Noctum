# NightSweep equipment catalog review

Reviewed November 10, 2026 from baseline commit`a3d25f032c8b577c14f15ce227b2343436468aea`.

All-entry structural/numeric sanity audit; targeted original-manufacturer source review. Not a fresh every-cell equipment certification.

## Current run

- 516 RF selections (25 active, 491 nonactive),17 cables,25 power selections and3 node profiles inventoried.
- `node qa/catalog-audit.cjs`: PASS;1,324 curves and14,126 table rows.
- Supplemental structural audit: 0 errors;713 instances of printed integer-frequency gaps. These gaps are documented, rather than invented missing-zero data.
- No duplicate model names or IDs, duplicate output IDs, terminal-through paths or common-grid nominal-above-maximum values found.

## Corrections found

1. Include published nonshared upper band endpoints in `curveValue`. Current half-open implementation returns unavailable at10MHz when source bands are5–10and11–300MHz. Preserve next-band choice at actually shared boundaries.
2. Implement explicit adjacent-maximum handling only on SA Multimedia curves whose existing notes promise this treatment for fractional1MHz gaps. Keep unknown gaps unavailable elsewhere.

## Source coverage

| Family | Selections | Review | Source scope |
| --- | ---: | --- | --- |
| ATX GigaXtend SGP 1.2GHz AC continuity | 8 | primary-page-reviewed | ANW1524 / current ATX product table |
| ATX GigaXtend SGP 1.2GHz standard | 7 | primary-page-reviewed | ANW1480 / current ATX product table |
| ATX GigaXtend SGT 1.25GHz | 18 | primary-page-reviewed | ANW1479 / current ATX product table |
| ATX GigaXtend XS 2GHz | 7 | primary-page-reviewed | ANW1402 / current ATX product table |
| ATX GigaXtend XS 2GHz flat taps | 23 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| ATX GigaXtend XS 2GHz slope taps — manual data | 11 | user-data-required | Distinct slope-tap models |
| Antronix CMC5000 DROP / premises / AC-blocking | 3 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Cable-only | 1 | not-equipment | No source required |
| Cisco Surge-Gap 1.25GHz | 7 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Manual / unidentified legacy | 4 | user-data-required | No manufacturer preset |
| Milenium 1.2 GHz E-option coupler | 1 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Milenium 1.2 GHz G2 line passives | 7 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Milenium 1.2 GHz G2 taps | 28 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Milenium 1.2 GHz continuous RF/AC line passives | 7 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Milenium 1.8 GHz upgrade faceplate | 25 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Milenium NXT 2.0 GHz line passives | 7 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Milenium NXT 2.0 GHz taps | 24 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| PPC 1.8 GHz mainline | 31 | primary-pdf-reviewed | Line Passives r3_06282024 pp2–3; Line Taps pp2–4 |
| Regal RL12 1.2 GHz passives | 7 | primary-pdf-reviewed | CommScope copyright2022, p2 |
| Regal RMT10 original 1 GHz | 30 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Regal RMT2000 1 GHz narrow body | 19 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Regal RMT2000 1 GHz wide body | 27 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Regal RMT212 1.2 GHz narrow body | 17 | primary-pdf-reviewed | CommScope copyright2021, p2 |
| Regal RMT212 1.2 GHz wide body | 24 | primary-pdf-reviewed | CommScope copyright2021, p3 |
| Scientific-Atlanta Multimedia 1GHz | 24 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Scientific-Atlanta Multimedia Stretch 1GHz Rev.A | 24 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Scientific-Atlanta Multimedia mainline 1GHz | 7 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Scientific-Atlanta Surge-Gap 1GHz | 7 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Technetix LH100 1.2 GHz mainline | 7 | primary-pdf-reviewed | 12/2023 EN/V1, pp1–2 |
| Technetix LH100 1.8 GHz mainline | 6 | primary-pdf-reviewed | 05/2024 EN/V3, pp1–2 |
| Technetix OTTZ 1.8 GHz | 24 | not-freshly-cell-verified | Existing catalog source and prior audit only |
| Technetix XFO Regal Narrow 1.8 GHz upgrade | 17 | primary-pdf-reviewed | 06/2026 AE/V8, pp3–5 |
| Technetix XFO Regal Wide 1.8 GHz upgrade | 24 | primary-pdf-reviewed | 06/2026 AE/V8, pp3–6 |
| Technetix XG 1.8 GHz mainline | 8 | primary-pdf-reviewed | 05/2025 EN/V14, pp2–3 |

## Remaining uncertainty

- This audit validates structure and targeted manufacturer cases. It does not establish that all14,126 retained cells were freshly independently transcribed.
- Legacy Scientific-Atlanta/Regal and historical cable tables retain qualified archive/mirror provenance. Antronix PDFs and older CommScope cable PDFs could not be freshly read through the available reader.
- Exact P3.625 DC loop is independently confirmed as1.10ohm/kft at20°C on current CommScope5308003 page; attenuation tables are images and not newly certified.
- Current through-loss tables reviewed: ATX SGP/SGT/XS, Technetix LH1001.2/LH1001.8/XG/XFO, CommScope RL12/RMT212, PPC1.8. Review is model/path scoped; no passive family substitutes for another.
- Manual/custom passives, slope taps and measured-load power selections remain explicit. They must not be automatically populated from nearby model names.
- Passive temperature effects remain manufacturer notes; cable temperature adjustment is not a passive-temperature model.
- Document title/revision metadata should be added to the reference registry. Units are currently established globally by the RF engine (dB, MHz, ft), rather than per-cell schema fields.

## External references reviewed

- [ATX SGP](https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgp-1-2ghz-passives/)
- [ATX SGT](https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgt-1-25ghz-taps/)
- [ATX XS](https://atx.com/products/taps-passives/gigaxtend-xs-series-2ghz-taps-passives/gigaxtend-2ghz-hardline-passives/)
- [Technetix LH1001.2](https://emea.technetix.com/wp-content/uploads/sites/2/2023/12/LH100_1.2GHz_Series_V1b_DS_EN.pdf)
- [Technetix LH1001.8](https://emea.technetix.com/wp-content/uploads/sites/2/2024/07/19200547_LH100-1.8G_series_V3_DS_EN.pdf)
- [Technetix XG](https://emea.technetix.com/wp-content/uploads/sites/2/2025/05/19013833_XGS1800-33_DS_EN-3.pdf)
- [Regal RL12](https://webresources.commscope.com/download/assets/Regal+RL12+Series+1.2+GHz+System+Passives+Data+Sheet/d4d7ffbc3bd711f0b092ea1fa90d937b)
- [Regal RMT212](https://webresources.commscope.com/download/assets/Regal+Series+1.2+GHz+Full-Feature+Equalizable+Taps+Data+Sheet/acd7266c3bd911f0b87efaa31792deb3)
- [PPC Line Taps](https://www.ppc-online.com/hubfs/DOWNLOADABLE%20DOCUMENTS/Product_Spec_Sheets/1.8GHz-line-taps_spec-sheet.pdf)
- [PPC Line Passives](https://www.ppc-online.com/hubfs/DOWNLOADABLE%20DOCUMENTS/Product_Spec_Sheets/1.8GHz-line-passives_spec-sheet.pdf)
- [P3.625 DC](https://www.commscope.com/product-type/cables/coaxial-cables/hardline-cables/item5308003/)
