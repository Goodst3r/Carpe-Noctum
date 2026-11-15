# Response to Claude review of PR61

Baseline reviewed by Claude: `4b660c493010fa9f3a1eb64e6979aace863a4bfb`. Revised candidate: build6, same PR61; record the pushed HEAD before re-review. Codex implements; Claude checks. No Grok role.

| Finding | Change / disposition | Evidence |
|---|---|---|
| H1 PDF freeze | Removed whole-result JSON from tombstones. Bounded parts/status/shortfall summary, endpoint/range levels, linear bounded wrapping and max32rows. Preview page rendering coalesces queued work. | maps-performance:98/1000points plus extreme name; actual98-point browser export and private integrated map replay; same-page, grouped, duplicate-free PDF tests |
| M1 newest BEFORE ignored | Every valid new upload is the active port sweep, regardless of optional before/after comparison label. The top-level reading and portSweep agree; a missing latest bin never revives an archived bin. | io/rf tests cover AFTER→BEFORE, unstaged replacements, independent ports and save/load |
| M2 cable editing | In-app draft dialog: source/destination, supported output-port select, cable labels, feet/metres, explicit confirmation. Cancel/Escape preserve existing route; no direction-confirm side effect. Two map taps immediately open it. Map station selection focuses its editor. | UI atomic-edit/unit/invalid-port tests; browser two-map-tap/cancel flow; mobile-width check |
| M3 native prompts | Added onJsPrompt with default-value EditText, typed-string confirmation and once-only cancellation across buttons/dismiss/replacement/destruction. UI-thread dispatch. | Production callback guard compile/execution, real full APK compile; device UX remains unverified |
| L1 unsupported inverse data invisible | Preserved unknown1GHz inverse insertion curves; now exposes solver assumptions under station details. No invented curve added. Supported Digicomm1.2 inverse candidates retain explicit slot confirmation. | Existing inverse/source tests; visible Model assumptions disclosure |
| L2 TP equipment defaults | Selected catalog equipment supplies offset/note. HGD/LE20dB references verified in supplied docs; GS7K20dB is the operator-specified HA0005Port4 example. Vecima has no verified default and requires an entry. | Unknown-offset cancel test; HGD datasheet PDFp3 and LE manual PDFpp19/62 |
| L3 nonzero compensation | Replaced unconditional rejection with explicit operator declaration: do exported Absolute values already include the meter setting? Yes removes that amount before physical TP addition; No retains exported levels; Cancel saves nothing. Raw values/configuration and declaration remain stored. | TP/direct true/false/sign tests, corrected-value bounds, UI cancel test; VIAVI FAQ does not prove export-array semantics |
| L4 free-text LE mode | Constrained select; unknown/invalid explicit mode yields unknown and a visible issue. Manual/thermal/AGC retain distinct configurations. | RF invalid-mode/source-mode tests and UI selector |
| L5 Aux below node | Intended: Aux target=node profile−configured director loss once. Passive/EOL levels are predictions, not automatic comparisons to node unity. The next active's Main target resets to the originating node-port profile. Added visible explanation. | HGD→Aux→passive→LE test; existing director-once tests |
| L6 count mismatch | Build5 had2extra native skips in Claude's environment, which lacked ECJ. Build6 adds one more native callback test. Default data/model skips are separate. | VERIFICATION.md and Android README |

## Private re-review inputs

The six supplied originals plus manifest are prepared in an ignored local ZIP. Download it from this conversation and attach it privately to Claude. Do not add the archive, private PDFs or ONX originals to GitHub/Sites. It includes both map PDFs, the ONX ZIP, HGD datasheet, LE manual and MHT copy. The review can now verify the cited HGD/LE pages and original98-point pipeline.

The integrated private test confirms76/84 updated-map identities, two adjacent test tombstones, unchanged source and duplicate-free repeated exports. Its connections are controlled test inputs, not validated plant routing. Walkout's50/78 schedule identities remain available; unreadable symbol identities still require manual binding.

Re-review only `git diff 4b660c493010fa9f3a1eb64e6979aace863a4bfb..HEAD` and the listed behavior. The remaining gates are external re-review, original-key signing and phone/emulator acceptance. No merge or device acceptance is claimed.

Portable private integration command: set CARPE_UPDATED_PDF and CARPE_ONX to the supplied local files, then run `node scripts/replay-private-map.mjs`. It reports counts/timing and verifies98samples, source hash, grouping and repeated-export duplication without writing private data into the repository.
