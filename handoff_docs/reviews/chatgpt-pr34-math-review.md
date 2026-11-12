# PR #34 independent math and checklist review

**Latest technical APPROVE — `df857d06b3f8cfa241b49781278247d07dd88ee8`.** The malformed trailing-input defect is fixed and the unchanged keyboard reproducer now passes. Author and hosted full-gate readiness remain separate requirements before merge; no immediate merge is authorized by this report. A later commit voids this approval.

The prior failing reviews below are historical receipts. The corrected-head section at the end contains the current scoped review and commands.

# Original independent review: 785ca6e

**CHANGES NEEDED — head `785ca6e4010202d9baf55e1771ea4b38e43f7ff4`.** The three power formulas and all shared numerical/refusal vectors pass the independent checks below. A rendered input-validation defect still shows a plausible composite sum while a contribution contains a malformed number. Numerical correctness and merge readiness are separate findings.

Review date: 12 November 2026 UTC. Reviewed in the isolated detached worktree `/workspace/Carpe-Noctum-pr34`; no application edits, commits, pushes, PR comments or merges were made by the reviewing subagent. Root ChatGPT separately reproduced the rendered failure on this same head: exit 1, 33 passed / 8 failed / 41 total (`/workspace/scratch/root-pr34/rendered.log`).

## Pin and governing instructions

- Governing `handoff_docs/WORKFLOW.md` and ChatGPT section of `handoff_docs/PROMPTS.md` were read from `origin/ccr-026a9e4b-35w77r` before the review, followed by AGENTS and the applicable development instructions, status, determination, written calculator critique, vectors and build/setup documentation. WORKFLOW overrides the superseded lane/self-merge wording in older files.
- Author's starting base: `fdf4ea30c8df455fe7695f86193f451676b0538e`.
- Current PR base/integration head at the final metadata read: `7dfddf70112d281c2a43f6dec506147686f8f63f`.
- Reviewed head: `785ca6e4010202d9baf55e1771ea4b38e43f7ff4`, containing that integration head (`git merge-base --is-ancestor origin/build3 HEAD`, exit 0). The PR diff against the current base has 24 files.
- Review initially pinned `a9cb48c6e4e1a1514ac013ddcca3f99afdf3b986`, then advanced before application tests to `96f46b2b0263000c9c22d7b956492f18e6f6dbf6`, and finally to `785ca6e4010202d9baf55e1771ea4b38e43f7ff4`. The final head's additional commit merges integration documentation; `git diff --quiet 96f46b2..785ca6e -- night-sweep outputs dist qa` exited 0. All final receipts below were nevertheless executed again on **785ca6e**, including source/standalone/PWA math, author suite and rendered keyboard tests. Prior results under `/workspace/scratch/pr34-96f46b2/` are historical.
- GitHub `get_pr_info` was read again after the final tests: same head/base, open draft, unmerged. Its body still names a9cb48c and says the author's full gate is running. This review makes no author-gate or hosted-green claim and supplies no merge approval.

## Blocking finding

**Medium — `night-sweep/field-calcs.js:229` and `:230`: a malformed trailing contribution is silently discarded by the UI.** `update('power')` maps number inputs to `.value`, then removes trailing empty strings. Chromium exposes a partially typed number such as `-` or `1e` as `value === ''` with `validity.badInput === true`; the code never inspects that validity state before discarding the row. `FieldCalc.powerSum` therefore receives only the preceding valid contributions and returns a plausible current-looking total.

Reproduction on the committed PWA in real headless Chromium, dark theme, independently repeated at **320, 375, 390 and 430 px**:

1. Open Test → Calculators → Power sum.
2. Enter `40` and `37` in the first two level boxes. The result is `41.7643 dBmV`.
3. Tap **Add another level**, focus the third box and type `-` using the keyboard.
4. The box visibly contains `-`; its DOM state is `{value:"", badInput:true}`. The result remains **Total 41.7643 dBmV**, without a refusal or incomplete-input reason.
5. Clear that box and type `1e`: the same incorrect retention occurs. Completing it as `34` restores the valid `42.4363 dBmV` total.

