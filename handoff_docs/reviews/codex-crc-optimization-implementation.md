# CRC32 optimization implementation and verification

Frozen commit: `b86382186c3179bd1037cf20a63a722e777711dc` on `/workspace/carpe-sweep`, branch `codex/sweep-grading`. Parent `edacc52e19aa0e57b3232b56f3a10312a02999fb`. Ordinary local commit only; no push, GitHub action, status/metadata edit, APK/signing/private-file access or new dependency. Last verification confirmed exact HEAD, clean worktree and clean `git diff --check`. Root owns scoped independent review, later broad gate and publication to existing PR #14.

Only authored production change: `night-sweep/evidence-archive.js:39–52` computes the same CRC32 using a private, lazily initialized 256-entry `Uint32Array` (1 KiB), instead of eight bit updates per input byte. Polynomial, initial/final xor and unsigned final CRC are unchanged. The ZIP per-member decode, declared-size comparison and complete CRC comparison remain unchanged and execute for every entry, including ancillary data. Original SHA-256 verification, resource caps, units, direction, schema, ambiguity handling and raw sample arrays are unchanged. `evidence.js` and `evidence-ui.js` hashes remain identical to baseline. No known Minor issue was included. Standalone/PWA were regenerated using actual build commands.

## Characterization before production change

The deterministic Python fixture generator now creates `forward-all-bytes.zip` with invented native JSON, empty ancillary data, ascending all-byte values and reverse all-byte values. Python `zlib.crc32` independently checks standard ascending `0x29058c73`, reverse `0xda3ba10a` (high bit set), and every generated member CRC. Two public-pipeline tests read the entire ZIP through offsets 0/1/17 without mutating backing bytes, and corrupt each of the 256 positions in the ancillary all-byte payload. The old algorithm passed all 69 native tests before the production CRC change. The optimized algorithm passed all 69 tests afterward and again at frozen commit. This is a behavior-preserving optimization: no functional RED or flaky timing assertion is claimed.

## Frozen-head results

| Command | Current result |
|---|---|
| `node qa/build3-native-evidence.test.cjs` | 69 passed, 0 failed |
| `node qa/evidence.test.cjs` | 52 passed |
| `node qa/evidence-ui.test.cjs` | 28 passed |
| `node qa/evidence-context.test.cjs` | 8 passed, 0 failed |
| `node qa/evidence-storage-failures.test.cjs` | 13 passed, 0 failed |
| `node qa/build3-sweep-grading-core.test.cjs` | 93 passed, 0 failed |
| `node qa/sweep-grading-ui.test.cjs` | 35 passed |
| `node qa/upgrade01415.test.cjs` | 10 HTML-based migration checks passed |
| `node qa/upgrade01617.test.cjs` | 6 HTML-based migration checks passed |
| `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/sweep-grading-layout.test.py` | 47 rendered checks passed |
| `node /tmp/carpe-evidence-audit/bench.cjs` | 273 independent CRC vectors and 18 large parsing/integrity cases passed against baseline/frozen candidate |
| `python3 /tmp/carpe-evidence-audit/filepicker-proof.py` | 23 actual Chromium picker/backup/restore checks passed |

The focused functional suites ran on the exact content committed as b863821. The 69 native tests, 273 independent CRC vectors, 18 large parsing/integrity cases, final benchmarks and actual-picker proof were rerun after freezing HEAD. No full gate was run, per parent instruction pending a fresh scoped review. No physical Android/iPhone, Safari/WebView, emulator, hardware or field test is claimed.

Actual-picker proof loads the frozen standalone at 390 px from a temporary loopback-only server, uses the real file-input handler for all-byte ZIP, near-cap stored/deflated ZIP, ancillary deflated ZIP and corrupt ancillary ZIP, compares every decoded invented sample exactly, checks actual original SHA/size, verifies attachment-only CRC rejection, proves no automatic grade, and compares exact compressed bytes through portable export/ID-remapped restore/re-export. Zero runtime errors and zero non-loopback requests. Receipt: `/tmp/carpe-evidence-audit/filepicker-proof.json`.

## Final lazy-table performance

Baseline is exact original archive source at edacc52; candidate source is byte-for-byte frozen b863821 except a scratch-only private CRC export for microbenchmarking. No product API export was added. Wholly invented valid 10,000-sample JSON/ZIP inputs are independently generated with Python stdlib `zipfile`/`zlib`, at exactly the unchanged 2 MiB decoded cap and within 8 MiB input/32-entry caps. Ancillary cases contain 1 MiB JSON plus 1 MiB all-byte data. Parsing timings include every original ZIP guard, CRC and real JSON/sample parser. Same warmups/alternating-order method as audit (31 Node / 21 Chromium measurements). These are local desktop measurements; 4× CPU throttle is simulation, not phone performance. Plain JSON follows identical code and is a control, with no claimed improvement.

