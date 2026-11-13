# Next update: HGD station worksheet and map-built runs

Decision from Spencer, November 13, 2026. This scopes the **next** update; it does not alter the current build 3 release gate.

## Installed GainMaker model

Use **Cisco GainMaker High Gain Dual (HGD), 1 GHz, 42/54 MHz** as the sole GainMaker choice for new station work. The pictured housing is marked 1 GHz, 42/54 and AGC; those markings identify the family/configuration for this plant, not a universal set of plug-in values. Remove other GainMaker models from new-job pickers and practice defaults. Preserve legacy jobs containing other models and preserve the separate AOI/Vecima upgrade workflows. Do not silently convert stored equipment records.

## Sweep entry: one station, every active leg

Keep the default worksheet short:

- Station label = exact source map **NAME** column. Keep TAG and model separately.
- Enter the actual low/high marker frequencies used on this job (do not force 54/860 if carriers stop earlier).
- Record forward input levels and forward output levels at those markers for MAIN, AUX1 and AUX2 as applicable. The station input may be shared, with a per-leg override if the measurement plane differs. Unused legs are hidden or marked not present.
- Show measured gain and output tilt per leg only when the necessary readings and matching frequencies are present. Keep Before and After sets editable. A saved sweep trace/reference is optional evidence, not a prerequisite to entering levels.
- Record measurement plane as input/output port or named test point. If a 20 dB test point is used, display raw meter reading and explicit addback separately; never infer or apply coupling from the photo. Blank means unknown, not zero.

Provide a compact **Pads & EQs** area on the same station. Record installed and changed values for FWD IN PAD, FWD IN EQ, I/S PAD, I/S EQ, FWD MAIN OUT PAD, FWD AUX OUT PAD (identify AUX1/AUX2 path), REV OUT PAD, REV EQ, REV MAIN IN PAD, REV AUX1 IN PAD, REV AUX2 IN PAD, and AGC PAD when present. The UI may group these by forward/return and hide unused slots. Values are editable numbers with units dB; do not copy the photo's particular plug-ins to other stations. No auto recommendation without model-specific qualified tables and entered measurement planes.

Return readings can remain in a secondary section with their actual injection and receiver planes. Do not calculate a forward gain from return readings or assume a return injection target.

## Map upload creates a route draft

Allow a tech to select a PDF or image locally (including a marked-up or annotation-layer PDF), choose the node and output port, and enter destination NAMEs. Flatten or render annotation layers for visual review, then parse vector text/geometry and, for raster marks, use an offline recognition method if available. This overrides the prior no-OCR scope rule in `docs/BUILD_LIST.md` **for this specifically requested map-import feature**. No upload to a cloud service is required for job creation.

Extract a candidate graph with source, cable spans (feet and diameter/construction where legible), tap/splitter/coupler ports, existing active locations, and destination NAMEs. Treat TAG, NAME, MODEL, proposed equipment, crossed-out/no-cable notes and installed markings as separate evidence. Preserve source page and position for every extracted element. Generate editable route rows and a review list for unknown links, split legs, cable curves and device losses. Do not claim numeric RF predictions for incomplete paths.

The user confirms the drawn candidate route and can fix any edge or cable size before saving. Never force a connection across an uncertain map crossing, a line-cut mark, or a proposed booster. Ignore absent boosters when flagged. An active's GainMaker HGD model comes from the job configuration, while its **NAME** is copied verbatim from the map's NAME column. Keep the map private in the job; do not commit field maps to the public repository.

## Acceptance examples

1. A station with MAIN and AUX1 records actual low/high input and output, old/new FWD IN PAD and EQ, and two distinct output pad values. Save/reopen/export/import returns the same NAME, leg readings, frequencies, measurement planes and plug-in values.
2. A test-point input of -20 dBmV remains -20 raw until the user explicitly enters the chosen addback; a missing addback produces no corrected level or gain.
3. A scanned map with a separate TAG and NAME labels the station with NAME; changing its MODEL does not rename it. Two stations with the same NAME remain distinguishable by TAG/location rather than having fabricated suffixes.
4. A marked PDF with an unconnected crossing, a proposed booster and an unclear .412/.625 transition produces a draft with review items. It does not insert the booster, connect the crossing or select a cable loss curve by diameter alone.
5. A map whose annotations are stored in PDF layers is rendered with its markings visible and produces the same candidate NAMEs as the flattened copy.
6. Existing saved jobs and AOI/Vecima workflows remain readable after the GainMaker new-selection list is narrowed. A legacy LE or HGBT record is not rewritten as HGD.
7. An image or PDF with unreadable NAME or route marks yields an unresolved item and lets the tech enter the value manually; it never invents an asset or a level.

Implementation sequence: specify a small job schema migration that preserves old records; build the compact station worksheet and save/restore checks; implement local map rendering/recognition and graph construction; validate against the two HA0005 maps and a separate synthetic ambiguity fixture; render and test on phone and browser. Treat OCR recognition as candidate evidence, never as certified plant truth.
