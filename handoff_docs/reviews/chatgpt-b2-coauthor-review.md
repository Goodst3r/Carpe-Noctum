# B2 independent coauthor review — PR #37

This durable copy preserves the original scratch review and its corrected-head closure. Historical command tables below identify the equivalent preserved script/runner steps; they do not claim those durable paths were used during the earlier scratch executions. Exact portable reproduction commands and a separate fresh portability receipt appear at the end. JSON/log/screenshot names refer to the runner’s external temporary output directory unless a preserved input file is named. Readiness statements in historical sections are dated snapshots, not a current PR-status assertion.

**Latest closure:** the Medium finding below is resolved on corrected head `f54d5c2bbcf0f97f42ef87c7233012fd1a4fccab`; fresh coauthor checks pass, with no additional issue found. See the appended corrected-head receipts. Author/host gates and Grok's required review remain separate and pending. The original 58fffd3 finding/evidence are preserved below as history.

**CHANGES NEEDED on `58fffd3cf098573d1a84fab08648f18b720b715c`: one Medium software-bound completeness/regression finding.** The independent numerical, context/refusal and targeted rendered checks otherwise passed within the scope below. This supplements the author's work; it **does not replace Grok's required independent derivation and cross-builder review**, and supplies no merge authorization.

Read-only review in `/workspace/Carpe-Noctum-headroom`, pinned throughout the executed checks to that SHA, containing integration/Safety head `bc4762add2f57e8646a5ac83ed339b890d31cf61`. No source edits, builds, generic full gate/layout/smoke, dependency changes, artifact regeneration, upstream comments, pushes or merges were performed. The last checked working-tree status was empty and GitHub metadata still reported this head, open draft with the author's exact-head gate running. That gate was not claimed complete by this reviewer.

## Finding requiring a new candidate

**Medium — `night-sweep/field-calcs.js:62`, with incomplete `calc.ofdm.softwareBounds` registration:** the new converter decimal parser adds `x.length > 50`, a new text-length bound absent from the old converter and from the new Unknown software-bound row. Thus a complete finite decimal representing an otherwise supported level is newly rejected without its actual reason or a registered software policy.

Read-only actual source/base reproduction used valid context `{flatPSD:true, bandwidthUnits:'MHz', restatementOnly:true}` and widths `1.6 → 6.4`:

```js
const level50 = '0'.repeat(48) + '48'; // 50 characters, numeric value 48
const level51 = '0'.repeat(49) + '48'; // 51 characters, numeric value 48
FieldCalc.ofdmPower(level50, '1.6', '6.4', context);
FieldCalc.ofdmPower(level51, '1.6', '6.4', context);
```

The pre-B2 converter at `bc4762a` accepts both and returns `54.020599913279625 dBmV`. The reviewed converter accepts 50 characters but returns `{ok:false,error:"Enter the measured power in dBmV as a finite decimal number."}` for the 51-character value. That input is complete, finite and inside every declared numeric bound; the rejection is caused solely by its new unregistered length limit.

The existing `DocsisHealth.num` already has a 50-character text guard. A corresponding actual upstream source probe with 50/51-character decimal strings representing total `60`, known Pmax `68` and all declared confirmations accepts 50 (`compositeMargin:8`) and refuses 51. That is an **existing** bound, but the new `docsis.us.softwareBounds` summary/conditions do not expose it.

Recommended scoped correction: remove the unnecessary **new converter** length cap while preserving strict complete-decimal parsing, all physical-context requirements and the existing level/bandwidth/output numeric bounds; expose the **existing DOCSIS** text guard as Unknown/application policy. Add a real-function 50/51-character regression proving the converter retains both supported values while the existing upstream parser retains its documented guard. Then rebuild and gate a new exact head. Registering a genuinely intended new converter cap would require an explicit policy decision and accurate reason/registration; this review does not invent that policy.

The diagnostic command exited **0** and printed the six actual calls (old converter twice, reviewed converter twice, reviewed upstream twice). It was an observation probe, not a passing preservation assertion. Root independently identified/confirmed the same issue and plans the scoped correction. The numerical/native passes below remain evidence on **58fffd3**, not approval of a changed head.

## Independent mathematics and frozen reference

