# Parallel work plan: Claude and the coworker (ChatGPT/Codex)

November 11, 2026 · written by Claude · Spencer asked for this plan to live in the repo

Two assistants work on Carpe Noctum at the same time, each as the only writer in its own lane, on files the other lane doesn't touch. Each lane reviews the other's pull request. Spencer merges.

## The short version

| | Lane S: station view | Lane Q: test gate and paperwork |
| --- | --- | --- |
| Writer | Coworker (ChatGPT/Codex) | Claude |
| Branch | `codex/station-view` | `claude/qa-gate` |
| Changes app behavior | Yes, adds one screen | No. Build output must stay byte-identical |
| Pull request into | `build3` | `build3` |
| Reviewer | Claude | Coworker |

**`build3` is the integration branch for 2.0 Alpha build 3.** It starts at `c55a67c` (the build 3 work from `ccr-7abea525-rljsni` plus the ChatGPT handoff) plus this file. `main` stays at 2.0 Alpha build 2 until Spencer accepts build 3. Both lanes branch from `build3` and merge back by pull request. Nobody pushes to `build3` or `main` directly.

## Where things stand

### The coworker's base check on `c55a67c`

Stopped at step 1, as instructed:

- Dependency install and both builds passed.
- The rendered checks passed: 55 inside the runner, 141 build 3 layout and 328 browser smoke. These match the counts the build 3 session reported.
- `qa/run-pwa.py` timed out after 150 s in `build2-reliability.test.cjs`, with two of its tests done. Only 10 automated suites (107 checks) had finished.

The coworker made no commits or pushes. Its receipt with exact commands and the failure log isn't on GitHub yet.

### Claude's reproduction on the same revision

Run on a 2-CPU, 8 GB Linux container, November 11, 2026:

| Check | Command | Result |
| --- | --- | --- |
| Install and builds | `npm ci --prefix qa/runtime --no-audit --no-fund`, `python3 night-sweep/build.py`, `python3 build-pwa.py` | Passed |
| Automated suites | `NIGHTSWEEP_CHROMIUM=<chromium> python3 qa/run-pwa.py` | **61 of 61 suites, 1,109 checks passed** in 278 s; generated build unchanged during tests; exit 0 |
| The suite that timed out | `node qa/build2-reliability.test.cjs`, alone, with and without `NIGHTSWEEP_RELEASE_TEST=1` | 10 of 10 tests passed in 19.5 s and 17.6 s; it also passed inside the runner |
| Build 3 rendered layout | `python3 qa/build3-layout.test.py` | 141 rendered Chromium checks passed |
| Rendered smoke | `python3 qa/browser-smoke.py` | 328 rendered Chromium checks passed |

Standalone `outputs/Night_Sweep.html` SHA-256 is `89b27de366cc25e3939cc163ac221bafec1a12f0ea24fee197d92892d4ae6aa5`, the same as the build 3 session reported. Rendered checks are desktop Chromium at phone sizes. No emulator, phone or field test was done.

**Diagnosis.** The reliability suite isn't broken. It boots the full app in jsdom ten times and pushes 12 MiB of evidence through import, export and recovery. Here each test takes 1–5 s and the suite about 18 s. That held both run alone and with `NIGHTSWEEP_RELEASE_TEST=1`, which is what the runner sets. The coworker's machine took about 150 s for two tests, roughly 50 times slower, so the cause is that sandbox's speed or memory, not the app. `run-pwa.py` keeps going after a suite times out. Only 10 suites finishing means the coworker's own command limit stopped the whole runner.

**Decision.** The base is good enough to start both lanes. The coworker doesn't need to diagnose the timeout: Lane Q makes the per-suite limit configurable and records each suite's time.

## Rules for both lanes

