# Carpe Noctum 2.0 Alpha build 3 · Source handoff

Carpe Noctum (formerly NightSweep) is an offline HFC field app for maintenance technicians, team leaders and supervisors. It is a plain JavaScript, HTML and CSS PWA with an Android WebView wrapper. This file is the first page for any assistant or developer picking the project up. `AGENTS.md` holds the standing project rules; `CLAUDE.md` points to it.

## Read in this order

1. `AGENTS.md`: names, version, field rules, build commands.
2. `NightSweep_Automatic_Plugin_Instructions.txt` and `NightSweep_Development_Instructions.txt`: tool routing, validation, reporting. The plugin policy wins where they differ.
3. `NightSweep_Project_Status.md`: the latest verified baseline and outstanding checks.
4. `docs/DEVELOPER_BUILD.md` and, for Android, `android-build/README.md`: commands and dependencies.
5. `handoff_docs/PARALLEL_TASKS.md`: the two-lane plan, the rules both lanes follow, the work loop and the definition of done. It is the source of truth for who does what.
6. `handoff_docs/lanes/grok-status.md`, `handoff_docs/lanes/claude-status.md` and `handoff_docs/lanes/codex-status.md`: what each assistant last recorded. Never rely on memory of an earlier chat; the repository is the record.
7. `handoff_docs/KNOWN_GAPS.md` and `handoff_docs/TOOLS_AND_SETUP.md`: what is not done or not verified, and how to set up a machine.
8. `docs/BUILD_LIST.md`: the 20 planned features with sources, labels and acceptance tests. `handoff_docs/FINAL_HANDOFF.md` is the record of what was delivered, and `handoff_docs/APK_PLAN.md` says how the APK is built.

## Where the work lives

| Branch | Purpose |
| --- | --- |
| `main` | 2.0 Alpha build 2 (Android code 26), the last signed release. Untouched until the owner accepts build 3. |
| `build3` | Integration branch for 2.0 Alpha build 3 (Android source code 27). All lane work lands here by reviewed pull request. |
| `codex/<item>` | Lane A (ChatGPT) feature branches. Lane A has stopped. Do not push to these. |
| `claude/<item>` | Lane B (Claude) feature branches. Lane B has stopped. Grok may push ordinary commits only to the six stretch branches named in the takeover notes. |
| `grok/<item>` | Third assistant (Grok), from November 12, 2026. |
| `ccr-7abea525-rljsni` | The branch the first build 3 session wrote (items 1, 2 and 4). Frozen; `build3` already contains it. |

Each lane writes its own status file and reviews the other lane's pull requests. The reviewer, not the author, merges (merge commit, no squash). Nobody force-pushes, rewrites history, changes the version, storage keys, package ID or job file format, or builds, signs or publishes an APK. The full list is rule 1 to 10 in `PARALLEL_TASKS.md`.

## Current paths

| Path | Purpose |
| --- | --- |
| `night-sweep/` | Authored app: `shell.html` plus one module per feature (`app.js`, `engine.js`, `alignment.js`, `field-calcs.js`, `thresholds.js`, `jobs.js`, `training.js`, `workflow.js` and others), `catalog.json` for equipment, `build.py` to assemble them |
| `pwa/` | Hosted-browser controls, service-worker template, icons |
| `android-build/` | Native wrapper, build script and readiness record |
| `docs/` | Current guides (`NightSweep_1.8_*` filenames are stable; their titles carry the build), `BUILD_LIST.md`, `ROADMAP.md`, historical editions under named 1.6/1.7 files and `history/` |
| `qa/` | Automated suites, rendered Chromium suites, `run-pwa.py` (the gate) and its helpers |
| `research/build3/` | Sources and independent reference calculations for build 3 features |
| `research/build2/`, `research/alpha18/`, `release/` | Earlier builds' evidence, synthetic practice backups and receipts. Historical; do not rewrite |
| `handoff_docs/` | The plan, status files, prompts, known gaps, tool setup |
| `outputs/Night_Sweep.html`, `dist/` | Generated standalone HTML and PWA. Never hand-edit or hand-merge: rebuild and commit |

## Build and check

