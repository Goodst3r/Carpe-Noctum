# A4 render-context optimization implementation receipt

Frozen ordinary follow-up commit **41c4db2ea7c6fd550069b5e1c6a88217c1876f61** on `codex/sweep-grading`, parent/start **60d5eeb4aea8e3ae20964401113777e364b16154**; tree `b9d75366db62a1b94088b615334d9b1c32645d21`. This receipt covers this follow-up only. The clean Night Log integration and its separate proof remain in `/tmp/carpe-a4-nightlog-integration.md` and `-proof.json`; their results are not transferred to this source. No push, PR edit, merge, broad gate or status/Project Status/update-log authorship was performed here.

## Change and sources

Applied the exact root-authorized patch `/tmp/carpe-a4-render-context-optimization.patch` (SHA-256 `c653c585f4a93ecd7571d7b39f72299bbae57f45610dea80fe92cc98f2633fbe`) to the UI, whose starting bytes at 60d match the reviewed fe baseline. New UI SHA-256 is **4886da226fd70620f1461a79c0f2e23c794f0ae3cb55aceaad1aabd304c46215**, exactly the reviewed scratch candidate. Source material read: `/tmp/carpe-required-core-optimization-followup.md`, `/tmp/carpe-a4-render-context-optimization-characterization.md`, `/tmp/carpe-a4-render-context-optimization-independent.md`, full patch/characterization/harness/public-regression/browser scripts, the existing plan/AGENTS and integration handoff sources already recorded in the 60d receipt. Root explicitly authorized this implementation after the separate 60d freeze.

- `night-sweep/sweep-grading-ui.js`: a private historical-freshness helper accepts a context provider. One synchronous render lazily computes its context once; each historical row gets a shallow copy before substituting the existing compact snapshot. Public `freshness(r)` still recomputes for each call and ignores extra arguments. The provider never escapes the render. Current signature and first owner synchronization retain their own context calls.
- `qa/sweep-grading-ui.test.cjs`: one meaningful public `StationView.boundRecords` spy regression, keeping every existing 55 case. It verifies 100 historical rows, unchanged job bytes, one context build, later raw route/Station mutation and restoration, and owner replacement/missing-digest refusal. Its cleanup restores the original owner, grading/Station data and **all five public draft controls via real input/change handlers** (Evidence, Plant, Direction, Plane, MeasuredAt). No production test hook or timing assertion.
- `outputs/Night_Sweep.html`, `dist/index.html`, `dist/release.json` and renamed generated worker `dist/sw.9b576dc55089f5dbe8f5.js`: normal Python-builder outputs; previous worker removed. No guide/feature/practice-count change.

The entire `grade`, `signature`, context-observer/save-boundary, init and public-export blocks compare byte-for-byte to 60d. Nine critical source files (`evidence.js`, `evidence-ui.js`, `evidence-archive.js`, `sweep-grading.js`, `station.js`, `night-log.js`, `app.js`, `jobs.js`, `workflow.js`) are byte-identical to 60d. This preserves native parsing/original SHA/archive guards, exact raw math/decisions/schema, both saved-example keepers, optional validation/content terms, Night Log histories/dates and Station bound-record startup API. No persistent cache, formula, target, limit, key, dependency, version or job-format change.

## Own RED and failure disposition

1. Added the public regression **before** changing production UI, saved exact old UI to `/tmp/carpe-a4-render-context-baseline-60d.js`, and ran `node qa/sweep-grading-ui.test.cjs`. It failed as intended at the public spy assertion **actual100 vs expected1**: `/tmp/carpe-a4-render-context-public-red.log`.
2. After applying the exact patch, the new case passed, but the following existing invalid-input case failed `aria-invalid false !== true`: `/tmp/carpe-a4-render-context-ui-fixture-cleanup-failure.log` and `/tmp/carpe-a4-render-context-initial-results.json`. Diagnosis: the new case intentionally replaces the owner, correctly resetting draft controls; its original cleanup restored data but left the profile selection blank and the next input disabled. Corrected only the new test cleanup to snapshot/restore all five controls through actual handlers. Production patch remained exact candidate4886. Both complete 56-case suites then passed with all old cases retained, no skips or flags.
3. Earlier integration diagnostic logs, including the default-Node second-app fixture failure and identical `--jitless` reductions, remain untouched and attributed in the separate 60d receipt. This follow-up adds no V8-mechanism claim or runtime workaround.

## Own fresh focused checks

All commands below ran sequentially on the same final source/artifacts with default Node settings unless the listed source/frozen environment selects packaged HTML. Logs/results are `/tmp/carpe-a4-render-context-final-results.json`; no copied counts.

