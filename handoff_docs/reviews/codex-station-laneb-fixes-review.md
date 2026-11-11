# A1 scoped re-review of Lane B's seven requested corrections

Reviewed November 11, 2026 UTC. **Scoped specification and quality verdict: APPROVE; all seven blocking requests addressed at `a9b64289e1d276416967da7a095fce20364165f1`. No new Critical or Important finding. Ready for the coordinator's final frozen gate and Lane B's actual peer re-review.** This internal review does not authorize Lane A to merge its own PR.

- Prior published head: `895503be5342dc4a713455cd7098aa5cdd08bb68`.
- Frozen fix head: `a9b64289e1d276416967da7a095fce20364165f1`.
- Original Lane B review read in full through the GitHub plugin: https://github.com/Goodst3r/Carpe-Noctum/pull/8#pullrequestreview-5861415148 .
- Isolated detached read-only review checkout: `/workspace/carpe-a1-laneb-review`. No author checkout/index/HEAD/source or GitHub mutation.

## Strengths and closure evidence

The correction preserves the pure Alignment/StationMath calculations, gives the existing solver's qualifications the same visibility as its picks, and makes equipment binding independent of mutable catalog capability numbers. The legacy policy is explicit and additive: opening/restoring does not migrate the original; confirmation creates a new identity and archives the original.

| Lane B request | Scoped assessment |
| --- | --- |
| 1. Negative-capable input keypad | `station.js:116–118` omits the decimal-only hint on forward targets/readings and signed return target/injection/receiver/EQ fields. Nonnegative frequencies/loss/pad/tolerances retain it. My exact-frozen 8-test run checks each signed field; my browser probe also persists a negative receiver value. This checks configuration and desktop Chromium, not an actual iPhone keypad. |
| 2. Source buttons inside labels | `station.js:118`, `station.css:12–17` use explicit unique input IDs and external `label[for]`, with adjacent source controls. My tests and actual label click confirm the input receives focus without a source dialog; configured320px browser width fits and all visible Station source buttons are at least44×44px. |
| 3. Missing solver qualifications | `station.js:141–150` renders all catalog notes, interpolation qualification and procedure-window verdict/source. The exact reviewed clamp case exposes its limit notes and outside-window result alongside predicted remaining errors and a remeasurement instruction. Both my frozen suite and independent browser probe confirm this against the real unchanged engine result. |
| 4. Catalog corrections unbind worksheets | `station.js:67–92` uses saved equipment/source/band/asset/port/module choices and point identity; catalog bands stay informational and refresh the banner. My browser probe saves distinct Before/After values and a dated sweep, changes the node catalog floor, restores the job and confirms both results/date plus the raw record remain exact. A real saved band selection still gives an unknown worksheet; switching back without editing recovers the original. |
| 4. Additive legacy policy | `station.js:76–112,165–181` leaves missing-version records visible/read-only with `legacy-unconfirmed` status. My browser probe verifies no state mutation on open, new identity/version after explicit confirmation, exact original archive retention and a confirmed backup round-trip. Both measurement stages remain in the saved original and confirmed copy. Retired UBT has no confirmation path to writable data. |
| 5. Mixed provenance row | `thresholds.js:51–53` replaces the combined row with independent SCU, CMTS and exact HGD entries. Manufacturer references with unestablished issued revisions are Unknown/unverified; CMTS cites its own SCTE293-7 2025 source. The existing editable42/54 Company TX entry is reused and starts unknown. No other document's revision is borrowed and no reminder fills worksheet criteria. |
| 6. Plant/model separation | `station.js:126–137` shows only the entered42/54 TX on that plant, excludes it from204/258, and shows9dBmV/6.4MHz only for exact204-split HGD. My frozen suite verifies42/HGD/LE cases. The SCU conditional receiver and configurable CMTS details are individually qualified and do not become station targets. |
| 7. Guide counts | Main/functions/training-coverage Markdown and generated HTML now use22 complete and14 six-active steps. My browser reads the actual runtime:22/14,40 feature choices,23 screens. Main README copies compare byte-identical. The retained custom-curves prose still has older unrelated count wording; that belongs with the existing D4/guide reconciliation rather than invalidating the requested22/14 correction. |

