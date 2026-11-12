# Lane B log book (Claude)

Only Lane B writes this file. New entries go on top. The status file (`claude-status.md`) says where things stand; this book says what happened and where work stopped.

---

## Entry 1 · November 12, 2026, 03:35 UTC · stopped at Spencer's request

Spencer asked Lane B to stop, save and upload its work, and note where it left off. Nothing was running when this entry was written. Nothing unverified was pushed: the one merge in progress (fiber level, below) was aborted, not committed.

### Where things stand

**`build3` = `f467e5261295449f94dd232ab3995c8a00be25ee`** (merge of PR #23). It holds every Lane A item (A1 Station, A2 Night log, A3 Sweep due, A4 imported sweep grading, the A1 native-input follow-up) and every merged Lane B item (B0 to B8: build registration, reliable gate, CI, paperwork, training sync, DOCSIS health, leakage, safety card, outage card).

| Done condition | State |
| --- | --- |
| D1 Tier 1 (items 1 to 5) | **Met** on `build3`. |
| D2 Tier 2 (items 6 to 10) + item 13 | **Met** on `build3` (6 A2, 7 B6, 8 B8, 9 B7, 10 A3, 13 A4). |
| D3 gate green on the final head, each lane on its own machine | **Lane B: met** on the tree of `build3` `f467e52` (identical tree `d6c4b32` to the PR #23 head `2c040da` I gated): `qa/run-pwa.py` 82 PASS lines / 2,174 checks / 0 failed, exit 0; `build3-layout.test.py` 554; `browser-smoke.py` 352; tree clean; standalone SHA-256 `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de`; hosted CI green on `2c040da`. **Lane A's own run on this exact head: not confirmed by me.** If the close-out PR changes no app file, this stays the final code head. |
| D4 paperwork matches the code | **Not done.** `NightSweep_Project_Status.md` and `CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt` still carry older present-tense counts; `handoff_docs/KNOWN_GAPS.md` needs one consolidated rewrite (Lane A's A1 to A4 sections plus my recommended items below); `TOOLS_AND_SETUP.md`, `AGENTS.md`, `START_HERE_CODEX.md`, `CLAUDE.md` need a currency check. |
| D5 `handoff_docs/FINAL_HANDOFF.md` | **Not started.** |

Lane A pushed `codex/core-closeout-status` (`7442451`), which changes only `handoff_docs/lanes/codex-status.md` ("record merged native core for B9 closeout"). No overlap with Lane B files.

### What Lane B did in this session (Nov 11 evening to Nov 12 03:35 UTC)

- **Reviewed and merged Lane A's work with a merge commit each**, after my own gate on the exact head, phone probes, hosted CI and a COMMENT review at that SHA: #17 A2 (`f50a744`), #21 A3 (`394179c`), #14 A4 (`0e67660`; gate 80 PASS lines / 2,072 checks, layout 554, smoke 352; phone probe 48/48 at 320 to 430 px; deleting each of the three grading CSS rules makes Lane A's rendered test fail, as asked), #23 Station native-input retention (`f467e52`; gate 82 / 2,174, layout 554, smoke 352; probe 69/69 at 320 to 390 px, including imported invalid values surviving plain focus and blur).
- **Closed my PR #22** (my own Station typed-input fix) in favour of #23, which also covers imported invalid raw values; #22 did not.
- **Answered Lane A's later reviews of my stretch PRs:** #13 Important (Files → Open project left the old candidate table on screen: `renderAll()` hook, 20 new real-Chromium checks with the actual file picker) and Minor (own labels, 44 px tags); #15 Minor (unfinished-number reason now directly under its box, with `aria-describedby`; 30 real-Chromium checks); #19 Minor ("relevant excerpts", not "in full"; PR body refreshed); #20 PR body refreshed. Comments are on each PR.
- **Merged `build3` into the whole stretch stack twice** (after A3 and after A4). The stack-top gate after the first round (`2cd06fd`, with `build3` `394179c`): 82 PASS lines / 1,883 checks, layout 1,004, smoke 367, clean, SHA-256 `876ce501…2421`. **No full gate yet after the A4 round.**

### Exactly where I left off: the stretch stack

| PR | Item | Branch | Head now | Contains `build3` | Notes |
| --- | --- | --- | --- | --- | --- |
| #13 | 11 impairments | `claude/b11-impairments` | `920c8a7` | **`f467e52` (final)** | Ready for Lane A's re-review. All node suites pass by exit code, `build3-impairments-real.test.py` 42 checks. Includes the test fix below (`9e6721c`). Hosted CI on `920c8a7` not checked by me. |
| #15 | 15 fiber | `claude/b15-fiber` | `f2f7e02` | `0e67660` | **Hosted CI red** (the pinned-count test below). Needs a merge of `claude/b11-impairments` `920c8a7`. I started it and **aborted it unverified** when told to stop. |
| #16 | 17 high split | `claude/b17-highsplit` | `c639ea8` | `0e67660` | **Hosted CI red** for the same reason. Needs the merge after #15. |
| #18 | 18 why cards | `claude/b18-why-cards` | `ed7f29c` | `0e67660` | Same; CI result not read. |
| #19 | 20 proof of performance | `claude/b20-pop` | `a66d313` | `0e67660` | Same; CI result not read. |
| #20 | 19 study mode | `claude/b19-study` | `b1bd4ba` | `0e67660` | Same; CI result not read. Base is `claude/b20-pop`. |

**Why CI is red on #15 and above:** Lane A's `qa/sweep-grading-ui.test.cjs` pinned the totals of A4's own head (29 screens, 47 features, 15 custom-curves steps, and the guide rows and sentences that state them), so any later feature fails it (`30 !== 29`). On #13 (`9e6721c`) the suite now measures those totals from the app and checks the same sentences against the measured numbers; nothing it checks was relaxed. The guide statements "has N choices", "The custom-curves exercise has N steps" and the README step cell were brought to each level's numbers. This change reaches #15 to #20 only when each level is merged with the one below.

**My mistakes in this session, all fixed and disclosed on the PRs:** a merge helper dropped the sweep-due store from a Limits group one level up (`8817b61`); after the A4 merge, git silently dropped my impairments feature entry, the grading feature-control key and one custom-curves count (repaired in the merge commit; `ensure_feature.py` now checks every level); I read one suite as passing because I searched its output for "fail" instead of checking its exit code (now checked by exit code). I also missed Lane A's #13 re-review of 23:36 UTC for about two hours.

### Next steps, in order

1. **Finish the stack resync** (about 45 minutes): for #15, #16, #18, #19, #20 in that order, `stack_level.sh` with the per-level parameters in `claude-tools/README.md`, then `run_node_suites.sh` and the level's real-browser suite, then commit and push. Run the full gate on the top (`claude/b19-study`) and check hosted CI on all six heads. Comment the new heads and counts on each PR.
2. **B9 close-out** on a branch from `build3` `f467e52` (about 2 to 3 hours): rewrite the build 3 parts of `NightSweep_Project_Status.md` and the update log for what is on `build3` (keep Lane A's own sections), consolidate `KNOWN_GAPS.md`, check `TOOLS_AND_SETUP.md` / `AGENTS.md` / `START_HERE_CODEX.md` / `CLAUDE.md`, write `FINAL_HANDOFF.md` (final `build3` hash, standalone hash above, what each item does, every item's verification, everything untested, questions for the supervisor, Spencer's next steps). Change no app file, so the gate result above stays valid. Draft PR into `build3` for Lane A to review and merge.
3. After that, Lane A reviews and merges the stretch PRs (#13 first; each stacked PR then shows only its own item).

### Recommended items to carry into `KNOWN_GAPS.md` (not blocking, none changes a number or loses data)

- A4: focus drops to the page body after a select change and after Grade; internal identifiers (`lowTargetDbmv`) can reach a reason; a very long Node/asset ID makes grading fail with "Invalid sweep grading text."; plus Lane A's own ZIP-descriptor, empty-chart wording and eager-preview items.
- Station (#23): the same message is announced from the field paragraph and the worksheet status line; toggling `hidden` on a live region is not announced reliably everywhere (no screen-reader test was done).
- A2 and A3: Lane A's recorded deferrals (no remove/undo for a captured entry, a blank Add uses a slot, the synthetic stamp on notes-only logs, multi-line TXT, interval input reads the library on every keystroke, older-backup chronology, the unreproduced 40,746-case claim).
- Lane B: hosted CI once failed `build3-layout` at 768 px (run 2) and I could not reproduce it; R-PHY I22 sections 6.9 and 6.10.1 and some SCTE 280 / 293 sections are cited from Lane A's reading, not mine; no Vecima commissioning checklist (portal-only).

### Questions for Spencer (unchanged, also in `claude-status.md`)

0. The Vecima installation and commissioning guide title and revision your company holds (item 17), or which checks you want built from it.
1. Where company settings should live (each phone's browser today, outside jobs and backups) versus a shared company profile.
2. Who can review the Safety and Outage cards (a supervisor or safety officer; Outage against the local outage procedure) before coworkers use them.
3. A DOCSIS 3.1 modem receiving only SC-QAM channels: total input limit 33 or 40 dBmV.

### Not done by anyone in this session

APK build or signing, emulator, physical phone, Safari or WebView, screen reader, meter, field. No version, storage key, package ID or job format change.

### Estimated time remaining (as of 03:35 UTC)

- Lane B work: stack resync and its gate about 1 hour; B9 close-out about 2 to 3 hours.
- Lane A review and merge of the close-out PR: about 1 to 2 hours at their recent pace.
- So D1 to D5 complete in roughly **3 to 5 hours** of wall time after work resumes. Merging the six stretch PRs depends on Lane A's reviews and is extra.
