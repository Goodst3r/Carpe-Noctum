# PR19 scoped independent review — item 20 FCC proof-of-performance card

Date: November 11, 2026. Read-only technical review for the coordinator; no GitHub review or other upstream write performed.

**Specification verdict: changes required. Quality verdict: changes required.** Two measurement exceptions omit material FCC conditions, and the main analog reference table is poorly readable at phone widths. The new suite passes its numerical-presence checks but does not cover those conditions or usable column sizing. The reference-only boundary, lack of POP storage/input, registered source labels, and new practice routing are present. This is not approval to produce or submit proof-of-performance results or filings.

## Exact source and scope

- Repository/PR: https://github.com/Goodst3r/Carpe-Noctum/pull/19; `claude/b20-pop` into `build3`.
- Live remote head checked at the start and end: **6a0ab0377a38a06ccd23124334ac3bc947405846**.
- Own-item parent: **93f0219fbcd070c2f96d32434f896ccc2fc4d9b4** (item 18 status head).
- Own feature commit: **9e4dcf6978732c867699496fdb9a39fbad870445**. Later `7d8a117511e62c3b56ea18898c02a45819134f33` merges the current item-18 stack, and `6a0ab03` changes status. `git diff --numstat 9e4dcf6..HEAD -- night-sweep/` is empty.
- Remote `build3` and merge-base: **5588a49b10292bed422b7597ec227bce38173a2d**.
- Detached checkout: `/workspace/carpe-pr19-review`.
- Frozen standalone SHA-256: **4a8f460873aaaef29b77ccfb30a5609471bdd903fa5c75ee05214235df4b7159**.
- Frozen `dist/index.html` SHA-256: **bf13047bf2e86cbb43d7861984cd37ce1be4c3f6f126a12093d943d9a4b0fc8c**.
- Comparison `93f0219..HEAD`: 33 changed paths, 829 insertions/84 deletions. This includes the stack's merge/document reconciliation; inherited features were not re-reviewed or cleared.

Own feature files inspected: `night-sweep/proof-of-performance.js` in full; new `fcc.pop.*` registry rows and relevant source-sheet logic in `thresholds.js`; integration diffs in `shell.html`, `workflow.js`, `build.py`, `style.css`, `training.js`; `qa/build3-pop.test.cjs` in full; `pop-reference.py` and its 14 JSON clauses; POP layout assertions; tab-position edits in DOCSIS/fiber/high-split/impairment/leakage/why/design suites and runner registration; POP sections/count changes in both guide Markdown/HTML pairs and public copies; update log section 14 and relevant status changes. Generated HTML was executed, not rebuilt or edited.

Instructions/context actually read: `AGENTS.md` (main checkout copy compared identical to this checkout), automatic-plugin instructions, development instructions, project status current/progress/verification/outstanding sections, `PARALLEL_TASKS.md` rules/review checklist/queues, both lane status files, `KNOWN_GAPS.md`, `TOOLS_AND_SETUP.md`, developer build notes, `BUILD_LIST.md` general rules/item 20/supervisor boundary, PR19 body/commit list, `research/build3/POP_SOURCES.md`, and `/workspace/.tools/chrome-devtools/SETUP.md` plus its existing MCP client harness. Skills read: cloud runtime, Parallel web extraction, verification-before-completion; the using-superpowers skill explicitly excludes dispatched subagents.

## Findings

### Important 1 — Single-reading noise shortcut loses the constant-noise condition

Location: `night-sweep/proof-of-performance.js:38`; repeated in `night-sweep/thresholds.js:102`.

Repro: open Test → Proof of performance, read Noise, then click its actual `fcc.pop.noise` Spec button. Both the table and source sheet offer one bandwidth-corrected reading as an unconditional alternative to integrating successive readings across 4 MHz.

Primary §76.609(e), reopened through Parallel, permits that alternative only: **“If it is established that the noise level is constant within this bandwidth, a single measurement may be taken”** with the bandwidth correction. For a non-flat noise spectrum, the card currently authorizes a shortcut the rule does not; a single reading can miss in-channel noise. The primary-source badge does not restore the missing condition: the rendered source sheet also omits it.

Preserve this condition in the displayed instruction and registry conditions (or remove the procedural shortcut). Add a substantive condition check. The authored parser's noise clause contains only “over a 4 MHz band centered within the cable television channel,” so its passing number comparison cannot validate the shortcut.

### Important 2 — Terminal-isolation substitution accepts an unspecified sample

Location: `night-sweep/proof-of-performance.js:29`; `night-sweep/thresholds.js:93`.

Repro: read Terminal isolation and click its actual `fcc.pop.isolation` Spec button. The sheet says a maker's specification or laboratory tests “on a sample of taps” can replace periodic testing, provided the evidence is attached. It supplies no minimum sample sizes or representative-sample condition.

Primary §76.609(g), reopened through Parallel, requires manufacturer specifications based on a **representative sample of no less than 500 subscriber taps**, or laboratory tests by/for the operator on a **representative sample of no less than 50 subscriber taps**, indicating the isolation standard is met; the evidence must be attached to each POP record. The rule's record-attachment requirement is retained, but its conditions for waiving measurements are lost. An operator lab result from a single tap currently fits the card's description but does not qualify under this exception.

