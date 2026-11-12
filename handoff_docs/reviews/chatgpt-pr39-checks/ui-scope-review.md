# PR39 independent UI, registry and scope review

Pin before/after: **59ddf48986f9498b574fc1cb67081f3eb0df7dee** in `/workspace/Carpe-Noctum-pr39`; baseline8c0fc17860c5a63bfc2bb4203601dbc9438e6253. This report is read-only and head-specific. Root/numeric agent own the independent unrounded formula/vector comparison and PR actions; this reviewer owns real DOM/key behavior, source-sheet output and a delegated source/registry subreview. No checkout, build, install, product edit, push or PR action was performed. The author’s existing built standalone/PWA bytes were served locally. No physical-device/emulator/WebView/Safari/meter/field/APK claim.

## Findings

1. **Medium, same model-context defect independently found by root — explicit matched non75Ω context can be silently ignored.** `night-sweep/field-calcs.js:228–232` recognizes `Rsource_ohm` / `Rload_ohm` but verifies only that their strings match. Actual kernel calls with C1 and50/50 succeed with exactly the fixed75Ω numbers, with or without simultaneous `load_ohm:'75'`; explicit `load_ohm:'50'` and50→75 mismatch refuse. The fixed75 model should refuse recognized contradictory contexts rather than broaden the model. Delegated desired regression exit1: **4 passed/2 failed**; `pr39-impedance-guard-regression.cjs` / `pr39-impedance-guard-red.log`. Six raw actual results in `pr39-registry-scope-probe.json` are reproduction captures, not six desired passes. This corroborates the parent’s same finding and is not counted as another defect. The UI has no impedance field; the kernel context is real and used by shared refusal CR19.

2. **Medium — exact new constant registration and mixed output units are incomplete.** Actual Expert source-dialog text was captured for both artifacts/all4widths in `pr39-ui/receipt.json` → `sourceDialog`, and visually inspected at390px. It shows Units **dB** for a formula that also produces a noise floor in **dBmV**; neither dBmV nor exact k **1.380649e−23 J/K** appears anywhere in the sheet. `field-calcs.js:176` introduces exactk,290K and75Ω. `thresholds.js:163–167` adds only the combined Expert formula and two Unknown count-policy rows. It mentions k as SI/T as NF reference/R as Expert in prose, but the exactk value/units are absent and k/T’s Spec constant/convention labels from the written critique60/89 are not separately exposed. The formula is correctly an Expert model; the issue is the missing exact labelled constants and floor unit, not its numerical value. Root decides the narrow registration/source-tag correction. `pr39-registry-static-receipt.json` and actual source dialog establish concrete content, rather than a preferred registry layout.

3. **Low — guide’s minimum conflicts with the implemented one-value identity.** Functions Markdown370 says “two or more CNR values.” Actual minimum is registered1; CX10 renders40.0000 for one40dB value, and the UI says one value is unchanged. Align that existing text during NAV integration.

4. **Low — runner insertion order differs from shared-file rule.** The two cascade suites were inserted before the three existing B2 suites rather than after the current last entry. Preserve every assertion/suite and append them at the end on integration. This is convention/integration housekeeping, not a failing numeric result.

Known Test/Route/Job/Power guide paths here predate NAV38; Grok is to ordinary-merge current build3, keep new navigation and rebuild/re-gate. This report does not relabel that already-known integration dependency as a new cascade math bug.

## Fresh rendered checks

Command:

```
python3 /workspace/scratch/pr39-ui/check_cascade_ui.py /workspace/Carpe-Noctum-pr39 --receipt /workspace/scratch/pr39-ui/receipt.json
```

Final exit **0**, **824 checks passed**,0 failed,0 runtime errors, exact pin unchanged and empty ending porcelain. Raw log `pr39-ui/run.log`; browser Chromium `/usr/bin/chromium`, desktop with mobile/touch emulation in dark mode at320/360/390/430px. Both actual `outputs/Night_Sweep.html` and `dist/index.html` were tested.

