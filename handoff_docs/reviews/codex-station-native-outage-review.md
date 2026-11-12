# Independent Station/Outage integration delta review

**PASS at `0da7e6a50ab26e0a774074a6943250833d60752f`. No new scoped source or integration finding.** This read-only delta review complements the earlier independent Station review; it does not replace root's whole gate or Lane B peer review/merge.

## Exact frozen revision

- Independent detached worktree: `/workspace/carpe-a1-native-outage-delta-review`.
- Ordinary merge parents: previously reviewed Station `bc58b0f376f30b18f87fbac184065265094faf1b` and reviewed Outage/Safety base `3cfb9c2021eabe52644cffbe1515224b9d027cb2`.
- Standalone SHA256: `5e0f9ee5b0b94135314cc6d80df4ea53fc7aa70f68abc2ab2ad34d9f1019d126`.
- PWA index SHA256: `02d817d67774d59c7d63bd2cbc0b334974db65011b861f2b9f928a32311ac661`; content version `06114beeff5a74524661`.
- Station JS SHA256 remains `07f1686ce274344c5b650feec50a72cfd026f1c7144205bbedeb854bb3c5d64a`.

Reviewed the integration diff against both parents, the exact shared-file hunks against 3cfb9c2, and the author report `/tmp/carpe-a1-outage-integration.md`. The earlier independent Station report is `/tmp/carpe-a1-native-input-review.md`; its counts remain attributed to bc58b0f.

## Independently proven byte provenance

`python3 /tmp/carpe-a1-native-outage-delta-provenance.py` exited zero. Machine-readable proof: `/tmp/carpe-a1-native-outage-delta-provenance.json`.

- Station JS/CSS and both native regression suites are **byte-identical to reviewed bc58b0f**. No Station implementation or test fix was added during this integration.
- All **540 base files outside the exact Station delta paths** remain byte-identical to 3cfb9c2. This includes Outage, Safety, shared checklist, thresholds, math, storage/evidence code, shell, build registry, style, inherited QA, training coverage, sources, status and update log.
- Ten shared files were checked by removing only the exact earlier reviewed A1 edits in memory: workflow, training, runner, three Markdown guide copies, two rendered authored guides and two PWA guides. The result equals the respective 3cfb9c2 blob **byte for byte**. Thus no base route, feature, practice step, test registration or guide content disappeared. PWA guide link transformations were preserved rather than assuming PWA/authored HTML bytes should match.
- Workflow retains its single `StationView.render(true)` reconciliation change; Outage and Safety routes/panels remain registered. Training contains only the two prior Station prose additions on top of the base. The runner contains only the two prior native Station suite entries on top of the base.
- Both frozen apps embed the exact current Station JS/CSS, workflow, training, checklist, Safety and Outage module bytes. The mirrored main README Markdown files are identical.
- The net diff against 3cfb9c2 is the same 18 Station entries (19 paths when the generated hashed-worker rename is counted as deletion/addition): scoped Station source/style, workflow call, practice text, guides, QA and normal generated artifacts. No new module, formula, limit, target, package/version identity, key or saved schema is introduced by the integration.

Early scratch provenance assertions were corrected solely in the audit: neighboring guide context changed with Outage; a renamed worker must be counted with `--no-renames`; and PWA guide links intentionally differ from authored HTML. No product source changed in response. The retained final provenance script makes the final comparisons explicit and passed in full.

## Own fresh focused executions on 0da7e6a

Every command below exited zero. Existing dependencies were accessed through an ignored link; no install or dependency change occurred.

| Command | This reviewer's result | Evidence |
| --- | --- | --- |
| `node qa/build3-station-native.test.cjs` | 13 source groups passed | `/tmp/carpe-a1-native-outage-delta-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-native.test.cjs` | 13 frozen groups passed | `/tmp/carpe-a1-native-outage-delta-frozen.log` |
| `node /tmp/carpe-a1-native-outage-delta-counts.cjs` | 3 source integration groups passed | `/tmp/carpe-a1-native-outage-delta-counts-source.log` and `.json` |
| `NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a1-native-outage-delta-counts.cjs` | 3 frozen integration groups passed | `/tmp/carpe-a1-native-outage-delta-counts-frozen.log` and `.json` |
| `python3 /tmp/carpe-a1-native-outage-delta-mcp.py` | 51/51 actual Chromium checks passed | `/tmp/carpe-a1-native-outage-delta-mcp.log` and `.json` |

The independent integration groups verified runtime **27 screens, 44 unique practice feature IDs**, live Station/Safety/Outage navigation, and all seven actual practice arrays: Complete22, six-active14, custom14, OEM8, DSIM9, manual7, GS7K10. They also checked the combined functions guide's Station input paragraph, Safety/Outage sections and current 22/14 Station practice text. These assertions ran against both assembled source and exact frozen standalone.

The native source/frozen suite covers draft preservation, intentional clearing, first-invalid input, owner/target/source/stage isolation, untouched imported invalid text, existing range-error policy and legacy/UBT guards. As before, jsdom's missing native badInput bit is supplied for the Node tests; actual native semantics were separately exercised through Chromium.

The actual MCP run used server1.13.0, isolated sandboxed Chromium, synthetic local fixtures, mobile/touch dark emulation at **320 and 390 × 844**, with statistics/CrUX disabled. It used explicit focus/centering and trusted keys for lone minus, zero, partial exponent, partial native dates and deliberate clears. Refused input retained whole job state, autosave bytes, awaited project export, calculation results and timestamps. Blur restored the latest recorded reading, including zero. Explicit Home-to-Station navigation restored the same cached input before reuse.

**Both Balance and Sweep began done=true with separate dates.** At both widths, partial native dates left committed state unchanged and restored the exact recorded date on focus departure. Clearing all native date parts produced no final input/change event; the touched focusout path still committed the intended blank while retaining both done facts and the other date. Untouched imported hidden invalid raw survived focus/blur/navigation. There were no Chromium console errors or page overflow.

The new run contains 51 own assertions, not the author's 89. This delta did not repeat the prior eight comprehensive adversarial groups or the separate prior visual/ARIA probe because the Station implementation/style/test files are byte-identical; that prior evidence stays attached to bc58. The new MCP assertions verify invalid marking but are not a new complete accessibility review. Screenshot captured at `/workspace/.tools/chrome-devtools/checks/a1-native-outage-delta-390.png`.

## Strict retention and limits

`python3 /tmp/carpe-a1-native-outage-delta-proof.py` exited zero. `/tmp/carpe-a1-native-outage-delta-proof.json` proves all **558 tracked files** have the same SHA256 as the before manifest **and the exact frozen HEAD blob**. HEAD remains 0da7e6a; working tree and staged contents are clean. `git diff --exit-code`, `git diff --cached --exit-code` and `git diff --check` passed. No restore operation was needed.

The inherited Home exercise summaries still say21/13 while actual arrays are22/14. This is retained base content, already addressed within A2 according to root; it is not a new A1 finding or a reason to expand this fix. No D4/whole-plan completion claim is made.

No source edits, author-worktree/index writes, new commits, GitHub writes, broad runner, rebuild, whole-app layout/smoke, dependency install, private attachment access, APK/signing, physical phone, emulator, Safari, WebView, screen-reader or meter/field test was performed here. Controlled desktop Chromium focus/scroll is not physical touch/keyboard certification. The author's focused89 and root's separate full gate remain separately attributed. No new engineering formula required a derivation.

Next: root combines this delta PASS with the exact-head full gate, publishes the draft/status evidence and obtains Lane B review/merge. No additional critical scoped probe or open integration finding remains.
