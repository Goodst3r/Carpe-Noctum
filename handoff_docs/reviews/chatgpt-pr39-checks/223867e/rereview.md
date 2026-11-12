# PR39 changed-head re-review —223867e3

**CHANGES NEEDED on `223867e3d495a1375c4374c4ba4b008c0ef29112`.** This ordinary NAV integration does not fix the previously reviewed calculator-context or source-metadata findings. Root repinned the worktree before this read-only task. No app edit, build, install, checkout, commit, network request or PR action was performed here.

## Scope and source/artifact identity

This follow-up runs only checks affected by the new NAV/generated artifact head. The prior1,246 numeric/refusal comparisons and824 broad UI checks remain historical results on59ddf48; they were **not rerun or relabeled as fresh**. No full reviewer gate was run for this stateless calculator re-review.

Six identity checks passed, exit0:

- Whole `night-sweep/field-calcs.js` is byte-identical between59ddf48986f9498b574fc1cb67081f3eb0df7dee and223867e3. SHA256`b82225fcb528a0ca7830fc9822aa83c375ce99843e259f83956db1b22bd24fa8`.
- The actual `const FieldCalc=...` calculator prefix, ending immediately before `const FieldCalcs=`, is byte-identical in source across both heads. SHA256`4ed91c7457b5da9de2f5c32addebc18a7c1ea5b5fd2e8c3acbdab93547ee0e27`.
- Both rebuilt standalone and PWA contain exactly that same actual prefix, identical to their59 embedded prefixes and to current source (four separate assertions).

This establishes unchanged numerical implementation with rebuilt surrounding navigation; it does not manufacture a new numerical execution count. Source/current embedded prefixes were read directly, not reconstructed from formulas.

## Fresh unchanged context regression

Command:

```sh
node /workspace/scratch/pr39-math/check_real_guards.cjs /workspace/Carpe-Noctum-pr39 /workspace/scratch/pr39-223-recheck
```

Observed **exit1,18passed/21failed/39 cases**, zero runtime errors. These are the same unchanged13 raw contexts through actual source/standalone/PWA functions, freshly executed on223867e3. Exact current pin before/after; ending `git status --porcelain` empty. Raw results `/workspace/scratch/pr39-223-recheck/guard-results.json`; complete output `guard-regression.log`.

The same seven wrong acceptances per artifact remain:

- Recognized declared matched50/50,0/0,NaN/NaN andunknown/unknown source/load values pass while the calculation still uses75ohm.
- Explicit `NF_ref_K:'300'` passes while the model remains fixed at290K.
- Explicit thermal `correlation:'common_ingress'` passes even though the model requires independent noise.
- Thermal+optional-optical `kinds:['CNR','MER']` also passes. This uses the actual shared kinds field and remains the separately documented cross-operation domain-stress observation; primary impedance/reference/correlation findings do not depend on it.

The six controls per artifact still pass: ordinary fixed75 C1; declared75number/string; equal75.0 declarations; explicitload50 refusal; source75/load50 refusal; NFref290. Thus the result is not an indiscriminate calculator failure. Actual-source lines remain the same: `cascadeGuards()`223–235 checks only equality for the explicit source/load pair at228–230 and omitsNF_ref_K; metric/correlation checks remain restricted to `combineCnr()`239–241. No numerical result should be emitted for a declared contradictory fixed-model context. No editable temperature/impedance/ingress/MER feature is requested.

## Fresh actual source-sheet metadata

Command:

```sh
node /workspace/scratch/pr39-223-recheck/check_changed_artifacts.cjs
```

Final observed exit0 (six identity assertions plus diagnostic capture). It loaded both new built artifacts in JSDOM, used the actual `Thresholds.rows`/`Thresholds.open('calc.cascade.cnr')`, and captured the real generated source-sheet DOM. This is fresh source-sheet content evidence, **not** a repeat of the former four-width rendered browser audit or a passing product-metadata regression.

Both rebuilt artifacts still expose exactly these cascade rows:

| Actual row ID | Actual label |
| --- | --- |
| `calc.cascade.cnr` |Expert |
| `calc.cascade.minContributions` |Unknown |
| `calc.cascade.safeCount` |Unknown |

The actual formula sheet still reports **Units: dB**, even though its noise-floor result has unitsdBmV. No`dBmV` appears in that sheet, and exactk`1.380649e-23 J/K` is absent. No actual Spec row with the exactk value or290K reference value exists. The source does mention SI k/290K/Expert75ohm in prose; it does not expose the exact labelled constant/convention required by the written check. The actual `Used by` text is correctly updated to **Tools → Calculators: thermal CNR**; that navigation correction does not remedy the numeric-constant/source-unit finding. This confirms that root's earlier Medium metadata finding remains on the new head; the Expert model label itself is appropriate and is not being replaced by a Spec model claim.

Raw source rows, complete actual sheet text, per-field details and SHA256s are retained in`changed-artifacts.json`; readable output in`changed-artifacts-final.log`.

## Command/setup limits

The first identity helper attempted `git show` of the large historical standalone with Node's default exec output buffer. It exited1 with`ENOBUFS` before completing the metadata/identity receipt; raw`changed-artifacts.log` is retained. Increasing only the scratch subprocess capture buffer to16MiB made the same read complete. No app/source/oracle/test assertion/tolerance changed. The complete final identity/metadata run exited0 and left the app clean.

No new numeric1246/UI824/full-gate count is claimed. Author101/2728/current hosted readiness belongs to the author/root metadata check, not this execution. No fresh primary-source retrieval, phone, emulator, native WebView/Safari, meter, field, APK or signing check was run. Root owns the required committed math-review update and current-head CHANGES NEEDED comment. A green author/hosted gate does not close a still-failing independent guard regression.