- All24 independently prepared numeric cases, including all14 shared C1–C4/CX01–CX10 plus ten numeric reviewer extras, were entered through actual controls in each artifact/width. **192 exact output-map assertions /432 individual six-significant-figure DOM values**, using the preimplementation Decimal reference strings rather than app arithmetic. Exact units were independently checked: floor dBmV, CNR dB. One-value40.0000/zero0.00000 identities and large ±1000dB cases retain the required text; tiny `[0,200]` / `[0,1200]` results remain nonzero negative values.
- Native `-` and`1e` were typed into every thermal input (bandwidth, carrier, NF, count, optional optical) and each of three CNR row positions. Each has real `validity.badInput`, explanatory refusal, and no stale numeric result. Blank NF stays Unknown; optional optical blank leaves only the three thermal values. Internal CNR blank refuses, while an optional trailing empty row is omitted. Zero/negative B, negative NF, nonpositive/fractional/unsafe count refuse with relevant text and no partial numbers.
- All numeric views fit without sideways page scrolling. Visible form controls are at least44px; the existing calculator source-tag24px convention was not replaced with a new assumption.320px card and390px source-sheet screenshots were visually inspected; text wraps and controls are readable. This is browser evidence, not phone evidence.
- Displayed model conditions explicitly say fixed290K, matched75Ω, equivalent noise bandwidth in Hz, equal receiver-referred independent noise, normalized standalone CNR, no MER/CTB/CSO/Friis/company target and no plant-derived default. There are no editable temperature/impedance or physical-context checkboxes. The card presents a stated model and forwards its stated flags; the critique requires accompanying conditions but does not mandate invented confirmation controls, so absence of checkboxes is not filed as a defect.
- Exact working-state JSON, localStorage keys/values and instrumented Storage writes were compared around all calculator/source-dialog use in each artifact/width. All8 comparisons passed with zero setItem/removeItem calls. This addition is stateless and does not create a store.

The original author real-browser suite was independently rerun:

```
NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-cascade-real.test.py
```

Exit0, **24 checks**, four widths320/375/390/430; raw `/workspace/scratch/pr39-author-real.log`. Those results are separate from824.

## Actual canonical DOM strings for root validator

`/workspace/scratch/pr39-ui/canonical-ui.json` contains only actual390px DOM strong-text strings, keyed `{standalone:{C1:{thermal_noise_dBmV,...},...},pwa:{...}}`, all24 numeric cases/artifact. It forwards raw observed text without recomputation. SHA256 **f0e7838fc0a14637c6d5658ebc36e11ad1170b4436df78c73cebd11c49e31fda**. The final824-pass capture is byte-identical to the earlier actual numeric capture from the helper-wording run. Root can merge these strings into its actual-result receipt and run the unchanged independent comparator with `--require-ui`. This report does not claim root’s separate unrounded check count.

## Static preservation and provenance

Delegated `/workspace/scratch/pr39-registry-scope.md` records **31 fresh source-preservation assertions**, exit0; all3 new rows pass structural `Thresholds.checkRow`. Static structural completeness does not cure findings1–2. Existing FieldCalc functions/output exports, B2 functions/context guards/rows/suites, app/jobs/engine/workflow/shell/style/build/package locks and source/storage IDs are unchanged versus8c after isolating the new calculator additions. Existing tests retain assertions; count/tag expectations extend7→8 cards. No screen/module/key/job-schema/package/version/plant change or restored Safety/deferred feature was found. Existing training hint/feature text gains the synthetic exercise; no new screen or practice-feature row was appended.

The root’s already-opened issue-specific primary source excerpts and independent preimplementation oracle were reused; this child did not fetch primary sources or claim the author opened them. Tools actually used: local Git/source reads, Python/Node probes, Python Playwright/Chromium and local image inspection. No missing required repository file was identified.

## Retained helper failures

No failed application assertion remains in the final UI matrix. Diagnostic setup mistakes are retained separately rather than called app defects:

- Attempt1 instrumentation returned the last assigned Storage function from Playwright evaluation, causing `Illegal invocation`; exit1 before any checks. Wrapped setup in an IIFE returning a scalar. `attempt1-storage-instrumentation.log/.json`.
- Attempt2 reached101 checks/one literal-condition helper failure, then timed out30s waiting for explicit `[role=dialog]`. The app uses native `<dialog id=sourceSheet>` with implicit dialog role, so the CSS selector was corrected to `dialog.source-sheet[open]`. `attempt2-dialog-selector.log/.json`.
- Attempt3 completed824 checks with eight helper failures because the expected literal was “same carrier” while the correctly stated card says “one carrier”; all numeric/native/storage/layout checks passed. Corrected only that expected prose token and reran the full matrix unchanged otherwise. `attempt3-condition-wording.log/.json`.
- A source-discovery `rg` initially named nonexistent `night-sweep/source-dialog.js` (exit2); subsequent `rg --files` and source reads found the dialog in `thresholds.js`. No product file was unreadable.

Root may now release/re-pin the review worktree. No approval/merge action is supplied by this child; the model-context and source-label findings remain for the author on this tested head.