Before reading the implementation/test adapter, the reviewer wrote a **200-digit Python Decimal** reference from only raw H/HX input fields. It was emitted first as `independent-references.json` in the original scratch output directory and is now preserved with the checks, SHA-256 `26445b179a29e57b30aaf298efb819be00f58cb744e17f7f8c21c733920fa195`.

For a fixed common impedance and **declared flat power spectral density**, integrated power is proportional to known positive bandwidth, so `PB/PA=B/A`. From `L=10log10(P/P0)`, the independent derivation is `L(B)=L(A)+10log10(B/A)`. Bandwidths must use the same units; MHz/MHz is dimensionless. The 1.6→6.4 ratio is four and adds **6.02060 dB**; reversing subtracts it. This is a basis restatement, not an instantaneous OFDMA grant/pilot/pre-EQ reconstruction.

For two comparable logarithmic **total-power** levels at the declared CM F-connector and compatible mode/convention, signed composite margin is `Pmax_reference - simultaneous_total`, in dB. A positive result means below that reference, exact zero means at it, and a negative result means over it. It establishes no per-channel/DRW increase, future grant capacity or pass/fail. Blank Pmax permits only the explicitly assumed **65 dBmV Spec minimum/default** in declared applicable 3.1 CM+CMTS operation with MTC enabled; the app cannot certify actual capability or a protocol exchange. Another declared mode needs an entered comparable total reference and remains a generic comparison.

Each raw reference was also independently recomputed using the exact parsed binary64 inputs. The bound is `abs(Rbinary-Rdecimal) + max(F, abs(Rbinary)*64*2^-52)`, with `F=1e-13 dB` except tiny nonzero outputs below `1e-12`, where `F=abs(Rbinary)*1e-14`. These numerical budgets are not RF accuracy or company tolerance. All shared accepted cases separately match the exact-decimal **six-significant numerical values**, and sign/zero is checked separately.

All **H1–H5, HX01–HX10 and HR01–HR19** were executed against the **actual production functions independently extracted/evaluated from authored source, committed standalone and committed PWA**. No reference formula substitutes for an application output. H3/H4/H5 yield **8.00000 / 5.00000 / -1.00000 dB**; HX08 is exactly zero, HX09 remains a negative approximately `1e-6` margin, and negative measured levels remain valid. HX07's mathematical `206.021 dBmV` exceeds the existing returned-level ±200 bound, so its explicit refusal is accepted; no `total`, `delta` or other partial number is returned.

Sixteen additional real-function probes cover the 2000-MHz endpoint, ±200 level endpoints where all returned levels remain supported, total/Pmax endpoints, tiny signed differences, a tiny generic reference, absent context at **all four** supported measured-in choices, just-outside numeric bounds, MTC disabled and unknown reference provenance.

The two extra totals `65±1e-10` expose ordinary input quantization: the parsed binary subtraction is approximately `±1.0000178463e-10`, rather than the exact decimal `±1e-10` (absolute difference approximately `1.78463e-15 dB`). Those **extra** probes test the exact direction/neutral policy and six-figure presentation of the actual parsed subtraction. All shared approved H/HX cases retain the stricter decimal-reference six-figure comparison. No EPS clamp, math library or tolerance broadening was introduced. The initial diagnostic harness had demanded decimal six-figure equality for those two extra ill-conditioned inputs and produced six diagnostic failures across three artifacts; after identifying the input-representation cause, only that extra presentation criterion was corrected to the parsed-input reference. The original diagnostic log is preserved as `initial-own-six-diagnostic.log` (historical scratch log, not committed); unrounded bounds and sign assertions were unchanged.

## Context, refusal, caller and UI findings

