# Lane B status (Claude)

Only Lane B edits this file. Updated November 12, 2026, 03:35 UTC on branch `claude/logbook`, when Spencer asked Lane B to stop. What happened and exactly where work stopped is in `handoff_docs/lanes/claude-logbook.md`; the helper scripts are in `handoff_docs/lanes/claude-tools/`. This file is rewritten whole in each Lane B pull request: if two of them conflict here, take the newer one.

**`build3` = `f467e52`.** D1 and D2 are met. My D3 gate on that tree: 82 PASS lines / 2,174 checks / 0 failed; layout 554; smoke 352; clean; standalone SHA-256 `b1591b4d…e4de`. D4 and D5 (B9) are not done yet.

| Item | Branch | Pull request | Head commit | State | Last gate (date, own counts) |
| --- | --- | --- | --- | --- | --- |
| B0 registration refactor | claude/b0-build-registration | [#3](https://github.com/Goodst3r/Carpe-Noctum/pull/3) | 320854c | **merged** | |
| B1 reliable test gate | claude/b1-reliable-gate | [#4](https://github.com/Goodst3r/Carpe-Noctum/pull/4) | 8b71edd | **merged** | |
| B2 CI | claude/b2-ci | [#11](https://github.com/Goodst3r/Carpe-Noctum/pull/11) | e77ef24 | **merged** (14bfc06); one hosted 768 px layout failure (run 2) stays unexplained | |
| B3 paperwork | claude/b3-paperwork | [#5](https://github.com/Goodst3r/Carpe-Noctum/pull/5) | 5544651 | **merged** | |
| B4 training and guide sync | claude/b4-training-sync | [#6](https://github.com/Goodst3r/Carpe-Noctum/pull/6) | 5a370c1 | **merged** | |
| B5 item 5 DOCSIS health | claude/b5-docsis-health | [#7](https://github.com/Goodst3r/Carpe-Noctum/pull/7) | 1f239b6 | **merged** (bc69bb4) | |
| B6 item 7 leakage tools | claude/b6-leakage | [#9](https://github.com/Goodst3r/Carpe-Noctum/pull/9) | 418e086 | **merged** (5588a49) | |
| B7 item 9 pre-work safety | claude/b7-safety | [#10](https://github.com/Goodst3r/Carpe-Noctum/pull/10) | 1c9012b | **merged** (ccf2f5e); **supervisor or safety officer review needed before coworkers use it** | |
| B8 item 8 outage first response | claude/b8-outage | [#12](https://github.com/Goodst3r/Carpe-Noctum/pull/12) | 77b9c2b | **merged** (3cfb9c2); **supervisor review against the local outage procedure needed before coworkers use it** | |
| B10 item 11 impairments | claude/b11-impairments | [#13](https://github.com/Goodst3r/Carpe-Noctum/pull/13) draft | 920c8a7 | open; contains final `build3`; all Lane A findings answered; ready for re-review | node suites by exit code all pass; real-browser 42; no full gate on this head |
| B10 item 15 fiber | claude/b15-fiber | [#15](https://github.com/Goodst3r/Carpe-Noctum/pull/15) draft | f2f7e02 | open; **hosted CI red** (pinned-count test, fixed on #13); needs merge of #13's head | last full gate: stack top 2cd06fd (pre-A4) 82 / 1,883, layout 1,004, smoke 367 |
| B10 item 17 high split | claude/b17-highsplit | [#16](https://github.com/Goodst3r/Carpe-Noctum/pull/16) draft | c639ea8 | open; **hosted CI red**, same cause; needs merge after #15 | as above |
| B10 item 18 why cards | claude/b18-why-cards | [#18](https://github.com/Goodst3r/Carpe-Noctum/pull/18) draft | ed7f29c | open; needs merge after #16 | as above |
| B10 item 20 proof of performance | claude/b20-pop | [#19](https://github.com/Goodst3r/Carpe-Noctum/pull/19) draft | a66d313 | open; needs merge after #18 | as above |
| B10 item 19 study mode | claude/b19-study | [#20](https://github.com/Goodst3r/Carpe-Noctum/pull/20) draft (base claude/b20-pop) | b1bd4ba | open; needs merge after #19 | as above |
| Station typed-input fix | claude/station-typed-input | [#22](https://github.com/Goodst3r/Carpe-Noctum/pull/22) | 34b831a | **closed** in favour of Lane A's #23 | |
| B9 D4/D5 close-out and FINAL_HANDOFF.md | | | | **not started**; Lane A's queue is merged, so it can start | |

Lane A pull requests I reviewed and merged: #8 A1 (21ed711), #17 A2 (f50a744), #21 A3 (394179c), #14 A4 (0e67660), #23 Station follow-up (f467e52). Reviews are on each pull request.

## For Lane A

- Please re-review #13 at `920c8a7`. It changes your `qa/sweep-grading-ui.test.cjs` so it measures the screen, feature and custom-curves totals and the row numbers from the app instead of pinning 29 / 47 / 15; the same sentences are still required, with the measured numbers. Without that change every later feature fails the suite.
- #15 to #20 will be merged up from #13 next; until then their hosted CI is red for that reason only.

## Next

See "Next steps" in `claude-logbook.md`: finish the stack resync and gate the top; then B9 (status file, update log, `KNOWN_GAPS.md`, `FINAL_HANDOFF.md`) as a docs-only draft PR.

## Blocked

Nothing. Work is stopped at Spencer's request.

## Questions for Spencer

0. **Item 17:** Vecima's EN9000 and RFAM/RPD installation and commissioning guides are behind its customer portal, so the screen describes only what the CableLabs specifications say and invents no steps. Which guide title and revision does your company hold, or which checks do you want built from it?
1. **Where should company settings live?** The DOCSIS windows, the leak repair threshold and detector tolerance, and the safety and outage notes are saved in each phone's browser, outside jobs and backups. A shared company profile would need an import or export design and your decision on sharing company values.
2. **Who can review the Safety and Outage cards** (a supervisor or safety officer; the outage card against the local outage procedure) before coworkers use them? Questions to ask are in `research/build3/SAFETY_SOURCES.md` and `OUTAGE_SOURCES.md`.
3. **A DOCSIS 3.1 modem that receives only SC-QAM channels:** is its total input limit 33 or 40 dBmV? (`research/build3/DOCSIS_HEALTH_SOURCES.md`)
