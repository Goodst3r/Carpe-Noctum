# NightSweep passive and cable audit — 2026-11-10

## Scope and result

Read the current 1.5 catalog, checked structural integrity of every passive curve, reviewed manufacturer tables for selected existing families, and prepared absent ATX SGP models plus four missing cable selections. This is **not** a claim that every one of the 483 inherited device records was independently re-transcribed from its datasheet during this audit.

- Baseline: 483 device records, 34 device families, 13 cable records.
- Structural checks: 1,236 device loss curves, 12,987 curve/band rows; no non-finite values, declared coverage outside tabulated-point endpoints, or typical-loss values greater than matching maximum values.
- Existing Antronix continuous RF/AC line-passive loss tables and Regal RL12 loss tables match the reviewed official tables. Spot checks of existing P3 .625 and MC2 .500/.650/.750 agree with their stated source editions.
- New merge data: `catalog-additions.json`, containing **15 passive models and 4 cable selections**. The ATX values were checked against the current manufacturer page. Cable values were checked against an indexed manufacturer guide; live access to that guide is unavailable. No shared application file was changed by this audit.

## New passive coverage

Official source (manufacturer product page, full loss tables and ordering table):
https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgp-1-2ghz-passives/

Standard GigaXtend SGP: `GTSG-PASSIVES-DC-08`, `-DC-12`, `-DC-16`, `-S2`, `-S3`, `-S3U`, `-PI`.
AC-continuity GigaXtend SGP: `GTSG-PSVA-08`, `-12`, `-16`, `-16C`, `-S2`, `-S3`, `-S3U`, `-PI`.

Preserved important distinctions:

- Tables run 5–1250 MHz. The marketed name is 1.2 GHz; the table coverage should remain 1250 MHz.
- Standard DC16 has a 16.0 dB typical coupled-port loss. The AC-continuity DC16 is 15.6 dB; the 16C conditioned model is 16.0 dB before additional installed plug-in response.
- Standard PI RF-through typical losses at 1218/1250 MHz are 0.8/0.9 dB, maxima1.1/1.2dB. AC-continuity PI values are0.9/1.0dB and1.2/1.3dB respectively.
- S3U's HIGH marking is the higher signal, lower loss output; LOW1/LOW2 are the lower signal, higher loss outputs. They are modeled separately.
- No RF path through the power inserter's AC power-entry connector is invented.
- The DC tap-loss maximum curves are explicitly derived as published typical +1 dB, from the manufacturer's ±1 dB tolerance. This is not silently passed off as a separate measured maximum table.
- The official page contains apparent heading typos: standard S3 header repeats DC08 and PSVA16C's nominal-type header says2-Way. The ordering table and table arrangement establish the correct model identity. The16C note records this uncertainty and requires the installed plug-in response separately.

## New cable coverage

Historical manufacturer pocket guide, Document MX0398 RevU (2021), printed pages6-7 and6-11. Numeric tables were retrieved through the indexed manufacturer copy; fresh access to the source URL failed, and no live replacement was verified. Do not label this URL live-verified:
https://www.commscope.com/globalassets/digizuite/1695-cable-technician-pocket-guide.pdf

| Added selection | Published coverage | Key checked value | Limit |
|---|---|---|---|
| MC2 .440 legacy |5–1000MHz |2.49dB/100ft at1000MHz; loop1.95ohm/kft |Discontinued; higher-frequency estimate is not qualification |
| MC2 1.000 legacy |5–1000MHz |1.16dB/100ft at1000MHz; loop0.41ohm/kft |Discontinued; higher-frequency estimate is not qualification |
| CommScope Series6 /RG6 drop |5–1218MHz |6.55dB/100ft at1000MHz;7.21at1218MHz |No published DC loop value assigned |
| CommScope Series11 /RG11 drop |5–1218MHz |4.35dB/100ft at1000MHz;4.92at1218MHz |No published DC loop value assigned |

