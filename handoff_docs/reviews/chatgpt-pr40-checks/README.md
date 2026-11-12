# PR40 raw review evidence

All results are pinned to `1c1e5414a40424d6999fafb105d862a7cf939345`. `manifest.json` records original paths, byte lengths and SHA256 values. Raw scripts/reports are copied unchanged; their recorded absolute paths refer to the review environment. The source and browser reports distinguish root gate results from independently delegated checks.

- `gate/receipt.json`: root's complete eight-command same-head gate. `gate/*.tail.log`: last60 available lines of each actual command log, including empty final porcelain.
- `source/`: original real-handler probes, final reports/results/logs and retained unsuccessful scratch attempts. Their exit1 results intentionally reproduce the required corrections. `source-identity.json` records unchanged math/core source.
- `browser/`: tested offline Chromium script, final109-assertion results/log and provenance. Four real downloads, input fixtures and screenshots remain at the explicitly recorded original scratch paths; they were not silently copied into this evidence bundle. Result JSON preserves the important observed DOM and payload details.
- `root-dedupe.json`: root's separate diagnostic repeat.

To reproduce unchanged scripts, make a detached worktree of the pinned commit at `/workspace/Carpe-Noctum-pr40`, install its locked `qa/runtime` dependencies, and create the scratch output folders used in the scripts. The browser probe expects a copy of that exact committed `outputs/Night_Sweep.html` at `/workspace/scratch/pr40-independent-browser/Night_Sweep.html`. Use an installed Playwright/Chromium. Run the Node/Python commands shown in the copied reports. Inspect pin assertions and isolate browser storage. The scripts do not edit app source; they write scratch evidence. Reusing them on a changed head requires explicitly changing and recording the pin, never relabeling these old results.

This bundle is evidence of defects and head-specific passing checks, not merge approval or a physical-device result.
