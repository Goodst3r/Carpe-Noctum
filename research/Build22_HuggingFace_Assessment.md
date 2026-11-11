# Build 22 — bounded Hugging Face OCR assessment

Checked: November 10, 2026, America/Chicago (November 11 UTC). Scope: public documentation and model metadata only. No field photograph, private identifier, inference request, model download, compute job, dependency change, or OCR implementation was sent to Hugging Face.

## Decision

Keep Build 22's evidence-first capture and technician confirmation. A local OCR experiment is plausible as a later, separately scoped feature, but these sources do not establish accurate extraction from ONX screens, acceptable phone performance, an offline package, or redistribution permission for the selected weights.

## Actual plugin results

| Invocation | Observed output |
| --- | --- |
| Hugging Face `hub_repo_details`, `Xenova/trocr-small-printed`, model | Succeeded: `image-to-text`, `transformers.js`, ONNX, vision-encoder-decoder; linked Microsoft base model; updated 2024-10-08. |
| Hugging Face `hub_repo_details`, `microsoft/trocr-small-printed`, model | Succeeded: Microsoft author; `image-to-text`; Transformers; vision-encoder-decoder; **61.4M parameters**; updated 2024-05-27. |
| Hugging Face `hf_doc_search` | Failed: `McpServerError: MCP tool hf_doc_search was not returned by tools/list`; structured error code `UNAVAILABLE`. |
| Hugging Face `hf_doc_fetch` for local-model and index documentation | Both failed: `McpServerError: MCP tool hf_doc_fetch was not returned by tools/list`; structured error code `UNAVAILABLE`. |

Fallback: native web retrieval successfully opened the official index, versioned environment API, model cards, and ONNX file listing below. The attempted unversioned `/en/guides/local-models` URL was inaccessible through that tool; versioned environment API supplied the required local-loading evidence.

## Public source findings

1. [Transformers.js official introduction](https://huggingface.co/docs/transformers.js/en/index): browser execution uses ONNX Runtime; CPU/WASM is the default and WebGPU is optional. Quantization can reduce resource requirements. The fetched main-version page points ordinary npm users to stable **v3.8.1**. This is research, not a dependency/version recommendation for NightSweep.

2. [Transformers.js v3.8.1 environment API](https://huggingface.co/docs/transformers.js/v3.8.1/en/api/env): `allowRemoteModels` defaults true, while browser `allowLocalModels` defaults false; local model path and browser-cache controls exist. Offline operation therefore needs intentional asset packaging/configuration and tests after a clean install and cache eviction. Browser support for local execution alone does not prove offline readiness.

3. [Microsoft TrOCR model card](https://huggingface.co/microsoft/trocr-small-printed): the printed-text model was fine-tuned on SROIE and is intended for **single text-line images**. A full tilted ONX screen with many tiles, a graph, reflections, and table rows is outside that simple input shape. It would need crop/line selection and field association before trusting any numeric output. No ONX-specific accuracy evidence was found in this card.

4. [Xenova conversion card](https://huggingface.co/Xenova/trocr-small-printed): ONNX conversion of the Microsoft weights, advertised for Transformers.js `image-to-text`. This is a candidate to evaluate, not a verified NightSweep integration.

5. [ONNX file listing](https://huggingface.co/Xenova/trocr-small-printed/tree/main/onnx): displayed files include `encoder_model_quantized.onnx` **23.1 MB** and `decoder_model_merged_quantized.onnx` **40.5 MB**. These are individual weight-file sizes, not the final download, APK increase, runtime memory, or the exact set a pinned library would load. The listing includes alternative variants; its **826 MB** folder total must not be reported as the required application payload.

License: the fetched model cards and plugin metadata did **not** establish an explicit model-weight license. Treat redistribution licensing as unresolved; do not infer it from the library's license, Microsoft authorship, or public availability.

## NightSweep acceptance criteria for any later experiment

- Draft suggestions remain unconfirmed until the technician checks the image. Preserve the original, crop, extracted text, units, source frequency/channel, and edits. Missing/unreadable remains unknown rather than zero.
- Evaluate exact numeric-and-unit matches on locally held, labeled representative cases: decimal points, negative echo signs, `1.0e-8`, MHz, dBmV versus dB, ns, percentages, PLC versus average, and SC-QAM versus OFDM. General text readability is insufficient.
- Measure rejected/ambiguous fields and silent false accepts, especially glare, perspective, small fonts, duplicate photographs, and absent table rows. No benchmark or OCR inference was executed during this assessment.
- Pin model/library revisions, verify required assets and hashes, resolve weight licensing, test memory/latency on Android WebView, Android browser, and iPhone browser, and confirm CPU fallback behavior. Desktop documentation does not establish any of those device results.
- Exercise first launch offline, later offline launch, cleared storage, interrupted asset loading, and failed OCR. Manual entry, calculations, saved work, and existing import/export must remain usable.

## Verification boundary

This note records tool-backed public research only. It does not claim OCR accuracy, a model license approval, phone/emulator testing, an installed OCR runtime, a passing application test, or a release build. No application files were changed by this research task.
