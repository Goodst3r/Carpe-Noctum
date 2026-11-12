# PR39 independent math review — pinned59ddf48

**CHANGES NEEDED on `59ddf48986f9498b574fc1cb67081f3eb0df7dee`.** The numerical implementation passes the independently prepared reference set, but recognized physical-context contradictions can bypass the fixed290K/matched75ohm/independent-noise guards. This is a real-function/kernel finding, not a claim that the UI exposes editable temperature or impedance controls. NAV38 has separately merged asf9a2060;59ddf48 contains the previous8c0fc17 base and still needs Grok's ordinary latest-base integration/current-head author and hosted gates. No approval transfers to a new head.

## Independent derivation and numerical rules

The reference was prepared before opening any Grok cascade implementation. With exact SI `k=1.380649e-23 J/K`, fixed conventional NF source-reference `T0=290K`, declared matched `R=75ohm`, and explicit equivalent-noise bandwidth `B` in Hz, available thermal power is `kT0B` W. Loaded mean-square voltage is `kT0BR`; division by `(1mV)^2=1e-6 V²` gives `Ln=10log10(kT0BR/1e-6)` dBmV. Open-circuit `4kTBR` is a different plane and is not substituted.

The carrier power is `(1e-6/R)10^(I/10)` W; a conventional applicable noise figure has factor`F=10^(NF/10)`. Thus single CNR is`I-NF-Ln` dB. **Only after equal, distinct, independent noise terms are referred to the same receiver/carrier** does multiplying noise byN give `CNR_N=CNRsingle-10log10(N)`. Independently normalized standalone CNR contributions combine as`-10log10(sum(10^(-Ci/10)))`. Optional optical noise uses the same reciprocal-power identity; omitted optical input is not0dB. This is neither an ordered Friis chain nor a return-tree shortcut based on identical model names.

The reviewer oracle uses Python Decimal precision220 and direct linear powers/ratios/sums, independently of the app's shifted/log1p reciprocal-CNR routine. Frozen reference SHA256`c0976014c88b2d9f527365b1d3682e588caa3e54538b7388df23656027726750`; immutable shared vector SHA256`fa87017273e9915ded87e09f1e49af50d76b1c755daa7893660a0bd5113314b2`. Files under`/workspace/scratch/cascade-prep` predate this implementation read; copied unchanged into`/workspace/scratch/pr39-math` for portable local comparison.

For exact-decimal referenceR and separately recomputed binary64-input referenceRb, `Q=abs(Rb-R)` and the independent absolute bound is `Q+max(F,abs(Rb)*64*2^-52)`, with ordinary`F=1e-13dB`; for nonzero magnitudes below1e-12,`F=abs(Rb)*1e-14`. Correct sign/zero and six-significant-figure numeric value are checked separately. No tolerance or vector was changed after seeing app output. Exact DOM display checking is a separate UI review; the1246-count result below is explicitly **without** `--require-ui`.

| Case | Independent six-figure values |
| --- | --- |
| C1,B6.4e6Hz,I15,NF8,N10,optical45 | floor−57.1628dBmV; single64.1628dB; equal54.1628dB; optical-combined44.5029dB |
| C2,B5.12e6Hz,otherwiseC1 | floor−58.1319; single65.1319; equal55.1319; combined44.5979 |
| C3,CNR40/43/46 |37.5637dB |
| C4,CNR40/40 |36.9897dB |

C1/C2 are distinct integration conventions, differing by`10log10(6.4/5.12)≈0.969100130081dB`, not automatic conversions from nominal channel width. The54-case set includes all39 shared cases and15 reviewer extras:24 numeric cases/54 scalar outputs,30 refusal cases. Stress cases±1000CNR, N=maximum safe integer,1Hz/1GHz, negative carrier/CNR, fractional inputs, optional negative optical CNR, zero/single identities, and tiny additions all ran without a registered-bound exception. `[0,200]` and`[0,1200]` produce the correct nonzero negative results−4.34294E−20/−4.34294E−120; neither became zero.

