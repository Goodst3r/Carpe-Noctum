# Astra local map importer report

Source commits: `36f4eb53969523bc54fa7cfc3b97c8b28b2ad6df` plus final `2f40ecb` on `chatgpt/local-map-import`.
Base: `0e66db1597c09c8a8312a57c75668adcb52e9e06`.
Report UTC: 2026-11-13T09:49:56.994412+00:00

Implemented actual local PDF/image recognition, editable branching draft API/UI,
visible PDF FreeText/Ink rendering and extraction, offline English OCR, native
vector/raster geometry, explicit draft/model/connection gates, marked-absent
exclusion, exact native PDF NAME and separate TAG/model, lengths/sizes/ports and
local uncertainties. No RF formulas or existing app files changed in this lane.

Verification (all final commands exit 0):
- `node qa/map-import.test.cjs`: **26 assertions**.
- `python3 qa/map-import-browser.test.py`: **48 assertions**, actual synthetic
  marked PDF and raster PNG from file:// with offline context; **0 HTTP(S)
  requests**, no page errors; empty/type/20MiB/malformed PDF/malformed image,
  real nine-page PDF, 20-million-pixel image, and 4001-vector-segment PDF rejection.
- `node --check night-sweep/map-import.js`: exit 0.
- `git diff --cached --check`: exit 0 before commit. Original upstream license
  whitespace is retained with scoped .gitattributes; PDFs marked binary.
- All six manifest byte lengths/SHA-256 values independently rechecked below.
- `git status --short` after commit: empty.

Actual browser: Playwright Chrome for Testing **151.0.7922.34**, executable
`/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`.
The test defaults to installed Playwright Chromium and honors NIGHTSWEEP_CHROMIUM.
The system Chromium rejected file:// through its managed policy; downloaded stock
Playwright Chromium was then actually used without changing system policy.
No physical Android/iPhone or emulator claim. Full combined release gate is the
lead's remaining integration check; this lane did not mutate outputs/dist.

RED evidence: absent importer API assertion; then save/reopen-compatible rN IDs;
then incorrect length-label sharing on one continuous line; then 4001-segment geometry silently truncated rather than rejected. Each failed before
its correction and all final assertions passed. Real browser debugging exposed
Tesseract 7.0.0 object-language initialization failure, short-tag OCR ambiguities,
annotation/symbol topology gaps and cable-label association defects; these were
fixed or explicitly localized as uncertainty rather than reported as passing.
The original no-parser browser check also hit managed-browser file:// blocking;
that environment error was not counted as feature verification.

Tools actually used: local shell/Git/Node/Python/Playwright, Context7 resolves and
queries for PDF.js/Tesseract, exact package source inspection, official npm/GitHub
source/license retrieval, TDD and verification skills. Public packages/docs only
were downloaded. Private map/evidence data was not uploaded or searched remotely.
All committed fixtures are generated synthetic plant; HA0005 was unavailable.

Dependencies: PDF.js 5.4.624 (Apache-2.0); Tesseract.js/core 7.0.0 (Apache-2.0),
English data package 1.0.0 (npm MIT label, actual trained-data upstream Apache-2.0
retained), build-only esbuild 0.25.12 (MIT). Locked tarball integrity, reproducible
bundle script, all native core transitive notices pinned by source commit and
checksum, and six runtime checksums are committed. NOTICE.txt is embedded too.
Heavy scripts execute lazily only on read(). PDF fake worker and embedded scalar
LSTM WASM avoid external file worker paths. Dedicated OCR-worker fetch guard
serves exactly embedded language bytes and rejects every other fetch; window
fetch is unchanged. Source map files are never transferred to dependencies.

Integration: add MAPIMPORTCSS, MAPIMPORT, MAPIMPORTASSETS placeholders/modules as
already coordinated; embed manifest filename→base64 JSON in script#map-import-assets.
Public `NightSweepMapImport.read(file,{onProgress})`, `.buildDraft(document,
{launchId,port,destinationIds})`, `.mount(container,{onDraft,onError})`.
Draft contains rows, launch, source, reviewItems; mount adds originalFile separately.
Existing route IDs/storage/schema preserved. OriginalFile/previews are transient;
UI explicitly instructs retaining original separately, not silently embedding raw
maps into bounded job JSON. No signing/secrets/private configuration touched.

Limits: spatial NAME/TAG/MODEL schedules and printed English labels, not arbitrary
handwritten maps. Raster geometry currently horizontal/vertical colored or dark
strokes; diagonal-only raster paths, complex crossings, rotation, unsupported
PDF codecs and cross-page links can remain unknown. Approximate joins and OCR tag
associations are affected-row review reasons. All imported connections and models
start unconfirmed. Mixed cable transitions retain per-span labels/geometry with
calculation cable unknown. 20MiB, 8-page, 16MP, 2400px recognition edge, 200 candidates,
4000 segment application resource guards. Geometry over the cap is explicitly rejected, never silently truncated. Further capability/limits and original
source URLs: research/next-build/MAP_IMPORT_SOURCES.md. No private field replay.

Runtime assets: 8547259 bytes total.

| Asset | Bytes | SHA-256 |
|---|---:|---|
| NOTICE.txt | 99262 | `14919433b71de237a495978dbc150b52562624dae1afdda164fcc6fe7c8e8d49` |
| pdf.js | 400218 | `e1da62aa893e4a78c291eb6143a792b811c746e61549281b874cd33519b66bfc` |
| pdf-worker.js | 1024153 | `e66c21cd8afdd344a6ce1bd2c1a906769c9c82e80ae0bb84d4a144b909fcfa1d` |
| ocr.js | 62961 | `000c27d9cd0def655f77b36c72a389c0ab13793aa31cb4d7aab56d09c0afbc7e` |
| ocr-worker.js | 4007792 | `01c983e3ab281ce765f96dc3aca485874bf6362a617213b3abfbb06aa781c5d7` |
| eng.traineddata.gz | 2952873 | `45b4cb346724ac1774f1c36f42f182b887bcdb28ebe63e6fff90ac41f3fcff91` |

Follow-up: independent RF checks promoted to
qa/route-rf-independent.test.cjs (58 checks) and
qa/route-rf-independent-ui.test.cjs (17 checks). Both ran against a disposable
combined-source checkout; the UI suite also passed the frozen standalone mode.
Durable review report: research/next-build/ROUTE_RF_INDEPENDENT_REVIEW.md.
Cancellation regression: actual PDF-picker test first failed on an added-points
claim after false callback, then passed after mount honored cancellation. Final
map checks: 26 unit + 51 browser, exit 0, zero HTTP(S) requests.

Context follow-up: optional getContext/matchesContext capture the picker/read
owner, validate it after async recognition and before build/apply, and pass the
captured token to the host. Actual PDF browser regressions cover during-read,
before-apply and picker-open job switches. Final map checks are26unit+60browser,
exit0 with zeroHTTP(S). Independent RF review now approves scoped host changes
through67f25d8 after byte-identical RF helper checks and executed84UIassertions.

Follow-up source commit: `da536cf3cdc1d47780d00079753a9ee5b48ceb82` (clean worktree). Durable independent review: `research/next-build/ROUTE_RF_INDEPENDENT_REVIEW.md`; exact scoped approved Terra head `67f25d82abfeaf8902a7930425436b804d4897a4`.
