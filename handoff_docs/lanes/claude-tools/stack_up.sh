#!/bin/bash
# usage: stack_up.sh <worktree-name> <branch> <base-branch>  — merge origin/<base> into <branch>, rebuild generated files, commit, push
S=/tmp/claude-0/-home-user-Carpe-Noctum/e545f7f1-7075-5913-b595-ba3a6abf479e/scratchpad
cd $S/$1 || exit 1
git checkout -q $2 || exit 1
git fetch -q origin $3
git merge --no-edit origin/$3 > /tmp/stack_merge_$1.log 2>&1
CONF=$(git status --short | grep -E "^(UU|AA|DU|UD)" | awk '{print $2}')
echo "$1 merge conflicts: $(echo $CONF | tr '\n' ' ')"
for f in $CONF; do case "$f" in night-sweep/style.css) python3 /tmp/union_conflicts.py "$f"; git add "$f";; esac; done
for f in $CONF; do case "$f" in qa/run-pwa.py) python3 /tmp/fix_runpwa.py; git add "$f";; esac; done
for f in $CONF; do case "$f" in night-sweep/thresholds.js) python3 /tmp/fix_thresholds_groups.py || exit 4; git add "$f";; esac; done
CONF=$(git status --short | grep -E "^(UU|AA|DU|UD)" | awk '{print $2}')
BAD=$(echo "$CONF" | grep -vE "^(dist/|outputs/|docs/.*\.html$)" )
if [ -n "$BAD" ]; then echo "NON-GENERATED CONFLICTS: $BAD"; exit 2; fi
for f in $CONF; do git checkout --theirs "$f" 2>/dev/null; done
bash /tmp/finish_merge.sh "$S/$1" "build3-checklist" 2>&1 | tail -4
if git status --short | grep -qE "^(UU|AA)"; then echo "STILL CONFLICTED"; git status --short | grep -E "^(UU|AA)"; exit 3; fi
git commit -q --no-edit; git push origin $2 2>&1 | tail -2
echo "$1 pushed $(git rev-parse --short HEAD)"