All loss curves use maximum attenuation at68°F/20°C. Drop cable labels deliberately identify CommScope's reference series; they are not universal values for all RG6/RG11 cable. MC2 nominal NVP93% and drop NVP85% are metadata only; do not claim the present TDR UI automatically applies these unless wired and separately tested. Existing temperature coefficient0.1%/°F matches this source.

## Existing data checked versus manufacturer evidence

- CommScope P3 .625 manufacturer datasheet:2.11dB/100ft at1002MHz,2.32at1218MHz,2.96at1800MHz; loop1.10ohm/kft. Existing values correct. Note that the older pocket guide has2.09at1002MHz; do not overwrite a newer product-specific table with the older generic table.
- MC2 .500/.650/.750 maximum losses at1000MHz:2.22/1.82/1.51dB/100ft; existing curves correct for the cited pocket-guide table. Their nominal DC loops1.55/1.00/0.69ohm/kft are also supported by the official guide.
- Regal RL12: original seven models' typical/maximum band tables match the current manufacturer PDF. Verified direct document:
  https://webresources.commscope.com/download/assets/Regal%2BRL12%2BSeries%2B1.2%2BGHz%2BSystem%2BPassives%2BData%2BSheet/d4d7ffbc3bd711f0b092ea1fa90d937b
- Antronix MGPIH/MGLSH/MGDCH continuous RF/AC: existing seven models' through and branch tables match official DS-1189-LN-B01,9/2021, page2.
  https://www.antronix.com/scte/data-sheets/Antronix-Milenium-1.2-C-series-Line-Passives.pdf
- ATX XS hardline-passive product page remains accessible and includes full tables:
  https://atx.com/products/taps-passives/gigaxtend-xs-series-2ghz-taps-passives/gigaxtend-2ghz-hardline-passives/
- Existing ATX SGT page remains accessible and links its current manufacturer datasheet:
  https://atx.com/products/taps-passives/gigaxtend-sg-series-1-2ghz-taps-passives/gigaxtend-sgt-1-25ghz-taps/

## Link interpretation

The separate link-audit agent owns final URL substitutions. Direct generic web-open returned inaccessible/404 for several PDFs, but resolving manufacturer-page links or indexed references retrieved the same documents. Therefore, a tool fetch failure alone must not be reported as a confirmed dead link. Fresh checks by the separate link agent distinguish actual404s from this retrieval issue.

Recommended stable cable fallback: manufacturer product page matching the exact product number, for example
https://www.commscope.com/product-type/cables/coaxial-cables/hardline-cables/item5308003/

Current Antronix official family pages (each worked and exposes linked PDFs):
- https://antronix.com/milenium-1-2-ghz-series/
- https://antronix.com/taps-and-line-passives-milenium-nxt-2-0-ghz-series/
- https://antronix.com/taps-and-line-passives1-8-ghz-tap-faceplates/
- https://antronix.com/drop-passives/

## Further coverage not silently asserted

QR .320 and1.125 are absent. The generic pocket-guide QR .320 table has a suspicious211MHz row relative to adjacent frequencies; use a product-specific datasheet before adding it. Scientific-Atlanta/Cisco line equalizers and conditioned taps require mode/split/plug-in-aware data rather than reusing a generic passive loss. Add these in a subsequent validated catalog increment if exact installed versions are available. Existing legacy SA/Regal records whose evidence is archived or mirrored should remain labeled as inherited reference data until independently confirmed.

## Final source status

No verified live successor to the pocket guide was located. The four added cable curves should be labeled historical manufacturer reference values, and the unavailable original source should not be shown as a working link. The RMT2000 archived manufacturer PDF was found at https://device.report/m/d2ff4a56e443fc7e078a61ba86adc405a5660374d0ea2305070d3fd8190cdd54.pdf and its content was retrievable through indexed resolution, but direct fresh access could not be verified; do not label it a working replacement. The exact seven CommScope product-page substitutions and current RL12 PDF are recorded separately in link-replacements.json.
