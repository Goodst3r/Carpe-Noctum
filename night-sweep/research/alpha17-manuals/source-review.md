# NightSweep source and process-flow review

Date: November 10, 2026. Reviewed baseline: `a3d25f032c8b577c14f15ce227b2343436468aea`, NightSweep 1.6 Alpha. Line references below identify that baseline unless a fix is explicitly marked implemented. This is a source review and focused automated validation, not a physical-device test.

## Scope

Read all 19 JavaScript source modules, both CSS files, and `shell.html` under `night-sweep/` (2,952 original source lines, several very dense), plus the standalone builder and relevant regression tests. Catalog numeric transcription and manufacturer verification belong to the separate equipment audit. No architecture migration is recommended.

The five-tab task shell and one-point-at-a-time route editor already provide a sound phone workflow. The main remaining friction is disconnected context: source hardware, job identity, RF launch, station setup, evidence upload and acceptance records each require overlapping details in separate places.

## Priority findings

| Priority | Finding and evidence | Recommended focused action |
| --- | --- | --- |
| P1 — fixed | Hidden graph settings invalidate the RF engine. `engine.js:149–156` included `viewStart`, `viewEnd`, and `referenceF` in `validSetup`, so a bad Sweep view blanked valid route output and gain budgets on another tab. | Removed graph-only settings from RF validity. `grid` still rejects invalid chart ranges; source frequencies, actual launch, spectrum and temperature remain validated. Regression covers route and gain results with blank, malformed and reversed hidden graph controls. |
| P1 — fixed | Printed integer-MHz loss-band endpoints disappear. Original `curveValue` at `engine.js:6` excludes the upper endpoint of every nonfinal band even when the next band starts at a different frequency. SA multimedia through loss at 10/300 MHz returned null. | Include non-shared upper endpoints while retaining next-band behavior at shared boundaries. Only a curve with explicit `gapPolicy: 'adjacent-maximum'` may fill an internal fractional printed gap with the larger adjacent bound. No extrapolation or blanket gap filling. Root owns exact catalog policy qualification. |
| P1 — fixed | An unsent evidence draft crosses job boundaries. `evidence-ui.js:4,62–78,208–215` kept a global asset, stage and notes; switching jobs could attach the next file to the prior station and After stage. | Bind the draft to the working state owner. New owners reset type/stage/notes and seed asset from node, job or legacy metadata; rerenders and failed imports within the same owner retain typed context. Exact original evidence bytes and existing metadata stay unchanged. |
| P1/P2 | Node TP coupling is offered on every route-point meter. `meter.js:37–39,59–61` uses the selected node TP even for GainMaker/AOI station outputs or taps. The app does label the choice, but it is an easy wrong-reference action at night. | Offer node coupling at source launch only, unless the selected measurement point explicitly represents that node. Continue allowing actual typed station coupling, and preserve previously recorded reference provenance. |
| P2 | Source identity and equipment are disconnected. `nodes.js:37–40` puts node hardware in Job Details; `app.js:62,116` and `route-tools.js:52,64` hardcode an anonymous launch/amp. Source cannot be a selected node without an artificial active route row. | Add explicit launch source type, exact node/amp model and source port next to launch levels. A node output is the measured starting plane; do not add a fictitious incoming RF-gain stage. Keep model capability, operating band, live spectrum, local targets and measurements distinct. |
| P2 | Hardware selection silently supplies operating assumptions. `nodes.js:13,56–57` auto-selects a split/upper and repairs operating upper when switching bands. | Present these as editable hardware suggestions, request explicit installed split confirmation, and show a review prompt whenever selected hardware conflicts with current launch anchors or live spectrum. Do not silently rewrite measured launch levels. |
| P2 | Duplicate asset fields can disagree. `nodes.js:54` writes only `state.node.asset`; `jobs.js:30,49–58` synchronizes job/project node strings but not the node equipment asset. | Give the launch identity one clear user-facing field, with explicit context transfer to job records and evidence. Preserve legacy imports with a visible mismatch hint rather than silently choosing the wrong identity. |
| P2 | Removing a point or changing output topology leaves descendants orphaned. `app.js:228,231`; `engine.js:85–92` and `route-tools.js:63–65` correctly retain and flag the disconnected route. | Keep the current safe no-auto-reconnect behavior. Before removal show affected descendant count; afterward offer an “Open first disconnected point” repair action and list the invalid feed. |
| P2 | Similar field frequencies, bands and source targets are retyped in separate modules. `app.js:4`, `projects.js:55,61`, `frequency.js:3`, `sweep-setup.js:10,128–133`. | A job/station workflow should offer explicit “Use launch settings” or “Use selected equipment limits” actions, show a preview of changed fields, and leave raw measured values and criteria approval unchanged. Retain separate return settings for 42/54 and 204/258. |
| P2 | DSIM is an advanced free-form record rather than a setup journey. `projects.js:60,82,85–100` assumes DSIM-SG and accepts broad pilot types/ranges before exact-module checks. | Select exact DSIM model/host/firmware first, show the matching manual and step checklist, validate its published pilot range/type, and document supervisor key provenance. Do not treat housing brand, example pilots or another module’s code as compatibility. Root and DSIM researcher own this change. |
| P2 | New evidence and measurement actions do not carry selected station. `workflow.js:149`; `evidence-ui.js:215`; `projects.js:111–114`. | Add contextual “Set up this station”, “Attach files here”, and “Record before/after” actions on the selected point. Carry station/model/port only; measured numbers must remain technician-confirmed. |
| P2 | Run-sheet frequency is global across jobs. `field-report.js:3,35,126` leaves a previously chosen frequency active when another job is opened. | Reset on owner change or persist the report frequency with the owning job; default new report to the current job’s low marker. |
| P2 | Every small input redraws all hidden RF and auxiliary views. `app.js:123–143,167–174,220–228`; `route-tools.js:83–91` evaluates every face at every point, even when hidden. | Keep calculations pure but render only visible task/selected point on routine edits; refresh other views on navigation. Cache catalog band-break grid independently of job input. Verify large 200-point routes before claiming a performance gain. |
| P3 | “Same span, next tap” clones the last row, even when another point is selected. `route-tools.js:16–21,85`, `workflow.js:144`. | Label “Append after last point”, or clone from the explicitly selected point with its correct outgoing feed. Never accidentally insert into or renumber existing branches. |
| P3 | Saved sweep station snapshots are listed but cannot reopen for continuation. `sweep-setup.js:146,186–191`. | A future explicit “Open copy” can populate an editable working station without altering the immutable saved snapshot, after preserving the current station draft. |

