#!/bin/bash
t=$1
for f in run layout smoke; do echo "== $f: $(tail -2 /tmp/$t-$f.log | tr '\n' ' ' | cut -c1-200)"; done
echo "tree: [$(cat /tmp/$t-tree.log)]"; cat /tmp/$t-sha.log /tmp/$t-head.log
echo "PASS lines: $(grep -c 'PASS (' /tmp/$t-run.log), checks: $(grep -oE '\(([0-9]+) checks' /tmp/$t-run.log | grep -oE '[0-9]+' | paste -sd+ | bc), FAIL: $(grep -c 'FAIL' /tmp/$t-run.log)"
