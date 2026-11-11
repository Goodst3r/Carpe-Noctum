# Independent scoped review — Station local catalog index

Reviewed November 11, 2026 UTC. **APPROVE for the coordinator's full gate. No introduced Critical, Important or Minor finding in this scoped change.** This is internal independent review, not Lane B peer approval or merge authorization. The final published head still needs Lane B review under the two-lane plan.

## Exact source and scope

- Baseline: `4aab13616e9c7ba08cc4f14987cff093c6dcf129` (the published PR #8 baseline).
- Reviewed frozen implementation: **`603060788493df1752da37a396507e430cacde40`**.
- Isolated detached review worktree: `/workspace/carpe-station-opt-review`.
- Authored Station SHA-256: `99601ef66973e089c61b15e36fb17bfa60be9a11bf8db439cc96385fa4a7a588`.
- Frozen standalone SHA-256: `28148b1ffda13dffb1b27e4043cede7d183508578b1c53737137b030d98b8b15`.
- Review suite SHA-256: `5a32895255ac72aa000fa7db552874448a337126413342e5190779aed347162b`.

I read `AGENTS.md`, the automatic plugin/development instructions, project status, developer build notes, two-lane plan, both lane status files, Known Gaps, tools/setup, the prior seven-fix scoped review, `/tmp/carpe-optimization-plan.md`, `/tmp/carpe-station-optimization-audit.md`, and the author's final implementation receipt. I inspected the exact commit diff rather than mutable implementation work.

Only `night-sweep/station.js`, three additions to `qa/build3-station-review.test.cjs`, and normal generated standalone/PWA files changed. At `station.js:59`, a first-wins Map is created inside each `targets()` invocation. The two `devices.find()` expressions become Map lookups. Node lookup, target construction, context strings, binding, selection, schemas, persistence, reminders, math, source labels and layout remain unchanged. The standalone was independently verified to equal the baseline standalone with exactly the old Station source replaced by the new Station source; the authored new source occurs once verbatim.

## Findings and reasoning

**Critical: none. Important: none. Minor: none introduced.**

The `has()` guard preserves the first catalog match even when that first match is inactive or retired. It does not select a later active duplicate. Local reconstruction on every call sees in-place edits and complete catalog replacement immediately and does not retain owners or equipment across calls. There is no persistent cache or new invalidation requirement.

An additional read-only static reviewer independently reached the same conclusion. Both frozen catalogs contain 516 plain device objects with unique string IDs; route imports require string device IDs. JavaScript Map and strict-equality `find()` differ for NaN keys, but NaN IDs and malformed catalog holes/null entries are outside the shipped JSON catalog contract. I tested active entries with absent optional capability properties, which retained exact baseline behavior. No broader sparse/null catalog support is claimed.

The existing eight field-review regressions, including the seven prior Lane B corrections, passed within both fresh 11-test review runs. Existing deferred nonblocking findings in Known Gaps remain outside this optimization's scope.

## Independently executed verification

All tests below were run by this reviewer at the exact frozen commit. The existing locked QA dependencies were reused through an ignored `qa/runtime/node_modules` symlink to `/workspace/Carpe-Noctum/qa/runtime/node_modules`; no packages were installed.

| Actual command | Own result |
| --- | --- |
| `git worktree add --detach /workspace/carpe-station-opt-review 603060788493df1752da37a396507e430cacde40` | Exit 0; independent detached checkout created |
| `node qa/build3-station-review.test.cjs > /tmp/carpe-station-opt-review-source.log 2>&1` | Exit 0; **11 tests passed, 0 failed** |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-review.test.cjs > /tmp/carpe-station-opt-review-frozen.log 2>&1` | Exit 0; **11 tests passed, 0 failed** against frozen HTML |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station.test.cjs > /tmp/carpe-station-opt-review-station.log 2>&1` | Exit 0; **22 checks passed**, including backup/restore, saved jobs, legacy read-only, Before/After, separate dates and physical binding |
| `node --test --test-name-pattern='catalog work stays bounded' /tmp/carpe-station-opt-review/baseline-budget.test.cjs > /tmp/carpe-station-opt-review-budget-red.log 2>&1` | Expected exit 1; old frozen implementation fails the new budget case for excessive catalog work |
| `python3 /tmp/carpe-station-opt-review.py > /tmp/carpe-station-opt-review-differential.log 2>&1` | Exit 0; **22 complete baseline/candidate output comparisons equal**, zero normalized fields, zero page errors |
| Python exact source/standalone integrity check, recorded in `/tmp/carpe-station-opt-review/source-integrity.json` | Exit 0; baseline HTML with only the exact Station source substitution equals candidate HTML byte for byte |
| `git diff --check 4aab13616e9c7ba08cc4f14987cff093c6dcf129 HEAD` | Exit 0 |
| `git diff --exit-code`, `git diff --cached --exit-code`, `git status --short`, `git rev-parse HEAD` | Diff checks exit 0; status empty; HEAD remains `603060788493df1752da37a396507e430cacde40` |

The baseline budget rerun used a scratch copy of the frozen review suite with only its harness import redirected to `bootApp({html: baselineFrozenHtml})`; no repository file was altered. At 100/200 valid active rows, the old implementation read **48,379 / 96,279** catalog IDs and exceeded budgets **2,468 / 2,868**. The candidate source and frozen reruns each read **1,133 / 1,233**. The public test checks the full source/route key and model sequence and bounds catalog work by catalog plus route size, with no timing assertion.

The independent differential script compares full JSON values for `targets()`, `currentRecord()`, `currentStage()`, `results()` and `records(state)`, plus raw saved state. It first creates one common synthetic saved fixture through actual browser controls, with both stages, distinct measurements, balanced=true/date `2026-11-10`, swept=false/date `2026-11-11`, and known 4.5 dB EQ / 7 dB pad / 39 dBmV injection outputs. Both old and new pages then receive exactly that fixture. No field is removed or normalized for comparison. Fixed browser time and seeded random generation make fixture creation reproducible. Public reads and transient picker changes are also checked not to mutate the saved owner.

The 22 cases cover node and active sources; mixed passive/active routes; 100/200 active routes with saved source/route records; first active/inactive/retired duplicates; unknown IDs; absent optional device properties; node-band catalog corrections; in-place catalog edits, array/object replacement and restoration; actual setup-control changes to node asset/port/module/band and active asset/port; a route model change; and another owner followed by restoration. Independent assertions confirm the saved stages/dates and known solver outputs, omission/retirement rules, and blank current work after physical equipment changes while archived raw records remain present.

Browser: **Chromium 156.0.8078.79**, `/usr/bin/chromium`, headless desktop Linux, 390×844 mobile/touch viewport. Browser requests were restricted to the temporary loopback server. Machine-readable comparison evidence is `/tmp/carpe-station-opt-review/differential-results.json`; full synthetic comparison values are `/tmp/carpe-station-opt-review/differential-outputs.json`; reproduction script is `/tmp/carpe-station-opt-review.py`.

## Performance interpretation and remaining checks

I independently verified deterministic catalog-work reduction, not elapsed-time speedup. The author's separately executed production timings report a 36–43% median synchronous input reduction for the particular 200-active-row fixture and 0–0.2 ms additional median input cost in its nine-row run. The coordinator has accepted that scoped tradeoff. These timings support long-route optimization and do not establish a universal UI or phone improvement. The local Map's lifetime is one call; this review found no serious allocation or retained-state issue.

The full applicable gate, layout and browser smoke remain the coordinator/author's next step after this review. I did not run or claim them. No phone, emulator, Safari/WebView, meter/reference-plane or field verification was performed. No source/index/GitHub/private-original/APK changes were made; only the isolated checkout, ignored dependency symlink and scratch review artifacts were created. No private original or attachment was opened.

Tools actually used: local Git/shell/Python for exact-source inspection and evidence, locked Node/jsdom QA runtime for executed suites, Python Playwright/Chromium for executed differential checks, and Superpowers verification-before-completion guidance. Cloud environment status confirmed the current managed runtime was running. This report does not replace the required Lane B peer review at the final published head.
