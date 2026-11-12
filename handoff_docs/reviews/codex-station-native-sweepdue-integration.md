# A1 PR23 integration with reviewed Sweep Due

November 12, 2026. Focused Lane A integration; root owns independent review, future base selection, serialized broad gate, publication/status and Lane B peer merge.

## Frozen identity

- Previous local source: `889ae2c3e56b2d1a9f71539931ae551817c792c1`.
- Reviewed incoming build3: `394179c7ac15ad57d19b654a4427e3b9fa2f54c0` (root reports its tree equals reviewed A3 publication0e930d13; Lane B review5867343345 and own74/1760 +554/349 remain their execution).
- Ordinary merge/frozen head: **`807e710ee9ba475e06c5653b926df0c19097738d`**, parents889 +394179c7.
- HEAD tree: `869f72cda6f56fe4e923e0f2a59d0f768cbfc2a5`.
- Owned branch/worktree: `codex/station-input-retention`, `/workspace/carpe-station-input`.
- Standalone SHA256: **`4ebe9a268b94ad156a11ede0248836329267f2946796d8284ee3ae41a4b764b8`**.
- PWA index SHA256: `d84d414f9d3d973268492100bde06c1ce8559d65a56c7e1ad6f705f2d62c3860`.
- PWA content version: **`bf89948e933ab3e39bc1`**; user app version stays2.0 Alpha build3.
- Final remote read `git -c credential.helper='!gh auth git-credential' ls-remote origin refs/heads/build3` returned exact394179c7. No further main/build3 advance was observed.

**No fresh broad gate at807 was run.** PR23 public2d837f9/source0da and its full72/1505 +554/343 stay historical. The reviewed/scoped889 results likewise retain their source. Root will choose the final reviewed base and authorize broad validation after priority A4 work.

## Source union and byte provenance

The merge authors no new product behavior. It preserves the previously reviewed A1 native retention implementation and integrates the reviewed Sweep Due/Night Log source.

Executed audit `/tmp/carpe-a1-sweepdue-audit.py`, evidence `/tmp/carpe-a1-sweepdue-byte-provenance.json`, establishes:

- Station JS/CSS and both native test files are exact889 bytes. Native draft ownership, target/binding/stage/field isolation, touched-date reconciliation, last-committed zero/raw preservation, intentional clear behavior and untouched imported-invalid policy are unchanged. No competing PR22 implementation was selected.
- Workflow equals incoming394 plus the single StationView.render()→StationView.render(true) substitution. Incoming NightLog.render(true), SweepDue.render(), routes/groups/descriptions remain exact.
- Training equals incoming394 plus the exact two prior A1 Station description strings. No feature, step or control is added by A1.
- Runner equals incoming394 plus the exact two native Station suite registrations. Every incoming dedicated Due/NightLog/Checklist/registry suite and ordering remains.
- Main README mirrors and Functions Markdown equal incoming394 plus the one prior Station incomplete-input paragraph. Corrected sixteen-step Six-active and fourteen-step Custom values remain incoming-exact.
-32 explicitly asserted inherited files are incoming-exact, including Due JS/CSS/both suites, Night Log JS/CSS/suites/fixture, App.example keep-list, Jobs optional validation/content, registry and exact nine-Job-tab Checklist/naming QA, Safety/Outage/shared engine, thresholds, shell/build/style, source references, Training Coverage and public metadata.
- Own status, ProjectStatus and update log were taken incoming394-exact with no authored successor prose. No source or artifact was imported from unmerged A4. Its future pure Station.boundRecords helper/export must still be preserved alongside native guards if that source later lands and root authorizes the next integration; it is intentionally absent from this base.

Shared Functions Markdown and workflow conflicts were resolved as incoming reviewed base plus the prior A1 deltas. Generated guides/standalone/PWA conflicts were rebuilt normally; no generated hand-merge. No new formula, numeric default/limit, range policy, parser, storage/schema/key, package/version, dependency or private-file change.

## Fresh focused software verification at807

Two sequential Node queues used `set -e`, GIT_OPTIONAL_LOCKS=0, and unset RELEASE/BUILD2_SOURCE/WRITE_EVIDENCE flags before mode-specific commands. Both queues exited0. Mode contracts were read before execution.

