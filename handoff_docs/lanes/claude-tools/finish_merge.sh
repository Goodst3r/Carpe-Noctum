#!/bin/bash
# usage: finish_merge.sh <worktree> "<focused suites>"
cd "$1" || exit 1
S=/tmp/claude-0/-home-user-Carpe-Noctum/e545f7f1-7075-5913-b595-ba3a6abf479e/scratchpad
export CODEX_PRIMARY_RUNTIME_NODE_MODULES=$S/marked-latest/node_modules
node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html | cut -c1-12
node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html | cut -c1-12
rm -f dist/sw.*.js
python3 night-sweep/build.py | tail -1 | sed 's#.*/##'
python3 build-pwa.py | tail -1 | cut -c1-70
grep -rl "<<<<<<<\|>>>>>>>" night-sweep qa docs dist outputs 2>/dev/null | head -3
git add -A night-sweep qa/*.py qa/*.cjs docs dist outputs handoff_docs research CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt NightSweep_Project_Status.md
git status --short | grep -E "^(UU|AA)"
for t in $2; do echo "== $t $(node qa/$t.test.cjs 2>&1 | tail -1 | cut -c1-90)"; done