## Real-function adapter and completed numerical results

`run_real_cascade.cjs` only forwards each raw input object to the actual `FieldCalc.cascade()`. For source it evaluates the committed calculator prefix before`const FieldCalcs=`; for standalone/PWA it loads the committed HTML in JSDOM and invokes the same actual exposed function. It preserves the complete raw app result and only aliases `thermal_floor_dBmV→thermal_noise_dBmV` and `equal_contributions_CNR_dB→equal_chain_CNR_dB`; single/combined names already match. No equation, alternate formatter or synthetic app result is implemented in that adapter.

- **162 real calls**:54 raw cases ×source/standalone/PWA. Zero runtime errors; exact pin unchanged; ending Git status empty.
- **1,246 independent numeric/refusal checks,0 failures**, three artifacts. All24 numeric cases succeed with their54 scalar outputs per artifact; all30 refusals return no numerical output. The25 shared refusal strings match exactly. Five reviewer-extra reasons were manually recorded with category-specific rationales, and the annotation helper requires each actual reason to match the literal reviewed string rather than blessing arbitrary text.
- Maximum observed error/bound ratio across the162 scalar observations is about0.023. Bounds were never widened. Canonical reference hashes remain unchanged.
- Author-added `node qa/build3-cascade.test.cjs` independently rerun: **62 checks passed, exit0**. Its reference tolerance is looser than this reviewer comparator and is not borrowed as the independent oracle.

## Medium finding: incomplete fixed-model/context guards

`night-sweep/field-calcs.js:223–235` validates some declared physical context, but `NF_ref_K` is ignored. The existing`Rsource_ohm`/`Rload_ohm` branch at:228–230 checks only string equality, so equal50/50,0/0,NaN/NaN orunknown/unknown values are accepted while arithmetic at:266 still uses constant75ohm. Explicit`load_ohm:'50'` correctly refuses, and actual75 controls succeed. Supplying a different explicit recognized impedance pair must not silently substitute75.

Valid C1 plus `NF_ref_K:'300'` also computes the fixed290K result even though a different NF reference is outside this narrowed model. `NF_ref_K` is already a shared CR18 context name. Refuse unsupported explicit reference/impedance values; no alternate-temperature or50ohm calculator is requested.

`correlation:'common_ingress'` is another recognized shared context field, but its refusal is inside`combineCnr()` at:240. It is ignored by`thermal_chain`, even when contradicting the equal-independent declaration. The common dispatch must reject an explicitly declared correlated-noise context before calculating independent thermal contributions. This is another facet of the same incomplete-context guard issue.

The extended probe also adds the real shared`kinds:['CNR','MER']` field to a thermal+optical operation. It currently returns a combined CNR, because the MER check at:239 is likewise combine-only. Its cross-operation applicability is documented here as a domain-stress observation for root assessment; the primary fixed-reference/impedance/correlation findings above do not depend on inventing an`optical_kind`field or requiring new UI checkboxes.

Desired-behavior regression `check_real_guards.cjs` runs13 contexts across all3 actual artifacts: **18 passed/21 failed,39 total, exit1**, zero runtime errors. Six controls/artifact pass (fixed75, matched75number/string, equal75.0 declarations, explicitload50 refusal, source75/load50 refusal, NFref290). Seven contradictory declarations/artifact are wrongly accepted: matched50/0/NaN/unknown, NFref300, common-ingress thermal, thermal+optical MER. Raw observed results are retained; e.g. matched50 returns the same75ohm floor`-57.16277482047224`dBmV. A refusal must return a relevant reason and no numerical output. These unchanged desired-behavior assertions can be rerun after Grok's correction; no production edit or test weakening was made.

