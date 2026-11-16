# mapreader

Vector-first recognizer for HFC walkout and coax-only design-map PDFs.

    python3 -m mapreader.cli <map.pdf> --out <dir>

Outputs `recognition.json`, `report.md`, `overlay.png`, `basemap_symbols.json`, and (walkouts) `markup.json`, `walkout_symbols.json`.

Reads three layers: (1) design tables (actives, levels, pads/EQ, power supplies, EOL), (2) base-map vectors and text (taps, symbols), (3) Bluebeam-style redline annotations (walkout).
Abbreviations (CSC, NT, SA, REG, CR, ATX ...) are NOT defined in the PDFs; edit `glossary.json`.
Uses pdfplumber, pypdf, Pillow and `pdftoppm`; no GPU or trained model.
