# Final handoff — Carpe Noctum 2.0 Alpha build 3

Written November 12, 2026 by Grok. Lane A (ChatGPT) and Lane B (Claude) had stopped. This file is the D5 handoff for the required core. It is not a second lane's review. D3 is **not** closed by the one run below.

## Heads

| What | Value |
| --- | --- |
| `build3` when this close-out started | `f467e5261295449f94dd232ab3995c8a00be25ee` |
| Close-out branch | `grok/b9-closeout` |
| Lane notes merged in | `claude/logbook` `821650e`, `codex/work-logbook` `ea6b5ff` (already contains `codex/core-closeout-status` `7442451`) |
| Standalone `outputs/Night_Sweep.html` after the paperwork rebuild | `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de` |
| App bytes changed by the paperwork? | No. `python3 night-sweep/build.py` rewrote the same SHA-256. |
| PWA | Changed. Guide HTML is copied into `dist/` by `python3 build-pwa.py`. New content id from that build: `587c6f7c99559a428a45`. |
| Version | 2.0 Alpha build 3. Android source code 27. No build 3 APK. Signed installer in the repo is still 2.0 Alpha build 2, code 26. |
| Own full gate on `afba6cb` | **D3: one run (Grok).** 82 suites, 2,174 checks, 689.3 s; layout 554; smoke 352; exit codes 0; `git status` clean; standalone SHA-256 unchanged. Record: `handoff_docs/reviews/grok-gate-afba6cb.md`. A second local run of the docs-only child `6f8512c` (2026-11-12T04:52:29Z–05:04:21Z) was 82/2,174, 685.4 s, layout 554, smoke 352, clean, same standalone SHA-256. Record: `handoff_docs/reviews/grok-gate-6f8512c.md`. Hosted CI on `6f8512c`: [run 43157602918](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43157602918). This is one assistant, not both lanes. Spencer accepts or rejects D3. |

`main` was not touched. Pull requests #1 and #2 were not touched.

## What is on the branch

Counted by Grok, Node 22 and jsdom, on the `f467e52` standalone, before the guide edits: **29 screens, 47 features, 114 registry rows**, practice steps **22 / 16 / 15 / 8 / 9 / 7 / 10**. Safety reminders: **33**, counted by reading `night-sweep/safety.js` `ITEMS` (not a runtime call). Module splice lines: **41**, plus the DSIM pilot-code insertion, counted by reading `night-sweep/build.py`.

| Item | What it does | Verification |
| --- | --- | --- |
| 1 Limits | Test → Limits. Each row is spec, expert, company or unknown. Company values start unknown. Blank is not zero. | On the branch. Grok has not run the registry suite alone past the row count above. |
| 2 Pad / EQ solver | Test → Calculators → Pad / EQ balance. GainMaker uses the published pad and EQ chart. Quantum18 HGD/HGBT get a note, not a part pick. | On the branch. Not re-run by Grok as its own suite yet. |
| 3 Station | Route → Station. Forward targets and readings, return worksheet, balance and sweep as separate records. Company targets start unknown. | On the branch, including PR #23 native-input retention. Lane A and Lane B reported gates. Not Grok's run. |
| 4 Calculators | Test → Calculators. dB, ripple distance, pre-EQ spacing, OFDM power, echo delay. | On the branch. |
| 5 DOCSIS health | Test → DOCSIS health. Typed readings against modem capability ranges. No modem is polled. Company window starts unknown. | On the branch. **Open question 3** below. |
| 6 Night log | Job → Night log. Personal handoff. Captures saved Station stages. No customer names. | On the branch. |
| 7 Leakage | Test → Leakage. FCC limit check, distance restatement, CLI estimate, detector check, personal leak log. Not the company record. | On the branch. **Supervisor review needed** before coworkers use it. |
| 8 Outage | Job → Outage. First-response prompts. Not the company's procedure. No customer identifiers. | On the branch. **Supervisor review needed** against the local outage procedure before coworkers use it. |
| 9 Safety | Job → Safety. Reminders. Opens with follow company policy. Not the company's procedure. | On the branch. **Supervisor or safety officer review needed** before coworkers use it. |
| 10 Sweep due | Job → Sweep due. Reads saved balance and sweep dates. Interval starts unknown. | On the branch. |
| 13 Sweep grading | Job → ONX files → Grading aid. Grades a supported synthetic or own-meter file the tech attached. Original bytes stay. Company limits start unknown. Not official acceptance. | On the branch. Real meter files are not in the repo. |

