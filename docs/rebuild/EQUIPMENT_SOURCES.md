# Equipment source register

Published facts, measured inputs and estimated responses remain distinct. Private supplied PDFs are not committed.

- **hgd40**: [GainMaker High Gain Dual 5–40 / 52–1002 MHz](https://www.cisco.com/c/dam/en/us/products/collateral/video/40-52-mhz-split/product_data_sheet0900aecd806d3546.pdf). pp.3–5: gain, internal tilt, input reference, AGC and accessories. supplied manufacturer PDF checked.
- **hgd42**: [GainMaker High Gain Dual 42/54 MHz](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d35ae.pdf). Forward operational gain reference; retained sourced catalog. reference.
- **le**: [GainMaker 1 GHz Line Extender](https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d3566.pdf). p.2: mode-specific operational gain, 9.5 dB internal tilt and factory interstage EQ; Firecrawl source quote 2026-11-15. manufacturer PDF independently retrieved.
- **manual**: [1 GHz GainMaker Line Extender Installation and Operation Guide](https://www.cisco.com/c/dam/en/us/td/docs/video/access_edge/Amplifiers/GainMaker/Installation_and_Operation/OL-31155-01.pdf). OL-31155-01: AGC procedure; pp.98–108 EQ loss and parts tables. supplied manufacturer PDF text checked.
- **aoi**: [AOI Quantum18 HGD](https://ao-inc.com/assets/resources-element-files/Spanish/QB18-HGD-SA-Datasheet_ES.pdf). 204/258 operational reference; not a measured gain curve. manufacturer PDF independently retrieved; operational minimum49 dB, not output dBmV.

## Numeric coverage

513 equipment profiles; 187 sourced part/reference records. Records without a usable loss curve are not silently optimized.

Digicomm cable, linear, inverse and director rows retain their own citations in app/data/digicomm-reference.json. Operator-confirmed 1.2 GHz part/slot compatibility is explicit. The printed 53.8 dB anomaly is quarantined from optimization.

Gain/tilt estimates and sparse-table interpolation are labeled. Exact measured sample frequencies are never filled from design defaults. Minimum operational gain is distinct from an absolute output capability.
