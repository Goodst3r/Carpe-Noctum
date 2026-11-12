# Carpe Noctum: evidence and roadmap critique

Review date: 12 November 2026 (UTC). Evidence and critique only. No app code, navigation, generated files, version, storage identity, signing or deployment changed.

**Follow-up completed:** the original PDF and determination revision 2 were personally read at **a073fafc2f4d951b7ca04786767ec6c936000af6**. The six original P0 rows and their wording are now verified; the PDF contains no explicit equations or worked calculations unique to it. Section 7 records the revision-2 reconciliation and remaining wording corrections. Sections 1–6 retain the initial audit's pinned sources; resolved revision-1 findings there are historical, not allegations that revision 2 omitted every correction.

**Assessment: revise the planning facts and the meaning of headroom before implementation.** The power-sum arithmetic is supportable. Ingress records and unfinished-work handoff have the strongest practitioner support in the recovered evidence. Phone acceptance remains open.

## Baseline, reads and labels

- Application baseline personally read: **build3, b4cb832d2bdcf18a81d855f1a7acae6699ac8015**, merge of High split PR #16, fetched during the final refresh. The initial application audit used 9df485720d0e13192364be4cf8e3255b36b4bbbf (Fiber #15); all subsequent application deltas were read. The checkout initially defaulted to main at 4bdd4fe7897c922d7e249aa6717b54b88cb54f56; main was not used as the application baseline.
- Determination personally read: **38a172c65e4e2852d6d539225385fa8ac592c138**, then rechecked at **1ee5a723defc88260cd73826abf4b5625be009b1**, from branch **claude/roadmap-determination**. The determination file is byte-identical at those two commits (SHA-256 f7b82497ac6332029b90ee295b88c4aafade08f9058a5a734a4afa741e3c185c); the latter only changes starting prompts. GitHub reports [PR #26](https://github.com/Goodst3r/Carpe-Noctum/pull/26) open, draft and unmerged. Its application snapshot is e7313cf6dd5702a7263160d4f56ab2ba373fbaf4.
- Own documentation branch: **chatgpt/roadmap-critique**, based on the application baseline above.
- All seven requested files were read: handoff_docs/ROADMAP_DETERMINATION.md from that separate branch; handoff_docs/FINAL_HANDOFF.md; handoff_docs/KNOWN_GAPS.md; docs/BUILD_LIST.md; night-sweep/field-calcs.js; night-sweep/thresholds.js; night-sweep/docsis-health.js. **None of those seven was unreadable.**
- The original **Carpe_Noctum_Roadmap.pdf**, unavailable during the initial audit, has now been personally read on both pages at **a073faf**. Its original P0 count, wording and mathematical scope are verified in section 7. The older docs/ROADMAP.md is a different document. The private-message provenance of an additional evidence-handoff request remains **not re-verified**.
- Baseline standalone SHA-256 personally checked: **0bd53b6a4411cf4677066d49b529ca505a33b95e54b215224df19002a03ee725**. This differs from the older close-out hash because later app features have merged; it is not evidence of unexplained corruption.

In sections 1–6, **D:line** means revision 1 of the determination at 1ee5a72. Every other repository file/line refers to **b4cb832**, unless explicitly stated otherwise. Links to [revision 1](https://github.com/Goodst3r/Carpe-Noctum/blob/1ee5a723defc88260cd73826abf4b5625be009b1/handoff_docs/ROADMAP_DETERMINATION.md) and [the application tree](https://github.com/Goodst3r/Carpe-Noctum/tree/b4cb832d2bdcf18a81d855f1a7acae6699ac8015) preserve that distinction. Section 7 uses **D2:line** for revision 2 at a073faf. These are frozen fetched/metadata snapshots, not a promise that the actively merged remote branches will stop moving.

Severity: **High** can mislead a field decision or compromise retention; **Medium** changes scope, implementation prerequisites or interpretation; **Low** is a locator/documentation issue; **None** means confirmed within the stated check. These are review severities, not the roadmap's P0 numbering.

Value labels throughout:

- **Spec**: a definition or conditional requirement in the identified primary document.
- **Expert**: a derived calculation, engineering estimate or published technical guidance, with assumptions.
- **Company**: a locally authorized entry. **All proposed company targets, tolerances, ceilings, pilot codes and intervals remain Unknown**, separately for 42/54 and 204/258. Existing example/preset values are not approvals.
- **Unknown**: unavailable provenance, unconfirmed operational input or a software policy. Repository counts and software input bounds below are application metadata/policies, not RF specifications. Synthetic worked inputs are **Expert examples**, never company targets.

## 1. Every row of “What I checked”

The determination was often accurate for its own snapshot. Later drift is identified separately from an original error.

| D line / claim | Result and severity | Evidence personally checked |
| --- | --- | --- |
| 25: f467e52 is stale; close-out #24 and Impairments #13 merged | **Confirmed; Medium current-pin drift.** Fiber #15 and High split #16 have since merged too. | Git graph: #24 at 6a28951, #13 at e7313cf, #15 at 9df4857, #16 at b4cb832; GitHub PR metadata corroborates all four. |
| 26: 29 screens / 47 features, not recounted | **Medium: historical counts need replacing for current planning.** Counts are 29/47/114 at f467e52; 30/48/115 at e7313cf; 31/49/121 at 9df4857; **32 screens / 50 feature entries / 127 registry rows now**. | Source objects: workflow.js:10; training.js:118; thresholds.js:42 and :52. Read-only Node VM loads at all four refs included EvidenceCore and EvidenceArchive before Thresholds. The archive contributes three dynamically registered rows; loading thresholds.js alone gives 124 now, not 127. Counts include Help and feature entries, not a judgment of feature completeness. |
| 27: Test has 11 tabs, formerly 10 | **Correct at e7313cf; Medium drift now.** It has **13**, with High split last. | night-sweep/workflow.js:6; qa/v20-design.test.cjs:43. Current order: Meter setup, TDR, Predicted levels, Frequency, Readings, References, Calculators, Limits, DOCSIS health, Leakage, Impairments, Fiber, High split. |
| 28: Files is header menu; Help inside it | **Confirmed; None.** Home also has Help links. | night-sweep/shell.html:9 and :64; workflow.js:189. |
| 29: Power has Load and What-if | **Confirmed; None.** | workflow.js:7 and :33; display distinction at :153. |
| 30: Station and Readings store different measurements | **Confirmed at data-model level; None.** Do not merge their records. | station.js:31, :77 and :109 keep Before/After forward/return worksheets in state.stationView. meter.js:30 and :96 keep route-point/port measurements in row.meters and compare corrected readings with prediction. |
| 31: five stretch PRs open drafts; Study has stacked base; all add Test tabs | **Medium drift:** #15 and #16 are merged. #18, #19 and #20 are still open drafts; Study still targets claude/b20-pop. The eventual **16 Test tabs** remains arithmetically correct: 13 now plus three remaining additions. | GitHub metadata opened for each PR; workflow.js:6 confirms Fiber and High split already present. See snapshot below. PR titles refer to build-list items: #16 is item 17, #19 is item 20, #20 is item 19. Do not confuse PR number with item number. |
| 32: already five bottom tabs; Route six / Job nine | **Confirmed; None.** | shell.html:69; workflow.js:4 through :8. |
| 33: working-job and device-local storage names | **Medium: names are right but inventory is incomplete and store type imprecise.** Preserve named-job library **hfc-named-jobs-v1** too. Evidence is an IndexedDB database, not a localStorage value. | app.js:32; jobs.js:3; docsis-health.js:13; leakage.js:10; safety.js:48; outage.js:47; evidence-ui.js:25 through :30, database nightsweep-evidence-v1 / object store files. Recovery sidekeys also exist, including app.js:32, checklist.js:35 and leakage.js:170. |
| 34: draft #25 names only Arcom Digital QS-NAVPLUS-OUDP | **Confirmed on the PR branch; Medium scope distinction.** It is not yet on this build3 baseline. | Opened [PR #25](https://github.com/Goodst3r/Carpe-Noctum/pull/25), head e59d694; branch leakage.js:14 and :398 versus baseline leakage.js:394. The public PR records Spencer's instruction; the original label photograph and private conversation are **not re-verified**. No Arcom manual/settings were verified here. |
| 35: PDF has six P0s; evidence handoff came from Spencer's message | **PDF portion confirmed in the follow-up; None.** Six original P0 rows, with no separately named evidence-handoff item. The private-message origin is still **not re-verified**. | Supplied PDF at a073faf, p. 1 §3, both pages searched/read; see section 7. PDF absence does not prove who first requested another feature. |

GitHub metadata/CI initially opened at approximately **06:37–06:40 UTC, 12 November**, then #16/#26 refreshed after the **06:47** merge; these states can change. Hosted results are GitHub-reported, not tests run by this reviewer.

| PR | State / head | PR-triggered QA visible for that head |
| --- | --- | --- |
| [15](https://github.com/Goodst3r/Carpe-Noctum/pull/15) | Merged at 06:28:56 UTC; b2d6f91 | [Success, 43166448499](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43166448499) |
| [16](https://github.com/Goodst3r/Carpe-Noctum/pull/16) | Merged at 06:47:18 UTC; 0436e9a | [Success, 43168983876](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43168983876) |
| [18](https://github.com/Goodst3r/Carpe-Noctum/pull/18) | Open draft; ed7f29c | [Failure, 43143482442](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43143482442) |
| [19](https://github.com/Goodst3r/Carpe-Noctum/pull/19) | Open draft; a66d313 | [Failure, 43143939017](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43143939017) |
| [20](https://github.com/Goodst3r/Carpe-Noctum/pull/20) | Open draft; b1bd4ba; base claude/b20-pop | No PR-triggered run returned; not proof that no other checks exist |
| [25](https://github.com/Goodst3r/Carpe-Noctum/pull/25) | Open draft; e59d694 | No PR-triggered run returned; not proof of success or failure |
| [26](https://github.com/Goodst3r/Carpe-Noctum/pull/26) | Open draft; 1ee5a72 | [In progress, 43170347496](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43170347496). Earlier head 38a172c had success; that result is not transferred to the new head |

PRs #1 and #2 remain open against main. No merge, closure, CI rerun or PR comment was performed. The workflow API is limited to its returned first page and PR-triggered runs; no failure cause was diagnosed from these statuses.

### Every row of the proposed screen map

This table is a proposed reassignment, not a description of today's navigation. All explicitly named existing IDs are real.

| D line / map row | Check and severity | Evidence |
| --- | --- | --- |
| 71: Home, Safety, Outage | **None for IDs; Medium unresolved Home behavior.** Home currently has no tab children. Generic rendering supports tab entries, but the bottom Home button is special-cased to open home and lastGroup has no Home entry. A map alone does not prove the future behavior. | workflow.js:4, :14, :37, :38, :46, :59 and :188; shell.html:41, :42 and :52. |
| 72: Plan's nine IDs | **Confirmed; None.** projects, setup, route, gain, equipmentSetup, sweep, power, trial, sweepDue all exist. | workflow.js:12, :15 through :18, :22 and :33 through :35; panel mapping :55. |
| 73: Field's eight IDs | **Confirmed; None.** sweepSetup, station, readings, tdr, evidence, leakage, checklists, nightLog all exist. | workflow.js:11, :13, :20, :21, :24, :30, :36 and :39; :55. |
| 74: Tools' seven named IDs plus stretch | **Medium drift/incomplete exact map.** Seven original IDs exist; fiber and highSplit are now two additional current IDs. Remaining stretch entries need their actual IDs recorded when pinned, rather than just display names. | workflow.js:19, :23, :25 through :32; :55. |
| 75: Closeout's records and runsheet | **Confirmed; None.** | workflow.js:40, :41, :55 and :123. |
| 67: “each existing screen” | **Medium original omission:** Help, ID **help**, is missing from the map, although D:62 says the header stays. Explicitly retain header-only Help and include it in counts. | workflow.js:42; shell.html:65 through :67; training.js:120. Current map totals 31 plus Help = 32. After the three remaining stretch additions, total would be 35 including Help. |

No navigation change is made or authorized by this critique. Whether Plan/Field should use tabs or lists still requires the rendered and phone evidence specified in D:77.

### Storage and prerequisite findings

| Severity / file and line | Finding, evidence and consequence |
| --- | --- |
| **High retention planning — D:137; app.js:282; jobs.js:3** | “Full backup” needs a precise meaning. Project export serializes the **working job**, bundling its evidence, rather than all named jobs and device stores. DOCSIS windows, leakage notebook/settings and Safety/Outage device state are outside project backups (docsis-health.js:134; leakage.js:166; checklist.js:1). Check every needed job and separately record device settings before updates/migration. |
| **Medium — D:98; field-work.js:3, :26 and :90** | Checklists already has five leakage booleans, leakage notes/conversion, and five fixed maintenance entries with done/notes. It has no structured per-repair ID, open/temporary/completed status or due date. Extending it is plausible; calling it an existing repair tracker would be false. Grounding/bonding already has a reminder at field-work.js:12. |
| **Medium — D:94; app.js:282; night-log.js:107** | Neither export path records a last-backup or night-log-export timestamp. Job updatedAt and entry addedAt are not export times. BrowserFiles explicitly distinguishes ready/shared/download-requested from confirmed saved (browser-files.js:42). A future “last backup” badge must not certify a saved external file merely because export was attempted. |
| **Medium — D:97; night-log.js:50 and :101** | Current general Add can use a slot with every draft field blank; no Remove/Undo is exposed at :109. The app cap of 200 is **Unknown/software policy**, not a field rule. KNOWN_GAPS.md:49 and :112 accurately preserve these defects. Fixing them is a prerequisite for expanding the log. |
| **Medium — D:99; workflow.js:46, :67 and :213; station.js:109 and :215** | Current navigation is in memory and startup opens Home. Station's selected saved value follows editing, while selection alone can remain in a WeakMap. “Last selected” and “last edited” are different. Resume needs job identity, stale-ID handling and a safe fallback; do not infer it is already persistent. |
| **Low — D:129; qa/alpha15-ui.test.cjs:29 and :40** | Current navigation-state tests support not changing job JSON; their last-tab oracle derives from the production tab list, so it does not independently validate the intended order. Training step identifiers can also resemble screen IDs (training.js:410); “no screen-like string anywhere in backups” would be too broad. |
| **Medium provenance — thresholds.js:178** | The standing-wave search width is labeled Expert, but its own source says it is the app's choice with no published value. Under the registry's definitions (:15 through :18), the **±10% application policy is Unknown**, not published expert guidance or a company tolerance. This does not invalidate the ripple-distance equation. |

## 2. Power-sum calculator

**Finding: Medium specification gap — D:95.** Keep these three operations, with explicit physical assumptions and refusal rules. There is no new power-sum implementation to certify in field-calcs.js:76. Sources opened: [NIST SP 811 (2008), decibel definitions, chapter 5 footnote (e)](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si); [Agilent, Conquering Noise for Accurate Signal Measurements (2009), noise-power-subtraction slides](https://www.ieee.li/pdf/viewgraphs/conquering_noise_for_accurate_signal_measurements.pdf); [SCTE 270 2021r1, section 14.4](https://account.scte.org/documents/5880/SCTE_270_2021r1.pdf).

### Independent derivation

**Spec basis:** logarithmic power level is L = 10 log10(P/P0). A dBmV level is 20 log10(Vrms / 1 mV). At a fixed resistive impedance, P = Vrms²/R, so P/P0 = 10^(L/10), with P0 = (1 mV)²/R. Thus the **10**, rather than 20, applies when summing powers expressed in dBmV.

For zero-mean signals, the time-average mean-square voltage of a sum contains both individual mean squares and cross terms. **Expert assumption:** uncorrelated contributions have zero average cross terms. All inputs must refer to the same observation plane, impedance and level reference, and represent distinct contributions. Normalize bandwidth first where needed; overlapping measurements must not double-count a signal.

1. **Uncorrelated add, Expert derivation:** convert each level to relative linear power, sum, then convert back:
   **Lsum = 10 log10[Σ 10^(Li/10)].**
2. **N equal uncorrelated carriers, Expert derivation:** each contributes the same relative power, giving:
   **Lsum = Lcarrier + 10 log10(N).**
   Carriers at different frequencies are power-added over the observation interval. This is not the voltage sum of in-phase copies of one carrier.
3. **Signal-plus-noise minus noise, Expert derivation:** with Ptotal = Psignal + Pnoise:
   **Lsignal = 10 log10[10^(Ltotal/10) − 10^(Lnoise/10)]**, only for Ltotal > Lnoise.
   The resulting SNR, if requested, is **Lsignal − Lnoise**; it is not generally Ltotal − Lnoise.

The subtraction estimates signal power; it does not remove noise from a waveform or improve MER. It requires uncorrelated noise, compatible RMS/power averaging, unchanged bandwidth/detector/path settings and a representative noise measurement. Results become very sensitive to uncertainty when total and noise are nearly equal; no company minimum separation is supplied here.

### Worked cases, independently computed

All entries below are **Expert synthetic examples**. Levels are dBmV at the same matched 75 Ω plane; results retain more than six significant figures. Python Decimal at 60-digit precision supplied the reference; an explicit Wolfram Language evaluation independently reproduced the main cases.

| Operation | Relative linear-power calculation | Result |
| --- | --- | --- |
| Add 40, 37, 34 | 10000 + 5011.87233627272 + 2511.88643150958 | **42.4362726604562 dBmV** |
| Add two equal 40 levels | 10000 + 10000 | **43.0102999566398 dBmV** |
| Eight equal 40 carriers | 8 × 10000 | **49.0308998699194 dBmV** |
| Add negative levels −20 and −30 | 0.01 + 0.001 | **−19.5860731484177 dBmV** |
| Total 10, noise 0 | 10 − 1 = 9 | Signal **9.54242509439325 dBmV**; SNR **9.54242509439325 dB** |
| Total 50, noise 49 | 100000 − 79432.8234724282 | Signal **43.1317467561988 dBmV**; SNR **−5.86825324380116 dB** |

The last case is valid: signal can be below noise even though total must be above noise. Equal signal and noise would make total **3.01029995663981 dB** above either component.

### Refuse versus accept

| Edge input | Required behavior / classification |
| --- | --- |
| Total equal to noise | **Refuse a finite signal result.** Linear difference is zero; logarithm would be −infinity. Explain that no positive residual signal power was resolved. |
| Total below noise | **Refuse.** Negative residual power contradicts this model; check settings, timing and uncertainty. Never use absolute value or clamp to zero. |
| Empty or a single populated input in the add mode | No sum: require at least two valid contributions. The single-level identity is mathematically valid but should not masquerade as a composite sum. Minimum-count UI policy is **Unknown/application**, not an RF standard. |
| Equal-carrier N = 1 | Identity Lsum = Lcarrier; say “one carrier; no addition.” A product choice to require N ≥ 2 must be labeled **Unknown/application policy**. Refuse N ≤ 0, non-integer/nonfinite N or counts outside a documented safe software range. |
| Two or more equal level values | **Accept** for uncorrelated addition. Equality is not correlation. Equal **total and noise** is the separate refusal above. |
| Negative dBmV/dBm | **Accept** finite supported values; negative logarithmic level means below the reference, not negative physical power. Refuse zero/negative linear watts or RMS voltage when converting them to a finite level. |
| Missing, malformed, NaN, infinity, partially typed number | Refuse or keep the result unavailable, with a reason; never coerce blank to zero or retain a stale result as if current. |
| Very large positive/negative finite levels or huge lists/counts | Refuse values outside explicitly documented **Unknown/software bounds**, and any operation unable to return a finite result reliably. Do not call those bounds equipment safety limits. Use stable arithmetic inside them. |
| Mixed units, impedances, reference planes or unknown power/noise bandwidths | Require explicit conversion/context first; do not silently combine them. |

For numerical stability, use M = max(Li), then **M + 10 log10[Σ 10^((Li−M)/10)]**. For subtraction with gap g = Ltotal−Lnoise > 0, use **Ltotal + (10/ln 10) ln[−expm1(−g ln 10/10)]**. These avoid unnecessary overflow/cancellation; they cannot repair measurement uncertainty. A synthetic arithmetic stress case, two levels of 2000, gives **2003.01029995664**; it is not a plausible plant level and is outside the existing converter's ±200 dBmV **Unknown/software** envelope (field-calcs.js:30 and :59).

### Correlated addition

**Leave it out of the ordinary field calculator.** Levels alone cannot determine phase or correlation. For two same-frequency signals, the power also contains **2ρ√(P1P2)**; for coherent sinusoids ρ depends on their phase difference. Equal, perfectly in-phase voltages produce **+6.02059991328 dB**; equal anti-phase voltages can cancel. A universal “correlated add” button without phase/transfer information is misleading. This physics remains relevant to reflections and the conditional distortion models below, but it does not justify a fourth routine field sum.

## 3. Bandwidth conversion and honest headroom

### Existing conversion

**Confirmed, Expert arithmetic from Spec normalization:** at constant average PSD and impedance, moving from 1.6 to 6.4 MHz adds **10 log10(6.4/1.6) = 6.02059991327962 dB**. Reverse conversion subtracts it. This restates a bandwidth basis; it does not create transmit power or determine a permissible ceiling.

**Medium presentation finding — D:96; field-calcs.js:55, :119 and :133; thresholds.js:90.** The existing engine already performs it. Personally executed **ofdmPower(48, 1.6, 6.4)** returned total **54.020599913279625 dBmV** and delta **6.020599913279624 dB**. Its reverse engine call returned 48 within binary rounding. Today's UI allows measured-in 1.6 and occupied 6.4, so the forward use is already available. The measured-in options are only 6, 24 and 1.6; reverse measured-in 6.4 is not exposed. A second converter would duplicate the math.

The existing conditions describe downstream OFDM: a minimum occupied 24 MHz and whole multiples of 6 MHz. Those conditions must remain scoped to downstream. They do not forbid an upstream 6.4 MHz conversion and do not make the same flat-PSD equation a reconstruction of a dynamically granted OFDMA burst.

### Primary specification actually opened

Personally opened and directly downloaded CableLabs **CM-SP-PHYv3.1-I20-230419**, issued **19 April 2023**, [official PDF](https://account.cablelabs.com/server/alfresco/4eb470eb-aca3-4e64-af88-773b8c594fbd). Read **§6.2.19, §6.2.24, §7.4.12, §7.4.12.1, §7.4.12.2, §7.4.12.2.1, §7.4.12.3 and §7.4.12.3.1**, especially printed **pp. 71–76**; Table 16 and following power-capability items are on pp. 85–86. This is an issue-specific reading, **not a claim that I20 is the latest issue**.

Also personally opened the primary **CM-SP-PHYv3.0-C01-171207**, closed **7 December 2017**, [official PDF](https://account.cablelabs.com/server/alfresco/52c04a05-d1c2-4384-a642-a7891aaabf7f), particularly **§6.2.19 and Tables 6–7/6–8/6–9**, and **§6.2.24, Table 6–21**.

**Spec requirements, paraphrased:**

- A 3.1 modem working with a 3.1 CMTS follows the 3.1 power framework even for an entirely SC-QAM upstream set. A 3.0 modem or compatibility operation with a 3.0 CMTS invokes 3.0 requirements. Specifically, §7.4.12.2.1 applies with Multiple Transmit Channel mode **enabled** and refers disabled-mode requirements to PHYv3.0; hardware generation alone is insufficient.
- **Pmax is total capability. 65 dBmV is the default and lowest allowed Pmax**, with higher capabilities permitted. The protocol's default applies when the capability is not returned or is returned as zero; a blank app field is not evidence of that exchange.
- The active **Transmit Channel Set (TCS)** includes assigned channels which are currently quiet. At §7.4.12, define **Neq = ceil(BWlegacy/1.6) + ceil(BWOFDMA/1.6)**, bandwidths in MHz. OFDMA uses the combined maximum modulated spectrum of active channels, not the current grant or the entire diplex band.
- The full-set normalized ceiling is **P1.6hi = Pmax − 10 log10(Neq)**, in dBmV per 1.6 MHz. For modulated-spectrum bandwidth **at or below 24 MHz**, §7.4.12.2 additionally caps commanded P1.6hi at **53.2 + (Pmax−65) dBmV** in 3.1-CMTS operation. Preserve 53.2 as printed, rather than silently replacing it with a more precise mathematical reconstruction.
- The CMTS places the ordinary DRW top **at or below** that ceiling: **U = P1.6hi − P1.6load_min_set**; the backoff may be zero. The ordinary DRW bottom is **U−12 dB**, also subject to channel minimums. Special Maximum Scheduled Minislots (MSM) operation may command higher PSD with smaller concurrent grants and different fidelity implications; a passive card cannot infer that state.
- Reported channel powers use a 1.6 MHz normalization in this mode. The actual 6.4 MHz SC-QAM power is described as approximately 6 dB higher, subject to the reporting/constellation convention. **OFDMA actual total is a linear sum of allocated subcarrier powers**, with pilot boost, pre-EQ and grant allocation affecting it (§7.4.12.3, p. 76). The instantaneous full-channel total is not reliably obtained by multiplying an unknown status-page number by a nominal channel width.
- Spec “total transmit power” sums channels bursting at the same time at the **CM F-connector**. It is distinct from allocation across the full assigned TCS.

The terminology summary's legacy-bandwidth expression differs in placement of ceiling notation from §7.4.12. For ordinary legacy widths **1.6, 3.2 and 6.4 MHz** (Table 5, p. 41), the two agree. Do not extend the model silently to optional narrower modes. **Spec** OFDMA channel bandwidth is at most **95 MHz**, with minimum occupied bandwidth **6.4 MHz at 25 kHz** subcarrier spacing or **10 MHz at 50 kHz** (Table 16, p. 86). The stated fidelity coverage includes zero through eight legacy channels plus zero through two OFDMA channels; §6.2.1 requires at least eight legacy-channel capability and §7.2.3 permits more than two OFDMA channels. This is not a universal hardware ceiling. Extra capabilities require their own applicability check.

### What a number can honestly mean

| Reading/channel set | Permissible statement | What it cannot establish |
| --- | --- | --- |
| SC-QAM in 3.0/compatibility operation | **Expert:** margin of a comparable per-channel target/reported level to its applicable **Spec** maximum, after channel count, modulation/constellation, negotiation and DRW are known. | A universal 65-minus-reading margin; a generic total ceiling inferred from one channel. |
| SC-QAM-only in 3.1 operation | **Expert:** a normalized channel's loading/backoff, and, with actual DRW state, room to its current ordinary DRW top. Full TCS, widths and the narrow-spectrum cap apply. | Assuming that all-SC-QAM means the 3.0 table applies; inferring headroom from only a hardware label. |
| OFDMA-only | **Expert:** a conditional normalized-power/DRW margin with known maximum modulated bandwidth, reported basis, Pmax and mode. A measured simultaneous composite total can be compared with a specific total capability. | Guaranteed extra bandwidth, additional minislot capacity, maximum real burst power, MER, reach or service health from one normalized number. |
| Mixed SC-QAM/OFDMA | **Expert:** shared-budget calculations using both parts of the TCS and consistent normalized values; separately, a clearly scoped actual-total margin. | Independent ceilings for each part, or summing every status-page number as though it were an equal-width fully simultaneous burst. |
| Pmax minus a genuine simultaneous total | **Expert:** composite margin to the stated total capability/reference, for that measurement and grant condition. | How much any individual channel may increase before a PSD/DRW constraint; future full-grant capability. |
| Company ceiling minus a comparable reading | **Company** reference plus **Expert** difference, only after the company supplies the scope, plane and power basis. | Any company pass/fail or acceptance claim while that ceiling is **Unknown**. |

For context, **Spec** ordinary 3.0 TDMA 32/64-QAM per-channel maxima are 57, 54 and 51 dBmV for one, two, and three/four active channels. Other constellations and S-CDMA differ; negotiated extended transmit support can change the case, subject to capability and its 61 dBmV per-channel constraint. The tables' constellation references and DRW still matter. Do not extrapolate the three/four-channel row to arbitrary channel counts.

**Expert illustration, not an operating target:** assume Pmax 65 and one active 6.4 MHz SC-QAM channel in applicable 3.1 operation. Neq is 4, but the ≤24 MHz cap limits the normalized ceiling to 53.2. The flat-band equivalent full-channel ceiling is **59.2205999133 dBmV**, leaving **5.77940008672 dB below total Pmax** while there is no room under that PSD ceiling. DRW backoff may reduce usable power further. With eight such assigned channels, Neq is 32 and the uncapped normalized ceiling is **49.9485002168 dBmV**; seven quiet channels still belong to the assigned TCS.

### Findings against the present card

| Severity / file and line | Finding and required interpretation |
| --- | --- |
| **High interpretation risk — D:96; docsis-health.js:86, :91, :106, :222 and :273** | “Headroom deferred” overlooks an **existing Upstream transmit headroom card**. Its subtraction is correct for composite margin, but it has no TCS widths/count, narrow-spectrum cap, DRW state or OFDMA grant/pilot/pre-EQ model. It must not be presented as available per-channel transmit headroom. Calling the result “not pass/fail” is useful but does not supply those missing conditions. |
| **Medium — docsis-health.js:95, :224 and :265** | Blank Pmax becomes 65; this is an assumed minimum/default reference unless actual capability/protocol state is known. An entered larger number also needs provenance. The Spec tag establishes the conditional rule, not that a user entry is the modem's verified capability. |
| **Medium — docsis-health.js:103 and :225** | The “other” path accepts one maximum-total input; that supports a generic reference subtraction, not evaluation of 3.0 modulation/count-dependent per-channel and DRW requirements. |
| **Low dependency correction — D:96; FINAL_HANDOFF.md:67** | Open question 3 is **downstream total input, 33 versus 40 dBmV for a 3.1 modem receiving SC-QAM only**. It is separate from upstream maximum transmit rules and is **not resolved by this upstream review**. |
| **Low locator — thresholds.js:124** | Tables 5 and 16 begin on pp. 41 and 85; the following 65-dBmV capability list items are on **pp. 42 and 86**. Other principal upstream locators above are appropriate. |

Company ceilings remain **Unknown for 42/54 GS7K/GainMaker** and separately **Unknown for 204/258 Vecima/AOI**. A return sweep TX reference is a different measurement/workflow value; it cannot become a modem ceiling.

## 4. Cascade calculator

**Medium prerequisite finding — D:108; docs/BUILD_LIST.md:94 and :162.** The available build-list proposal can be checked against primary text, but only with its assumptions. The original PDF, now read, prints no cascade equations; the models below are candidate engineering formulas, not corrections to equations printed in that PDF.

Personally opened [SCTE 270 2021r1](https://account.scte.org/documents/5880/SCTE_270_2021r1.pdf), **§13, §14.1–14.4, §15.1, §15.3–15.5 and relevant Appendix D cascade excerpts**, through Parallel's extracted primary-document text. Direct PDF download returned HTTP 403. Also opened [SCTE 293-11 2025](https://account.scte.org/documents/8267/SCTE_293-11_2025.pdf), **§5.5 and the appendix on cascaded networks/Friis, pp. 18–28**. These are issue-specific reads. Formulas below are independently expressed; no SCTE text, table or example solution is reproduced.

### Formula-by-formula disposition

| Proposed/candidate calculation | Disposition and source | Conditions that must accompany it |
| --- | --- | --- |
| Thermal noise in matched cable: **Pn = kTB**; **Ln = 10 log10(kTBR / 10^-6)** dBmV | **Expert derivation** from thermal-noise physics and Spec unit definitions. Supported by SCTE 270 2021r1 §13 and SCTE 293-11 2025 thermal-noise appendix. | T in kelvin, B the declared equivalent noise bandwidth in Hz, R the matched load in ohms. Loaded voltage is sqrt(kTBR), not the open-circuit sqrt(4kTBR). |
| One amplifier: **CNR = I − NF − Ln** | **Expert estimate**, supported by SCTE 270 §14.1 and SCTE 293-11 §5.5. | Carrier/channel input I, NF and noise must share the correct reference plane and bandwidth convention. A preceding pad/EQ loss enters effective NF once if not already included. This is thermal CNR, not ingress, distortion or MER. |
| N identical stages: **CNRtotal = CNRsingle − 10 log10(N)** | **Expert estimate**, SCTE 270 §14.2. | Equal independent receiver-referred noise contributions, same input carrier level/NF/bandwidth and appropriate unity-gain chain assumptions. Counting identical model names alone is insufficient. |
| Unlike stages / separate optical segment: **CNRtotal = −10 log10[Σ 10^(−CNRi/10)]** | **Expert estimate**, SCTE 270 §14.3. | Same desired-carrier normalization, observation plane and noise bandwidth; distinct independent contributions. Do not add a measured cumulative CNR as if it were a new standalone segment, or substitute MER for CNR. |
| Ordered noise-factor cascade, if proposed: **Ftotal = F1 + (F2−1)/G1 + (F3−1)/(G1G2) + …** | **Expert model**, directly supported by SCTE 293-11 2025 appendix, “The Friis Equation.” F and G are **linear power ratios**; NFtotal = 10 log10(Ftotal). | Include cable/pad/EQ stages in order. Passive loss at reference temperature has NF equal to its loss. This is an alternative model of chain noise, not another contribution to add to the CNR result. The original Friis 1944 paper is **not re-verified**. |
| Identical CTB: **Rtotal = Rsingle − 20 log10(N)** | **Expert conditional distortion model**, SCTE 270 §15.3.2 and Appendix D. | R is positive carrier-to-distortion suppression, same loading/output level/tilt; coherent accumulation of relevant third-order products under the stated model. Not generic power addition or a guaranteed field measurement. |
| Identical CSO: **Rtotal = Rsingle − 10 log10(N)** | **Expert long-cascade approximation**, SCTE 270 §15.3.1. **High applicability limit:** footnote 22 and Appendix D explicitly qualify short identical cascades, **N < 10**. | Random-phase/power accumulation is not assured for a short cascade. The source mentions a 15 log10(N) engineering practice; it is not an exact phase solution or universally safe bound. Do not silently choose one as truth. |
| Unlike CTB / CSO | Under the corresponding assumptions: **CTB Rtotal = −20 log10[Σ 10^(−Ri/20)]**; random-phase **CSO Rtotal = −10 log10[Σ 10^(−Ri/10)]**. **Expert models**, SCTE 270 §15.4.1–15.4.2; footnote 23 retains the short-CSO warning. | First reconcile each standalone specification's actual frequency, channel loading, level, tilt and plane. Do not pool arbitrary catalog numbers. |
| Distortion versus output level | In the weak nonlinear model, order-m distortion amplitude grows as amplitude^m; carrier-relative suppression changes by **−(m−1) × level change**. Hence C/CSO changes −1 dB and C/CTB −2 dB for a +1 dB level change. **Expert estimates**, consistent with SCTE 270 §15.1. | Fixed loading/tilt and weak nonlinearity; no extrapolation through clipping/compression or arbitrary digital loading. |

For CTB/CSO, distinguish positive C/distortion **R dB** from signed distortion **d = −R dBc**. Deterioration makes R smaller and d less negative. Feeding a negative dBc value into a formula expecting positive suppression reverses the result.

**Medium scope finding — docs/BUILD_LIST.md:92–94:** return noise funneling is not automatically a serial forward cascade. Every connected return leg can contribute receiver noise, while one modem signal follows one path. Use the N shortcut only after contributions have been referred to that receiver and shown equal. Unequal gains, losses, splits, segmentation and optical paths need weighting. Neither formula predicts intermittent ingress, CPD, common interferers or optical clipping.

### Independently worked build-list case

**Spec constant:** k = 1.380649 × 10^-23 J/K. **Expert model assumptions:** reference T = 290 K, matched R = 75 Ω, integrated noise bandwidth B = 6.4 MHz; synthetic input 15 dBmV and NF 8 dB; ten equal contributions and a separate 45 dB optical-link CNR, all normalized consistently.

- Thermal floor: **−57.1627748205 dBmV**.
- Single amplifier CNR: **64.1627748205 dB**.
- Ten equal contributions: **54.1627748205 dB**.
- Combined with the separate optical contribution: **44.5029313489 dB**.

Thus the build-list's rounded −57.2 / 64.2 / 54.2 / 44.5 arithmetic is coherent. **Those are Expert examples, not company or equipment targets.**

Bandwidth matters: a nominal 6.4 MHz SC-QAM channel has a 5.12 Msym/s modulation convention. If the CNR noise-bandwidth convention is **5.12 MHz** instead, the same reference calculation gives floor **−58.1318749506**, single-stage CNR **65.1318749506**, ten-stage CNR **55.1318749506** and combined CNR **44.5978976721 dB**. The bandwidth difference is **0.969100130081 dB**. SCTE 270 §13 discusses the noise-bandwidth choice; “6.4 MHz” must say whether it means integrated occupied-band noise or the modulation-rate convention. The app cannot choose that meaning from a channel-width label alone.

### CTB/CSO on all-digital plant

**High interpretation gate — D:108; SCTE 270 2021r1 §15.5.** The underlying second- and third-order nonlinearities still exist. With digital loading, their mixing products become spread, noise-like intermodulation rather than the traditional analog visual-carrier beat clusters. Therefore:

- CTB/CSO numbers still mean something as **conditional legacy/CW laboratory characterizations** of equipment, with a known test plan, level and tilt.
- They are **not sufficient live all-digital acceptance metrics**, a direct MER prediction, or a reason to treat digital distortion as thermal noise.
- For a digital field workflow, preserve measured RxMER and error/FEC metrics with measurement context. Composite noise (thermal plus intermodulation) and controlled noise-power-ratio tests address different questions. Do not label a casual live-spectrum observation a calibrated NPR test or invent a CTB-to-MER conversion.

The parallel research lane additionally opened ANSI/SCTE 06 2019 (R2025), ANSI/SCTE 17 2018 (R2024), ANSI/SCTE 119 2018 and SCTE 293-13 2026. Their individual procedures are **not re-verified by this reviewer** and are not required to validate the equations above. Suitable primary follow-up links: [06](https://account.scte.org/documents/8355/ANSI_SCTE_06_2019_R2025.pdf), [17](https://account.scte.org/documents/8399/ANSI_SCTE_17_2018_R2024.pdf), [119](https://account.scte.org/documents/701/ANSI_SCTE20119202018.pdf), [293-13](https://account.scte.org/documents/8406/SCTE_293-13_2026.pdf).

No cascade model here selects company input/output levels, noise figures, channel plans, tolerances or acceptance rules. All unavailable per-model inputs remain **Unknown**. Keep 42/54 and 204/258 profiles distinct.

## 5. Priority against public evidence

**Medium evidence finding — D:88–112 and :146.** The earlier absence of Reddit/Facebook evidence is partly remedied. The recovered sample supports problem/workflow relevance, **not prevalence, a representative survey, verified employment, causal time savings or Spencer's local procedure**. Rank below is a judgment about useful next work, distinct from merge dependencies or permission to implement it. No source establishes the proposed navigation order.

### First-hand reports personally opened

Authors' roles are self-reported or inferred as stated; no credentials were verified. Their numerical thresholds, claimed time savings and employer practices are **Unknown/unverified anecdotes**, not operating limits. No posted customer identity or plant record is imported into the app.

| ID / source | First-hand content and limits | What it supports |
| --- | --- | --- |
| **F1 — [r/Spectrum: interrupted maintenance ticket](https://www.reddit.com/r/Spectrum/comments/1q642vd/comment/ny5sai1/)** | Bubbly_Historian215 describes waiting for an intermittent fault, being called elsewhere and pending work for another tech. First-person work claim; maintenance role implied rather than independently proven. Consumer thread OP is not treated as a technician. Thread-date indicator 7 January 2026; exact comment time unavailable. | Ingress history, incomplete-work status and concise next-shift handoff. Exact-resume UI is an inference, not a requested feature in the post. |
| **F2 — [r/CableTechs: repeat ingress repair](https://www.reddit.com/r/CableTechs/comments/1p7eagk/)** | OP SilentDiplomacy identifies as MT. [skypandaOo](https://www.reddit.com/r/CableTechs/comments/1p7eagk/comment/nqx7c0u/) identifies as a field tech and describes repeat visits, locating a faulty **neighbor-premises splitter**, changing components and retesting; this is not a confirmed outside-plant fault. In the [documentation follow-up](https://www.reddit.com/r/CableTechs/comments/1p7eagk/comment/nr2vj4d/), the same author reports documenting findings/actions after a repeat visit. Thread-date indicator 26 November 2025; exact comment times unavailable. | Record what was checked, what changed, whether the symptom was resolved and what the next tech needs to know. A structured temporary-repair tracker is a product inference, not a direct request in this account. |
| **F3 — [r/CableTechs: VIAVI meter](https://www.reddit.com/r/CableTechs/comments/1nd2zia/love_the_viavi_meter)** | Complete_Accident_64 explicitly identifies as MT and describes using diagnostic interpretation to find a line problem. 2ByteTheDecker reports an ingress source missed by one scan and seen by a different instrument, and complains about phone interaction friction. Thread-date indicator 10 September 2025; exact comment times unavailable. Equipment opinions and time claims are anecdotes. | Measurement context, instrument setup/interpretation, retaining symptom and test history; test the burden of using the phone alongside a meter. It does not prove one meter is universally superior. |
| **F4 — [public Facebook Low Voltage Nation connector discussion](https://www.facebook.com/groups/lowvoltagenation/posts/3738924913063977/?comment_id=3738975083058960)** | Donald R Parks III self-reports cable technician work in 2006–2015 and describes poor preparation/termination causing ingress/noise. Original post dated 12 March 2024 in the retrieved page; comment shows a relative age only. Mixed-trade group; not verified current maintenance employment. Public extracted text was readable; not the whole group or private membership content. | Connector/repair validation reminders. It does not establish any connector torque, tolerance or approved company part. |
| **F5 — [CABL, chronological ingress monitoring](https://www.cabl.com/forums/367057-Re-Ingress-running-process)** | massive coax, 14 June 2015, profile self-describes sweep/reverse-noise/node work. Describes personally using time-ordered upstream snapshots and reviewing peak-time noise. Old equipment and workflow, not a 2026 usage survey. | Time/context records for intermittent ingress; no authorization for live polling in this offline app. |
| **F6 — [CABL, upstream spectrum use](https://www.cabl.com/forums/299796-Re-foward-Ingress)** | ronaldeverett, 16 April 2010, self-described Line Tech, describes personally using upstream spectrum tools. Historical report; no modern ONX procedure inferred. | Useful instrument guidance and context. |
| **F7 — [r/CableTechs: new-tech meter questions](https://www.reddit.com/r/CableTechs/comments/ar5gua/viavi_meter_questions_new_tech_69_months/)** | Takingdaybyday asks from a technician work context about ingress scans/echo; Eninja09 describes largely self-directed learning and repeated calls where meter interpretation was disputed. Thread-date indicator 16 February 2019; retrieved cache acquired 16 January 2026. | Need for accurate setup/interpretation guidance. Their suggested thresholds are not adopted. |

Thread-date indicators came from the retrieved pages' linked day/archive context; they are not precise comment timestamps. Reddit relative ages alone were not converted into invented dates. F1–F6 were returned with cached/acquired content; F1–F4 content was also requested again during this review. Extraction success does not prove every comment/reply was available.

### Public curriculum, standard scope, and expert material

These sources are **separate from first-hand reports**. They establish what is taught or a document's scope, not how frequently techs need an app feature. Topic descriptions are paraphrases.

| ID / public source | Relevant scope and evidence boundary |
| --- | --- |
| **C1 — [NCTI System Technician](https://ncti.com/system-technician/)** | Amplifier operation/alignment, spectrum measurement, sweep and maintenance concepts. **Unnumbered, undated public outline**; no edition/year shown. Official cached page acquired 27 November 2025, not a verified current revision. |
| **C2 — [NCTI Return Path Operations](https://ncti.com/return-path-operations/)** | Upstream accumulated interference, ingress/impulse/CPD/clipping, return balancing and measurement tools. **Unnumbered, undated public outline**; cache acquired 14 September 2026. |
| **C3 — [NCTI Broadband HFC Network Testing and Measurements](https://ncti.com/broadband-hfc-network-testing-and-measurements/)** | Instrument selection, RF/digital measurement, leakage, sweep/return balancing, electrical and optical testing. **Unnumbered, undated public outline**; detailed returned cache acquired 8 March 2025. Do not confuse retrieval metadata with course year. |
| **C4 — [NCTI Field Safety](https://ncti.com/field-safety/)** | Electrical hazards, protective equipment, aerial/ladder, vehicle and fiber safety. **Unnumbered, undated public outline**; cache acquired 13 August 2026. Does not supply a generator procedure. |
| **C5 — [SCTE public BDS competencies](https://account.scte.org/education/certification/certification-exam-catalog/broadband-distribution-specialist-v2-bds-online-exam/) and [BDS curriculum](https://account.scte.org/education/course-offerings/course-catalog/broadband-distribution-specialist-bds-curriculum/)** | Public descriptions of node-to-tap architecture/components, RF signals/impairments, troubleshooting and safe construction. These web outlines are **unnumbered with no edition stated**; no exam questions opened. Cache acquisitions 31 October and 29 June 2026, respectively. |
| **C6 — [SCTE 180 2025 catalog/scope](https://account.scte.org/standards/library/catalog/scte-180-recommended-practices-for-coaxial-cable-construction-and-testing/)** | Construction, bonding/grounding, cable preparation, connections, activation and testing. Catalog/scope opened; detailed procedures are **not re-verified** here. No OEM torque/pin dimensions derived from this listing. |
| **C7 — [SCTE 294 2024r1 catalog/scope](https://account.scte.org/standards/library/catalog/scte-294-understanding-and-troubleshooting-cable-upstream-rf-spectrum/)** | Upstream RF interpretation/localization and repair, with its DOCSIS/FBC scope. Catalog/scope opened; full operating procedures are **not re-verified** here. Generic scope does not prescribe ONX or Arcom controls. |
| **C8 — SCTE 270 2021r1 and SCTE 293-11 2025** | Primary engineering/mathematical references opened in sections 2–4 above. They support conditional calculations, not company operating targets or a field-demand ranking. |

NCTI does not expose document numbers or edition years for these retrieved outlines; inventing those to satisfy a citation format would be false. All numbered SCTE technical citations retain their actual document number and year/revision. No proprietary course lesson, table, figure or exam question is copied.

**Vendor/expert evidence is not practitioner evidence.** Agilent's 2009 measurement presentation supports noise-subtraction conditions. CableLabs supplies protocol requirements. SCTE supplies technical references. None counts as a maintenance-tech report that a specific UI feature is needed. No vendor generic target is imported.

### P0 ranking

Each row cites its determination file/line and evidence. **Medium** denotes a planning recommendation unless another technical finding above assigns higher risk.

| Priority | Item / file-line | Recommendation and evidence |
| --- | --- | --- |
| **1** | **P0-6 intermittent-ingress record**, D:97 | Strongest direct fit: F1, F2, F5, C2/C3/C7. First resolve blank Add and entry lifecycle; retain time, symptom, actual test context, attempted isolation, result and next action in the existing Night log. Weather can remain a technician observation; no forecast or automated collection implied. |
| **2** | **P0-2 temporary-repair/follow-up status**, D:98 | F1/F2 support preserving unfinished work and recording repair/validation. A structured temporary-repair tracker, and placing it just above open-item visibility, are product judgments rather than proven preferences in this sample. Extend the existing notes model rather than create competing truth. No retrieved source establishes company due dates, ownership/escalation rules or tolerances: **Unknown**. |
| **3** | **P0-1 open-items list**, D:94 | F1/F2 support unfinished-work visibility. Read existing stored facts; distinguish balanced from swept and recorded from accepted. Its dashboard form is a product inference. Unknown sweep interval must not create an overdue claim; no last-backup/export success claim from an attempted file save. |
| **4** | **P0-3 context strip**, D:92 | C2/C3/C7 and F3 support measurement context. Split, selected asset and applicable plane reduce opportunities to read the wrong context, but no report proves a particular strip layout. Keep 42/54 and 204/258 visibly distinct and all company fields Unknown. |
| **5, conditional** | **P0-7 evidence handoff**, D:100 | F1/F2 and C3 favor concise “what was found / changed / still open / evidence exists.” Definition remains missing, so retain defer until scoped. No report specifically demands SHA-256 in the shift note or sharing originals; do not expand it into a transfer feature by assumption. |
| **6** | **P0-8 exact resume**, D:99 | F1 interruptions and F3 phone friction make it plausible, but this is a product inference. Run lock/app-switch/process-kill checks first; restoring context must never select another job's station or resurrect invalid drafts as saved readings. |
| **7** | **P0-4 power sums**, D:95 | Strong technical basis in C8 and the independent derivation, but **no qualified first-hand demand for this calculator was recovered**. A compact helper can follow the record reliability work. Keep correlation out. |
| **8, small clarification** | **P0-5 bandwidth conversion**, D:96 | Already supported by the existing calculator; fix scope/explanation rather than count a new feature. Protocol/curriculum relevance is not first-hand demand. |
| **9, gated** | **P0-3b leakage-method reminder**, D:93 | Leakage topic support in C3/C5 and connector evidence F4 does not supply the Arcom method, tag settings or a company procedure. The High split registry prerequisite is now merged in #16; the Arcom manual and company-method prerequisites remain open. Keep those **Unknown**; no invented steps. |
| **10, deferred** | **P0-5 available-transmit headroom**, D:96 | Highest interpretation burden and no recovered first-hand feature demand. Existing composite-margin card needs its scope clarified now; an actual channel/DRW tool waits for the missing input/provenance model. A company ceiling alone does not solve it. |

This is not an instruction to bypass Grok's pin, the existing feature reviews or Spencer's acceptance gate. It challenges the determination's feature priority with the evidence recovered; it does not claim a representative market ranking.

### Medium-term ranking and holds

| Priority / severity | D file-line / item | Evidence and critique |
| --- | --- | --- |
| **1 / Medium** | D:107, spectrum-analyzer setup reference | F3/F6/F7 plus C1/C2/C3 strongly support correct instrument use and interpretation. Keep the exact VIAVI manual/model/options/firmware gate. No ONX-specific control sequence was opened here; it remains **not re-verified**. |
| **2 / Medium** | D:109, construction/connector/bonding reminder | F2/F4 plus C4/C5/C6 support repair quality and safety. A basic bonding check already exists at field-work.js:12. Extend useful context there when item 16 is built; do not represent another reminder as a new bonding feature. Dimensions, torque and local procedure remain **Unknown**. |
| **3 / Medium** | D:106, technician-entered map legend | C5 supports plant/component literacy, but no recovered first-hand report specifically establishes a legend problem. Useful only if Spencer encounters unfamiliar local symbols. Company legend content remains **Unknown**; do not copy SCTE drawings or assume a universal map key. |
| **4 / Medium** | D:108, cascade noise/distortion calculator | C1/C2/C8 support the concepts. Field reports favor measurement/localization more directly than analog distortion forecasting. A bounded thermal/CNR aid is more defensible than a generic CTB/CSO “plant health” score; retain all assumptions in section 4. |
| **5 / Medium** | D:110, generator pre-start | C4/C5 support general safety, but **no sufficiently relevant first-hand mobile-generator pre-start evidence was verified here**. Generator model/manual and company review remain missing; no operating sequence or electrical target proposed. |
| **Hold / Medium** | D:111–112, photos, battery runtime, transponder alarms and company-target-dependent work | No recovered evidence warrants lifting these holds. Photos add evidence/storage considerations; battery runtime needs chemistry/load/temperature/aging assumptions; alarms need exact equipment semantics. Those inputs and local policies remain **Unknown**. This is not evidence that techs never need them. |

### What public research could not reach

- Facebook coverage is **one readable, relevant public mixed-trade thread**, not a survey of maintenance groups. The candidate [676453365479628 / 873373562454273](https://www.facebook.com/groups/676453365479628/posts/873373562454273) returned unavailable content in the research lane and is **not re-verified** by this reviewer; it contributes no evidence. No private or login-only group content was accessed.
- Some Reddit replies were collapsed/unavailable, exact comment timestamps were often absent, and no employment credentials were verified. Consumer assertions were not relabeled as technician reports.
- NCTI/SCTE evidence came partly from cached official pages with the acquisition dates above. Direct live 404/403 results reported by the curriculum research lane are **not re-verified** by this reviewer. The returned cached bodies support topic coverage but not current enrollment details, seat hours or edition freshness.
- The full current NCTI courses, SCTE exams, ONX/Arcom manuals, company map legend and company procedures were not opened. Their contents/settings are **not re-verified**. Firecrawl attempts in research lanes were blocked by exhausted credits; Parallel was the useful fallback. No credits or subscriptions were purchased.

## 6. Spencer's real-phone checks, in execution order

**High retention correction — D:135–142; FINAL_HANDOFF.md:59 and :73; KNOWN_GAPS.md:11–14.** Everything below is a proposed acceptance check, **not executed**. Desktop Chromium at phone dimensions is not a phone. Use synthetic, identifiable practice jobs for destructive/replacement scenarios and retain the original working jobs.

1. **Prove recovery before installing or replacing anything.** Inventory the working job, every named job needed, attachment names/counts and original SHA-256 values. Export each needed job and finish the actual save dialog. Reopen the exported file in an isolated test context and compare the actual data and original bytes, not just an attachment list/preview. Separately record device-only DOCSIS windows, leakage settings/notebook and Safety/Outage state; a job backup does not contain them or the whole named-job library. Evidence: app.js:282; jobs.js:3; evidence-ui.js:124; docsis-health.js:134; checklist.js:1. A prepared file is not a verified backup.

2. **Identify the exact variant and frozen artifact.** Record phone model, OS, browser/WebView version, origin URL, browser tab versus Home Screen PWA versus APK, source commit and displayed build. There is **no build3 APK in this reviewed tree**. If Spencer later supplies his accepted original-signed APK, record its actual package, version code, certificate and embedded HTML hash before testing update retention. Do not test the repository's build2 APK and call it build3. Evidence: FINAL_HANDOFF.md:15; KNOWN_GAPS.md:12; docs/DEVELOPER_BUILD.md:3.

3. **Separate same-app update from migration.** For the APK, test the compatible same-package/same-signer update without uninstalling, then inspect job counts, numbers and original attachments. For a PWA, retain the existing HTTPS origin and test the supported update path. An APK uses the private WebView origin https://appassets.androidplatform.net/ (MainActivity.java:47 and :75); a hosted PWA is a different store. Moving between them requires verified export/import, not an expectation that jobs appear automatically. A new URL/origin or installing a second variant is a migration case. No hosting or signing is performed by this review.

4. **Prove a genuinely offline cold start.** For the PWA, first complete one online cache installation; then enable airplane mode, close/OS-kill the app, relaunch, open more than one saved job and the needed guides/screens, edit, save and relaunch again. Verify original evidence is available offline too. Repeat separately for supported Android Chrome, APK/WebView and iPhone Home Screen Safari. An offline already-open page does not prove cold-start caching or persisted storage.

5. **Exercise the real file-provider lifecycle.** Import/export a synthetic project with original attachments; cancel a picker/share/save, retry, switch apps/lock while it is open, then actually locate and reopen the result in Files/downloads. Check hash/byte equality after update and restore. Test Night-log TXT/CSV and the run sheet's share/print path separately. Do not infer saved-file success from dismissal or a message. Evidence: browser-files.js:42–75; app.js:288; night-log.js:107; MainActivity.java:60.

6. **Measure reachability and layout on today's navigation.** Test the current **13 Test tabs**, including Fiber and High split, and every current screen including header Help; use actual available phone widths, portrait/landscape, larger system text/browser zoom, the bottom gesture area and the keyboard open. Record thumb reach, accidental selections and obscured results. The future Plan nine/Field eight rows are not implemented here and must be tested again on their own future head. Evidence: workflow.js:4–8 and :42; shell.html:69; D:77. Do not change navigation based solely on the count.

7. **Test native numeric entry and interruption at the actual fields.** In Station and Readings, enter finite negative levels, a leading-decimal value, zero, deliberate blank, a lone minus and an unfinished exponent; then use blur, lock, app switch, rotation, reload and OS process termination. Confirm invalid text never turns into a saved zero/default and stale results do not look current. Check dates, pad/EQ selects and focus. Use the actual iPhone/Android keyboard: the availability of a minus key depends on field attributes, OS and keyboard, so D:141 is a test prompt, not a universal verified device fact. Distinguish valid autosaved values from in-memory drafts; a draft surviving a panel switch does not prove survival after process death. Evidence: station.js:34; docsis-health.js:241; KNOWN_GAPS.md:89.

8. **Prove context and split isolation before relying on a result.** With separate synthetic 42/54 and 204/258 jobs, switch jobs, active/route point, port and Before/After stage, then return. Confirm values and notes belong to the intended job/asset/stage, balance and sweep remain independent, and the test-point correction is applied once at the intended plane. Device-level settings may intentionally survive job changes: **untouched plant windows in a fresh test context start Unknown; existing device windows retain their recorded values without crossing plants**. Test one available legacy backup and a current backup; compare numeric values, blank versus zero, historical bindings and attachment bytes. Evidence: station.js:109; meter.js:96; docsis-health.js:22 and :165.

9. **Try the long record workflows on a synthetic job.** Leakage, Night log, Outage, Safety and imported-sweep grading: long notes/asset names, wrong-then-corrected entries, unfinished local times, focus after selection/Grade, blank Add and storage/error messages. Demonstrate the known no-Remove/Undo and blank-Add Night-log gaps without filling a real log. Confirm a captured Station snapshot remains fixed after Station edits and a later capture is identifiable. Inspect multiline TXT and quoted CSV outside the app. Evidence: night-log.js:43, :50, :101 and :107; KNOWN_GAPS.md:48–51, :73 and :112.

10. **Check night-use and accessibility.** Repeat the frequent entry/return-to-result sequence with the actual glove/touch conditions, low brightness and large text. Try VoiceOver/TalkBack: field label, units, error, source details, focus return and duplicate status announcements. Check decimal/sign visibility, selected-stage clarity, dark placeholders, native select text and header Files controls. Source-known accessibility/focus issues are not closed by a visual screenshot. Evidence: KNOWN_GAPS.md:48, :73 and :89.

11. **Check calculation meaning on the phone, then record acceptance.** Run the existing bandwidth conversion with the worked case in section 3, allowing for displayed rounding; verify basis/units and the distinction between composite margin and available channel headroom. Power sums/cascade features are not yet implemented and cannot pass a phone check today. Record an observed pass/fail/untested row per exact phone/variant/commit, with reproduction steps for failures. Physical meter/reference-plane comparison and local procedure review remain separate later checks. Use both local plant workflows only with their own approved settings; missing values stay Unknown.

Do not test storage clearing/uninstall/eviction against the only copy of real work. After external recovery is proven, any deliberate storage-failure or eviction experiment belongs in a disposable test context. This is a retention prerequisite grounded in the actual separate stores, not a claim that a backup saves every device preference.

## Verification record and limits

**Executed by this reviewer:**

- Read-only repository inspection and GitHub PR/CI metadata reads; the seven requested files and additional data/export/navigation implementations were opened.
- Read-only Node VM counts at f467e52, e7313cf, 9df4857 and b4cb832 reproduced **29/47/114/10**, **30/48/115/11**, **31/49/121/12** and **32/50/127/13** respectively (screens / feature entries / full registry / Test tabs). These are source-module executions, not a rendered application test.
- Python Decimal independently derived the power sums/subtraction to 60-digit working precision. Explicit Wolfram Language evaluation reproduced **42.4362726604562**, **49.0308998699194**, **−19.5860731484177**, **9.54242509439325**, **43.1317467561988** and **6.02059991327962**. The initial natural-language Wolfram response misparsed some queries; those outputs were discarded in favor of the explicit expressions, not treated as corroboration.
- Direct source calls checked the existing OFDM converter in both directions. Direct DocsisHealth evaluation confirmed total 60 / blank 3.1 Pmax yields a displayed-calculation margin of 5 dB; this proves the present arithmetic, not per-channel capability or phone behavior.
- Primary CableLabs I20 PDF downloaded/read; primary SCTE text read via Parallel; NIST/Agilent, public practitioner posts and official curriculum pages opened as identified above.
- Staged documentation diff/whitespace check passed. The changed-file allowlist contains only this Markdown file; comparison against b4cb832 found no app, PWA, generated, Android or QA delta. The standalone hash remains the baseline value above. No old full-gate count is presented as a new run.

**Not executed / not re-verified:** full app build/gate, Chromium rendering, emulator, actual phone, iPhone Safari/WebView, screen reader, meter, plant/field acceptance, company targets/procedures/pilot codes, Arcom/ONX operational manuals, any primary technical procedure explicitly marked not re-verified above, or whether I20 is the newest PHY issue. The original PDF is now read and its availability gap is closed in section 7. The repository-audit lane's attempted jsdom harness lacked the installed dependency; it produced no UI result. A source-counting fallback was sufficient for the inventory question.

Tools actually useful: GitHub connector for live PR/head/check metadata; shell/Git/Node/Python for source and numerical checks; Parallel for primary/public source extraction; Wolfram Language evaluator for independent arithmetic. Data validation and Superpowers verification/parallel-work skills guided the review. Research-lane notes were cross-checked against opened source/code; any un-reopened material is labeled **not re-verified**, rather than silently inheriting another assistant's confidence.

## 7. Original PDF and revision-2 follow-up

**Sources personally read, 12 November 2026:** branch claude/roadmap-determination, exact commit **a073fafc2f4d951b7ca04786767ec6c936000af6**:

- [handoff_docs/Carpe_Noctum_Roadmap.pdf](https://github.com/Goodst3r/Carpe-Noctum/blob/a073fafc2f4d951b7ca04786767ec6c936000af6/handoff_docs/Carpe_Noctum_Roadmap.pdf): both pages, embedded text and rendered pages. File size **5,438 bytes**; SHA-256 **f39179c5ea3c2b6d65a307bf6b23c05f59ac60ee723701d981f2ef80a6543bb5**; Git blob f6b4c26482e8abef02404db47a390cae3a41799f.
- [handoff_docs/ROADMAP_DETERMINATION.md, revision 2](https://github.com/Goodst3r/Carpe-Noctum/blob/a073fafc2f4d951b7ca04786767ec6c936000af6/handoff_docs/ROADMAP_DETERMINATION.md): all 181 lines, compared with revision 1 at 1ee5a72 and this critique as originally published at **69c2c625fb699795f140e57053460299e48ad8fd**.

**D2:line** below denotes revision 2 at a073faf. PDF page/section/row locators refer to that exact binary; PDF byte count, row counts and identifiers are **Unknown/application-document metadata**, not RF specifications. The application baseline remains **b4cb832**; this follow-up does not rerun or extend the application gate.

### Original P0 count and wording: closed

**Confirmed, None — PDF p. 1 §3; D2:53.** There are exactly **six P0 rows**. The PDF labels every row P0; it does not print P0-1 through P0-6 identifiers. Those identifiers are the determination's useful cross-reference scheme.

| Original row, in PDF order | Exact item title | Feature wording verified in the embedded text, paraphrased |
| --- | --- | --- |
| 1 | Tonight open-items list | Put unfinished stations, open temporary repairs, unexported-log status and last-backup information on Home. |
| 2 | Temporary-repair tracker | Keep RG6/pad/terminator notes by station/span until closed. |
| 3 | Plant banner + leakage method | Identify 42/54 versus 204/258 and the applicable legacy/OUDP method. The PDF does not establish which method or settings are authorized locally. |
| 4 | Power-sum / composite calculator | Add/subtract dBmV, equal-carrier count and signal-plus-noise operations, with visible arithmetic. It does not define those operations mathematically. |
| 5 | Upstream headroom card | Restate a 1.6 MHz reference over 6.4 MHz and show headroom, with the company ceiling Unknown. |
| 6 | Intermittent-ingress investigation record | Add personal Night-log observations about conditions, time and what was tried. Weather/ingress hunting is given as the rationale. |

**Confirmed, None — PDF pp. 1–2; D2:120 and :134.** There is no separately named “Evidence handoff” feature or seventh P0 row. The PDF does mention handoff/night continuity as the open-items list's rationale; that does not define an evidence inventory, hashes or a file-transfer feature. “Exact resume” appears in the **Immediate** section on p. 1 §2, outside the P0 table. Cascade noise/distortion appears in the **Medium-term** list, p. 1 §4.

The determination therefore represents the original **count and inventory correctly**. Its claim that the additional evidence-handoff request originated in Spencer's separate message remains **not re-verified**; reading this PDF can establish absence from the PDF, not conversational authorship.

**Low source-readability finding — PDF p. 1 §3.** Text in the rendered P0 table overflows into adjacent columns. Raw text extraction recovers the row wording; I checked it against both pages rather than treating the interleaved layout extraction as a different title or extra row. The complete sixth title is “Intermittent-ingress investigation record.” No PDF edit is included.

### Equations unique to the PDF: closed, none present

**Confirmed, None — PDF pp. 1–2.** The supplied document contains **no explicit mathematical equations, worked numerical calculations or proposed accumulation coefficients**. There are no printed CNR, thermal-noise, CTB, CSO or Friis formulas to check beyond the candidate formulas already assessed in sections 2–4.

| PDF mathematical subject matter | What is actually specified | Consequence for the critique |
| --- | --- | --- |
| p. 1 §3, power-sum row | The exact short description is “Add/subtract dBmV, N equal carriers, signal+noise. Shows arithmetic.” | **Medium scope ambiguity:** this is not an equation and does not prove the PDF advocated direct addition/subtraction of logarithmic level numbers. It leaves physical operations, correlation and measurement conventions unspecified. The three uncorrelated operations in section 2 are the determination/critique's explicit clarification; do not falsely attribute their full definitions to the PDF. |
| p. 1 §3, headroom row | A **1.6 to 6.4 MHz** reference conversion and an Unknown company ceiling. | The PDF provides neither the **6.02059991327962 dB** result nor a headroom equation. That result remains an **Expert derivation** under the flat-PSD assumptions and **Spec** normalization sources in section 3. The PDF is not an independent validation of those sources or of usable transmit headroom. |
| p. 1 §4, cascade item | “Cascade noise/distortion calculator (inputs from spec sheets).” | No formula or all-digital CTB/CSO claim is printed. Section 4 checks candidate engineering models and the build-list example; it does not correct an erroneous formula actually printed in this PDF. |

Other numeric notations are historical application counts, split names and a phone-layout width range. “Load + What-if” names two screens; it is not a power-addition equation. No additional calculator implementation or reference calculation is needed to close the PDF-only gap.

**Medium qualification — PDF p. 1 §3 introduction and headroom row.** “No company numbers required” cannot authorize a local headroom result when its company ceiling is explicitly Unknown, or supply a leakage method. A converter or an unavailable/Unknown comparison can be presented without inventing a company number. Revision 2 correctly keeps leakage-method/per-channel claims deferred and treats the existing composite margin separately. All company ceilings, targets, tolerances and pilot codes remain **Unknown**, separately for 42/54 and 204/258.

### Did revision 2 represent the critique correctly?

**Overall: substantially yes.** It adopts the principal factual corrections, preserves source/verification limits and makes defensible planning choices. The table below separates faithful incorporation from remaining wording issues. A choice to narrow scope or change build order is not itself a misrepresentation of the evidence.

| D2 file/line | Result / severity | Reconciliation with the original critique |
| --- | --- | --- |
| :9–11 | **Faithful; None.** | Correctly identifies critique commit 69c2c62 and application baseline b4cb832; 32 screens / 50 feature entries / 127 rows / 13 Test tabs match the initial executions. Claude clearly separates its spot checks from my source reads. These are baseline counts, not new gate outcomes. |
| :12–14, :51, :109, :116 and :118 | **Faithful core correction; None.** | Existing composite-margin arithmetic, no second bandwidth converter, named-job key, IndexedDB distinction and missing TCS/DRW/Pmax provenance are represented correctly. The proposed 6.4 MHz input basis is an optional exposure of existing engine capability. |
| :15 and :170 | **Faithful; Low wording precision.** | Working-job-only export and the reference to all 11 phone checks are correct. “Named jobs ... are outside it” should read **the other named jobs/the named-job library are outside it**: a named job loaded as the working job is included when exported. Its originals are bundled; device-only settings and unrelated jobs are not. Evidence: section 1 retention finding; app.js:282–289 and jobs.js:3. |
| :16–18, :92–94, :110–111, :143–144 | **Faithful; None.** | Help and the two merged stretch IDs are now accounted for. Existing Checklists/bonding, Night-log lifecycle prerequisites, missing export times and Unknown for the app-chosen ripple search policy are correctly conveyed. New structured repair entries remain a planner's proposal, not an existing tracker. |
| :19, :107–120 | **Faithful planning synthesis; None.** | Record reliability precedes new calculators; evidence handoff remains deferred until defined. Putting the existing misleading headroom wording fix first is consistent with the critique's interpretation risk. The public sample does not empirically determine exact ordering between temporary repairs, an open-items list and resume; revision 2 must remain a planning judgment, not a measured practitioner preference. |
| :21 | **Faithful historical status; Low dating requirement.** | Initial failures were checked on **#18 ed7f29c** and **#19 a66d313**, with linked runs in section 1. Do not transfer those conclusions to later heads. This follow-up did not run their gates or diagnose failures. |
| :115 and :129 | **Faithful; None.** | Correctly inherits section 2's assumptions, worked cases and refusal rules, excluding correlated addition. Negative logarithmic levels and equal uncorrelated levels remain valid; total at/below noise remains a refusal. |
| :142 | **Faithful scope decision; Low technical precision.** | Thermal-noise/CNR-only scope and no analog CTB/CSO digital “plant health” number reflect section 4. Prefer **“the 10log(N) CSO approximation is not generally reliable for short identical cascades; its phase/loading assumptions and N < 10 caveat apply”** to a statement implying it must be numerically false for every short chain. Primary evidence already opened: SCTE 270 2021r1 §15.3.1 footnote 22 / Appendix D and §15.5. The underlying nonlinearities do persist on digital plant. |
| :140–147 and :170 | **Faithful; None.** | OEM-document gates, company-target holds, existing bonding reminder and actual-phone verification remain appropriately bounded. The curriculum/public reports do not establish Arcom controls, ONX settings, company procedures or generator steps. |

### Remaining corrections for revision 2

These findings are against **handoff_docs/ROADMAP_DETERMINATION.md at a073faf**, not proposed edits to that file in this branch.

1. **Medium — D2:112: use Unknown, not “never,” for untracked history.** No recorded timestamp does not prove no backup/export has happened. app.js:282–290 and night-log.js:107 can export without recording the event. Use **“Unknown / no recorded backup time”** and **“Unknown / no recorded handoff export time.”** This corrects the interpretation; it does not introduce a new timestamp, target or store.
2. **Medium — D2:107 and :130: explicitly remove downstream question 3 from upstream prerequisites.** The retained table's details remain active except where noted. Its P0-5 detail still points to the downstream 33-versus-40 dBmV input question as an upstream dependency. FINAL_HANDOFF.md:67 and docsis-health.js:221 identify that as a separate downstream issue. Sections 3 and D2:118 already give the relevant upstream prerequisites; the downstream question stays open independently.
3. **Medium — D2:39–49, :64 and :69: distinguish historical facts from current actions.** The revision-2 introduction correctly pins b4cb832 and 13 Test tabs, but the older fact table still says “Now 11” and treats #15/#16 as open; the operative order still says finish both merged PRs. Label that table explicitly as revision-1 history and restrict the remaining stretch action to #18/#19/#20, plus #25 separately. Eventual 16 Test tabs still means **13 + 3** at this pinned baseline. This is reconciliation of known merged history, not a fresh assertion about later PR heads.
4. **Medium implementation condition — D2:109: preserve the actual-total and mode qualifications in the wording fix.** A “composite margin” label requires a genuine simultaneous composite-total reading at the comparable modem F-connector plane and declared power basis. A normalized/per-channel status-page number does not become a total by renaming the result. Blank **65 dBmV** is an assumed **Spec** minimum/default reference only in its applicable 3.1 CM/CMTS and mode context, not verified capability; it may equal the modem's real capability, but the blank field does not establish that. Keep the compatibility-mode caveat and the distinction from channel/DRW room. No new math or company value is requested.

The inherited end-of-document “Not re-verified” list at D2:179–181 should be read as **Claude's own verification scope**, consistent with D2:9, or labeled as historical. It must not imply that the separate critique still lacks the PDF, model/store reads or Reddit/Facebook material. Their closure here does not create a phone/field result or re-verify company/OEM material.

### Follow-up verification and remaining limits

- Read the exact Git PDF blob, confirmed hash/size and both pages, compared raw/layout text, and visually inspected both pages with Poppler and MuPDF. The table-overflow limitation is real in both renderers. Poppler initially reported font-cache warnings; MuPDF independently rendered readable page text and the same overflowing table cells.
- Read the complete revision-2 Markdown and its diff from 1ee5a72; independently compared its representations with critique commit 69c2c62. Two parallel read-only review lanes corroborated the six-row/no-equation inventory and the material reconciliation findings; I opened the underlying files myself.
- Only this critique Markdown is edited. The original PDF, determination, app code, navigation and generated files are unchanged. No new equations, software guards or company targets are introduced; no app build, gate, browser test, emulator or physical-phone check was rerun for this documentation follow-up.
- **Closed:** original-PDF availability, original P0 count/titles/wording, absence of a separately named evidence-handoff item, and the question of unique printed equations.
- **Still not re-verified:** private-message origin of evidence handoff; all previously identified unopened OEM/company material and technical procedures; physical phone/meter/field acceptance; whether the selected PHY issue is the newest. The PDF supplies no new primary-source evidence for these.
