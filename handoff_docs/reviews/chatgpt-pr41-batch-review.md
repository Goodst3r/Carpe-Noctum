CHANGES NEEDED — independent diff and targeted review of head `a1b2af6bc1c1876f0e3ebf35491ccf618ddbfc99`.

**Medium — `night-sweep/workflow.js:174` (with lines 177–181): Station context combines two different stations.** I independently reproduced the existing finding with synthetic data in the actual built app: Installed station = `Launch node · Cisco GS7000 / GS7K 1 GHz (1002 MHz)`, strip point = `SYNTHETIC route active A1`, strip plane = `Plane: SYNTHETIC launch output`. The plane was entered on the launch worksheet. `chosen()` uses WorkflowUI's separate route selection, while `StationView.currentStage(state)` uses Station's selected target. This can attribute a launch station's measurement plane to a different active. Use the current Station target for the Station strip identity and cover launch/active/stage switches without introducing stored selection or measurement changes. This remains unresolved on this exact head.

Own verification in detached `/workspace/review41`, all commands below exit 0:

- `npm ci --prefix qa/runtime --no-audit --no-fund` — 40 packages.
- `node qa/build3-context-strip.test.cjs` — 14 checks.
- `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-context-strip-layout.test.py` — 20 rendered checks.
- `python3 /tmp/review41-targeted.py` — 24 independent rendered checks at 320/375/390/430 px in night palette: long synthetic job/point names fit, invalid plant remains Unknown, navigation preserves exact serialized state and localStorage, print hides and screen restores the strip. Inspected the 320 px screenshot.
- `node /tmp/review41-mismatch.cjs` — 2 diagnostic assertions reproducing the Station identity mismatch above; a successful diagnostic is evidence of the defect, not a product pass.
- `git diff --check` — clean; `git status --porcelain` — empty.

Hosted `QA gate` is SUCCESS on the exact head (run 43242961646). Source review found no new storage key, job field, formula or version change; plant labels remain separate; training and generated outputs include the feature. The new suites pass because they do not compare the Station target with the strip point.

One initial independent browser probe using file:// failed with `ERR_BLOCKED_BY_ADMINISTRATOR` (exit 1); the corrected localhost HTTP probe above completed successfully. Initial `gh pr view --comments` hit a deprecated Projects GraphQL field; comments were read through `gh api` instead. Tools used: git/gh source and CI inspection, locked npm dependencies, JSDOM, Playwright/Chromium; verification skill used as workflow guidance. No full gate, merge, phone, emulator, Safari/WebView, field, APK or signing test performed.

CHANGES NEEDED — `a1b2af6bc1c1876f0e3ebf35491ccf618ddbfc99`.
