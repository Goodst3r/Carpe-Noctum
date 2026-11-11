# NightSweep 1.8 Alpha build 2 reliability audit

The storage/job audit found and fixed two concrete problems. Current-source verification passed **201 checks across 10 suites**, with zero failures. Generated-release and physical-device verification remain separate.

## Findings and changes

1. **Duplicate could save stale work after a storage failure.** The old implementation tried to sync the active named job, swallowed that write failure, then copied its last saved snapshot. A small stale copy could fit where the actual edited job did not. If the first write succeeded but the second failed, duplication could update only the original before reporting failure. `jobs.js` now constructs the current original and copy in memory and persists both with one `localStorage.setItem` call. A failed write leaves the library and current working state unchanged. The existing sample-to-plant conversion guard remains.
2. **Unchanged renders replaced job controls and keyboard focus.** `JobsUI.render()` rebuilt the same list on each call. It now compares the visible metadata and saved-list state, preserving existing controls when those inputs are unchanged. Status messages continue updating directly.

The first three duplication regressions and the unchanged-focus regression failed before implementation (`reliability-red.log`); all pass in `reliability-backtest.log`.

## Bounded performance comparison

The repeatable script `reliability-benchmark.cjs` loads the accepted maximum of 1,000 synthetic named jobs, then calls `JobsUI.render()` three times without changing state. Before: **3 complete list DOM replacements / 698.48 ms** total. After: **0 replacements / 1.28 ms** total. This is a local JSDOM CPU/DOM measurement, not a phone-speed claim. The active-job copy also reduces its library writes from two to one, asserted by a real storage-call counter.

## Executed verification

| Scope | Passed | Log |
| --- | ---: | --- |
| new reliability regressions and boundary replay | 10 | `reliability-backtest.log` |
| IndexedDB fault injection | 13 | `evidence-storage-current.log` |
| named-job corruption/capacity | 5 | `named-storage-current.log` |
| evidence format/core limits | 52 | `evidence-core-current.log` |
| evidence owner context | 8 | `evidence-context-current.log` |
| evidence UI/storage | 28 | `evidence-ui-current.log` |
| browser export lifecycle | 23 | `browser-files-current.log` |
| training preservation and recovery | 41 | `training-job-current.log` |
| training controls and retained examples | 10 | `training-controls-current.log` |
| seven exercises and 37 feature loads | 11 | `training-library-current.log` |

New boundary replay uses the actual source-assembled app and verifies an 8 MiB original plus a 4 MiB original at the exact 12 MiB job limit, hash/base64 recovery, rejection before reading an over-limit selection, all 30 zero-byte originals, malformed originals, every evidence-operation busy guard, and actual 1.6 plus retained 1.7/prior-1.8 project recovery. Existing fault suites exercise transaction commit/abort, partial request failures, blocked and unexpectedly closed databases, malformed saved snapshots, quota failures and 1,000-job capacity.

All seven practice variants and 37 feature loaders passed with the corrected complete GS7K/two-GaN/mixed-passive 42/54 job and the independent six-serial-AOI 204/258 example intact. Only current 1.8 revision prose was labelled build 2; project schema 1 and training compatibility markers were preserved.

## Tools and boundaries

Context7 resolved MDN and supplied current IndexedDB complete/abort and `Storage.setItem`/quota documentation, saved in the companion JSON files. Those references support the API assumptions; the application assertions came from executed tests. No dependencies were upgraded, external data uploaded, messages sent or artifacts published.

This subtask did not build or overwrite `outputs/` or `dist/`. Existing test output paths were corrected so source-only practice backups go under `research/build2/`; the three briefly rewritten old flat release JSON files were restored byte-for-byte. The shared source harness is owned by the math audit; the common project-text size guard was assigned to the app.js owner. Source/test file hashes and exact commands are in `reliability-audit.json`.

Synthetic faults are not physical storage exhaustion. Full every-function/branch coverage, native ONX decoding, physical phone behavior and RF acceptance are not claimed. Root must run final tests against the frozen generated app and record actual device checks separately.
