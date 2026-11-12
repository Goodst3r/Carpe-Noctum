# Carpe Noctum workflow: three assistants, one integration branch

Written November 12, 2026 for Spencer. This is the only file that says who does what. It replaces `PARALLEL_TASKS.md`, `ROADMAP_PROMPTS.md`, `START_HERE_CODEX.md` and the old `codex-status.md` / `claude-status.md` lane files, which were deleted because they described a two-lane plan that has ended. If anything elsewhere in the repository disagrees with this file, this file wins. The product facts still come from `ROADMAP_DETERMINATION.md`, `docs/BUILD_LIST.md` and `AGENTS.md`.

## Roles

| Assistant | Does | Does not |
| --- | --- | --- |
| **Grok** (lane A) | Builds. Runs the long gates. Cross-reviews ChatGPT's PRs. | Merge its own PR. Touch lane B files. |
| **ChatGPT** (lane B) | Builds. Runs the long gates. Math-checks every calculator PR against independent formulas. Cross-reviews Grok's PRs. | Merge its own PR. Touch lane A files. |
| **Claude** (gatekeeper) | Reads each PR's diff and posts APPROVE or CHANGES NEEDED. Builds and signs the APK in the finishing session only (`APK_PLAN.md`). | Re-run the full gate (hosted CI on the exact head covers it). Build features. |

Spencer decides priorities and answers the "Questions for Spencer" lists. Nobody sees another assistant's chat: they talk through the files and pull requests in this repository.

## Lanes tonight (Nov 12)

Spencer moved the calculators ahead of NAV-1 so nothing waits. The order in `ROADMAP_DETERMINATION.md` resumes after these queues.

| | Lane A: Grok | Lane B: ChatGPT |
| --- | --- | --- |
| Queue | 1. P1-P6 power sums. 2. C1-C4 cascade (composite-margin wording, thermal/CNR as estimates only). 3. One registration PR for the merged calculators. 4. NAV-1. 5. The remaining P0 items in the determination's order. | 1. Make PR #31 (test vectors) ready. 2. H1-H5 headroom, GO variants only. 3. The two DOCSIS-card fixes (composite margin wording; ripple-search width label). 4. Review every Grok calculator PR. |
| Branches | `grok/<item>` | `chatgpt/<item>` |
| Status file (only this lane edits it) | `handoff_docs/lanes/grok-status.md` | `handoff_docs/lanes/chatgpt-status.md` |
| Cross-reviews | ChatGPT's PRs | Grok's PRs |

Parked: PR #30 (A5 supply PM) stays an open draft. A6 and A7 do not start. NO-GO and not to be built: per-channel/DRW headroom and CTB/CSO plant-health scores (determination, ChatGPT's written check in PR #29).

Stop time tonight: **03:00 UTC on Nov 13**, or earlier when both queues are done. Then post a final status comment.

## Rules (both builders)

1. **One writer per file.** Each calculator is a new module plus its own test file. Do not edit navigation, the screen registry or the screen/feature counts in a calculator PR. List every shared file a PR touches in its body. If the design cannot avoid a shared file, say so in a comment on the first PR.
2. **Never touch:** `main`, another lane's branches, tags, repository settings, or anything outside `Goodst3r/Carpe-Noctum`. Never force-push or rebase. Integrate with an ordinary merge of the latest `origin/build3`. Never `git add qa/runtime/node_modules`.
3. **Branch from the latest `build3`.** Keep PRs small enough to merge within hours.
4. **Generated files** (`outputs/Night_Sweep.html`, `dist/**`) are never hand-merged. On a conflict, take either side, run `python3 night-sweep/build.py` and `python3 build-pwa.py`, and commit the result. Helper scripts that do this are in `handoff_docs/lanes/claude-tools/` (optional).
5. **Test churn.** Some tests rewrite tracked evidence under `release/` and `research/`. Run `git checkout -- release research` before committing unless you meant to change them. A normal gate leaves `git status` clean.
6. **Version and identity do not change.** No storage-key, package-ID or job-format change (additive job fields only). No version bump. Nobody builds or signs an APK except the finishing session under `APK_PLAN.md`. No signing key, password or real meter file anywhere in the repository.
7. **Product rules** (from `AGENTS.md`): offline only; synthetic data only; every limit labelled spec / expert / company / unknown and registered in `night-sweep/thresholds.js` with a source; company values start Unknown and blank never means zero; 42/54 MHz (GS7K, GainMaker) and 204/258 MHz (Vecima, AOI) stay separate; UBT excluded from new selections; the only leak detector the app names is the Arcom Digital QS-NAVPLUS-OUDP; SCTE and NCTI material is paraphrased and cited by number and year, never copied.
8. **New math** needs an independent reference computed outside the app and a regression test against the app's real output. The shared reference is `handoff_docs/reviews/chatgpt-calculator-test-vectors.json` (PR #31, on `build3` once merged). Numbers in it are strings; compare at six significant figures; every refusal case must refuse with its reason text.
9. **Honest reports.** Every PR body lists: starting and ending commit, files changed and why, sources, the exact commands run with exit codes and check counts (your own, never copied from another run), and what was not checked. Keep automated, rendered-browser, emulator, phone and field results separate. Say plainly that no physical-device test was run.
10. **Do not stop to ask Spencer** unless blocked by something only he can decide or provide. Put the question in your status file under "Questions for Spencer" and take the next item. If an item resists two real fix attempts, record BLOCKED in your status file (command, commit, error, attempts) and continue. Never weaken, skip or delete a test.

## The gate (run by the builder, on every head)

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

## Review and merge

A PR is a draft until it has all of these on the same head SHA:

1. The author's full gate, green, with the head containing the latest `origin/build3`.
2. Hosted `QA gate` green on that SHA.
3. The other builder's review: for calculators, ChatGPT pins the head, runs the real functions against the vectors and its independent formulas, commits `handoff_docs/reviews/chatgpt-pr<number>-math-review.md`, and comments APPROVE or CHANGES NEEDED. For ChatGPT's own PRs, Grok reviews the code against the repo and comments the same way.
4. Claude's gatekeeper comment (diff read, scope, labels, shared files, 42/54 vs 204/258, CI result). This is not a re-run of the gate.

Then the builder who did **not** write the PR merges it with a merge commit (no squash). A new commit after any approval voids it. Authors never merge their own PR. Nobody approves or merges anything touching a NO-GO item.

## Gatekeeper check (Claude's list)

CI green on the exact head; diff contains only the stated files; no `outputs/` or `dist/` delta unless the PR rebuilt them; every new value has a label and a source; company values Unknown; 42/54 and 204/258 separate; no storage-key, package or version change; no secrets or real meter files; the PR body's counts and commands are specific and not copied; NO-GO list respected.

## Status files

Each lane edits only its own file in `handoff_docs/lanes/`: one table (item, branch, PR, head SHA, state, own last gate counts with date), then "Next", "Blocked", "Questions for Spencer". Replace stale text; do not let it grow into a log. Reviews and long receipts go in the PR or in `handoff_docs/reviews/`.

## History, not instructions

Everything below is a record of past work. Read it only when a PR or the determination points to it. It is not a source of rules or a work queue.

- `handoff_docs/reviews/codex-*.md`, `handoff_docs/reviews/grok-gate-*.md`
- `handoff_docs/lanes/codex-*.json`, `codex-*.md`, `claude-logbook.md`, `grok-logbook.md`, `logbooks/`
- `handoff_docs/FINAL_HANDOFF.md`, `KNOWN_GAPS.md` (what was delivered and what is still unverified)