Source qualifications were checked against `research/build3/STATION_VIEW_SOURCES.md`, the changed registry and the author's explicit source-reading account. These corrections split/relabel previously recorded facts; no new RF formula or external manufacturer certification was introduced. I did not claim fresh SCTE/VIAVI/AOI body retrieval in this review. The original independent arithmetic remains applicable because the math and Alignment source are unchanged.

## Issues and deferred judgment

**Critical: none. Important: none in this scoped correction.** The prior Lane B nonblocking findings remain open unless separately fixed and verified; this approval does not imply their closure.

Considered and set aside explicitly:

- The read-only legacy policy disables its stage selector as well as data editing; the saved stage is displayed, while both stages remain available in the read API and backup. Passive browsing of both legacy stages would be a useful follow-up, but this does not lose/rewrite either stage or silently confirm a physical binding. It is not a blocker to the requested conservative legacy policy.
- Legacy-unconfirmed records still carry their historical done dates. The API explicitly exposes `bindingStatus` and `readOnly`; downstream A2/A3 must not count those dates as confirmed current-equipment work. Those consumers are not implemented by this correction.
- The original rounding, signed net-loss support, lenient registry conversion, archived-context browsing/example retention/import identity/rejected-edit, stage/focus/select/contrast/result-placement/sign/ISO/empty-button, old status spacing and dynamic-keyboard-oracle findings were not silently reclassified as fixed. Root retains the exact review list for its gap/status record.
- Actual iPhone virtual-keyboard, Safari/WebView, emulator, physical device, RF hardware/plant and field acceptance remain untested. Desktop Chromium configuration checks cannot substitute for them.

## Own executed verification

1. GitHub plugin retrieved the exact review and comments. Read AGENTS, automatic/development instructions, relevant plan/current lane statuses, build/setup/gap docs and source qualifications. Read `895503b..a9b6428` source/registry/CSS/test/guide/registration changes and the author's separate fix report.
2. `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-station-review.test.cjs` — **8/8 tests passed**, exit0, approximately20.7s. This run used the exact frozen standalone, not an uncommitted assembly. It includes signed inputs, clean labels, clamp warnings, active and node catalog retention, legacy confirmation/archive, separate provenance and plant/model conditions.
3. `python3 /tmp/carpe-a1-laneb-independent-browser.py` — **16 focused Chromium checks passed**, no runtime errors. Invented values only; fresh incognito-style browser context; loopback standalone server and all non-loopback page requests blocked. Independently covers distinct Before/After values, dated sweep, catalog correction, raw record equality, legacy no-migration/confirmation/original archive, backup round-trip, actual saved band away/back, actual label activation,320px configured viewport and44px source targets. Output: `/tmp/carpe-a1-laneb-independent-browser.log`.
4. The first custom browser probe had a harness-only assertion expecting two map entries although its earlier clamp case had also created a route record. I corrected the assertion to compare against the captured pre-confirmation count plus one, then reran the complete16-check probe successfully. This is not presented as an application failure.
5. `git diff --check 895503b HEAD` exited0; `cmp night-sweep/README.md docs/NightSweep_1.8_Alpha_README.md` exited0. Final `git status --porcelain=v1` empty; HEAD unchanged. No tracked output restoration was needed.

Standalone SHA-256 at the reviewed head: **`e2316ef77cc7ec02062bc951e8e9c3ff8a4a05b427b73c155563cdb9bda51aef`**.

No full `qa/run-pwa.py`, complete build3-layout/browser-smoke, source rebuild or guide renderer was run by this reviewer. The author's separate22/121/etc focused counts are not represented as mine. The coordinator's final exact-head gate and Lane B's peer review remain next steps. No APK, signing, deployment, private attachment or source-system write occurred.

Tools actually used: GitHub read plugin; local Git/Node/JSDOM/Python/Playwright/Chromium; requesting-code-review and Data validation guidance. The provider did not expose three linked shared Data guidance files at their referenced paths; the available scoped guidance and actual project/test definitions controlled this review. Skills provided workflow guidance, not test or source certification.
