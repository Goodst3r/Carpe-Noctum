# PR #39 independent math review

Reviewed original head `223867e3d495a1375c4374c4ba4b008c0ef29112` in detached `/workspace/review39`, 2026-11-12. This is a post-merge review: GitHub already showed the PR merged externally during this review. No merge performed here.

**APPROVE** — no blocking findings on the reviewed head. This verdict concerns PR #39 only, not the combined batch or its eventual release.

## Independent derivation

For a matched source/load at 290 K the available noise power is `kTB` W, with exact SI `k = 1.380649e-23 J/K`. Across 75 Ω the loaded RMS voltage squared is `75 kTB`; the squared 1 mV reference is `10^-6 V²`. Thus `Lnoise = 10 log10(75 kTB / 10^-6)` dBmV. No open-circuit factor of four belongs here. An applicable NF raises the referred noise floor by NF dB, so `CNRsingle = I - NF - Lnoise`. N equal independent receiver-referred contributions multiply noise power by N: subtract `10 log10 N`. At a common desired carrier and observation plane, noise/carrier ratios add, giving `CNRcombined = -10 log10(sum(10^(-CNRi/10)))`. These are noise estimates, not MER, CTB/CSO, or an ordered Friis chain.

I derived those expressions outside the application and author's reference generator, then implemented them with Python Decimal precision 90. Only input cases and refusal contracts came from the shared vector JSON; expected numeric strings were not read by my independent calculator. Real authored `FieldCalc.cascade` functions were loaded into Node's VM and compared directly. All 4 worked and 10 edge cases passed, plus all 25 refusal cases with their exact reason and no numeric output: 39 cases, 58 numeric/refusal checks. Each numeric comparison used `max(1e-12 dB, 2e-15 * |reference|)` and separately checked six significant figures. Maximum absolute difference was `1.195214e-14 dB`.

Wolfram Language separately evaluated the exact-rational baseline at 30 digits: noise floor `-57.1627748204722322353212209119`, single CNR `64.1627748204722322353212209119`; combining 40 and 43 dB gives `38.2356513756351467067147179519`. The thermal floor uses loaded voltage, and negative/extreme CNR edge cases remain stable. Positive integer counts, bandwidth, NF, carrier inputs, invalid/incomplete values, correlated ingress, MER, double counting, incompatible planes/bandwidths, source temperature and impedance mismatch refusals were checked through the shared cases.

## Executed checks

Commands below were run independently in the detached worktree. Author suite counts are attributed to executing existing suites, not to writing them.

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci --prefix qa/runtime --no-audit --no-fund` | 0 | 40 packages installed |
| `python3 /tmp/review39-independent.py` | 0 | Own Decimal90 derivation: 39 cases / 58 checks |
| `node qa/build3-cascade.test.cjs` | 0 | Existing new suite: 62 checks, built HTML functions and UI |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-cascade-real.test.py` | 0 | Existing new suite: 24 real keyboard checks at 320/375/390/430 px |
| `node qa/build3-field-calcs.test.cjs` | 0 | Existing calculator regression: 10 checks, 123 reference comparisons |
| `python3 /tmp/review39-ui.py` | 0 | Own Chromium UI: 16 checks at 320/375/390/430 px; page/control bounds, add row, interior blank refusal |
| `git diff --check` | 0 | No whitespace errors |
| `git status --porcelain` (before adding this review) | 0 | Empty |

The two independent scripts were review scratch files outside the repository; their commands were executed, not copied from author evidence. Initial own UI attempt using `file://` failed with browser policy `ERR_BLOCKED_BY_ADMINISTRATOR` (exit 1); switching the same check to a local HTTP server passed. This was an environment transport failure, not a product refusal.

GitHub `gh pr view 39 --json headRefOid,body,files,statusCheckRollup` confirmed the exact head and hosted QA gate SUCCESS, completed 2026-11-12T14:17:13Z: https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43232955539/job/131232765019 . No full gate was run by this reviewer.

## Diff, UI and limits

Reviewed authored changes against `f9a2060ee51899c073f121408be79d15cb05ca35`, plus changed-file inventory and generated counterparts. Thermal CNR is inside existing Tools → Calculators; training and guide inputs match. Fixed 290 K / 75 Ω and equal independent receiver-referred-noise assumptions are visible. New formula and software-policy values are registered in thresholds with Expert/Unknown labels; no new company acceptance limits. The new functions/card do not write job data or storage; no schema/key/package/version change, 42/54 versus 204/258 mixing, or deferred feature was introduced. Existing regression also checked unchanged job/autosave/registry behavior.

Source provenance is recorded in the registry. Fresh direct retrieval of SCTE 293-11:2025 from `https://account.scte.org/documents/8267/SCTE_293-11_2025.pdf` returned HTTP 403; its full body was not reverified. Independent physical derivation and Wolfram arithmetic provide the math evidence; they do not certify manufacturer NF applicability. No physical device, Safari, WebView, emulator, screen reader, meter/field, APK/signing or final combined-head gate was checked. Skill guidance used: Superpowers verification-before-completion. Tools actually used: Git/gh, Node VM/JSDOM, Decimal90, Playwright desktop Chromium, Wolfram evaluator, shell and urllib source retrieval attempt.

**APPROVE — `223867e3d495a1375c4374c4ba4b008c0ef29112`.**