## Existing safeguards to preserve

- `engine.js` leaves unknown loss/gain/current and invalid feeds unavailable instead of substituting zero.
- Node hardware band copying (`nodes.js:43–50`) changes only declared hardware fields and resets criteria approval.
- Source/output test-point correction remains explicit; add each correction only once (`meter.js`).
- Original evidence is hashed, saved separately from compact autosaves, verified on export/import and not decoded as a native ONX format by guesswork (`evidence.js`, `evidence-ui.js`).
- Job switches preserve the previous working job before replacing it, including original evidence references (`jobs.js`).
- Training provenance stays synthetic across edits and exports (`training.js`).
- 42 MHz return sweepless and 204 MHz XPERTrak return injection/comparison states remain distinct (`sweep-setup.js`, `sweep-guide.js`).
- Route and power topology remain separate; copying RF branches must never silently imply power passing.
- Existing 44–50 px targets, night palette, explicit units and expandable optional forms are worth retaining (`style.css`, `sweep-setup.css`).

## Changes made by this review agent

Only these application/test files were edited:

- `night-sweep/engine.js`
- `qa/alpha17-engine.test.cjs` (new)
- `qa/engine.test.js` (remove old assertion that graph-only errors should invalidate RF)
- `night-sweep/evidence-ui.js`
- `qa/evidence-context.test.cjs` (new)

The engine red run produced four expected failing behaviors before the code change. The evidence-context red run showed prior-job draft leakage and incorrect default context before its code change. No commit, publication, APK build or physical phone test was performed by this review agent.

## Focused verification completed in this run

| Command | Result |
| --- | --- |
| `node qa/alpha17-engine.test.cjs` | 8 checks passed |
| `node qa/engine.test.js` | 41 checks passed, including the existing 100 generated branch cases |
| `node qa/route14.test.cjs` | 34 checks passed |
| `node qa/evidence-context.test.cjs` | 8 checks passed |
| `node qa/evidence-ui.test.cjs` | 28 checks passed in jsdom/fake-indexeddb |
| `node qa/evidence.test.cjs` | 52 checks passed |

Root owns registration of the two new suites, the complete build/suite run, mobile layout QA, release packaging, and any additional flow changes. These targeted results do not replace that final integrated verification.
