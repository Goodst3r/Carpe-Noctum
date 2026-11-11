# NightSweep 1.8 Alpha — completed audit

The supplied Build 22 handoff was reviewed and updated locally on November 11, 2026. The existing offline app, local jobs, legacy imports and evidence originals are preserved. No public deployment or upstream change was made.

## Delivered changes

- Organized Home into a grouped Practice library: seven loadable exercises and 37 feature entries covering all 20 task screens. Each feature entry loads seeded data and reveals its intended control.
- Added a genuine six-serial-active Vecima/AOI route, custom launch/cable/passive tables with reverse TDR, and a separate GainMaker manual/thermal exercise. Corrected the complete field workflow to GS7K and two GainMaker GaN HGD actives with Scientific Atlanta, GigaXtend and Technetix passives on 42/54 MHz. The six-active AOI exercise remains separate on 204/258 MHz. Older saved complete jobs retain their data and originals with incompatible guidance hidden.
- Fixed Records falsely accepting contradictory equipment/design/live limits and overlapping passbands; unsafe imported IDs producing invalid or duplicate rows; unknown practice IDs loading a mismatched guide; and rejected/partially published Android candidates leaving inconsistent APK/receipt sets.
- Recomputed the complete example and its synthetic meter originals at 54/860 MHz, with 31/43 dBmV launch and a separate 38 dBmV return TX reference. Its synthetic power answers are **2.047 A / 13.65% / 88.83 V**; trial **2.798 A / 18.65% / 87.37 V**. Updated current Markdown/HTML guides, project map, release notes, Android readiness and build instructions. Exact GaN commissioning procedures and manufacturer loads remain unverified; the exercise uses explicitly entered synthetic values.

## Executed verification

| Verification | Current result |
| --- | --- |
| Unmodified isolated 1.7 baseline | 846 checks, 41 suites, all passed |
| Frozen 1.8 full QA | **921 checks, 48 suites, all passed**; generated build unchanged |
| Real rendered Chromium | **316 checks passed**, 360/390/768/1280 px; all seven exercises and 37 visible feature targets |
| Backup/offline | Seven real export/import round trips; six bundled originals retained on offline reload; new offline tab and seven guide pages served by the worker |
| Independent arithmetic | Ten original Wolfram reference cases plus the corrected complete workflow: 17 grouped checks / 82 numerical comparisons, including baseline/trial power and all route outputs |
| Catalog data | 1,324 curves / 14,126 numeric rows checked for identity, ordering, finite values, bounds and declared gap behavior |
| Android build orchestration | 14 grouped mocked-SDK checks, including rejected candidates, receipt-copy failure, promotion rollback and separate Preview preservation |
| Source/document checks | 24 authored JavaScript files parse; current Markdown copies match; guide IDs/internal links and package boundaries pass |
| Independent review | No unresolved material finding in reviewed scope; separate correction review passed 16 checks, including old complete backups and unchanged AOI/custom examples |

The 921-check QA total includes the 14 mocked Android checks and grouped data checks. Chromium's 316 checks are separate. Catalog row/probe counts are data coverage, not additional test-case counts.

## Use and packages

Open `outputs/Night_Sweep.html` for the standalone app. Home → Practice library loads the examples, including **Six active devices in series**. Expand **Load an example for any feature** for the 37-entry index. Portable examples are `release/NightSweep_1.8_*.json`; use Files → Open project to load them. Training preserves the prior working copy locally; export an external backup for important work.

The technician package contains the runnable HTML, current guides and seven examples. The PWA archive contains only generated public assets. The Codex handoff contains source, tests, current results, tool/audit evidence and clearly labelled historical Build 22 artifacts; installed dependencies, private signing keys and build caches are excluded. Per-file and artifact checksums accompany the archives.

## Tools and remaining limits

The available plugins and skills were inspected before changes. Actual useful tool calls used Cloud Environment, GitHub discovery, Context7, Wolfram, Firecrawl and the existing Figma reference. Data-quality and Superpowers skills guided executed local analysis and independent reviews. See `TOOLS_AND_LIMITS.md`, `plugin-inventory.json`, the numerical/reliability audits and retained tool responses for exact evidence. Unrelated account integrations were not invoked.

**No new signed 1.8 APK was built:** the handoff excludes its private signing key. Android source is prepared as version code 23; the historical Build 22 APK remains 1.7. Chromium mobile emulation is not physical Android/iPhone/Safari/WebView verification. Native picker/share/printing, physical update/job retention, true device storage eviction/quota and phone cold starts remain device checks. Installed equipment, firmware, measurement planes and documented manufacturer-manual gaps still need field confirmation. No inherited manufacturer table is certified by this audit.

## Frozen application identity

- PWA release: `9f1f3278a467e0bacc54`
- Standalone SHA-256: `7d52800252e38f4e689b77ef84f4b38e8f0f1fdf1970ca54f2ac708e10e100e2`
- PWA HTML SHA-256: `b1f408ece26a92e7fbd9684f386d86b38ea734ce9165a9ce1987aca291e0e5e0`

Exact machine-readable receipt: `release/alpha18/validation.json`. Full results: `qa/pwa-test-results.json` and `research/alpha18/browser/results.json`.

Correction evidence: `complete-workflow-audit.md`, `complete-workflow-review.md`, `complete-workflow-application.json` and `other-examples-preservation.json`.