| Check | Exact command | Exit | Wall time | Log |
|---|---|---:|---:|---|
| ui-source | `node qa/sweep-grading-ui.test.cjs` | 0 | 46.109 s | `/tmp/carpe-a4-render-context-final-ui-source.log` |
| ui-frozen | `NIGHTSWEEP_RELEASE_TEST=1 node qa/sweep-grading-ui.test.cjs` | 0 | 46.39 s | `/tmp/carpe-a4-render-context-final-ui-frozen.log` |
| native | `node qa/build3-native-evidence.test.cjs` | 0 | 0.126 s | `/tmp/carpe-a4-render-context-final-native.log` |
| core | `node qa/build3-sweep-grading-core.test.cjs` | 0 | 0.075 s | `/tmp/carpe-a4-render-context-final-core.log` |
| interop-source | `node qa/build3-night-log-grading.test.cjs` | 0 | 18.144 s | `/tmp/carpe-a4-render-context-final-interop-source.log` |
| interop-frozen | `NIGHTSWEEP_RELEASE_TEST=1 node qa/build3-night-log-grading.test.cjs` | 0 | 19.28 s | `/tmp/carpe-a4-render-context-final-interop-frozen.log` |
| grading-rendered | `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/sweep-grading-layout.test.py` | 0 | 7.529 s | `/tmp/carpe-a4-render-context-final-grading-rendered.log` |
| context-rendered | `python3 /tmp/carpe-a4-render-context-integrated-browser.py` | 0 | 6.933 s | `/tmp/carpe-a4-render-context-final-context-rendered.log` |

Own automated counts: UI **56 source /56 frozen**; native parser **69/69**; grading core **93/93**; Night Log/grading interoperability **3 source /3 frozen**. The interoperability suite keeps real five-station captures, independent dates/both stages, warm500 reload/Station/raw records, duplication/portable identity remap/exact originals, both optional validators and actual Example retention.

Own rendered desktop Chromium: grading layout **88** checks at **320/360/390/430 px**; context comparison **22** cases at **320/390 px**. The context script `/tmp/carpe-a4-render-context-integrated-browser.py` pins baseline standalone60d, asserts its constructed candidate is **byte-identical to the actual new built standalone**, and uses actual file input, native SHA and Grade click on invented CSV. Every scenario has byte-identical HTML/state, unchanged render state and 100 records, no overflow/runtime errors/non-loopback requests. The public spy observes steady **100→1** context builds and first owner synchronization **101→2**, then back to100→1 on later render. Case records: `/tmp/carpe-a4-render-context-integrated-browser.json`. These are desktop Chromium checks, not emulator/phone/field results.

Also independently reran the supplied component characterization against **60d baseline and actual current candidate**, using public source modules copied to `/tmp/carpe-a4-render-context-integrated-fixture`: `node /tmp/carpe-a4-render-context-integrated-regression.cjs` — **63 cases passed**, `/tmp/carpe-a4-render-context-integrated-characterization.{json,log}`. This includes 0/1/100 histories, direct public freshness recomputation, lazy unavailable/missing sources, mixed/reversed histories, context mutations/restores, owner reset, valid Current plus historical rows, and direct/observed away-and-back changes at **both async verification boundaries**. Its Node DOM is a string sink and EvidenceUI verification is an explicit synthetic service-contract fixture, so real original-byte verification is established by the actual UI/browser suites, not this fixture.

The separately supplied scratch audit's concrete medians (50 rows/100 histories215.296→5.753ms;200rows870.146→14.493ms; one-history0.642→0.740ms) belong to that actor's Node string-render characterization. I did not rerun or include them in my own performance counts; they exclude DOM layout and support no phone-latency promise. My measured change here is the operation-count reduction with equivalent output/data.

## Reproducibility and freeze

Ran `python3 night-sweep/build.py` and `python3 build-pwa.py` before tests, repeated both after all checks, then `python3 /tmp/carpe-a4-render-context-seal.py`: **all653 tracked output/source/QA file hashes exactly match the sealed pre-check manifest**, all8 focused commands pass,63 component cases and22 browser comparisons pass. `git diff --check` passed. Staged only UI/QA and normal generated artifacts, saved semantic index entries, committed ordinarily and verified clean. Post-commit tracked hashes and every semantic index entry equal the tested/staged bytes; raw Git stat-cache bytes are not used as a pass criterion.

- Standalone SHA-256: `e38d95972d8473cccda1d3422054ebd52b0159cfe9c513d0358298c6ab885c6d`
- PWA index SHA-256: `a8410e3c4b6f99afe279423115a9eb2101757e071e30c88dd14d5c2da2b1d4c7`
- PWA content ID: `9b576dc55089f5dbe8f5`; worker SHA-256 `26c29c140d22301defd47086c3fce73bca0d48c4723c32186560eb8baea6c3b2`
- App version remains `2.0 Alpha build 3`;20 offline assets.
- Proof: `/tmp/carpe-a4-render-context-implementation-proof.json`; sealed manifest `/tmp/carpe-a4-render-context-sealed-manifest.json`; staged entries `/tmp/carpe-a4-render-context-staged-entries.json`.

## Limits and next task

No broad gate was run for this commit. Final exact-source independent review, latest-reviewed-base integration if needed, full gate, GitHub/status publication and merge decisions belong to root. Physical Android/WebView/emulator/phone/field validation and real owner exports are untested here; only invented fixtures were used. Eager closed Evidence previews and the previously recorded UI/native-description follow-ups remain outside this bounded change. Next: parent/reviewer consume this exact clean41c head, review the delta and run the serialized final gate after any final base integration; no prior-source gate count is attributed to it.
