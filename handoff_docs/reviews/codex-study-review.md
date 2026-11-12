# PR20 scoped independent review — Study mode

Reviewed November 11, 2026, read-only, in detached `/workspace/carpe-pr20-review`. Parent coordinator owns the formal GitHub review. No source, tracked evidence, PR metadata, or upstream writes; no dependency installation, private-file access, APK, or child agents.

## Revision and scope

- Canonical repository: `Goodst3r/Carpe-Noctum`; PR20, `claude/b19-study`.
- Live exact head, confirmed with `git ls-remote` and PR API before review and `ls-remote` afterward: `7f2b393ecc08ebe06d895891d6fcc7b84be08ae2`.
- PR base and own-item parent/merge base: `6a0ab0377a38a06ccd23124334ac3bc947405846`, `claude/b20-pop`. Feature commit `adac33d`; subsequent merge `bbe2ba031b94f6f7ac652a56b7d620d2ef3395ef` and status-only head. This review does not substitute the supplied integration reference `5588a49b10292bed422b7597ec227bce38173a2d` for the actual PR head.
- Frozen standalone SHA-256: `533a654c9a1e3afa328182e65ac2e46ad68cd3ad62fae1e1f0ca3bed4683534c`.
- `dist/index.html` SHA-256: `959e81896722a84d57aa01598f0e72d1d5cc0ee8c493ee5c0051516560cc05a3`.
- Targeted review only. Parent's A3 full gate is active; **full runner, whole layout suite, and whole browser smoke were held**. No author counts are claimed as this reviewer's execution.

## Verdict

**Specification:** the requested item19 core exists: original seeded questions across all five stated domains, generated from app calculations/reference data, no exam-bank import, and offline in-memory scoring. Standing RF qualification requirements need the OFDM prompt correction below.

**Quality:** one **Important** qualification finding and one **Minor** usability/documentation finding. The arithmetic matches independent derivations under its assumptions; targeted state/input/offline checks passed. Recommend correcting the Important finding before approving this item. This is not approval of the inherited stack or the integration head.

## Findings

### Important — state the OFDM calculation's flat-power/occupied-band assumption in the question

Location: `night-sweep/study-mode.js:53` (generator `ofdm6`, including its working).

The scored question asks, for example, “A downstream OFDM channel measures 36 dBmV of total power over 48 MHz. What is its power per 6 MHz?” It marks 26.97 dBmV correct and displays the division-by-bandwidth relation without stating that the example assumes equal power per 6 MHz/flat PSD or identifying the bandwidth in the prompt as occupied bandwidth. Those assumptions are present in the existing calculator and registry (`field-calcs.js` `ofdmPower`; `thresholds.js:114`) but are lost in the lesson. A total over an arbitrary tilted/excluded spectrum does not identify the actual power in each 6 MHz segment. An explicitly normalized average is another valid question, but that must be named.

This was reopened against primary material in this review, not inferred from author notes: SCTE 293-10 2025 §5.8 and footnote6 discuss per-6-MHz variation; SCTE 258 2026 §6.2.1 note4 says the Section7 calculations assume flat PSD and that tilted DAA output needs a different approach. The official SCTE update page confirms the same restriction. Fresh rendered MCP observation at 390px showed neither the prompt nor the revealed working contains that qualification (screenshot `pr20-ofdm-390.png`).

Requested change: make this a flat-PSD example with explicitly occupied bandwidth, or explicitly ask for normalized average power; retain the qualification in the revealed working/source context and add a targeted wording check. No formula change is required for a flat example.

Sources actually reopened:
- https://account.scte.org/documents/8214/SCTE_293-10_2025.pdf — selected §5.8/5.9 and footnote6 excerpts, not a full-document read.
- https://account.scte.org/documents/8422/SCTE_258_2026.pdf — selected §5.2, §6.2/6.2.1 note4, §7/7.2 and occupied-bandwidth excerpts, not a full-document read.
- https://www.scte.org/standards/standards-updates — relevant SCTE2582026 update block.

### Minor — show the tolerance that the guide says is stated

Locations: `night-sweep/study-mode.js:188` and `docs/NightSweep_1.8_Alpha_Functions_README.md:528`.

The guide promises “a small stated tolerance,” but the numeric prompt/answer label and feedback never render `q.tol` or `q.relative`. These differ materially by generator: ±0.05 dB, ±0.01 dB, ±0.5%, ±1%, or exact integer MHz. A learner cannot see how much rounding is accepted before submitting. The public source note also calls tolerance “stated per question.”

