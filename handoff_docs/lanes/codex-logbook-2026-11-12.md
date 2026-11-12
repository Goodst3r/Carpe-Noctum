# Carpe Noctum — Lane A work logbook

**Prepared for Spencer · November 12, 2026 · Snapshot: 03:41 UTC**

Repository: [Goodst3r/Carpe-Noctum](https://github.com/Goodst3r/Carpe-Noctum) · Working integration branch: `build3`.

This consolidates the recorded Lane A work from November 11 through this snapshot: implementation, review, GitHub integration, verification, optimizations, problems encountered and remaining work. Linked receipts contain the command-level detail. It is a progress record, not a claim of phone or field acceptance.

## 1. Current position

- **Required feature work is merged:** Station view, Night log, Sweep due and imported sweep grading, plus the Station native-input retention correction.
- Current verified integration commit: **`f467e5261295449f94dd232ab3995c8a00be25ee`**. Its complete tree matches native publication `2c040da`.
- Latest completed Lane A feature gate: **82 suites / 2,174 checks**, plus **554 layout checks** and **352 smoke checks**. This run belongs to source `2d95e04`; suite time was **683.7 seconds**.
- Lane B independently checked published `2c040da`: **82 / 2,174**, plus **554 / 352** and **69 keyboard-driven browser probes**. No Lane B duration was supplied for that run.
- Hosted CI passed on the published native head: [QA gate run 57](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43144018330).
- The complete run directly on merged `build3` **`f467e52`**, **03:28:33–03:40:29 UTC**, also passed: **82 / 2,174**, **684.8 seconds**, plus **554 / 352**. All **715 tracked files**, semantic state, **40 locked dependencies** and **12 sealed artifacts** verified unchanged/clean. This is a separate run from the earlier native-source gate.
- **D3–D5 remain open:** final same-head verification by both lanes, documentation reconciliation/regeneration and Lane B's final handoff. A5–A7 stretch implementation has not started.

The app remains offline. Version is **2.0 Alpha build 3 / Android source code 27**. No APK was built or signed, and nothing was deployed.

## 2. Setup, access and working rules

### Repository and baseline

I recovered the work from your supplied handoff, cloned/read the repository, used `build3` as the integration base and kept implementation in isolated branches/worktrees. I read the plan, agent instructions, development instructions, project status, developer build guide, build list, handoff and Station sources.

`CLAUDE.md`, `handoff_docs/KNOWN_GAPS.md` and `handoff_docs/TOOLS_AND_SETUP.md` were absent from the first checkout. I subsequently read Lane B's versions from PR5 and the merged copies. I did not retrieve the old ChatGPT conversation itself by its ID or count its reported tests as my new execution.

The first new baseline completed **61 suites / 1,109 checks**, with **141 layout / 328 smoke** checks. The original setup included a successful locked dependency installation. Later shared checkouts reused the verified locked runtime instead of reinstalling it while workers were active.

GitHub reading and pushing were established. Pushes used the authenticated helper per command; no credential or token was published. Feature work used ordinary commits/merges, with no force-push. I did not modify `main` or the frozen `ccr-7abea525-rljsni` branch.

### Test execution and evidence

I serialized the broad local gates, allowed a 3,600-second per-suite limit where needed and used background execution without a short outer timeout. Focused checks ran in isolated read-only review worktrees. Source and built-page modes were kept distinct.

For major checkpoints I verified raw test counts, source identity, generated output, clean status and the locked dependencies. Recent gates also preserve all five full command records, including integer nanosecond timestamps, and sealed artifact hashes. Git index stat-cache byte changes are described as diagnostic; I did not equate them with a source change when semantic staged entries and the tree stayed unchanged.

### Requested tools and files

- I inspected your `file.py`. It was a 53-byte placeholder with an empty example function, so it supplied no functional implementation to integrate.
- I configured the requested Chrome DevTools MCP setup. The exact auto-connect server initialized, but the shared Chrome debugging endpoint was absent. I added a working isolated local Chromium configuration and actually used the MCP server through its standard JSON-RPC interface.
- The working server exposed 33 tools. Checks used real native keyboard input, snapshots, viewport emulation, console inspection, screenshots and traces. Usage statistics/CrUX were disabled. These are desktop Chromium checks, not a physical phone claim.
- Independent arithmetic included Decimal/reference cases and Wolfram results where available. A failed WolframContext attempt was not treated as a successful check; the successful WolframAlpha calculation was recorded separately.

## 3. Lane A implementation delivered

| Item | Delivered behavior | GitHub record |
| --- | --- | --- |
| A1 — Station | Before/After worksheets; reused forward solver; return reference/injection/receiver values kept separate; independent balance and sweep facts; stable bindings, legacy protection, backup/restore, practice and guides | [PR8](https://github.com/Goodst3r/Carpe-Noctum/pull/8), merged `21ed711` |
| A2 — Night log | Explicit immutable captures of saved Station data; shift/window notes; five-station handoff practice; TXT/CSV export; optional additive saved-job section and backup handling | [PR17](https://github.com/Goodst3r/Carpe-Noctum/pull/17), merged `f50a744` |
| A3 — Sweep due | Reads saved work dates; interval starts unknown; civil-date anniversary/clamping logic; separate live reminders and historical facts; large-library paging, save feedback, validation and practice | [PR21](https://github.com/Goodst3r/Carpe-Noctum/pull/21), merged `394179c` |
| A4 — Sweep grading | Verified native JSON, gzip and supported single-JSON ZIP import, plus synthetic CSV interchange; untouched originals/SHA; explicit editable profiles, sampled results, immutable history and context freshness | [PR14](https://github.com/Goodst3r/Carpe-Noctum/pull/14), merged `0e67660` |
| Native Station follow-up | Rejects unfinished native number/date drafts before persistence; retains last committed values; linked feedback; deliberate clears, owner/stage/target isolation and untouched invalid-import preservation | [PR23](https://github.com/Goodst3r/Carpe-Noctum/pull/23), merged `f467e52` |

### A1: Station view and review corrections

I added the Station screen to Route, reused the existing solver and independently checked the new return calculations. I kept the 38 dBmV transmitter reference, device-specific inputs, injection and receiver planes distinct. No company tolerance or pilot code was invented.

The review/repair cycle covered physical asset/port/model bindings, stale measurements after replacement, numeric strings hidden by native inputs, independent done/date facts, unknown equipment bands, legacy worksheets and read-only UBT behavior. Binding confirmation retains the original record and creates an explicit bound copy. Documentation and synthetic practice were updated.

### A2: Night log

Captures copy saved Before/After data rather than reading unfinished DOM text or rewriting a previous capture. The work included optional-state validation, import/content checks, duplicate/portable jobs, Example retention, native time-field feedback and handoff exports. Later integrations retained the reviewed remove/undo and provenance limitations as known gaps rather than claiming them closed.

### A3: Sweep-due tracker

The reminder interval belongs to the open job and starts unknown. Balance and sweep remain separate technician facts. Invalid, future, unchecked, historical or missing dates remain neutral with their reason. Calendar cases cover month ends, leap years and range limits. The warning boundary is an unverified app reminder policy, not RF acceptance or an approved company cadence; the older 18-month attribution was not promoted to a verified source.

### A4: Native imports and grading aid

Your clarification changed the required meter input from an assumed CSV to the supplied native JSON structures. I analyzed the owner-supplied exports privately and created invented native-format fixtures for repository testing. Real filenames, identifiers, readings and original-file hashes were excluded from this logbook and public work.

The implementation preserves original bytes, archive/parse guards and identity remapping through portable backups. Four plant/direction profiles keep 42/54 and 204/258 separate. Company criteria start unknown. Sampled peak-to-valley and endpoint/tilt calculations are labeled as a personal grading aid; no interpolation, continuous-band acceptance, automatic work date or automatic done state is invented.

Review fixes included invalid criterion feedback, failed-autosave feedback beside the field, repeated invalid Grade refusal, source-tag labels/touch targets, float-noise display without changing stored numbers, raw/bound Station context and conservative freshness/original verification. All three optional sections—Night log, Sweep due and grading—survive their combined validation, backup and history tests. The reviewed Example policy keeps Night log/grading history and drops the reminder interval.

The last private-owner replay belongs to historical source `9cad649`; it is not represented as a new replay at the latest source. Current automated and browser fixtures are synthetic.

### Native-input correction

Real Chromium can show an empty input while `validity.badInput` is true. The original behavior could save that apparent empty value over a valid recorded reading/date. I fixed the persistence boundary and added real-keyboard tests, including partial date segments that can finish clearing without a final input/change event.

Zero, the latest valid intermediate number and independent work flags survive invalid drafts. Complete intentional clearing still records unknown. Plain focus/blur on hidden invalid imported text does not normalize it. The final integration preserved grading's pure early-boot `boundRecords` API alongside these guards.

Lane B compared its separate PR22 against the same untouched-import cases, confirmed the data-loss difference and closed PR22 unmerged in favor of PR23.

## 4. Performance work completed

| Optimization | Change | Observed result and limits |
| --- | --- | --- |
| Station catalog lookup | Per-call first-wins index instead of repeated scans; no persistent state/math cache | Synthetic 100/200-row catalog reads fell from 48,379/96,279 to 1,133/1,233. On a 200-active desktop workload, median input times fell roughly 36–43%. A nine-row workload had no gain and up to about 0.2 ms overhead. |
| Archive CRC32 | Private lazy 256-entry lookup table, retaining polynomial, seed, final unsigned result and all archive/SHA guards | Synthetic 2 MiB stored JSON ZIP: 78.2→15.3 ms; deflated: 84.3→21.4 ms in the measured desktop workload. Independent CRC/reference and malformed-member checks passed. No ordinary-small-file or phone speedup is claimed. |
| Grading history context | Lazy synchronous render-local context, with shallow primitive copies per row; public freshness and async verification stay separate | For 100 histories, steady context builds 100→1; first-owner path 101→2. Scratch Node string-render medians 215.296→5.753 ms and 870.146→14.493 ms on two workloads. This excludes DOM/layout/phone; one-history timing showed no gain. |

I retained independent old/new behavior checks, original raw data, parser guards, owner changes and async edit guards. I deferred eager preview/chart work because changing its open/print/lifecycle semantics would require a separate scoped implementation.

## 5. Major completed Lane A gate receipts

Counts belong to the named execution/source. Layout and smoke are separate campaigns, not added to the suite-check total. This table lists major checkpoints; linked immutable receipts retain earlier intermediate executions.

| Checkpoint | Tested source | Suites / checks | Suite seconds | Layout / smoke | Scope |
| --- | --- | --- | --- | --- | --- |
| First fresh baseline | `53b839e` | 61 / 1,109 | Recorded in baseline receipt | 141 / 328 | Initial checkout |
| A1 final catalog optimization | `6030607` | 66 / 1,276 | 361.7 | 141 / 331 | Before A1 peer merge |
| Merged A1 baseline | `21ed711` | 66 / 1,276 | 405.0 | 141 / 331 | Actual merged baseline |
| A2 final integration | `2690a46` | 72 / 1,534 | 524.9 | 554 / 346 | Published `3c3a25f`, merged `f50a744` |
| A3 final integration | `072eb0e` | 74 / 1,760 | 630.0 | 554 / 349 | Published `0e930d1`, merged `394179c` |
| A4 earlier integrated checkpoint | `fe24588` | 74 / 1,701 | 526.6 | 554 / 346 | Historical base |
| A4 history-render optimization | `41c4db2` | 77 / 1,843 | 610.6 | 554 / 349 | Historical Night log base |
| A4 final required-core integration | `61c4d4a` | 80 / 2,072 | 679.0 | 554 / 352 | Published `d95f08b`, merged `0e67660` |
| Native recovery checkpoint | `0da7e6a` | 72 / 1,505 | 502.0 | 554 / 343 | Historical pre-combined base |
| Native final integration | `2d95e04` | 82 / 2,174 | 683.7 | 554 / 352 | Published `2c040da`, merged `f467e52` |
| Actual merged core | `f467e52` | 82 / 2,174 | 684.8 | 554 / 352 | Completed 03:40:29 UTC; Lane A merged-head result, not final D3–D5 closure |

For the recent complete gates, the exact command sequence was:

```sh
python3 night-sweep/build.py
python3 build-pwa.py
GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py
GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py
GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py
```

The earliest A1 execution has its own historical mode/environment in its receipt. Generic Checklist/registry source mode requires `NIGHTSWEEP_BUILD2_SOURCE_TEST=1`; several app harnesses use default assembled source versus `NIGHTSWEEP_RELEASE_TEST=1` frozen. I corrected an older mode-label error rather than relabeling built-page runs as source runs.

## 6. Lane B work I independently reviewed and integrated

Lane B authored these modules. My work was review, reproduction, exact-head testing, requests for corrections and, where eligible, reviewer-side merge. I did not claim their implementations as mine or merge my own feature PRs.

| PR | Area | Lane A review/integration work | Result |
| --- | --- | --- | --- |
| [3](https://github.com/Goodst3r/Carpe-Noctum/pull/3) | Module registry | Checked registration order, generated reproducibility and full/rendered gate | Merged `81ccfb4` |
| [5](https://github.com/Goodst3r/Carpe-Noctum/pull/5) | Repository handoff/setup docs | Read missing setup docs, checked guide links and gate; resolved integration status conflict | Merged `faafba5` |
| [4](https://github.com/Goodst3r/Carpe-Noctum/pull/4) | Reliable test gate | Reproduced Source ZIP/no-.git failure, requested regression fix, reviewed timeout/evidence behavior | Merged `c97a090`; corrected-head gate 62/1,116 +141/328 |
| [6](https://github.com/Goodst3r/Carpe-Noctum/pull/6) | Training/name guards | Reproduced lowercase invented-control false pass, requested correction and checked guides | Merged `79b0735`; corrected-head gate 62/1,115 +141/328 |
| [7](https://github.com/Goodst3r/Carpe-Noctum/pull/7) | DOCSIS health | Reviewed units, prerequisites, native-input refusal, source qualifications and independent cases | Merged `bc69bb4`; own gate 67/1,296 +255/334 |
| [9](https://github.com/Goodst3r/Carpe-Noctum/pull/9) | Leakage | Reviewed calculations, input/unknown conditions and narrowly cited regulatory scope | Merged `5588a49`; own gate 68/1,328 +374/337 |
| [11](https://github.com/Goodst3r/Carpe-Noctum/pull/11) | CI | Kept build/tests/dirty-tree checks strict while optional artifact delivery is best effort | Merged `14bfc06`; own gate 68/1,328 +374/337 |
| [10](https://github.com/Goodst3r/Carpe-Noctum/pull/10) | Safety/checklist | Reproduced native time/storage-quota feedback problems; checked fixes and unknown defaults | Merged `ccf2f5e`; own gate 70/1,397 +464/340 |
| [12](https://github.com/Goodst3r/Carpe-Noctum/pull/12) | Outage response | Reviewed shared checklist/native-time behavior, save feedback and limited procedure scope | Merged `3cfb9c2`; own gate 70/1,403 +554/343 |

Safety, outage and leakage still require the appropriate supervisor/local-procedure review before coworker use. Review does not create company approval or establish field compliance.

## 7. Later Lane B reference PR reviews — not merged

| PR | Review work and accepted scope | Remaining disposition |
| --- | --- | --- |
| [13](https://github.com/Goodst3r/Carpe-Noctum/pull/13) Impairments | Reviewed native inputs, CPD/long-cable qualification, header imports, labels and source/math. Fresh source/frozen 14 checks/1,940 comparisons, paired/triple integration and 38 thin groups at `53cdf90`; changed grading QA 56/56 at `9e6721c` | Rendered main guide still says 29/47 versus source 30/48; current prose/PR body need reconciliation. No broad merge approval. |
| [15](https://github.com/Goodst3r/Carpe-Noctum/pull/15) Fiber | Reviewed numeric/blank semantics, independent references, native refusal, all 13 named inputs and adjacent ARIA feedback. At `8817b61`: 9/132 source and frozen, 30 browser checks, six audit groups and 129 MCP checks | Own feedback Minor closed; later guide/base/full integration remains. No physical-device claim. |
| [16](https://github.com/Goodst3r/Carpe-Noctum/pull/16) High split | Reviewed PTP/initiation sequencing, OEM/source qualifications and separation of a reading aid from an approved procedure | Own scoped fixes accepted; exact Vecima/OEM procedure/source-access gaps and later integration/full gate remain. |
| [18](https://github.com/Goodst3r/Carpe-Noctum/pull/18) Why cards | Reviewed source-description boundaries and 44 px controls | Scoped fixes accepted; no assertion that unread standards bodies were newly checked. Later integration remains. |
| [19](https://github.com/Goodst3r/Carpe-Noctum/pull/19) Proof of performance | Reviewed primary eCFR clauses, numeric/runtime refusal cases, mutation checks and rendered layouts; closed runtime findings | Residual source-note wording should say source dialog/registry rather than attributing all clauses to the main card. |
| [20](https://github.com/Goodst3r/Carpe-Noctum/pull/20) Study | Checked OFDM occupied-band/flat-PSD conditions, visible tolerance, independent high-precision cases and all ten numeric generators | Scoped fixes accepted; still stacked on POP and needs final-base disposition/full gate. |
| [22](https://github.com/Goodst3r/Carpe-Noctum/pull/22) Duplicate native fix | Reproduced untouched invalid-import data loss on focus/blur | Closed unmerged by Lane B in favor of corrected PR23. |

A read-only six-branch snapshot found the same stale rendered-guide footer propagated through all six reference branches. Their own engines/QA/reference/source-note sets were unchanged from previously reviewed versions. Source totals grow from 30/48 to 35/53 while the rendered footer remained 29/47. Each branch needs its own normal guide regeneration after final-base integration. No stretch merge is authorized before D3–D5.

## 8. Problems, failed runs and corrections retained

- The previous session's short suite-timeout problem was treated as a handoff report, not a new passing baseline. Current broad runs used the larger limit/background execution.
- The first A1 `f45ae53` full attempt passed 60 of 63 suites, with 1,105 counted checks and stale navigation/training fixtures. Review also found real binding/input issues. Those failures were not presented as a green gate; fixes received new evidence.
- An A4 Station-startup gate failed 71 of 72 suites with 1,566 counted checks. The pure early-boot `boundRecords` boundary was repaired, then a new exact-source run passed.
- The A3 `c6` integration attempt failed an inherited Checklist tab expectation: 71/72,1,592 counted checks. A one-line expectation correction and fresh runs were kept separate from the failed run.
- A default-Node second-JSDOM diagnostic produced two boot errors while a jitless diagnostic passed. The VM mechanism was not proven. Registered interop checks use a fresh ordinary Node process, with no production workaround, skipped cases or runtime JIT flag.
- An optimization test correctly failed on the old repeated-context behavior. A later new-test cleanup leak was corrected in that new test's public-control cleanup. These were not reported as production RF failures.
- An earlier native gate lost its environment after partial output. It has no completed total. The recovery run is separately named and counted.
- One older Checklist/registry mode label was wrong: default/release had both used built HTML. An explicit erratum and fresh correctly selected source runs preserve the distinction.
- External browser/checker diagnostics included a Python-to-JavaScript newline error, an API-reader indentation assumption, a viewport-reset assumption and a root newline-versus-NUL manifest comparison. The scripts/receipts identify the corrections; none was silently converted into a product pass.
- Lane B reported a failed first native run with no dependency link, then a successful properly configured rerun. Its duration was not inferred from mine.
- **Evidence-file mistake:** a new PR13 checker overwrote `/tmp/carpe-pr13-394-integration-audit.json`, an older supplemental scratch JSON. Exact recovery was unavailable. The original review Markdown, strict proof and stdout remain intact; the old JSON is explicitly lost and must not be consumed as historical raw evidence. The new result was preserved under its own prefix. No repository/product file or native full-gate artifact was affected. I disclosed the error rather than fabricating original evidence.

## 9. Documentation, GitHub and current handoff work

I maintained source-scoped receipts, review reports, lane status and bounded feature additions to the project status/update log. Before metadata publication I checked that tested product, QA, guide, generated and research bytes were unchanged, and that raw command records remained lossless.

A D4 readiness audit identified obsolete queued/not-started statements, old registry/practice/current-gate claims, obsolete B1/B4 gaps, overly broad source-verification claims, missing tool-finder entries and the missing Night log training-table row. Correct current inventory is **29 screens,47 features,114 registry rows**, practice **22/16/15/8/9/7/10**. Historical Build2 artifacts and test receipts must remain explicitly historical.

After native merge, I published a **one-file lane-status checkpoint `7442451`** on `codex/core-closeout-status`, based on actual `f467e52`. It records the actual merge and both lanes' separate evidence, with D3–D5 pending. Lane B was asked to merge that status branch into B9 so my status file remains authored by Lane A. No extra feature PR was created.

The actual merged-head gate completed successfully at 03:40:29 UTC. I read its full report and independently verified all 715 tracked files, the five fresh raw/source-equal command results, 40 locked package manifests and all 12 sealed artifacts. Reported suite time was 684.8 seconds; the gate command wall time was 685.093 seconds. Lane B can prepare D4 on its own branch. The final-main wrapper is prepared separately; it has not been started against an invented future hash. Documentation/artifact changes still require the resulting final-head verification.

### Main immutable evidence links

- [Current native receipt](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/lanes/codex-station-native-validation.json)
- [Native integration report](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-station-native-grading-integration.md)
- [Independent native review](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-station-native-grading-review.md)
- [Native full-gate report](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-station-native-grading-gate.md)
- [D4 readiness audit](https://github.com/Goodst3r/Carpe-Noctum/blob/2c040da5dff805e2a5cda235a75a56203dbe8da3/handoff_docs/reviews/codex-d4-readiness-audit.md)
- [Actual-merge lane status](https://github.com/Goodst3r/Carpe-Noctum/blob/744245107807ca386029ee149c0ba98def62da70/handoff_docs/lanes/codex-status.md)
- [A2 receipt](https://github.com/Goodst3r/Carpe-Noctum/blob/3c3a25f57654d3597112d8c60d130ae5707dada3/handoff_docs/lanes/codex-a2-validation.json)
- [A3 receipt](https://github.com/Goodst3r/Carpe-Noctum/blob/0e930d13f1954191ac5b0a5498e6e1ad93c74d0d/handoff_docs/lanes/codex-a3-validation.json)
- [A4 receipt](https://github.com/Goodst3r/Carpe-Noctum/blob/d95f08b184b9cc3cc33150e58736ecc03d9d42b8/handoff_docs/lanes/codex-a4-validation.json)

## 10. What remains

1. Preserve the completed Lane A merged-`f467e52` receipt and obtain the separately attributed same-head/final-head result from Lane B. Record any later base advance without relabeling this frozen run.
2. Lane B completes B9/D4: current status/update log, guides/practice coverage, setup instructions and Known Gaps, including the nonblocking duplicate live-status/screen-reader concern.
3. Both lanes run and report their own gates on the same final `build3` head after any documentation/artifact regeneration. Earlier identical-tree tests are not silently relabeled as a new final-head run.
4. Lane B writes `handoff_docs/FINAL_HANDOFF.md` from both statuses, with actual final source/artifact hashes, per-item verification, all untested work, supervisor questions and Spencer's next steps.
5. After D1–D5, continue the queued stretch items: A5 power-supply PM/battery trends/span voltage drop; A6 construction/connector checklist; A7 return/high-split toolkit. Only a preliminary read-only inventory exists; no new implementation is claimed.

### Untested and human decisions

No fresh private-owner replay at the latest source; no physical phone, emulator, Android WebView, Safari, mobile keyboard/locale/provider dialogs, screen reader, hardware/reference-plane/meter or field acceptance. Desktop phone-width/touch emulation and keyboard tests remain separately labeled. No APK/signing/deployment.

Company targets, tolerances, reminder cadence and local operating policy remain unknown until supplied/approved. Supervisor review is still needed for coworker use of applicable safety/outage/leakage guidance. Exact permitted OEM/Vecima/AOI manuals, revisions and access gaps remain bounded in the source notes. No cloud backend, company login or customer identifier was introduced. Roadmap/build-list PRs1 and2 remain owner decisions; `main` remains untouched.

---

**Record basis:** retained Git history, immutable repository receipts/reviews, local execution records and the explicit user handoff. This is a consolidated progress logbook, not an unfiltered terminal transcript. Intermediate records remain source-scoped, including failures and known evidence limitations.
