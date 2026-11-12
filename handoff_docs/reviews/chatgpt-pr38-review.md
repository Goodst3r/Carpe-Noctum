Latest final review: **APPROVE exactb34b1db** after root complete same-head gate; see [current review and gate](chatgpt-pr38-b34-rereview.md). All text below remains historical.

# PR38 NAV-1 independent focused review

**Latest focused rereview:** [b34b1db findings closed](chatgpt-pr38-b34-rereview.md) on `b34b1db60571e758947ca5b592e14aeaf7f38d73`. The reviewer full gate is still pending separately; this is not final approval. All earlier findings and failed receipts below are retained as historical evidence for their named heads.

**Disposition: CHANGES NEEDED on `4ccd22a28c66ca8739425fdabe79ea505aafea89`.** This is a focused read-only review, not the required reviewer full-gate receipt. Root owns the full gate after the author fixes the known guide/body issues. No build, generic full gate, generic layout/smoke suite, APK, emulator, physical-device or field test was run by this reviewer.

## Pin and scope

- Worktree: `/workspace/Carpe-Noctum-pr38`, detached `HEAD`.
- Before/after all completed probes: `4ccd22a28c66ca8739425fdabe79ea505aafea89`; tracked worktree clean.
- Comparison base: `8c0fc17860c5a63bfc2bb4203601dbc9438e6253`, confirmed an ancestor of the pin. B2 is present at this head; the older PR38 missing-B2 finding does not apply to this pin.
- Read WORKFLOW/PROMPTS first, then AGENTS, project routing/development/setup/status material, NAV-1 determination and critique. No tracked edits, checkouts, GitHub writes, pushes, approvals or merge actions. All scripts/evidence are in `/workspace/scratch`.

## Findings

1. **Medium — filtered screens cannot be reached from the search field with a keyboard.** `night-sweep/workflow.js:68` assigns `tabindex=0` only to the current screen. The filtering handler at `:225–230` hides that screen without giving a visible result a keyboard entry point. In actual Chromium, open Tools / Calculators, search `fiber`, then press Tab: focus skips the only visible Fiber result (`tabindex=-1`) and enters the calculator's `Spec` button. Enter leaves Calculators selected; ArrowDown leaves focus in the search input. Reproduced at 320, 360, 390 and 430 px in dark mode. The filtered End handler itself works when a result is programmatically focused, but it does not solve entry into the result set. Portable probe: `python3 /workspace/scratch/pr38-keyboard-repro.py /workspace/Carpe-Noctum-pr38` (exit 1, four widths reproduce). Evidence: `pr38-keyboard-repro.log`, `pr38-keyboard-search.png`, `pr38-independent-browser.json` → `keyboard`.

2. **Medium — the main guide still introduces the retired tab map.** `docs/NightSweep_1.8_Alpha_README.md:12` and byte-identical `night-sweep/README.md:12` still say “The five main tabs remain Home, Route, Test, Power, and Job.” `docs/NightSweep_1.8_Alpha_README.html:10` and `dist/guide.html:10` repeat it. This is current instructional text, not a historical edition heading. Update the existing guide and its rendered copies to match Home / Plan / Field / Tools / Closeout.

3. **Medium — the existing Functions PDF is stale.** `docs/NightSweep_1.8_Alpha_Functions_README.pdf` retains old paths even though the companion Markdown/HTML use the regrouped names. Examples in page-local extracted text: p2 l57 Job → Details; p7 l2 Route → Setup; p17 l34 Test → Calculators; p30 l42 Power → Supply PM; p35 l21 Job → Outage; p41 l38 Job → Night log; p42 l37 Job → Sweep due. This is the known root finding and remains unresolved on this pin.

4. **Medium — the existing Installation PDF is also stale.** `docs/NightSweep_1.8_Alpha_Android_iOS_Installation.pdf` still says Job → Details / ONX files (p2 l14), Job → ONX files (p4 l19), and Job → Details → Save named job (p4 l23). Its changed Markdown at lines31/73–76 now says Plan → Details / Field → ONX files / Save now. Regenerate the existing matching PDF.