1. **Branch from `build3`.** Open a draft pull request into `build3` early. Don't push to the other lane's branch, to `build3`, to `main` or to `ccr-7abea525-rljsni`.
2. **Stay inside your own files** (lists below). If you need a file the other lane owns, say so in your pull request and stop. Don't edit it.
3. **Generated files.** `outputs/Night_Sweep.html` and `dist/**` are committed only by Lane S. Lane Q changes no app source, so its rebuilt output must be byte-identical; if it isn't, stop and report.
4. **Version stays put.** 2.0 Alpha build 3, Android code 27. Neither lane changes version identity, builds or signs an APK, or publishes anything.
5. **Status and update log.** `NightSweep_Project_Status.md` and `CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt` are Lane S's to update for the station view. Lane Q puts its notes in its pull request and in `handoff_docs/lanes/claude-qa-gate.md`.
6. **Test churn.** Some tests rewrite tracked evidence files with new random IDs and timings on every run. Don't commit that churn: restore those files with `git checkout -- <file>` before committing. Lane Q is fixing this. The 19 files that changed in Claude's run:
   - `release/NightSweep_1.8_Alpha_build_2_*` — GS7K, GainMaker DSIM and GainMaker OEM AGC practice files, and the training job
   - `research/alpha18/complete-workflow-application.json`, `research/alpha18/math-data-audit.json`
   - `research/build2/example-math-backtest.json`, `power-backtest-results.json`, `rf-property-results.json`, `layout-candidate.html`, `layout-validation.json`
   - `research/build2/browser/` — `results.json` and seven screenshots
7. **Report in every pull request:** starting and ending commit, files changed and why, sources, exact commands with your own results, and what's untested. Keep automated tests, rendered browser checks, emulator, phone and field results separate. Never copy another run's counts.
8. **Review the same head commit.** Post findings as a pull request review, or as `handoff_docs/reviews/<branch>-review.md` on your own branch. Give file, line, severity and evidence. The lane owner makes the fixes.

## Lane S, coworker: station view (build list item 3)

**Before starting:**

1. Rebase your local `codex/station-view` (at `c55a67c`) onto `build3`. Only docs differ.
2. Commit your step 1 receipt as `handoff_docs/lanes/codex-base-check.md` and push the branch.
3. Run the full gate with an outer command limit of at least 60 minutes, or in the background, so every suite finishes. If `build2-reliability.test.cjs` still times out, run `node qa/build2-reliability.test.cjs` on its own, record its time and result, and carry on.

**Build** one screen per active on the route:

- **Forward:** targets at both pilots, the tech's two readings, level and tilt error, and pad/EQ advice. Reuse the existing solver in `night-sweep/alignment.js`; don't copy its math.
- **Return unity-gain worksheet:** injection level, level at the receiver, return pad and EQ, and the difference from the company target. Injection is the reference-point level plus insertion loss (SCTE 180 2025 §13.2.2.2). See `research/build3/STATION_VIEW_SOURCES.md`.
- **Done check** that records "balanced" and "swept" as separate states.

**Requirements:**

- 42/54 (GS7K, GainMaker): forward and return Sweepless Sweep; references 31 dBmV at 54 MHz and 43 dBmV at 860 MHz. 204/258 (Vecima, AOI): forward Sweepless Sweep, XPERTrak return. Keep them separate.
- The 38 dBmV return TX, the SCU-1800's 0 dBmV input, the CMTS 0 dBmV set point and the Quantum18 9 dBmV input are four different values. Company targets and tolerances start Unknown; blank never means zero. Don't invent a return tolerance.
- Quantum18 aligns electronically: show the note, no part picks. Don't invent pilot codes or borrow another model's procedure.
- Saved readings are additive to the job format. Old jobs and backups open unchanged and round-trip. No storage key, package ID or file-format break.
- Register every new target or limit in `night-sweep/thresholds.js` with its label and source.
- Phone-first dark field UI, large controls, fully offline. Plain JS/HTML/CSS; no frameworks, accounts, cloud or AI.
- Add a seeded practice step and update the guides, using 2.0 screen names. Leave older training text as it is (queued below).
- Don't build or sign an APK.

**Files Lane S owns:**

