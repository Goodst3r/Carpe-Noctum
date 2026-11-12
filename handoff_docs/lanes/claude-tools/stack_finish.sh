#!/bin/bash
# usage: stack_finish.sh <worktree-name> '<json params>' — second half of stack_level.sh (use when a merge is already in progress)
S=/tmp/claude-0/-home-user-Carpe-Noctum/e545f7f1-7075-5913-b595-ba3a6abf479e/scratchpad
cd $S/$1 || exit 1
export CUSTOM_STEPS=$(python3 -c "import json,sys;print(json.loads(sys.argv[1]).get('custom_steps',''))" "$2")
python3 /tmp/resolve_level.py $S/$1 || exit 5
FID=$(python3 -c "import json,sys;print(json.loads(sys.argv[1])['feature_id'])" "$2")
python3 /tmp/ensure_feature.py $S/$1 "$FID" || exit 8
node -e "new Function(require('fs').readFileSync('night-sweep/training.js','utf8'))" || { echo "training.js SYNTAX ERROR"; exit 6; }
CUSTOM=$(grep -o "id:'custom-curves'[^}]*" night-sweep/training.js | grep -o "summary:'[0-9]* steps" | head -1 | grep -o "[0-9]*")
PARAMS=$(python3 -c "import json,sys;p=json.loads(sys.argv[1]);p.setdefault('custom_steps',int(sys.argv[2]));print(json.dumps(p))" "$2" "$CUSTOM")
python3 /tmp/resolve_guides.py $S/$1 "$PARAMS" || exit 7
python3 /tmp/resolve_readmes.py $S/$1 || exit 10
BT=$(python3 -c "import json,sys;p=json.loads(sys.argv[1]);print(p['screens'],p['features'],p['custom_steps'])" "$PARAMS")
python3 /tmp/bump_totals.py $S/$1 $BT || exit 11
python3 /tmp/normalize_index.py $S/$1 || exit 9
REST=$(grep -rl "<<<<<<<" night-sweep qa docs research handoff_docs *.md *.txt 2>/dev/null | grep -vE "^(dist/|outputs/|docs/.*\.html$)")
if [ -n "$REST" ]; then echo "UNRESOLVED NON-GENERATED: $REST"; exit 2; fi
for f in dist/functions-guide.html dist/index.html dist/release.json docs/NightSweep_1.8_Alpha_Functions_README.html docs/NightSweep_1.8_Training_Coverage.html outputs/Night_Sweep.html; do git checkout --theirs "$f" 2>/dev/null; done
bash /tmp/finish_merge.sh "$S/$1" "build3-sweep-due build3-night-log build3-registry ui-names build3-checklist" 2>&1 | tail -8
for t in training-library training-controls; do echo "== $t $(node qa/$t.test.cjs 2>&1 | grep -E '^# (pass|fail)' | tr '\n' ' ')"; done
git status --short | grep -E "^(UU|AA)"
echo "READY TO CHECK; commit with: git commit --no-edit"
