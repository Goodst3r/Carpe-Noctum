# Marathon plan: two assistants, two lanes, one integration branch

November 11, 2026 · written by Claude (Opus 5.5 planning session) for Spencer · supersedes the first version of this file

Two assistants build Carpe Noctum at the same time until the work in "Definition of done" is finished:

| | **Lane A** | **Lane B** |
| --- | --- | --- |
| Assistant | ChatGPT, 6.1 Sol Ultra | Claude, Sonnet 5.5 Ultracode |
| Kind of work | The job-record chain: station view, night log, sweep-due tracker, power supply records | Test gate and repo paperwork first, then standalone reference and compliance modules |
| Status file (only this lane writes it) | `handoff_docs/lanes/codex-status.md` | `handoff_docs/lanes/claude-status.md` |
| Branch names | `codex/<item>` | `claude/<item>` |
| Reviewer of its pull requests | Lane B | Lane A |

**Why this split.** I have no reliable information on how Sol Ultra or Sonnet 5.5 Ultracode compare, so the split follows file overlap, not model strengths. Lane A owns everything that changes what a saved job stores, because those items build on each other. Lane B owns the items that are mostly self-contained reference and calculator screens, plus the test gate that both lanes depend on. If you know one model suits a different job better, swap whole items between queues and edit this file in one commit. Keep every item in exactly one queue.

Priorities, sources and acceptance tests for every item are in `docs/BUILD_LIST.md` (the item numbers below are its numbers). `docs/ROADMAP.md` is the older roadmap. Both are copies of pull requests #2 and #1 and merge cleanly with them.

## Where things stand

**Integration branch: `build3`.** It holds the build 3 work from `ccr-7abea525-rljsni` (build list items 1, 2 and 4) plus these docs. `main` stays at 2.0 Alpha build 2 until Spencer accepts build 3.

**Base check on `c55a67c`, Lane A's own run (Nov 11).** Install and both builds passed; rendered checks passed (55 inside the runner, 141 build 3 layout, 328 browser smoke). `qa/run-pwa.py` hit its 150 s per-suite limit in `build2-reliability.test.cjs`, so only 10 suites (107 checks) finished. Lane A made no changes. Its receipt wasn't on GitHub when this was written.

**Claude's reproduction on the same revision** (2 CPUs, 8 GB):

| Check | Command | Result |
| --- | --- | --- |
| Install and builds | `npm ci --prefix qa/runtime --no-audit --no-fund`, `python3 night-sweep/build.py`, `python3 build-pwa.py` | Passed |
| Automated suites | `NIGHTSWEEP_CHROMIUM=<chromium> python3 qa/run-pwa.py` | **61 of 61 suites, 1,109 checks passed** in 278 s; generated build unchanged; exit 0 |
| The suite that timed out | `node qa/build2-reliability.test.cjs`, alone, with and without `NIGHTSWEEP_RELEASE_TEST=1` | 10 of 10 passed in 19.5 s and 17.6 s |
| Build 3 rendered layout | `python3 qa/build3-layout.test.py` | 141 rendered Chromium checks passed |
| Rendered smoke | `python3 qa/browser-smoke.py` | 328 rendered Chromium checks passed |

Standalone `outputs/Night_Sweep.html` SHA-256 `89b27de366cc25e3939cc163ac221bafec1a12f0ea24fee197d92892d4ae6aa5`, same as the build 3 session reported. Rendered checks are desktop Chromium at phone sizes. No emulator, phone or field test has been done for any 2.0 build.

**Diagnosis of the timeout.** The suite isn't broken: it boots the whole app in jsdom ten times and pushes 12 MiB of evidence through it, which takes about 18 s here. Lane A's sandbox ran about 50 times slower, and its own command limit then stopped the runner. Lane B's first task makes the limit configurable. Until it lands, Lane A runs the gate with an outer limit of at least 60 minutes (or in the background) and, if that one suite still times out, runs it alone and records its time.

## Definition of done

The marathon ends when all five are true. Then both lanes stop.