| Case, median ms | Node 24.22.1 baseline → frozen | Chromium baseline → frozen | Chromium 4× baseline → frozen |
|---|---:|---:|---:|
| CRC only, 2 MiB | 63.996 → 4.801 | 82.900 → 5.000 | 298.000 → 23.000 |
| Stored ZIP, 2 MiB JSON | 70.382 → 11.799 | 78.200 → 15.300 | 344.900 → 77.100 |
| Deflated ZIP, 2 MiB JSON | 82.635 → 21.727 | 84.300 → 21.400 | 362.500 → 117.500 |
| Stored ZIP, JSON + ancillary | 76.102 → 10.973 | 74.900 → 11.900 | 334.000 → 60.600 |
| Deflated ZIP, JSON + ancillary | 79.625 → 19.337 | 73.900 → 14.200 | 493.200 → 100.500 |
| Plain JSON control | 7.349 → 7.334 | 10.100 → 10.500 | 85.100 → 73.800 |

The full stored-ZIP path is 5.97× faster in Node and 5.11× faster in normal Chromium; full deflated-ZIP path is 3.80× and 3.94× faster respectively. Raw ranges and rounds are in `node-results.json` / `browser-final-results.json`; throttled runs include machine-load variability, so no physical-device latency is inferred. Chromium version: 156.0.8078.79. Tiny ZIP timings are below browser timer resolution; their ratio is deliberately not reported.

## Exact commands and artifacts

From `/workspace/carpe-sweep`:
```sh
python3 qa/fixtures/viavi-synthetic/generate.py
node qa/build3-native-evidence.test.cjs > /tmp/carpe-evidence-audit/native-characterization-baseline.log
# Apply the small CRC-only production patch after the above characterization passes.
node qa/build3-native-evidence.test.cjs > /tmp/carpe-evidence-audit/native-characterization-optimized.log
python3 night-sweep/build.py
python3 build-pwa.py
# Execute each focused suite listed above; stdout/stderr logs reside in /tmp/carpe-evidence-audit/.
git diff --cached --check
git commit -m "perf: accelerate ZIP integrity checks with lazy CRC32 table"
python3 /tmp/carpe-evidence-audit/freeze.py
node qa/build3-native-evidence.test.cjs > /tmp/carpe-evidence-audit/native-frozen.log
node /tmp/carpe-evidence-audit/bench.cjs > /tmp/carpe-evidence-audit/node-final.log
python3 /tmp/carpe-evidence-audit/browser-final.py > /tmp/carpe-evidence-audit/browser-final.log
python3 /tmp/carpe-evidence-audit/filepicker-proof.py > /tmp/carpe-evidence-audit/filepicker-proof.log
git rev-parse HEAD
git status --short
git diff --check
```

QA uses the existing locked runtime by an ignored `qa/runtime/node_modules` symlink to `/workspace/Carpe-Noctum/qa/runtime/node_modules`; no install/upgrade occurred. Chromium path is `/usr/bin/chromium`; Playwright was already installed. Tools actually used: local shell/Git/Node/Python, Python stdlib zipfile/zlib, Playwright/Chromium and Superpowers verification/testing guidance. No external documentation/network tool was needed for the CRC arithmetic.

| File | SHA-256 |
|---|---|
| night-sweep/evidence-archive.js | `8e08b058f3443f977b4a1c58025f020608775ff8d7f9058ba0a4c6f514a1dd2a` |
| outputs/Night_Sweep.html | `b2350678a22cbb3843fb515d26a4871f22893923fe9baf08d0962fab0677b393` |
| dist/index.html | `3bfbdc2ebbffb50e0481c81c35c6ba761ed969bc308795d688d3178b16e49bc4` |
| dist/release.json | `760690ba62dcfec572b6add32e713c10bb5922511ed5f026d8e86aa6f5b3db13` |
| qa/fixtures/viavi-synthetic/forward-all-bytes.zip | `ed770a472806fb42ef9983dd5bbcc1d43256a7eb1ac33f88349aca88038dbe71` |

PWA content version is the generated hash `fd19303e68711e838a76`; app/version/storage schema remain unchanged. The old worker was replaced through ordinary generated-output rebuild. No generated file was hand-edited.

## Separate follow-up, no scope expansion

The audit also measured EvidenceUI rendering every chart while cards are closed (30 × 10,000 samples: 142.9 ms median / 4.59 MB HTML). It is documented only in `/tmp/carpe-evidence-optimization-audit.md`; preview toggling/open-state/print concerns warrant a separate change. No parser/UI/sample-array optimization or deferred Minor formatting/warning issue was included.
