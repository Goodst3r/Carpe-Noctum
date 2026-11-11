# Independent scoped review — PR #16, item 17

Reviewed November 11, 2026. Read-only review; no project source, authored metadata or GitHub writes, installs, private files, APK work or child agents. Parent owns the formal PR review.

## Exact revision and scope

- Canonical PR: https://github.com/Goodst3r/Carpe-Noctum/pull/16
- Final live/tested head: `7b26e51fd4ef09f8647a58bf0f8fd299cb165b97`, `origin/claude/b17-highsplit`.
- Detached worktree: `/workspace/carpe-pr16-review`.
- Item 17 comparison base: parent fiber head `60e19c7a614dad6ae056c29fb1fe07dc911c5f81`.
- Actual integration branch: `build3` / `bc69bb4767e71107cb8ae3f83e4134c2ffafe41e`.
- Initially reviewed `8381d6ab7a688d5e9f2b48e2853b27d6ed1a67c6`. During review the author merged current build3 as `7b26e51`. `git diff 8381d6a 7b26e51` is empty; both have tree `f2a30f5f57de61499624eb34ed5a372fb28b8e60`. The final focused suite and browser probe were nevertheless rerun after switching to the new head. Older initial executions are not additional final-head counts.
- SHA-256, frozen standalone: `927175740eae42084fe05b44a28c7d3533bca968ef8ec0aba67117f23cf9b350`.
- SHA-256, PWA `dist/index.html`: `8d703683a8d87a73fc431773137c782bfbdef6805144a21037c80bf0c558c730`.

Read AGENTS.md, automatic/development instructions, project status, developer build notes, handoff plan/rules, both lane status files, known gaps, setup notes, BUILD_LIST item 17, High split guide/training text, HIGHSPLIT_SOURCES, implementation, reference and focused tests. Read live PR body with gh; GitHub connector returned no PR16 discussion/review comments. The PR body still names the older `8381d6a` ending commit; live head above is authoritative.

Reviewed the item's 31-file delta against the parent: new highsplit.js; shared build.py/shell/style/workflow/thresholds/training; functions and coverage Markdown/HTML; update log/status/Lane B status; new reference Python/JSON/source note and highsplit test; relevant Test-tab assertions, gate registration and scoped layout additions; rebuilt outputs/dist including service-worker rename. Earlier stacked features are inherited, not newly approved here.

## Confirmed finding

**Important — do not teach timing as a strictly later sequential step.**

`night-sweep/highsplit.js:170` says the eight entries describe what an RPD does after power-up **“in order”** and renders an ordered list at line 171. The list places completed core configuration (line 93) and L2TPv3 tunnels (line 94) before timing (line 95). `night-sweep/training.js:93` repeats “read the eight steps in order”; the guide describes the same ordered model.

Independently downloaded and read the actual official **CM-SP-R-PHY-I22-260819**, section **6.9, printed page 88**. It states:

> The RPD MUST initiate PTP synchronization when RpdPtpPortAdminState is set to “up” during configuration by the Principal Core. Thus, the RPD MUST be able to support PTP synchronization occurring in parallel with RPD configuration by both the Principal Core and Auxiliary Cores.

Section 6.10.1, page 90, requires PTP synchronization and auxiliary configurations to have been **initiated** before waiting for MoveToOperational; the core's decision can include acceptable PTP and L2TPv3 status. This is not one fixed serial eight-stage sequence. A technician using the reading aid to understand what the core operator is waiting for can infer that timing starts only after configuration/tunnels, missing a parallel timing failure or wait.

Revise the overview, timing entry, practice step and guide to describe dependencies and parallel work explicitly. Do not merely move the timing row to another asserted fixed position. Cite I22 §6.9 for that qualification. The focused test currently asserts the literal eight-entry order, so its passing result does not validate the architectural ordering claim.

Primary source: https://account.cablelabs.com/server/alfresco/03e9aafe-98b3-48da-9e07-79ca4e0b5c28

## Separate source qualification follow-up

**Minor / needs exact I08 confirmation — preserve Table 29's contiguous-spectrum assumption.**

