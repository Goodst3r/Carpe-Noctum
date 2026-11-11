# Lane B status (Claude, Sonnet 5.5 Ultracode)

Only Lane B edits this file. Updated November 11, 2026 on branch `claude/b11-impairments`. This file is rewritten whole in each Lane B pull request: if merging two of them conflicts here, take the version from the pull request with the higher number.

| Item | Branch | Pull request | Head commit | State | Last gate (date, own counts) |
| --- | --- | --- | --- | --- | --- |
| B0 registration refactor | claude/b0-build-registration | [#3](https://github.com/Goodst3r/Carpe-Noctum/pull/3) | | **merged** | |
| B1 reliable test gate | claude/b1-reliable-gate | [#4](https://github.com/Goodst3r/Carpe-Noctum/pull/4) | 8b71edd | **merged** after one requested change (the suite failed without `.git`) | Lane A: 62 suites / 1,116 checks |
| B3 paperwork | claude/b3-paperwork | [#5](https://github.com/Goodst3r/Carpe-Noctum/pull/5) | | **merged** | |
| B4 training and guide sync | claude/b4-training-sync | [#6](https://github.com/Goodst3r/Carpe-Noctum/pull/6) | 5a370c1 | **merged** after one requested change (lowercase control verbs slipped past the name check) | Lane A: 62 suites / 1,115 checks |
| B2 CI | claude/b2-ci | [#11](https://github.com/Goodst3r/Carpe-Noctum/pull/11) draft | ce55e69 | open; **its first hosted run is the first test of the workflow** (cannot be run here) | YAML parsed locally |
| B5 item 5 DOCSIS health card | claude/b5-docsis-health | [#7](https://github.com/Goodst3r/Carpe-Noctum/pull/7) draft | 4d35286 | open, independently reviewed, all confirmed defects fixed; waiting for Lane A | Nov 11 on ede0ae5: 63 suites / 1,133 checks; layout 241; smoke 331. Head 4d35286 adds a merge of build3 and one test-line change |
| B6 item 7 leakage tools | claude/b6-leakage | [#9](https://github.com/Goodst3r/Carpe-Noctum/pull/9) draft | e7ed9d6 | open, independently reviewed (40 agents; all 35 confirmed findings fixed) | Nov 11 on 169c01e: 64 suites / 1,163 checks; layout 351; smoke 334 |
| B7 item 9 pre-work safety card | claude/b7-safety | [#10](https://github.com/Goodst3r/Carpe-Noctum/pull/10) draft | 8381b00 | open; wording not reviewed by a supervisor or safety officer | Nov 11 on bd42dfe: 65 suites / 1,189 checks; layout 441; smoke 337 |
| B8 item 8 outage first-response card | claude/b8-outage | [#12](https://github.com/Goodst3r/Carpe-Noctum/pull/12) draft | ff6ab70 | open; **needs a supervisor's review against the local outage procedure before coworkers use it** | Nov 11 on 582c867: 65 suites / 1,195 checks; layout 531; smoke 340 (not rerun after merging B7's latest) |
| B10 item 11 impairment decision tree and signature cards | claude/b11-impairments | PR number in the PR list (stacked on #12) | d88bec3 | open (stretch item); independent math reference, no customer data, no storage | Nov 11 on d88bec3: 67 suites / 1,215 checks (PASS lines, 0 failed); layout 611; smoke 343 |
| B9 D4/D5 close-out and FINAL_HANDOFF.md | | | | not started: waits for Lane A's A1 to A4 | |

## For Lane A

- **Lane A's A1 (pull request #8, head 895503b):** my independent review (four lenses, each finding checked by a skeptic) is running against a00fe9e, and I will run the exact-head gate on 895503b myself, then post the review.
- **Merge order for my stack:** #7 (B5), #9 (B6), #10 (B7), #12 (B8), then the item 11 PR; each shows the earlier ones' commits until they merge. #11 (CI) is independent. Thank you for the quick reviews of #3 to #6.
- **Overlap with A1 you should expect:** both lanes edit `night-sweep/shell.html`, `workflow.js`, `thresholds.js`, `training.js`, `build.py`, `style.css`, the guides and `qa/run-pwa.py`. Whoever merges second rebuilds the generated files (`python3 night-sweep/build.py && python3 build-pwa.py`) instead of hand-merging them, and re-adds a one-line module entry in `build.py`.
- **New device-local storage keys** (all outside jobs and their backups, all read defensively, none changes the job format): `nightsweep-docsis-windows-v1` (B5), `nightsweep-leakage-v1` (B6), `nightsweep-safety-v1` (B7), `nightsweep-outage-v1` (B8). A browser that will not store a change keeps it for the page; unreadable data is copied to `<key>-unreadable` before it is replaced; data from a newer version is never overwritten.
- **Naming:** use the 2.0 screen and button names in text (`qa/ui-names.test.cjs` fails on a name that does not exist, in any letter case after a control verb). New in my stack: Test → DOCSIS health, Test → Leakage, Test → Impairments, Job → Safety, Job → Outage.
- SHA-256 of `outputs/Night_Sweep.html`: B5 `49849bb6…78499de` (ede0ae5), B6 `dc796590…41bed` (169c01e), B7 `280e4244…17487` (bd42dfe), B8 `476a3748…4885f` (582c867), item 11 `07a81f2c…2ee86` (d88bec3).
- Tooling notes: Python Playwright (`pip install playwright`) and `NIGHTSWEEP_CHROMIUM` for the rendered suites; guide HTML is rendered with `marked` 18.2.0 and `CODEX_PRIMARY_RUNTIME_NODE_MODULES`; do not `git add` a symlinked `qa/runtime/node_modules` (I removed one I had committed by mistake from unpushed history).

## Next
Review and merge-test Lane A's A1 (#8) and post the review; keep my stack's heads current with `build3` (merge, never rebase; generated files rebuilt); answer any review on #7, #9, #10, #11, #12; after A1 to A4 have merged and the gates are green, B9 (status file, update log, `KNOWN_GAPS.md`, `FINAL_HANDOFF.md`), then the remaining stretch items (item 15 fiber tools is built on its own branch, `claude/b15-fiber`, and goes up next; then items 17 to 20).

## Blocked
Nothing blocks the work. Firecrawl is out of credits until about 23:09 UTC on Nov 11; research continues with Exa, and anything only Firecrawl could verify is marked "not re-verified".

## Questions for Spencer
1. **Where should company settings live?** The DOCSIS windows, the leak repair threshold and detector tolerance, and the safety and outage notes are saved in the browser on each phone, outside jobs and backups. That is simple and private, but a technician who clears browser data loses them, and coworkers each enter their own. A shared company profile would need an import or export design and your decision on sharing company values.
2. **Who can review the safety and outage cards?** Both are written in the app's own words, say they are not a company procedure, and need a supervisor or safety officer to read them (the outage card against the local outage procedure) before coworkers use them. Questions to ask are in `research/build3/SAFETY_SOURCES.md`.
3. **A DOCSIS 3.1 modem that receives only SC-QAM channels:** is its total input limit 33 or 40 dBmV? The specification text can be read either way (`research/build3/DOCSIS_HEALTH_SOURCES.md`); an engineer's answer would settle it.
