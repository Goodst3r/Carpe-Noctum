# Independent A4 × merged A1 Station integration review

Reviewed November 11, 2026 in `/workspace/carpe-sweep`, frozen HEAD `c61b130afdeb6d69d7fcea10a9622a29c7878488`. The source/build/test freeze is ordinary two-parent merge `5f7e2e673df08d1d4efa54c6b029b6481cd813fb`, parents `e0d43f9a28cf1d79a344c84d599f592a559b386a` (published A4) and `21ed711cacbc03359e1418f79b9af6f76888ede5` (reviewed merged A1). The later six-file delta is metadata/receipt only; no source, test, guide or generated artifact differs from 5f7e2e6.

**Spec verdict: PASS for this scoped A1/A4 integration.** The additive saved sections, real v2 Station context, immutable grading snapshots, invalidation, legacy/read-only behavior, exact originals and practice/guide requirements are preserved. **Quality verdict: PASS for the reviewed delta; no new Critical, Important or Minor findings.** No source change is requested. This is an independent scoped technical review, not a Lane B PR approval, full-gate receipt, merge decision or release certification.

## Review basis and findings

Read the supplied integration handoff/diff first, then AGENTS, the automatic-plugin and development rules, the A1/A4 detail and shared-file/review rules in PARALLEL_TASKS, both lane statuses, KNOWN_GAPS, tool/build instructions, relevant feature acceptance requirements, changed source/tests/guides, and root's status/update-log reconciliation. Used Superpowers verification guidance. No child agent was dispatched.

There are no severity/file/line findings requiring correction. The following evidence supports the verdict:

- `night-sweep/app.js:301` and `:317` retain both optional import validators before owner replacement. `night-sweep/jobs.js:90` retains both Station-only and grading-only working jobs. My independent malformed-import and isolated-retention probes exercised these shared boundaries.
- `night-sweep/thresholds.js:42`, `:142`, `:146` and `:186` preserve both feature groups, accepted stores and value resolvers. Company entries still start unknown. Module/placeholder/initialization and workflow registrations retain Station and grading; `qa/run-pwa.py:17`–`:23` retains both suite families. No parser, RF formula, CRC/integrity guard, storage key, version or package change was introduced by these conflict resolutions.
- `night-sweep/sweep-grading-ui.js:37` snapshots the actual saved `.stationView.stations` map, including v2 bindings, both stages and independent dates/done flags. It does not substitute the computed `StationView.records()` API or the historical wrong `.records` saved slot. `:45`–`:59`, `:70`–`:90` and `:97` preserve identity/signature checks and the save-boundary context epoch. Actual Station edits persist through `night-sweep/station.js:97`–`:113`; changing a stage away and back during an actual WebCrypto await rejects the pending grade while preserving history. My probe also confirmed that explicit legacy binding confirmation adds a v2 copy, preserves the old raw record and demotes a live grading snapshot.
- `night-sweep/station.js:78`–`:94` retains legacy-unconfirmed/readOnly semantics. `qa/sweep-grading-ui.test.cjs:161`–`:167` exercises real disabled legacy/UBT controls and unchanged historical grading; my independent legacy-confirmation case also exercised its explicit transition. Import, profile edits, restore and Station records do not create a grade or RF acceptance/sweep record automatically.
- `qa/sweep-grading-ui.test.cjs:87`–`:168` adds eight actual-module integration cases, rather than replacing the prior attachment-only cases. They cover real Before/After edits, dates/done state, actual digest away/back invalidation, named save/duplicate/open, portable remapping/exact ZIP bytes, both validators and legacy/UBT controls. Assertions compare immutable stored records and the full actual map. The prior 35 cases remain intact. I read this coverage; the author's 43-case execution is not counted as my execution.
- `NightSweep_Project_Status.md:104`–`:122`, update-log `:139`–`:169`, and lane status `:8`–`:25` preserve both A1 and A4. They distinguish the separate fresh 21ed711 baseline receipt from focused combined integration checks, and explicitly leave the integrated full gate and Lane B review pending. The baseline JSON's expected commit is 21ed711, with its own timestamps, 66/1276 receipt, 141/331 rendered counts and baseline artifact hashes; none is represented as a run on c61/5f7e2e6.
- Functions guide `:5`–`:7`, `:590`, `:637`–`:638` and `:658`, the main guide and Training Coverage carry both features and current counts. My built-runtime check independently measured **23 task screens, 41 features; steps complete22 / six-active14 / custom11 / OEM8 / DSIM9 / manual7 / GS7K10**. All 41 Functions feature IDs match the runtime set, main README copies are identical, and all three rendered guides have unique IDs and resolved local fragments. Older historical/D4 paperwork is not claimed as reconciled.