Either retain the qualifying conditions and primary locator when advertising this substitution or leave it as a direction to engineering/the complete clause. The copied isolation reference clause includes only the 18 dB figure and therefore does not test the exception.

### Important 3 — Phone table allocates almost all width to row labels

Location: `night-sweep/proof-of-performance.js:63` (new `<th scope="row">` table), interacting with the existing global `th { white-space: nowrap }` and `style.css:308`–309.

Repro: open Test → Proof of performance at a 390×844 touch/mobile viewport and scroll to “The analog-channel limits.” The initial horizontal position displays the row-name column across nearly the whole region. Scroll horizontally to read the rule: its words are then squeezed into very short lines. The same sizing reproduces at 320 and 430 px.

Actual Chrome DevTools MCP measurements at 320/390/430:

- First column **274.42 px**, computed `white-space: nowrap`.
- Rule column **77.33 px**, including 20 px padding; citation column **65.38 px**.
- Table **417.13 px** wide; all nine rule cells retain that narrow width.
- The visual-level row is **394.55 px** tall; the nine-row analog table is **3,787.69 px** tall.
- At 390 px, the scroll region is 302 px wide; at 320 it is 240 px.

Screenshots visually inspected: `/workspace/.tools/chrome-devtools/checks/pr19-pop-390.png` and `pr19-pop-scrolled-390.png`. No page-level overflow is present, but that does not establish usable phone reading. Give rule text a practical reading layout/width and allow long row labels to wrap. The new assertion at `qa/build3-layout.test.py:374` also accepts every table cell simply because it has a `.table-scroll` ancestor; it cannot detect this presentation failure. A targeted rendered check should inspect the actual text layout.

### Minor 1 — New source controls remain 32 px high

Location: `night-sweep/proof-of-performance.js:63`, existing `style.css:193`; new layout check `qa/build3-layout.test.py:376`.

At all four probed widths (320/360/390/430), all 16 Spec buttons are **52.44×32 px**. This misses the review's 44 px touch target and the project's general large-control intent. The project wording is general, so this is a proportional phone-polish finding, not a claimed hard accessibility failure. Existing fiber/high-split panels have scoped 44 px overrides; POP does not. Its new test only enforces 24 px.

### Minor 2 — “Every row … has a source tag” overstates the UI

Location: `night-sweep/training.js:95` (POP practice step), `docs/NightSweep_1.8_Alpha_Functions_README.md:515`, update log section 14, and PR body.

Actual rendered table: **19 rows, 16 tag buttons, 15 unique tag IDs**, with no tag on `qam`, `conditions`, or `record`. All three still have a visible rule locator, and no unregistered limit was found in those pointer rows. Change the claim to distinguish rule locators on every row from source tags on registered limits, or add the intended tags. This is documentation precision, not a new numerical blocker.

## Primary-source verification

Parallel `web_fetch` was actually invoked on these eCFR pages on November 11; their returned operative text was read. Navigation-heavy extraction was narrowed after output truncation. The main current pages display Title 47 current through November 5, 2026; returned acquisition dates were November 6/8 for .601/.605/.609 and November 11 for .1704. This is primary text returned by the configured tool, not an independently observed amendment-monitoring service.

- https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-K/section-76.601
- https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-K/section-76.605
- https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-K/section-76.609
- https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-U/section-76.1704

Checked: analog/NTSC applicability and <1,000 subscriber exemption; semiannual/seven-month interval; six test points for 1,000–12,500 plus increments, mechanically discontinuous hub and distant/geographic conditions; all-channel (b)(3)–(5) versus five/ten-channel 550 MHz sampling and the single-channel hum exception; seasonal 24-hour measurements and warmest/coldest conditions; triennial headend tests; analog numerical limits and measurement planes; QAM's ANSI/SCTE 40 2016 pointer; leakage procedure versus band-specific table distances; normal-operation measurement conditions; report contents; five-year POP retention and the small-system leakage-log boundary.

The 0/+3 dBmV, 8/3/10 dB variation figures, 4.5 MHz ±5 kHz, 10–17 dB aural, ±2 dB response over 0.75–5 MHz, 43 dB CNR, 51/47 dB coherent disturbance, 18 dB isolation, 3% hum and 170 ns/±20%/±10° headend figures agree with the primary clauses in their stated analog context. Important conditions such as remodulation's 6.5–17 dB variant, response reference, time averaging, test-point monitoring corrections, and small-system retention exemption are present in registry sheets even when abbreviated on the face of the table. The missing exceptions above remain material despite the overall engineering disclaimer.

No SCTE 204, ANSI/SCTE 40, or NCTI course body was read by this reviewer. The author also explicitly says SCTE 204 was catalog-only and NCTI was unused. The build-list source basis is therefore not fully verified; direct FCC sourcing is disclosed. Do not claim complete SCTE/NCTI procedure coverage. The Leakage pointer's 3 m placement is a §76.609(h) procedure (above 25 MHz), not a universal 3 m limit: §76.605(c) retains separate 3 m/30 m bands; this aid must remain a pointer to that table and the fuller leakage screen.