A delegated source-only audit independently reproduced four scoped context cases (one valid control passed/four desired refusals failed, exit1), report`/workspace/scratch/pr39-guard-review.md`. Its optional `NF_datasheet_conditions_match:'unknown'` diagnostic is excluded from blocking assertions because the shared/public flag is currently boolean; no new schema rule is inferred from that string.

## Scope, labels and provenance

No new physical formula/score beyond fixed290K/matched75ohm thermal CNR was found. No CTB/CSO/MER prediction, ordered Friis, editable temperature, storage field/key, new screen, company target or plant-specific input is introduced by this source. 42/54 and204/258 are not calculator inputs and stay separate elsewhere.

The source has one Expert formula row and two Unknown software rows (minimum1defined contribution, safe-integer maximum9007199254740991). Formula conditions state the loaded-voltage convention, fixed reference, applicability of NF, equal receiver-referred contributions, independent normalized CNR and optional optical term. Parent/root's UI/source-label review remains separate, including individual constant labels/units.

Issue-specific primary references are the already recorded SCTE2702021r1§§13–14 and SCTE293-112025§§5.2–5.5/thermal-noise appendix, plus exact SI k. Parent/root previously reopened relevant excerpts and recorded metadata under`cascade-prep/root-primary-open-receipt.json`; representative exact Wolfram calculations are in`root-wolfram-receipt.json`. This child did not make a fresh external retrieval or claim the latest issue/full primary-document audit. The author's registry explicitly says its writer did not open those PDFs; that is not misrepresented as independent source retrieval.

## Actual command record and artifacts

All paths below are scratch, not app-source changes. The app worktree was never edited, rebuilt, installed into, checked out or committed by this subreview; dependencies had already been installed by root. No GitHub write or merge action.

| Command | Exit / own result |
| --- | --- |
| `node /workspace/scratch/pr39-math/run_real_cascade.cjs /workspace/Carpe-Noctum-pr39 /workspace/scratch/pr39-math` |0 on completed run;162 real calls;0runtime errors; clean59. Log`adapter-third.log`; raw`actual-results-initial.json`. |
| `python3 /workspace/scratch/pr39-math/annotate_semantic_reviews.py` |0;5explicit own-case wording/category records, each checked against all3 actual outputs. |
| `python3 /workspace/scratch/pr39-math/validate_future_results.py /workspace/scratch/pr39-math/actual-results.json /workspace/Carpe-Noctum-pr39/handoff_docs/reviews/chatgpt-calculator-test-vectors.json` |0;1246checks/0failures; noUIclaim. RawvalidationJSON/numeric-validation.log retained. |
| `node qa/build3-cascade.test.cjs` |0;62checks. Log`author-cascade.log`. |
| `node /workspace/scratch/pr39-math/check_real_guards.cjs /workspace/Carpe-Noctum-pr39 /workspace/scratch/pr39-math` |1;18pass/21fail/39; raw`guard-results.json`; complete`guard-regression.log`. |
| `git rev-parse HEAD`, `git status --porcelain` |0; exact59ddf48986f9498b574fc1cb67081f3eb0df7dee; empty status before/after. |

Initial scratch adapter attempts exited1 because the extraction boundary guessed`FieldCalcUI` then`FieldCalcsUI`; actual UI wrapper is`FieldCalcs`. Both error logs are retained as`adapter-initial.log`/`adapter-second.log`; they made no app calls and are not called passes. An early dependent results read was attempted before the adapter session finished and failed with missing scratchfile; after awaiting the session, the actual output existed and all comparisons ran. These are harness/setup incidents, not application fix attempts. No source/math/tolerance change accompanied their correction.

