# CLAUDE.md

Everything a Claude session needs to know about this project is in **`AGENTS.md`**. Read it first; this file only adds what is specific to Claude Code sessions. Keep the two consistent, and put project rules in `AGENTS.md`, not here.

## Before any work

1. Read `AGENTS.md` and the files it lists (plugin policy, development instructions, `NightSweep_Project_Status.md`, `docs/DEVELOPER_BUILD.md`).
2. For build 3 work read `handoff_docs/PARALLEL_TASKS.md` (the plan, rules and loop), both `handoff_docs/lanes/*-status.md` files, `handoff_docs/KNOWN_GAPS.md` and `handoff_docs/TOOLS_AND_SETUP.md`. `START_HERE_CODEX.md` is the orientation page.
3. `git fetch origin`, then look at open pull requests and recent commits on `build3`. The repository is the record, not an earlier chat.

## Working rules in short

- Branch from the latest `build3` as `claude/<item>`; open draft pull requests into `build3`; the other lane reviews and merges. Never push to `main`, `ccr-7abea525-rljsni` or the other lane's branches; never force-push.
- Only edit the files your item needs. Shared files and how to share them are in `PARALLEL_TASKS.md`.
- Never build or sign an APK, change the version, storage keys, package ID or job file format, or put signing keys or real meter files in the repository.
- Restore test churn before committing if a test rewrote tracked evidence files: `git checkout -- release research` (the gate no longer does this once the untracked evidence folder from task B1 is in place).
- Generated files (`outputs/Night_Sweep.html`, `dist/`) are rebuilt with `python3 night-sweep/build.py` and `python3 build-pwa.py`, never hand-merged.
- Report your own command results. Keep automated, rendered-browser, emulator, phone and field results separate. Say plainly what was not run.

## Tools

Which research, browser and review tools exist differs per session; `handoff_docs/TOOLS_AND_SETUP.md` records what was actually available and what is needed for the rendered tests. Credits for research tools can run out: use what is available and mark unverified items "not re-verified".