## Own verification — automated/static

Commands executed in the detached checkout using the shared locked QA dependencies via ignored symlink; no install:

- `node qa/build3-pop.test.cjs` — exit 0, **5 checks / 129 comparisons**. Frozen standalone, source registry matching, no input, navigation, job/localStorage comparison, module bundling, app self-check. These are the suite's current results, not the author's full-gate totals.
- `node qa/ui-names.test.cjs` — exit 0, **6 checks** (navigation, mutation recognizer, practice/messages/guides and rendered guide names).
- In-memory execution of `research/build3/pop-reference.py` with only its tracked-file write suppressed — all **14** JSON clause records exactly match recomputation. No tracked reference file was written. This validates parser reproducibility, not clause completeness.
- Direct jsdom inspection of both guide HTML/public-copy pairs — identical `article` text; Functions guide **45 IDs / 139 internal links**, Training coverage **10 IDs / 9 internal links**, no duplicate IDs or broken fragment references. Functions POP anchor exists in authored and public copies. Training coverage mentions POP in its task table rather than a dedicated heading.
- An initial whole-guide byte-equality assertion failed because `build-pwa.py` intentionally rewrites guide hrefs and adds `noindex,nofollow`. The corrected article/link inspection above passed; no app defect was inferred from that harness assumption.
- POP source inspection found no storage/network API. `git diff --check 93f0219..HEAD` exit 0. Final `git status --short` empty; hashes remained as pinned above.

## Own verification — rendered/browser

Executed **actual Chrome DevTools MCP 1.13.0**, launched through the existing stdio JSON-RPC client with `/usr/bin/chromium`, headless/isolated. Scripts: `python3 /tmp/carpe-pr19-mcp.py` and `python3 /tmp/carpe-pr19-mcp-extra.py` (final runs exit 0). Both serve only the synthetic/default frozen checkout over loopback and close their browser/server.

Actual tools: initialize/tools-list, `new_page`, `list_pages`, `emulate`, `evaluate_script`, `take_screenshot`, `list_console_messages`.

- 320/360/390/430 touch/mobile viewports: document width equals viewport, four focusable named scroll regions, 19 rows/four groups, zero form inputs, 14 own registry rows, no POP self-check problems. Column sizing and source targets fail the usability expectations described above.
- Real `.click()` on noise and isolation source tags opens source sheets with Spec/primary/revision/section/conditions; the missing conditions reproduce there too.
- Network set to Offline after load: Limits → POP navigation still renders all 19 rows; exported job JSON and localStorage contents match snapshots before navigation/source opening. This is an offline already-loaded standalone check, not PWA cold-start or update validation.
- Via the real Home feature select and “Load example and open feature” handler, `pop` opens the synthetic `custom-curves` job and POP panel. Actual feature ID/step/task are all `pop`; selector is `#popPanel .pop-table` (four tables); custom guide has **19** steps and **49** feature choices; all document IDs unique. Counts match the new guide changes. The practice action intentionally stores its synthetic job; the no-write comparison was before practice.
- No console errors in the final targeted probes.
- Evidence: `/tmp/carpe-pr19-mcp-results.json`, `/tmp/carpe-pr19-mcp-extra-results.json`; two screenshot paths above.
- Initial probe harness failures were corrected: mobile emulation reload lost a temporary window-global baseline; a second probe had a quoted-selector syntax error. Final runs use explicit task routing after emulation and valid selectors. These were harness errors, not app defects or passing app checks.

## Math and privacy boundaries

**No new calculation/formula is introduced by item 20.** The test-point count is prose only; no calculator or interpolator was added. No new RF math needs an external calculator result, and none is claimed. The clause-number parser is a textual check, not an engineering proof of the procedures.

No new company target/tolerance/default, data model field, storage key, network request, PII entry form, live polling, telemetry or account flow was found in the own-item implementation. The visible header explicitly says no test is made/recorded and no filing occurs; official results belong to engineering. Supervisor authorization for actual filings/company use remains a separate requirement under `BUILD_LIST.md`.

## Holds and inherited limitations

Per coordinator instruction, **did not run** `qa/run-pwa.py`, the whole `qa/build3-layout.test.py`, or `qa/browser-smoke.py` while A3's broad gate is active. No full same-head gate, rebuild reproducibility, full PWA offline/cold-start, whole-app layout, emulator, physical Android/iPhone, Safari/WebView, RF measurement, hardware or field verification is claimed. No APK/signing, private-file access, child agent, source edit, commit, push, project-metadata edit or GitHub write.

This stack still inherits the explicitly open Important findings for PR10/12 quota/time handling, PR13 stale route candidates/bad numeric input/CPD wording, PR15 fiber bad input, and PR16 R-PHY order. Their closure was not requested or established here. Even after the POP-specific fixes, the coordinator must keep those inherited blocks and arrange the required final same-head gate before merge/release. Parent/coordinator owns the formal review.
