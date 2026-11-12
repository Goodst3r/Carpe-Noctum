# Independent incremental review: A4 integration of reviewed DOCSIS base

Reviewed November 11, 2026 at clean metadata HEAD **2043d62fb3b472a1773d06d3fdc6353abf2db6f6** in `/workspace/carpe-sweep`. App/QA/guides/build are identical to source freeze **25d5bb32bf311630d7fe077933e4b62e1acbea1f**, whose ordinary merge parents are c61b130afdeb6d69d7fcea10a9622a29c7878488 and reviewed build3 bc69bb4767e71107cb8ae3f83e4134c2ffafe41e.

**Spec verdict: PASS for this incremental integration. Quality verdict: PASS. No new Critical, Important or Minor findings; no correction requested.** This supplements `/tmp/carpe-a4-station-integration-review.md`; its unchanged nine-scenario A1/A4 scope was not repeated. This review does not replace the pending exact-head combined gate, rendered checks or Lane B PR review.

Read `/tmp/carpe-a4-basebc69-integration.md` and `/tmp/carpe-a4-docsis-integration-review.diff`, then inspected the authored shared delta, guide/count reconciliation and current root metadata. Existing plan/AGENTS/rules and verification guidance remain applicable from the preceding review.

## Evidence for the verdict

- `night-sweep/thresholds.js:172` keeps the union of profile/sweep/grading/station/docsis stores; `:177`–`:183` retain the Station/grading resolvers alongside DOCSIS. `:205` preserves both grading-profile and DOCSIS edit routes. `:220` retains all prior groups and adds the two DOCSIS groups. DOCSIS range/text display additions leave numeric and unknown grading/Station values intact. My runtime probe checked every prior registry ID survived, IDs remain unique, every row passes registration validation, all five stores remain, both company displays start Unknown, all four relevant groups render, and both source-sheet edit buttons navigate correctly.
- `night-sweep/training.js` retains the grading and Station steps/features/selectors while adding the DOCSIS custom-curve step/feature/control. The generated runtime independently measured **24 screens, 42 features, complete22/six-active14/custom-curves12**. Both grading and DOCSIS controls exist on their destinations. Functions has exactly42 unique feature markers matching the runtime feature IDs; main README copies are identical. All three rendered guides have unique IDs and valid local fragments.
- `night-sweep/build.py`, `shell.html`, `workflow.js` and `qa/run-pwa.py` add DOCSIS module/panel/init/navigation/suite registration while retaining Station and A4 registrations. `app.js:301`, `app.js:317` and `jobs.js:90` remain byte-identical to the prior review, preserving both validators and both optional-only retention guards. No repeated validator/retention test was needed.
- A4 parser/archive/core/UI, Station JS/CSS, app and JobsUI are byte-identical to c61b130. DOCSIS production module and its source suite are byte-identical to reviewed bc69bb4. No new RF math, parser/integrity, schema, identity or storage-key behavior is introduced by this merge.
- Current Project Status, build3 update log and Lane A status show current24/42/22-14-12 counts and retain A1/A4/DOCSIS context. They explicitly mark the final combined A4 gate pending/not started. PR7's67/1296 +255/334, the21ed baseline and earlier5f focused results are described separately from the new focused integration checks. None is presented as a completed full gate on2043d62/25d5bb3.

## My checks, separate from author/root receipts

- `NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a4-docsis-independent.cjs` — **exit0**, one focused incremental runtime probe. Verified counts, registry union/IDs/groups/unknown values, both source-sheet edit routes, actual SC-QAM16 input yielding1.0dB above, unchanged job/no automatic grade, all42 guide IDs, main README equality and rendered fragments. No jsdom errors.
- `git diff --exit-code c61b130 HEAD -- night-sweep/evidence.js night-sweep/evidence-archive.js night-sweep/sweep-grading.js night-sweep/sweep-grading-ui.js night-sweep/station.js night-sweep/station.css night-sweep/app.js night-sweep/jobs.js` — exit0.
- `git diff --exit-code bc69bb4 HEAD -- night-sweep/docsis-health.js qa/build3-docsis-health.test.cjs` — exit0.
- `git diff --exit-code 25d5bb3 HEAD -- night-sweep qa docs outputs dist` — exit0; root's later changes are metadata only. Ordinary parents independently checked with `git rev-list --parents -n 1 25d5bb3`.
- `git diff --check`, cached check, and Python before/after verification of **all584 tracked hashes**, HEAD and clean status — exit0. All tracked files unchanged, HEAD remains2043d62, worktree/index clean, no restoration. Proof: `/tmp/carpe-a4-docsis-review-before.json` and `/tmp/carpe-a4-docsis-review-proof.json`.

Standalone SHA256 **6610884a1b4e5a94c4453cef41ee719b86cbeb2e4342fbfbdf1bb41765912adc**; PWA index **c5bec837cf815846803c0f903683a92b9e7461f6b0f24b861285bb12541bd94f**. These match the integration freeze.

## Limits

No full gate, rebuild, broad layout/smoke, author-suite list, browser/MCP run or repeat of the unchanged c61 nine scenarios was executed by this reviewer. Author/root focused/browser/PR7 counts are read evidence only. No private files or real attachments were accessed; no repository source/metadata/generated output, GitHub or branch mutation; only `/tmp` review artifacts were written. Existing nonblocking gaps and device/field limits remain. Root may proceed to the authorized final combined gate at the frozen head; Lane B peer review and no-self-merge rule remain in force.

Tools actually used: local Git, Node/jsdom, Python hashing, and previously read verification guidance.
