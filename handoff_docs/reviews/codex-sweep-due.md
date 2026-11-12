# A3 sweep-due tracker — current keyboard-pagination successor

**Current clean head:** `52fac6902d2f2872ec28ca42115589df814cf5a3` on `codex/sweep-due`.

**Current standalone SHA-256:** `9ae7f1c393d6d1b1fbe9fc89e0b1a30010fbdae7ea80dcb77c7255577d894e01`.

**Current PWA content version:** `7e4e4389e027a22e31a0` (20 offline assets).

This is the requested scoped accessibility successor to `1020e7731b518a9b43c24043c11ee2e7ffe00952`. Root's independent reviewer reproduced a concrete P3 issue: actual Enter on focused Next changed the page but rebuilding the navigation removed its active button, leaving focus on BODY. The next Tab resumed at bottom navigation and lost the new page's starting context.

The author reproduced RED on the old frozen app with real Playwright `page.keyboard.press('Enter')`: **“320px keyboard next to page 2 focuses page context (actual BODY)”** failed. Receipt: `/tmp/carpe-a3-logs/keyboard-red.log`. Root cause was the pagination `innerHTML` replacement followed by scrolling without a focus destination.

The correction adds a programmatically focusable `h3#sweepDuePageSummary` immediately before the cards. It displays the new page and entry range when pagination is present. Next/Previous update the cards, focus that summary with `preventScroll`, then scroll it to the new page start. Interval edits continue to retain their input focus. There is no change to collection, calendar math, saved data, interval parsing, counts or page bounds.

Changed paths relative to 1020 are limited to `night-sweep/sweep-due.js`, the focused rendered regression, generated standalone/PWA index/release and the normally regenerated hashed service worker. **No status, guide, lane, registry or unrelated source edit. No push or PR.**

Exact scoped commands/results:

```sh
# Before the source fix: exit 1, expected actual BODY focus failure.
NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-sweep-due-layout.test.py > /tmp/carpe-a3-logs/keyboard-red.log 2>&1

python3 night-sweep/build.py
python3 build-pwa.py
node qa/build3-sweep-due.test.cjs > /tmp/carpe-a3-logs/keyboard-source.log 2>&1
NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs > /tmp/carpe-a3-logs/keyboard-frozen.log 2>&1
NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-sweep-due-layout.test.py > /tmp/carpe-a3-logs/keyboard-final.log 2>&1
node --check night-sweep/sweep-due.js
git diff --check
git diff --cached --check
```

**Own successor checks: source 33, frozen 33, focused rendered 121, all passed.** The rendered suite now uses actual Enter events for Next → page 2 → last/page 3 and Previous → page 2 → first/page 1 at 320/360/390/430 px. Each transition asserts the page summary has focus, is visible at the page start and still renders only 25 or 13 records. First/last disabled directions, interval editing focus/raw `0018`, and byte-identical full state plus both existing storage keys are asserted. No browser page errors. This is desktop Chromium with phone viewport emulation, not a physical device or screen-reader certification.

The normal standalone/PWA builds were repeated after commit: **139 source/document/build hashes unchanged and clean worktree**. Manifest: `/tmp/carpe-a3-keyboard-manifest.json`. The prior 1020 standalone hash was `d0fd54c6869ab86ea11fa5048898b0156e2b6db0990d5a9febee7ff793b4966e`; current hash is the 9ae7f1…94e01 value above.

The reviewer `/root/review_a3_sweep_due` received the exact successor and evidence directly for narrow actual-MCP re-review. That reviewer result is owned by the reviewer/root; no new author MCP run is claimed for this small follow-up. Full gate, whole-app layout/smoke and publication remain held for the coordinator. Existing physical device/native/Safari/WebView/hardware/field limitations remain unchanged.

The detailed original implementation/source/reference/browser record follows. Its 1020 hashes, 73-check initial layout result and original MCP evidence are historical; use the current successor and 121-check focused result above.

---