- **D1. Tier 1 complete on `build3`:** items 1 to 5 (1, 2 and 4 are already there; 3 is Lane A's; 5 is Lane B's).
- **D2. Tier 2 complete on `build3`, plus imported sweep grading:** items 6 to 10 and item 13. Spencer confirmed on Nov 11 that importing meter files he exported himself is acceptable, so item 13 is no longer blocked and counts toward done.
- **D3. Gate green on `build3`'s final head:** `python3 qa/run-pwa.py` passes every suite, `build3-layout.test.py` and `browser-smoke.py` pass, the build output is unchanged during tests, `git status` is clean after a full run, and each lane has rerun it on its own machine (counts from that run only).
- **D4. Paperwork matches the code:** guides and practice training use the 2.0 screen names and cover every new screen; `NightSweep_Project_Status.md` and the build 3 update log describe what's actually on the branch; `AGENTS.md`, `START_HERE_CODEX.md`, `CLAUDE.md`, `handoff_docs/KNOWN_GAPS.md` and `handoff_docs/TOOLS_AND_SETUP.md` exist and are current.
- **D5. Final handoff written:** Lane B writes `handoff_docs/FINAL_HANDOFF.md` from both status files: final `build3` hash, standalone HTML hash, what each item does, every item's verification, everything untested, every open question for Spencer's supervisor, and exactly what Spencer must do next.

**After done: stretch queue.** If D1 to D5 are met and Spencer hasn't said stop, each lane continues with its Tier 3 and later items, in order, using the same loop. Stop when its stretch queue is empty or Spencer says stop. Each stretch item merges on its own, so `build3` stays releasable after every merge. Item 13 is not in the stretch queue: it is part of done.

## Rules for both lanes

1. **One writer per file.** Stay inside your lane's files for the item you're building. Shared files are listed below with their rules. If you need a file the other lane owns, put the request in your status file and carry on with something else.
2. **Never touch:** `main`, `ccr-7abea525-rljsni`, the other lane's branches, tags, repository settings or visibility, or anything outside `Goodst3r/Carpe-Noctum`. No force-push, no history rewriting, no branch deletion. Direct pushes to `build3` are only for merging reviewed pull requests (rule 6) and for edits to the planning docs in `handoff_docs/` that Spencer or the planning session asked for.
3. **Branch from the latest `build3`** for each item. Run `git fetch origin && git rebase origin/build3` right before you open the pull request, and again before merging. Keep pull requests small enough to land within hours, not days: the longer a branch lives, the more it conflicts.
4. **Generated files** (`outputs/Night_Sweep.html`, `dist/**`) conflict on nearly every merge. Never hand-merge them. On any conflict there, take either side, run `python3 night-sweep/build.py` and `python3 build-pwa.py`, and commit the result. `qa/run-pwa.py` checks that a rebuild matches what's committed.
5. **Test churn.** Some tests rewrite tracked evidence files (`release/*.json`, `research/alpha18/*`, `research/build2/*`) with new IDs and timings on every run. Don't commit that. Run `git checkout -- release research` before committing unless you meant to change those files. Lane B is removing the churn (B1).
6. **Review and merge.** Every pull request into `build3` is a draft until the other lane has reviewed the same head commit. The reviewer, not the author, merges: after the review approves, the gate is green at that head, and the branch is rebased on `build3`, the reviewer merges with a merge commit (no squash, so history is kept) and notes it in its status file. You may not merge your own pull request. If a review sits unanswered for more than one full cycle of your own work, say so in your status file and keep going on your next item; don't merge it yourself.
7. **No version or release changes.** The version stays 2.0 Alpha build 3, Android code 27. Nobody builds or signs an APK, touches the signing key, publishes, deploys or changes storage keys, the package ID or the job file format. Saved-job changes are additive only: old jobs and backups open unchanged and round-trip.
8. **Product rules** (from `AGENTS.md` and the build list; they apply to every item):
   - Meter files: only synthetic fixtures go in the repo (CSV or JSON as applicable to the documented export). Real exports can carry employer, customer or plant identifiers and are never committed or pasted into reports.
   - Offline only. No live modem, CMTS or amp polling, no XPERTrak or StrataSync sync, no map editing, no accounts, cloud, telemetry or AI. No OCR. No customer names, addresses or account numbers.
   - Every limit and target carries one label (spec, expert, company, unknown) and is registered in `night-sweep/thresholds.js` with source, revision, page or section, units and conditions. Company values start unknown; blank never means zero.
   - 42/54 MHz (GS7K, GainMaker) and 204/258 MHz (Vecima, AOI) stay separate. 31 dBmV @ 54 MHz, 43 dBmV @ 860 MHz and the 38 dBmV return TX are company values and stay editable. OEM AGC, ACI DSIM and manual/thermal procedures stay separate. No invented pilot codes or borrowed procedures. UBT stays out of new selections.
   - New math gets an independent reference calculation computed outside the app and a regression test against the app's real output.
   - SCTE and NCTI material is paraphrased and cited by document number and year. Never copy text, tables, figures or exam questions. FCC rules may be quoted.
   - Phone-first dark field UI, large controls, plain JavaScript, HTML and CSS only.