Items 11, 12 and 14–20 are **not** on this close-out. Do not describe the open draft pull requests as merged.

## Verification (who ran what)

**Grok, this session, automated and local only:**

- `npm ci --prefix qa/runtime --no-audit --no-fund` — completed, 40 packages.
- jsdom load of `outputs/Night_Sweep.html`: 114 rows, 29 screens, 47 features, steps as above.
- Guide render with `marked` 18.2.0. Fragment links in the four rendered HTML files: 0 missing ids (local node script). The two main README Markdown copies compared equal.
- `python3 night-sweep/build.py` and `python3 build-pwa.py`. Standalone SHA-256 unchanged (command: `sha256sum`).
- Full gate on `afba6cb21c79a5ce85ba4a344c813367a0723fa8`, 2026-11-12T04:38:17Z–04:50:13Z. Chromium `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`, `NIGHTSWEEP_SUITE_TIMEOUT=3600`. `python3 night-sweep/build.py` exit 0, `python3 build-pwa.py` exit 0, `python3 qa/run-pwa.py` exit 0 (**82/2,174**, 689.3 s), `python3 qa/build3-layout.test.py` exit 0 (**554**), `python3 qa/browser-smoke.py` exit 0 (**352**). `git status --porcelain` empty. Standalone SHA-256 `b1591b4d1bfb639eec5a39014c2cbd4ab9f72871bdeb90cc90af41d67aa6e4de`. **D3: one run (Grok).**

**Reported by others. Not re-run by Grok. Not my counts:**

- Lane B on the `f467e52` tree (review 5868370766): 82 suites, 2,174 checks, layout 554, smoke 352, clean, standalone SHA-256 `b1591b4d…e4de`.
- Lane A on `f467e52` (`handoff_docs/reviews/codex-d3-f467-gate.md`): 82 suites / 2,174, layout 554, smoke 352. Their clock was about 03:28–03:40 UTC on November 12, 2026.

Those two runs were **before** this paperwork. They do not gate the new `dist/` bytes. Grok's run above is the post-paperwork head `afba6cb`. **D3: one run (Grok).** It is not both lanes. Spencer accepts or rejects D3.

**Not done by anyone, as far as the repo records:**

- Build 3 APK, signing, emulator, physical Android or iPhone, Safari, WebView, screen reader, real meter, reference-plane check, field or plant acceptance.
- Rendered checks, when they exist, are desktop Chromium at phone sizes. They are not a phone.

## Questions for Spencer

0. The Vecima installation and commissioning guide title and revision the company holds (item 17). No steps may be invented.
1. Where company settings should live. Today they sit in each phone's browser, outside jobs and backups. A shared company profile is a decision, not something an assistant should invent.
2. Who reviews the Safety, Outage and Leakage cards before coworkers use them (a supervisor or a safety officer; Outage against the local outage procedure).
3. A DOCSIS 3.1 modem that receives only SC-QAM channels: is the total input limit 33 or 40 dBmV? The source note is `research/build3/DOCSIS_HEALTH_SOURCES.md`. I did not re-open the specification.

## What Spencer does next

1. Read this file and `handoff_docs/lanes/grok-status.md`.
2. Decide pull requests **#1** and **#2** (into `main`). Leave them until you decide. Do not expect this close-out to merge them.
3. After you accept build 3: build and sign the code **27** APK **outside** the repository with the **original** key. Do not generate a new key.
4. Test that APK on your own phone only after a full project backup, and check the backup opens.
5. Then merge `build3` into `main`.

Until Spencer accepts D3, do not treat the definition of done as closed. The own gate on `afba6cb` is recorded. Stretch work waits until this close-out is merged.

## Product rules kept

Offline only. No live modem, CMTS, amp polling, XPERTrak, StrataSync, accounts, cloud, telemetry, AI or OCR. No version, storage-key, package-id or job-format change. Company targets were not filled in. 42/54 and 204/258 stay separate. No APK was built.
