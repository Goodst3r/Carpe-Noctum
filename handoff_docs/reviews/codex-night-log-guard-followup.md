# A2 application-guard consistency follow-up

Starting published head: `c385bb0bea05b20e99b500f762d20f9116e87eac`.
Clean cap-guard checkpoint: `cd6d9091a2a89b58b807cc0e6ae113685cc8eb2a`.
Final integrated ending head: `b0d1643b9d423756ea5e9e14d321bdcb9523ba1b`.
This is the existing 200-entry cap’s registry/source presentation, not a new cap, RF formula, company target or backup format. No push/PR/merge-to-build3/full gate.

## Changed files and why

- `night-sweep/thresholds.js`: one `nightLog.entries.max` Unknown/unverified application-guard row, value 200, units entries/job, source `night-log.js` application guard, build-3 revision, validate/addEntry locators, checked date and explicit software-only conditions; one Night log application guards group.
- `night-sweep/night-log.js`: one source tag beside Recorded entries in its own section header, outside input labels. Existing CSS provides the 44 px target; all capture/validation/persistence/report/export functions and the cap are unchanged.
- `qa/build3-registry.test.cjs`: one focused regression for row/provenance/group/tag placement, source sheet, 44 px minimum, unchanged job/autosave and exact 200/201 add/import boundaries.
- Main README Markdown pair and rendered HTML: clarify Unknown application-guard source and limits; pair remains byte-identical. Functions Markdown/HTML adds the same cap source meaning and lists the guard in Limits.
- `research/build3/NIGHT_LOG_SOURCES.md`: identifies this existing software bound and its registry/source button.
- `outputs/Night_Sweep.html`, affected `dist/**`: normal generated rebuilds only.

## Own checks at cap checkpoint

- RED: `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-registry.test.cjs` failed because the new night-log cap row was missing, before implementation. Log `/tmp/carpe-a2-guard-red.log`.
- `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-registry.test.cjs`: **14 checks passed**, exit 0. `/tmp/carpe-a2-guard-registry-source.log`.
- `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-registry.test.cjs`: **14 checks passed**, exit 0. `/tmp/carpe-a2-guard-registry-frozen.log`. Both final invocations cover the 201-entry import rejection as well as add rejection.
- `NIGHTSWEEP_RELEASE_TEST=1 node qa/ui-names.test.cjs`: **6 checks passed**, exit 0. `/tmp/carpe-a2-guard-ui-names.log`.
- `python3 qa/alpha18-release.test.py`: **6 checks passed**, exit 0, including guide fragments/local links and generated source identity. `/tmp/carpe-a2-guard-guide-links.log`. Native metadata remained pending; no APK/device result.
- `python3 /tmp/carpe-a2-guard-devtools.py`: **8 actual rendered width/palette groups passed**, exit 0, using installed Chrome DevTools MCP through `checks/probe.py` with isolated `/usr/bin/chromium`. At 320/360/390/430 px and night/sun, source button is at least 44×44, outside labels, opens correct Unknown/200 entries/job sheet, restores focus, preserves job/autosave and has no document overflow. No console errors. Receipt `/tmp/carpe-a2-guard-devtools.json`; screenshot `/workspace/.tools/chrome-devtools/checks/night-log-guard-390.png` was opened and visually inspected. MCP tools actually invoked: new_page, list_pages, emulate, evaluate_script, take_screenshot, list_console_messages. An initial screenshot-only selector escaping error in the temporary harness was corrected; the final run exited 0. Browser/server closed.
- `CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs`: exit 0 (30 sections / 133128 bytes).
- Same renderer with `NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html`: exit 0 (31 sections / 112836 bytes).
- `python3 night-sweep/build.py`; `python3 build-pwa.py`: exits 0. Repeated builds matched all 23 generated file hashes (`/tmp/carpe-a2-guard-build.json`). PWA content version `dfbba988abe26183eaae`, 20 offline assets.
- `node --check night-sweep/night-log.js`; `node --check night-sweep/thresholds.js`; `cmp night-sweep/README.md docs/NightSweep_1.8_Alpha_README.md`; `git diff --check`: exits 0.
- Final checkpoint `git status --short`: empty. No lane status files, private inputs, dependency installs, child agents, APK, or signing changes.

Checkpoint standalone SHA-256: `63afd67a2b8d76605d9cbd370320b450f8dce603fb1187494af15fe8f8dfe22a`.
Checkpoint PWA index SHA-256: `2becac7a7bf74f7dded44173a5ee7f2c7a93a9bed22d6927ba8fe8fddeb7cbba`.

## Pending integration and limits