9. **Spending and credits.** Use existing plans only. Research credits (Firecrawl ran out once already) are not a reason to stop: use what's available, mark unverified items "not re-verified", and carry on. Ask Spencer before any purchase or upgrade.
10. **Honest reports.** Every pull request and status entry lists: starting and ending commit, files changed and why, sources, the exact commands you ran and your own results, and what's untested. Keep automated tests, rendered browser checks, emulator, phone and field results separate. Never copy another run's counts. Don't write "passed" for something you didn't run.

### Shared files and how to share them

| File | Rule |
| --- | --- |
| `night-sweep/build.py` (module token list) | Lane B's task B0 puts one token per line, in the same order, with no change to the built output. Add your token on its own line. If you hit a conflict from the old one-line list, re-add your token in the new format. |
| `night-sweep/shell.html` | Add your placeholder and panel next to the existing ones for your feature. Keep both lanes' additions on a conflict. |
| `night-sweep/workflow.js` (tabs, `visibleIds`, descriptions) | Add your entries without reordering existing ones. Keep both lanes' additions on a conflict. |
| `night-sweep/thresholds.js` | Add your rows together as one group. Don't reorder or reformat other rows. |
| `night-sweep/training.js` and the 1.8-named guides in `docs/` | Add your practice step or guide section for your feature only. Wording fixes to old text belong to task B2, nobody else's. After editing a guide, render it with `docs/render_readme.cjs` and rebuild (see `docs/DEVELOPER_BUILD.md`). |
| `qa/run-pwa.py` | Add your suites inside the `suites=[...]` list, after the last build 3 entry. Below the list is Lane B's. |
| `NightSweep_Project_Status.md`, `CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt` | Edited only in the pull request that adds the feature, in a section for that feature. Lane B rewrites them for D4 at the end. |

## The loop (repeat until done)

1. **Resume.** Read `handoff_docs/PARALLEL_TASKS.md`, your own status file and the other lane's status file. Run `git fetch origin` and look at open pull requests and recent commits on `build3`. Never rely on memory of an earlier chat; the repo is the record.
2. **Pick** the first unfinished item in your queue whose dependencies are merged. If it's blocked on a person, record the question and take the next one.
3. **Branch** from the latest `build3`: `<lane-prefix>/<item-slug>`.
4. **Build it in small commits** with tests, practice step and guide text. Re-check the product rules in rule 8.
5. **Run the gate** (`npm ci --prefix qa/runtime --no-audit --no-fund`, `python3 qa/run-pwa.py`, `python3 qa/build3-layout.test.py`, `python3 qa/browser-smoke.py`, plus your new suites). Allow at least 60 minutes for it, or run it in the background. Set `NIGHTSWEEP_CHROMIUM` to your Chromium if needed.
6. **Open a draft pull request into `build3`** with the report from rule 10. Update your status file (item, branch, pull request, head commit, state, next step, open questions).
7. **Review.** If the other lane has an open pull request without a review, review the oldest one now, before starting your next item. Use the checklist below.
8. **Answer reviews** on your own pull requests with fixes in new commits. Don't resolve a finding without a fix or a written reason.
9. **Merge** pull requests you reviewed once they pass (rule 6). Then go to step 1.

**Stop and wait for Spencer only for:** a hard block you can't work around (no push access, a failing gate you can't explain, a conflict you can't resolve without overriding the other lane's work), or a decision that can't be undone and could go either way. For anything else, write the question in your status file under "Questions for Spencer", skip to the next item and continue.

