# Independent A4 Safety/Outage delta review

**Preservation verdict: PASS at `47010261ea93cd7ee78a0436ed1a480d8769840a`. Final A4 readiness: BLOCKED on Lane B's four required UI corrections.** The passing merge/regression evidence below does not approve the current product head. Independent actual Chromium probes reproduce three reported behavior defects, and the existing rendered suite lacks the requested visual regression guarantees.

## Frozen source

- Independent detached checkout: `/workspace/carpe-a4-outage-delta-review`; author worktree/index untouched.
- Ordinary parents: published A4 `07b3a91df01651b8bead04793973897d019a00a1` plus reviewed Outage/Safety base `3cfb9c2021eabe52644cffbe1515224b9d027cb2`.
- Standalone SHA256: `c7f6bebff9924c8d485fd3cf6939ab5dc530f43e2600b3737c32f42cf76dc921`.
- PWA index SHA256: `ec74c77ad663692a7bc6f32998fe3f77a881f67614962bc04297a12832b1c9b2`; content version `389381594407679b9bfb`.
- Station JS SHA256: `02f5e92beb5d39d3f432013da132b055924174baa34cab137a1d77a33558061a`.

Read the integration receipt `/tmp/carpe-a4-outage-integration.md`, original six-fix/startup handoff, current shared-file/guide/QA diffs and the complete newly received `/tmp/carpe-a4-laneb-second-review.md`. The latter names an inconsistent SHA; this report pins every new observation to the actual local 4701026 source, never to the review's named 570bafa. No private original was opened.

## Blocking findings independently reproduced

`python3 /tmp/carpe-a4-outage-delta-ui-red.py` exited zero with **six diagnostic/control assertions** through actual Chrome DevTools MCP1.13.0 and isolated sandboxed Chromium at360×844 touch/mobile dark. These are successful reproductions of bad behavior, not six product acceptance passes. Evidence is `/tmp/carpe-a4-outage-delta-ui-red.json` and `.log`.

1. **Required1, failed criterion autosave is not reported beside the input/status.** With a synthetic failing `Storage.prototype.setItem` for `hfc-route-v1`, trusted keyboard entry changes PTV3→4 in memory while stored PTV remains3. The adjacent error is empty/hidden and `gradingStatus` says only `Criteria changed. Current grade is stale / unknown.` The existing global warning is visible in DOM but its rendered top is−2188px when the criterion is in view. Source handler `sweep-grading-ui.js:116` ignores `saveLocal()===false`. A correction needs distinct save-failure feedback without marking an otherwise valid number mathematically invalid.
2. **Required2, actual Grade button discards the invalid draft and refusal.** Trusted keys enter−1: the positive control verifies named adjacent invalid feedback and saved PTV3 retained. Clicking the real Grade button adds no history, but resets the input to3, clears ARIA invalid/error text and replaces the refusal with `Saved criteria restored after the panel refreshed. Current grade is unknown.` A second actual click then adds a grade using3. The click catch's `render()` clears the invalid map; direct `api().grade()` tests do not exercise this event path. Preserve the refusal/draft or explicitly explain the refused invalid entry under the chosen correction contract.
3. **Required3, rendered coverage gap retained.** Read the entire current `qa/sweep-grading-layout.test.py`; its47 checks verify general input/button height and overflow but never measure adjacent error position/visibility, invalid noncolor styling, or all eight source-tag sizes. Fresh47 passes below therefore do not pin the previously corrected CSS. No CSS mutant was run here; Lane B's deletion experiment remains attributed to Lane B. Add those meaningful rendered assertions at the new freeze.
4. **Required4, binary-float tails reach displayed results.** A synthetic10.2/10.3/10.4dBmV trace with tilt target0.2 and zero error allowance yields correct stored overall`pass`, while the actual card prints `0.20000000000000107` measured tilt and `1.0547118733938987e-15` error. Display formatting must preserve exact stored numeric results and existing decisions; no parser/math/schema change is authorized by this finding.

The MCP probe uses actual trusted numeric keys and actual Grade clicks; only the storage fault and synthetic fixture setup are injected. All six diagnostic assertions reproduced on the first completed run. No implementation was made by this reviewer. Root recalled the author for required1–4; final independent re-review and a new exact-head gate remain necessary.

## Merge preservation and original six fixes

Machine evidence: `/tmp/carpe-a4-outage-delta-provenance.json` and `/tmp/carpe-a4-outage-delta-tuples.json`.

- **31 A4 implementation/test/fixture/provenance files match published07b byte for byte:** parser, archive, evidence UI, grading core/UI, Station including `boundRecords`, app optional-section keep-list, jobs, core/parser suites, synthetic fixtures, formats/core notes and numerical reference sources. No original bytes, format recognition, checksum/CRC path, optional schema or context-digest format changed in this integration.
- **Eight inherited module/QA/source files match3cf byte for byte:** checklist, Safety, Outage, both checklist suites, existing whole-layout suite and both source notes. Build-module tuples are the exact ordered union of both parents; placeholders appear once. Both generated apps embed the exact current12 checked modules, including parser/archive/grading/Station and Safety/Outage/shared wiring.
- Threshold source equals prior A4 after removing only the three incoming Unknown checklist rows and their group. Every one of the prior105 registry tuples and incoming66 tuples compares deeply equal by ID in the **108-row** exact union. Existing grading profile resolver/store grouping remains. All32 company profile criteria have no default value and all seven grading application guards remain Unknown.
- All **44 incoming feature tuples and order** form the exact current prefix; the unchanged grading tuple appends as45. Current27 screens retain the base group/routes; only the already-existing A4 evidence description differs from base. Actual source/frozen UI suites confirm integrated runtime. All seven practice arrays and displayed card counts agree: **22/14/15/8/9/7/10**.
- Grading UI bytes and all seven prior feedback/label/44px CSS rules are exact oldA4 content. Thus original six-fix implementation is retained: bounded raw-bound context, named adjacent invalid feedback, rerender flag/text consistency, labels/source controls, Unknown guard registration, and updated guide coverage. Fresh52 suites exercise the associated old guarantees, including warm500 startup and both await windows. The newly identified Grade-click and autosave paths qualify that preservation result; they were not covered by the original guarantees.
- **The new A1 native-input correction is excluded.** Station remains exact07b; workflow still uses `StationView.render()` rather than the unmerged fix's forced call. A2/A3 are not imported. This review does not assert that the separate A1 defect is fixed here.

