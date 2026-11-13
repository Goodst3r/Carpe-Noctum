# Local map import — source and capability notes

2026-11-13. Synthetic software verification, not HA0005 field acceptance.

The feature uses Mozilla PDF.js 5.4.624, Tesseract.js 7.0.0 with its 7.0.0
scalar LSTM core, and `@tesseract.js-data/eng` 1.0.0's English
`4.0.0_best_int/eng.traineddata.gz`. The scalar core intentionally avoids SIMD
requirements and contains its WASM bytes. It trades some speed for one portable,
fully embedded worker. No model account, API key, telemetry, CDN, or runtime
cloud recognition is used. Recognition starts only when a local file is chosen.

## Dependency provenance and reproduction

- Mozilla distribution: https://www.npmjs.com/package/pdfjs-dist/v/5.4.624
  and https://github.com/mozilla/pdf.js (Apache-2.0).
- Tesseract browser/worker: https://www.npmjs.com/package/tesseract.js/v/7.0.0
  and https://github.com/naptha/tesseract.js/tree/v7.0.0 (Apache-2.0).
- Embedded OCR core: https://www.npmjs.com/package/tesseract.js-core/v/7.0.0
  and https://github.com/naptha/tesseract.js-core (Apache-2.0).
- English data: https://www.npmjs.com/package/@tesseract.js-data/eng/v/1.0.0
  and https://github.com/naptha/tessdata/tree/gh-pages. The npm package declares
  MIT; its upstream trained-data repository supplies Apache-2.0. The actual
  upstream Apache license is retained with the bundled data; no assumption that
  the npm label replaces the trained-data license is made.
- Build-only esbuild 0.25.12: https://www.npmjs.com/package/esbuild/v/0.25.12
  (MIT). It converts the pinned PDF.js ES modules to classic IIFEs. It is not
  loaded by the app.

`night-sweep/vendor/map/package-lock.json` records exact tarballs and integrity
values. Run `npm ci --prefix night-sweep/vendor/map --no-audit --no-fund`, then
`node night-sweep/vendor/map/rebuild.cjs`. The resulting `manifest.json` lists
all runtime filenames, byte counts, and SHA-256 hashes. Full PDF.js, Tesseract,
core, trained-data and bundled transitive-license notices are adjacent. The
build helper verifies the manifest before embedding filename-to-base64 JSON in
`map-import-assets`. Do not commit installed node_modules.

Context7 resolve/query tools were actually used for `/mozilla/pdfjs-dist` and
`/naptha/tesseract.js/v7.0.0`: local ArrayBuffer loading, annotations, page
rendering, operator paths, offline worker/core/language options. Exact installed
package sources were also read. They exposed a Tesseract 7.0.0 object-language
initialization defect (`initialize` uses `l.data` as a language name). This
feature uses the normal `'eng'` API instead. A fetch shim confined to its own
OCR worker returns the bundled language bytes for one exact blob identifier
and rejects all other fetches. It does not change `window.fetch` or patch vendor
code. PDF.js uses its local fake worker, disables evaluation, XFA and external
WASM loading, and receives file bytes directly. Native PDF links/actions are
never inserted into the DOM or executed.

## What is implemented and exercised

- Actual local PDF parsing, native positioned text, vector paths, visible
  FreeText/Ink annotations, rendering with annotations enabled, and local OCR
  of the rendered page. The viewer preview is the annotated original render.
- Actual PNG/JPEG/WebP decoding and local English printed-text OCR. Dark and
  colored horizontal/vertical cable strokes are extracted from raster pixels.
- A spatial NAME / TAG / MODEL schedule is associated with diagram tags.
  Native PDF NAME values are retained verbatim. OCR NAME values are copied
  verbatim from recognition and carry an explicit local review reason; OCR is
  not claimed to reproduce arbitrary punctuation or identifiers perfectly.
- Launch node/active, output-port entry and destination selection produce a
  branching draft. Cable lengths, sizes, explicit P3 construction, active-model
  text, passive port labels, geometry and per-span evidence are retained.
  Mixed cable sizes/constructions leave the calculation cable blank and retain
  their individual evidence. Unknown LE control variants have no guessed ID.
- Marked absent equipment is excluded. Proposed equipment remains proposed and
  cannot be selected as launch. Passive launch is rejected. Row IDs retain the
  existing `r<number>` format. TAG and installed model are independent of NAME.
- All imported links remain unconfirmed; model confirmation remains false.
  Crossings, approximate endpoint joins, uncertain OCR tag associations,
  missing geometry, cable construction and models receive affected-row reasons.
  Numeric passive port labels are retained but are not silently translated to
  catalog through/coupled loss paths. Route review must choose the actual port.

`qa/map-import-browser.test.py` uses real file:// HTML in Playwright Chromium,
sets the context offline before recognition, checks both committed synthetic
PDF and raster files, and records zero HTTP(S) requests. The raster fixture has
a blue branch and a visible red absent annotation. Tests do not provide OCR
words, mocked PDF objects, or private maps. The geometry unit test also checks
separate length labels on one continuous cable line.

## Bounds and limits

20 MiB per input, 8 PDF pages, 16 million decoded/rendered pixels per page,
2400 pixels maximum recognition edge, 200 schedule candidates, and 4000
line segments (exceeding this cap rejects the map; geometry is never silently truncated) are application resource guards, not RF rules.
Unsupported types, empty/oversized inputs and decoder failures produce explicit
errors. A missing schedule returns recognized text and page previews with a
specific message rather than inventing a route. Connections across pages remain
unconfirmed. Dense crossings, rotated schedules, handwriting, diagonal-only
raster routes, tiny text after scaling, unusual symbols/fonts, and unsupported
embedded PDF codecs are not claimed as generally solved. A geometric draft is
an interpretation for review, never proof of installed connectivity.

The original File and annotated previews remain in memory during this import.
The returned draft includes the original File separately from route JSON; no
base64 map is silently added to the existing bounded job/backup schema. The
route UI must state that the original needs to be retained separately. This
module never changes existing original attachments, storage keys or jobs.

The bundled assets total roughly 8.4 MB, about 11.3 MB after base64 embedding.
Both standalone Android input and PWA carry the same bytes and need no network
permission or external worker path. Actual Android WebView/iPhone device
performance, picker lifecycle and memory behavior remain physical-device checks.
The private HA0005 file was not available; no field replay is claimed.

## Job context during local import

The host may pass `getContext` and optional `matchesContext(captured, current)`
to `mount`. The default comparison is strict identity. The importer captures
the context at the file-picker click, falling back to file-change/read start;
it checks before reading, after the asynchronous decoder, before building and
before calling `onDraft(draft, capturedContext)`. A stale context clears the draft
and asks the user to read the map again for the current job. The host must also
reject stale callback context before replacing any route. An explicit false
callback result is cancellation, never an added-points success message. Real
PDF-picker tests cover cancellation, job changes during recognition, job changes
before applying, and job changes while the picker is open.