- The raw-case adapters were read line by line. They translate only supplied facts: the written H comparison scope explicitly binds its declared common plane to the modem F-connector; the explicit applicable mode maps to 3.1/MTC; `actual_simultaneous_total_confirmed` and allowed reference-provenance strings supply their respective confirmations. Partial HR cases do **not** inherit a blanket valid context. They call production functions directly and contain no test-side physical validator. A synthetic test declaration is not represented as physical verification by the app.
- HR13 reaches the actual converter with the mixed declared units and refuses for **normalizing units**, before the oversized raw-Hz number can obscure the reason. HR19 reaches it with a request for instantaneous OFDMA total and refuses for that actual unsupported meaning. HR14 reaches the actual upstream API's explicit per-channel/DRW refusal. Every ordinary refusal returns only `ok/error`, without partial numeric outputs.
- HR15 uses actual existing `getWindow`, `againstWindow` and `windowText` behavior for both **42/54 and 204/258** plant keys. Both return Unknown/unentered and no numerical margin; no ceiling is fabricated in a test helper. Negative, exact-zero and tiny-positive/negative composite results retain the unrounded sign/status. Legacy `headroom` remains the unrounded signed alias; `margin` remains its absolute magnitude; `reading`, `compare`, Pmax/default flags and legacy status strings remain available.
- The new upstream context selector starts Unknown; a mode change clears its confirmation. Explicit text covers simultaneous total, CM connector, comparable provenance/mode/convention and MTC. The converter's explicit confirmation covers flat PSD, MHz and restatement only, at every width; neither function accepts absent confirmation as true. These are caller/user declarations, not an automatic physical validator or a modem-capability measurement.
- All **three new** registry rows have complete metadata and actual consumers: Expert/derived composite subtraction and Unknown converter/upstream software bounds. The existing flat-PSD formula is now Expert/derived, while the conditional 65 minimum remains Spec. The software-bound source dialog was actually opened in the frozen UI. The text-length omission above is the outstanding registration issue. No company value is added, and no existing local 31/43/38 reference or plant scope is repurposed.
- The genuine Study caller supplies conversion context consistent with its explicitly flat-PSD/MHz synthetic prompt. Its actual `ofdm6` generator was exercised with five seeds in each frozen UI context and checked against independent Decimal per-6-MHz references; it remains valid under the tightened function contract.
- Targeted **native Chromium keyboard** tests used committed standalone and PWA at **320 and 430 px**, dark theme/touch/mobile viewport emulation. They cover genuine `validity.badInput` from typed `-` and `1e` in upstream total/Pmax and converter power/width fields. Every malformed entry removes stale numbers; malformed Pmax never becomes the blank65 assumption. H1/H2/H3/H4/H5, exact zero and HX09 display actual six-figure strings, including trailing zeroes and signed scientific text for the tiny margin. Company Unknown, mode-reset behavior, generic-mode caveats, tags, Study, no page errors and no sideways overflow passed.
- No new screen, converter module, feature entry, storage key, package or version is added. Existing calculator/card IDs remain. Source inspection and frozen-UI assertions confirm downstream **33/40 dBmV** values/card interpretation remain unchanged, and Safety's panel/tab remain removed. Production changes do not introduce job writes; a full retention/backup round-trip was not run by this reviewer. Training/guides name the actual confirmation controls and state the same conditions and signed results.

## Own executed evidence on 58fffd3

| Command | Exit | Actual reviewer result |
| --- | --- | --- |
| `independent_reference.py — wrapper reference step` | 0 | 15 raw numeric case references frozen before implementation inspection |
| `real_functions.cjs — wrapper real-functions step` | 0 | Actual source/standalone/PWA calls for all 34 shared IDs plus 16 own cases; raw results saved |
| `validate_results.py — wrapper numerical-validation step` | 0 | **660 checks / 3 artifacts / 0 failures**, with the explicitly documented extra tiny-probe presentation scope |
| `native_ui.py — wrapper native-ui step` | 0 | **153 passed / 0 failed / 153 total**, targeted frozen standalone/PWA at 320/430 px; no page errors |
| Read-only old/current 50/51-character source probe described above | 0 | Reproduced the new converter cap and existing upstream cap; diagnostic observation, not a preservation pass |
| `git diff --check bc4762a...HEAD` | 0 | No whitespace errors |
| `git status --porcelain` | 0 | Empty at last check |

Preserved scripts/raw/reference data are under `handoff_docs/reviews/chatgpt-b2-checks/`; result JSON/logs are generated in the external runner output directory: `independent_reference.py`, `independent-references.json`, `raw-cases.json`, `own-cases.json`, `real_functions.cjs`, `actual-results.json`, `validate_results.py`, `validation.json/.log`, `native_ui.py`, `native-ui-results.json`, `native-ui.log`, and `converter-pwa-320.png`. No author-team gate counts or either supplied coauthor report's counts are copied as this reviewer's results.

Committed hashes personally read on the reviewed head:

- Standalone `outputs/Night_Sweep.html`: `ecec73de9f1c0a567980da82d593446176a0e1f27e30f378116f32e3ec5bfd44`.
- PWA `dist/index.html`: `037895c0c387dddb4d7dc3cf9404de54667677902f888a1f05c932e6c595378d`.