Required result: an unavailable/refused total with a meaningful incomplete-number reason until the invalid entry is completed or deliberately cleared. An untouched optional trailing box may be a UI choice, but a bad numeric entry must not be treated as that blank box. This violates the written check's malformed-input rule, the registered statement that an invalid row is not dropped, and the review checklist requirement that errors say why.

Evidence: `/workspace/scratch/pr34/rendered-results.json`, `rendered-validator.log`, and `power-sum-320-malformed.png`. Reproduce with `python3 /workspace/scratch/pr34/rendered_power_check.py /workspace/Carpe-Noctum-pr34` (exit **1**, **33 passed / 8 failed / 41 total**). These are eight failing assertions for one defect, two malformed strings at each of four widths. The author's new suite passes because its UI test covers an **untouched empty** third row and programmatic valid values; it never creates Chromium's `badInput` state with real keyboard entry.

## Independent derivation and numerical method

The oracle was written independently of the author's regression/reference script. It uses only each shared case's input strings to derive its own Decimal reference, and writes those references before invoking the application. The author's new suite was inspected only after the first independent oracle run. Shared `expected_6sf` values are compared only after independent computation; their stored `decimal_reference` and `stable_formula_6sf` values are not used as the oracle.

By definition, `L = 10 log10(P/P0)`. For a common fixed resistive impedance, `P = Vrms²/R`; consequently `20 log10(Vrms/1mV)` represents the same power ratio to `P0 = (1mV)²/R`. Inputs in dBmV must therefore be **power-added with division by 10**, not coherently voltage-added. For uncorrelated signals the time-averaged cross terms vanish. This requires distinct contributions at the same observation plane, impedance and reference, with compatible bandwidths.

- Add: `Lsum = 10 log10(sum(10^(Li/10)))`.
- N equal carriers: `Lsum = Lcarrier + 10 log10(N)`; `N=1` is the identity.
- Signal-plus-noise minus noise: `Lsignal = 10 log10(10^(Ltotal/10) - 10^(Lnoise/10))`, requiring total strictly above noise. `SNR = Lsignal - Lnoise`; it can be negative.

The external oracle uses **Python Decimal precision 180**, direct exponentiation, summation/subtraction and logarithms. This is computationally different from the app's max-shifted `log1p` addition and `expm1` subtraction. Near-total/noise cancellation requires stable app arithmetic but remains physically sensitive to reading uncertainty; no invented minimum gap is used.

For each unrounded output, the numerical bound is `Q + max(F, abs(Rbinary)*64*2^-52)`, where `Q` is the independently recomputed difference between the exact decimal-input reference and the same Decimal formula evaluated at the exact parsed binary64 inputs. `F=1e-13 dB`, except nonzero outputs smaller than `1e-12`, which use `F=abs(Rbinary)*1e-14` so zero cannot pass a tiny-addition case. This bound describes numerical error only. It is neither RF accuracy nor a company tolerance. Six-significant-figure numerical values are checked independently of that bound, including PX09's positive tiny result. The Decimal log normalizes a value such as PX01 to `reference6sf=40`; this does not itself prove trailing-zero presentation. A separate reviewer-owned built-app DOM run exercised **all 16 shared numeric cases** and compared the exact text of every result against the independently validated six-figure strings, including `40.0000`, `-40.0000`, `6.02060` and `4.34294E-20`; all passed.

PX06's exact decimal gap `10.000001 - 10` becomes a slightly different binary64 gap. Observed signal/SNR absolute error is approximately **3.25025e-9 dB**, within the independently calculated quantization-inclusive bounds (approximately **3.25106e-9** and **3.25121e-9 dB**). Its six-figure signal `-56.3778` and SNR `-66.3778` match. Ordinary cases are much closer; the largest ordinary stress level error here is approximately `5.63e-14 dB`. PX09 retains `4.34294E-20 dBmV`, with error approximately `1.23e-35 dB` and bound `6.17e-34 dB`; it is not rounded to zero before the logarithm.

### Shared numeric results, independently obtained

