# Field storage verification implementation plan

> **For agentic workers:** Apply debugging, focused regression tests and independent final review. Continue within the authorized iteration.

**Goal:** Close the documented evidence-storage and corrupt/full named-job verification gaps from build 21 without changing RF behavior.

**Architecture:** Retain browser-local named snapshots and IndexedDB originals. Test failure boundaries through existing jsdom/fake-indexeddb tooling; change production code only for reproduced defects.

**Tech Stack:** Standalone JavaScript, localStorage, IndexedDB, Node, jsdom 26.1, fake-indexeddb 6.2.4, Python build scripts.

**Spec:** Build-21 project status, project automatic plugin instructions and existing storage contracts in `night-sweep/README.md`.

## Global constraints

- Preserve canonical source commit a625de75a812592d4766f6475f143cd72c2d1bee and 1.7 Alpha functionality.
- No user job deletion, private-photo upload, hardware configuration, added service or framework migration.
- Keep 54/860 MHz design references, 38 dBmV return TX and the split-specific workflows unchanged.
- Use synthetic data for tests. Do not treat photo readings or checklist completion as RF acceptance.
- Current published APK is build 21; this iteration is a source candidate until matching release artifacts are built and authorized for publication.

## Review focus

- Blocked database requests that later succeed: no leaked connections or poisoned retry cache.
- Failed/aborted writes: no falsely attached originals or success notice.
- Corrupt saved snapshots: no silent overwrite or loss of readable source data.
- Exactly 1,000 named jobs: opening/updating existing work remains possible; adding fails safely.
- Evidence cleanup: corrupt saved-job references stop deletion conservatively.

## Tasks

- [x] Inspect and reproduce IndexedDB failure boundaries; add `qa/evidence-storage-failures.test.cjs` and minimal fixes in `night-sweep/evidence-ui.js` if demonstrated.
- [x] Inspect and reproduce corrupt/full named-job behavior; add focused QA and minimal fixes in `night-sweep/jobs.js` if demonstrated.
- [x] Add both suites to `qa/run-pwa.py`, regenerate app and docs, run the complete frozen-build suite.
- [x] Inspect rendered app using managed preview where available; record actual browser/device limits.
- [x] Obtain independent review, preserve source candidate and update current project status with evidence and remaining release steps.

## Decisions and evidence

- User steering added training repair: Vecima/AOI use 204/258; all other active families use 42/54 in this deployment. This changes practice defaults/guidance, not manufacturer ratings or saved field jobs.
- First integrated frozen build passed 840 checks in 41 suites. Independent review then reproduced additional hidden Records controls and incompatible guidance on older retained practice copies; these require regressions and a final rerun before release.
- Reproduced evidence leak and cleanup data loss now have failing-to-passing regressions; independent storage review also exercised retry before abandoned-open success.

- Source repository recovered using Sites helper; HEAD matches the current project status exactly. Supplied 0.1 sources are historical.
- Context7/MDN confirms IndexedDB transaction `complete`, rather than request success, is the commit boundary. Existing production writes already use that boundary; tests will check failure paths.
- Photo review found duplicate QAM views and distinct SC-QAM/OFDM metrics. Private evidence stays outside public artifacts.
- Existing live preview was occupied; stopped/restarted the managed preview for the recovered checkout.

- Final frozen verification: 846 checks / 41 suites passed; APK build22 succeeded with same certificate and matching tested HTML. GitHub-driven abnormal-close regression also failed before and passed after repair.
- Browser: all four examples opened; complete204 and GS7K42 confirmed, References controls visible. Existing-tab update reload was blocked by automatic review; a separate tab supplied a safe UI verification. Physical devices remain untested.
