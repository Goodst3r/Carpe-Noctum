# Claude gatekeeper log

One entry per pull request checked. A diff read and spot checks, not a re-run of the full gate. Rules: `handoff_docs/WORKFLOW.md`.

| Date (UTC) | PR | Head | Result | What was checked | Not checked |
| --- | --- | --- | --- | --- | --- |
| 2026-11-12 | #31 calculator test vectors | `2493cf8` | **APPROVE** | Two files, docs and JSON only. Merges cleanly into `build3` `6414668`. Hosted `gate` check green. JSON parses: 15 worked, 30 edge and 68 refusal cases (24 power-sum, 19 headroom, 25 cascade). The file states no app code was called. | The edge-case values and refusal reason texts were not recomputed one by one. |
| 2026-11-12 | #29 written check and migration checklist | `ed2826c` | **APPROVE** | Two Markdown files only; no `outputs/` or `dist/` delta. Merges cleanly into `build3` `6414668`. Hosted `gate` check green. All P1-P6, H1-H5 and C1-C4 reference values recomputed independently in Python (binary64) and agree to six significant figures. GO / NO-GO scope, 42/54 vs 204/258 separation and Unknown company values read in the "Written check for Grok" section. Handoff file read in full. | Sections 1 to 7 of the critique after the written check (the historical audit) were not read. The CableLabs and SCTE citations were not opened. Whether the hosted run was on `ed2826c` or its parent receipt commit was not confirmed. |
| 2026-11-12 | #30 supply PM and span voltage drop (merged `61069f4`, gated head `e83cafa`) | `61069f4` | **AUDIT: no blocker; one follow-up** | Diff read against `6414668`: new `power-pm.js` (323 lines), `qa/build3-power-pm.test.cjs`, small edits to `build.py`, `shell.html`, `workflow.js`, `thresholds.js`, `training.js`, `style.css`, layout test and run-pwa list, plus rebuilt outputs. Coefficient is user-typed, not defaulted (0.004 is not filled in). Missing published minimum returns Unknown, and wording says "not a company limit". Hosted CI and Grok's local gate are Grok's report. | I did not rerun the gate or open the screen. Whether the PR body's "36 screens, 54 features" matches a recount. The SCTE 238 and 2025/2026 powering projects were not read (Grok says so too). |

## Open items found while checking

- Old original-key or in-place-update wording remains in `FINAL_HANDOFF.md`, `KNOWN_GAPS.md`, `android-build/build-readiness.json`, `docs/DEVELOPER_BUILD.md`, `TOOLS_AND_SETUP.md` and `AGENTS.md` (listed in ChatGPT's handoff). To be reconciled in the finishing session before the APK is frozen.
- `SHA256SUMS.txt` still lists `START_HERE_CODEX.md`, which was deleted with the old lane instructions. It is a build 2 release record and no test reads it.
- **PR #30 merged and added the device key `nightsweep-power-pm-v1`, outside jobs and project backups.** The new-key APK needs an uninstall, which destroys it. Queued as item A4b in `WORKFLOW.md`; the pre-uninstall recovery list in `APK_STEPS.md` must include it until A4b lands.