5. **Medium — the UI-names guard now silently skips invalid table rows.** `qa/ui-names.test.cjs:238–240` skips a missing inventory and skips any unrecognized single multiword screen name. Thus both `| Tools | Nonexistent screen |` and `| Tools | Meter setup |` pass the new guard; the latter names a real screen in the wrong group. The current-content conflict is the unrelated main README table header at line289, `| Field | What to enter |`, now accidentally matched by the new Field group name. Distinguish Markdown headers or the actual `Main work area | Task screens | Purpose` table structurally, then retain strict screen/inventory validation. Do not bypass arbitrary multiword names. Scope-child diagnostic: `pr38-screenlists-probe.cjs` (14 diagnostic probes, seven structural-prototype assertions); root independently extracted the actual current function in `pr38-screenlists-real-probe.cjs` (exit0, five reproduction assertions). These are distinct receipts; no test/product correction was made. Details: `pr38-screenlists-review.md`.

The all-five-guide PDF audit found matching current PDFs only for Functions and Installation. Main README, Equipment Coverage and Training Coverage have no same-basename PDF; no new PDF is requested. Functions PDF Safety hits are a removal note, generic fiber safety-margin text, and generic damage/theft advice, not a restored Safety screen or Safety/construction Study domain. See `pr38-existing-pdf-guide-audit.md` for the exact PDF inventory and page/line evidence.

## Independent navigation and rendering evidence

The scratch map was written from the determination, with Supply PM placed after the former Power screens. It does not derive expected groups, screen order, panels, keyboard endpoints or labels from production `WorkflowUI.groups` or `visibleIds`.

- Exact 35 screen IDs match the independent expected set in both base8c and pinned4ccd (`pr38-id-base-check.json`). Home: home/outage. Plan: nine determination screens plus powerPm. Field: eight. Tools: twelve, grouped Calculators / Limits and sources / Cards / Learn. Closeout: records/runsheet. Help remains in header Files. Safety is absent.
- Actual Chromium at 320/360/390/430 dark: all 34 group destinations clicked (136 destination checks), correct isolated expected panel(s), retained selected-tab focus, navigation actions at least44px and no horizontal page overflow. Header Help also passed all four widths after correcting the harness to distinguish the named Help panel from its two existing unnamed Help prose/footer elements.
- All five groups at all four widths passed independent Home/End/ArrowLeft-wrap endpoints; Plan ends sweepDue, Field nightLog, Tools study, Home outage, Closeout runsheet.
- Tools has four expected group headings and a vertical searchable list, without a horizontal Tools row. Plan and Field also use vertical lists at these widths. Search results, no-match feedback and filtered End behavior passed for each list group at all four widths.
- Old aliases job→projects, test→sweepSetup, equipment→parts, route→route, power→power, help→help passed; invalid/safety targets fall back to Home. In-session last-group destinations passed. Navigation preserved working-state JSON and localStorage key/value bytes at all four widths.
- Screenshots saved as `pr38-{320,360,390,430}-{plan,field,tools}.png`; 320px Plan and Tools screenshots were visually inspected. This is desktop Chromium evidence, not phone evidence.

## Data and source preservation

- Actual 1.6 fixture-app state, committed 1.7 and 1.8 complete practice backups, and a build3 practice job were loaded and all35 destinations visited. Navigation preserved state/numbers/localStorage in each. Actual named-job Save/Open/Switch, all35 navigation on the opened job, and editing after switching passed.
- 1.6 and build3 backup export/roundtrip retained exact loaded state and RF/power results, including a synthetic opaque legacy Safety field.
- For 1.7/1.8 backups with six embedded evidence files, actual `openProjectText` hydrated the originals, then real Back up project exports and reimports were compared against base8c. RF outputs at54/261/860/993MHz and power results remained identical. Existing import behavior remaps six evidence IDs on both base and current. After normalizing only those linked metadata/payload IDs, job state, repeated full exports and original base64 payloads are identical. Derived parse previews are deliberately compacted in export and rebuilt from the saved bytes; comparing export directly to live state was an overstrict harness assumption, not a NAV regression. Detailed captures: `pr38-data-diagnostics.json`; final asserted comparisons: `pr38-final-storage.py` / `.json` / `.log`.
- A focused final Chromium probe seeded the retired `nightsweep-safety-v1` key before initialization, instrumented Storage after startup, then visited all35 destinations. It passed exact state/key-value equality and zero `setItem`/`removeItem` calls. Final storage receipt: exit0, three checks passed, pin unchanged, clean tracked worktree.
- Source diff outside workflow contains group-label substitutions. `field-calcs.js`, `jobs.js`, locked QA packages and all three B2 suites are byte-identical to base. B2 physical-context guards, three registry rows and three runner entries remain. No formula, storage-key, job-field, package, version, A6 resume, per-channel/DRW or deferred-feature change found. Main README copies remain byte-identical. See `pr38-scope-subreview.md`.