### Review checklist (use on the same head commit the author named)

1. Rerun the gate yourself. Report your counts, not the author's. `git status` clean afterward; generated files unchanged by the run.
2. Math: derive at least the changed formulas independently of the author's reference script. Check units, signs, edge inputs and bounds.
3. Labels and sources: every new value is registered with a label and a source you can open. Company values start unknown.
4. Plants: 42/54 and 204/258 stay separate; the 31/43/38 values aren't hard-coded as specs.
5. Job format: old jobs and backups open unchanged; a backup round-trip gives identical results. No storage-key change.
6. UI: phone width 320 to 430 px in the dark theme; large controls; errors say why.
7. Training and guides: a practice step exists, uses the 2.0 screen names and matches the screen.
8. Scope: only that lane's files changed (plus the shared-file rules); version identity untouched; no secrets or private identifiers.
9. Write findings as a pull request review, or `handoff_docs/reviews/<branch>-review.md` on your own branch, with file, line, severity and evidence.

## Lane A queue (ChatGPT, 6.1 Sol Ultra)

| # | Item | Depends on | Notes |
| --- | --- | --- | --- |
| A1 | **Item 3: station view and unity-gain worksheet** (branch `codex/station-view`, already started) | build 3 solver (merged) | Spec in the next section. First, push your step 1 receipt as `handoff_docs/lanes/codex-base-check.md` and rebase onto `build3`. |
| A2 | **Item 6: night log and shift handoff** | A1 | Pulls before and after levels from the station view. Plain-text handoff note and CSV export. No customer identifiers. |
| A3 | **Item 10: sweep-due tracker** | A1 | Reads last sweep and balance dates from saved jobs. Interval is user-set, default unknown. |
| A4 | **Item 13: imported sweep grading** (part of done, approved by Spencer Nov 11) | existing evidence parser; A1 for job context | Grade a VIAVI sweep export already attached to a job against an editable profile: peak-to-valley, low and high level against target, tilt. **Spencer clarified Nov 11 that his meter exports JSON, so JSON is the required input instead of the originally proposed CSV.** Support the actual documented or supplied structure, with no inferred vendor schema; no OCR or screenshot readings. The old n/10 + x rule is historical guidance only; company limits start unknown. Synthetic fixtures with 1.0, 2.5 and 4.0 dB peak-to-valley must grade correctly at a 3 dB limit. Original bytes stay untouched. Details below. |
| A5 | **Stretch, item 14: power supply PM record, battery trends and span voltage drop** | A1 | Uses the cable loop resistance in the catalog and minimum input voltage from each active's manual. |
| A6 | **Stretch, item 16: construction and connector checklist in the done check** | A1 | Torque and pin length only from the manufacturer manual in the catalog. |
| A7 | **Stretch, item 12: return path and high-split toolkit** | A1 | Band overlay, ingress log, injection worksheet, noise-funneling calculator. Verify the funneling math against a primary source first. |

### A1 detail: station view

One screen per active on the route:

- **Forward:** targets at both pilots, the tech's two readings, level and tilt error, and pad/EQ advice from `night-sweep/alignment.js`. Reuse the solver; don't copy its math.
- **Return unity-gain worksheet:** injection level, level at the receiver, return pad and EQ, and the difference from the company target. Injection is the reference-point level plus insertion loss (SCTE 180 2025 section 13.2.2.2). Sources and the values to keep apart are in `research/build3/STATION_VIEW_SOURCES.md`.
- **Done check** that records "balanced" and "swept" as separate states, so a balance is never recorded as a sweep.
- The 38 dBmV return TX, the SCU-1800's 0 dBmV input, the CMTS 0 dBmV set point and the Quantum18 9 dBmV input are four different values. Company targets and tolerances start unknown. Don't invent a return tolerance (no source gives one).
- Quantum18 aligns electronically: show the note, no part picks.
- Acceptance: a practice job gives identical station results before and after a backup and restore; legacy UBT jobs open read-only.
- Tests: hand-worked cases checked against independent arithmetic, a legacy job and backup round-trip, a rendered layout check at 320 to 430 px.

### A4 detail: imported sweep grading (item 13)

