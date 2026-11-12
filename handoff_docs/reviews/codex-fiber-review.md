PR #15 independent scoped review — changes required

Reviewed November 11, 2026. Repository: Goodst3r/Carpe-Noctum. PR https://github.com/Goodst3r/Carpe-Noctum/pull/15. No source edits, GitHub writes, merge, dependency installation, private input, APK/signing, or child agents. All entered numbers and jobs were invented. Parent coordinator owns the formal review.

**Exact revision and scope**

- Reviewed detached HEAD: `60e19c7a614dad6ae056c29fb1fe07dc911c5f81`, `/workspace/carpe-pr15-review`, fetched from `origin/claude/b15-fiber`. Final `git ls-remote` still returned this head.
- Item 11 stack parent used for the item 15 delta: `b9222bf44efc59f1de45b13ccd1a500479fe596c`, current `origin/claude/b11-impairments`; Fiber does not exist at that parent.
- GitHub PR metadata / REST base SHA at initial and final reads: `21ed711cacbc03359e1418f79b9af6f76888ede5` (`build3`). During this review the actual remote build3 advanced: final `git ls-remote` returned `bc69bb4767e71107cb8ae3f83e4134c2ffafe41e` (merge of PR #7). API base metadata had not caught up. No integration with the new base was attempted or verified. The PR was open/draft; mergeability responses differed across reads, so they are not relied on.
- Live GitHub comments were empty at initial and final reads. PR body still describes earlier `68d5617`..`ffe804c` work and earlier generated hashes/counts; those are author history, not this review's evidence.
- `night-sweep/fiber-tools.js` SHA-256: `c9dd0e01690818a4d64f820bfe2100de72d9ad8f9f4eb5a4aca1ea8425b51c72`.
- Frozen `outputs/Night_Sweep.html` SHA-256: `567b4015c7b68d280a02a78896473099cd9cc5e8a4348b9a1c0c218331303c4a`.
- `dist/index.html` SHA-256: `be61c53ce6aa1268267ba4908eed5566d54452b588873f08a8837c2c3c355820`.
- Independent in-memory assembly using the actual build token list, catalog/manual handling and DSIM replacement exactly matched the frozen standalone bytes. No build files were rewritten.
- Before/after manifest covered 163 tracked source, output, dist, doc and locked dependency files. All 163 retained their SHA-256; final tracked `git status --short` was empty. Manifest: `/tmp/carpe-pr15-manifest-before.json`, SHA-256 `860aed50a9f05f66f7363af1154ef2e9e77e70d6643420f02139d3212594eb32`.

Applicable instructions read: root AGENTS.md (only applicable AGENTS found), automatic plugin and development instructions, current project status, developer build notes, two-lane plan, both lane status files, known gaps, tools/setup and item 15 build-list requirements. Relevant feature source, tests, source sheet and guide changes were inspected. Superpowers review/verification guidance and Parallel search guidance were read.

**Changed files and purpose**

The scoped `git diff b9222bf HEAD` contains 30 paths, counting the service-worker rename as one, 2,424 additions / 75 deletions. The GitHub PR's larger diff includes inherited stack work and is not treated as all-new item 15 code.

- `night-sweep/fiber-tools.js`: new color lookup and loss/optics budget engine/UI.
- `night-sweep/{build.py,shell.html,workflow.js,style.css}`: module/panel/init, Test navigation, swatches and print exclusion.
- `night-sweep/thresholds.js`: six fiber source rows and a Fiber Limits group. Latest head also preserves the inherited Station group.
- `night-sweep/training.js`: Fiber practice feature/control and sixteenth custom-curves step.
- `docs/NightSweep_1.8_Alpha_Functions_README.{md,html}` and `docs/NightSweep_1.8_Training_Coverage.{md,html}`: Fiber directions and coverage/count updates.
- `qa/build3-fiber.test.cjs`, `qa/build3-layout.test.py`, `qa/run-pwa.py`, `qa/v20-design.test.cjs`, `qa/build3-{docsis-health,impairments,leakage}.test.cjs`: new targeted tests, registration, layout and tab-list expectations.
- `research/build3/{FIBER_SOURCES.md,fiber-reference.py,fiber-reference.json}`: provenance/gaps and author's reference cases.
- `NightSweep_Project_Status.md`, `CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt`, `handoff_docs/lanes/claude-status.md`: feature/handoff descriptions.
- `outputs/Night_Sweep.html`, `dist/{index.html,functions-guide.html,training-coverage.html,release.json}`, renamed `dist/sw.21b3eb14417eecb49416.js` → `dist/sw.aa8e3ea8fa7694442f65.js`: generated delivery changes.

No new persistence, job schema, existing storage-key change, import path, export or CSV feature was introduced in this delta. Source inspection and executed synthetic job/storage comparisons support this limited statement.

**Findings**

1. **Important — Native malformed numeric edits become omitted values and can turn an optics shortfall into a green result.** `night-sweep/fiber-tools.js:89` reads only `.value`; lines 99–102 and 108–110 select optional/alternate paths from those strings. Native number inputs expose unfinished text as `value === ''` with `validity.badInput === true`, so the engine never receives the invalid text it correctly rejects in string tests.

   Concrete Chrome DevTools MCP reproduction, exact frozen app, actual keyboard `Control+A` then `type_text('-')`:

   - Enter length 12.4, attenuation 0.35, 4 connector pairs at 0.3, 6 splices at 0.1, other loss 3.5, margin 3, TX +3 and sensitivity −8. Result is 9.64 dB estimated / 12.64 required / 11 dB available / **Short by 1.64 dB**.
   - Replace Other loss with a lone minus sign. Browser confirms `.value === ''`, `badInput === true`. The UI now removes Other loss and gives **6.14 dB estimated / 9.14 required / green ✓ 1.86 dB left**, with no error. This silently subtracts 3.5 dB from the estimate while the technician is still editing invalid input.
   - With both optics fields blank, type `-` into TX: the same badInput state is treated as “No optics numbers were entered,” not refused.
   - With tube 3 / position 6 present, type `-` into Fiber number: badInput is treated as a blank and the finder returns Fiber 30 from the alternate inputs. It can identify a different fiber instead of reporting the malformed primary entry.
   - A required length `-` does suppress the numeric result, but calls it missing; that safe required-field behavior does not protect the optional/alternate cases.

   Reject native badInput before blank/zero/alternate-field handling and retain an explicit reason. Add actual browser keyboard tests; assigning `el.value='-'` or passing `'-'` directly to the engine does not exercise this DOM state. All three failing assertions in the rendered report trace to this one root cause.

   Evidence: `/tmp/carpe-pr15-rendered-results.json` (`beforeOtherMinus`, `otherMinus`, `txMinus`, `finderMinus`), `/workspace/.tools/chrome-devtools/checks/pr15-fiber-badinput-390.png` (visually inspected).

2. **Minor — Remove the unconditional yellow-stripe instruction for tube 20.** `night-sweep/fiber-tools.js:22` says “tube 20 is black, so it takes a yellow stripe,” rendered at line 104. Corning's original AEN029, Buffer Tube Identification table, p.2, explicitly shows repeated black as **BK/WH** and says black buffer tubes use a white tracer. Prysmian's original chart uses black/yellow, while Hexatronic's chart uses clear at position 20. The app's nearby manufacturer/cable-legend caveat appropriately limits reliance, so this is nonblocking wording rather than a claim that all >12 identification is wrong. It still contradicts the source sheet/PR statement that the tool does not prescribe an exact marking. Remove the specific stripe assignment or name the manufacturer/scheme; preserve the cable-print warning. Do not claim that black necessarily implies yellow.

**Independent source verification**

Connected GitHub tools fetched PR metadata/comments; local Git and authenticated read-only `gh api`/`git ls-remote` established revisions. Connected Parallel search/fetch was actually used for engineering evidence, including original manufacturer documents:

- Corning, *Optical Fiber Color Codes*, AEN029, Buffer Tube Identification, p.2: https://www.corning.com/catalog/coc/documents/application-engineering-notes/AEN029.pdf . Confirms the 12 base colors and the repeated-black white tracer. Fetch extraction has a revision inconsistency (heading says revision 13, page footer revision 12, published 03/12/2026); I do not assert a reconciled exact revision.
- Prysmian, *Color Code Guide for Fiber Optic Specifications*, TLS-0007-1025, p.1: https://na.prysmian.com/sites/na.prysmian.com/files/media/documents/TLS-0007-0121_Color%20Code%20Guide%20For%20Fiber%20Optic%20Specifications_LR_0.pdf . Same 12 base colors; tube 20 black/yellow; separate 24-fiber-per-tube constructions. This supports keeping the 12-per-tube assumption explicit and maker markings qualified.
- Hexatronic, *Color Codes and Counting Directions for Fiber Optic Cables*, TIA/EIA-598 table, p.5: https://www.hexatronic.com/hubfs/bu-he/content-offer/Color-Codes-and-Counting-Directions-for-Fiber-Optic-Cables.pdf . Same base sequence, clear at repeated position 20; corroborates the marking variability.
- Corning, *Recommended Fiber Optic Test Guidelines*, LAN-1561-AEN, loss-budget section: https://www.corning.com/catalog/coc/documents/misc/LAN-1561-AEN.pdf . Manufacturer worksheet explicitly gives fiber attenuation × length + pairs × 0.75 dB + splices × 0.3 dB and warns that end users may require tighter limits. It cites TIA-568.3-D. This independently supports the component sum and the connector/splice allowances as vendor quotations of the standard.
- Fluke, *Fiber Optic Link Loss Budget Calculation – SimpliFiber Pro*: https://www.flukenetworks.com/knowledge-base/simplifiber-pro/loss-budget-calculation-simplifiber-pro . Supports 0.75 dB/pair, 0.3 dB/splice and 1.0 dB/km single-mode / 0.5 dB/km OSP at 1310 and 1550 nm, but cites older 568-C.3. It does not establish the current E-edition requirements.
- TIA Fiber Optics Technology Consortium's E-edition summary: https://www.tiafotc.org/tia-standards-update/tia-568-3-e . Confirms September 2022 publication and lists changes, including a multimode reference-grade allowance change. This is not full TIA-568.3-E text and does not prove every numeric allowance remained unchanged.
- Cisco, *Calculate the Maximum Attenuation for Optical Fiber Links*: https://www.cisco.com/c/en/us/support/docs/optical-networking/ons-15454-sonet-multiservice-provisioning-platform-mspp/27042-max-att-27042.html . Original manufacturer guidance corroborates summing connector, splice, length/attenuation and margin terms and the importance of wavelength.

No ANSI/TIA-598, full TIA-568.3-D or full TIA-568.3-E standard was purchased/read in this review. Values remain **secondary against those standards**. Manufacturer documents are primary for the manufacturers' own instructions, not primary verification of the full TIA standards. The six registry rows correctly disclose secondary status, old edition, missing primary verification, units and conditions; the rendered connector source sheet also disclosed E not checked / standard not read. The reference-copy controls are explicit, with blank starting fields rather than company defaults. I found no independently demonstrated numeric allowance error within these stated limitations.

Wolfram's configured `wolframcontext` was invoked with the invented worked example but returned an internal MCP error. I used fresh reviewer-owned Python Decimal arithmetic below; no Wolfram certification/success is claimed.

**Own automated checks (not rendered browser)**

- `node qa/build3-fiber.test.cjs`: **9 checks passed, 132 comparisons**, exit 0, exact frozen standalone.
- `NIGHTSWEEP_BUILD2_SOURCE_TEST=1 node qa/build3-fiber.test.cjs`: **9 checks passed, 132 comparisons**, exit 0, source assembly. These are two runs of the same committed cases, not two independent test designs.
- `python3 /tmp/carpe-pr15-independent.py`: reviewer-authored 50-digit Decimal reference, **1,139 cases per implementation**, **16,054 comparisons total**, source and frozen engine both passed, exit 0. Cases comprise all 288 fiber lookups plus all 288 tube/position equivalents, 501 separately generated budgets, and 62 refusal cases per implementation. Seeded invented data only. References do not import the app's arithmetic or the author's reference JSON. `/tmp/carpe-pr15-independent-reference.json`, `/tmp/carpe-pr15-independent.cjs`, `/tmp/carpe-pr15-independent-results.json` preserve the inputs, comparison and result.
- Independently reproduced worked answer: 4.34 fiber + 1.2 connectors + 0.6 splices + 3.5 other = **9.64 dB**, plus 3 = **12.64 dB**; +3 − (−24) = **27 dB**, headroom **14.36 dB**. With sensitivity −8, headroom is **−1.64 dB**.
- `node qa/ui-names.test.cjs`: **6 checks passed**, exit 0, including app/practice text and guide names.
- In-memory source assembly/frozen equality and before/after 163-file hash manifest: passed; no tracked changes.

Locked QA dependencies were reused via ignored symlink `qa/runtime/node_modules` → `/workspace/Carpe-Noctum/qa/runtime/node_modules`; no install/reinstall. The independent arithmetic harness initially used a reserved CommonJS variable name and was corrected before the successful result. No app change resulted.

**Own rendered checks (actual Chrome DevTools MCP, desktop Chromium)**

`python3 /tmp/carpe-pr15-rendered.py` completed through the stdio bridge documented in `/workspace/.tools/chrome-devtools/SETUP.md`, actual MCP server `chrome_devtools` **1.13.0**, `/usr/bin/chromium`, fresh isolated context, temporary loopback server. **52 scoped assertions: 49 passed, 3 failed**. The three failures reproduce Finding 1; the script records assertions rather than exiting nonzero for their failure, so exit 0 is not a clean pass.

Passed scope: Fiber at 320/360/390/430 px in app Night/Sun palettes; no page/card overflow; result/caveat wrapping; field-sized inputs (≥43 px) and Fiber buttons/source tags ≥44 px; fresh fields blank; built-in self-check; visible worked color/math results; actual malformed required-length refusal; unchanged exact exported job and all localStorage keys/values after Fiber-only edits; after-load offline calculation; custom-curves Fiber practice navigation/focus and 16-step guide with worked math; source tag dialog with explicit secondary/E-edition qualification. Network list showed only the loopback HTML request, and console error list was empty at capture.

MCP tools actually called: `new_page`, `list_pages`, `emulate`, `evaluate_script`, `press_key`, `type_text`, `take_screenshot`, `list_network_requests`, `list_console_messages`, `take_snapshot`. Artifacts: `/tmp/carpe-pr15-rendered-results.json`, `/tmp/carpe-pr15-rendered.log`, `/workspace/.tools/chrome-devtools/checks/pr15-fiber-snapshot.txt`, `/workspace/.tools/chrome-devtools/checks/pr15-fiber-badinput-390.png`. Screenshot was inspected. Browser/server closed at completion.

Early review-harness attempts exposed initial mobile emulation reloading the page and two wrong practice-test assumptions (stepsFor accepts a variant ID; guide says “TIA allowances”). The final run corrected those harness assumptions; they are not product findings or extra final failed checks. Counts above refer only to the final run.

**Inherited blockers and untested scope**

- No full gate, whole-layout suite, browser smoke, Android build/APK, emulator, physical Android/iPhone, Safari/WebView, meter, or field test was run. No final same-head integration test against advanced build3 was run. Offline verification is after-load calculation, not a fresh offline PWA install/cold start.
- Item 15 does not implement OTDR records/events, multimode/PON budgets, bandwidth/dispersion, polarity/MPO maps or company acceptance criteria. No CSV was added, so CSV round trips were not tested here. No physical cable construction, exact local company procedure or actual optical hardware values were verified.
- The parent's Important checklist-engine blockers from #10/#12 remain out of this scoped review: failure copying unreadable storage can destroy the original, and partial native-time edits can erase saved time. Supervisor release review also remains required.
- The parent's Important #13 impairment blockers remain out of this scoped review: stale route candidates, malformed search width defaulting, and CPD guidance excluding broadband ingress. `git diff 68d5617 HEAD -- night-sweep/impairments.js night-sweep/checklist.js` is empty; this PR supplies no changes to either implicated source file. This report does not claim inherited closure or repeat author counts as reviewer execution. Current upstream fixes/merges outside this exact head require their own reconciliation.

**Scoped verdict:** Changes required for item 15 because of Finding 1. Finding 2 is nonblocking. Ordinary valid-input math, provenance labeling, explicit reference copying, additive/offline behavior and the checked phone-width layout behaved as described within the tested scope. Do not merge this stacked head or call the overall gate/release complete; item 15's Important issue, inherited blockers and later exact-head integration verification remain.
