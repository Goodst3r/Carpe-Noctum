# NightSweep 1.4 Alpha — operating gain references

Retrieved from manufacturer publications on **2026-11-10**, with source availability qualified below. These figures are published operational gain under the listed test configuration, not unpadded full gain, amplifier output targets, or a flat frequency-response curve. No separate full-gain value is inferred. The operational-gain rows do **not** explicitly assign an exact test frequency; in particular, the AOI 49 dB value cannot be presented as independently verified gain at 1794 MHz.

| Catalog ID | Model and configuration | Forward gain (dB) | Reverse gain (dB) | Profile bands (MHz, forward / reverse) | Source |
|---|---|---:|---:|---|---|
| active_gm_hgd | GainMaker 1 GHz GaAs HGD, auto/thermal, 10.5 dB interstage EQ | 43 minimum | 19.5 minimum | 54–1002 / 5–42 | [Cisco HGD](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d35ae.pdf), specification page 3, notes page 4; live PDF verified |
| active_gm_gan_hgd | GainMaker 1 GHz GaN HGD, auto/thermal, 10.5 dB interstage EQ | 44 minimum | 19.5 minimum | 54–1002 / 5–42 | [Cisco GaN HGD](https://www.cisco.com/c/en/us/products/collateral/video/gainmaker-amplifiers/datasheet-c78-731589.pdf), tables 2–3 page 3, notes page 4; ©2014 |
| active_gm_le_manual | GainMaker 1 GHz LE, manual, 9 dB interstage EQ | 39.5 | 19.5 | 54–1002 / 5–42 | [Cisco LE](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d3566.pdf), specification page 3, notes page 4 |
| active_gm_le_thermal | GainMaker 1 GHz LE, thermal, 7.5 dB interstage EQ | 34 | 19.5 | 54–1002 / 5–42 | Same Cisco LE source |
| active_gm_le_agc | GainMaker 1 GHz LE, AGC, 9 dB interstage EQ | 33 | 19.5 | 54–1002 / 5–42 | Same Cisco LE source |
| active_aoi_hgd | AOI Quantum18 HGD, 204/258 MHz split profile | 49 minimum | 27 minimum | 258–1794 / 10–204 | [AOI HGD](https://ao-inc.com/assets/resources-element-files/English/QB18-HGD-SA-Datasheet.pdf), forward/reverse station tables and notes; marked PRELIMINARY |
| active_aoi_le | AOI Quantum18 LE, 204/258 MHz split profile | 46 minimum | 27 minimum | 258–1794 / 10–204 | [AOI LE](https://ao-inc.com/assets/resources-element-files/English/QB18-LE-Datasheet.pdf), forward/reverse station tables and notes; document v09052024, ©2025 |

## Configuration limits

- Manufacturer measurements reference 20°C (68°F). Field gain depends on the module, settings, signal path and measurement frequency.
- Cisco forward reference includes 0 dB input EQ and 1 dB input pad. Reverse reference includes 0 dB reverse input pad, 0 dB reverse output EQ and 1 dB output pad. The optional reverse switch lowers reverse gain by 0.5 dB. Included reference padding must not be deducted twice. LE data is labeled operational gain, not minimum; preserve that distinction.
- The GainMaker profiles above are the 42/54 MHz versions. They do not establish performance for an upgraded 204 MHz reverse module. GaAs HGD and GaN HGD require different selections.
- AOI forward measurements use equivalent 0 dB input EQ and 1 dB input pad settings. Its reverse performance note explicitly applies to the 204 MHz split. The other supported diplex splits are not modeled by these profiles.
- The AOI forward figures describe a 1.8 GHz product specification. They must not be automatically applied as flat gain at 993 or 1002 MHz. For the selected 258–1794 MHz band, the published internal tilt is 19.5 dB for HGD and 12.0 dB for LE; this alone is insufficient to reconstruct the aligned gain response.
- AOI HGD has output-dependent gain when a signal director is installed. The [AOI system amplifier I&O guide](https://ao-inc.com/assets/resources/QB18-SA-I-and-O-Guide.pdf), version V02102025, printed page 5, describes auxiliary splitter losses of approximately 4 dB relative to main and different through/coupled losses for directional couplers. Use the chosen output's measured gain; do not treat all ports as equal.

## App use

The catalog stores `publishedGain` as reference metadata only and supplies no `nominal` or `maximum` port curves for these active devices. Route calculations require user-supplied net gain at their low and high markers. Net gain is corrected output level minus corrected input level at the same frequency; account for TP coupling and compensation already applied by the meter. Avoid applying TP compensation a second time.

The supplied ONX photographs show downstream levels and MER. They do not provide paired input/output measurements and therefore cannot establish an amplifier's net operating gain.

## Verification record

Initial web retrieval returned indexed versions of the manufacturer PDFs. Fresh retrieval with cache disabled on 2026-11-10 established the following differences. Retained excerpts and retrieval metadata are in `active-gain-evidence.json`.

| Source | Fresh retrieval | Evidence basis |
|---|---|---|
| Cisco standard HGD split-specific PDF linked above | HTTP 200, application/pdf, 5 pages | Live manufacturer PDF plus indexed table |
| Cisco LE PDF linked above | HTTP 200, application/pdf, 5 pages | Live manufacturer PDF; mode-specific figures confirmed |
| Cisco HGD generic path ending 806f0317.pdf | Redirects to Cisco homepage | Replaced with working split-specific source |
| Cisco GaN HGD c78-731589.pdf | Redirects to Cisco homepage | Indexed historical manufacturer table only |
| AOI HGD and LE PDFs | HTTP 404, HTML missing-page response | Indexed historical manufacturer tables only |

AOI's working [current amplifier page](https://ao-inc.com/products/hfc-networking/hfc-amplifiers/) routes datasheet access to a [document request form](https://ao-inc.com/content-request-form/). No replacement public numeric datasheet URL was found. No request was submitted. The 49/46/27 dB figures remain qualified historical references; do not describe them as freshly confirmed current hardware specifications.

Publication/crawl timestamps are not treated as installed firmware or hardware revisions. The AOI HGD preliminary marking and exact Cisco split/mode qualification remain visible in profile conditions. The catalog adds `referenceFrequencyMHz: null`, source status and a frequency qualification so no exact measurement frequency is invented.

## Sufficient-gain decision

Required gain at each selected frequency equals target corrected output minus corrected input. Compare that requirement only with verified available gain at the same frequency, selected output and settings. A measured operating gain describes current operation; it does not by itself establish maximum gain/headroom. Positive remaining gain does not establish output linearity, noise performance or compliance with the operator's level plan. The historical published scalar values can support reference lookup, but cannot independently produce a valid pass/fail assessment at arbitrary route markers.