- Spencer's go-ahead covers files he exported himself from his own meter. It does not cover pulling data from company systems, and nothing here may log into or sync with one.
- **Input clarification from Spencer, Nov 11:** his VIAVI produces JSON. Implement its actual sweep JSON structure rather than assuming CSV or inventing field names, units, trace grouping or measurement planes. A small example with invented values and no real identifiers has been requested; native schema compatibility remains unverified until that structure is available. The file can still be retained as an original attachment while its contents are unrecognized, with a reason and no grade.
- **Real meter files are never committed.** They can carry employer, customer or plant identifiers. Tests and fixtures use synthetic JSON matching the verified export structure, with invented labels. Existing supported synthetic CSV interchange tests remain valid for their stated scope.
- Parse with the existing evidence code (`night-sweep/evidence.js`); keep the original bytes and checksum exactly as attached. Values that can't be read with certainty stay unknown. A file that doesn't parse produces a reason, never a grade.
- The grading profile (peak-to-valley limit, level targets, tilt limit) is user-entered and registered in `night-sweep/thresholds.js` as company values that start unknown. Don't ship defaults. Separate 42/54 and 204/258 profiles.
- Output is a record on the job (additive job format) next to the attached file, labeled as the tech's own grading aid, not an official acceptance.

## Lane B queue (Claude, Sonnet 5.5 Ultracode)

Phase 0 comes first, in this order, and must not change app behavior: the rebuilt `outputs/` and `dist/` must match `build3` byte for byte (check the hashes).

| # | Task | Notes |
| --- | --- | --- |
| B0 | **Registration refactor.** One token per line in `night-sweep/build.py`, same order, same output. | Do this first and merge it fast (target: within the hour). Tell Lane A in your status file. |
| B1 | **Reliable test gate.** `NIGHTSWEEP_SUITE_TIMEOUT` (seconds, default 150); per-suite run times in the console and `qa/pwa-test-results.json`; tests write evidence files to an untracked folder unless `NIGHTSWEEP_WRITE_EVIDENCE=1`, so a full run leaves `git status` clean; `qa/alpha18-release.test.py` fails with a clear "receipts not present" message when `build-readiness.json` says an APK was built but its receipts aren't in the checkout. | Files: below the `suites` list in `qa/run-pwa.py`, the evidence-writing lines in the tests that write tracked files, `qa/alpha18-release.test.py`. |
| B2 | **CI.** A GitHub Actions workflow that runs the gate on pull requests to `build3`. | If this session can't push workflow files, say so and skip it. |
| B3 | **Paperwork.** `AGENTS.md` to build 3 / code 27; `START_HERE_CODEX.md` rewritten for 2.0 and this workflow; new `CLAUDE.md` (pointing to `AGENTS.md`), `handoff_docs/KNOWN_GAPS.md`, `handoff_docs/TOOLS_AND_SETUP.md`. | The project instructions name these files and both assistants report them missing. Setup commands come from `docs/DEVELOPER_BUILD.md` and `android-build/README.md`. |
| B4 | **Training and guide sync.** Replace the old screen names ("Save named job", "Sun / Night", "Equipment setup", and the other old-name hits in `night-sweep/training.js` and the 1.8-named guides) with the current ones, plus a test that fails when training text names a tab or button that doesn't exist. | Touches `training.js` and the guides, which Lane A also edits. Land it in a small pull request and merge fast; Lane A rebases. |
| B5 | **Item 5: DOCSIS health card.** | First confirm the ranges against CableLabs CM-SP-PHYv3.1-I20-230419; anything not confirmed stays tagged secondary. Spec ranges are capability limits, not operating targets. |
| B6 | **Item 7: leak log, FCC limits card, distance normalizer, CLI estimator, detector check.** | 47 CFR 76.605(c), 76.611 and 76.1706 may be quoted. The app is a personal notebook, not the official record. Worked CLI example in the build list. |
| B7 | **Item 9: pre-work safety card.** | Opens with "follow company policy". Never claims to be the company procedure. |
| B8 | **Item 8: outage first-response card.** | No customer identifiers. Needs a supervisor's review against the local outage procedure before release; record that as an open question. |
| B9 | **D4/D5 close-out:** rewrite the status file and update log for build 3, then write `handoff_docs/FINAL_HANDOFF.md`. | Only after Lane A has merged A1 to A4 and both gates are green. |
| B10 | **Stretch, in order:** item 11 impairment decision tree; item 15 fiber tools (TIA-598 color code and simple budget first); item 17 high-split / 1.8 GHz guide and R-PHY checklist (every step cites an OEM revision); item 18 "why" cards; item 19 study mode; item 20 FCC proof-of-performance reference card. | Same loop, one item per pull request. |

