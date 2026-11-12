# A3 inherited Checklist tab assertion correction

**New clean unpublished head: `26f279f18a3dd2ea4fb1c23dcffdd4eea099b666`.** Starting exact frozen predecessor: `c6f742e4042529fa7fa254eb37b401b7f3bd6748`. Ordinary single-parent follow-up commit on `codex/sweep-due`, worktree `/workspace/carpe-sweep-due`; no amend/rebase/push.

## Failure kept as a real failed full gate

Read `/tmp/carpe-a3-peer-full-recovery2-receipt.md`, then directly asserted the preserved raw report: **72 suites,71 passed/1 failed,1,592 raw aggregate checks**,480.3s, at c6f742e. Only `build3-checklist.test.cjs` failed because its exact Job-tab list ended at Run sheet while the correct A3 UI appended Sweep due. Its missing completion marker contributes0 checks; partial PASS lines are not added. Separate layout554/smoke346 passed at that predecessor. Those are the root's earlier run and retained receipts, **not a new run by this worker**. The overall predecessor gate stays FAILED.

The frozen run had finished and been sealed before root explicitly authorized APPLY. No edits occurred during its live process. Original proof/raw/MD/seal/receipt SHA256 values were recorded and are still exact in `/tmp/carpe-a3-checklist-tab-failed-receipt-hashes.json`. Nothing in those prior artifacts was overwritten or relabeled green.

## One-line change and provenance

Applied exactly `/tmp/carpe-a3-checklist-tab-fix.patch`, SHA256`22779ddd2e40addb4865c13cc9f0e6584ab0a7f520062cc28115c49d6bfd3f6e`, after confirming c6 HEAD/branch, clean worktree/index, original Checklist blob`45a5a9229b83c2523e80cb118919d51b85aeaed0` and prepared patch identity.

Only `qa/build3-checklist.test.cjs` changed:

```diff
-assert.deepEqual(tabs, ['Details', 'ONX files', 'Checklists', 'Safety', 'Outage', 'Acceptance', 'Run sheet']);
+assert.deepEqual(tabs, ['Details', 'ONX files', 'Checklists', 'Safety', 'Outage', 'Acceptance', 'Run sheet', 'Sweep due']);
```

Exact deep equality, all seven base labels/order and all37 existing check groups are retained. The intentional eighth A3 label is appended; no assertion is skipped or weakened. New Checklist blob:`9423a4834a8e8e1359fd233c00bc2bcfd0556a12`. Every other Checklist-suite byte is unchanged.

The earlier statement that all incoming Checklist QA bytes remained base-exact describes the pre-correction integration. For this final successor it must be qualified: **one intentional integration assertion now includes Sweep due; base Checklist implementation and all remaining QA bytes stay preserved.** No app/module/registry/default/date/math/storage/job-format/version source changed.

## Own commands and actual results

All commands below executed after the predecessor seal:

| Command | Own result |
| --- | --- |
| `git apply /tmp/carpe-a3-checklist-tab-fix.patch` | exit0; exactly one QA file changed |
| `node --check qa/build3-checklist.test.cjs` | exit0 |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-checklist.test.cjs` | **37 checks passed**, exit0; `/tmp/carpe-a3-checklist-tab-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-checklist.test.cjs` | **37 checks passed**, exit0; `/tmp/carpe-a3-checklist-tab-frozen.log` |
| `python3 night-sweep/build.py` | exit0; standalone unchanged |
| `python3 build-pwa.py` | exit0; entire PWA unchanged |
| `git diff --check`; `git diff --cached --check` | exit0 |
| `git commit -m 'Include Sweep due in inherited checklist tab assertion'` | ordinary child of c6;1 insertion/1 deletion in 1 file |
| Direct hashes, parent/path/status checks | **573 other tracked hashes unchanged**, exact expected QA replacement, clean final worktree |

Both source and frozen checks reached their complete37-group marker. No A3 source/native/guide test was repeated; no full runner or separate whole-app layout/smoke was run for this successor. No passing previous test count is reattributed to this commit.

Standalone SHA256: **`94d8243bfb10deb0ce2f843e6a7512272c736627dc7ca7d66e5b0bca61e91b22`**.
PWA index SHA256:`39ccf5c7d3658b10f14ea5a1ee92f42a6f8fc0a057dc201907681d2ef4adc977`; content version`36420d81ffb705793350`. These are unchanged from c6. All574 existing paths remain accounted for;573 are byte-identical and the sole QA path has the expected one-line replacement. Lock, README pair, every product/generated/reference file and preexisting failed-run receipts stayed exact. No dependencies installed or restoration commands used.

Final proof:`/tmp/carpe-a3-checklist-tab-fix-final-proof.json`. Initial manifest:`/tmp/carpe-a3-checklist-tab-before.json`. Prepared-patch content proof:`/tmp/carpe-a3-checklist-tab-fix-proof.json`.

## Limits and next

Tools used: local Git/Node/Python/SHA256 and existing runtime only. No source feature work, authored lane status/update-log/PR write, push, full gate, dependency change, private file, child agent, APK/signing/deployment, emulator/physical Android/iPhone/Safari/WebView/native provider/RF/field check. No new formula or source research is required for an exact navigation-list assertion.

Root owns the fresh complete runner/layout/smoke under a new namespace after A4's next sole broad slot. The failed c6 run remains 71/72; these two focused37 passes do not close the whole-gate requirement or D2–D5. Independent Lane B final-head review/gate/merge remains required; Lane A cannot self-merge.
