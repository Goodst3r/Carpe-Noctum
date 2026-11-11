# Independent review of the corrected complete workflow

November 11, 2026. The corrected complete exercise passes this source and focused-runtime review. No unresolved material product finding remains within this scope. This report supersedes the complete-exercise description in the earlier [independent-review.md](independent-review.md); the prior Android and imported-ID findings retain their separate scope.

Application or documentation source was not edited by this reviewer. A private source-assembled jsdom probe executed 16 grouped checks, all passing with exit 0. Its current output is retained in [complete-workflow-review-checks.log](complete-workflow-review-checks.log). The root agent owns the frozen generated-app suite, real-browser checks, exports and packaging.

## Finding addressed during review

**P3 — Resetting the inactive 1200 profile retained inputs from the previous complete exercise.** At the first correction review, `training.js:206` used `Object.assign(oldProfile, defaultProfile)`. Fields absent from the default object survived, including the former 1794 MHz equipment rating, 34/46 dBmV launch entries and comparison/injection criteria. The selected `1002` profile was already correct, but selecting the other profile exposed unrelated old exercise inputs.

This was reported directly to the training and root agents. The training agent replaced the inherited profiles with `source.project.profiles=projectDefaults().profiles` before populating the selected corrected profile. This reviewer independently compared every nonselected profile against a fresh `projectDefaults()` result after the fix: exact equality passed. The earlier inputs no longer survive as hidden prior-exercise criteria. The selected profile and numeric route results were unaffected by this repair.

One user-visible note read `exercise.40 dBmV`; the agent added the missing space. The revised guide and fixture notes were inspected for readable model, frequency, level and bandwidth descriptions.

## Verified corrected configuration

| Item | Observed corrected behavior |
| --- | --- |
| Source | Conventional `gs7000-12g`, band `0`: 42 MHz return / 54 MHz forward; hardware ceiling 1218 MHz; entered operating upper 1000 MHz. |
| Both route actives | Rows `r1` and `r3` select `active_gm_gan_hgd`. Both are GaN HGD stations; A2 is not an LE. |
| Passive mix | Scientific-Atlanta `SAT MM 4-23`, ATX GigaXtend `XSC-2-959` / `GTSG-TAP-4-20-STD`, and Technetix `OTTZ-4-17`. Main and branch feeds use actual catalog ports, including plural `high-loss-outputs`. Route-distance validation reports no disconnected feeds. |
| Design and spectrum | Selected `1002` profile is a container with entered equipment/planned limits **1000 MHz** and live spectrum **860 MHz**. Scientific-Atlanta reference curves stop at 1000 MHz; GaN supports 54–1002 MHz; node hardware capability does not imply complete-path coverage. |
| Launch and frequency | 11/23 dBmV synthetic test-point entries plus one 20 dB correction yield **31 dBmV at 54 MHz / 43 dBmV at 860 MHz**. Current route, frequency-checker, references, meter and record inputs use the corrected markers. Every modeled RF output is finite at both exercise markers. |
| Sweep workflow | Selected **42 MHz** workflow uses forward and Return Sweepless Sweep. **38 dBmV return TX** remains a separate operator reference requiring transmitter/plane confirmation; the illustrative generator and receiver records are explicitly separate. |
| Power | GS7K 0.75 A and both GaN 0.60/0.45 A loads are explicit synthetic entered currents. The GaN preset is manual-only; no withdrawn or substitute manufacturer current curve is used. The separate power plan produces a usable planning solution. |
| Drop | 75 ft synthetic RG-6 at 1.8 dB/100 ft gives 1.35 dB cable loss at 54 MHz, followed by an explicit **custom 4 dB** drop-path loss. It does not invent an OEM splitter or add another manufacturer to the requested passive mix. |
| Records | Forward/return rows remain Planning and criteria remain unapproved. Synthetic data never becomes field acceptance through loading the example. |

The active corrected fixture and all complete guide steps were scanned for stale EN9000/Quantum, 261/993 MHz and high-split exercise data. None remained as an unqualified complete-workflow setting. The only AOI references in complete guidance are an explicit prohibition against substituting its physical alignment procedure and a clearly separated pointer to the independent six-active exercise. Generic unused profile templates remain the application's fresh defaults, rather than retained example-specific AOI criteria.

## Manuals, originals and compatibility

The actual source-assembled interface was opened through the guide. Source equipment opens the conventional 1.2 GHz GS7K material. Both GaN stations display the exact-installed-manual gap and leave their controller selection unrecorded; neither receives a substituted Quantum18, conventional GainMaker or DSIM commissioning sequence. Existing source/provenance qualifications remain explicit. No exact GaN commissioning manual was fabricated or newly authenticated by this review.

All six new complete originals were exported and checked against their metadata size and SHA-256. Sweep CSVs cover 54–860 MHz; ingress CSVs remain within 5–42 MHz; OneCheck examples use 54/60/66/860 MHz. The SVG names GaN HGD A2 and retains the correct 295 − 25 = 270 ft cable-side TDR illustration. Decoded original text contains no stale AOI/Vecima, 261/993 MHz or LE A2 fixture labels. These are synthetic interchange files and an original-only practice diagram, not native meter captures.

Both historical complete forms were independently imported: `qa/fixtures/training-complete-legacy17.json` and `release/NightSweep_1.7_Alpha_Training_Job.json`. Their node records, route IDs/devices/parents, stored reviewed steps and original hashes were preserved. The incompatible complete guide was hidden and an explanatory notice displayed. Original IDs may legitimately change during import isolation; preservation means the corresponding original bytes and hashes survive.

Before correction, this reviewer captured the complete normalized states produced by `makeDeepState()` and `makeCustomState()`. After correction, both factory results were exactly equal to those snapshots. The separate six-serial-AOI 204/258 MHz route and custom table/reverse-TDR semantics therefore remained unchanged. The new complete revision guard does not silently rewrite older saved exercises.

## Evidence and limits

The independent probe checked source identity/bands, both GaN selections, passive families/feeds, corrected markers/levels/limits, fresh inactive profiles, stale-data absence, synthetic power, all marker RF outputs, six original hashes/text, actual manual cards, two legacy imports, unchanged deep/custom factories and absence of simulated DOM exceptions: **16/16 passed**. Source `night-sweep/training.js` SHA-256 at review: `0e87d5cd71b2071c2cf148c229451b058738c8053b8547b6a602f79db5805638`.

The separate math agent's [complete-workflow-audit.md](complete-workflow-audit.md) records the independently evaluated Wolfram cases and current application comparisons. This reviewer inspected that evidence but did not claim to rerun the external evaluator. The root's final generated-app/browser/package records must be read separately; older whole-release counts are not fresh correction verification.

Tools used here: local source/catalog/manual comparison, a source-assembled jsdom/fake-indexeddb application, SHA-256/original-byte checks and pre/post factory-state comparison, following the previously loaded review and verification guidance. No physical Android/iPhone, Safari/Home Screen, native picker/share/print, actual SDK/signing, plant test or new manufacturer-manual retrieval was performed by this reviewer.
