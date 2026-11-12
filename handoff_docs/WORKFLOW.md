# Carpe Noctum workflow: three assistants, one integration branch

Written November 12, 2026 for Spencer; revised the same night. This is the only file that says who does what. It replaces `PARALLEL_TASKS.md`, `ROADMAP_PROMPTS.md`, `START_HERE_CODEX.md` and the old `codex-status.md` / `claude-status.md` lane files, which were deleted because they described a two-lane plan that has ended. If anything elsewhere in the repository disagrees with this file about roles, queues, review or merging, this file wins. Product decisions still come from `ROADMAP_DETERMINATION.md`, `docs/BUILD_LIST.md` and `AGENTS.md`.

**There is no deadline.** Spencer wants the work done correctly and completely, at a steady pace. Nobody stops at a clock time. A lane stops only when its queue is finished (see "Done") or every remaining item is recorded BLOCKED.

## Roles

| Assistant | Does | Does not |
| --- | --- | --- |
| **Grok** (lane A) | Builds. Runs the long gates. Reviews ChatGPT's PRs. Merges ChatGPT's PRs. | Merge its own PR. Edit a file lane B owns for an open item. |
| **ChatGPT** (lane B) | Builds. Runs the long gates. Does the independent math check on every calculator PR. Reviews Grok's PRs. Merges Grok's PRs. | Merge its own PR. Edit a file lane A owns for an open item. |
| **Claude** (gatekeeper) | Reads PR diffs and comments APPROVE or CHANGES NEEDED. Audits merged work. Builds and signs the APK in the finishing session (`APK_PLAN.md`). | Build features. Re-run the full gate on every PR. Block a merge by being absent (see "Review and merge"). |

Spencer answers the "Questions for Spencer" lists, installs the APK and does the phone checks. Nobody sees another assistant's chat: they talk through the files and pull requests in this repository.

## Queues

Spencer moved the calculators ahead of NAV-1 so both lanes can work at once. Otherwise the order follows the "Revision 2 build order" in `ROADMAP_DETERMINATION.md`, split so the two lanes touch different files.

**P1-P6, H1-H5 and C1-C4 are test-case IDs** in ChatGPT's written check (`handoff_docs/reviews/chatgpt-roadmap-critique.md`) and vectors file. They are not separate features. There is one power-sum calculator, one cascade calculator, and no new headroom feature.

### Lane A: Grok (branches `grok/<item>`, status `handoff_docs/lanes/grok-status.md`)

| # | Item | Notes |
| --- | --- | --- |
| A0 | Merge the instruction branch `ccr-026a9e4b-35w77r` (this file) into `build3`. PR #31 and #29 are already merged. | Docs only. Claude's check of #29 and #31 is in `handoff_docs/reviews/claude-gatekeeper-log.md`. Do this first. |
| A1 | Power-sum calculator (P0-4): uncorrelated add, N equal carriers, signal-plus-noise minus noise. | Cases P1-P6 plus the edge and refusal cases. No correlated add. |
| A2 | Cascade calculator: thermal noise and CNR estimates only. | Cases C1-C4 plus edges and refusals. Fixed 290 K. No CTB/CSO score, no MER prediction, no ordered Friis chain or editable temperature (those need new cases first). |
| A3 | NAV-1, the navigation regroup, exactly as the determination maps it. **Starts only after the Safety removal (B1) has merged**, so it regroups the screens that remain. | One PR, no features, no storage-key, screen-id or job-format change. Meet every NAV-1 exit criterion. ChatGPT runs its own full gate on the same head. |
| A4 | Context strip (P0-3). | |
| A4b | Supply PM notebook export/import (see "Known follow-ups"). | Additive; no new storage key. |
| A5 **DEFERRED to the next build (scope freeze).**  | Tonight list (P0-1). | Add open temporary repairs once B5 has merged. Its backup/handoff-time lines may be a place to flag the Supply PM notebook (see "Known follow-ups"). |
| A6 **DEFERRED to the next build (scope freeze).**  | Exact resume (P0-8), reduced version. | The determination puts it after Spencer's phone interruption checks. If those are not recorded, mark it BLOCKED on Spencer and do not build it. |
| A7 | Final: full gate on the final `build3`, then `handoff_docs/lanes/grok-debug-handoff.md`. | See "Done". |

