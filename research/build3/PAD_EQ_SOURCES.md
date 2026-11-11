# Build 3 pad and EQ sources (build list item 2)

November 11, 2026 · Carpe Noctum 2.0 Alpha build 3 (in development)

The tilt / EQ / pad solver (`night-sweep/alignment.js`) may only offer pad and EQ values that the exact model accepts. This records where those values come from. The full skeptic-checked findings are in `pad-eq-research.json`.

## Method

A background research workflow sent one researcher per amplifier family to the manufacturer documents. A second agent then re-opened every source and re-checked every value, range, page and revision. The EQ loss chart was parsed straight from the research output into the app (no hand transcription), and a script confirmed that the system amplifier guide's chart and the S-A accessories data sheet's chart agree in all 20 rows and 9 frequencies, that each row's printed total tilt equals its 52 MHz loss minus its 1000 MHz loss, and that the checked chart matches the app's table exactly.

## GainMaker 1 GHz (system amplifiers and line extenders)

| Data | Values used | Source | Status |
| --- | --- | --- | --- |
| Forward input pads | 0 to 20.5 dB in 0.5 dB steps (589693–589734); flat loss | Cisco OL-31156-01 (Feb. 2014) p.7 and Appendix A pp.102–103; LE data sheets 7006590 Rev D and 7006954 Rev A; S-A 716336 Rev D p.9 (flat loss) | Primary (guide read from a cached copy and two mirrors; the cisco.com link now redirects) |
| Forward cable EQs, 1 GHz | 1.5 to 30 dB in 1.5 dB steps (4007229–4007248) | OL-31156-01 p.7 and p.104; HGD, HGBT, LGD and LE data sheets on cisco.com | Primary |
| EQ loss at 52, 70, 86, 550, 600, 650, 750, 870 and 1000 MHz | Cisco chart, every row | OL-31156-01 Appendix A p.96; identical in 716336 Rev D p.2 and OL-31155-01 | Primary |
| Balancing order | Input EQ for tilt, then input pad for level at the highest design frequency | OL-31156-01 pp.54–55 (and the AGC and thermal sections); OL-31155-01 forward balancing sections | Primary / secondary (LE guide from a mirror) |

The chart's top column is headed 1000 MHz in the guide and 1002 MHz in 716336 with the same values, so the app carries both points. The procedure's ±0.5 dB window for tilt and level (OL-31156-01 pp.54–55) is shown after each pick.

Left out on purpose: the 0 dB EQ jumper (no loss chart), forward inverse EQs (the two published charts disagree below 550 MHz and one prints its low columns out of order), 870 MHz EQs (870 MHz designs only), node-only linear EQs, and the factory interstage EQs and pads. The guide's "1.5 dB EQ step is about 1 dB of tilt" rule of thumb does not match its own chart (1.2 dB per step from 52 to 1000 MHz), so the solver uses the chart. The guide also warns that a 1 GHz design balanced at 550 MHz needs a corrected tilt reference: use targets at the same pilots you measure.

No model-specific GaN or High Output 42/54 data sheet was found. The guide's accessory table is titled for all amplifiers and lists GaN types, so the GaN HGD uses the same values.

## AOI Quantum18

No public AOI document lists plug-in forward pad or EQ values for the HGD, HGBT or LE, and AOI's English data sheets now sit behind a request form. The system amplifier guide (V02102025, read from a ManualsLib mirror) describes electronic alignment through the QuantumLink Local app: a pilot-based auto-alignment, then an optional manual alignment in the app. The solver therefore offers no HGD or HGBT part values and shows that note instead. The LE data sheet only describes electronic control and no public LE guide or value list was found, so the LE gets its own note without naming the app's procedure. The BA data sheet (v08302024, preliminary; Internet Archive copy of AOI's English file) says a 0 dB pad is installed and 2, 4 and 6 dB pads are stored in the lid for gain adjustment, so the BA keeps the pad direction but gets no picks.

## Independent check

`alignment-cases.json` holds three synthetic cases per GainMaker family (balanced, high tilt, low level). `alignment-spreadsheet.py` builds `alignment-spreadsheet.xlsx`, in which spreadsheet formulas interpolate the chart, pick the EQ for tilt and the pad for level and compute the predicted levels. LibreOffice recalculates it headlessly, and `qa/build3-alignment.test.cjs` compares every pick and level with the app.
