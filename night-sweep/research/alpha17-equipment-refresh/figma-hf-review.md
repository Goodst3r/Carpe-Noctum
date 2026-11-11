# NightSweep 1.7 Alpha — Figma and OCR review

Reviewed November 10, 2026. Scope: read-only Figma inspection and Hugging Face model-card research against the current gain-control selector and three practice jobs. No product code, builds, commits, model dependencies, inference jobs, paid resources, or public photo uploads were performed for this review.

## Figma evidence and current UI

- [Existing editable design](https://www.figma.com/design/C1zOM5qj4LF3YOd5NMCN8G?node-id=4-2406): wrapper `4:2406`, 844 × 1289 logical units.
- [Launch](https://www.figma.com/design/C1zOM5qj4LF3YOd5NMCN8G?node-id=4-2410): `4:2410`, 390 × 1011.
- [Equipment setup](https://www.figma.com/design/C1zOM5qj4LF3YOd5NMCN8G?node-id=4-2572): `4:2572`, 390 × 1139.
- A fresh Plugin API read returned 227 descendants: 73 text layers, 118 frames, four vectors and 32 component instances. The action/input instances measure at least 44 logical units high; the main controls are 48–56. A fresh full-wrapper screenshot was visually inspected. Navy backgrounds, light text, gold selection and blue reference headings remain readable in that rendering. This is design review, not physical-phone accessibility or browser testing.
- No Figma mutation was needed. The existing mock is a baseline concept, **not a representation of the latest release UI**: it does not yet show the new control-method selector or three-job practice launcher. Its generic missing-manual card must not be treated as current manual coverage.

## Focused interface findings

| Existing feature | Review finding / recommendation |
| --- | --- |
| Installed gain control | Current `equipment-setup.js` places the selector before the applicable manuals. Retain that order: station → installed control → documented setup method → exact guide → reviewed steps. Keep the three labels distinct: **OEM GainMaker AGC**, **ACI DSIM**, **Manual / thermal control**. A GainMaker housing alone must not reveal a default AGC procedure. |
| Procedure choice | Keep the unselected method visibly unresolved. A single field for installed hardware and a second field for the applicable procedure is appropriate; neither historical pad values nor a reviewed box should silently select the procedure. |
| DSIM-specific material | Reveal module/revision, pilot and code material only under the ACI DSIM path. The mock's always-visible DSIM card is obsolete for OEM/manual paths. Retain the existing distinction between lookup availability, hardware compatibility, pilot lock and RF acceptance. |
| Manual access | Keep manual title/revision and applicability together. Label manufacturer originals, historical mirrors, datasheets and unavailable exact guides accurately; a prominent external link needs an adjacent connection requirement. |
| Practice launcher | The source now offers three separate examples. Give each choice a short scope description close to its button, so the shared GainMaker housing and 42/54 split do not blur OEM and DSIM exercises. Preserve the current-job retention message immediately above the choices. |

The three practice scopes verified in `training.js` are:

| Practice job | Distinguishing teaching scope |
| --- | --- |
| Complete AOI example | 204/258 MHz; HGD/LE route, power, branched calculations and six synthetic originals; separate AOI equipment setup and XPERTrak return workflow. |
| GainMaker OEM AGC | 42/54 MHz; exact OEM AGC procedure/module/pilot identification; no preselected pilot, no DSIM record, and no supplied meter captures. |
| GainMaker / DSIM | 42/54 MHz; distinct installed DSIM and procedure selection, historical pilot-table lookup, and forward/return sweepless practice; no supplied meter captures or claimed pilot lock. |

All three should retain the synthetic warning after edits and exports. The shared illustrative 14/26 dBmV raw inputs plus 20 dB addback are 34/46 dBmV outputs at 261/993 MHz; that arithmetic does not establish station targets or physical AGC settings.

## Hugging Face options actually inspected

Direct repository metadata succeeded for all four repositories below. Hugging Face `model_search` failed with `MCP tool model_search was not returned by tools/list`; official model pages were read as the fallback. `include_readme=true` returned metadata rather than full cards, so the official pages were also inspected. No installation or inference was performed.

| Option and original model URL | License evidence | Practical fit and limit |
| --- | --- | --- |
| [PP-OCRv5_mobile_rec](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_rec) plus [PP-OCRv5_mobile_det](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det) | Both official HF cards and metadata declare **Apache-2.0**. | Best candidate for a future local OCR feasibility comparison: separate text detection and line recognition. The recognition card reports 0.8753 printed-English exact-line accuracy and 0.8015 average on its benchmark, treating a wrong character/punctuation as a wrong line. Those are **not ONX/photo field accuracy**. The documented pipeline can add orientation/unwarping. The word “mobile” does not prove Android APK or iPhone-browser compatibility. |
| [microsoft/trocr-small-printed](https://huggingface.co/microsoft/trocr-small-printed) | **Not established for the weight distribution in this review.** No license tag appeared in direct metadata or the official HF card; the inspected file list exposed no license file. Do not infer a weights license from the organization or a different model. | 61.4M-parameter single-text-line recognizer, fine-tuned on SROIE. It needs cropped/rectified lines and separate field association. The official repository lists a 246 MB safetensors weight file; this excludes tokenizer/runtime memory. No applicable ONX field benchmark was verified. Not an immediately approved redistribution candidate. |
| [microsoft/Florence-2-base](https://huggingface.co/microsoft/Florence-2-base) | Official HF card and metadata declare **MIT**. | About 0.23B parameters; exposes OCR and OCR-with-region tasks. Useful as a comparison for locating text, but a larger general vision model adds deployment and output-verification work. Its general caption/VQA results do not measure exact RF-number extraction. The published loading example uses `trust_remote_code=True`; any future use needs a pinned, reviewed implementation. |

No candidate has measured NightSweep accuracy, latency, peak RAM, battery impact, APK/browser runtime compatibility or offline packaging evidence from this review. No model is approved or incorporated into NightSweep by this audit.

## Accuracy and privacy limits

For meter photographs, the consequential failure is often a plausible wrong decimal, minus sign, unit, exponent or field association, rather than unreadable text. In particular, SC-QAM level/MER and OFDM PLC/block metrics must stay separate. A future approved evaluation should score exact **field label + numeric value + unit**, not generic OCR confidence, and include glare, perspective, blur, low light, scientific-notation BER and partial screens. An unreadable field must remain missing, never become zero or an invented value.

Local execution could keep image bytes on the technician's device only after the full runtime, model download, telemetry and network behavior are verified. Model licenses and plugin access establish no privacy promise for third-party Spaces or hosted endpoints. The reviewed cards do not establish image retention or confidentiality terms for such services. No user/plant photographs were uploaded to any model, Space or inference provider here.

Retain the original evidence bytes and a technician-reviewed transcription path. OCR output must remain a draft until confirmed against the original and must not alter deterministic RF/power formulas or assert acceptance. The current release's original-file handling and explicit CSV/transcription workflow remain the verified product path.

## Sources and retrieval limitations

- Figma file/node URLs above: fresh read-only Plugin API inventory and screenshot, November 10, 2026.
- Hugging Face direct repository metadata: `PaddlePaddle/PP-OCRv5_mobile_rec`, `PaddlePaddle/PP-OCRv5_mobile_det`, `microsoft/trocr-small-printed`, `microsoft/Florence-2-base`, November 10, 2026.
- Official HF model cards linked in the table: recognition Introduction/accuracy definition; detection Introduction; TrOCR intended uses; Florence model summary, OCR/OCR-with-region and loading example.
- [TrOCR official repository file list](https://huggingface.co/microsoft/trocr-small-printed/tree/main): weight size and license-file visibility. Attempted upstream UniLM license retrieval was blocked; no license conclusion is inferred from that failed retrieval.