### Lane B: ChatGPT (branches `chatgpt/<item>`, status `handoff_docs/lanes/chatgpt-status.md`)

| # | Item | Notes |
| --- | --- | --- |
| B0 | Finish PR #31 (vectors). #29 and #31 may already be merged; if so, record that and move on. | Do not change a number Grok may be using; if you must, name the case. |
| B1 | **Remove the Safety part of the app completely** (Spencer's order, Nov 12). Do this before anything else in `workflow.js` or `shell.html` changes, because NAV-1 (A3) waits for it. | See "Safety removal" below. |
| B2 | Headroom wording and conversion (determination build-order items 1 and 8, P0-5). Relabel the existing DOCSIS health result as composite margin to the entered Pmax, with the caveats the determination and your written check require. At most, also offer 6.4 MHz as a measured-in width. Add regression tests that run the app's real functions against H1-H5 and the headroom edge and refusal cases. | No new converter and no new screen. Per-channel/DRW headroom stays NO-GO. |
| B3 | Ripple-search width label: it is app-chosen, not Expert. Fix the label and its `thresholds.js` registration. | Small PR. |
| B4 | Night log fixes, then the intermittent-ingress entry (P0-6). | Remove/Undo and no slot used by a blank entry first. An entry type in Job → Night log, not a new screen or store. |
| B5 **DEFERRED to the next build (scope freeze).**  | Temporary-repair follow-up (P0-2). | Read `night-sweep/field-work.js` first; extend the existing Checklists notes. Say which key or additive job field it uses and prove old jobs and backups round-trip. |
| B6 | Final: full gate on the final `build3`, then update `handoff_docs/reviews/chatgpt-handoff-for-claude.md`. | See "Done". |

#### Safety removal (B1)

Remove Job → Safety (`night-sweep/safety.js`) and everything that exists only for it, in one PR:

- Delete the module and its `<!--SAFETY-->` token in `build.py`, its panel and script placeholder in `shell.html`, its tab and description in `workflow.js`, its training steps and practice-job parts, its `thresholds.js` rows and its guide text. Update the practice library, feature index, `qa/ui-names.test.cjs` and the screen and feature counts, and delete or rewrite the tests that exist only for Safety.
- Study mode: drop the "Safety and construction" domain and the pre-work safety question. Keep the outage question under a remaining domain. Do not invent replacement questions.
- Outage first-response card (`outage.js`): remove the "Safety on arrival" group, including the pointer to Job → Safety.
- The shared checklist engine (`checklist.js`) stays: the Outage card still uses it. Update its comments.
- Saved data: do not delete the device key `nightsweep-safety-v1` from anyone's phone and do not write it. Old jobs, backups and exports must still open unchanged and round-trip with identical results; any safety field in an old file is ignored but preserved on re-export. Add a regression test for that.
- Names stay: no storage-key, package or other screen-id change.
- The gate must pass on the PR; then the other builder reviews it. This PR needs a rendered check that no empty tab or dead link is left at 320 to 430 px.

Reviewing the other lane's open PR always comes before starting your own next item.

### Scope freeze (Spencer, Nov 12 night)

To get a phone-testable APK sooner, **no new items start.** The batch is #39, #40, #41, #36 and #42. These are **deferred to the next build** and are not blockers for the APK: A5 (tonight list), A6 (exact resume, also blocked on Spencer's phone checks) and B5 (temporary-repair follow-up). Open drafts #32, #1 and #2 are not part of the batch. After the batch, the remaining work is the final gate on the combined head and the two handoff files (A7, B6), then Claude's finishing session.

### Not to be built

- **Safety:** Spencer removed the Safety part of the app. Do not add any pre-work safety card, reminder or checklist.

- Per-channel/DRW headroom tool, CTB/CSO plant-health scores, MER predictions: NO-GO.
- Leakage-method pointer (P0-3b) and evidence handoff (P0-7): deferred until Spencer supplies the method or the definition.
- Build-list items 16 (connector checklist) and 12 (return path toolkit): blocked on missing sources (catalog manuals hold no torque or pin length; the funneling example is unchecked against SCTE 293-11, 293-13 or 270). They do not start until Spencer or a builder supplies the sources, and never ahead of the queues.
- PR #30 (item 14, Power → Supply PM) merged as `61069f4` before this workflow existed. It is not to be reopened or reworked; see "Known follow-ups".

## Rules (both builders)

1. **One writer per file per item.** Stay inside the files your item needs. If you need a file the other lane is changing in an open PR, say so in your status file and take your next item, or wait for that PR to merge and then merge `build3` in.
2. **Never touch:** `main`, another assistant's branches, tags, repository settings, or anything outside `Goodst3r/Carpe-Noctum`. Never force-push or rebase. Integrate with an ordinary merge of the latest `origin/build3`. Never `git add qa/runtime/node_modules`. Direct pushes to `build3` are only merges allowed by "Review and merge".
3. **Branch from the latest `build3`.** One item per PR, small enough to merge within hours.
4. **Generated files** (`outputs/Night_Sweep.html`, `dist/**`) are never hand-merged. On a conflict, take either side, run `python3 night-sweep/build.py` and `python3 build-pwa.py`, and commit the result. Optional helper scripts are in `handoff_docs/lanes/claude-tools/`.
5. **Test churn.** Some tests rewrite tracked evidence under `release/` and `research/`. Run `git checkout -- release research` before committing unless you meant to change them. A normal gate leaves `git status` clean.
6. **Version and identity do not change.** No storage-key, package-ID or screen-id change; job-format changes are additive only and old jobs and backups must open unchanged and round-trip. No version bump. Nobody builds or signs an APK except the finishing session under `APK_PLAN.md`. No signing key, password or real meter file anywhere in the repository.
7. **Product rules** (from `AGENTS.md`): offline only; synthetic data only; no customer names, addresses, account numbers or modem MACs; every limit labelled spec / expert / company / unknown and registered in `night-sweep/thresholds.js` with source, revision, section, units and conditions; company values start Unknown and blank never means zero; 42/54 MHz (GS7K, GainMaker) and 204/258 MHz (Vecima, AOI) stay separate; UBT excluded from new selections; the only leak detector the app names is the Arcom Digital QS-NAVPLUS-OUDP; SCTE and NCTI material is paraphrased and cited by number and year, never copied; phone-first dark UI, plain JavaScript, HTML and CSS.
8. **New math** needs an independent reference computed outside the app and a regression test against the app's real output. The shared reference is `handoff_docs/reviews/chatgpt-calculator-test-vectors.json`. Numbers in it are strings; compare unrounded results with a documented numerical bound and the printed values at six significant figures; every refusal case must refuse with its reason.
9. **Honest reports.** Every PR body lists: starting and ending commit, files changed and why, sources, the exact commands run with exit codes and check counts (your own, never copied from another run), and what was not checked. Keep automated, rendered-browser, emulator, phone and field results separate. Say plainly that no physical-device test was run.
10. **Do not stop to ask Spencer.** Put the question in your status file under "Questions for Spencer" and take the next item. If an item resists two real fix attempts, record BLOCKED in your status file (command, commit, error, attempts) and continue. Never weaken, skip or delete a test.
11. **Existing plans only.** No purchases or upgrades. If a research tool runs out, mark the item "not re-verified" and carry on.

### Shared files

| File | Rule |
| --- | --- |
| `night-sweep/build.py` (module list) | One entry per line. Add yours on its own line. |
| `night-sweep/shell.html`, `night-sweep/workflow.js` | Add your entries next to the existing ones without reordering. Keep both lanes' additions on a conflict. While NAV-1 (A3) is open, nobody else edits these two files: wait for it to merge. |
| `night-sweep/thresholds.js` | Add your rows together as one group. Do not reorder or reformat other rows. |
| `night-sweep/training.js` and the guides in `docs/` | Add the practice step and guide section for your feature only. Render guides with `docs/render_readme.cjs` and rebuild. |
| `qa/run-pwa.py` | Add your suites inside the `suites=[...]` list after the last entry. |
| `NightSweep_Project_Status.md`, the build 3 update log, screen and feature counts | Edit only in the PR that adds the feature. The second PR to merge takes `build3` in and recounts. |

## The gate (run by the author on every head)

```
npm ci --prefix qa/runtime --no-audit --no-fund
python3 night-sweep/build.py && python3 build-pwa.py
NIGHTSWEEP_CHROMIUM=<path> NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py
python3 qa/build3-layout.test.py
python3 qa/browser-smoke.py
git diff --check
git status --porcelain      # must be empty
```

Judge suites by exit code. After guide edits, also render the main README (`docs/DEVELOPER_BUILD.md`) and keep the two main READMEs byte-identical. The hosted `QA gate` workflow must also be green on the exact head SHA.

## Review and merge (batch rules, Nov 12 night; they replace the per-PR re-gate)

Five PRs are ready at once (#39, #40, #41, #36, #42). Gating and merging them one at a time costs one 15 minute gate per PR, because every merge sends the others back to take in `build3`. Spencer's decision: **gate once for the batch.**

**Per PR (do these in parallel, now):**

1. The author's full gate is green on the PR's own head and recorded in the PR body, and hosted `QA gate` is green on that same head.
2. The other builder reviews the diff with the checklist below, runs the PR's own new suites and any targeted check the checklist asks for, and comments APPROVE or CHANGES NEEDED on the head SHA. This review is **not** a full gate. For calculators it includes the independent math check and `chatgpt-pr<number>-math-review.md`.

A new commit after an approval voids it.

**Merging the batch:** the reviewer, never the author, merges with a merge commit (no squash), in this order, with no local gate between merges:

1. #39, #40, #41 (ChatGPT merges: Grok authored #39 and #41; Claude authored #40).
2. #36, #42 (Grok merges: ChatGPT authored both).

The merger takes the latest `build3` into the PR head by ordinary merge **only if GitHub says it conflicts**. A merge that is clean needs no re-gate of that PR. On a conflict in app code, resolve it, rebuild generated files with the two build commands (never hand-merge), and wait for hosted CI on that head before merging. After the last merge, one builder recounts screens, features and registry rows on the final head, fixes the counts in the guides and status files in a single "Rebuild and recount after the batch" commit, and rebuilds.

**One full gate on the final head:** both builders run the gate in "The gate" below on the same final `build3` head and record their own counts and the standalone SHA-256. Hosted `QA gate` must also be green on that head. If it fails, name the suite, find which merged PR caused it, and fix it forward in one small PR; do not re-gate PRs that did not change.

**Claude's comment does not block.** If Claude has commented CHANGES NEEDED on a head, fix it first. If Claude has not commented, merge anyway; Claude audits after the merge and files anything it finds as a new item for the author.

Do not wait on a review. If your PR has had no review by the time you finish your next task, say so in your status file and keep going.

### Review checklist (on the head the author named)

1. **Math** (calculators and any changed formula): derive it independently of the author's code and reference script. Run the app's real functions against the vectors. Check units, signs, edge inputs, bounds and every refusal. For A1 and A2 ChatGPT commits `handoff_docs/reviews/chatgpt-pr<number>-math-review.md`. For B2 Grok derives the two formulas itself, because ChatGPT wrote both the vectors and the code.
2. **Targeted checks, not a full gate:** run the suites the PR adds and any rendered or stored-data check the PR's risk calls for (for example a backup round trip for anything that changes what is stored). The single full gate happens once, on the final batch head.
3. **Labels and sources:** every new value is registered with a label and a source you can open. Company values start Unknown.
4. **Plants:** 42/54 and 204/258 stay separate; the 31/43/38 values are not hard-coded as specs.
5. **Job format:** old jobs and backups open unchanged; a backup round-trip gives identical results; no storage-key change.
6. **UI:** 320 to 430 px in the dark theme; large controls; errors say why.
7. **Training and guides:** a practice step exists, uses the current screen names and matches the screen.
8. **Scope:** only the item's files plus the shared-file rules; no version change; no secrets or private identifiers; nothing from "Not to be built".
9. Write findings as a PR comment with file, line, severity and evidence, ending APPROVE or CHANGES NEEDED and the head SHA.

## Gatekeeper check (Claude)

CI green on the exact head; diff contains only the stated files; no `outputs/` or `dist/` delta the PR did not rebuild; every new value labelled and sourced; company values Unknown; 42/54 and 204/258 separate; no storage-key, package or version change; no secrets or real meter files; the PR body's commands and counts are specific; nothing from "Not to be built". Results go in a PR comment and in `handoff_docs/reviews/claude-gatekeeper-log.md`.

## Decisions from Spencer (Nov 12)

- **Safety is removed from the app** (item B1). Decided; do not ask again.
- **Vecima setup is plug and play.** No Vecima installation or commissioning guide is needed and none will be sought. The High split screen's Remote PHY bring-up text, which asked the tech to record a Vecima guide revision, stays as a general reference for now; do not add Vecima steps, and do not keep asking which guide the company holds.
- **33 vs 40 dBmV** (modem total input limit) is not a question for Spencer. The DOCSIS health card already shows both published limits and which modem each applies to; leave it as is. Anything not covered stays Unknown.
- **Goal:** a signed APK Spencer can install and test when both lanes are done.

## Known follow-ups

- **Supply PM notebook is outside backups.** PR #30 stores its notebook under the device key `nightsweep-power-pm-v1`, not in the job and not in a project backup. The new-key APK requires uninstall before install, which destroys it. Before the APK is frozen, Grok adds an export/import for that notebook (or includes it in the project backup additively) and proves old jobs and backups still round-trip; until then `APK_STEPS.md` must tell Spencer to export it first. Queue this as item A4b, after A4.
- **NAV-1 now has more to regroup.** #30 added a Power sub-tab. NAV-1 recounts screens and features on the latest `build3`.

## Done

The build work is done when all of these are true:

1. The five batch PRs are merged, and every other queue item is merged, or recorded BLOCKED or deferred with the reason (see "Scope freeze").
2. Each builder has run the full gate on the same final batch head of `build3` and recorded its own counts and the standalone SHA-256, and hosted `QA gate` is green on it.
3. Grok has written `handoff_docs/lanes/grok-debug-handoff.md`: branches and PRs with heads and CI links; every failure with the reproduce command and the last 60 lines of output; doubts; the final `build3` commit and standalone SHA-256.
4. ChatGPT has updated `handoff_docs/reviews/chatgpt-handoff-for-claude.md` the same way, plus everything "not re-verified".

Then both lanes stop and Spencer starts Claude's finishing session. **The goal is an APK Spencer can install and start testing:** the finishing session audits, freezes `build3`, builds and signs the APK under `APK_PLAN.md`, records its SHA-256, attaches it outside the repository, and writes `APK_STEPS.md` (back up first, including the Supply PM notebook, then uninstall, install, restore, and the phone checks in order). Emulator, phone and field tests are Spencer's and are not part of done.

## Status files

Each lane edits only its own file in `handoff_docs/lanes/`: one table (item, branch, PR, head SHA, state, own last gate counts with date), then "Next", "Blocked", "Questions for Spencer". Replace stale text; do not let it grow into a log.

## History, not instructions

Everything below is a record of past work. Read it only when a PR or the determination points to it. It is not a source of rules or a work queue.

- `handoff_docs/reviews/codex-*.md`, `handoff_docs/reviews/grok-gate-*.md`
- `handoff_docs/lanes/codex-*.json`, `codex-*.md`, `claude-logbook.md`, `grok-logbook.md`, `logbooks/`
- `handoff_docs/FINAL_HANDOFF.md`, `KNOWN_GAPS.md` (what was delivered and what is still unverified)
