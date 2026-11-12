# A3 ordinary CI-only base integration

Starting head `ea2e5deb6a458173bb23058b895542ed0450c73b` on `codex/sweep-due`; ending merge head **`9b40ea0a6ee2d85eef7791feb9ad0cd0ccced7c3`**.
Second parent is reviewed build3 `14bfc06ff62e000dc624e46d57cf8d4beda98ce0` (tree identical to reviewed CI head `e77ef24affc9c4a6cf5281a93d2bd4551eccfdb8`).

Only added paths: `.github/workflows/gate.yml` and `qa/ci_layout_diagnose.py`.
Every one of the 559 preexisting tracked file hashes and staged blob/mode entries stayed exact; both incoming files match reviewed build3. This includes application JS/CSS, registered QA/runner, all guides/reference files and generated HTML/PWA bytes. Final 561 tracked files, branch, HEAD parents, index/HEAD equality and clean status were checked directly. No generated conflict or rebuild occurred.

Exact mutation command: `git merge --no-ff --no-edit 14bfc06ff62e000dc624e46d57cf8d4beda98ce0 -m Integrate reviewed CI gate into codex/sweep-due`. Verification used live remote base check, `git merge-base --is-ancestor`, `git diff --name-only`, `git ls-files --stage`, direct SHA256 comparison of every tracked file and `git diff --exit-code` / `git diff --cached --exit-code` / clean porcelain status. No app code, QA logic, guide, status or metadata was authored.

The preceding feature gate remains attributed to source `52fac6902d2f2872ec28ca42115589df814cf5a3`: 70 suites / 1,482 checks; separate layout374 / smoke340. Those are earlier Lane A results, not this worker's new execution. **No full gate, focused test or build was run at this new merge head.** The incoming CI files were independently reviewed and gated separately. Lane B must independently review and freshly gate the published final head before merging this Lane A PR; Lane A cannot self-merge.

No push, APK/signing, emulator, physical device/Safari/WebView, private-file access, external source upload, dependency change or field verification. Tools used: local Git/Python/SHA256, authenticated read-only Git remote checks and verification-before-completion skill guidance. No auth configuration changed and no credentials were printed.

Machine proof: `/tmp/carpe-a3-ci-only-integration.json`; SHA256 `da1505c5c84ac9a4b793eca13658816fecee2b975e806a59b845291cd53c3432`. Completed 2026-11-11T21:12:17.134461+00:00.
