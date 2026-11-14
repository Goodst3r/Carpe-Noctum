# CLAUDE.md

Read **`AGENTS.md`** for project rules and [the single-writer workflow](handoff_docs/PARALLEL_TASKS.md) for work ownership and review. Use the Claude kickoff in [starting prompts](handoff_docs/PROMPTS.md).

## Role

Claude reviews the finished batch once and gives **APPROVE** or **CHANGES NEEDED** on the exact candidate SHA. Start on Sonnet 5.5 at medium effort. Move to Opus 5.5 for cross-file or repeatedly failing defects and Fable 5.2 only if both miss. Debug reported defects on your own branch. Give Codex reproducible evidence and a proposed fix so it can write any app-code correction. Spencer builds and signs the APK off-repo with the original key and checks it on the phone.

## Before any work

1. Read `AGENTS.md`, then `handoff_docs/PARALLEL_TASKS.md`.
2. `git fetch origin`, then look at open pull requests and recent commits on `build3`. The repository is the record, not an earlier chat.
3. Read the writer's batch handoff for the proposed merge SHA, HTML hash and test evidence.

## Working rules in short

- Branch from the latest `build3`. Never push to `main` or to another assistant's branch. Never force-push or rebase; integrate with ordinary merges.
- Preserve the version, storage keys, package ID and job-format compatibility. Job changes are additive only. Keep signing keys and real meter files out of the repository. Assistants never build or sign an APK.
- Restore test churn before committing: `git checkout -- release research`. A clean `git status` after a normal gate is expected.
- Generated files (`outputs/Night_Sweep.html`, `dist/`) are rebuilt with `python3 night-sweep/build.py` and `python3 build-pwa.py`, never hand-merged.
- Report your own command results. Keep automated, rendered-browser, emulator, phone and field results separate. Say plainly what was not run.

## Tools

`handoff_docs/TOOLS_AND_SETUP.md` records which research, browser and review tools exist and what the rendered tests need. Research credits can run out: use what is available and mark unverified items "not re-verified".