Parent has now directed ordinary integration of reviewed build3 `5588a49b10292bed422b7597ec227bce38173a2d` (leakage) after this clean checkpoint. Integration is now complete; final ending head/hashes and focused evidence are recorded below. No full gate or whole layout/smoke run is authorized yet. No emulator, physical Android/iPhone/Safari/WebView, native save/share, meter/reference-plane or field verification is claimed.


## Final integration freeze

Ordinary merge of exact reviewed build3 `5588a49b10292bed422b7597ec227bce38173a2d` was recorded at `2eae39ab438f40eb3a6a57bec800edbd32c770e8`; the final append/order correction is `b0d1643b9d423756ea5e9e14d321bdcb9523ba1b`. No rebase, force, push, PR, upstream merge or history rewrite. Final worktree is clean.

Merge conflicts were resolved additively in shell/init, workflow visibility, threshold groups, training control maps/summaries and guides. Station, DOCSIS, leakage and Night log registrations/stores/groups all remain. The incoming Leakage module is byte-identical to reviewed build3; Night-log module is byte-identical to cap checkpoint `cd6d909...`. Root directed retention of the already-merged guide Leakage entry **42**, with draft Night log appended as **43**. The actual feature choices now retain the exact 42-entry merged-base order and append `nightLog`; IDs remain `leakage` and `nightLog`. Combined guides/counts match **26 screens / 43 choices / AOI 15 steps / custom-curves 12 steps**. Rendered conflicts were regenerated normally. Status files came through the ordinary merge without author edits; root owns final reconciliation/receipts.

Exact final focused driver: `python3 /tmp/carpe-a2-guard-final.py`. Receipt `/tmp/carpe-a2-guard-final.json` pins head `b0d1643...`, matching pre/post standalone hash, and empty final status. All five invocations exited 0:

| Exact command | Own final result |
| --- | --- |
| `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-registry.test.cjs` | 14 checks passed |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-registry.test.cjs` | 14 checks passed |
| `NIGHTSWEEP_RELEASE_TEST=1 node /tmp/carpe-a2-guard-integration.cjs` | 6 checks passed |
| `NIGHTSWEEP_RELEASE_TEST=1 node qa/ui-names.test.cjs` | 6 checks passed |
| `python3 qa/alpha18-release.test.py` | 6 checks passed |

The integration checker compares the merged feature prefix with the actual source at `5588a49...`; checks all 43 guide feature IDs once, guide numbering/counts, all registry groups/stores and row validation, byte-identical leakage source, and opens both real leakage and Night-log practice features/controls. The registry check covers source metadata/Unknown classification, list/group/source sheet, separate labels, 44 px minimum, add/import 200/201 boundaries and no state/autosave writes. No broad behavioral suite was repeated.

`python3 /tmp/carpe-a2-guard-devtools.py` was rerun against the final frozen standalone: **8 phone-width/palette groups passed**, exit 0. Source button remains at least 44×44 px outside labels; correct source sheet, returned focus, unchanged job/autosave, no horizontal overflow or console errors. Final receipt `/tmp/carpe-a2-guard-devtools.json`, final log `/tmp/carpe-a2-guard-devtools-final.log`; earlier cap-checkpoint receipt preserved as `/tmp/carpe-a2-guard-devtools-checkpoint.json`. Screenshot remains `/workspace/.tools/chrome-devtools/checks/night-log-guard-390.png`. Browser and loopback server closed.

Three affected guide renderers were run with the same existing Marked 18.2 scratch runtime: default main guide (30 sections / 133128 bytes), Functions (32 sections / 120835 bytes), and Training Coverage (7 sections / 19280 bytes). All exited 0. `python3 night-sweep/build.py` and `python3 build-pwa.py` were repeated at final head; **all 23 generated file hashes matched**, content version **8c13bff1348b74b7a6ab**, 20 offline assets. Receipt `/tmp/carpe-a2-guard-build-final.json`. `cmp` main Markdown copies, `git diff --exit-code`, `git diff --check` and final `git status --short` all passed/empty.

Final SHA-256:

- Standalone: `348ea3647bbdb9497b7dc5e1827eb054c4f460319321af2c7040f54cade509d1`.
- PWA index: `b24fd4ae2a311fe2297616d9c859545869f26c87eed79ebf56d5aa0c56733605`.

No whole `qa/run-pwa.py`, `build3-layout.test.py`, browser smoke, complete Night-log/Leakage behavioral suite, APK/signing or device/field test ran for this follow-up. Earlier full-gate counts are not reused as new execution. Root must independently review this delta and schedule the next same-head full gate. Parent holds publication and root-owned statuses/receipts.
