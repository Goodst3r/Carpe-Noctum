# PR39 registry, scope and retained-source subreview

Pin before/after: **59ddf48986f9498b574fc1cb67081f3eb0df7dee**, comparison **8c0fc17860c5a63bfc2bb4203601dbc9438e6253**. Read-only review. No product edits, checkout, build, install, network/source retrieval, PR action, gate or device test. Parent owns rendered UI and root/numeric agent own independent formula/vector review. This subreview does not borrow or certify the author's reference arithmetic.

## Findings

1. **Medium — explicit matched non-75 Ω context is silently accepted by a fixed-75 Ω model.** `night-sweep/field-calcs.js:228–232` recognizes `Rsource_ohm` / `Rload_ohm` but checks only that their strings match. On actual `FieldCalc.cascade`, the otherwise valid thermal C1 input with `Rsource_ohm:'50', Rload_ohm:'50'` succeeds and returns exactly the fixed75 Ω result. It also succeeds if `load_ohm:'75'` is supplied simultaneously, so the explicit source/load pair can contradict the separate load declaration. `load_ohm:'50'` alone and the50→75 mismatch correctly refuse. The scope says fixed290K/matched75Ω, so this recognized contradictory context should refuse rather than be ignored; do not extend the calculator to50Ω. [Scratch diagnostic](/workspace/scratch/pr39-registry-scope-probe.json) preserves all six raw real-function calls. The desired-behavior regression `node /workspace/scratch/pr39-impedance-guard-regression.cjs /workspace/Carpe-Noctum-pr39` exited1, **4 passed /2 failed**; raw output `pr39-impedance-guard-red.log`. This is an API/model-refusal finding; the current UI does not expose impedance controls.

2. **Medium candidate for root label adjudication — the new SI/reference constants are folded into one Expert formula row, and the exact k value is absent from the registry.** `field-calcs.js:176` introduces `K_B=1.380649e-23`, `T_REF=290`, `R_MATCH=75`. New `thresholds.js:163–167` has one Expert formula row plus two Unknown count-policy rows. Its source prose identifies k as SI and T as the290K NF reference, but there is no exact1.380649e−23 J/K value, Spec constant/convention row for k/T, or associated consumer source tag. The written critique at60/89 explicitly classifies k and290K as Spec and matched75Ω as an Expert model assumption. Existing `const.coax.impedance` is a Spec nominal-plant reference used by Why cards; that is distinct from this declared matched-model assumption. The formula row's `units:'dB'` also groups a noise-floor result in dBmV with CNR results in dB. The parent/root should decide the narrow registration correction under the every-new-value rule; this report does not claim the numerical constant is wrong. `/workspace/scratch/pr39-registry-static-receipt.json` confirms exactk text absent and no explicit290K constant row.

3. **Low — current guide says two or more CNRs while implemented minimum is one.** Functions guide `docs/NightSweep_1.8_Alpha_Functions_README.md:370` says “Or two or more CNR values.” `calc.cascade.minContributions` explicitly registers1, `combineCnr` accepts one value, and the UI explains “One value is unchanged.” Align the guide with the accepted one-value identity when integrating NAV documentation.

4. **Low integration housekeeping — runner insertion is before existing B2 entries.** `qa/run-pwa.py:109–110` inserts the two cascade suites before the three current B2 suites. WORKFLOW shared-file rule says append after the last entry. During the upcoming ordinary NAV merge, retain all suites and append cascade entries after the current last entry without changing their assertions. This affects ordering/convention, not an observed failing calculator result.

The initial Test/Route/Job/Power navigation and PDFs are the known integration dependency: this pin predates NAV38. Grok has to ordinary-merge current build3, retain new group names, regenerate guides/PDFs/artifacts and gate the new exact head. Those old names are not newly diagnosed cascade arithmetic bugs. A new head needs review of its actual diff; old results remain pinned here.

## New rows and policies actually inspected

The diff has **three new registry rows**, spanning five added physical lines, not five rows. Requiring the actual registry yields153 source rows here (base150 plus3; dynamic EvidenceArchive rows are not included by this bare-module read). `Thresholds.checkRow` reports no structural metadata problems on all three. Structural completeness does not settle the mixed constant labels above.

