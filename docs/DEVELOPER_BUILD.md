# Fresh developer build

Read ../AGENTS.md and rebuild/SPEC.md. Run npm ci, npm test, npm run build and npm run test:browser and npm run test:ai-browser. The build bundles app/main.mjs as a single offline script and embeds checksum-verified local PDF/OCR assets. outputs/Night_Sweep.html and dist/ are generated, never hand-edited.

For Android, set CARPE_ANDROID_TOOLCHAIN to the external SDK folder with build-tools/android-15, platform/android-35/android.jar and ecj.jar. Ensure Java is on PATH. Run android-build/build.py with the frozen standalone and --preview --unsigned for compile-only evidence; actual release requires the original signer, expected HTML digest and matching certificate. Do not commit tools, keys or private inputs.

Optional image tools are built separately under artifacts/ai and copied to dist/ai. Tiny OCR downloads during the build unless a verified CARPE_AI_MODEL_DIR cache is supplied. Use the same cache to include complete optional packs in a native APK. .npmrc disables dependency lifecycle scripts: this is a browser-only runtime, and the native Node ONNX installer is unnecessary.

For portable browser checks, install the pinned Playwright browser (`npx playwright install chromium`) or set PLAYWRIGHT_CHROMIUM to the available Chromium executable. Native helper tests additionally need ECJ (`CARPE_ECJ`) and Java (`JAVA`, `JAVA_HOME` or PATH); missing prerequisites are reported as skips, separately from opt-in private PDFs/model weights. Always report the counts in your own environment.
