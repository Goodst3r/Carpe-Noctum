#!/bin/bash
# usage: stack_level.sh <worktree-name> <branch> <base-branch> '<json params for resolve_guides.py>'
# merges origin/<base> into <branch>, resolves the known conflict kinds, renders/builds, runs focused suites; does NOT commit or push.
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
/tmp/stack_finish.sh "$1" "$4"