| Policy/value | Implementation | Registry/label and qualification |
| --- | --- | --- |
| Boltzmann k1.380649e−23 J/K | `K_B` fixed | Mentioned as SI within `calc.cascade.cnr`, Expert; exact value/units are not exposed there. |
| Reference290K | `T_REF` fixed; non290 source/reference context refused | Mentioned within the same Expert formula row; source/reference convention is identified but not separately labelled Spec. |
| Matched75Ω | `R_MATCH` fixed; `load_ohm` non75 refuses | Expert assumption described in formula source/conditions; recognized pair guard has finding1. |
| B>0 in Hz | `noiseBandwidth()` strict decimal/finite/positive | Formula conditions identify equivalent noise bandwidth in hertz. No finite application envelope or maximum B is introduced. Nonfinite arithmetic refuses. |
| NF≥0 | `noiseFigure()` | Formula conditions correctly call this a narrowed model, not a universal law against negative NF. NF applicable to actual frequency/configuration is required in prose, explicitfalse provenance context refuses. |
| N≥1, integer/safe | `contributionCount()` strict digits/leading-zero-safe comparison | `calc.cascade.safeCount`, Unknown,9,007,199,254,740,991; ECMAScript Number.MAX_SAFE_INTEGER with TC39 locator; software ceiling, not RF rating. |
| At least one standalone CNR | `combineCnr()` nonempty list | `calc.cascade.minContributions`, Unknown,value1; one-value identity; guide mismatch noted above. |
| Equal receiver-referred terms | Explicit true flag in kernel | Expert scope condition. Equal equipment names/unknown return weights refuse. UI supplies its fixed-model context; parent checks rendered caveats. |
| Combined CNR normalization/independence | Kernel flags plus explicit metadata rejection | Same desired carrier/plane/B and standalone independent terms required; MER/common ingress/cumulative terms refuse. No approved CNR pass/fail target. |
| Six significant figures | UI existing `six` formatter | Formula conditions identify a presentation choice, not RF tolerance; no new precision threshold. |

The model row candidly says its primary PDFs were not opened for that row. It cites the written critique and specific BIPM/SCTE issues/sections there. Root's earlier independent primary-source receipts are separate evidence; this source subreview did not fetch sources or upgrade that provenance claim.

## Scope and retained assertions

`node /workspace/scratch/pr39-scope-preservation.cjs /workspace/Carpe-Noctum-pr39` exited0: **31 static source-preservation assertions**. Raw output retained in `pr39-scope-preservation.log`.

- Exact byte comparisons to base passed for app.js, jobs.js, docsis-health.js, engine.js, shell.html, workflow.js, study-mode.js, alignment.js, style.css, build.py, both locked QA package files and all three B2 suites.
- Actual existing FieldCalc function source strings are identical for velocity, convertLevel, rippleDistance, preEqDistance, ofdmPower, echoDelay and powerSum. Existing exported coefficients/unit/impedance/symbol-rate arrays are unchanged; cascade is the only new export.
- Removing the new contiguous cascade registry group reproduces the exact old registry bytes. Existing company rows, plant keys and B2 source/conditions are unchanged.
- Both main Markdown READMEs remain byte-identical. No screen-ID/module-list/key/job-schema/package/version change is present in this source delta; no new store or Safety/deferred feature is introduced. Existing screen/feature/guide-step arrays are not extended: only the existing calculators hint/feature text gains the synthetic CNR exercise.
- The changed old field-calculator suite retains its original assertions and adds cascade to the expected card/tag map. The existing rendered-layout assertion changes its exact card count7→8. Neither drops an established guard. The two new suites are added to the runner with count regexes.
- The new author CJS suite uses the shared vectors and a looser numerical budget than root's prepared independent comparator; this subreview did not use its arithmetic as a reference or rerun it. Parent/root execute the added suites separately. The real-browser author suite source checks C1, NF `-`, restored NF, mode-switch field removal, two40dB inputs and CNR `1e` at four widths.

## Commands, outcomes and limits

- Git/source reads (`git rev-parse`, `git diff`, `git show`, `git status`, `rg`, `sed`, `nl`): exit0 unless normal no-match documented by the static receipt; pinned head remains59ddf48 and status empty.
- `node /workspace/scratch/pr39-scope-preservation.cjs /workspace/Carpe-Noctum-pr39`: exit0,31 assertions.
- `node /workspace/scratch/pr39-registry-scope-probe.cjs /workspace/Carpe-Noctum-pr39 > /workspace/scratch/pr39-registry-scope-probe.json`: exit0, six raw actualAPI context captures, not six passing desired-behavior assertions.
- `node /workspace/scratch/pr39-impedance-guard-regression.cjs /workspace/Carpe-Noctum-pr39 > /workspace/scratch/pr39-impedance-guard-red.log`: exit1, four passed/two failed fixed75-context assertions. Product code untouched.
- Bare-module registry read / `Thresholds.checkRow` output: `pr39-registry-rows.json`; all3 new rows structurally complete. Python static presence receipt: `pr39-registry-static-receipt.json`, exactk absent/no290K constant row, empty status.

No implementation/fix attempt, build, full gate, added-suite execution, independent numeric tolerance comparison, rendered browser, PWA lifecycle, emulator, phone, meter or APK result is claimed by this subreview.