| Case | Reference at six significant figures (dBmV; SNR in dB) |
| --- | --- |
| P1 | Total 42.4363 |
| P2 | Total 43.0103 |
| P3 | Total 49.0309 |
| P4 | Total -19.5861 |
| P5 | Signal 9.54243; SNR 9.54243 |
| P6 | Signal 43.1317; SNR -5.86825 |
| PX01 | Total 40.0000 (N=1 identity) |
| PX02 | Total -196.990 |
| PX03 | Total 2003.01 |
| PX04 | Total -1996.99 |
| PX05 | Total 59.5459 (maximum safe count) |
| PX06 | Signal -56.3778; SNR -66.3778 |
| PX07 | Signal -20.4576; SNR 9.54243 |
| PX08 | Total 6.02060 (four zero-dBmV inputs) |
| PX09 | Total 4.34294E-20 |
| PX10 | Total -40.0000 |

All **P1–P6, PX01–PX10 and PR01–PR24** were run against the actual production `FieldCalc.powerSum` extracted separately from authored source, the committed standalone and the committed PWA. Each extraction evaluates the real function text in a Node VM; it does not duplicate the production formula in a substitute implementation.

No power-sum dBmV input envelope is imposed or registered by this PR. Therefore the conditional ±2000 stress vectors PX03/PX04 calculate successfully. The older converter's ±200 bound is not silently applied to this new operation. PR24 explicitly supplies an input envelope of [-200,200] and refuses 201; own cases also accept its exact endpoints and refuse inputs just outside. A resulting composite may exceed the *input* envelope. The count bound is independently checked at 9,007,199,254,740,991; 9,007,199,254,740,992 and 9,007,199,254,740,993 refuse before number-rounding can disguise them.

The reviewer added twelve numerical cases: two zero levels; N=1 at -2000; mixed negative levels; near-noise at zero and at 10; a -300 dBmV tiny add in both input orders; maximum count at zero level; both declared-envelope endpoints; and ±3000 stress. Three additional refusals cover the next unsafe count spelling and either side of the declared envelope. Thus there are **28 numeric cases and 27 refusal cases per artifact**.

### Refusal semantics

All 24 shared refusals return `{ok:false,error:...}` with their independently written expected reason, identically in source, standalone and PWA. Each reason was reviewed for meaning:

| Cases | Correct reason observed |
| --- | --- |
| PR01, PR18, PR20 | Missing contribution/count/total is unknown, not zero |
| PR02, PR03, PR19 | Incomplete sign, incomplete exponent, malformed decimal text |
| PR04, PR05 | Finite numeric level required |
| PR06, PR23 | General Add requires at least two contributions |
| PR07 | Equal total/noise resolves no positive residual |
| PR08 | Total below noise implies negative residual power |
| PR09–PR11 | Positive integer carrier count required |
| PR12 | Count exceeds safe-integer representation |
| PR13 | Common unit reference and impedance conversion required |
| PR14 | Coherent addition requires missing phase/correlation information |
| PR15 | Overlapping measurements double-count contributions |
| PR16 | Compatible total/noise bandwidth and averaging required |
| PR17 | Impedances/planes must be reconciled |
| PR21 | Common observation plane must be declared |
| PR22 | Representative noise, compatible RMS/power averaging and unchanged settings required |
| PR24 | Outside the explicitly supplied software envelope; not an equipment rating |

These pure-function refusal successes do **not** excuse the UI adapter dropping malformed trailing input before the function sees it.

## Checklist scope, source labels, storage and rendering