# Original A3 implementation record through 1020e773

Ready for independent source review and coordinator gate execution. No push, PR creation or integration-branch merge was performed.

## Exact source and artifact identity

- Worktree: `/workspace/carpe-sweep-due`; branch: `codex/sweep-due`.
- Initial reviewed build3: `bc69bb4767e71107cb8ae3f83e4134c2ffafe41e`.
- Initial A3 checkpoint: `bdacb41238aa0fa27482bc1abab024b5377d7c72`.
- Ordinary merged reviewed build3 base: `5588a49b10292bed422b7597ec227bce38173a2d` (PR 9 leakage integration).
- Ordinary merge checkpoint: `260f67913eb7b2448a83acacd0d2b95af910e45b`.
- Pre-pagination-fix implementation freeze: **`1020e7731b518a9b43c24043c11ee2e7ffe00952`**.
- Pre-pagination-fix standalone SHA-256: **`d0fd54c6869ab86ea11fa5048898b0156e2b6db0990d5a9febee7ff793b4966e`**.
- Final generated PWA content version: `335a1ad6500fc3bdb7b2`; 20 offline assets.
- Final normal rebuild left **139 source/document/build hashes unchanged**, identical main README copies and a clean worktree. Snapshot: `/tmp/carpe-a3-frozen-manifest.json`.
- Both lane status files, `leakage.js`, the incoming shared base style, and leakage QA remain byte-identical to the reviewed 5588 base. No A2 or A4 source was copied.

## Implemented behavior and self-review

`Job → Sweep due` is appended to the Job tabs. `SweepDue.collect({working,snapshots,today,interval})` is a read-only collector returning new groups, rows, diagnostics and complete work/practice counts. The pure collector requires an explicit civil today; absent today stays unavailable. `readView()` is the thin adapter that obtains local device today and calls current state plus `JobsUI.snapshots()`; it never reads localStorage independently, opens a job or changes Station selection/work dates. Metadata is used for names/node labels only. No persistent results cache.

Collection uses actual `StationView.targets()` / `records()`, matching holder identity, point, equipment and installed context. Removed/replaced targets and source asset/port/module changes cannot borrow archived dates. Only one uniquely matching nonempty saved job ID is overlaid by current work. Copies sharing Station IDs stay separate by job; missing/repeated IDs keep index-scoped sources and visible diagnostics rather than arbitrary suppression. Failed library scans keep readable current work and display “Saved jobs unavailable — reason”. Per-owner Station shape failures are visible while other owners continue.

Separate balance/sweep date text, validity and completed-calendar-month age remain visible. Only bound/current, writable, checked, valid nonfuture sweep records supply reminders. Unchecked-with-date, recorded-without-date, invalid/future, legacy binding-unconfirmed and retired/read-only UBT states stay neutral; no calculator, job metadata date, training progress, history-capture time or evidence date supplies work dates. Binding confirmation retains its original event dates. Each source retains SYNTHETIC TRAINING / SAMPLE markers; practice reminder totals are separately labeled.

The optional top-level `state.sweepDue = {intervalMonths: rawString}` is created only by an actual edit. It uses existing autosave/named/duplicate/full-JSON paths and the existing keys/schema/version. The field stays text with `inputmode=numeric`, max 20 characters, and the identical strict digits-only 1–1200 parser is used by the registry. Blank is unknown; invalid raw strings remain visible without colors/due dates; leading zero text remains intact. Preference-only work is retained by `JobsUI.hasWorkingContent()`. Import validates optional shape before replacement; save failure leaves the in-memory input and export-backup guidance.

Gregorian civil-date helpers accept exact YYYY-MM-DD, years 0001–9999, and validate month lengths without Date.parse/UTC normalization. Anniversaries always add months to the original date and clamp its original day. Age counts completed clamped anniversaries. Warning is `ceil(2*N/3)` months, due is N months, and red wins when coincident. Future dates, invalid today and derived year overflow remain unavailable. This is explicitly an **Unknown / unverified application reminder policy**, implementing the authorized 12-of-18-month example; no Hranac/company cadence or RF acceptance is inferred. The older 18-month guidance has its own Unknown, unverified, reference-only registry row and never supplies a default.

