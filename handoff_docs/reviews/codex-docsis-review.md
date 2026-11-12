# PR #7 integrated exact-head review — 1f239b6

**Technical verdict: no open Important finding; both original P2 findings are addressed at `1f239b60ae82b50821761c65e442f488f4b09b1d`. Own full gate and separately executed rendered suites passed. Ready for root's formal technical COMMENT and merge once the stale PR description is refreshed.** No GitHub or author-source mutation was made by this reviewer.

## Exact head and integration

- GitHub `get_pr_info` resolved the live head before and after execution to `1f239b60ae82b50821761c65e442f488f4b09b1d`; base is current `build3` `21ed711cacbc03359e1418f79b9af6f76888ede5`, PR remains draft and mergeable.
- Detached isolated worktree: `/workspace/carpe-pr7-integrated`. Parents are the reviewed fix `0e182caafc4651329d296e54bc057040463fbcf0` and A1-merged `21ed711cacbc03359e1418f79b9af6f76888ede5`. The merge-base with current build3 is exactly `21ed711`; the earlier integration blocker is closed.
- Read the merge and shared threshold/workflow/training/shell/module-registration changes, current AGENTS, project instructions/status, plan and both lane status files. No child agents were used for this integrated-head review.
- Twelve checked source/test files match their appropriate parent byte for byte: Station, its CSS, app/jobs/alignment/engine and all three Station tests match `21ed711`; DOCSIS module, its Node suite and rendered-layout suite match `0e182ca`. Both modules and Station CSS occur exactly once in each committed app bundle. The full gate subsequently rebuilt both outputs without tracked changes.
- Merge evidence: `/tmp/carpe-pr7-integrated-merge-checks.json`. Earlier scoped receipt remains at `/tmp/carpe-pr7-fixed2-review.md`; its old-head counts are not substituted for this execution.

## Original findings and saved data

**Malformed native number controls: addressed.** Fresh Chrome DevTools MCP `press_key` inputs reproduced Chromium's empty `.value` plus `badInput:true` for `-`, `1e`, and `1e-`. Each rejected company edit retains saved maximum 7, reports why, and restores visible 7. Invalid Pmax refuses the optional default and produces no headroom; explicit zero and deliberate blank remain distinct. A genuine blank Pmax still uses the documented default when the selected upstream mode permits it.

**Company values crossing plants: addressed.** With real Sweep split controls, a 42/54 maximum 7 compares reading 9 as 2 dB above the window. Untouched 204/258 remains empty and explicitly unknown. Its separately entered maximum 12 coexists with 42/54's 7 through reload and new-job selection. Limits labels both plant values separately. A stale edit after a plant change writes neither plant.

The same newly introduced `nightsweep-docsis-windows-v1` key now holds the explicit per-plant shape. Existing released keys and saved-job schema are preserved. Fresh browser comparison found identical exported project JSON and all other localStorage key/value bytes before and after DOCSIS edits. Numeric zero survives load; an invalid stored sibling does not discard valid sibling values.

The ambiguous old single-set **development-only** `{version:1,windows:...}` shape is deliberately not migrated to either plant. Opening it preserves its raw bytes; the next successful setting save replaces it with the new per-plant shape. This is explicit compatibility scope of the unmerged feature, not a claim that old development settings migrate. No released job/backup loss defect was found.

RF constants/formulas are unchanged in the DOCSIS fix, and Station/alignment/engine match the reviewed A1 parent. No fresh outside-app RF derivation was required or claimed. The committed Decimal-reference comparisons below were rerun; older independent 154-case/746-check arithmetic remains historical.

## Own exact-head execution

All commands below completed with exit 0. Gate environment: `NIGHTSWEEP_SUITE_TIMEOUT=3600`, `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium`, `NIGHTSWEEP_RELEASE_TEST=1`; tracked-evidence writing and source/training override flags unset. Locked existing QA dependencies were reused through the authorized ignored symlink.

