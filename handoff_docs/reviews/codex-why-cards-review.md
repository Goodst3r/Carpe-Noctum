# Independent scoped review — PR18, item18 Why cards

Review date: 2026-11-11 UTC. Read-only review; formal GitHub review and merge belong to the coordinator.

## Identity and scope

- Repository/PR: Goodst3r/Carpe-Noctum [#18](https://github.com/Goodst3r/Carpe-Noctum/pull/18), draft, branch `claude/b18-why-cards`.
- Initial frozen/executed head: `93f0219fbcd070c2f96d32434f896ccc2fc4d9b4`.
- Final live head, checked both through GitHub metadata and `git ls-remote`: `7abaefd379849d77a15d5e1b43dde63fe847d204`. Its parents are initial head `93f0219…` and current build3 `5588a49b10292bed422b7597ec227bce38173a2d`.
- This update changes **no file**. Both PR18 heads have tree `1f0bf9f38fc5428afd5bdc3efe0f275dae1909d2`.
- Item18 commit `619bc1f738cbbec7438d3818a523f1337063c1ef` initially branched from `8381d6ab7a688d5e9f2b48e2853b27d6ed1a67c6`. Merge `6acd8d408a79f2107d319050f9709890c227c32e` subsequently incorporated high-split head `7b26e51fd4ef09f8647a58bf0f8fd299cb165b97`.
- Current high-split branch is `a1ad0260e611a5cce76dc40da6992aa351b5a78c`, another **no-file-change** merge of `7b26e51…` and current build3. Own-item review uses explicit tip-to-tip comparison against `7b26e51…` (equivalently current `a1ad026…`), **31 files, 655 insertions, 81 deletions**. Current b17/PR18 histories have two merge bases; an unqualified triple-dot comparison can select build3 and include the inherited stack.
- Standalone SHA256: `37f3b6f80cb67013ae59676a1131e3970d9be249b4af0157ece6a1cb94076829`.
- PWA index SHA256: `7885790560a44a593db54ad7ff9a921551408a290aa4b913abbfe97e955fa2cd`.
- Reviewed relevant AGENTS/project operating instructions, two-lane product/review rules, item18 BUILD_LIST text, author PR body, source note, reference JSON, own-item source/test/doc delta. Broader stack is not re-reviewed here.

Own-item files: `night-sweep/{why-cards.js,build.py,shell.html,style.css,thresholds.js,training.js,workflow.js}`; new `qa/build3-why-cards.test.cjs`, tab or layout assertions in `qa/{build3-docsis-health,build3-fiber,build3-highsplit,build3-impairments,build3-leakage,v20-design}.test.cjs`, `qa/build3-layout.test.py`, `qa/run-pwa.py`; research Why source note/reference JSON; functions/coverage guides and their HTML/PWA copies; generated standalone/index/release/service-worker; status/update log/lane-status.

## Verdict

**Spec:** Core item18 content/navigation scope is met: fourteen topic cards, numbered/year citations, field explanations, internal tool links where tools exist, explicit no-screen messages for S-parameters/noise figure/CNR, practice step and guide coverage. No new Important technical defect found in the item18 delta against the primary material actually reopened.

**Quality:** Two Minor follow-ups below. The explicit 44px review target is missed by the new source-tag controls. Content remains source-qualified in the research note and the new impedance dialog, with a small guide inconsistency. This is a scoped verdict, **not a merge-ready/full-gate verdict**. Inherited Important blockers remain open and broad gate/layout/smoke remain held.

## Findings

1. **Minor / P3 — New Why-card source tags are 32px tall.** `night-sweep/style.css:322` adds spacing but no minimum height for these new controls; `night-sweep/why-cards.js:87` emits nine interactive source tags. They inherit the 32px default at `style.css:193`. Actual Chrome DevTools MCP measurements at **320,360,390,430px** found every one **32px high**, widths **52.44 or 64.45px**. This misses this review assignment's explicit **44px** target and the project's general “large controls” direction (`handoff_docs/PARALLEL_TASKS.md:68`); the project rule itself does not specify 44 numerically. The new committed layout assertion at `qa/build3-layout.test.py:365` checks only 24px, so it cannot catch the requested target. Enlarge the new screen's interactive tags and align its targeted assertion. Severity is proportional: keyboard use works and these do meet a 24px minimum; this is not a claim of blanket WCAG failure. All fourteen summaries and sixteen tool buttons meet 44px.
2. **Minor / P3 — The guide omits one of the author's description-only qualifications.** `docs/NightSweep_1.8_Alpha_Functions_README.md:508` names only 293-13 and 293-14 as description-only. `research/build3/WHY_CARDS_SOURCES.md:17` also records 293-7 that way, and line26 claims all three are marked in the guide. Synchronize that short guide qualification and rendered copies. This is provenance consistency, not a newly demonstrated ALC factual error; this review reopened 293-7 body excerpts and found the central explanation supported.

## Sources actually reopened

Parallel extraction was used after Octen returned HTTP403 “payment method required” and direct/native SCTE opens returned403. No purchase, account setup or retry of known exhausted Firecrawl credits. Extraction results are **cached primary material**, with per-page acquired dates between April and October2026; they are not proof of a fresh November server response or the absence of newer revisions. PDF items below mean relevant **body excerpts** were returned and read, not that every page was inspected.

- [SCTE catalog](https://account.scte.org/standards/library/catalog/): copyright terms and number/year/title rows1–13; returned catalog cache acquired April24 does not include14. [Primary 293-14 catalog page](https://account.scte.org/standards/library/catalog/scte-293-14-what-is-impedance/) supplies title/year2026 and nominal75Ω scope, cache acquired October21. Thus all fourteen citation identities have primary support across these pages.
- [293-1 catalog](https://account.scte.org/standards/library/catalog/scte-293-1-what-is-the-decibel/): scope/title/year only. Its [PDF](https://account.scte.org/documents/7360/SCTE_293-1_2024.pdf) failed extraction/403. Its exact body remains unread by this reviewer; the basic dB restatement is corroborated in the opened 293-3/5/10 definitions.
- [293-2 PDF](https://account.scte.org/documents/7361/SCTE_293-2_2024.pdf): sections4.1–4.6 excerpts support percentage-of-c, dielectric/water effects and TDR dependence.
- [293-3 PDF](https://account.scte.org/documents/7967/SCTE_293-3_2024.pdf): definitions and sections5–5.4 support incident/reflected ratio, larger return loss/better match, no relation to upstream path loss, mismatch/ripple context.
- [293-4 PDF](https://account.scte.org/documents/8045/SCTE_293-4_2024.pdf): sections5.1–5.4 support flat/cable/EQ loss, frequency dependence and unity-gain purpose.
- [293-5 PDF](https://account.scte.org/documents/8046/SCTE_293-5_2024.pdf): definition and5.1/forward/reverse excerpts support recurring levels and span/gain relationship.
- [293-6 PDF](https://account.scte.org/documents/8047/SCTE_293-6_2024.pdf): skin-effect/depth, shielding contribution and effective conductor cross-section excerpts support summary. The card is deliberately less exact than the document's current-density depth definition.
- [293-7 PDF](https://account.scte.org/documents/8076/SCTE_293-7_2025.pdf): section5 and5.1 excerpts support configurable receive setpoint and RNG-RSP transmit adjustments. Transmit-headroom limits exist; the brief card is not a commissioning/acceptance procedure.
- [293-8 PDF](https://account.scte.org/documents/8115/SCTE_293-8_2025.pdf): scope/5.2/5.3 support terminating impedances, VNA measurements and derivation of gain/loss/return loss.
- [293-9 PDF](https://account.scte.org/documents/8137/SCTE_293-09_2025.pdf):4.2,5.1–5.6 excerpts support RF range/uses, named modulation families and plant AC power.
- [293-10 PDF](https://account.scte.org/documents/8214/SCTE_293-10_2025.pdf): definitions,5.5,5.7–5.10/conclusion support1mV/75Ω reference, analog PEP, QAM occupied-band average, downstream OFDM6MHz basis, narrower OFDMA basis and distinction between level and quality.
- [293-11 PDF](https://account.scte.org/documents/8267/SCTE_293-11_2025.pdf): scope/5.3/5.5/cascade appendix excerpts support thermal-noise CNR degradation and input-level significance. Card does not prescribe adding noise-figure dB values or implement cascade arithmetic.
- [293-12 PDF](https://account.scte.org/documents/8368/SCTE_293-12_2025_uo0I19F.pdf):4.2/5.2/5.3 excerpts support field units, frequency-dependent dipole conversion and distance importance.
- [293-13 PDF](https://account.scte.org/documents/8406/SCTE_293-13_2026.pdf):4.2,5.3,5.7–5.8 excerpts support noise bandwidth correction, instrument-floor limitation and distinction from RxMER.
- [293-14 PDF](https://account.scte.org/documents/8424/SCTE_293-14_2026.pdf):403, **body unread**. Only primary catalog scope/title/year opened.75Ω is additionally supported by293-10 section5.5. Do not relabel this as a full293-14 verification.

Author's own source gaps remain as authored: bodies3/5/8/11/12 not read beyond catalog/related material, and7/13/14 description-only. This review's additional opened excerpts corroborate central claims; they do not retroactively change author provenance or certify entire monographs. The nine blacklisted-phrase checks in the committed suite are a limited heuristic. Manual comparison found no copied tables/figures or substantial verbatim prose in the material inspected; no copyright/legal certification is claimed. There are no proprietary NCTI passages.

## Math, labels, plant and storage

**No new computational RF formula or calculator math** in this delta. Card1 restates existing decibel relationships; no new implementation requires an outside-app formula result. No Wolfram or external calculation is claimed.75Ω is a new registered constant with spec label, secondary verification, revision/section/conditions/date, explicitly nominal rather than measured. Other numerical references use existing tags/definitions; no local31/43/38 setting, pilot code or return tolerance is introduced. Generic concepts do not combine42/54 and204/258 methods. Long-loop ALC does not populate a company receiver reference. Why module is bundled and has no fetch/input/storage code; link destinations retain their existing qualifications and blockers.

## Own execution, with attribution

All work used detached `/workspace/carpe-pr18-review`; ignored QA dependency symlink points to `/workspace/Carpe-Noctum/qa/runtime/node_modules`. **No installs.** Test result writes were redirected in-process to `/tmp`; no authored source or tracked project-metadata edits, GitHub mutations, APK, private-evidence access or child-agent work.

Automated:

- At **93f0219**: `node` wrapper requiring `qa/build3-why-cards.test.cjs`, intercepting only its result path → **6 cases/22 comparisons pass**. `node qa/ui-names.test.cjs` → **6 pass**. Analogous wrapper for `qa/build3-registry.test.cjs` → **13 pass**. Those latter two were not rerun at latest head; the full tracked tree is identical.
- At **7abaefd**: same Why-suite wrapper rerun → **6 cases/22 comparisons pass**, `/tmp/pr18-build3-why-cards-results.json`. `git diff --check 7b26e51 HEAD` clean; `git status --porcelain` empty. Standalone hash unchanged.

Rendered, actual **Chrome DevTools MCP1.13.0**, isolated `/usr/bin/chromium`, loopback synthetic/default PWA, following `/workspace/.tools/chrome-devtools/SETUP.md`. Command: `python3 /tmp/pr18-devtools-review.py`; final evidence `/tmp/pr18-devtools/results.json`, screenshots/snapshot under its `checks/` folder.

- First completed run at **93f0219** reported **67 assertions,62 pass/5 fail**: four source-tag44px assertions plus a faulty case-sensitive console-text oracle. Actual browser response was `<no console messages found>`, so that fifth report was a harness error, not an application or network error. Other earlier aborted harness attempts (page-ID/selector/global assumptions, switching standalone to offline before cache) are not passing app tests.
- Corrected harness, fresh run at **7abaefd**: **67 assertions,63 pass/4 fail**, all four failures are the same32px source-tag finding at320/360/390/430. No console errors or failed-network message was reported in this final run. No failures were silently counted as passes.
- Passing rendered checks include fourteen in-bounds/wrapping cards, all headings/tool buttons44px, all text/source-tag contrast at least **8.25:1** in dark theme, summary keyboard Enter expansion, named modal with heading focus, Escape closure/focus restoration, secondary/unread warning visibly present, dialog width fits430px and Close48px, saved job/storage unchanged by opening cards/dialog, all **16** internal tool buttons work while offline, Custom-curves **18**-step practice opens Why cards and unity link reaches Station, and both cached functions/coverage guides render offline without page overflow at320/390/430.
- Offline scope is a **warmed, controlled service-worker PWA**; this is not a first-install offline network fetch or a physical device test. Visual inspection included the320px decibel card and430px source dialog screenshots; source dialog scrolls internally.

## Holds and untested areas

No broad `qa/run-pwa.py`, whole `build3-layout.test.py`, `browser-smoke.py`, builds or APK work was run. No Safari/WebView, Android/iPhone/emulator, hardware, physical touch, landscape, light theme or field verification. Exact full293-1/293-14 bodies and latest-revision absence remain unverified. Full existing-job backup/restore regression was not rerun; scoped opening/storage comparison passed.

Inherited blockers remain **open**: #10/#12 checklist quota recovery/native partial-time edits; #13 stale route candidates, malformed-number/search behavior and CPD guidance; #15 fiber badInput; #16 strict R-PHY startup-order versus parallel PTP. The no-change merge of reviewed leakage #9 does not close any of these. No inherited closure or full-stack acceptance is inferred from item18 results. Broad gate remains held for coordinator resolution.
