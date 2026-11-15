# Rebuild tool checks

Checked 2026-11-15 for the fresh calculator rebuild. These are capability checks, not application acceptance tests. No private files were uploaded and no remote compute job was started.

## Local software

| Capability | Result | What it establishes |
|---|---|---|
| Node package `playwright` | Available at `node_modules/playwright/index.js` | Local Playwright package is installed. |
| Python Playwright | Import succeeded | Python browser automation package is installed. |
| Chromium | `/usr/bin/chromium`, version `156.0.8078.79` | Browser binary is installed. |
| Playwright launch | Launched `/usr/bin/chromium` headlessly and closed it successfully | The local Python Playwright-to-Chromium connection works; no app page was exercised. |
| Android SDK / adb | This agent shell initially found no `adb`, `sdkmanager`, or `gradle` executable or standard SDK directory. Root later reported a separately provisioned SDK and a successful unsigned Java compile of an initial code 29 snapshot. | Initial shell probe did not locate the external SDK. The reported compile applies to its initial source snapshot, not the final browser-tested artifact; final native compile/device verification remains separate. |

## Connected read-only checks

| Tool | Result | What it establishes / limits |
|---|---|---|
| Hugging Face model search (`PaddleOCR`, `MLSD line segment detection`) | Both calls returned MCP `UNAVAILABLE`: `model_search was not returned by tools/list`. | No model metadata was retrieved. This does not establish whether either model is suitable for offline OCR or line detection. No HF job was created. |
| Wolfram Language evaluator | Succeeded on synthetic arithmetic: `{11.4+20, 23.3+20, 31-11.4, 43-23.3}` returned `{31.4, 43.3, 19.6, 19.7}`. | Confirms the arithmetic expression evaluates as expected. It does not validate product code, field targets, carrier assumptions, or source provenance. |
| Octen web search | Succeeded; surfaced Cisco’s original GS7000 SHO iNode Installation and Operation Guide (`https://cisco.com/c/en/us/td/docs/video/access_edge/Nodes/GS7000/b_gs7000_sho_inode_install_operate_guide.pdf`) and related Cisco manuals. | Identifies manufacturer-hosted references for follow-up. Search excerpts alone do not validate any particular setup instruction or model behavior. |
| Firecrawl web search | Initial domain-constrained search returned no results and used 0 credits. A broader retry found two Vecima pages for ERM322/324 and a product brief; the retry reported 2 credits used. Root's later attempt at additional public source cross-checking was blocked by a free-tier rate limit; no account/login was requested. | Confirms a Vecima-hosted RPD module page/brief exists, not GS7000 RF configuration or a specific app claim. No private file upload or remote job was run. |
| Figma `whoami` | Succeeded; authenticated account has a Starter team plan and view seat; Code Layers enabled. | Establishes account/design capability only. No design file was opened or changed, so this is not UI review or verification. |

## GitHub read-only snapshot

Remote: `origin` → `https://github.com/Goodst3r/Carpe-Noctum.git`. Current local branch: `codex/fresh-calculator-rebuild` at `e136aba`, tracking `origin/codex/next-build-candidate` at `22e43d1`; local branch is one commit ahead. `git status` also reports untracked `tests/`, which is outside this document task and was left untouched.

Relevant existing open PRs were queried with `gh` on 2026-11-15. The PR heads and deletion criteria are recorded in [cleanup-inventory.json](cleanup-inventory.json). PRs 1 and 2 are separately open on `main` and are explicitly excluded from the build3 supersession cleanup candidate set. No remote refs, PRs, or files were modified.

## Availability summary

## Fresh browser run

Root built the frozen fresh PWA (`2e697b9ca1866fd701c3`, app version `2.0 Alpha build 5`); `npm run test:browser` ran `tests/browser.cjs` against that output on 2026-11-15 using installed Playwright and `/usr/bin/chromium`. All 33 browser assertions passed:

- Tools calculator numeric result and split-gated blank route creation.
- Manual station and edge creation using physical output port `1`; station settings were opened and configured through the condensed UI.
- Synthetic ONX ZIP import through confirmation, then corrected GS7K node port 1 samples (31.4 dBmV at 57 MHz; 43.3 dBmV at 753 MHz) feeding an HGD-42 on split 1.2 GHz / pilot 753. Main targets were 31.4 / 43.3 dBmV and auxiliary targets 27.9 / 39.8 dBmV. Recommended EQ part 4007239 and AGC pad 9.5 dB were visible. The target graph showed one selected physical-port trace. Route, station, and measurement survived save and reopen.
- Synthetic one-page PDF read/confirmation/render; HGD was manually confirmed on the same page at the original A1 symbol, tombstone dragged and saved, and downloaded export parsed by both embedded PDFLib UMD writer and PDF.js. Export contained exactly one HGD tombstone at the moved position and retained its source measurements.
- No retired navigation and no document horizontal overflow at 360, 768, or 1280 CSS pixels.
- Service worker ready, app reload while offline, uncached request failure, and a newly saved job retained through offline reload.
- No uncaught browser page errors.

Screenshot: `artifacts/browser.png` (ignored local artifact). Browser teardown emits page-close/disconnect events after successful assertions. This covers the built Chromium PWA path only; it is not iOS Safari, Android WebView/device, accessibility, field, signing, or release acceptance.

Local browser automation is available. The connected OCR model metadata lookup was unavailable, so do not infer a model choice from this check. Manufacturer references and synthetic arithmetic are research aids only; application-specific acceptance beyond the listed browser flows remains pending.

## Optional on-device AI browser run

`node tests/browser-ai.cjs` ran in headless Chromium against the built PWA on 2026-11-15. All 13 checks passed. The test opened Tools' optional image panel, installed the bundled PP-OCRv6 Tiny pack, and used its isolated same-origin worker for actual inference on a locally generated synthetic PNG containing large `CARPE` and `57 MHz` labels. OCR output contained both labels and text proposals were flagged `reviewRequired`; no route or station state was created. Installation and inference issued no external network requests. After service-worker readiness, the test reloaded with browser network disabled, confirmed the locally cached pack remained available, ran OCR successfully again, and confirmed an uncached request failed. No page errors occurred.

The network log observed the worker, worker engine, and all three bundled model files requested from the same origin. The runtime WASM and module files were fetched separately from same-origin paths and returned successfully; the OCR run itself did not request those URLs, so this test does not claim they were used by the exercised inference path. This is Chromium synthetic-image verification only, not field-document accuracy, device performance, handwriting, or RF interpretation validation.

## Integration-owner follow-up

- Context7 resolved and retrieved esbuild0.25.12 single-IIFE bundling documentation. The map owner retrieved PDF-lib geometry documentation.
- Hugging Face `hub_repo_details` succeeded for PaddlePaddle/PP-OCRv5_mobile_det_onnx and PaddlePaddle/en_PP-OCRv5_mobile_rec_onnx; both report Apache2.0. This metadata check establishes neither accuracy nor runtime support. Model search failure above remains historical evidence. No new Paddle model is bundled without demonstrated benefit.
- Parallel cross-source EQ search returned its free-tier rate limit. No account/credit purchase was attempted. Original manufacturer PDFs, supplied documents, Firecrawl and direct local table checks supplied the source evidence instead.
- The original Android SDK35 platform/build-tools and ECJ were downloaded with the repository's pinned hashes into an external scratch toolchain. Java21 and a real unsigned Preview compilation succeeded. Final frozen artifact results are recorded separately in VERIFICATION.md. No key was generated or exposed.
