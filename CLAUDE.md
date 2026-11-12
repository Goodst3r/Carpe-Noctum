# CLAUDE.md

Everything a Claude session needs to know about this project is in **`AGENTS.md`**. Read it first; this file only adds what is specific to Claude Code sessions. Put project rules in `AGENTS.md` and who-does-what in `handoff_docs/WORKFLOW.md`, not here.

## Role

From the night of November 12, 2026 Grok and ChatGPT build, run the long gates, math-check and cross-review each other. Claude is the gatekeeper: read each pull request's diff, apply the gatekeeper check in `handoff_docs/WORKFLOW.md`, and comment APPROVE or CHANGES NEEDED on the exact head SHA. Do not re-run the full gate (hosted CI on that SHA covers it) and do not build features. Record each check in `handoff_docs/reviews/claude-gatekeeper-log.md`. A missing Claude comment does not block a merge; audit merged work afterwards. The APK is built and signed only by the later finishing session, following `handoff_docs/APK_PLAN.md`.

## Before any work

1. Read `AGENTS.md`, then `handoff_docs/WORKFLOW.md`.
2. `git fetch origin`, then look at open pull requests and recent commits on `build3`. The repository is the record, not an earlier chat.
3. Read `handoff_docs/lanes/grok-status.md` and `handoff_docs/lanes/chatgpt-status.md` for what each builder last recorded.

## Working rules in short

- Branch from the latest `build3`. Never push to `main` or to another assistant's branch. Never force-push or rebase; integrate with ordinary merges.
- Never change the version, storage keys, package ID or job file format, or put signing keys or real meter files in the repository. Only the finishing session builds and signs an APK (`handoff_docs/APK_PLAN.md`).
- Restore test churn before committing: `git checkout -- release research`. A clean `git status` after a normal gate is expected.
- Generated files (`outputs/Night_Sweep.html`, `dist/`) are rebuilt with `python3 night-sweep/build.py` and `python3 build-pwa.py`, never hand-merged.
- Report your own command results. Keep automated, rendered-browser, emulator, phone and field results separate. Say plainly what was not run.

## Tools

`handoff_docs/TOOLS_AND_SETUP.md` records which research, browser and review tools exist and what the rendered tests need. Research credits can run out: use what is available and mark unverified items "not re-verified".
