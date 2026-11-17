# mapreader

Vector-first recognizer for HFC walkout and coax-only design-map PDFs.

    python3 -m mapreader.cli <map.pdf> --out <dir>

Outputs `recognition.json`, `report.md`, `overlay.png`, `basemap_symbols.json`, and (walkouts) `markup.json`, `walkout_symbols.json`.

Reads three layers: (1) design tables (actives, levels, pads/EQ, power supplies, EOL), (2) base-map vectors and text (taps, symbols), (3) Bluebeam-style redline annotations (walkout).
Abbreviations (CSC, NT, SA, REG, CR, ATX ...) are NOT defined in the PDFs; edit `glossary.json`.
Uses pdfplumber, pypdf, Pillow and `pdftoppm`; no GPU or trained model.

## Symbol classes (rule-based, `symbols.py`)
tap (value + shape), amplifier_triangle, power_supply_symbol (half-filled circle), power_supply_label (model, V, rated/load A),
node_or_hub_dot, leg_arrow, filled_dot. Coax-only yellow A#/E# tags are linked to the actives/EOL table rows (`tags.py`).
Each symbol has a `basis` field; none of this is from a verified legend.

## Reviewed on the coax-only map
A5, A23, A25, A68, A70: empty outline triangle next to a half-black coupler, no filled triangle inside (checked in the vector data and visually). Under the confirmed key they are line extenders, matching their LE table models. A draft job that lists them as amplifiers is likely reacting to the adjacent coupler.