- The three new registry rows have complete required metadata. `calc.power.sum` is Expert/derived; minimum two inputs and maximum safe count are Unknown/application policies. The power source tag resolves and opens details with NIST/SCTE attribution, revision, units and conditions. The card explicitly says there is no company limit. No company target or acceptance value is added.
- The source and rendered card retain dBmV input/output and dB SNR, common impedance/plane/bandwidth, uncorrelated-only operation, negative-level validity, N=1 identity, near-noise uncertainty, and the count bound's software-only meaning. Coherent addition is absent. No CTB/CSO, MER prediction, per-channel headroom or other deferred feature is introduced.
- The new card/formulas do not consume plant settings. All new registry rows have `scope:'all'`; the card explicitly says it does not use 42/54 or 204/258. No change to the separate plant workflows or the existing 31/43/38 references is present in the diff. No new selections for retired equipment are introduced.
- No storage, schema, package-ID, screen-ID or application-version change is in scope. No new store/key or writes were found in the production diff. An independent built-app DOM check exercised all three power operations and found **byte-identical working state, localStorage and threshold registry before/after**. This does not claim a full legacy-job/backup round-trip test; with no changed storage, WORKFLOW permits the author-added suites plus source/checklist review instead of another full reviewer gate. `dist/release.json` changes its content hash/worker while retaining `appVersion: "2.0 Alpha build 3"`.
- Training adds synthetic power-sum examples to the existing Test → Calculators step; guide wording and examples match the operation and source label. The new feature is within the existing calculator screen. Existing guides/main README updates are scoped to this addition; no guide prose is claimed to replace source opening.
- Targeted rendered Chromium tests at 320/375/390/430 px found no page errors or horizontal overflow; new numeric fields, operation select and add-level action are at least 44 px high. The existing Expert source-tag pattern is smaller and is excluded from the 44 px form-action assertion (the repository's separate source-tag policy uses 24 px). Screenshots were personally inspected. All three operation results and equal-total/noise explanation render; the malformed trailing row is the one blocking failure.
- Primary-source retrieval scope in **this subreview**: the ECMA-262 numbers page was successfully opened with Python urllib, HTTP 200, and its §21.1.2.6 value/meaning `2^53-1 = 9007199254740991` confirmed. The NIST chapter-5 page direct request returned HTTP 403; Firecrawl requests for NIST/ECMA returned insufficient credits and were not retried. SCTE primary PDFs were not reopened by this subreview. Root separately reopened [NIST SP 811 chapter 5 footnote (e)](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si) and [TC39 Number.MAX_SAFE_INTEGER](https://tc39.es/ecma262/#sec-number.max_safe_integer) through Parallel during this review: NIST gives `lg(X/X0)=m/10` for power-like quantities; TC39 gives `9007199254740991 = 2^53-1` and explains safe-integer representation. Those root reads corroborate the definition/software bound and are distinct from the subreview's own retrieval. No latest-standard freshness claim is made. Math was independently derived and checked locally; the existing written critique records the earlier SCTE references. The subreview used Decimal as its independent oracle. Root separately evaluated representative power-sum/subtraction expressions with the available Wolfram Language tool; this corroborates those examples and does not certify the app. No new equipment/specification claim is made here.

## Commands and actual receipts on reviewed head

Commands ran from `/workspace/Carpe-Noctum-pr34` unless an absolute scratch path is given. Test counts below are **this reviewer's runs**, not copied author/CI results.

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci --prefix qa/runtime --no-audit --no-fund` | 0 | Locked local QA dependencies, 40 packages installed; no tracked delta |
| `python3 /workspace/scratch/pr34/independent_power_reference.py /workspace/Carpe-Noctum-pr34` | 0 | **510 checks**, source + standalone + PWA; 28 numeric / 27 refusal cases each; 0 failures |
| `node qa/build3-power-sum.test.cjs` | 0 | **49 checks passed**, independently executed on the reviewed head |
| `node qa/build3-field-calcs.test.cjs` | 0 | **10 checks passed / 123 reference comparisons** |
| `node /workspace/scratch/pr34/scope_check.cjs /workspace/Carpe-Noctum-pr34` | 0 | **26 checks passed**, including all 16 shared numeric cases' exact six-figure UI text, registry/context/source dialog and unchanged state/storage |
| `python3 /workspace/scratch/pr34/rendered_power_check.py /workspace/Carpe-Noctum-pr34` | **1** | **33 passed / 8 failed / 41 total**, one malformed-input defect across four widths |
| `git diff --check 7dfddf70112d281c2a43f6dec506147686f8f63f...HEAD` | 0 | No whitespace errors |
| `git status --porcelain` | 0 | Empty after the checks |
| `git merge-base --is-ancestor origin/build3 HEAD` | 0 | Reviewed head contains fetched integration base |
| `git diff --quiet 96f46b2..HEAD -- night-sweep outputs dist qa` | 0 | Final-head merge did not change application/artifacts/tests; final receipts still rerun |

Reproducible reviewer-owned scripts and detailed JSON/logs are under `/workspace/scratch/pr34/`: `independent_power_reference.py`, `run_real_functions.cjs`, `scope_check.cjs`, `rendered_power_check.py`, `decimal-reference.json`, `independent-results.json`, `real-function-results.json`, `rendered-results.json`, `independent-validator.log`, `author-suite.log`, `field-calcs-suite.log`, `scope-check.log`, and `rendered-validator.log`. The oracle records exact reference strings, six-figure values, unrounded outputs, absolute errors and per-output bounds.

Committed artifact hashes personally read on 785ca6e (no rebuild performed):

- `outputs/Night_Sweep.html`: `2bb8706bc23d0574ca48d74c8b59b595c2de54fb8dedf6a4ba44f62e48af904e`
- `dist/index.html`: `9927012f931ab831bbb601c610b30afa7a2a7fb3cb802a9d86513c0ba688f6b6`

Not run by this reviewer: the full `qa/run-pwa.py` gate, full generic layout/smoke suites, a generated rebuild, complete backup/old-job round-trips, Android/APK build/signing, emulator, physical phone, Safari/WebView or field/meter tests. No physical-device test was run. Author's full gate and hosted `QA gate` on the exact eventual head remain separate requirements; a new commit voids any prior approval and requires an updated review.

**CHANGES NEEDED — `785ca6e4010202d9baf55e1771ea4b38e43f7ff4`.** Fix the UI malformed-input path, add a real-keyboard regression and rebuild both artifacts; then rerun the required gates on the final head. No merge authorization is supplied by the numerical pass.

## Root verification and durable reproducer

Root independently reran the reviewer-owned Decimal oracle (510 checks, exit 0), the author suite (49 checks, exit 0), and the actual keyboard reproducer (33 passed / 8 failed / 41 total, exit 1) on the same pinned 785ca6e head, verifying the worktree head before and after. Root logs are under `/workspace/scratch/root-pr34/`.

The four reviewer scripts are committed beside this report in `chatgpt-pr34-checks/`. Run them against a clean checkout of the reviewed head; they require the existing QA dependencies and Chromium. Their generated results default to temporary directories or an optional second path argument, keeping the source worktree clean. For example:

```sh
python3 handoff_docs/reviews/chatgpt-pr34-checks/independent_power_reference.py /path/to/pinned-checkout /tmp/pr34-math
node handoff_docs/reviews/chatgpt-pr34-checks/scope_check.cjs /path/to/pinned-checkout
python3 handoff_docs/reviews/chatgpt-pr34-checks/rendered_power_check.py /path/to/pinned-checkout /tmp/pr34-browser
```

The browser command exits 1 on the reviewed defective head. This report commit is documentation/review evidence, not a change to Grok’s branch or approval of that implementation.


## Re-review: 35583ff, 12 November 2026 UTC

**CHANGES NEEDED — `35583ff1104f080f9505f78105c5200a4b674ec8`.** The original 785ca6e finding remains reproducible. This section supplements the original review and preserves its failing result as history; it does not replace that record with an approval.

Review pin: detached `/workspace/Carpe-Noctum-pr34` at the full head above, fetched and independently checked through GitHub PR metadata. Current PR base remains `7dfddf70112d281c2a43f6dec506147686f8f63f`; `git merge-base --is-ancestor origin/build3 HEAD` exited 0. No application/source edits, commits, comments, pushes or merges were made by the reviewer.

Delta from 785ca6e: `powerBody(op)` now renders only the selected operation's fields, with corresponding standalone/PWA rebuilds, content hash/worker changes and author-status updates. This addresses the separate hidden-fields layout problem. The numerical function, shared vectors and author's 49-check suite are unchanged. The active-operation rewrite does not address malformed trailing input. No additional scope, storage, version, plant or source-label changes were found in this delta.

**Medium — `night-sweep/field-calcs.js:235` and `:236`: malformed trailing level is still dropped.** Enter `40`, `37`, tap Add another level and type `-` or `1e` in the third row with an actual keyboard. Chromium reports `{value:"",badInput:true}`, yet the card still shows **Total 41.7643 dBmV**. Mapping only `.value` and trimming empty trailing strings still erases the malformed contribution before the validated numerical function receives it. The expected refusal/unavailable result and meaningful incomplete-input reason remain absent. This was repeated on the committed PWA at **320, 375, 390 and 430 px**, dark theme; completing the third value as `34` computes the valid total again.

All following commands were actually rerun on **35583ff**, using the same independent Decimal oracle and original real-keyboard reproducer. The oracle retains its quantization-inclusive numerical bound explained above; the scope suite separately verifies every shared numeric case's exact six-significant-figure UI text, including trailing zeroes. Prior 785ca6e scratch receipts were preserved in `/workspace/scratch/pr34-785ca6e/` before updating current logs.

| Command | Exit | Actual result |
| --- | --- | --- |
| `python3 /workspace/scratch/pr34/independent_power_reference.py /workspace/Carpe-Noctum-pr34` | 0 | **510 checks**, three artifacts, 28 numeric and 27 refusal cases per artifact, 0 failures |
| `node /workspace/scratch/pr34/scope_check.cjs /workspace/Carpe-Noctum-pr34` | 0 | **26 checks passed**, including all 16 shared numeric cases' exact UI text |
| `node qa/build3-power-sum.test.cjs` | 0 | **49 checks passed**; author's suite independently run, still lacks a real-keyboard badInput regression |
| `python3 /workspace/scratch/pr34/rendered_power_check.py /workspace/Carpe-Noctum-pr34` | **1** | **33 passed / 8 failed / 41 total**; two malformed strings at each of four widths reproduce the same defect |
| `git diff --check 7dfddf7...HEAD` | 0 | No whitespace errors |
| `git status --porcelain` | 0 | Empty after tests |
| `git merge-base --is-ancestor origin/build3 HEAD` | 0 | Contains fetched current integration base |

No page errors or horizontal overflow occurred in the targeted rendered checks; numeric/select/add controls fit the four phone widths. The three operations, N=1, negative SNR and equal-total/noise refusal still render correctly. The original 785ca6e field-calculator-suite result is historical and is not claimed as a new run here. No new source retrieval was necessary for this UI-only delta; the original reference derivation and separately attributed root source reads remain the basis of the numerical review.

Current-head evidence is under `/workspace/scratch/pr34/`: `independent-validator.log`, `independent-results.json`, `scope-check.log`, `author-suite.log`, `rendered-validator.log`, `rendered-results.json` and the malformed/valid screenshots. The scripts are unchanged from the previous validated reviewer versions.

Committed hashes personally read on 35583ff:

- Standalone: `82844863aba9c40a82b606913bc10a1be8f238224cbb66978a2d1ad50c093b86`.
- PWA index: `94256b224e01ff552f5d9686d237d9d571c523d67df428ccb5cee5986bcf255a`.

**Readiness is independently blocked as well.** GitHub PR metadata reports #34 open, draft and unmerged; its body still names a9cb48c and says the local full gate is running. Current author status says this head's full gate is unfinished and cites a layout pass on an earlier correction. Those are author statements, not new reviewer gate runs. GitHub's commit-workflow API returned current-head `QA gate` run [43198396778](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43198396778), completed with conclusion **cancelled**, not green. The combined-status endpoint returned no statuses; that empty legacy-status response does not establish check success. The workflow wrapper returns only the first page of PR-triggered runs, so this is the visible current-head run rather than a claim about every possible trigger.

The mathematical outputs remain technically verified within the original scope, but the UI finding prevents technical approval. Exact-current-head author full gate, hosted-green QA, readiness metadata and cross-builder approval are still required before merge. No full reviewer gate/rebuild, emulator, APK, phone, Safari/WebView, meter or field test was run in this re-review; no physical-device test was run. Any later head requires another review.

**CHANGES NEEDED — `35583ff1104f080f9505f78105c5200a4b674ec8`.**

## Corrected-head re-review: df857d0, 12 November 2026 UTC

**Technical review: APPROVE — `df857d06b3f8cfa241b49781278247d07dd88ee8`. Merge readiness remains pending.** Final metadata during the previous re-review revealed this additional author commit; the reviewer fetched it, detached the same isolated worktree at its full SHA and repeated the checks below. The preceding 35583ff failure is retained as historical evidence.

The correction at `night-sweep/field-calcs.js:233` checks **all currently active operation inputs for `validity.badInput` before reading or trimming values**, and line 234 replaces the result with “Finish the number. A half-typed value is not a blank.” This addresses the observed cause. In the original independent keyboard reproducer, both `-` and `1e` now produce the refusal instead of the two-level total at every tested width. Complete values still compute, and an intentionally cleared optional trailing box returns to the valid two-level result in the author's new regression. The active-operation rendering prevents inactive fields from participating in this check.

The additional diff contains the two-line production guard, regenerated standalone/PWA/worker metadata, `qa/build3-power-sum-real.test.py`, its appended gate-runner entry and the author's status row. The new suite creates actual keyboard `badInput` states, checks deliberate clearing and completing the third level, and runs at 320/375/390/430 px with touch/mobile viewport emulation. The gate entry's count expression matches its output. No numerical reference, formula, bound, unit, source registration, plant setting, store, version, identity or unrelated feature is changed by this correction. No additional issue was found in that diff.

Fresh receipts on **df857d0** (all commands from the detached worktree unless absolute):

| Command | Exit | Actual result |
| --- | --- | --- |
| `python3 /workspace/scratch/pr34/independent_power_reference.py /workspace/Carpe-Noctum-pr34` | 0 | **510 checks**, source + standalone + PWA, 28 numeric / 27 refusal cases per artifact, 0 failures |
| `node /workspace/scratch/pr34/scope_check.cjs /workspace/Carpe-Noctum-pr34` | 0 | **26 checks passed**, including exact six-figure UI strings and trailing zeroes for all 16 shared numeric cases |
| `node qa/build3-power-sum.test.cjs` | 0 | **49 checks passed** |
| `python3 /workspace/scratch/pr34/rendered_power_check.py /workspace/Carpe-Noctum-pr34` | 0 | **41 passed / 0 failed / 41 total**, including the original eight formerly failing keyboard assertions |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-power-sum-real.test.py` | 0 | **20 checks passed**, author's new rendered regression independently run |
| `node qa/build3-field-calcs.test.cjs` | 0 | **10 checks passed / 123 reference comparisons** |
| `git diff --check 7dfddf7...HEAD` | 0 | No whitespace errors |
| `git status --porcelain` | 0 | Empty after checks |
| `git merge-base --is-ancestor origin/build3 HEAD` | 0 | Contains fetched base `7dfddf70112d281c2a43f6dec506147686f8f63f` |

The unchanged Decimal derivation and quantization-inclusive error bound from the original review apply. Targeted PWA rendering now passes across the four widths without page errors or horizontal overflow. The reviewer ran the new author keyboard suite against the committed standalone as well, so both artifact paths exercise the correction. No full reviewer gate or rebuild was required/run for this calculator-only storage-neutral correction.

Current df857d0 logs, detailed JSON and screenshots are under `/workspace/scratch/pr34/`, including `author-real-suite.log`; 35583ff receipts were preserved under `/workspace/scratch/pr34-35583ff/`. The original independent scripts were used unchanged, providing a red result on 35583ff and a green result on df857d0 without modifying their assertions.

Committed hashes personally read on df857d0:

- Standalone: `05688de082e375b3cae2ec51bc74618a794aeb4c26ae0ceab3d2747f65300128`.
- PWA index: `3fff2f86854737e0001e0ee1ac16584ce06da654d648d3977747d713abdf92a8`.

**Readiness at this review's metadata/CI read:** #34 remains open, draft and unmerged, and its body still names a9cb48c with the author's local full gate running. Author's df857d0 status row likewise says its full gate is unfinished. GitHub reports current-head `QA gate` [43198710591](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43198710591) **in progress**, with no conclusion. These external states are not reviewer test results and do not authorize a merge. The author must publish exact-head full-gate receipts and update readiness; hosted QA must finish green on this exact SHA, and the reviewer must check the latest base/head before merging. A new commit voids this technical approval.

No application edits, commits, pushes, comments or merges were made by this subreviewer. No APK/build signing, emulator, physical phone, Safari/WebView, meter or field test was run. **Technical APPROVE — `df857d06b3f8cfa241b49781278247d07dd88ee8`; merge blocked on the separate readiness requirements above.**

Root independently repeated the Decimal oracle, original keyboard reproducer and author suite on `df857d06b3f8cfa241b49781278247d07dd88ee8`, confirming the same head before and after: 510 checks exit 0; 41 rendered checks exit 0; 49 author checks exit 0. Logs: `/workspace/scratch/root-pr34/independent-df857.log`, `rendered-df857.log`, `author-df857.log`. The prior failed browser run was not counted as passing.