Not run here: exact six-figure DOM/UI audit (parent's separate agent), browser keyboard/native-number controls, full reviewer gate (not mandatory for statelessA2), fresh hosted/current-head author readiness, emulator/physical-device/Safari/WebView/screenreader/meter/field/APK/signing. No physical-device test was run. Root must commit the required math review, post current-head findings and re-review actual changed code/artifacts after the author updates/integrates NAV; this report supplies no merge approval.

## Portable wrapper verification

The wrapper `python3 /workspace/scratch/pr39-math/run.py /workspace/Carpe-Noctum-pr39 --expected-head 59ddf48986f9498b574fc1cb67081f3eb0df7dee` was actually run after adding an explicit output-directory argument to the semantic-annotation helper. It wrote only`/tmp/cn-pr39-math-6sohxm2a`, with no app/bundle output mutation. Commands1–3 exited0 (same162calls/1246checks/0numerical failures); unchanged guard command exited1 with18pass/21fail. Overall wrapper exit1 is the expected product-regression result on this historical head, not a green approval. Receipt`/tmp/cn-pr39-math-6sohxm2a/run-receipt.json`; raw wrapper output`pr39-math/portable-wrapper.log`. Frozen oracle/reference/comparator bytes are unchanged. This repeat specifically verifies portable output handling and is not aggregated into a new larger independent-check count.


## Root independent execution and UI/source adjudication

Root separately copied the frozen comparator/reference/forwarder into`/workspace/scratch/root-pr39`, ran162actualsource/standalone/PWA calls (exit0/zero runtime errors/clean59), reviewed/annotated the five extra-case semantic refusals (exit0), and ran the unchanged strict comparator (exit0/1,246checks0failures). Root then merged the separate actual390px DOM strings into the result protocol and ran `validate_future_results.py actual-results-with-ui.json <vectors.json> --require-ui`: **exit0/1,354checks/0failures**. No app result is recomputed by the adapter, no bounds/refusals weakened and no vector changed.

The UI reviewer independently ran both actual artifacts at320/360/390/430dark: **824checks/0failures/0runtime errors**, including all24numericcases ×8artifact/width combinations (192exactoutput maps/432individual six-figure DOM values), all thermal fields and three CNR row positions with native`-`/`1e`, blank/error/no-stale-result behavior,44px form controls/no overflow, and zero calculator/source-dialog storage writes. The author browser suite separately passed24. CanonicalDOMcapture SHA256`f0e7838fc0a14637c6d5658ebc36e11ad1170b4436df78c73cebd11c49e31fda` is frozen for this59head, not a later UI pass. [UI/scope report](chatgpt-pr39-checks/ui-scope-review.md) preserves the separate helper failures and final passing run; [registry subreview](chatgpt-pr39-checks/registry-scope-review.md) records31preservation checks.

**Second Medium finding — exact labelled constants and source units:**`field-calcs.js:176` introducesk=1.380649e−23J/K,T0=290K,R=75Ω;`thresholds.js:163–167` provides only one Expertformula and two Unknowncount-policy rows. Actual source dialogs on both artifacts/all four widths show Units`dB` and omit both`dBmV` and exactk. Register/expose the exact SI constant and290K NF-reference convention with their Speclabels/value/units/source; preserve75Ωas the explicit Expertmatched-model assumption. Keep the formula Expert and identify floor dBmV versus CNRdB in its units. This follows the every-new-value registry rule and written critique; no new model or company limit is requested.

Low integration corrections: Functions guide currently says“two or more”while the registered/implemented minimum is1and CX10identity passes. Also append the cascade runner entries after the existing last suite, retaining every suite/assertion, per the shared-file convention. Reconcile all new text with NAV's current Tools paths and regenerate affected current guide/PDF artifacts during ordinary latest-build3 integration.

The context finding is a single group of incomplete fixed-model guards, independently reproduced; duplicate50Ωprobes are corroboration, not separate defects. The numerical and rendered passes do not override those context refusals or source/unit requirements. No full reviewer gate was run for statelessA2; the exact-head author/host and current-base readiness checks are required after corrections. **CHANGES NEEDED —59ddf48986f9498b574fc1cb67081f3eb0df7dee.**