| Command and actual mode | Own result | Raw log |
| --- | --- | --- |
| `node qa/build3-station-native.test.cjs` — assembled source |13 groups | `/tmp/carpe-a1-sweepdue-native-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-native.test.cjs` — frozen |13 groups | `/tmp/carpe-a1-sweepdue-native-frozen.log` |
| `node qa/build3-night-log.test.cjs` — assembled source |23 checks | `/tmp/carpe-a1-sweepdue-night-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log.test.cjs` — frozen |23 checks | `/tmp/carpe-a1-sweepdue-night-frozen.log` |
| `node qa/build3-sweep-due.test.cjs` — assembled source |37 checks | `/tmp/carpe-a1-sweepdue-due-source.log` |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs` — frozen |37 checks | `/tmp/carpe-a1-sweepdue-due-frozen.log` |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-checklist.test.cjs` — assembled source |37 checks | `/tmp/carpe-a1-sweepdue-checklist-source.log` |
| `node qa/build3-checklist.test.cjs` — built HTML with source selector unset |37 checks | `/tmp/carpe-a1-sweepdue-checklist-frozen.log` |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-registry.test.cjs` — assembled source |14 checks | `/tmp/carpe-a1-sweepdue-registry-source.log` |
| `node qa/build3-registry.test.cjs` — built HTML with source selector unset |14 checks | `/tmp/carpe-a1-sweepdue-registry-frozen.log` |
| `node qa/ui-names.test.cjs` |6 checks | `/tmp/carpe-a1-sweepdue-names.log` |

The native, Night Log and Due suites use bootApp's NIGHTSWEEP_RELEASE_TEST selector. Checklist/registry use the distinct NIGHTSWEEP_BUILD2_SOURCE_TEST selector; this table labels actual modes accordingly.

### Earlier mode-label erratum is retained

The old889 author receipt mislabeled its default/explicit-release Checklist37+37 and registry14+14 invocations as source/frozen. Both select built HTML under default flags. Those immutable earlier reports remain as written with a clear erratum at `/tmp/carpe-a1-nightlog-publication-draft/mode-attribution-erratum.md`.

Root then authorized actual source-mode executions at unchanged889: Checklist37 in13.972s and registry14 in4.936s, each exit0 with correct source selector and release/evidence flags unset. Their605-file/semantic before-after proof is `/tmp/carpe-a1-nightlog-publication-draft/fresh-source-mode-proof.json`. Those are separately attributed new889 executions; this807 table is another fresh source execution, not relabeling either older result. Native13/13 and Night Log23/23 earlier mode labels were independently confirmed correct.

## Actual native editing through all three features

`python3 /tmp/carpe-a1-sweepdue-cross.py` returned **exit0,105 actual Chromium checks**,320/390px. Log `/tmp/carpe-a1-sweepdue-cross.log`, enumerated `/tmp/carpe-a1-sweepdue-cross-results.json`.

The synthetic fixture has separate Before/After readings, both done flags true, Balance2026-11-10 and Sweep2026-11-11. Actual minus/partial exponent, partial Balance/Sweep date segments and no-final-event complete Balance clear are exercised. While native badInput remains active, Sweep Due reads the committed independent dates and retains its known2027-11-11 sweep anniversary under an explicitly supplied12-month synthetic interval. Night Log's actual API and UI Add capture committed raw stages/results/work facts, never the draft. Portable backup retains Station and immutable histories. Actual Due navigation does not save or reset work. Owner replacement shows unknown dates in the new owner, and return restores original committed dates/captured history. Both forced Station/Night Log return paths remain functional. No browser error.

A separate targeted probe `python3 /tmp/carpe-a1-sweepdue-clear.py` returned **exit0,19 checks** at320/390px. Log `/tmp/carpe-a1-sweepdue-clear.log`, enumerated `/tmp/carpe-a1-sweepdue-clear-results.json`. This closes the direct Sweep-date data-flow case:

- Partial native Sweep date retains its committed date and known due date; a capture made while the draft is active records that committed date.
- Clearing all native segments becomes valid and actual focus departure records blank. Sweep Due becomes unknown with no due date, while both done flags and the separate Balance date stay exact.
- Older dated Night Log snapshots remain byte-identical. A later snapshot records deliberately blank Sweep and exact Balance. Portable export and all three views preserve both old dated and new unknown history.

These are two distinct browser executions, not one combined acceptance count. Desktop Chromium uses controlled focus/scroll and en-US date segments. No Chrome DevTools MCP/physical-device claim is made for this author execution. No new harness or product failure occurred during these807 probes.

## Runtime, guide and frozen proof

`node /tmp/carpe-a1-sweepdue-counts.cjs` exited0, independently booting exact394 standalone and current source. Screen/group definitions, all46 feature tuples, and every exercise count/summary match incoming base exactly. Actual **29 screens,46 features,nine Job tabs**, all seven arrays **22/16/14/8/9/7/10**. All46 Functions markers cover exactly the runtime IDs. Evidence `/tmp/carpe-a1-sweepdue-runtime-counts.json`, raw `/tmp/carpe-a1-sweepdue-counts.log`.

The Python byte/guide audit exited0: unique guide IDs, every local fragment resolves, and TOC order matches all H2 headings. Main31 TOC/34 fragments; Functions35/127; Training8/10. No stale A1-era counts were substituted into current base tables.

`/tmp/carpe-a1-sweepdue-final-proof.json` records all **631 tracked files** SHA256-equal to frozen HEAD Git blobs, exact HEAD/tree, semantic staged contents equal HEAD, clean status and PWA identity after focused runs. A second content/semantic comparison after the additional19-check sweep-clear probe again matched all631 exactly. No restoration. `git diff --check 394179c7...HEAD` exited0.

## Normal build commands executed

```
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_README.md NightSweep_1.8_Alpha_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
```

All exit0. Existing Marked18.2 scratch runtime/locked QA dependencies reused; no installs or lock changes. Root's later full wrapper owns broader deterministic rebuild/gate proof; current proof establishes normal builds and unchanged committed bytes after focused runs.

## Current limits and next

No full qa/run-pwa, whole build3-layout, browser-smoke, phone/emulator, Safari/WebView, screen reader, native provider/mobile keyboard/touch/rotation, RF/field validation, APK/signing/deployment/private file, push/PR/status/API write. D1 complete; D2 now only imported grading item13 pending actual peer merge. D3–D5 remain open.

Root owns independent807 delta review and will start A1 broad validation only after priority A4 current-base work, ideally after the actually reviewed A4 merge if available. Do not import unmerged A4. If build3 advances, root must authorize the next ordinary integration; preserve pure boundRecords plus all native guards then derive actual final runtime/counts/hashes again. Source807 is frozen clean.
