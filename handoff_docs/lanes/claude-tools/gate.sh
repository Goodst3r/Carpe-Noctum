#!/bin/bash
# usage: gate.sh <worktree-name> <tag>
S=/tmp/claude-0/-home-user-Carpe-Noctum/e545f7f1-7075-5913-b595-ba3a6abf479e/scratchpad
cd $S/$1 || exit 1
export NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
rm -f /tmp/$2-done
python3 qa/run-pwa.py > /tmp/$2-run.log 2>&1; echo "run-pwa exit $?" >> /tmp/$2-run.log
python3 qa/build3-layout.test.py > /tmp/$2-layout.log 2>&1; echo "layout exit $?" >> /tmp/$2-layout.log
python3 qa/browser-smoke.py > /tmp/$2-smoke.log 2>&1; echo "smoke exit $?" >> /tmp/$2-smoke.log
git status --short | grep -v node_modules > /tmp/$2-tree.log
sha256sum outputs/Night_Sweep.html > /tmp/$2-sha.log
git rev-parse HEAD > /tmp/$2-head.log
echo done > /tmp/$2-done
