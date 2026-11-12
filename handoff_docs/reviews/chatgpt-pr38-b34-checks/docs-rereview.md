# PR38 b34 documentation and existing-PDF re-review

Pinned before/after: `b34b1db60571e758947ca5b592e14aeaf7f38d73`. Prior correction comparison: `8a6d99b..b34b1db60571e758947ca5b592e14aeaf7f38d73`. Root was running the full gate concurrently; this review performed read-only Git/source/PDF checks and wrote only new scratch evidence. No build, install, checkout, network, tracked edit or PR action.

## Findings and closures

No new documentation finding in the assigned scope. The earlier main-tab sentence and both existing stale-PDF findings are closed by the current bytes:

- Main README at `docs/NightSweep_1.8_Alpha_README.md:12` and identical `night-sweep/README.md:12` now says Home, Plan, Field, Tools, Closeout. Generated main HTML and `dist/guide.html:10` say the same.
- The current Functions guide inventory at Markdown61–65 was compared against an independent fixed map: Home2, Plan10 including Supply PM, Field8, Tools12, Closeout2; Help remains header/Home. All five rows and exact screen order match.
- Actual `pdftotext -layout` output from both committed PDFs has zero matches for old Route/Test/Job/Power arrow paths, the old five-tab sequence, Save named job, Job → Safety, or Safety/construction Study domain. Explicitly historical editions and generic safety prose were not treated as retired UI names.
- Functions PDF now contains Tools → Calculators (p17 l7), Plan → Supply PM (p30 l12), Home → Outage (p34 l30), Closeout → Run sheet (p37 l26), Field → Night log (p40 l52), and the other new paths. New-group arrow occurrences: Home4, Plan16, Field19, Tools23, Closeout3.
- Installation PDF now has Plan → Details and Field → ONX files (p2 l17), Field → ONX files (p4 l19), and Plan → Details → Save now (p4 l23). New-group arrow occurrences: Home3, Plan2, Field3.
- README Markdown copies remain byte-identical. Each of the3 public HTML mirrors equals its docs HTML after only the documented noindex insertion and local href conversion to public guide filenames. No prose is lost in that transformation.

There are still only2 matching current guide PDFs: Functions and Installation. No same-basename main, Equipment Coverage or Training Coverage PDF was added or needed.

## Source/artifact delta review

`git diff --stat 8a6d99b..b34...` reports19 changed paths. Within the assigned guide scope, the source change is the main README tab sentence and its generated HTML; both existing PDFs are regenerated, and SHA256SUMS entries updated. Functions and Installation Markdown/HTML content did not need another source edit for this correction. The other navigation/QA changes belong to parent/root runtime review; this document does not certify them.

PDF receipts (also match SHA256SUMS.txt:64 and67):

| Existing PDF | Bytes | SHA-256 |
| --- | ---: | --- |
| Installation |104832|`7a624c13b5db44162976091627e1efb5a9f238f9ed7fa6d86000d85d658b1c6a`|
| Functions |400780|`b62598e4fa1aec1bb7fab7559228180e5494bf1ff72d50ecafaa77d21c7ac68c`|

## Own commands and results

- Read-only `git rev-parse HEAD`, `git status --porcelain`, `git diff --stat 8a6d99b..b34...`, relevant source diff and file reads: exit0. Beginning/final pin is b34; final tracked status is empty.
- Actual `pdftotext -layout <each of2 PDFs> -`: exit0 for both. Scratch extractions retained as `/workspace/scratch/NightSweep_1.8_Alpha_Functions_README-b34-layout.txt` and `/workspace/scratch/NightSweep_1.8_Alpha_Android_iOS_Installation-b34-layout.txt`. Earlier4ccd extractions/receipts remain.
- `rg` retired-path scan over10 assigned current text artifacts: exit1, zero matches (expected no-match result).
- `python3 /workspace/scratch/pr38-b34-docs-check.py`: final exit0, **27 independent document assertions passed**. These cover the4 main map/mirror checks,10 independent inventory-row checks,10 PDF absence/presence checks and3 exact HTML public-mirror transformations. An earlier version of this scratch checker exited1 because its expected HTML transformation mistakenly replaced a visible filename label as well as the href; the real build rewrites href only. The scratch expectation was corrected and the complete27 checks rerun. This was a diagnostic-script error, not a production mismatch.
- Final separate read-only check compared all12 assigned source/artifact files with `git show HEAD:<path>`: **12/12 byte-identical**, exit0. Pin unchanged and tracked status empty.

No full-gate, browser, emulator, physical-device or field claim is made by this re-review. Root owns the full exact-head gate.
