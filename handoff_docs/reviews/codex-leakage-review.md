# PR #9 final independent review and exact-head gate

**No blocking finding. All required local checks passed at exact `418e086a2c111b517c22fe382023ef63c2801874`: 68/68 suites, 1,328 checks; separate rendered layout 374; separate browser smoke 337.** Both prior P2 findings remain closed. Ready for root's final review, PR-description refresh and merge decision at the observed current base. No GitHub write or merge performed by this reviewer.

## Source, integration and freshness

- PR: [Goodst3r/Carpe-Noctum #9](https://github.com/Goodst3r/Carpe-Noctum/pull/9), `claude/b6-leakage` → `build3`.
- **Starting = ending tested SHA:** `418e086a2c111b517c22fe382023ef63c2801874`.
- Isolated detached worktree: `/workspace/carpe-pr9-integrated`.
- Live GitHub metadata agreed before and after the run: head `418e086a2c111b517c22fe382023ef63c2801874`, base `bc69bb4767e71107cb8ae3f83e4134c2ffafe41e`, open/draft/mergeable. Post-test observation recorded at `2026-11-11T19:25:53Z`; GitHub updated time `2026-11-11T19:08:04Z`.
- `git merge-base --is-ancestor bc69bb4767e71107cb8ae3f83e4134c2ffafe41e HEAD` exited 0. This base includes the independently reviewed B5 merge; A1 Station is also included. No missing-base integration request remains for this observed head/base.
- `git diff --exit-code 1e757e4d4f1b28cf6e41eef7307acd2ba99f280f 418e086a2c111b517c22fe382023ef63c2801874` exited 0, with no output. Both commits have exact Git tree **`6a5052e3201bc2438148436ec98632a2a16ee18f`**. The final merge adds base ancestry without changing any tree content.
- Standalone SHA-256, before and after: **`e960c2a7be00aa7f4dc2ffdf0f674e54c4f4b617d9dcc128e1ab831ae79c4add`**.
- Leakage source SHA-256: `a4fc4767ff10de4e59c3a5cddcbcf93fce49839216d4beb4f2a683afd1a5d3af`.

The final PR delta against current `bc69bb4` is 28 files, 4,937 additions/103 deletions: B6 leakage implementation/registry, workflow and training integration, source/reference documentation, leakage/regression suites and regenerated standalone/PWA/guides. There is no additional code delta from the previously scoped-reviewed `1e757e4` tree. Version, package identity and released storage/job keys remain unchanged; leakage's new device-local notebook remains outside job backups as designed.

Read AGENTS.md, both lane status files and setup for this resumed run. Confirmed the automatic-plugin/development instructions, project status, developer notes, PARALLEL_TASKS.md and KNOWN_GAPS.md are byte-identical to the versions read in the preceding scoped review. Applicable workflow is source-backed independent review and fresh verification; no source modification, private-input access or external research was needed to validate this unchanged tree.

## Findings disposition

| Finding | Current source | Independent disposition |
| --- | --- | --- |
| Prior P2: malformed native number input erases company settings | `night-sweep/leakage.js:413–418`, `:535–537` | Closed. The shared reader distinguishes native badInput from intentional empty input; invalid edits reject, preserve stored values and restore the visible saved value. Fresh final layout passed the committed real-keyboard/blur regression. |
| Prior P2: blank detector/repair dates become today | `night-sweep/leakage.js:530`, `:562–568` | Closed. The detector date is visibly prefilled/reset; actual detector and repair date values reach the validators without a fallback. Fresh final layout passed both blank-date refusals and explicit chosen repair-date preservation. |

The broader own MCP probe at **`1e757e4`** is explicitly **historical same-tree/same-artifact evidence**, not a new execution at `418e086`: 43 focused checks, both company fields with `-`/`1e`, genuine intentional numeric blanks, both partial-native and fully blank valid dates, chosen past dates, and optional invalid distance. Captured native number events/keyboard events were trusted. Because exact Git tree and standalone identity were independently confirmed, repeating those identical scenarios was unnecessary; the full committed browser regressions were freshly executed below. Historical artifacts: `/tmp/carpe-pr9-fixed2-review.md`, `/tmp/carpe-pr9-fixed2-devtools.py`, `/tmp/carpe-pr9-fixed2-devtools.json`.

No new Important/blocking source, storage, calculation, input or UI issue was found in this final review. Existing lane-status/PR text includes historical stack/head/status material; root owns the final PR-description/current-receipt refresh. The source documentation close-out remains part of the separately planned D4 work.

## Own fresh execution

Started `2026-11-11T19:17:29Z`; completed `2026-11-11T19:25:09Z`. Commands were serialized in this worktree with the shared locked QA dependencies symlinked from `/workspace/Carpe-Noctum/qa/runtime/node_modules`. **No dependency install or shared-dependency rewrite.**

Environment: Node `v24.22.1`, Python `3.12.14`, `/usr/bin/chromium` (Chromium `156.0.8078.79`, Debian 13). `NIGHTSWEEP_SUITE_TIMEOUT=3600`; `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium`; `NIGHTSWEEP_WRITE_EVIDENCE` unset. Source-test override variables were unset. The full runner had a 3,600-second outer limit; separate browser commands had 900-second outer limits.

| Own command | Result | Time | Log |
| --- | --- | --- | --- |
| `python3 qa/run-pwa.py` | **Exit 0; 68/68 suites, 1,328 checks**, runner says all passed, generated build unchanged and worktree unchanged | 428.9 s suite time; 429.394 s command wall time | `/tmp/carpe-pr9-integrated-full.log` |
| `python3 qa/build3-layout.test.py` | **Exit 0; 374 checks**, includes committed native number keyboard and both date regressions; no uncaught application errors | 11.127 s | `/tmp/carpe-pr9-integrated-layout.log` |
| `python3 qa/browser-smoke.py` | **Exit 0; 337 checks** | 18.193 s | `/tmp/carpe-pr9-integrated-smoke.log` |
| `git diff --check bc69bb4 HEAD` | Exit 0 | — | Reviewed command output |

Fresh full-run results include leakage **32 checks / 391 comparisons** with its committed independent references; DOCSIS 20; Station 22, rendered Station 121 and Station review 11; saved-job/portable-backup, other-storage-key isolation, evidence integrity, migration, offline/PWA and UI suites. These are this run's results, not author counts.

The full runner rebuilds standalone/PWA from source before testing; the external pre/post manifest verifies those regenerated bytes also match the initially committed artifact. Full runner's PWA HTML SHA-256 is `463a1fc85844bb743f78159f9306c1d6885f4b523f0e61e1fd06763e9d99e8e0`, worker SHA-256 `76563562c857e3710f54c71d85c46248248a36a5e3b5662e928dcde2c28c04ec`, release content ID `fbd9c6126b4024308562`.

## Preservation proof

Detailed complete maps are in `/tmp/carpe-pr9-integrated-proof.json`; result aggregation and raw runner results are in `/tmp/carpe-pr9-integrated-gate.json` and `/tmp/carpe-pr9-integrated-runner-results.json`.

| Required proof | Before/after result |
| --- | --- |
| All **547 tracked files**, content/size/mode/symlink state | Identical; manifest SHA-256 `03986dd7358f8ce0bb9b883ab3636cf1e134e04446eb9af831641019456dc8fd` |
| **385 authored/source files** selected for a separate source manifest | Identical; manifest SHA-256 `c8c988de10490008c100cdc41fc7d92a3de0b12a8a1bb520dd2a9585ea88a265` |
| All **23 generated tracked files** | Identical; manifest SHA-256 `3855619b28e89a19b3705fa51c4c38461b0a992dc22d904fc7b20b53211ea712` |
| All staged mode/blob/stage/path entries | Identical; SHA-256 `edb6cebd2fa2fca5d40cb023aca7bd80476a3206852a6811bb63ab31662c7802` |
| HEAD and HEAD tree | Identical, values pinned above |
| Staged diff, unstaged diff, status including nonignored untracked files | Both diff exits 0; empty status before/after |
| `night-sweep/README.md` and `docs/NightSweep_1.8_Alpha_README.md` | Unchanged and byte-identical to each other; SHA-256 `96e53e3bf54745ec4af3d86d75e32deb59d122f29caa179ab81756a1312f77ba` |
| Package manifests and QA lock | Unchanged; QA lock SHA-256 `52d740bf982201ae930854a4ba4ebc7a05c5da461f84578dd3d4d7c751e698a8` |

The raw index fingerprint changed from `f97195ef9b8a7801b535af1b91475f744b207489d5022dfbcb5622b536278a4f` to `d3ddcd42b89650255324d2a78363377f3496bc564495ec4d3e5b02007f83cb6c`; size remained 60,363 bytes. This is **diagnostic**, not a content-preservation failure. Git can refresh index stat/cache data during clean checks. Identical staged entries, HEAD tree, all tracked bytes/modes and zero staged/unstaged differences establish the required preservation; raw index-byte identity was deliberately not required. No source restoration was needed.

## Sources, tools and limits

Tools actually used in this final pass: GitHub MCP read metadata; Git fetch/read-only inspection; Python/Node; existing locked jsdom/fake-indexeddb dependencies; Playwright/Chromium through the actual committed suites; a temporary external supervisor/manifester `/tmp/carpe-pr9-integrated-run.py`. Prior Chrome DevTools MCP use and its trusted-event evidence remain attributed to the historical identical-tree scoped pass.

The stored leakage source registry, `research/build3/LEAKAGE_SOURCES.md`, decimal reference fixtures and prior source review remain the provenance for the unchanged FCC/SCTE formula/condition claims. No new formula was introduced between reviewed and final trees, and no fresh external FCC/SCTE or live Wolfram query was made in this final pass. Suites named Wolfram replay committed references; they are executed numeric regressions, not a new external certification. SCTE catalog-only/body-unread qualifications remain as documented.

These checks use synthetic data and rendered desktop Chromium, including phone-size emulation. No private files/profile, physical Android/iPhone, emulator, Safari/WebView, leakage meter, measurement-plane/calibration, field, build-3 APK/signing, install/update or deployment claim. Company settings/notebook storage remain device-local and outside job backups; supervisor review before coworker use remains a release condition. Nothing was published or sent to another person.

Root retains final review/PR-description refresh/merge. Recheck live head/base immediately before that action; these counts apply to exact `418e086a2c111b517c22fe382023ef63c2801874` against the observed included base `bc69bb4767e71107cb8ae3f83e4134c2ffafe41e`. A new source/artifact/base integration needs its own fresh exact-head verification.
