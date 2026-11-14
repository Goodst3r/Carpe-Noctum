# Local OCR and raster-line evaluation — November 14, 2026

Recommendation: do not add this Hugging Face model or its runtime to production. On 24 synthetic line crops, the quantized TrOCR candidate preserved 4 exact strings; the existing bundled Tesseract preserved 22. TrOCR changed NAME case, misread units and model text, and generated unrelated receipt phrases on all four dark instrument-display crops. Retain native PDF schedule extraction as the preferred path, preserve OCR as unconfirmed suggestions, and require review of ambiguous tags.

This is research evidence, not a production change or Grok QA implementation. Codex performed local scratch evaluation at the coordinator's request; the coordinator supplied the Astra/high research-routing record. No separate model-picker verification is claimed. Runtime source was pinned to `d5c428a960ef5a2e59c262e8cd1ab58551c17960`. No production files, dependencies, builds, branches, commits or external inference jobs were changed by this evaluation. Only this research report was subsequently written in the repository.

## Candidate and provenance

- Candidate: [Xenova/trocr-small-printed](https://huggingface.co/Xenova/trocr-small-printed/tree/56c1626ea0b4aab378f3228235be2e824d4256bd), revision `56c1626ea0b4aab378f3228235be2e824d4256bd`.
- Base: [microsoft/trocr-small-printed](https://huggingface.co/microsoft/trocr-small-printed/tree/04e994ab854b0089d4929f48c2b4dbe2ce78a340), revision `04e994ab854b0089d4929f48c2b4dbe2ce78a340`. Hugging Face metadata reports 61.4 million parameters. The model card describes SROIE receipt fine-tuning and single-text-line OCR, not full-page layout or cable connectivity recognition.
- Quantized encoder: `onnx/encoder_model_quantized.onnx`, 23,082,940 bytes, SHA-256 `860ea3477531f21904fdc6060872ecc4ea3e51714f3fa6a859f998f35941350b`.
- Quantized merged decoder: `onnx/decoder_model_merged_quantized.onnx`, 40,527,613 bytes, SHA-256 `f05fa0cb7db72c5c751c0d15a2dc53a61a43376b4af3567a85f0ed72280bcc2f`.
- Combined ONNX weights: **63,610,553 bytes**. Downloaded model/tokenizer/config/card files: **69,471,275 bytes (66.25 MiB)**. This is a measured download footprint, not a production bundle measurement. It excludes the additional JavaScript/WASM runtime. No app bundle was built or enlarged.
- Weight licensing is **unverified**: neither retrieved model card declares a `license`, and the retrieved file lists contain no LICENSE file. Do not infer a model-weight license from a framework's or source repository's license.
- Scratch runtime: `@huggingface/transformers` **3.8.1** (Apache-2.0), `onnxruntime-node` / `onnxruntime-common` **1.21.0** (MIT), and `sharp` **0.34.5** (Apache-2.0), running Node **24.22.1** on Linux CPU. Versions/licenses were read from installed package manifests. Quantization `q8`, two intra-op threads, one inter-op thread, `max_new_tokens:64`, local paths and `env.allowRemoteModels=false`.
- Existing app baseline: Tesseract.js/core **7.0.0**, English data **1.0.0**, actual `NightSweepMapImport.read` from the pinned source, PSM **3**. Supplemental comparator: system Tesseract **5.5.0**, PSM **7**.

Metadata was retrieved through the Hugging Face `hub_repo_details` connector and the public model API. Public model files were downloaded with Python into `/tmp`; no input image was uploaded. No paid remote job, cloud inference, private meter image or private plant map was used.

## Synthetic inputs and measured accuracy

Twenty inputs are ten fictional text lines rendered in clean and degraded-scan variants. They cover meter frequency/level units, TAGs `A1` and `ZX9007`, exact NAME punctuation/case, cable description and model/split text. Four additional inputs simulate dark instrument displays with green text, slight rotation and blur. These are generated line crops, not real photos or a representative validation corpus. No training or tuning was performed.

Accuracy is exact output string equality after outer trimming only: case, punctuation and internal spacing count. This strict metric matters for exact NAME/TAG preservation. It is not a claim that every non-exact output lost its numerical reading.

| Input category | Cases | Quantized TrOCR exact | Bundled Tesseract exact | System Tesseract exact |
| --- | ---: | ---: | ---: | ---: |
| meter | 12 | 0 | 12 | 12 |
| tag | 4 | 4 | 2 | 2 |
| name | 4 | 0 | 4 | 2 |
| label | 4 | 0 | 4 | 4 |
| **Total** | **24** | **4 (16.7%)** | **22 (91.7%)** | **20 (83.3%)** |

Examples from the executed run:

| Input | Quantized TrOCR output | Bundled Tesseract output |
| --- | --- | --- |
| `Oak Amp - A` | `OAK AMP - A` | `Oak Amp - A` |
| `GainMaker HGD 42/54` | `GAINMAKER HGR 42/54` | `GainMaker HGD 42/54` |
| `54 MHz 31.0 dBmV` (dark display) | `CHANGE RECEIPT` | `54 MHz 31.0 dBmV` |
| `MER 38.5 dB` (dark display) | `TAX FOR AN OFFER` | `MER 38.5 dB` |

The bundled engine's two failures were `A1` crops. Recognition therefore still cannot establish exact identity automatically, even though this small corpus favored the existing engine.

## Runtime and offline evidence

- TrOCR initialization: **1.132 s**; median warm inference: **314.9 ms/crop**.
- Node process peak RSS: **449,952 KiB (439.4 MiB)**, measured by `process.resourceUsage().maxRSS`. This includes native runtime/process memory, not just model tensors.
- Bundled app median: **865.9 ms/crop**, including each fresh worker initialization, image decoding and the whole importer path. This is **not an equivalent latency benchmark** against warm TrOCR.
- System Tesseract median: **98.6 ms/crop**, including a new CLI process each time.
- Bundled engine executed in local Chromium after loading scratch HTML from loopback; Playwright set the context offline before recognition. Recorded recognition HTTP(S) requests: **0**. The model run disallowed remote model loading and used the downloaded local files; no browser offline compatibility is established for TrOCR.
- Timings come from shared desktop CPU runs and are indicative, not controlled mobile benchmarks. Android WebView, iPhone browser, quantized browser-WASM memory/performance, real photographs, handwriting and field accuracy were not tested.

## Raster lines and topology

A separate local probe called the pinned app's real `rasterSegments` and `geometry` functions with a synthetic 400 × 400 RGBA buffer. No production export was added: the scratch Node VM exposed these functions in memory. The buffer contained one horizontal, one vertical and one diagonal stroke, with a crossing between the orthogonal strokes; no OCR text masks were supplied.

- Expected strokes: `(40,80)→(300,80)`, `(170,30)→(170,220)`, `(40,260)→(250,330)`.
- Extracted strokes: `(39,80)→(301,80)` and `(170,29)→(170,221)`.
- Endpoint-tolerance match (±3 pixels): **2/3**. Horizontal and vertical strokes matched; the diagonal was missed.
- The graph marked `(170,80)` with `crossing:true`. Geometric intersection does not establish an installed connection; this needs user review.

TrOCR emits text strings and supplies no cable-line or connectivity output. No Hugging Face topology model was evaluated. The line probe establishes a specific current diagonal-recognition limitation; it does not establish general map topology accuracy. A useful future line-model comparison needs labeled junction/crossing, symbol and diagonal fixtures plus offline device measurements before any dependency decision.

## Executed commands, fallbacks and scratch evidence

The first scratch npm install attempted an unnecessary CUDA binary download and failed with GitHub `ECONNREFUSED`. Repeating with `ONNXRUNTIME_NODE_INSTALL_CUDA=skip` installed the CPU runtime successfully. Initial Chromium `file://` loading was blocked by administrator policy; the documented alternate Chromium path was absent. Serving the same scratch page over `127.0.0.1` allowed the actual bundled baseline run. No application changes were needed.

```bash
ONNXRUNTIME_NODE_INSTALL_CUDA=skip npm install --prefix /tmp/carpe-hf-ocr-eval --no-audit --no-fund @huggingface/transformers@3.8.1
node /tmp/carpe-hf-ocr-eval/evaluate.mjs
python3 /tmp/carpe-hf-ocr-eval/evaluate-bundled.py
node /tmp/carpe-hf-ocr-eval/line-eval.cjs
```

All final evaluator commands completed successfully. System Tesseract was invoked through a local Python subprocess loop with `tesseract INPUT stdout --psm 7`; all 24 calls exited 0. The last full OCR run used the final 24-file fixture set. Earlier 20-case/intermediate results are superseded by the table above.

Scratch evidence remains local under `/tmp/carpe-hf-ocr-eval/` and is not committed:

- `fixtures/`, `fixtures.json`, `fixture-manifest.json`: synthetic images, expected strings and hashes.
- `trocr-results.json`, `tesseract-bundled-results.json`, `tesseract-system-results.json`: all predictions, exact flags and per-case timing.
- `trocr-run.log`, `tesseract-bundled-run.log`: successful execution logs.
- `line-results.json`, `line-eval.cjs`: exact synthetic segments, crossing output and executable probe.
- `download-manifest.json`: every downloaded model file's byte count and SHA-256.
- `Xenova-trocr-small-printed-metadata.json`, `microsoft-trocr-small-printed-metadata.json`, corresponding `*-README.md`: retrieved model metadata/cards.
- `evaluate.mjs`, `evaluate-bundled.py`, scratch `package-lock.json`: evaluator code and pinned dependency resolution.

This report retains the decision and measured results if ephemeral scratch storage is later discarded. The production dependency decision is **no addition**; license verification, representative field validation and browser/device evidence remain prerequisites to reconsidering it.