The app labels the columns “Downstream ends” (`highsplit.js:152`) with mid-split 1644 and sub-split 1584–1590; the registry calls these “the edges a node or cable modem is built to” (`thresholds.js:178`). Neither the visible table nor registry conditions carries “assuming a contiguous occupied downstream spectrum.” The functions guide repeats the unqualified endpoints (`...Functions_README.md:493`).

The official PDF I could independently reopen prints **PHYv4.0 I07**, not the app's cited I08. Its §7.3.2 and Table 29 (page 108) explicitly retain that assumption and give a counterexample: lower edge108, upper edge1794, a150MHz hole at LTE frequencies. Thus 1644 is not an unconditional physical upper limit. The table values in the app agree with this older table, but its qualification matters. Please verify the exact I08 table/caption and preserve the applicable qualification in the screen, registry and guide. I have not represented the older PDF as a full independent verification of I08 or made this an additional confirmed Important finding.

Primary older issue actually reopened: https://account.cablelabs.com/server/alfresco/4d3a5133-1eb2-4074-a166-1b31593b4106

## Specification and source assessment

- The Vecima commissioning checklist is intentionally absent and visibly blocked on a named applicable OEM guide/revision. That is honest scope handling, not a defect. The public Vecima support page directs installation/configuration guides, user manuals and release notes to the Customer Portal. Other makers' LED/procedure pointers are expressly restricted to their own hardware. No OEM commissioning steps, pilot codes, optics receive target or timing-lock LED meanings were invented here.
- 42/54 and204/258 remain separate;108–137MHz is downstream for42/54 and85/108, upstream for204/258. No local31/43/38 anchors were promoted to specifications, and no return tolerance, company target, detector setting or injection default was introduced.
- Six new registry rows are uniquely registered and show spec/expert labels and primary/secondary/derived qualifications. Existing CLI and repair rows are reused. Derived gaps and band-containment classification are identified as derived. No user inputs, new storage keys or new job fields exist in this module.
- Exact DOCSIS3.1 I20 selected sections7.2.1/7.2.3 were independently reopened: the displayed upstream-edge list and85+ restriction, mandatory258 lower edge/1218 demodulation and optional1794 match. The117MHz inconsistency elsewhere in that issue is acknowledged in registry conditions.
- Reopened eCFR76.610/611/614/616 supports the shown scope thresholds, CLI/airspace figures, quarterly monitoring and emergency-frequency exclusions. These are short summaries, not a substitute for the complete regulatory criteria.
- Reopened the original2020 SCTE paper via Arcom and checked the home/node signal-level inversion and OUDP discussion. The app clearly distinguishes technical papers/maker opinion from standards, says OSSI leakage-session text was not read, and openly qualifies the address/time/control-step use of earlier R-PHY issues. Those qualifications should not be treated as hidden full-current-issue verification.

Sources actually opened in this review:

1. R-PHY I22 official PDF above: selected initialization/address/time/GCP/synchronization/operational sections read locally with pdftotext; exact source supports the confirmed finding.
2. PHYv4.0 official PDF above: cover is I07; selected §7.3.2/Table29 read, exact I08 not reopened.
3. PHYv3.1 I20: https://account.cablelabs.com/server/alfresco/4eb470eb-aca3-4e64-af88-773b8c594fbd — downloaded; selected §7.2.1/7.2.3 checked.
4. Original2020 SCTE paper: https://www.arcomdigital.com/wp-content/uploads/2022/07/Leakage-in-a-High-Split-World-SCTE-Expo-2020_Final.pdf — downloaded and selected sections checked.
5. https://vecima.com/company/product-support/ — Product Documentation block independently reopened with Parallel.
6. https://www.ecfr.gov/current/title-47/section-76.610 ; https://www.ecfr.gov/current/title-47/section-76.611 ; https://www.ecfr.gov/current/title-47/section-76.614 ; https://www.ecfr.gov/current/title-47/section-76.616 — Parallel returned exact relevant rule text.
7. CableLabs Sept28,2026 3GHz announcement: https://www.cablelabs.com/blog/docsis-4-0-technology-goes-to-3-ghz — confirms a new optional annex exists; it does not independently validate the app's I08 table.

## Own executed verification

**Automated and arithmetic, final head:**

