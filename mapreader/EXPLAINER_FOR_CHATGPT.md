# Map reader: what was built and why (generic, no private names)

Purpose: recognize everything on an HFC design "coax-only" map and its field "walkout" map. They are the SAME physical map with different notation. Authority rules: the coax-only map supplies the station names (A# actives, E# endpoints) and design tables; the walkout supplies cable types, footages, pole IDs and field notes. Design values are never treated as measurements.

## 1. Key finding: do not use a pixel/vision model first
Both inputs are vector PDFs. Everything is already exact data:
- **Page content stream**: every symbol outline, line and label is a path or text run with coordinates and colours.
- **Markup annotations** (walkout only, ~5.5k, made on a tablet): FreeText (typed labels), Circle/Square/Polygon (shapes), Line/PolyLine, Ink (highlights), Stamp (photos). The coax-only map carries 161 FreeText annotations, the yellow A#/E# station tags.
- **Pages 2-5**: the design schedule tables (actives with levels, pads/EQ, cascade, power supply, voltage, current; EOL levels; fiber termination).
Hugging Face searches for engineering-drawing/symbol detectors returned nothing usable, and a detector would be less accurate than reading the vectors. A learned model is only worth adding later for scanned/flattened maps.

## 2. Pipeline (Python package `mapreader/`)
1. `tables.py` - parse pages 2-5 with pdfplumber, grouping words into rows and assigning columns by x position. Handles two layouts (older 750/54/42/5 MHz and 1002/258/204/5 MHz with two cascade columns). Keeps cable-simulator codes (CS3, CS6) as strings, N/A as null.
2. `markup.py` - read annotations with pypdf, flip the y axis, return per-annotation type, colour, bbox, text and rotation. Classify FreeText with regexes: pole ID (digit-6 digits), span footage (n'), cable size (412/500/625/750/875/1000), tagged addresses, small numbers, tokens, notes, `RG11`-style cable types.
3. `prims.py` - read every path through pdfium (pypdfium2) with real fill/stroke colours and transformed vertices. pdfplumber hid fills and mis-measured shapes, so this was essential.
4. `symbols.py` - rule-based symbol classifier (below).
5. `tags.py` - link each yellow A#/E# tag to its table row and decide the device type from the artwork.
6. `link.py` - compose annotation shapes with enclosed text, summarize, and build the deduplicated cable-label inventory.
7. `align.py` + `merge.py` - register the walkout sheet onto the coax-only sheet and project walkout items onto coax stations.
8. `cli.py`, `report.py` - run, JSON output, markdown report, overlay PNG.

## 3. Symbol rules (user-confirmed key)
- Numbered circle = 2-port tap; numbered square (any rotation, incl. 45 deg diamond) = 4-port; numbered octagon = 8-port. The number is the tap value in dB, never a port count. Other polygons are emitted as taps with ports unknown.
- Larger outline triangle containing small solid black triangles = amplifier; empty outline triangle = line extender.
- Solid black circle = 2-way splitter. Dots about 1 pt wide are tagged low-confidence (may be vertex markers).
- Circle half black / half white with a number = directional coupler; number is coupling dB; black half = tap leg, white half = through leg. Direction angles are computed from the offset between the two halves. (An early guess that this was a power supply was WRONG and was reverted.)
- A# = station (the node is one A#), E# = endpoint. Neither is a tap value or cable type. Do not de-duplicate stations by NAME alone.
- Power-supply label blocks are parsed from text clusters (model code, rated volts, rated amps, load amps).
- Every output record carries a `basis` field saying whether the rule comes from the user's key, a generic standard, or only visual geometry.

## 4. Bugs found and fixed (each one cost recall)
1. **Shape detection**: unclosed 5-point squares (first point equals last) were dropped; fixed by treating first==last as closed. Rotated squares were classified correctly but missing from the allowed-shape list, so most 4-port taps vanished.
2. **Word building**: numbers like "11" were split into "1","1" because kerning produced overlapping character boxes; the merge threshold now allows small negative gaps. Doubled characters (fake bold) are de-duplicated first.
3. **Concentric/duplicate outlines**: one symbol was often drawn as fill path + stroke path + second outline, causing double counts; dedupe by bbox, then by same-value taps within 1.5 pt.
4. **Contaminated labels**: a tap crossed by a street name, or carrying a jumper label, had extra text inside it. Single street-name letters are dropped and a jumper label (letters-hyphen-letters) is kept separately.
5. **Triangles**: line extender/amplifier outlines are NOT single shapes. Each side is two short collinear 2-point segments. They are rebuilt by snapping endpoints (0.35 pt), contracting collinear degree-2 vertices, then finding 3-cycles. Amplifier vs line extender is decided by counting solid black triangles within 6 pt. Five stations have no isolable triangle outline and are taken from their A# tag instead (marked as such).
6. **A review disagreement**: five stations that a draft job called amplifiers have an empty triangle beside a directional coupler. Zoomed renders plus the raw vector data (only the coupler's black half is filled nearby) show they are line extenders, which also matches their line-extender table models.
7. **Cable labels**: `RG11` labels were treated as unknown text. They are now cable types. Printed .412 stays .412 in the data and carries the user's stated assumption note (catalog MC2 .500). Footage-to-cable pairing is a nearest-label CANDIDATE only, never confirmed.

## 4b. Two-sheet registration (new)
Because the sheets are the same map: fit a similarity transform (scale, rotation, translation) from walkout coordinates to coax coordinates by RANSAC over tap symbols with equal printed values, then a least-squares refit on the inliers. Result: scale 0.709, rotation ~0 deg, 48 inlier taps, RMS 0.86 pt. Check: of 275 walkout footage labels, 273 land inside the coax sheet; of 377 sized cable labels, 376 do. That matches the earlier independent count (two footages and one cable type off the sheet), which is strong evidence the registration is right. Each coax station then lists nearby walkout items (cable, footage, pole, note) as unconfirmed candidates.

## 4c. Cable-run tracing (`graph.py`, v1, PROPOSED only)
- Cable linework on the coax sheet is unfilled strokes in a medium width class (about 0.004-0.03); hairlines are parcel lines and label leaders. Some cable spans are drawn as hairlines, so hairline segments are added only if BOTH endpoints land on an existing cable vertex or a device symbol (iterated 4 rounds), which bridges gaps without importing parcels.
- Endpoints are snapped (0.4 pt) into a graph. Components under 25 pt total length are dropped. Each device (tap, coupler, splitter, amplifier, line extender, node candidate) is hooked in if a cable endpoint lies within its radius + 3 pt, or a passing segment is split at the symbol.
- Device links come from Dijkstra from every device that stops at the next device (never walks through one). Output `cable_graph.json`: devices (with A#/E# tags), links with polyline path and length in PDF points, `colocated` flag for links under 4 pt.
- Result: 293 of 363 devices hooked, 538 links (29 colocated), 96 of 160 tagged stations have at least one link. Against a separately made draft job's connection proposals: 84 of its 132 mappable edges reproduced as a direct link. Over-linking is expected at junction clusters (more links than a tree needs); orphan devices remain (about 70).
- NOT done: pt-to-feet scale (footage labels use offset leader lines, so midpoint pairing only matched 8 spans), direction/port assignment, cable type per span, node leg A-D mapping. Nothing here is verified RF connectivity.

## 4d. Cable vs strand (important correction from the user)
- **Cable** carries the signal and passes IN and OUT of passives (taps, couplers, splitters) and actives. Cable-size labels (.412/.500/.625/.875, RG11) are printed next to the cable in the walkout.
- **Strand** is the support wire; it runs pole to pole and ONLY touches poles. It is not signal path and must never be used to link devices or to carry a cable type.
- The coax-only sheet draws cable only (no strand), so the traced cable graph is cable. Poles and strand exist only on the walkout (poles are the walkout's yellow/magenta highlights and pole-ID labels). The reader therefore never builds cable links from poles/strand.
- Evidence: after registration, 321 of 384 walkout cable-size labels land within 6 pt of a cable segment of the coax sheet (355 within 10 pt), i.e. they sit by the cable.
- `merged.json` now has `cable_label_candidates`: each cable label with its distance to any cable segment and its 2 nearest cable-link candidates (unconfirmed). Footage labels are deliberately NOT attached to cable links: a printed footage may be a pole span (strand) or a cable length between passives, which cannot be told apart from position alone.
- An earlier attempt to estimate a feet-per-point scale from footage vs pole spacing gave an inconsistent 0.7-2.0 ft/pt spread, so no scale is claimed.

## 5. Results on the coax-only sheet (consistency check against a separately made draft job, not ground truth)
Taps 248 (4-port 47/47 matched, 2-port 52/53), line extenders 44/44 matched (50 incl. tag-derived), amplifiers 20 (the draft says 25; five reviewed as line extenders), splitters 36 (draft 18, tiny dots unresolved), couplers 9 (draft 4, unreviewed). All 76 A# and 84 E# tags link to table rows.

## 6. Still open
- Cable RUNS (line geometry between devices) are not traced; no device-to-device connectivity yet.
- Splitter and coupler counts above the draft job are unreviewed.
- Walkout-only sheet symbol counts (e.g. 51 amplifier triangles vs 50 table rows) are rough; use the coax sheet for names.
- Footage labels 275 vs 273 in the draft: the difference is the two that fall off the coax sheet.
- Hardware port numbers (node legs A-D), installed equipment, and abbreviations such as CSC/NT/SA are unassigned.

## 7. Privacy
Original PDFs, jobs and measurements stay local. This explanation intentionally omits node, equipment, street and person names. Do not paste the maps themselves into an online assistant.