The interval has one clean for/id label with sibling source button, nearby live unknown/invalid error text, focus preserved during edits, and 44px controls. Words/icons accompany colors. Long names wrap at tested 320/360/390/430 widths. DOM output is bounded to 25 entries per page while complete source/station/reminder counts and navigation remain visible. No performance gain is claimed. Entering, Refresh list and visible-tab resume refresh actual data/local today. Empty state links to Station and job Details.

Current combined runtime totals are **26 task screens / 43 feature choices**, with incoming Leakage retained as feature **42** and Sweep due appended as **43**. Exercise steps are complete 22, six-active 15, custom 12, OEM 8, DSIM 9, manual 7, GS7K 10. Runtime summaries and current main/Functions/Training Coverage tables match. The Functions index contains exactly one marker for every runtime feature, every current section is in its contents, fragments resolve, and rendered IDs are unique. Main README copies remain identical. Existing unrelated D4 prose remains for its owner.

## Files changed relative to reviewed 5588

- `night-sweep/sweep-due.js`, `sweep-due.css`: civil math, optional preference validation, pure collection/adapter, diagnostics/counts and paged phone cards.
- `night-sweep/app.js`: additive optional preference validation before import replacement.
- `night-sweep/jobs.js`: preference-only working-content retention.
- `night-sweep/workflow.js`, `shell.html`, `build.py`: tab/panel/render-entry/init/module registration; retain all incoming leakage additions.
- `night-sweep/thresholds.js`: grouped preference/policy/calendar/range/older-unverified-reference rows; strict `sweepDue` store resolver, allowed store, grouping and source-sheet edit link. Incoming leakage store/resolver/groups retained.
- `night-sweep/training.js`: one six-active reminder step, additive feature/control mapping; reconcile existing stale Complete/six-active summaries with actual step counts and preserve incoming custom/leakage additions.
- `night-sweep/README.md` and `docs/NightSweep_1.8_Alpha_README.md`: identical A3 guide/current counts; correct the current custom-practice table count.
- Current Functions / Training Coverage Markdown and their rendered HTML: A3 instructions, complete feature/index/TOC coverage and measured combined totals. Main guide HTML rendered as well.
- `qa/build3-sweep-due.test.cjs`: 33 meaningful contract groups, including actual state/Station/library purity, API identity guards, persistence/failure/import/refresh and calendar references.
- `qa/build3-sweep-due-layout.test.py`: 73 focused rendered checks, synthetic named jobs only.
- `qa/run-pwa.py`: two A3 suite registrations after existing build-3 suites.
- `research/build3/sweep-due-calendar-cases.json`, `sweep-due-calendar-reference.py`: supplied independent 14-case table, recomputed with Python stdlib datetime/date and calendar.monthrange, with no app code import.
- `NightSweep_Project_Status.md`, `CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt`: own A3 sections with implementation, exact focused results and verification limits.
- `outputs/Night_Sweep.html` and generated `dist/` app/guides/release/hashed worker: normal builds only; no generated hand merge. Prior generated worker pruned by builder.

## Sources and tools actually used

Read `/tmp/carpe-a3-scope.md` first; followed the authorized concrete interfaces, limits, safeguards and approved app reminder policy. Read project AGENTS, automatic/development instructions, status, developer build notes, plan/rules/A3, both lane statuses, known gaps/tools/build list and affected real A1/Jobs/registry/navigation/training/QA source. Stale waiting prose was overridden by root's actual merged-A1/latest-base directions. `/tmp/carpe-a3-calendar-reference.json` supplied the independent cases; the committed Python replay independently recomputed all 14 and matched actual app outputs.

