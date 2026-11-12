#!/bin/bash
# usage: run_node_suites.sh <worktree-name> — run every build3-*/sweep-grading-*/ui-names/training-* node suite by exit code
S=/tmp/claude-0/-home-user-Carpe-Noctum/e545f7f1-7075-5913-b595-ba3a6abf479e/scratchpad
cd $S/$1 || exit 1
export NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
fail=0
for f in qa/build3-*.test.cjs qa/sweep-grading-*.test.cjs qa/ui-names.test.cjs qa/training-*.test.cjs; do
  node $f > /tmp/rns-$1-$(basename $f).log 2>&1; rc=$?
  if [ $rc -ne 0 ]; then echo "FAIL($rc) $f"; fail=$((fail+1)); fi
done
echo "node suites done, failures: $fail"