- `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-highsplit.test.cjs` — **7 checks passed,41 comparisons** against the author's stored reference; exit0. This covers frozen app data/citations/registry/module wiring/storage invariance. jsdom is not rendered browser evidence.
- `NIGHTSWEEP_RELEASE_TEST=1 python3 /tmp/carpe-pr16-independent.py` — own derivation and comparison, independent of the author's reference script. Decimal edge subtraction and independently enumerated interval containment match app output: gaps8–12/23/54MHz; single-edge downstream widths1536/1536MHz; downstream/downstream/upstream aeronautical positions.
- Wolfram context plus Language evaluator actually executed: `{50-42,54-42,108-85,258-204}`→`{8,12,23,54}`; widths→`{1536,1536}`; containment booleans agree. These are new simple derived calculations, not “no new formulas.” Wolfram validates this arithmetic, not plant readiness or the source assumptions.
- Executed the actual Python standalone builder with only its destination redirected to `/tmp/carpe-pr16-rebuilt.html`; result equals committed standalone **byte for byte**. No tracked generated file rewritten.
- A preliminary custom comparison using the JS development harness's assembler failed byte equality because its JSON serialization writes4 where the Python builder writes4.0 in catalog data. Located the first mismatch; the real Python builder comparison above resolves that harness-only mismatch. No app build defect claimed.
- `git diff --check 60e19c7 HEAD` — exit0. Final `git status --porcelain=v1` empty. Ignored dependency symlink uses only the existing locked `/workspace/Carpe-Noctum/qa/runtime/node_modules`; no installs.

**Rendered, actual Chrome DevTools MCP bridge, final head:**

- Read `/workspace/.tools/chrome-devtools/SETUP.md`; ran `/tmp/carpe-pr16-browser.py` against the frozen PWA in a fresh isolated synthetic context through the installed `chrome-devtools-mcp1.13.0` stdio bridge and `/usr/bin/chromium`.
- At320/360/390/430px dark:24 assertions passed for panel visibility, root/card fit, focusable named table scroll regions, wrapping and24px source tags. All three wide tables intentionally scroll inside their own regions; root width equals viewport at every tested size. Inspected actual390px screenshot.
- Eight further assertions passed for job/storage invariance after reading, source-tag count/dialog/revision, and practice feature→Custom curves→High split mapping with17 steps.
- Warmed the PWA's service-worker cache, stopped/closed the local HTTP server, requested a reload under the bridge's Offline emulation, and reopened High split: visible, eight entries,390px and no root overflow. `navigator.onLine` remained true under this bridge emulation, so the offline proof is server-stopped cache reload, not that browser property.
- No console errors returned. Browser/server closed after probe. No physical phone, emulator, Safari or WebView claim.

Artifacts:

- `/workspace/.tools/chrome-devtools/checks/pr16-highsplit-results.json`
- `/workspace/.tools/chrome-devtools/checks/pr16-highsplit-390.png`
- `/workspace/.tools/chrome-devtools/checks/pr16-highsplit-snapshot.txt`
- `/tmp/carpe-pr16-browser.py`, `/tmp/carpe-pr16-browser.stdout.log`
- `/tmp/carpe-pr16-independent.py`, `/tmp/carpe-pr16-independent-results.json`

## Scoped verdict and limits

**Changes required for the confirmed technical ordering claim.** The limited guide is well qualified about the missing Vecima procedure, and focused implementation checks found no new runtime/storage/UI blocker. The OEM checklist portion of item17 remains incomplete by design until an applicable named OEM revision is available. It is not valid to report the entire item17 checklist as complete.

Full automated gate, whole-layout suite and browser-smoke suite were deliberately held while the parent A2 full gate ran and inherited stack blockers remained. No author's broad count is represented as my execution. Exact PHYv4.0 I08, the2021 SCTE paper, all other-maker guide contents, and every current issue of the R-DEPI/R-DTI/R-OOB/R-OSSI sources were not independently reopened end to end. Current browser behavior does not resolve source completeness or field usefulness. Device/emulator/field/RF validation remains untested.

Inherited Important findings remain open: #10/#12 shared checklist unreadable-storage/quota preservation and native partial-time input; #13 stale route candidates, malformed width/badInput and CPD wording; #15 fiber badInput. This review does not close or approve them. No peer-stack integration or merge approval is implied.