Used Superpowers TDD / verification guidance, local Git/Node/Python, existing locked jsdom/fake-indexeddb QA runtime via ignored symlink, existing Marked 18.2 scratch runtime, Playwright/Chromium, and actual Chrome DevTools MCP 1.13.0 through the supplied bridge. No dependency install, external cadence/spec lookup, newly invented citation, Figma file, cloud service or private file access. No child agent.

## Exact verification commands and OWN results

All commands ran in `/workspace/carpe-sweep-due` unless an absolute path is shown. No full gate/whole-app rendered layout/browser smoke was run, per coordinator direction.

Build/docs:

```sh
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Alpha_Functions_README.md NightSweep_1.8_Alpha_Functions_README.html
CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/carpe-station-doc-runtime/node_modules node docs/render_readme.cjs NightSweep_1.8_Training_Coverage.md NightSweep_1.8_Training_Coverage.html
python3 night-sweep/build.py
python3 build-pwa.py
```

All exit 0. Final normal rebuild after commit preserved the manifest's 139 hashes and clean tree. Guide HTML contains 30 main-guide sections, 32 Functions sections and 8 Training Coverage sections (renderer count includes Guide contents in Functions).

Final successor-specific checks:

```sh
node qa/build3-sweep-due.test.cjs > /tmp/carpe-a3-logs/source-final.log 2>&1
NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-sweep-due.test.cjs > /tmp/carpe-a3-logs/frozen-final.log 2>&1
NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-sweep-due-layout.test.py > /tmp/carpe-a3-logs/layout-final.log 2>&1
python3 research/build3/sweep-due-calendar-reference.py
python3 /tmp/carpe-a3-devtools.py > /tmp/carpe-a3-logs/devtools-final.log 2>&1
```

Results: **33 source groups; 33 frozen groups; 73 new rendered checks; 14 independent calendar cases**, all exits 0. All 14 reference rows compare actual app age/warning/due/status (56 field comparisons per app execution). Both app modes also cover strict date/interval errors, month-end/leap/year 1/overflow, explicit-today purity, DST/date-only behavior, local Nov 10 vs Nov 11 at the same instant in Los Angeles vs UTC/Kiritimati, and unchanged explicit-today output across those timezones. The subprocess timezone replay uses the authored pure module; the 14-row application comparisons execute the selected source/frozen app respectively.

Retained integration checks executed after ordinary 5588 integration at 260f679, before the final one-line pure-collector missing-today guard and its new test (retained code was not subsequently changed):

```sh
node qa/build3-registry.test.cjs > /tmp/carpe-a3-logs/registry.log 2>&1
node qa/ui-names.test.cjs > /tmp/carpe-a3-logs/ui-names.log 2>&1
NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station.test.cjs > /tmp/carpe-a3-logs/station.log 2>&1
NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-review.test.cjs > /tmp/carpe-a3-logs/station-review.log 2>&1
node qa/build3-leakage.test.cjs > /tmp/carpe-a3-logs/leakage.log 2>&1
node qa/training-library.test.cjs > /tmp/carpe-a3-logs/training.log 2>&1
node qa/named-jobs-storage.test.cjs > /tmp/carpe-a3-logs/jobs.log 2>&1
node qa/v20-design.test.cjs > /tmp/carpe-a3-logs/design.log 2>&1
```

Own results: registry **13**, UI names **6**, Station **22**, Station review **11**, Leakage **32 / 391 independent-reference comparisons**, training library **11**, named-job storage **5**, design **8**, all exit 0. These are separate scoped suite counts; no broad-gate total is implied or borrowed from root.

Additional executed checks: `node --check` on `sweep-due.js`, `training.js`, `thresholds.js`, `workflow.js`; `cmp night-sweep/README.md docs/NightSweep_1.8_Alpha_README.md`; `git diff --check`; `git diff --cached --check`; `sha256sum outputs/Night_Sweep.html`; no remaining conflict markers; direct final-base diffs confirm unchanged incoming leakage source/style/QA and both lane statuses.