## Commands, exits and harness corrections

These receipts must not be conflated with a green full gate:

| Command | Observed result |
| --- | --- |
| `python3 /workspace/scratch/pr38-independent-browser.py` | exit1; 185 recorded passes, eight recorded failures (four real keyboard failures + four Help-oracle failures), then a30s unhandled timeout when exporting the1.7 backup after loading metadata with `loadState` instead of hydrating embedded originals. Raw log/JSON preserved. |
| `python3 /workspace/scratch/pr38-independent-continuation.py` | exit1; 15 passes, six overstrict1.7/1.8 state/export assertions. Four corrected Help checks passed; named-job switching passed. Raw log/JSON preserved. |
| `python3 /workspace/scratch/pr38-data-diagnostics.py` | final exit0; captured two fixtures × base/current × first import/export/reimport/export. Explained all remaining state/export differences as existing evidence-ID remapping and expected export compaction. An earlier scratch-helper attempt timed out when it closed an already-open Files menu before the second export; its raw stdout was replaced before the preservation instruction, and that attempt is not claimed as passing. |
| `python3 /workspace/scratch/pr38-keyboard-repro.py /workspace/Carpe-Noctum-pr38` | exit1, expected reproduction at all four widths. |
| `python3 /workspace/scratch/pr38-final-storage.py` | final exit0, three checks passed (1.7 backup,1.8 backup, seeded retired-key all35 navigation); no failures. Earlier instrumentation attempt exited1 after two passes because Playwright evaluated the final assigned Storage function with the wrong receiver. Corrected scratch wrapper only; raw attempt preserved as `pr38-final-storage-attempt1.log`. |
| `node /workspace/scratch/pr38-screenlists-probe.cjs` | scope child observed exit0,14 diagnostic probes/seven structural-prototype assertions. Root actual-source probe independently observed exit0/five reproduction assertions. |
| independent base/current35-ID Python check | exit0, one check; exact independent35-ID set in both refs. |
| `git merge-base --is-ancestor 8c0fc17860c5a63bfc2bb4203601dbc9438e6253 HEAD` | exit0. |
| local `git`, `rg`, `cmp`, Python source inspection and `pdftotext` | Source/artifact review only; no generation. |

No page runtime errors were recorded by the main/continuation browser probes. Their console-error list contains one local-server404 for the absent favicon, not a JavaScript exception. The initial `file://` browser attempt was blocked by administrator policy and exited1; localhost Chromium testing worked. QA dependencies were already a real ignored directory, not a symlink.

**Remaining:** author fixes and a new head; root's own exact-head full gate and hosted-head check. No approval is transferred to a later head.

## Root follow-up: every searchable list

Root separately ran `python3 /workspace/scratch/pr38-filter-entry-check.py /workspace/Carpe-Noctum-pr38 --receipt /workspace/scratch/pr38-filter-entry-red.json` on4ccd22a (session42825), exit1: **0passed/12failed/0runtime errors**, head unchanged and empty status. Three independent destinations ×four widths: Plan Details→searchwhat-if→What-if; Field Metersetup→searchnightlog→Nightlog; Tools Calculators→searchfiber→Fiber. All sole visible results are skipped by Tab. The portable check requires search to preserve selection, Tab to reach the visible result, then Enter to activate it. This extends the existing finding to all shared searchable lists; it is not a new product patch. Original four-width Tools Tab/Enter/ArrowDown reproduction remains distinct.
