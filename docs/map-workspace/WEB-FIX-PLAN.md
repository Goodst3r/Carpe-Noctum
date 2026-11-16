# Build 6 web-map correction plan

Baseline: 249d477 on codex/build6-map-workspace, existing draft PR62. One active checkout /workspace/Carpe-Noctum. User approved this plan after private coax-map assessment. No full GS7K forward/EDR setup expansion, deployment or signed APK.

## Approved behavior

1. Constant 16px visual markers, 44px touch targets; cluster overlapping screen positions with a chooser at identical coordinates. Search inside fullpage editor. Stable pan/pinch, readable Selected point card (>=12 CSS px), high resolution viewport PDF redraw after gestures with stale render cancellation. Separate fullpage masked scan raster retains normalized page coordinates.
2. Compact adjacent tombstones: ID, equipment, input/output endpoint levels for every physical output and status. Minimum8pt in exported PDF, never shrink to fit. Expand cards, preserve saved placement/leader lines; append linked full detail pages with pad/EQ/director/readings/issues. Printed preview and PDF share layout. Overview can simplify crowded labels; selected card remains readable.
3. Preserve original label bounds/annotation IDs independently from actual equipment bounds and cable attachment points. Recognize confirmed project shapes, compound node, amplifier/LE/taps/passives. Suggest source in import review (user confirms once, no globally hardcoded private tag). Retain manual confirmed placements.
4. Trace connected cable vectors from actual equipment contacts. Reject roads/building outlines, no invented joins at crossings or gaps. Route proposals remain unconfirmed and require physical direction/port/cable/length. Detect EOL terminal candidates; schedule match only unambiguous identifiers/upstream evidence, otherwise searchable unplaced queue with branch filter/oneclick placement. Group warnings in in-app import review instead of browser confirm wall.
5. GS7K enabled main outputs1,2,4,5; optional3/6 require hardware confirmation. Map A/B/C/D aliases independent. Preserve all existing physical port IDs/sweeps including older port3; flag unverified assignments, do not relabel/drop or corrupt saved jobs. One shared known/enabled port resolver across UI, graph, store, RF.

## Constraints

Local-only PDFs and training; no private fixtures or training text/images in Git or external tools. Optional online scan remains explicit masked-preview consent. Preserve corrected RF/ONX engine, source measurements, native originals and selective confirmed-active A# replacement. Native source checks and browser checks do not imply Android/device acceptance. Generated outputs rebuilt locally, not committed. No Grok. Claude unavailable in exposed models; identify actual independent reviewer.

## Tasks / ownership

- [ ] Viewport/selection/fullpage UI: Terra implementer owns map-viewport, new map-display/marker helper, ui/style, focused tests. Primary coordinates APIs.
- [ ] Port resolver/compatibility: primary owns catalog, graph, store, RF integration and tests; UI calls resolver.
- [ ] Compact PDF tombstones/detail pages: primary owns maps tombstone/export section and tests, keeps importer section isolated while UI work proceeds.
- [ ] Symbol/contact/topology recognition: subsequent implementer owns importer sections/new geometry helper and synthetic/private tests after first task report.
- [ ] Import summary/queue integration: primary with scoped helper as needed, after importer output settled.
- [ ] Review, correction pass, full suites, private browser replay and update PR62.

## Acceptance / checks

Focused tests must reproduce actual defects before fixes. A2/A48 separately selectable on phone. A73 compact selected card readable; PDF font>=8pt, original pages retained, full detail pages linked, matching identifier removed exactly once and original bytes unchanged. Source binding keeps sweeps, default port5 available, older port3 retained/flagged. Ambiguous EOL/crossings unresolved but manually completable. Rotation/crop/UserUnit/offline/stale async checks. Run npm ci, npm test, npm run build, npm run test:browser, npm run test:ai-browser and private coax replay outside Git. Update source docs with actual outcomes/limits.

## Progress ledger

Start: approved plan recorded. Existing generated-output diff belongs to the prior build, no authored changes at baseline.

### Implementation ledger

- UI/viewport task: completed by Terra. Fixed 16px/44px screen controls, chooser/search, selected card, import review, EOL queue, high-resolution detail canvas and optional port controls. Scoped Sol6.1 review found four issues (layering, import cancellation, legacy stage targeting, edge chooser clipping); each received RED→GREEN coverage and scoped re-review passed. Private browser then found missing chooser dismissal and mobile hidden summary spans; fixes have interaction and Chromium visibility regressions.
- Ports task: known vs enabled resolver, GS7K outputs1/2/4/5 and opt-in3/6, validation preserves older readings/edges. RF excludes unverified outputs. Luna review found the remaining IO adapter using old defaults; a port3 import regression failed first and passes after the known-port resolver was applied. Scoped re-review clean.
- PDF/raster task: viewport-clipped renderer with device pixel ratio capped2 and4M pixels, separate whole-page privacy raster. Compact8pt cards with linked full reports and source-page return links. Sol6.1 review validated rotated/cropped/UserUnit link rectangles and found report overflow; export now refuses an output beyond the shared200-page limit, with a regression first failing and then passing.
- Geometry task: Sol6 implemented A/E annotations, equipment contour/contact matching, compound node and passive motifs, conservative cable subset/topology and unmatched review identities. Active tags reject adjacent tap contours; contact distances use actual outlines. Astra review found missing closing edges, rotation-sensitive node recognition, and dropped unmatched E annotations; synthetic/native PDF regressions now cover all three and scoped re-review passed.
- Private acceptance before final freeze:160/160 provisional positions,14 unconfirmed route proposals; A2 source suggested and port5 available; A2 and A48 separately selected through chooser; A73 found by search; card text>=12 CSSpx; marker symbols16×16px; exported original5 map pages plus linked report; original bytes unchanged; zero external requests or browser errors. Individual route proposals are not represented as confirmed topology.
- A high-zoom private screenshot exposed external CSS scaling of SVG stroke widths despite vector-effect. Inverse screen scale now keeps route strokes/card outlines thin; a synthetic Chromium pixel regression failed against the old stroke rule and passes with the correction. Manual placement retains same-page annotation identity while discarding stale equipment bounds; its regression also failed before implementation.
- Ruling: source/combined PDF cap raised from20 to200 pages to accommodate station appendices while retaining the20MiB source-byte cap. Export refuses a combined result over200 pages. Cost: larger bounded import analysis; no unsupported output is emitted.
- Ruling: CAD zoom ceiling128×, with viewport-sized detail rendering, because32× still undersized the supplied map's tiny symbols. Cost: more frequent detailed redraws, bounded to4M pixels; screen marker sizes stay constant.
- Scope remains web-map corrections and physical output identification; no full GS7K receiver/EDR workflow, live AI deployment, Android signing, merge or deployment.