## My executed checks (distinct from author/root results)

1. `git diff --exit-code e0d43f9 HEAD -- night-sweep/evidence.js night-sweep/evidence-archive.js night-sweep/sweep-grading.js night-sweep/sweep-grading-ui.js` — exit 0, byte-identical A4 production modules.
2. `git diff --exit-code 21ed711 HEAD -- night-sweep/station.js night-sweep/station.css` — exit 0, byte-identical reviewed Station module/styles.
3. `git diff --exit-code 5f7e2e673df08d1d4efa54c6b029b6481cd813fb HEAD -- night-sweep qa docs outputs dist` and `git rev-list --parents -n 1 5f7e2e6` — exit 0; frozen source unchanged and ordinary merge parents confirmed.
4. `NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a4-integration-independent.cjs > /tmp/carpe-a4-integration-independent.log 2>&1` — all **9 independent named scenarios completed**; final JSON reports count9, every scenario has its PASS marker, no error output or jsdom runtime errors. These were custom probes against the exact standalone, not a copied suite list:
   - Runtime counts, all Functions feature IDs and identical main README copies.
   - Unique IDs and valid local fragments in all three rendered guides.
   - Two distinct attachments of identical synthetic native ZIP containers, no automatic grade.
   - Exact actual-v2 map capture, raw PTV2.5 / PTV pass / overall unknown, unchanged Station and acceptance records.
   - Explicit legacy confirmation retaining the original, adding a bound copy and demoting current grading.
   - Stage away/back during real digest rejects without a new record.
   - Duplicate-byte restore maps each grading source to its own new evidence ID, retains exact compressed bytes and Station data, creates no current grade.
   - Both malformed optional sections reject before replacing the current owner.
   - Station-only and grading-only jobs independently survive the working-job retention guard.
5. Python verification of that log, both diff whitespace checks, exact HEAD/clean checks, and before/after SHA-256 comparison of **all 574 tracked files** — exit 0; every tracked hash unchanged, index/tree clean, no restoration used. Proof files: `/tmp/carpe-a4-review-before.json`, `/tmp/carpe-a4-review-after-proof.json`.

Pinned unchanged artifacts: standalone `e64d949f625b88533fe948a1a4131227adffe9f9d79d5906157414c42d3b52a1`; PWA index `edc3a1b762a84e63f7280f2fe7108e7e4eedfc446b41ae4c22f8239d8bd6144a`; QA lock `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8`.

## Remaining limits

Per coordinator scope, I ran no full gate, builds, broad layout/smoke, Chrome DevTools session or author-suite list. Author/root Chrome and focused-suite results are read evidence only and are not my counts. I did not open any private attachment or use real meter files. All my inputs were the committed invented native ZIP and synthetic practice data. No repository source/metadata, GitHub, branch or generated-output mutation occurred; only `/tmp` review artifacts were written.

The final integrated full gate, rendered checks and Lane B review remain required. Root reports that a later ordinary merge of the newly reviewed DOCSIS base is next; this verdict applies to c61b130's A1/A4 integration and does not cover that future delta or future count changes. Inspect the new merge/count delta and run the gate on its frozen final head. Existing compact-context (16,000 characters), grading-history/resource caps, parser limitations and deferred Station/source/performance gaps remain. No emulator, physical Android/iPhone, Safari/WebView, RF hardware, measurement-plane or field verification; no APK/signing/deployment or self-merge.

Tools actually used: local Git, Node, jsdom/fake-indexeddb, actual WebCrypto, Python SHA/receipt checks, and Superpowers verification guidance. Chrome DevTools setup was read, but no browser invocation is claimed.