Requested change: show the accepted tolerance or requested precision beside the numeric answer, and keep the guide accurate. This did not cause an arithmetic mismatch in the tested cases.

## Own executed verification

### Automated DOM and named-control checks

- `node qa/build3-study.test.cjs` — exit0, **7 checks / 296 comparisons**. This is jsdom plus the author's independent Python-decimal reference; it is not rendered Chromium. Covers all generators, numeric reference, choices, strict decimal rejection/tolerances, scoring, navigation links, no job/localStorage writes, self-check.
- `node qa/ui-names.test.cjs` — exit0, **6 checks**. Current practice and guide control names.
- Used only the ignored symlink `qa/runtime/node_modules -> /workspace/Carpe-Noctum/qa/runtime/node_modules`, with existing locked QA dependencies. No install.

### Independent numerical check, separate from the author's reference

- `node /tmp/carpe-pr20-math.cjs` extracted **2,280 questions** (120 seeds ×19) from the exact frozen app: 1,200 numeric and 1,080 choices, with no jsdom errors.
- A separate inline Python derivation checked **1,200 numeric cases across all ten numeric generators**, without importing/calling `study-reference.py`. It used watts derived from RMS volts for dBm, voltage-reference ratios for dBµV, linear-power ratios for OFDM and splitter loss, cascaded linear transmission for fiber/unity, inverse echo travel time for ripple, direct distance scaling for leakage, and root-sum-square field arithmetic for CLI. Maximum absolute difference was `9.094947017729282e-13`.
- This is arithmetic verification of the stated/synthetic parameter model, not proof that an unstated assumption or external equipment condition is valid. The OFDM finding above survives numerical agreement.

### Actual Chrome DevTools MCP / desktop Chromium

- Read `/workspace/.tools/chrome-devtools/SETUP.md`; used its actual stdio MCP client and local chrome-devtools-mcp **1.13.0** with isolated `/usr/bin/chromium`, fresh synthetic browser context and a temporary loopback server. This is actual MCP, not a substitute Playwright run or a native connector claim.
- `python3 /tmp/carpe-pr20-browser.py` final exit0: **163/163 explicit rendered checks**. Includes 19 generators ×4 widths (320,360,390,430) ×2 checks for overflow and rendered answer feedback/associated labels (**152**), then **11** targeted input/state/offline/reload/practice checks.
- Actual MCP `click`, `fill`, and `press_key`: lone `-` produced real Chromium `validity.badInput`; Check explained plain-number input without tallying. Wrong answers showed answer/working; correction changed feedback without increasing the first-attempt tally. Radio arrow-key selection plus Tab/Enter worked.
- Next cleared response/feedback. Removing/rebuilding its button leaves `document.activeElement` as BODY, but subsequent Tab reached the new answer field; no keyboard trap was found. This is an observation, not elevated to a blocking focus defect.
- All19 generators generated/answered in Chromium's Offline emulation. Navigation away/back retained the visit tally, and reload reset tally/domain/index. Job export JSON and every localStorage key/value were unchanged by Study answering/navigation. Fetch instrumentation recorded no calls; MCP network list contained only the loopback standalone document; console error list was empty.
- `TrainingJob.openFeature('study')` opened Study and the matching synthetic custom-curves practice guide, with the added “Answer a practice question” step. This explicit practice-loading operation occurred **after** the no-write comparison; it intentionally loads synthetic job data and is not included in that invariance claim.
- `python3 /tmp/carpe-pr20-visual.py` final exit0 provided an additional rendered OFDM prompt/working observation and screenshot. Domain and number fields measured50px; Check/Next/New buttons44px; calculator-link button45px. The project says “large controls”; 44px is this review's target, not a newly invented project-wide written requirement. No control-size finding.
- Screenshots actually viewed: `/workspace/.tools/chrome-devtools/checks/pr20-study-390.png` (practice navigation/top), `/workspace/.tools/chrome-devtools/checks/pr20-ofdm-390.png` (quiz form/feedback).
- Harness-only initial failures (zero-height fallback, selecting an option by value instead of text, initial before-state lost when mobile emulation reloaded) were corrected; final163 count is from the final successful run. No app defect was inferred from those harness failures.

### Frozen artifact and working-tree checks

- Reconstructed the builder's 40 module substitutions **in memory with Python**, including Python catalog JSON serialization; exact equality with `outputs/Night_Sweep.html`, hash above. No generated source files rewritten.
- An initial comparison with the jsdom source harness was unequal because that helper's JavaScript JSON serialization writes `4` where the actual Python builder writes `4.0`; this was investigated, not reported as an app/artifact defect.
- `git status --short`, `git diff --exit-code`, `git diff --cached --exit-code` — clean/exit0. Ignored dependency link and QA results remained ignored. End-of-review branch head unchanged.

