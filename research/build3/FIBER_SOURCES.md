# Fiber tools: sources and how they were checked

November 11, 2026 · Lane B (Claude) · build list item 15, first part (TIA-598 color finder and a simple link loss budget) · code in `night-sweep/fiber-tools.js`

Neither TIA standard was purchased or read. Every value below was read in vendor and association summaries (several that agree)
and is labeled **Spec** with verification **secondary**; the source sheet and the screen say so. Nothing is copied from a standard.

## What was read, and where

| Used for | Value | Source read | Notes |
| --- | --- | --- | --- |
| TIA-598 color code, positions 1 to 12 for fibers and for buffer tubes | blue, orange, green, brown, slate, white, red, black, yellow, violet, rose, aqua | BWN Fiber "12 Strand Fiber Color Code"; Fiber Field Kit; Radix Fibrotech color-code guide; Hexatronic "Color Codes and Counting Directions for Fiber Optic Cables"; DYS Fiber chart | All five give the same 12-color order. The standard's revision is not named in them ("ANSI/TIA-598") |
| Fiber n in tube ceil(n ÷ 12), position ((n − 1) mod 12) + 1 | arithmetic | Fiber Field Kit; independent decimal check | Assumes 12 fibers per tube |
| Marking past 12 | repeat with a stripe, dashes or rings; tube or fiber 20 is clear or black with a yellow stripe, depending on the maker; past 24 tubes the schemes differ | Fiber Field Kit; Hexatronic; Radix; BWN | **The sources disagree on the exact marking**, so the tool only says the colors repeat with a stripe or dashes, names tube 20's usual yellow stripe, and sends the technician to the cable print legend. Fiber positions 13 to 24 inside one tube are not covered |
| Connector, splice and cabling allowances | 0.75 dB per mated pair; 0.3 dB per splice; single-mode 1.0 dB/km inside plant and 0.5 dB/km outside plant at 1310 and 1550 nm | ANSI/TIA-568.3-D (2016), as quoted by Fluke Networks (SimpliFiber Pro knowledge base, citing 568-C.3), Nordix reference, Radix Fibrotech loss-budget guide, Kingfisher Fiber (insertion-loss procedure) | Consistent across all four. **TIA-568.3-E (2022) replaced -D and was not checked** for changes. They are worst-case certification and design values, not what good plant measures |
| Typical measured values (mentioned in the tag text only) | connector about 0.2 to 0.5 dB, fusion splice under 0.1 dB, single-mode glass about 0.35 dB/km at 1310 nm and 0.25 to 0.4 dB/km at 1550 nm | Fiber Optic Association "Guidelines on what loss to expect"; Nordix | Descriptive, not used as defaults |
| Link budget formula | loss = length × attenuation + pairs × loss + splices × loss (+ passive devices); compare with a measured insertion loss | FOA loss-budget guidance; Fluke SimpliFiber Pro article; Radix | Labeled **Expert**, secondary |

## Choices the tools make

- **No silent defaults.** Attenuation, per-pair loss, per-splice loss and the margin start blank. The standard's four allowances are shown in a table with source tags, and two buttons copy them into the fields only when the technician presses one. The copied values are read from the registry rows, so the table and the fields cannot disagree.
- **A blank is never zero.** A count of 0 needs no loss; a blank count, or a blank loss next to a count above 0, gives a reason. The optics numbers (transmit power and receiver sensitivity) must come as a pair, and the transmit power must exceed the sensitivity.
- **No pass or fail without optics numbers**, and never against a company limit: the app does not know one. With optics numbers it shows the optics budget (transmit power − sensitivity) and the headroom after the loss and the margin.
- **Limits on entries** (length 0 to 500 km, attenuation 0 to 5 dB/km, counts 0 to 500 whole numbers, loss each 0 to 5 dB, other loss 0 to 50 dB, margin 0 to 30 dB, transmit power −40 to 40 dBm, sensitivity −80 to 20 dBm) are input sanity bounds, not engineering limits; they are not registered.
- The number parser reads each string one way, so a long run of digits is refused in linear time, and hex or binary is refused.
- Nothing is stored; no job-format or storage-key change (tested).

## Not verified, and left out

- Neither TIA-598 nor TIA-568.3-D was read; whether the -E edition changed any of these numbers is not checked. Someone with the standards should confirm the four allowances and the marking rule.
- Multimode budgets, OTDR, PON splits, polarity and MPO maps, bandwidth and dispersion are not built (the build list names them as later parts of item 15).
- Firecrawl was out of credits; research used Exa. The independent arithmetic is `fiber-reference.py` (Python `decimal`, 50 digits; 45 fibers and tube positions, ten full budgets and 38 refusal cases, 132 comparisons in the suite). Wolfram was not available.