- New `night-sweep/station*.js` (and its CSS, if separate)
- `night-sweep/build.py` (add your module token), `shell.html`, `app.js`, `workflow.js`, `style.css`
- `night-sweep/projects.js`, `jobs.js`, `field-report.js` (additive job data only)
- `night-sweep/thresholds.js`, `training.js`
- `docs/NightSweep_1.8_*` guides and `night-sweep/README.md` (rendered with `docs/render_readme.cjs`)
- New `qa/build3-station*` tests; `qa/v20-design.test.cjs` (tab list)
- `outputs/Night_Sweep.html`, `dist/**`, the status file and update log

**One shared file:** in `qa/run-pwa.py`, add your suite lines **inside the `suites=[...]` list only**, right after the "Build 3 tilt, EQ and pad solver" entry. Lane Q edits only the code below that list, so git merges both cleanly.

**Tests to add:** hand-worked cases checked against independent arithmetic, a legacy job and backup round-trip, and a rendered layout check at 320–430 px.

**Done when:** the full gate passes on your machine (note any environment timeout as above), and your pull request into `build3` carries the report in rule 7 plus `handoff_docs/lanes/codex-station-view.md`.

## Lane Q, Claude: reliable test gate and paperwork

No app behavior change. Rebuilt `outputs/` and `dist/` must match `build3` byte for byte.

1. **Configurable suite limit.** `NIGHTSWEEP_SUITE_TIMEOUT` (seconds, default 150). Each suite's run time goes to the console and to `qa/pwa-test-results.json`, so runs on different machines can be compared.
2. **Tests stop rewriting tracked files.** Evidence writes go to an untracked folder unless `NIGHTSWEEP_WRITE_EVIDENCE=1` is set for a deliberate refresh. A full test run then leaves `git status` clean.
3. **Release test says what's missing.** When `build-readiness.json` says a final APK was built but the receipts aren't in the checkout, `qa/alpha18-release.test.py` fails with "receipts not present", not a file error.
4. **Paperwork.** `AGENTS.md` to build 3 / code 27, `START_HERE_CODEX.md` rewritten for 2.0 and this workflow, and new `CLAUDE.md` (pointing to `AGENTS.md`), `handoff_docs/KNOWN_GAPS.md` and `handoff_docs/TOOLS_AND_SETUP.md`. The project instructions name these and both assistants report them missing.
5. **CI.** A GitHub Actions workflow that runs the gate on pushes and pull requests to `build3`, so both lanes are judged on one neutral machine. If this session can't push workflow files, the pull request will say so.
6. **If time allows:** VP for the hardline catalog cables (P3, QR, MC2 .500–.750), with datasheet provenance, in `night-sweep/catalog.json` only.

**Files Lane Q owns:**

- `qa/run-pwa.py` (below the `suites` list only)
- The evidence-writing lines in the tests listed under rule 6
- `qa/alpha18-release.test.py`, `.github/**`
- `AGENTS.md`, `START_HERE_CODEX.md`, `CLAUDE.md`
- `handoff_docs/KNOWN_GAPS.md`, `handoff_docs/TOOLS_AND_SETUP.md`, `handoff_docs/lanes/claude-qa-gate.md`
- `night-sweep/catalog.json` (task 6 only)

**Done when:** the gate passes, `git status` is clean after a full run, the build output is unchanged, and the pull request into `build3` carries the rule 7 report.

## Queue after these two lanes merge

| Next | Task | Lane | Why it waits |
| --- | --- | --- | --- |
| 1 | Sync training and guide text to the 2.0 screen names ("Save named job", "Sun / Night", "Equipment setup"), plus a test that fails when training names a button that doesn't exist | Claude | `training.js` and the guides belong to Lane S until it merges |
| 2 | Night log and shift handoff note (build list item 6) | Coworker | Uses the station view's before/after levels |
| 3 | DOCSIS health card (item 5) | Claude | Adds rows to `thresholds.js` |
| 4 | Register the older screens' example targets in the registry | Whoever is free | `thresholds.js` |

## Spencer's part

- Merge each pull request into `build3` once the other assistant's review is in and the gate passes.
- Decide pull requests #1 (roadmap) and #2 (build list).
- When build 3 is accepted: build and sign the code 27 APK off-repo with the original key, try it on your own phone, then merge `build3` into `main`.
