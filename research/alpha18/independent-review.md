# Independent 1.8 Alpha review

Reviewed November 11, 2026 against the supplied, separately retained `/workspace/NightSweep_1.7_Baseline`. The one reproduced product finding below was addressed and independently reverified; no unresolved material finding remains in this review's scope. This is a source/diff and focused-execution review; it does not replace the root release freeze, whole-suite run, rendered-browser checks or physical-device validation. Application source was not edited by this reviewer.

## Findings

### P2 — Interrupted Android release publication can mix a new APK with the old success receipt — addressed

**Location at initial review:** `android-build/build.py:130`–`133`, specifically the final `shutil.copy2(artifact, release_out / artifact.name)` loop. Candidate validation is isolated correctly, but publication overwrites release files one at a time and copies `build-info.json` last. A failed final copy leaves the old success receipt next to a different APK. This compromises receipt integrity and the retained rollback artifact even though the build command raises an error.

**Reproduction:** Load `qa/android-preview.test.py` with `importlib.util`, instantiate its `BuildHarness` in a temporary directory with its prior validated placeholder release, and patch `h.module.shutil.copy2`. Delegate all copies to the original implementation except destination `h.out / 'build-info.json'`, which raises `OSError('synthetic out-of-space during receipt publication')`. Invoke `h.run()` and compare `files_under(h.out)` with `h.before`. The production build orchestration uses synthetic SDK results; no APK is really compiled or signed.

**Observed:** `release_unchanged: false`, `apk_changed: true`, `receipt_unchanged: true`; the prior `{"priorValidatedBuild":true}` receipt survives alongside the replacement candidate APK.

**Expected:** A failed promotion preserves the prior APK and matching receipt together, or a directory/versioned promotion makes the complete verified set available.

**Resolution:** Root reproduced the publication-copy failure with and without a prior release, added promotion-failure coverage, and replaced the final file-copy loop with `publish_release` (`android-build/build.py:18`). It prepares the complete directory before replacing the release, restores the prior directory on a failed rename, retains a recovery path if rollback itself fails, and preserves a separately built nested Preview directory when promoting standard output. Root's [publication-red.log](native-audit/publication-red.log) records the three failing subcases before repair; [publication-green.log](native-audit/publication-green.log) records 14 passing tests afterward. This reviewer read the changed helper and independently reran `python3 qa/android-preview.test.py`: 14 passed, exit 0. The finding is addressed for the reviewed caught filesystem/validation failures; this does not constitute an actual SDK build or power-loss/durable-filesystem test.

## Scope and reviewed behavior

- Reviewed all functional source changes against 1.7: Records profile guards; route/power ID validation and allocation; power what-if IDs; Android candidate staging and release identity; training factories, guides and feature routing. Version-only export and wrapper changes were checked for storage/package identity preservation.
- The six-active factory contains exactly six AOI active rows in a single source → A1 → A2 → A3 → A4 → A5 → A6 chain. The launch node is separate. Six 300 ft incoming spans have endpoint cable losses 3/9 dB and entered gains 3/9 dB, restoring 34/46 dBmV. The final 250 ft endpoint is 31.5/38.5 dBmV. TDR starts after A6 at 1800 ft, places the 125 − 25 ft event at 1900 ft, and rejects the path through upstream actives. Between-marker interpolation is explicitly qualified in the guide.
- New practice inputs retain schema 1, the existing training marker and original-byte backup path. Synthetic readings remain Planning and criteria unapproved. Vecima/AOI stays at 204/258 MHz; OEM/DSIM/manual/GS7K practice stays at 42/54 MHz. Manufacturer gain/control settings and synthetic arithmetic are distinguished.
- Reviewed the preserving `JobsUI.openTraining` sequence: candidate validation and original-byte preparation precede named-job preservation and loading; cancellation/failures do not authorize replacing the working job. The complete example retains five CSV originals plus the SVG original-only attachment.
- README/status/native documentation identifies local 1.8 source/browser output and prepared Android code 23; it explicitly distinguishes historical build 22 and does not claim a new signed 1.8 APK or public deployment. The authoring/generated-document boundaries and existing manufacturer-source limitations are documented.
- Independently parsed all seven `release/NightSweep_1.8_*.json` practice exports and verified their schema-one/synthetic identities, expected variant set, every original's decoded size/SHA-256 and the exported six-active serial parent chain. All checks passed.
- A historical 1.7 practice JSON was incidentally regenerated with new evidence IDs during development. Its attachment bytes/hashes were unchanged, but the JSON file identity differed. The root agent was asked to restore the historical export byte-for-byte or redirect the producing test before packaging.

## Commands independently executed

| Command | Observed result |
| --- | --- |
| `node qa/alpha18-math.test.cjs` | 9 checks passed |
| `node qa/import-id-boundaries.test.cjs` | 6 checks passed |
| `python3 qa/android-preview.test.py` | Initially 11 passed; after publication repair, fresh independent rerun 14 passed, mocked SDK only |
| `NIGHTSWEEP_TRAINING_SOURCE_TEST=1 node --test qa/training-library.test.cjs` | Fresh post-freeze rerun: 11 passed, 0 failed, exit 0; all 37 feature targets checked |
| Disposable Android publication-failure reproduction described above | Reproduced mixed APK/receipt after final copy failure |
| Independent Python JSON/base64/hash/topology check of all seven 1.8 practice exports | Seven expected variants, six verified originals and six-serial-active topology passed |

The interim training failures were a visibility helper requiring `SVGElement.hidden === false` (SVG supplies `undefined`) and a preservation-test predicate dereferencing `evidence.length` on an earlier snapshot with no evidence property. They were reported as test-harness defects, not application failures, then corrected by the training agent. The feature mapping now supplies explicit controls for all 37 entries, and the fresh independent source-training rerun passed all 11 tests in 63.83 seconds.

## Verification limits

This review inspected representative formulas, missing-value/overflow boundaries, topology, import/export and persistence paths, and the existing independent Wolfram/catalog evidence. It did not independently authenticate every inherited manufacturer-table cell or repeat the external calculations. No signing key, real Android SDK build, emulator, physical Android/iPhone, Safari/Home Screen, native picker/share/print, actual quota exhaustion or field RF setup was tested by this reviewer. The root's current whole-suite/browser/package evidence must be read separately; historical counts are not new verification.

Tools used by this reviewer: local execution/source comparison plus Superpowers review and verification guidance. No private field evidence was transferred and no upstream changes or deployment occurred.

## Final follow-up

Targeted re-verification is complete: Android publication repair 14/14; frozen source training 11/11; seven exported practice examples checked. Root is responsible for final whole-release counts, browser/device scope, artifact hashes, packaging and restoration of the incidental historical-export rewrite after QA.
