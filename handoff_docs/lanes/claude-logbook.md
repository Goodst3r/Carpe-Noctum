# Lane B log book (Claude)

Only Lane B writes this file. New entries go on top. The status file (`claude-status.md`) says where things stand; this book says what happened and where work stopped.

**This book and the matching status file live on branch `claude/logbook` (no pull request yet). `build3` still carries the Nov 11 `claude-status.md`. The first thing to do on resuming: merge `origin/claude/logbook` into the B9 branch (step 1 below).**

---

## Entry 1 · November 12, 2026, 03:35 UTC (corrected 04:05 UTC) · stopped at Spencer's request

Spencer asked Lane B to stop, save and upload its work, and note where it left off. Nothing was running when this entry was written. Nothing unverified was pushed: the one merge in progress (fiber level) was aborted, not committed. Before pushing the correction, four read-only checkers compared this entry with git, GitHub and the gate logs; their findings are folded in below.

### Where things stand

**`build3` = `f467e5261295449f94dd232ab3995c8a00be25ee`** (merge of PR #23). It holds every Lane A item (A1 Station, A2 Night log, A3 Sweep due, A4 imported sweep grading, the A1 native-input follow-up) and every merged Lane B item (B0 to B8).

| Done condition | State |
| --- | --- |
| D1 Tier 1 (items 1 to 5) | **Met** on `build3`. |
| D2 Tier 2 (items 6 to 10) + item 13 | **Met** on `build3` (6 A2, 7 B6, 8 B8, 9 B7, 10 A3, 13 A4). |
| D3 gate green on the **final** head, each lane on its own machine | **Pending.** My gate on the tree of `build3` `f467e52` is green (below), but B9 must edit and re-render the guides (Lane A's audit lists README, Training Coverage, DEVELOPER_BUILD and START_HERE edits), and `build-pwa.py` copies the rendered guide into `dist/`, so the final head will be the one after B9. **Both lanes must gate that head.** Lane A's `codex-status.md` at `7442451` says it has made no run at `f467e52`. |
| D4 paperwork matches the code | **Not done.** Work list: `handoff_docs/reviews/codex-d4-readiness-audit.md` (on `build3`), plus the items in this entry. |
| D5 `handoff_docs/FINAL_HANDOFF.md` | **Not started.** |

**Evidence for my `f467e52` gate** (raw logs `/tmp/a1r2-*.log` in this container, which will be lost; review on PR #23, review 5868370766): head `2c040da` (same tree `d6c4b32` as `build3` `f467e52`); `qa/run-pwa.py` 82 PASS lines, 0 FAIL lines, 2,174 checks, `run-pwa exit 0`, 873.3 s suite time (other work was running at the same time); `Build3 layout: 554 checks passed`, `layout exit 0`; `Chromium rendered checks: 352 passed`, `smoke exit 0`; `git status` clean; standalone SHA-256 `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de`. Hosted CI on `2c040da`: success (run 57).

**Lane A's requests that set the order** (comment on #13 at 03:25 UTC, and `codex-status.md` on `codex/core-closeout-status` `7442451`, which has no pull request): Lane B should do the B9 / D4 close-out from `f467e52` first and merge that one-file status branch into B9; **no full stretch merge before core D3 to D5** (this also matches `PARALLEL_TASKS.md`, which puts stretch work after D1 to D5).

### What Lane B did in this session (Nov 11 evening to Nov 12 03:35 UTC)

- **Reviewed and merged Lane A's work with a merge commit each**, after my own gate on the exact head, phone probes, hosted CI and a COMMENT review at that SHA: #17 A2 (`f50a744`), #21 A3 (`394179c`), #14 A4 (`0e67660`; gate on `d95f08b`: 80 PASS lines / 0 FAIL / 2,072 checks, exit 0, layout 554, smoke 352, clean, SHA-256 `8caf8ff1…cb24`; phone probe 48/48 at 320 to 430 px; deleting each of the three grading CSS rules makes Lane A's rendered test fail, as asked), #23 Station native-input retention (`f467e52`; gate above; probe 69/69 at 320 to 390 px, including imported invalid values surviving plain focus and blur). The probe counts come from the console; their output was not saved to a file. The probe scripts are in `claude-tools/`.
- **Closed my PR #22** (my Station typed-input fix) in favour of #23, which also covers imported invalid raw values; #22 did not.
- **Answered Lane A's earlier reviews of my stretch PRs:** #13 (Files → Open project left the old candidate table; own labels and 44 px tags), #15 (unfinished-number reason directly under its box), #19 ("relevant excerpts"; PR body), #20 (PR body). Comments are on each PR.
- **Merged `build3` into the whole stretch stack twice** (after A3 and after A4). The stack-top gate after the first round (`2cd06fd`, with `build3` `394179c`; logs `/tmp/b19r3-*.log`): 82 PASS lines / 0 FAIL / 1,883 checks, exit 0, layout 1,004, smoke 367, clean, SHA-256 `876ce501…2421`. **No full gate yet after the A4 round.**

### Exactly where I left off: the stretch stack (all six are open drafts)

| PR | Item | Branch | Head | Contains `build3` | Hosted CI on that head | Open review items |
| --- | --- | --- | --- | --- | --- | --- |
| #13 | 11 impairments | `claude/b11-impairments` | `920c8a7` | `f467e52` | **green** (run 59) | **Changes required** (Lane A review 5868433524 at `9e6721c`, 03:18 UTC, which I had not read when I stopped): the rendered main guide `docs/NightSweep_1.8_Alpha_README.html` and `dist/guide.html` still say 29 task screens / 47 feature choices while the Markdown says 30 / 48 (my helpers never render the main guide); stale sentences remain in `night-sweep/README.md` ("custom curves 15") and `docs/NightSweep_1.8_Training_Coverage.md` ("fifteen steps", "47 choices", "custom curves **15**"); the PR body is stale (still says "Based on #12 … d88bec3"). |
| #15 | 15 fiber | `claude/b15-fiber` | `f2f7e02` | `0e67660` | **red** (run 53; only the grading UI suite, `31 !== 29`) | Needs the #13 fixes merged up. I started that merge and **aborted it unverified** when told to stop. |
| #16 | 17 high split | `claude/b17-highsplit` | `c639ea8` | `0e67660` | **red** (run 54, `32 !== 29`) | Same. |
| #18 | 18 why cards | `claude/b18-why-cards` | `ed7f29c` | `0e67660` | **red** (run 55, `33 !== 29`) | Same. |
| #19 | 20 proof of performance | `claude/b20-pop` | `a66d313` | `0e67660` | **red** (run 56, `34 !== 29`) | Same, plus Lane A Minor (review 5867867045 at `903c2b7`): `research/build3/POP_SOURCES.md:29` should say "source dialog and registry" instead of "the card and the registry row". |
| #20 | 19 study mode | `claude/b19-study` | `b1bd4ba` | `0e67660` | **none: the QA gate runs only on pull requests into `build3`, and #20's base is `claude/b20-pop`.** Retarget it to `build3` after #19 merges (or ask before starting a manual run). | Same. |

Every stack head above #13 also has the main-guide mismatch (rendered HTML 29 / 47, Markdown 31 / 49 on #15 up to 35 / 53 on #20).

**Why CI is red on #15 to #19:** Lane A's `qa/sweep-grading-ui.test.cjs` pinned A4's own totals (29 screens, 47 features, 15 custom-curves steps and the guide rows and sentences that state them), so any later feature fails it. On #13 (`9e6721c`) the suite now measures those totals from the app and still requires the same sentences, with the measured numbers. That change reaches #15 and above only when each is merged with the one below.

**My mistakes in this session, all disclosed on the PRs:** a merge helper dropped the sweep-due store from a Limits group one level up (fixed, `8817b61`); after the A4 merge, git silently dropped my impairments feature entry, the grading feature-control key and one custom-curves count (repaired; `ensure_feature.py` now checks every level); I read one suite as passing because I searched its output for "fail" instead of checking its exit code (now checked by exit code); I missed Lane A's #13 re-review of 23:36 UTC for about two hours, and the 03:18 review and 03:25 comment until the fact-check found them; my helpers never render the main guide, so its HTML falls behind the Markdown.

### Next steps, in order

1. **B9 close-out first** (Lane A's request and the plan): in `$S`, remove the stale local `claude/b9-closeout` (at `394179c`, never pushed) and recreate it from `origin/build3` (`f467e52`); merge `origin/claude/logbook` and `origin/codex/core-closeout-status` (`7442451`) into it. Work from `handoff_docs/reviews/codex-d4-readiness-audit.md`: the README tool finder and counts, the Training Coverage table (Night log missing), `DEVELOPER_BUILD.md`, `START_HERE_CODEX.md`; then render **all three** guides (`node docs/render_readme.cjs` with no arguments for the main README, plus the Functions and Training Coverage renders; see `docs/DEVELOPER_BUILD.md`) and run `python3 night-sweep/build.py` and `python3 build-pwa.py`. Rewrite the build 3 parts of `NightSweep_Project_Status.md` and the update log (keep Lane A's own sections), consolidate `KNOWN_GAPS.md`, check `TOOLS_AND_SETUP.md`, `AGENTS.md`, `CLAUDE.md`, and write `FINAL_HANDOFF.md`. Draft PR into `build3`; Lane A reviews and merges.
2. **D3 on the post-B9 head:** my full gate on that exact head, and ask Lane A for theirs. Record both in `FINAL_HANDOFF.md` (a docs-only follow-up if needed).
3. **Then the stretch stack:** fix #13 per review 5868433524 (render the main guide, fix the sentences, refresh the PR body); merge up #15, #16, #18, #19, #20 with the per-level parameters in `claude-tools/README.md` (now also run the main-guide render at every level, and check `claude-status.md` after each level merge: keep the B9 / log-book version); fix the #19 POP_SOURCES line; full gate on the top; check hosted CI on #13 to #19; retarget #20 to `build3` when #19 is merged. Only #13 (`build3-impairments-real.test.py`) and #15 (`build3-fiber-real.test.py`) have their own real-browser suites; the levels above inherit those two.

### Recommended items to carry into `KNOWN_GAPS.md` (not blocking, none changes a number or loses data)

- A4: focus drops to the page body after a select change and after Grade; internal identifiers (`lowTargetDbmv`) can reach a reason; a very long Node/asset ID makes grading fail with "Invalid sweep grading text."; plus Lane A's own ZIP-descriptor, empty-chart wording and eager-preview items.
- Station (#23): the same message is announced from the field paragraph and the worksheet status line; toggling `hidden` on a live region is not announced reliably everywhere (no screen-reader test was done).
- A2 and A3: Lane A's recorded deferrals (no remove or undo for a captured entry, a blank Add uses a slot, the synthetic stamp on notes-only logs, multi-line TXT, the interval input reads the library on every keystroke, older-backup chronology, the unreproduced 40,746-case claim).
- Lane B: hosted CI once failed `build3-layout` at 768 px (run 2) and I could not reproduce it; R-PHY I22 sections 6.9 and 6.10.1 and some SCTE 280 / 293 sections are cited from Lane A's reading, not mine; no Vecima commissioning checklist (portal-only).
- `FINAL_HANDOFF.md` must mark the **Safety (item 9), Outage (item 8) and Leakage (item 7)** cards "supervisor review needed" (`PARALLEL_TASKS.md`, "Blocked or needing a person").

### Questions for Spencer (also in `claude-status.md`)

0. The Vecima installation and commissioning guide title and revision your company holds (item 17), or which checks you want built from it.
1. Where company settings should live (each phone's browser today, outside jobs and backups) versus a shared company profile.
2. Who can review the Safety, Outage and Leakage cards (a supervisor or safety officer; Outage against the local outage procedure) before coworkers use them.
3. A DOCSIS 3.1 modem receiving only SC-QAM channels: total input limit 33 or 40 dBmV.

### Not done by anyone in this session

APK build or signing, emulator, physical phone, Safari or WebView, screen reader, meter, field. No version, storage key, package ID or job format change.

### Estimated time remaining (as of 04:05 UTC, once work resumes)

- **D1 to D5 (the marathon's done line):** B9 with the audit's guide edits, re-render and rebuild, about 2.5 to 3.5 hours; Lane A's review and merge, about 1 to 2 hours; both lanes' gates on the final head, about 15 to 30 minutes each (Lane A's last full run took about 12 minutes; mine take 10 to 15 minutes). **About 4 to 6 hours of wall time.**
- **Stretch PRs (after done):** #13 fixes and the resync of #15 to #20 with the main-guide render, about 1.5 to 2 hours, plus a stack-top gate; then Lane A's re-reviews and merges at their pace (several hours for six PRs).
