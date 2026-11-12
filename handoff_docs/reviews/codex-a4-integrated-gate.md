# A4 integrated gate verification

State: **passed**. Expected frozen head `2043d62fb3b472a1773d06d3fdc6353abf2db6f6`.
Prepared: 2026-11-11T18:46:56.617636+00:00. Updated: 2026-11-11T18:58:48.234325+00:00.
Started: 2026-11-11T18:46:56.624113+00:00. Finished: 2026-11-11T18:57:49.190442+00:00.

Standalone SHA-256: `6610884a1b4e5a94c4453cef41ee719b86cbeb2e4342fbfbdf1bb41765912adc`.
PWA index SHA-256: `c5bec837cf815846803c0f903683a92b9e7461f6b0f24b861285bb12541bd94f`.

| Executed command | Actual checks | Actual suites | Exit | Seconds |
| --- | ---: | ---: | ---: | ---: |
| `full-gate` | 1548 | 71 | 0 | 452.103 |
| `layout` | 255 | — | 0 | 9.832 |
| `smoke` | 337 | — | 0 | 15.175 |

No counts are inferred from earlier runs. The full gate uses `NIGHTSWEEP_SUITE_TIMEOUT=3600`, `/usr/bin/chromium`, and no evidence-write/source-test override. Separate existing build3 layout and browser smoke follow the gate.

Proof captures every tracked path and index entry, all authored/source files and generated files, HEAD/tree, raw index bytes and staged-entry hash, clean status, main README equality, package manifests and tracked/installed lockfiles before and after each command. Required staged content and clean state must match. Raw index stat-cache bytes are recorded separately and are not claimed byte-identical. It does not restore changed files.

Proof: `/tmp/carpe-a4-integrated-proof.json`. Command logs: `/tmp/carpe-a4-integrated-logs`.
Desktop Chromium and synthetic software verification only. No physical phone, Safari/WebView, emulator, meter or field result; no APK, signing, publishing or push.

Initial wrapper stop: the full gate passed, then the raw index SHA changed during the wrapper’s git diff --quiet check. An isolated index-copy reproduction confirmed cached ctime/stat refresh with identical staged entries. Root authorized continuation without repeating the passing full gate. Raw mismatch and diagnostic are retained in the proof. Semantic index entries and tree are unchanged; raw index bytes are not claimed identical.

Final independent proof: all 584 tracked file hashes, 561 authored/source hashes and 23 generated file hashes match the pre-run snapshot. HEAD and tree are exact; all 584 staged entries and their SHA-256 match; working tree/index are clean. Main README copies remain byte-identical; all package/lock file records match. Verified 2026-11-11T18:58:48.223494+00:00.

Raw index cache SHA-256 before: `38b34e2633c114544d5c2b65b9708eb60f2d124a87b269a0672ae02c44951a6c`; final: `7858456ff725e4bf3d245dfdb45ca98e35927ea2ae4444eb56b122c815ee1cf6`. This raw difference is retained and explained by `/tmp/carpe-a4-integrated-index-diagnostic.json`; semantic staged index content is unchanged.
