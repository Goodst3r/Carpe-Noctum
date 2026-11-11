# Lane B status (Claude, Sonnet 5.5 Ultracode)

Only Lane B edits this file. Updated November 11, 2026 15:30 UTC on branch `claude/b6-leakage`. This file is rewritten whole in each Lane B pull request: if merging two of them conflicts here, take the version from the pull request with the higher number.

| Item | Branch | Pull request | Head commit | State | Last gate (date, own counts) |
| --- | --- | --- | --- | --- | --- |
| B0 registration refactor | claude/b0-build-registration | [#3](https://github.com/Goodst3r/Carpe-Noctum/pull/3) | | **merged** by Lane A | |
| B1 reliable test gate | claude/b1-reliable-gate | [#4](https://github.com/Goodst3r/Carpe-Noctum/pull/4) draft | 8b71edd | Lane A asked for one change (the gate-reliability suite failed without `.git`); **fixed**, thread answered, waiting for re-review | Nov 11 on 85aa348: 62 suites / 1,115 checks; the fix's suite alone: 7 checks. Full gate on the merged head not rerun (offered) |
| B2 CI | claude/b2-ci | not opened | | pushed; the pull request opens after B1 merges (its clean-tree step depends on B1) | not run in Actions |
| B3 paperwork | claude/b3-paperwork | [#5](https://github.com/Goodst3r/Carpe-Noctum/pull/5) | | **merged** by Lane A | |
| B4 training and guide sync | claude/b4-training-sync | [#6](https://github.com/Goodst3r/Carpe-Noctum/pull/6) draft | 5a370c1 | Lane A asked for one change (lowercase control verbs slipped past the name check); **fixed**, it also found and fixed a real guide error, thread answered, waiting for re-review | Nov 11 on 1a7df67: 62 suites / 1,115 checks; layout 141; smoke 328 |
| B5 item 5 DOCSIS health card | claude/b5-docsis-health (stacked on B4) | [#7](https://github.com/Goodst3r/Carpe-Noctum/pull/7) draft | ede0ae5 | open, independently reviewed, all confirmed defects fixed; no Lane A review yet | Nov 11 on ede0ae5: 63 suites / 1,133 checks; layout 241; smoke 331 |
| B6 item 7 leakage tools | claude/b6-leakage (stacked on B5) | opening | see PR | built, independently reviewed (40 agents; all 35 confirmed findings fixed) | Nov 11: 64 suites / 1,163 checks; layout 351; smoke 334 |
| B7 item 9 pre-work safety card | | | | built locally with a shared checklist engine; replaying onto B6 and its gate next | interim, before the B6 fixes: 65 suites / 1,177 checks; layout 421; smoke 337 |
| B8 item 8 outage first-response card | | | | built locally (32 checks passing), stacked on B7 | |
| B9 D4/D5 close-out and FINAL_HANDOFF.md | | | | not started: waits for Lane A's A1 to A4 | |

## For Lane A

- **Lane A's A1 (pull request #8):** I have started the independent review (four lenses, each finding checked by a skeptic) and will run the exact-head gate myself, then post the review on the pull request.
- **Merge order for my stack:** #4, #6, then #7 (B5), then B6, B7, B8. Each shows the earlier ones' commits until they merge. B2 (CI) waits for #4.
- **Overlap with A1 you should expect:** both lanes edit `night-sweep/shell.html`, `workflow.js`, `thresholds.js`, `training.js`, `build.py`, `style.css`, the guides and `qa/run-pwa.py`. Whoever merges second rebuilds the generated files (`python3 night-sweep/build.py && python3 build-pwa.py`) instead of hand-merging them, and re-adds a one-line module entry in `build.py`.
- **New device-local storage keys** (all outside jobs and their backups, all read defensively, none changes the job format): `nightsweep-docsis-windows-v1` (B5), `nightsweep-leakage-v1` (B6), `nightsweep-safety-v1` (B7), `nightsweep-outage-v1` (B8). A browser that will not store a change keeps it for the page; unreadable data is copied to `<key>-unreadable` before it is replaced; data from a newer version is never overwritten.
- **Naming:** use the 2.0 screen and button names in text (`qa/ui-names.test.cjs` fails on a name that does not exist, in any letter case after a control verb). New in my stack: Test → DOCSIS health, Test → Leakage, Job → Safety, Job → Outage.
- SHA-256 of `outputs/Night_Sweep.html` at B6 head: `dc796590c32608cf69a82ac592d159f1d322853b573c8576e51b689b4d741bed`.
- Tooling notes: Python Playwright (`pip install playwright`) and `NIGHTSWEEP_CHROMIUM` for the rendered suites; guide HTML is rendered with `marked` 18.2.0 and `CODEX_PRIMARY_RUNTIME_NODE_MODULES`; do not `git add` a symlinked `qa/runtime/node_modules` (I removed one I had committed by mistake from unpushed history).

## Next
Review Lane A's A1 (pull request #8) and post it; replay B7 and B8 onto B6 and gate them; open the B2 pull request once #4 merges; answer any review on #4, #6, #7 and B6; then B9 once A1 to A4 have merged.

## Blocked
Nothing blocks the work. Firecrawl is out of credits until about 23:09 UTC on Nov 11; research continues with Exa, and anything only Firecrawl could verify is marked "not re-verified".

## Questions for Spencer
1. **Where should company settings live?** The DOCSIS windows, the leak repair threshold and detector tolerance, and the safety and outage notes are saved in the browser on each phone, outside jobs and backups. That is simple and private, but a technician who clears browser data loses them, and coworkers each enter their own. A shared company profile would need an import or export design and your decision on sharing company values.
2. **Who can review the safety and outage cards?** Both are written in the app's own words, say they are not a company procedure, and need a supervisor or safety officer to read them (the outage card against the local outage procedure) before coworkers use them. Questions to ask are in `research/build3/SAFETY_SOURCES.md`.
3. **A DOCSIS 3.1 modem that receives only SC-QAM channels:** is its total input limit 33 or 40 dBmV? The specification text can be read either way (`research/build3/DOCSIS_HEALTH_SOURCES.md`); an engineer's answer would settle it.
