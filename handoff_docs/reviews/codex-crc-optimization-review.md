# Independent scoped CRC optimization review

Reviewed head: **b86382186c3179bd1037cf20a63a722e777711dc**. Comparison base: **edacc52e19aa0e57b3232b56f3a10312a02999fb**. Review ran in detached `/workspace/carpe-crc-review`; source, generated app and Git index were not edited. Starting and ending tracked worktrees were clean. Scope is the CRC optimization, its synthetic characterization and generated output, not a new whole-feature/Lane B review of PR #14.

**Critical: none. Important: none. Minor introduced by this change: none. Verdict: approved for the coordinator's final same-source gate.** Lane B must still review the actual updated PR head before merge; this internal review is not merge authorization.

## Code assessment

The only authored production change is `night-sweep/evidence-archive.js:39–52`: a private lazy 256-entry `Uint32Array` replaces eight bit iterations per byte. The reflected polynomial, seed/final XOR and unsigned `>>>0` are preserved. Index masking covers all 256 byte classes; indexed access respects the supplied byte view. The table occupies 1,024 bytes, has no public API and is reused. Its initialization is synchronous, so overlapping async callers cannot observe a partial table.

`unzip()` and `parseBytes()` are byte-identical to the comparison base. Every ZIP member still undergoes bounded decoding, exact size validation and CRC validation before a preview is returned, including ancillary/empty members and members after the selected JSON. Input/decode/entry caps, native parsing, direction/units, raw samples, grading, original SHA verification, UI and storage source are unchanged. The source module occurs byte-exact once in each committed standalone/PWA artifact. All 20 worker asset hashes match their files; app identity is unchanged.

The new fixture and tests meaningfully characterize all byte values, empty/high-bit CRCs, backing-buffer offsets, original immutability and corruption outside the selected JSON. The deterministic generator reproduced all 14 committed synthetic fixtures byte-for-byte in scratch space.

## Fresh reviewer execution

Commands ran from `/workspace/carpe-crc-review` unless a path is explicit:

```sh
python3 /tmp/carpe-crc-review-generate.py
node /tmp/carpe-crc-review.cjs
node qa/build3-native-evidence.test.cjs > /tmp/carpe-crc-review-native.log 2>&1
node /tmp/carpe-crc-review-bench.cjs
python3 /tmp/carpe-crc-review-browser.py
python3 /tmp/carpe-crc-review-artifacts.py
git diff --check edacc52e19aa0e57b3232b56f3a10312a02999fb b86382186c3179bd1037cf20a63a722e777711dc
git status --short
git rev-parse HEAD
```

- Python `zlib.crc32` supplied **545** independent vectors: every single byte, repeated-byte patterns, ascending/descending data, empty/standard-check vectors and deterministic random lengths through 2 MiB. **272** expected CRCs have their high bit set. Both baseline and optimized functions matched every reference through offsets 0/1/31: **3,270 exact CRC comparisons**. Backing bytes stayed exact.
- Instrumented copies of exact source confirmed no table allocation at module load or plain/non-ZIP parsing, then precisely one 256-entry/1,024-byte allocation reused across ZIP calls. All 256 table entries matched the original bit recurrence. Instrumentation exists only in scratch VM copies; public exports remain `limits` and `parseBytes`.
- **33** independently generated ZIPs covered stored/deflated payloads, signed data descriptors, reordered members, empty/all-byte/high-bit/random ancillary data and the exact combined decoded cap. **99** valid offset-view parses equaled the real expected native parse. **214** mutations in nonselected members were rejected as attachment-only, with input bytes unchanged. Stored corruptions specifically reported CRC rejection; deflated corruption reported CRC/integrity/decode failure.
- Committed native suite: **69 passed, 0 failed**, exit 0. Diff whitespace check passed; final HEAD remained exact and tracked status was clean.
- A separate delegated read-only static reviewer independently confirmed arithmetic, private/lazy allocation, fixture CRCs, unchanged ZIP/parser tail and exact generated embedding; no introduced finding. Counts above are this reviewer's own execution.

Receipts: `/tmp/carpe-crc-review/correctness-results.json`, `artifact-results.json`, `node-timings.json`, `chromium-timings.json`, plus native log and rerunnable scratch scripts listed above.

## Performance claim assessment

The small paired sanity test used one warmup per variant and nine alternating paired samples, with real `parseBytes()` calls. On a stored ZIP with a short valid JSON plus ancillary data bringing decoded bytes to exactly 2 MiB, median Node 24.22.1 time was **117.0 → 16.7 ms**; desktop Chromium 156 at 390 px was **87.2 → 5.1 ms**. This CRC-heavy ancillary workload differs from the author's large-JSON workload and must not replace its reported numbers. A 471-byte stored ZIP was below useful browser timing resolution; there is no ordinary-small-file latency claim.

I read `/tmp/carpe-evidence-optimization-implementation.md`, the original audit, manifest, timing scripts and final result JSON. The author's frozen benchmark sources match the actual baseline/candidate exactly except a scratch-only private CRC export. Its 31 Node/21 Chromium measurements alternate order after warmups and time the full parse pipeline. Final normal-Chromium stored/deflated 2 MiB JSON medians **78.2 → 15.3 ms / 84.3 → 21.4 ms** agree with the raw summaries. The synthetic inputs contain 10,000 valid samples padded to the decoded cap; these figures describe that workload. The report explicitly treats plain JSON as an unchanged control, tiny ZIP ratios as uninformative and 4× throttling as desktop simulation. Its claims are appropriately scoped; no physical-device or typical meter-file guarantee is supported or asserted.

## Boundaries and remaining work

The two already-deferred native Minor findings (unsigned descriptor CRC equal to optional signature; warning from a skipped empty chart) predate this change and remain unchanged. No scope expansion is requested.

The coordinator's final full applicable gate and separate layout/smoke run remain pending after this review; I did not rerun the whole matrix. No private original/attachment, signing material, APK, emulator, physical Android/iPhone, Safari/WebView, RF hardware or field evidence was accessed/tested. I make no claim from another agent's private-file proof.

Tools used: local Git/shell, Python stdlib zipfile/zlib, Node VM/actual parser, Playwright/desktop Chromium; GitHub read-only PR #14 metadata confirmed its draft/published old head, with no GitHub mutation. Superpowers verification guidance was applied. No source, index, version, dependencies, public service or repository metadata was changed.