## Own executed focused checks

All commands below exited zero on4701026; counts are this reviewer's new runs, not copied author counts.

| Command | Own result | Evidence |
| --- | --- | --- |
| `node qa/sweep-grading-ui.test.cjs` |52 checks passed | `/tmp/carpe-a4-outage-delta-ui-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/sweep-grading-ui.test.cjs` |52 frozen checks passed | `/tmp/carpe-a4-outage-delta-ui-frozen.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-native-evidence.test.cjs` |69 passed,0 failed, synthetic only | `/tmp/carpe-a4-outage-delta-native-frozen.log` |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/sweep-grading-layout.test.py` |47 rendered checks passed | `/tmp/carpe-a4-outage-delta-rendered.log` |
| `node /tmp/carpe-a4-outage-delta-tuples.cjs` |6 independent grouped audits passed | `/tmp/carpe-a4-outage-delta-tuples.log` and `.json` |
| `python3 /tmp/carpe-a4-outage-delta-guides.py` |5 independent grouped guide audits passed | `/tmp/carpe-a4-outage-delta-guides.log` and `.json` |

The52 suites include actual Station binding-v2 handlers, raw Before/After/dates/done context, fourteen bound plus900 archived worksheets, both actual digest-entry guards, warm500/reload with zero pre-Alignment RF calls, optional-section persistence/remapping, raw old-context history retention and legacy/UBT behavior. The69 parser cases and47 rendered cases use only synthetic native/interchange fixtures. The47 suite runs actual Chromium at320/360/390/430; it covers partial numeric refusal,2.5dB PTV pass, stale-result marking, native gzip's unreferenced2dB/Unknown result and byte-exact original portable export. It does not cover the four new requirements completely, as demonstrated above.

## Current guide audit

Audited all three authored HTML guides and all three PWA counterparts. Each has unique IDs, every local fragment resolves, automatic TOC entries equal H2 headings in exact order, and authored/PWA article text is identical despite intended link/meta rewrites.

| Guide pair | Unique IDs each | H2/automatic TOC each | Local fragments each |
| --- | ---: | ---: | ---: |
| Main |79 |29 |32 |
| Functions |41 |34 |123 |
| Training coverage |10 |7 |9 |

The explicit Functions Markdown contents has33 entries (excluding its own contents heading), matches all remaining H2s in order, includes Station and places grading before Known limits. All45 unique feature markers match the runtime IDs exactly. Every one of the seven exercise rows in both Main/Functions tables matches the current array count, including custom15. Functions27/45 and Coverage22/14/15/45 references agree. The full Functions grading section is byte-identical to prior A4; both main README Markdown copies are identical.

One scratch guide assertion used the Functions label `Complete field workflow` in the Main guide, whose real button label is `Open complete training job`. It failed after four valid groups; only the audit selector was corrected and broadened to all seven actual table labels. The final five-group run passes. Preserved failed audit: `/tmp/carpe-a4-outage-delta-guides-initial-label-assumption.log`. No product text changed.

## Strict proof and limits

`python3 /tmp/carpe-a4-outage-delta-proof.py` exited zero. `/tmp/carpe-a4-outage-delta-proof.json` proves every **611 tracked file** has unchanged SHA256 from `/tmp/carpe-a4-outage-delta-before.json` and equals the exact frozen HEAD blob. HEAD, working tree and staged contents are clean; `git diff --exit-code`, cached diff and diff-check all passed. No restoration needed. Only ignored dependency reuse and temporary proof scripts/artifacts were written outside tracked source.

A temporary exec-server disconnect occurred before the first provenance/test batch could start. After environment recovery the clean source and absence of all proposed artifacts were verified, and the commands above started fresh. No interrupted result was relabeled as passing.

No broad gate, rebuild, new reference-arithmetic/CRC campaign, private owner-original probe, dependency install, author source/index write, GitHub write, APK/signing, emulator, physical phone, Safari/WebView, screen reader, meter/reference-plane, supervisor or field verification was performed. The47 rendered suite uses its existing Playwright Chromium configuration; the six diagnostic probes use actual MCP sandboxed Chromium. No manual screenshot/pixel review is claimed. Original recorded nonblocking gaps remain; none is silently closed. Root's A1 gate is separate.

Next: author fixes required1–4 without parser/math/schema changes, freezes a new head, and receives focused independent source/rendered/actual-button/quota/format-preservation re-review. Root owns subsequent whole gate, metadata/publication and Lane B final-head review/merge. **4701026 must not be described as ready to merge.**