| Check | Own result |
| --- | --- |
| `python3 qa/run-pwa.py` | **67/67 suites, 1,296 checks**, 419.3 s suite time; build/worktree unchanged |
| `python3 qa/build3-layout.test.py` (separate execution) | **255 checks** |
| `python3 qa/browser-smoke.py` (separate execution) | **334 checks**, no page errors |
| `python3 /tmp/carpe-pr7-integrated-mcp.py` | **33 focused browser assertions**, 26 trusted input events, no console errors; 390 px and 320 px viewport checks |
| Six frozen overlap suites before the gate | DOCSIS **20 / 517 committed-reference comparisons**; Station **22**; Station field review **11**; registry **13**; guided training **41**; UI names **6** |
| `git diff --check` and final worktree/index checks | Passed; clean |

The gate includes rendered Station **121** and all retained migration, job/backup, integrity, storage-failure, offline, training and source-identity suites. These are own runs at this head. The separate layout suite also executes the committed real-keyboard badInput/plant-switch regression.

The MCP server was actual `chrome_devtools` 1.13.0 through the documented stdio bridge, launching isolated `/usr/bin/chromium` with its browser sandbox enabled and a temporary loopback HTTP server. Actual MCP tools: `new_page`, `list_pages`, `emulate`, `evaluate_script`, `press_key`, `navigate_page`, `list_console_messages` (167 calls). Evaluation navigated/focused controls, inspected state and seeded invented storage; malformed control text came from actual MCP keyboard actions. All 26 observed input events were trusted. Browser/server were closed afterward. This is desktop Chromium, not physical-phone verification.

## Immutable proof and artifacts

- Raw gate JSON: `/tmp/carpe-pr7-integrated-gate.json`.
- Full pre/post proof: `/tmp/carpe-pr7-integrated-proof.json`; `binding_verified:true`, every command exit 0, fixed exact head/tree, clean index/worktree, **542 tracked hashes and 91 source hashes unchanged**, all selected generated hashes unchanged, main README copies byte-identical. No tracked restoration was needed.
- Standalone `outputs/Night_Sweep.html` SHA-256: `56d92dcf6ae988fbfb201ccca80986a98b8ae5ac3eca2713a29a3e8bcda59814`.
- PWA `dist/index.html` SHA-256: `1d97cb859f858047f19586ea83438fc63eb0dd2b2bba7ce95d82847648c44fec` (the raw gate's `html_sha256` field).
- Separate raw results: `/tmp/carpe-pr7-integrated-layout-results.json`, `/tmp/carpe-pr7-integrated-smoke-results.json`.
- Logs: `/tmp/carpe-pr7-integrated-gate.log`, `/tmp/carpe-pr7-integrated-layout.log`, `/tmp/carpe-pr7-integrated-smoke.log`.
- MCP: `/tmp/carpe-pr7-integrated-mcp.py`, `/tmp/carpe-pr7-integrated-mcp.log`, `/tmp/carpe-pr7-integrated-mcp-results.json`; stderr `/workspace/.tools/chrome-devtools/checks/pr7-integrated.stderr.log`.
- Focused commands/times/logs: `/tmp/carpe-pr7-integrated-focused-results.json`.

The runner's smoke-summary regex initially expected another wording, leaving its summary count null despite a successful test. The saved log says `Chromium rendered checks: 334 passed`; the raw result confirms 334. The out-of-repo proof summary/parser was corrected from these existing successful outputs, without rerunning or editing app/tests.

## Remaining / untested

The top-level PR body is still stale: it says one company-window set for both plants and reports earlier-head verification; the title still says stacked on already-merged B4. The author should refresh this description to the final integrated implementation and clearly attribute own versus reviewer counts. This is the only remaining review handoff item identified here.

No private inputs, emulator, actual Android/iPhone, Safari/WebView, meter/hardware or field validation; no APK build/signing or deployment. Existing broader project gaps and source qualifications remain open. Root owns GitHub review and merge; this reviewer made no source, repository metadata, author-branch or GitHub edits.