Source provenance: independent power-ratio/subtraction derivations and the existing written critique’s issue-specific CableLabs I20/C01 context and earlier source reads. This B2 coauthor review and durable preservation did not freshly reopen CableLabs/SCTE PDFs or run Wolfram. The new `research/build3/COMPOSITE_MARGIN_SOURCES.md` and registry conditions were read. Separate A2/Cprep primary-source activity is not B2 source-freshness evidence. No latest-issue or equipment/company acceptance claim is made.

Not run: another full gate, generic layout/smoke, generated build/render/PDF, comprehensive job/backup retention test, APK/signing, emulator, physical Android/iPhone, Safari/WebView, meter/CMTS/field acceptance or screen-reader/glove/rotation tests. **No physical-device test was run.** Exact-head author/host gates and Grok's independent review remain required. A new commit voids this head's review and needs its own evidence.

**CHANGES NEEDED — `58fffd3cf098573d1a84fab08648f18b720b715c` — register/preserve the text-input software policy as described above, then review and gate the corrected head.**

## Corrected-head closure — f54d5c2, 12 November 2026 UTC

**The reported Medium finding is resolved on `f54d5c2bbcf0f97f42ef87c7233012fd1a4fccab`; no further coauthor issue was found.** This is fresh evidence on the corrected SHA, not a transfer of an earlier review or a substitute for Grok's required independent derivation/review. The original 58fffd3 findings and failed-input history above remain intact.

The narrow 58fffd3→f54d5c2 delta removes only the newly introduced converter `x.length>50` restriction. Complete-decimal syntax validation, finite parsing, mandatory physical/conversion confirmations, measured/returned-level ±200 dBmV and `0<B≤2000 MHz` bounds remain unchanged. The existing DOCSIS 50-UTF-16-code-unit parser bound remains enforced and is now explicitly disclosed in the Unknown upstream software-bound row and source note. Standalone/PWA/worker artifacts are regenerated, with a scoped author-status update. No other production formula, scope, caller, state/storage, version, identity, plant or downstream/Safety behavior is altered by this correction.

The new author regression genuinely calls production functions with **50/51/128-character decimal strings**, separately for level, measured-in width and requested width, and compares their complete results to the ordinary valid 48/1.6/6.4 call. Its ordinary reference is independently validated by the existing H1 test. It also checks the unchanged upstream 50/51 boundary and the actual Unknown registry policy. No numeric error bound or physical-context assertion was relaxed. Root reports a real RED before the correction and intentionally stopping the old 58fffd3 author gate at **exit143 before completion**; neither that RED nor the stopped gate is misrepresented here as a passing reviewer/full-gate result.

The independent **660-check real-function script** and **153-check native UI script** were rerun **unchanged** against the corrected source, standalone and PWA. The reference hash, all shared exact-decimal six-figure comparisons, numerical bounds and previously explained extra tiny-probe presentation scope are unchanged. Those historical results/logs were retained in scratch, with the prior 58fffd3 outputs archived separately. The portable runner now produces equivalent result files in its external output directory.

An additional reviewer-owned `length_boundary.cjs` checks all three artifacts: 50/51/128 characters for all three converter inputs; upstream total **and Pmax** 50 accepted/51 refused; strict malformed-number refusal; absent context at every supported width; unchanged numeric-envelope refusal; actual Unknown metadata; and opening the **real upstream source-tag dialog** to confirm its displayed 50-UTF-16 policy. This script initially had a duplicate local identifier and exited1 at parse time, before any app test. That scratch-only typo was corrected without touching application code or assertions; the completed run passed all84 checks.

| Command on f54d5c2 | Exit | Actual reviewer result |
| --- | --- | --- |
| `real_functions.cjs — wrapper real-functions step` | 0 | Fresh real source/standalone/PWA calls; no substitute formula |
| `validate_results.py — wrapper numerical-validation step` | 0 | **660 checks / 3 artifacts / 0 failures** |
| `native_ui.py — wrapper native-ui step` | 0 | **153 passed / 0 failed / 153 total**, same frozen standalone/PWA320/430 native-keyboard suite |
| `length_boundary.cjs — wrapper length-policy step` | 0 | **84 checks / 3 artifacts / 0 failures**, including actual Unknown source-dialog policy |
| `git diff --check bc4762add2f57e8646a5ac83ed339b890d31cf61...HEAD` | 0 | No whitespace errors |
| `git status --porcelain` | 0 | Empty after checks |
| `git merge-base --is-ancestor bc4762add2f57e8646a5ac83ed339b890d31cf61 HEAD` | 0 | Corrected head retains latest Safety integration base |

