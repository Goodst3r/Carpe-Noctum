# A2 ordinary CI-only base integration

Starting head `30014ce3a1387594776f8a227dee1e8a28c16a3e` on `codex/night-log`; ending merge head **`3af0134ec4f53dfae57a0c0b93aa153630d307a6`**.
Second parent is reviewed build3 `14bfc06ff62e000dc624e46d57cf8d4beda98ce0` (tree identical to reviewed CI head `e77ef24affc9c4a6cf5281a93d2bd4551eccfdb8`).

Only added paths: `.github/workflows/gate.yml` and `qa/ci_layout_diagnose.py`.
Every one of the 574 preexisting tracked file hashes and staged blob/mode entries stayed exact; both incoming files match reviewed build3. This includes application JS/CSS, registered QA/runner, all guides/reference files and generated HTML/PWA bytes. Final 576 tracked files, branch, HEAD parents, index/HEAD equality and clean status were checked directly. No generated conflict or rebuild occurred.

Exact mutation command: `git merge --no-ff --no-edit 14bfc06ff62e000dc624e46d57cf8d4beda98ce0 -m Integrate reviewed CI gate into codex/night-log`. Verification used live remote base check, `git merge-base --is-ancestor`, `git diff --name-only`, `git ls-files --stage`, direct SHA256 comparison of every tracked file and `git diff --exit-code` / `git diff --cached --exit-code` / clean porcelain status. No app code, QA logic, guide, status or metadata was authored.

The preceding feature gate remains attributed to source `cd79a84630ec7fec9f997f9631b5fb5b4a35a287`: 70 suites / 1,444 checks; separate layout374 / smoke340. Those are earlier Lane A results, not this worker's new execution. **No full gate, focused test or build was run at this new merge head.** The incoming CI files were independently reviewed and gated separately. Lane B must independently review and freshly gate the published final head before merging this Lane A PR; Lane A cannot self-merge.

No push, APK/signing, emulator, physical device/Safari/WebView, private-file access, external source upload, dependency change or field verification. Tools used: local Git/Python/SHA256, authenticated read-only Git remote checks and verification-before-completion skill guidance. No auth configuration changed and no credentials were printed.

Machine proof: `/tmp/carpe-a2-ci-only-integration.json`; SHA256 `89919135c9b04b906f4b4f62472095119e3f532ef74f6a610d522aac6efef53c`. Completed 2026-11-11T21:12:16.488632+00:00.
