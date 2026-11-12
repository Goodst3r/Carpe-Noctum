# Lane B helper scripts (saved Nov 12, 2026)

These are the scratch scripts Lane B used to gate heads and to merge `build3` up its stack of stretch branches. They lived in `/tmp` of a cloud container that will be reclaimed, so they are kept here for whoever resumes. They are **not part of the app or the gate**, nothing runs them automatically, and they touch only the worktree you point them at. Paths are hard-coded to that container's scratchpad (`S=/tmp/claude-0/.../scratchpad`) and Chromium (`/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`); edit `S=` and `NIGHTSWEEP_CHROMIUM` first. The `.sh` scripts call the others by `/tmp/<name>`: copy this folder's files to `/tmp/` (or change those paths) before using them.

| Script | What it does |
| --- | --- |
| `gate.sh <worktree> <tag>` | Runs `qa/run-pwa.py`, `qa/build3-layout.test.py`, `qa/browser-smoke.py` in that worktree, then records `git status`, the standalone SHA-256 and HEAD in `/tmp/<tag>-*.log`. Do not edit or commit in that worktree while it runs. The worktree needs `qa/runtime/node_modules` (a link to an installed copy), or every jsdom suite fails with "Cannot find module". |
| `gate_summary.sh <tag>` | Prints the counts from those logs. |
| `stack_level.sh <worktree> <branch> <base> '<json>'` | Merges `origin/<base>` into `<branch>` and resolves the known conflict kinds; does **not** commit or push. Calls `stack_finish.sh`. |
| `stack_finish.sh <worktree> '<json>'` | Second half (use when a merge is already in progress): `resolve_level.py` (shell.html, workflow.js, training.js), `ensure_feature.py`, `resolve_guides.py`, `resolve_readmes.py`, `bump_totals.py`, `normalize_index.py`, then rebuilds and runs focused suites. |
| `run_node_suites.sh <worktree>` | Runs every `qa/build3-*`, `qa/sweep-grading-*`, `qa/ui-names` and `qa/training-*` node suite **by exit code**. Use this, not a grep of the output: one suite prints a bare `AssertionError` without the word "fail". |
| `stack_up.sh`, `finish_merge.sh` | Older merge helper for levels with only generated-file conflicts; `finish_merge.sh` renders the two guides with `docs/render_readme.cjs` (needs `CODEX_PRIMARY_RUNTIME_NODE_MODULES` pointing at a `marked` 18.2.0 install) and rebuilds. |
| `fix_thresholds_groups.py`, `fix_runpwa.py`, `union_conflicts.py` | Resolve `thresholds.js` group-list, `qa/run-pwa.py` and `style.css` conflicts keeping both sides (the groups helper keeps the lower level's entry when both sides have one). |
| `a4_probe.py`, `a1n_probe.py` | The reviewer phone probes used on PR #14 (grading) and PR #23 (Station) at 320 to 430 px. They copy the built page; no tracked file is touched. |

Per-level parameters used for the stretch stack after `build3` `f467e52` (screens, features and custom-curves steps are the totals **at that level**):

```
b11 impairments  base build3                {"name":"Impairments","anchor":"impairments","prev_name":"Leakage","prev_anchor":"leakage","feature_id":"impairments","screens":30,"features":48,"count_word":"five","custom_steps":16, "sentence":"Test → Impairments adds the impairment cards and feature 48, with its own custom-curves guide step."}
b15 fiber        base claude/b11-impairments {"name":"Fiber","anchor":"fiber","prev_name":"Impairments","prev_anchor":"impairments","feature_id":"fiber","screens":31,"features":49,"count_word":"six","custom_steps":17,"sentence":"Test → Fiber adds the TIA-598 fiber color finder and a simple link loss budget as feature 49, with its own custom-curves guide step."}
b17 high split   base claude/b15-fiber       {"name":"High split","anchor":"high-split","prev_name":"Fiber","prev_anchor":"fiber","feature_id":"highSplit","screens":32,"features":50,"count_word":"seven","custom_steps":18,"sentence":"Test → High split adds the 1.8 GHz high-split reading aid with a Remote PHY bring-up list as feature 50, with its own custom-curves guide step."}
b18 why cards    base claude/b17-highsplit   {"name":"Why cards","anchor":"why-cards","prev_name":"High split","prev_anchor":"high-split","feature_id":"why","screens":33,"features":51,"count_word":"eight","custom_steps":19,"sentence":"Test → Why cards adds fourteen short cards on the basics behind the SCTE 293 series as feature 51, with its own custom-curves guide step."}
b20 POP          base claude/b18-why-cards   {"name":"Proof of performance","anchor":"proof-of-performance","prev_name":"Why cards","prev_anchor":"why-cards","feature_id":"pop","screens":34,"features":52,"count_word":"nine","custom_steps":20,"sentence":"Test → Proof of performance adds the FCC proof-of-performance reference card as feature 52, with its own custom-curves guide step."}
b19 study        base claude/b20-pop         {"name":"Study mode","anchor":"study-mode","prev_name":"Proof of performance","prev_anchor":"proof-of-performance","feature_id":"study","screens":35,"features":53,"count_word":"ten","custom_steps":21,"row_name":"Study","prev_row":"Proof of performance","sentence":"Test → Study adds the study-mode questions as feature 53, with its own custom-curves guide step."}
```

After every level: run `run_node_suites.sh`, the level's real-browser suites (`qa/build3-impairments-real.test.py` from b11 up and `qa/build3-fiber-real.test.py` from b15 up; b17 to b19 add none), then commit with `git commit --no-edit` and push. Never `git add -A qa` (it would add the local `qa/runtime/node_modules` link). Check `handoff_docs/lanes/claude-status.md` after each level merge: keep the newest Lane B version (the B9 / log-book one), not a branch's old copy. Run the full gate once on the top of the stack, and check hosted CI ("QA gate") on #13 to #19; #20 gets no hosted CI while its base is `claude/b20-pop`.

**Known gap in these helpers (Lane A review 5868433524 on #13):** `finish_merge.sh` renders only the Functions and Training Coverage guides, never the main README (`node docs/render_readme.cjs` with no arguments, see `docs/DEVELOPER_BUILD.md`), so `docs/NightSweep_1.8_Alpha_README.html` and `dist/guide.html` fall behind the Markdown. `bump_totals.py` also misses "custom curves N" in the README, "fifteen steps", "N choices" in the Training Coverage table and "custom curves **N**". Add the main-guide render and those patterns before the next resync.

## Resuming in a new container

```
git clone https://github.com/Goodst3r/Carpe-Noctum && cd Carpe-Noctum   # or git fetch origin in an existing clone
npm ci --prefix qa/runtime --no-audit --no-fund                          # jsdom etc. for the node suites
pip install playwright                                                  # Python Playwright for the rendered suites
S=<your scratchpad>; mkdir -p $S
npm install --prefix $S/marked-latest marked@18.2.0                     # for docs/render_readme.cjs (CODEX_PRIMARY_RUNTIME_NODE_MODULES=$S/marked-latest/node_modules)
for b in b11-impairments b15-fiber b17-highsplit b18-why-cards b20-pop b19-study; do
  w=$S/wt-${b%%-*}; git worktree add $w claude/$b; ln -s "$PWD/qa/runtime/node_modules" $w/qa/runtime/node_modules
done
git worktree add -b claude/b9-closeout $S/wt-b9 origin/build3            # B9 starts here; merge origin/claude/logbook and origin/codex/core-closeout-status first
cp handoff_docs/lanes/claude-tools/* /tmp/                               # then set S= and NIGHTSWEEP_CHROMIUM in the .sh files
```

The scripts take the worktree's **directory name under `$S`** (`wt-b11`, `wt-b15`, `wt-b17`, `wt-b18`, `wt-b20` for proof of performance, `wt-b19` for study mode), not a path.