The original H/HX/HR numerical/refusal meanings remain correct, including HX07's envelope refusal with no partial number, HR13's unit reason, HR19's actual instantaneous-OFDMA refusal, and HR15's actual Unknown company state for both plants. Native partial-number refusals, exact zero, tiny direction, six-figure primary output, legacy aliases, Study and all source consumers remain covered by the unchanged passing scripts.

Corrected committed hashes personally read:

- `outputs/Night_Sweep.html`: `dea5b7b3ab8cf8cd7d6f1a01c30cabba3d2a765c30d10cb9305f4f286bf16047`.
- `dist/index.html`: `121e15cbb43f27933bed5a977ffbbe7eefc768fc87784d27b993046da9b0e9a5`.

Final metadata was independently rechecked: PR37 remains open, draft, unmerged and pinned **f54d5c2bbcf0f97f42ef87c7233012fd1a4fccab**, base **bc4762add2f57e8646a5ac83ed339b890d31cf61**. Its updated body accurately says the corrected-head author full gate is running and the old gate was intentionally stopped. The visible current-head hosted `QA gate` [43208500661](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43208500661) is **in progress**, without a conclusion. The workflow API covers its first page of PR-triggered runs; this does not claim every possible trigger was examined.

**Coauthor technical closure only: the Medium issue is fixed and these targeted checks pass on f54d5c2.** No complete author/reviewer gate or hosted-green result is claimed. Grok's independent derivation/review and exact-head author/host/readiness requirements remain required; ChatGPT does not merge its own PR. During that original review, this subreviewer made no application edits, builds, generic gate/layout/smoke runs, report-branch commits or upstream actions. No physical-device test was run. A later commit requires a new review.

## Durable preservation and fresh portability verification

The historical sections above describe the original scratch review. This section records a **separate fresh run of the preserved portable checks**. Preservation changes only root/output/dependency-path plumbing: scripts are copied to a temporary directory, the selected app root comes from the CLI, and Chromium comes from an explicit argument/environment/PATH. The 660 function/numerical/context checks, 153 native checks, 84 length-policy checks, numerical bounds, raw cases and exact reference values are retained. `validate_results.py`, `raw-cases.json`, `own-cases.json` and `independent-references.json` were checked byte-identical to their reviewed scratch versions. The frozen input/reference hashes are recorded in [provenance.json](chatgpt-b2-checks/provenance.json).

Portable reproduction, from any directory:

```sh
python3 /path/to/report-checkout/handoff_docs/reviews/chatgpt-b2-checks/run.py \
  /path/to/app-checkout \
  --expected-head f54d5c2bbcf0f97f42ef87c7233012fd1a4fccab \
  --chromium /usr/bin/chromium
```

The exact preservation-verification command executed was:

```sh
python3 handoff_docs/reviews/chatgpt-b2-checks/run.py \
  /workspace/Carpe-Noctum-headroom \
  --expected-head f54d5c2bbcf0f97f42ef87c7233012fd1a4fccab \
  --chromium /usr/bin/chromium
```

It exited **0**. Its fresh steps passed reference regeneration/hash equality, real source/standalone/PWA calls, **660 numerical/context checks**, **153 native UI checks**, and **84 length-policy checks**. Every step exited0, and the generated receipt confirmed the app stayed at f54d5c2 with an empty worktree status before/after. The report branch stayed at its pre-preservation HEAD during the run, with its existing pending B2 files unchanged by execution. Results were written only to a new system temporary directory printed by the runner; no app, generated build, release evidence or existing PR34 review file was written.

The [README](chatgpt-b2-checks/README.md) documents dependencies, exact scopes, output locations and the explicit limits of these checks. Generated JSON/logs/screenshots are deliberately not committed; rerunning creates them outside both worktrees. The wrapper installs nothing, rebuilds nothing, does not invoke a generic full gate, and does not grant cross-builder approval. This fresh verification adds no source-freshness, hosted-green, complete-author-gate or physical-device claim. Separate primary-source opens for A2/Cprep are not B2 freshness evidence.