## Source, engineering and privacy observations

- Read the actual PR body; applicable `AGENTS.md`, plugin/development instructions, build3 status sections, plan/rules/review checklist, both lane statuses, known-gap sections, setup/developer notes, and `BUILD_LIST.md` item19.
- Read full new `study-mode.js`, `STUDY_SOURCES.md`, `study-reference.py`, `build3-study.test.cjs`; inspected actual shared integration/training/style/guide diffs, layout-test additions, field-calculator functions, HighSplit data/relations, relevant Why-card wording and registry rows. Source notes actually read for dependencies: DOCSIS_HEALTH, HIGHSPLIT, WHY_CARDS and POP. This does not claim a new complete audit of those older modules or all primary PDFs.
- Primary eCFR excerpts actually returned for 76.605 and76.611 supported the analog43dB limit/coherent-disturbance distinction and CLI64/scope/75% sampling context. CLI equation-image contents were not freshly decoded; numerical CLI was independently recomputed from the registered/app relation.
- CableLabs library URLs for SCTE293-10,293-5 and the293-5 direct download returned403. Later SCTE-hosted293-10/258 primary PDFs were successfully reopened as above. For293-5 only its catalog scope was returned here; no full293-5 reread is claimed.
- No hardcoded company31/43/38 target was introduced in Study. Its42/54,85/108,204/258 questions distinguish the plans; no ALC lesson is conflated with the unity-gain numerical question. No model/pilot/commissioning setting is introduced.
- The19 generator code uses synthetic/calculated prompts and app-authored reminder membership. I found no copied SCTE/NCTI exam items, long copied standards passages, or exam-bank artifact. No external exam bank was obtained, so this is a source/code assessment rather than a plagiarism certification against unavailable exams. The questions explicitly disclaim exam status; safety questions only test this app's reminder sections.
- Study adds no persistence key/job field, live fetch, polling, telemetry, external runtime dependency, OCR, or sensitive-data path. Storage/package/version invariance was inspected in the own-item diff and tested for Study interactions, not treated as closure of unrelated stack bugs.

## Open scope and inherited blockers

No full same-head gate/layout/smoke was run here; parent requested targeted checks while A3 is active. PWA cold start/update/cache behavior, old-job fixture import/export/backup round-trips, physical phone/keyboard, Safari/WebView, emulator, RF meter/plant, field/instructor review and all release/APK work remain untested by this review. The existing no-write assertion plus inspection of unchanged job/storage code is narrower than replaying all historical migration fixtures.

The parent-specified inherited Important findings remain open and were not closed/retested by this item: PR10/12 quota/time/shared checklist behavior; PR13 stale candidates, malformed width/badInput, and CPD guidance; PR15 fiber badInput; PR16 Remote PHY order. The Study feature's source links into those screens do not resolve them. Supervisor safety/outage review remains required before coworker use. No final integration or merge recommendation overrides these blocks.

## Own-item changed files (base6a0ab03 → head7f2b393)

`CarpeNoctum_2.0_Alpha_build_3_UPDATE_LOG.txt`; `NightSweep_Project_Status.md`; `dist/functions-guide.html`; `dist/index.html`; service worker rename to `dist/sw.696e7a8087c9056086b2.js`; `dist/release.json`; `dist/training-coverage.html`; `docs/NightSweep_1.8_Alpha_Functions_README.{md,html}`; `docs/NightSweep_1.8_Training_Coverage.{md,html}`; `handoff_docs/lanes/claude-status.md`; `night-sweep/{build.py,shell.html,study-mode.js,style.css,training.js,workflow.js}`; `outputs/Night_Sweep.html`; `qa/build3-{docsis-health,fiber,highsplit,impairments,leakage,pop,study,why-cards}.test.cjs`; `qa/build3-layout.test.py`; `qa/run-pwa.py`; `qa/v20-design.test.cjs`; `research/build3/{STUDY_SOURCES.md,study-reference.py}`. Git reports32 changed entries with rename detection.

Tools actually used: Git/GitHub read-only API via CLI for live revisions/PR, local shell/Node/Python, Superpowers verification guidance, Parallel search/fetch for source reopening, cloud environment status, and actual Chrome DevTools MCP. Results: `/tmp/carpe-pr20-browser.json`, `/tmp/carpe-pr20-questions.json`, local scripts named above, and the two rendered screenshots. No formal review or author notification was posted by this subagent.