```sh
npm ci --prefix qa/runtime --no-audit --no-fund
python3 night-sweep/build.py
python3 build-pwa.py
python3 qa/run-pwa.py            # automated suites
python3 qa/build3-layout.test.py # rendered Chromium, phone widths
python3 qa/browser-smoke.py      # rendered Chromium smoke
```

The rendered suites need Python Playwright and a Chromium (`NIGHTSWEEP_CHROMIUM` selects one). On a slow machine raise the per-suite limit with `NIGHTSWEEP_SUITE_TIMEOUT` (seconds, default 150). Setup details, environment variables and the evidence-file rule are in `handoff_docs/TOOLS_AND_SETUP.md`. Report your own counts from your own run, and keep automated, rendered-browser, emulator, phone and field results separate. Rendered checks are desktop Chromium at phone sizes, not a phone.

## Product rules that never change

- **Offline only.** No live modem, CMTS, RPD or amp polling, no XPERTrak or StrataSync sync, no accounts, cloud, telemetry, AI or OCR. Importing a meter file the technician exported from their own meter is allowed. The repository holds synthetic CSV fixtures and invented JSON, gzip and ZIP fixtures (`qa/fixtures/viavi-synthetic/`). Real meter files, customer names, addresses and account numbers stay out.
- **Every limit is labeled** spec, expert, company or unknown, and registered in `night-sweep/thresholds.js` with source, revision, page or section, units and conditions. Company targets start unknown; blank never means zero.
- **Keep the plants apart.** 42/54 MHz (GS7000/GS7K, GainMaker) and 204/258 MHz (Vecima, AOI) are separate workflows. 31 dBmV at 54 MHz, 43 dBmV at 860 MHz and the 38 dBmV return TX are company values and stay editable. OEM AGC, ACI DSIM and manual/thermal procedures stay separate. UBT stays out of new selections.
- **Check new math independently** of the app, with a regression test against the app's real output.
- **SCTE and NCTI material is paraphrased and cited, never copied.** FCC rules (47 CFR) may be quoted.
- **Keep identities stable:** package `com.spencerwilliams.nightsweep(.preview)`, storage keys `hfc-route-v1`, `hfc-named-jobs-v1`, `nightsweep-*`, and the `NightSweep`/`NightSweepAndroid` code identifiers. Saved-job changes are additive; old jobs and backups open unchanged.
- **Signing keys and private field evidence stay outside the repository and every handoff.**

## State at this handoff (November 12, 2026)

A third assistant, Grok, took over after Lane A (ChatGPT) and Lane B (Claude) stopped. `build3` at `f467e5261295449f94dd232ab3995c8a00be25ee` holds the required core:

| Item | Screen |
| --- | --- |
| 1 Limits registry, 2 pad/EQ solver, 4 calculators | Test → Limits, Test → Calculators |
| 3 Station view, plus the native-input follow-up | Route → Station |
| 5 DOCSIS health | Test → DOCSIS health |
| 6 Night log | Job → Night log |
| 7 Leakage | Test → Leakage. Supervisor review needed before coworkers use it |
| 8 Outage | Job → Outage. Supervisor review needed against the local outage procedure |
| 9 Safety | Job → Safety. Supervisor or safety officer review needed |
| 10 Sweep due | Job → Sweep due |
| 13 Imported sweep grading | Job → ONX files → Grading aid |

Counted by Grok in jsdom on that standalone HTML: **29 screens, 47 features, 114 registry rows**, practice steps **22/16/15/8/9/7/10**. D1 and D2 are met on that commit. D4 is the paperwork on the close-out branch. D5 is `handoff_docs/FINAL_HANDOFF.md`. D3 is a full gate on the post-paperwork head. Grok's run is one run. Lane A and Lane B are not here to rerun it, so D3 stays for Spencer to accept.

Stretch items 11, 12 and 14–20 are not on `f467e52`. Items 11, 15, 17 and 18 are merged. This branch, `claude/b20-pop`, adds item 20: 34 screens, 52 features, custom curves 20 steps. Draft pull requests #19 and #20 are still open. Items 12, 14 and 16 are not started. Pull requests #1 and #2 into `main` are Spencer's decision.

No build 3 APK exists. No emulator, phone or field test has been done for any 2.0 build. Export and verify full project backups before any update, rollback or transfer. Read `handoff_docs/lanes/grok-status.md` for what this assistant is doing now.