The 139-file hash replay used Python hashlib over authored source/doc/build paths, rebuilt normally, recomputed every hash and asserted equality plus empty `git status --porcelain`. Receipt: `/tmp/carpe-a3-frozen-manifest.json`.

## Actual browser proof

The final `python3 /tmp/carpe-a3-devtools.py` uses `/workspace/.tools/chrome-devtools/checks/probe.py` as a JSON-RPC stdio client for the actual installed Chrome DevTools MCP 1.13.0, with isolated headless `/usr/bin/chromium`, usage statistics and CrUX disabled, and a temporary loopback server. Its seven actual MCP actions are `new_page`, `list_pages`, `emulate`, `evaluate_script`, `take_snapshot`, `take_screenshot`, `list_console_messages`.

Final frozen synthetic inspection at 390×844 mobile/touch emulation: **21 rows**, three named synthetic jobs, **7 green / 7 yellow / 7 red**, separate sweep/balance text, **no horizontal overflow**, one clean interval label, zero nested source buttons, no console errors. Invalid `18x` remains focused and visible with nearby “Interval invalid” and **zero** colored reminders. The actual accessibility snapshot exposes textbox **“Sweep reminder interval (whole calendar months)”**, with the preference/interval description, and a distinct Company source button. Screenshots were visually inspected, including the full Station card and invalid-input error.

Artifacts outside Git:

- `/workspace/.tools/chrome-devtools/checks/a3-sweep-due-results.json`
- `/workspace/.tools/chrome-devtools/checks/a3-sweep-due-summary.json`
- `/workspace/.tools/chrome-devtools/checks/a3-sweep-due-invalid.json`
- `/workspace/.tools/chrome-devtools/checks/a3-sweep-due-390-snapshot.txt`
- `/workspace/.tools/chrome-devtools/checks/a3-sweep-due-390.png`
- `/workspace/.tools/chrome-devtools/checks/a3-sweep-due-card-390.png`
- `/workspace/.tools/chrome-devtools/checks/a3-sweep-due-invalid-390.png`

The script records final standalone hash d0fd54…4966e. Browser/server were closed. Only generated synthetic practice was used.

## RED history, resolved issues and limits

The first authored contract failed on missing SweepDue, confirming the feature was absent. Later RED probes caught missing empty-state links, stale runtime practice-summary counts, and the collector's omitted-today clock fallback; each was fixed and rerun. Early test setup initially called a private Station confirmation function; it was corrected to use the actual binding-confirmation button. A temporary merge-helper regex consumed too much conflict text; unmerged files were immediately restored from index stages and conflicts then resolved with a line-bounded pattern. The malformed intermediate never became a commit or passing claim. Source/frozen/focused rendered/retained checks above all ran after correct resolution, and generated output was rebuilt normally.

No known unresolved A3 defect was found in self-review. Full `qa/run-pwa.py`, separate whole-app `build3-layout.test.py` and `browser-smoke.py` remain **unrun for A3** because root explicitly held broad checks pending independent review/latest-base coordination. The final one-line omitted-today guard has fresh source/frozen/new-rendered/actual-DevTools checks; retained suites are precisely dated above rather than relabeled as fresh successor execution.

No physical Android/iPhone, emulator, Safari/WebView, native picker/retention, actual quota exhaustion, meter/hardware or field verification. Fault injection is synthetic. No maximum-library performance measurement or speed claim. The calendar/warning/range policies and 18-month attribution remain explicitly unverified as maintenance guidance. No new dependency/key/version/package/schema/APK, cloud/Supabase, signing/private evidence, push/PR or publication.

Original next step was coordinator review/gate of `1020e773…`; use the current pagination successor above for narrow re-review and the final gate. The coordinator owns receipts/lane handoff and authorized publication. A2/A4 remain published draft PRs and are not merged. A3 depends only on merged A1; no source was borrowed from those drafts.
