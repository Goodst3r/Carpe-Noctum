# Station local catalog index — implementation receipt

Starting HEAD: `4aab13616e9c7ba08cc4f14987cff093c6dcf129`.

Frozen implementation commit: **`603060788493df1752da37a396507e430cacde40`**, branch `codex/station-view`, commit message `perf: index station catalog lookups per pass`.

The parent authorized implementation after the read-only audit. The original audit at `/tmp/carpe-station-optimization-audit.md` remains an account of the pre-change source and scratch measurements; this receipt records the subsequent implementation.

## Change and scope

`StationView.targets()` now builds one first-wins device-ID Map per invocation and uses it for its source-active and route-row lookups. The local Map is discarded immediately after that call. Duplicate IDs keep the same first-match behavior as the former `devices.find()`, including inactive/retired first entries. Later catalog object edits, array replacement, imports and owner switches are read fresh on the next call.

Only authored implementation `night-sweep/station.js` and the existing `qa/build3-station-review.test.cjs` were edited. The normal builders regenerated standalone HTML, PWA HTML, content-hash metadata and the content-addressed service worker. Git records six changed files including the worker rename, 72 insertions and 11 deletions. No metadata/status/handoff files were changed. No GitHub write, push, review, merge, APK, deployment, application version, storage, schema, parser, helper refactor or persistent cache change was made. RF solver and independent reference files remain identical to the starting commit.

## Deterministic RED → GREEN

The new operation-budget regression calls the real public `StationView.targets(owner)` with valid 100- and 200-row owners. It instruments catalog ID reads with getters and verifies the complete target key/model sequence. Its budget is proportional to catalog plus route size, allowing alternative linear implementations; there are no wall-time assertions or source-text checks.

Before production editing, the test failed for the intended excessive-work reason:

| Rows | Before catalog ID reads | Budget | After catalog ID reads |
| ---: | ---: | ---: | ---: |
| 100 | 48,379 | 2,468 | 1,133 |
| 200 | 96,279 | 2,868 | 1,233 |

The full pre-change review run reported 10 passing / 1 failing test; only the new work-budget test failed. A focused RED rerun printed both before counts and failed with `100 rows read 48379 catalog IDs; budget 2468 bounds work by catalog plus route size`. The same review suite passed all 11 tests after implementation, including the new budget case.

The two additional regressions cover literal complete target/context output, active/retired/inactive duplicate first-match semantics, unknown/passive omission, actual catalog object/array replacement, another valid job owner, unchanged saved records and exact existing forward/return outputs. Sparse/null catalog entries are outside the built-in dense JSON catalog; baseline lookups already fail when they traverse a hole. No new sparse-catalog contract was introduced. Valid imported route rows are checked through `loadState(..., false, true)` before the budget run.

## Executed focused verification

All commands ran in `/workspace/carpe-station` using the existing locked dependency symlink to `/workspace/Carpe-Noctum/qa/runtime/node_modules`. No dependency installation was performed.

| Command | Actual result |
| --- | --- |
| `node --test qa/build3-station-review.test.cjs` before source edit | Exit 1: 10 pass, 1 expected budget failure; `/tmp/carpe-station-optimization-red.log` |
| `node --test --test-name-pattern='catalog work stays bounded' qa/build3-station-review.test.cjs` before source edit | Exit 1: expected budget failure, both counts printed; `/tmp/carpe-station-optimization-red-budget.log` |
| `node --test qa/build3-station-review.test.cjs` after source edit | Exit 0: 11 pass, 0 fail; `/tmp/carpe-station-optimization-green-review.log` |
| `python3 night-sweep/build.py` | Exit 0; standalone generated |
| `python3 build-pwa.py` | Exit 0; PWA `cb2407bf15d56f787117`, 20 offline assets |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station.test.cjs` | Exit 0; 22 checks |
| `NIGHTSWEEP_RELEASE_TEST=1 node --test qa/build3-station-review.test.cjs` | Exit 0; 11 tests, 0 failures; frozen output tested |
| `node qa/build3-alignment.test.cjs` | Exit 0; 12 checks, including established independent solver references |
| `node qa/build3-registry.test.cjs` | Exit 0; 13 checks |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-station-layout.test.py` | Exit 0; 121 rendered Chromium checks |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | Exit 0; 141 rendered Chromium checks |
| `git diff --check` | Exit 0 |
| Both build commands again after commit, followed by `git diff --exit-code`, `git diff --cached --exit-code`, `git status --short` | Builders exit 0; tracked/index diff checks exit 0; status empty, no restore performed |