## Blocked or needing a person

- **Item 13 (imported sweep grading) is approved** (Spencer, Nov 11) for files he exported himself. Anything beyond that, such as company systems or other people's files, is still off limits. Real meter files are never committed.
- **Company targets and tolerances** (forward levels, return injection and receiver, tilt, sweep peak-to-valley, leak repair threshold, sweep interval) start unknown everywhere. Never fill them in. The open questions for the supervisor are at the end of `docs/BUILD_LIST.md`.
- **Items 8, 9, 7:** the safety, outage and leak cards are for a supervisor to review before coworkers use them. Mark each "review needed" in the final handoff.
- **APK, emulator, phone and field tests:** only Spencer can do these. They aren't part of done.

## No-push mode (when a session can't write to GitHub)

Some sessions can clone and read the repo but get HTTP 403 on push. That means the credential signs in as Goodst3r but has no write permission. It is a setup problem for Spencer, not a reason for an assistant to stop. Reading (clone, fetch, the public pull requests and branches) still works.

While push is denied, the lane:

1. **Keeps working exactly as the loop says**, on local branches from the latest `build3` it could fetch, with the same tests and the same rules.
2. **At each checkpoint** (an item finished, or about every two hours of work) writes, into a folder named `handoff-out/` (never committed):
   - `<lane>-<item>-<shortsha>.patch`, from `git format-patch --stdout origin/build3..HEAD`
   - `<lane>-<item>-<shortsha>.bundle`, from `git bundle create <file> origin/build3..HEAD`
   - the full text of its status file and the pull request report (rule 10), as `<lane>-status.md` and `<lane>-<item>-report.md`
   and gives Spencer those files in its reply.
3. **Reviews the other lane through read access**: fetch its branches, review the head commit with the checklist, and write the review as `handoff-out/<lane>-review-<branch>.md`.
4. **Marks "no-push mode" at the top of its status file** and retries `git push --dry-run` at the start of every cycle.
5. **Does not merge anything.** Merges happen on GitHub once somebody with write access has pushed the branch.

Spencer, or the Claude session (Lane B) when he hands it the files, applies the patch with `git am`, pushes it as `codex/<item>` and opens the draft pull request. A bundle is there so the exact commits can be checked.

**Fixing it:** the credential behind the assistant's GitHub connection needs write access to `Goodst3r/Carpe-Noctum`. For a fine-grained token that normally means repository permissions Contents (read and write) and Pull requests (read and write), plus Workflows if CI files are to be pushed, limited to this one repository. For a GitHub app connection it means granting that app write access to the repository. `git push --dry-run origin HEAD:refs/heads/<branch>` is the quick test.

## Status files

Each lane creates and edits only its own file in `handoff_docs/lanes/`:

- `codex-status.md` (Lane A), `claude-status.md` (Lane B).
- Keep a table with one row per item (item, branch, pull request, head commit, state, last gate result with the date and your own counts), then "Next", "Blocked" and "Questions for Spencer" sections. Replace stale text; don't let the file grow into a log.
- Reviews and fix lists go in the pull request, or in `handoff_docs/reviews/`.

## Spencer's part

- If either assistant reports a denied push, give its GitHub connection write access to `Goodst3r/Carpe-Noctum` (see "No-push mode"). Until then it works locally and hands you patch files.
- Skim the two status files whenever you like. Nothing needs you to act until the final handoff, unless a lane lists a question for you.
- When D1 to D5 are met: read `handoff_docs/FINAL_HANDOFF.md`, decide pull requests #1 and #2, build and sign the code 27 APK off-repo with the original key, try it on your own phone with a full backup taken first, then merge `build3` into `main`.
- To stop the marathon early, tell either assistant to stop, or edit this file's "Definition of done".