Focused logs: `/tmp/carpe-station-optimization-{station,alignment,registry,station-render,build3-layout,frozen-review}.log`. Counts above are this execution only. Review source/default and frozen reruns are separate executions, not additive coverage claims.

**Full gate is deliberately held for the parent's independent scoped review. This new head still requires Lane B re-review; earlier reviews and gate receipts do not approve this change.** No full-gate or browser-smoke pass is claimed here. No emulator, physical Android/iPhone, Safari/WebView, meter or field verification was performed.

## Actual production-build timing

Executed `python3 /tmp/carpe-station-production-compare.py > /tmp/carpe-station-production-compare.log`, exit 0. It compared the saved pre-edit frozen HTML against the actual newly built production HTML, asserted that the latter contains the exact current authored Station source, and matched public target/record/stage/results/records snapshots in six mutation/owner scenarios for nine and 200 rows. Independent random identities and timestamps were normalized. The first audit's scratch speedup is not substituted for this production run.

Chromium 156.0.8078.79, `/usr/bin/chromium`, headless desktop Linux, 390×844 mobile/touch viewport, no CPU throttle. Seven interleaved baseline/production rounds, alternating order, 217 samples per action. Synchronous `input` dispatch includes real persistence/validation/result HTML work, excludes paint. Pure reads are batched to reduce clock noise. Shared-container load limits interpretation of small absolute differences.

| Rows | Action | Before median ms | Production median ms | Before p95 ms | Production p95 ms |
| ---: | --- | ---: | ---: | ---: | ---: |
| 9 | Targets read | 0.027 | 0.029 | 0.045 | 0.051 |
| 9 | Results read | 0.100 | 0.110 | 0.140 | 0.137 |
| 9 | Unchanged render | 0.070 | 0.100 | 0.110 | 0.120 |
| 9 | Forward input | 1.200 | 1.200 | 1.600 | 1.800 |
| 9 | Return input | 1.000 | 1.100 | 1.400 | 1.700 |
| 9 | Return text input | 1.000 | 1.200 | 1.300 | 1.600 |
| 200 | Targets read | 0.401 | 0.069 | 0.533 | 0.107 |
| 200 | Results read | 0.987 | 0.167 | 1.590 | 0.243 |
| 200 | Unchanged render | 1.017 | 0.193 | 1.490 | 0.417 |
| 200 | Forward input | 6.700 | 4.300 | 8.600 | 7.600 |
| 200 | Return input | 6.700 | 4.000 | 10.100 | 5.000 |
| 200 | Return text input | 6.800 | 3.900 | 9.200 | 7.100 |

The measured tradeoff is about **36–43% lower median input cost at 200 all-active rows**, with **0–0.2 ms additional median input cost in this nine-row run**. This is a long-route optimization with small normal-route overhead, not a universal app-speed claim or physical-device guarantee. The initial scratch run had mixed/no consistent normal-route change.

Machine-readable actual production measurements: `/tmp/carpe-station-profile/production-compare.json`. Original baseline instrumentation/scratch data remain in `profile.json` and `map-compare.json` in the same directory. Deterministic ID-read reductions are 97.7% and 98.7%; those operation counts are distinct from elapsed-time speedups.

## Frozen hashes and remaining review

At `603060788493df1752da37a396507e430cacde40`, after the clean rebuild:

- Authored Station SHA-256: `99601ef66973e089c61b15e36fb17bfa60be9a11bf8db439cc96385fa4a7a588`
- Standalone SHA-256: `28148b1ffda13dffb1b27e4043cede7d183508578b1c53737137b030d98b8b15`
- Station review suite SHA-256: `5a32895255ac72aa000fa7db552874448a337126413342e5190779aed347162b`
- Alignment SHA-256, unchanged: `771ece09f116839920c9e31cca4d0c58bb506769cc5972adff227fe4ce68614b`
- App version stays `2.0 Alpha build 3`; generated PWA content identity is `cb2407bf15d56f787117`.

Root owns status/metadata and publication. Next: independent scoped review at this exact commit, address any findings, then the full gate and Lane B review at the actual final head. No self-merge is authorized.

Tools actually used: read-only Git/shell inspection followed by scoped local source/test edits and commit; Python/Node builders and the existing QA runtime; Python Playwright/Chromium for executed synthetic rendered checks and timing/equivalence; Superpowers test-driven-development and verification-before-completion guidance. No private originals or attachments were read, and browser profiling was limited to loopback URLs.
