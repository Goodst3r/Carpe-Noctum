# PR11 upload-policy successor — independent scoped review

November11,2026. **Current same-head local gate and technical verdict: PASS with one recorded Minor disclosure limitation.** Exacte77ef24affc9c4a6cf5281a93d2bd4551eccfdb8 passed **68/68suites,1,328checks (459.2s), plus separate374layout/337smoke**; all549tracked hashes and semantic/freshness/clean guards matched. Root accepted the explicit-warning omission as a recorded limitation and requires honest optional-artifact disclosure in PR/status. Hosted successor remains queued, with no concluded result. Earlier preparation/START checkpoints below are preserved chronologically; the final section is current.

## Exact identity and scope

- PR11 `claude/b2-ci` into `build3`; exact published/API head **e77ef24affc9c4a6cf5281a93d2bd4551eccfdb8**.
- Previous reviewed head **0e17d9097ddf1e8b40475f7eea74768d74e3c256**; its completed local68/1328+374/337 receipt is retained, historical for this successor.
- Current build3/merge-base **5588a49b10292bed422b7597ec227bce38173a2d** remains ancestor.
- Separate detached worktree `/workspace/carpe-pr11-upload`; previous review tree/artifacts untouched.
- Delta0e→e77 is exactly five added lines in `.github/workflows/gate.yml`: three explanatory comments, upload-step `continue-on-error: true`, upload-step `timeout-minutes: 5`. No other changed path. Exact unchanged app SHA256 **e960c2a7be00aa7f4dc2ffdf0f674e54c4f4b617d9dcc128e1ab831ae79c4add**.
- Full own-item difference from current build3 remains workflow plus diagnostic helper only;549tracked files.

Read the full new workflow, exact commit rationale, current PR body/timeline through GitHub, both latest available statuses, applicable plan/rules and existing scoped source/diagnostic report. Instruction files/plan have no delta from already read0e. Root explicitly held broad execution until this scoped report is read. No source/author branch/GitHub write, dependency installation/removal, private-file access or child agent.

## Rationale and failure boundaries

The author's commit says hosted run3 passed build/generated check/automated suites/layout/smoke/clean, while only run-record delivery failed after roughly ten minutes. Independent prior GitHub step observations support those step outcomes, but upload's actual cause remains **unknown**: plugin log retrieval timed out and direct CLI log fetch returned HTTP502. No quota, billing, network or provider-caching cause is inferred. The commit intentionally changes artifact delivery policy, rather than claiming it repaired an identified upload implementation defect.

A run record is supplemental to the project gate: the project requires actual tests and unchanged/clean source/build; it does not require a successful artifact download as an acceptance criterion. Restricting best-effort behavior to record delivery is therefore technically reasonable, subject to accurately disclosing delivery failure.

Fresh YAML assertions confirm `continue-on-error` exists only on the pre-existing failure diagnostic and the upload step. It is absent from the job, builds, committed-output check, full runner, rendered suites and clean-tree check. Their commands/conditions are byte-identical to0e and still exit hard on failure. Upload retains `if: always()`, explicit QA artifact paths,14day retention, official v4 action and read-only Contents permission. Its five-minute timeout is below the unchanged60minute job limit and cannot widen runtime. A prior failing test remains a failure; a failing optional upload alone can leave the gate green.

Official GitHub documentation actually obtained through Context7 confirms step-level continue-on-error changes **that step's conclusion**, with outcome failure/conclusion success, and prevents that failure from failing the job; this is different from job-level continue-on-error. It does not retroactively change prior hard-failure step results. This is source/documentation validation, not a simulated hosted scheduler or an independently executed upload-failure experiment.

## Minor — missing-record disclosure is not explicit in the run

Location `.github/workflows/gate.yml:86`–102.

The three new comments are source-only. The step has no id/outcome follow-up and no explicit `::warning::`/job-summary notice that the artifact is unavailable. Furthermore, pre-existing `if-no-files-found: ignore` explicitly suppresses the action's warning for an empty file match, as confirmed in its actual v4 docs. Upload service errors can still appear in action logs, but continue-on-error converts their step conclusion to success; the green job alone no longer promises a downloadable record.

Proportional improvement: name the upload step, emit an always-evaluated warning/summary when its outcome is not success, and use `if-no-files-found: warn` if missing local records should also be visible. Keep those notices non-blocking and keep real build/test/dirty checks hard-failing. This is a **Minor transparency finding**, not an assertion that an RF test could pass falsely. No author-source edit was made by this reviewer. Parent decides whether to request it before gate/merge.

The PR body also remains stale: one new file/no Actions run does not describe this two-file branch with real hosted observations. Refresh final PR description/status accurately, preserving the unknown upload cause and optional-record policy.

## Own fresh executed checks

- `/tmp/carpe-actionlint-runtime/actionlint -no-color .github/workflows/gate.yml` — exit0, no diagnostics.
- Python/PyYAML BaseLoader **23 structural/policy checks passed**, including all20current core conditions and three new assertions: only optional diagnostic/upload may continue, upload timeout5, no job-level continue. Full record `/tmp/carpe-pr11-upload-static.json`.
- All **8 shell run blocks passed actual bash-n parsing**. No command changed from0e.
- `git diff --exit-code 0e17d909 HEAD -- night-sweep qa outputs dist docs research release android-build` — exit0; five-line workflow-only delta independently inspected.
- New full-gate wrapper AST parsed/compiled for the exact detached worktree, unique upload prefix, empty branch name and unchanged frozen app hash. **Not started.** No prior report namespace overwritten.
- `git status --short` clean and all549initial tracked hashes captured in `/tmp/carpe-pr11-upload-initial-manifest.json`.

The production diagnostic itself is unchanged from0e; the earlier5viewport observations/4injected overflow groups remain attributed to that prior head and were not rerun or counted anew. No new math/job-format/storage/package/version/app change.

## Documentation actually consulted

Context7 resolved GitHub Actions to `/websites/github_en_actions` and Upload Artifact to `/actions/upload-artifact/v4` (actual v4, matching workflow). Queried own-step continue/outcome/conclusion semantics and missing-artifact warnings. Returned official sources:

- https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepscontinue-on-error
- https://github.com/actions/upload-artifact/blob/v4/README.md (if-no-files-found warn/error/ignore)

Queries contained only generic public API concepts, no repository/user/private material. Superpowers verification guidance and local Git/Python/Node/Playwright setup are unchanged; no new package installed.

## Hosted successor observation

One read-only GitHub `fetch_commit_workflow_runs` for exacte77 returned **run43097593412, QA gate number4, queued, nullconclusion**. No run was triggered/rerun by this reviewer; no completed hosted success, failure or new hosted test counts are claimed. Original run3 observation/unknown upload cause remains in `/tmp/carpe-pr11-current-review.md` and `/tmp/carpe-pr11-hosted-observations.json`.

## Prepared next gate — root START required

`/tmp/carpe-pr11-upload-gate-run.py --expected-head e77ef24affc9c4a6cf5281a93d2bd4551eccfdb8 --start` is prepared, **not executed**. Root must read this report and explicitly authorize START. Distinct output prefix `/tmp/carpe-pr11-upload-{gate.json,proof.json,gate.md,layout.json,smoke.json}`, unique stage logs and done marker; collision refuses overwrite. It runs both builders, then the runner with3600second per-suite limit/no outer timeout, then separate layout/smoke. Reuses locked40QA packages without installation. Strict tracked/source/generated, semantic staged/tree, README/lock/deps, clean-status and report-freshness checks; raw Git stat-cache bytes diagnostic only, no restores.

No new same-head full-runner/whole-layout/smoke result, emulator, physical device/Safari/WebView, RF equipment/field or APK/signing/deploy verification. Parent owns final severity/merge eligibility, explicit gate start, exact-head upstream review and author communication. No private source/evidence was accessed.

## Root adjudication and START

Root read this full report and exact source delta, accepted the missing explicit warning as a recorded Minor limitation rather than a mandatory source fix, and required final PR/status disclosure that artifact delivery is best effort and a green test gate does not guarantee a download. No upload cause was inferred. Root explicitly authorized a new same-head gate after A2's prior gate completed.

At START the detached local head and live remote branch both matched e77ef24affc9c4a6cf5281a93d2bd4551eccfdb8 and worktree was clean. Detached PID126755 runs `/tmp/carpe-pr11-upload-gate-run.py` with3600second per-suite limit/no outer timeout; unique upload report namespace. Full result remains pending at this checkpoint. No source/private/GitHub write or host rerun.

## Final own same-head gate — current result

Root explicitly authorized the sole broad slot after reading the scoped source/report and accepted the Minor warning omission with final metadata disclosure. Run began2026-11-11T20:56:12.433504Z and finished21:04:19.501557Z at exacte77ef24affc9c4a6cf5281a93d2bd4551eccfdb8. All five commands exit0/pass:

| Actual command | Own result |
| --- | --- |
| `python3 night-sweep/build.py` | exit0,0.165s; committed bytes reproduced |
| `python3 build-pwa.py` | exit0,0.093s; committed bytes reproduced |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_SUITE_TIMEOUT=3600 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/run-pwa.py` | **68/68suites,1,328checks,459.2s suite time**, exit0 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py` | **374 separate rendered checks**,11.246s,exit0 |
| `GIT_OPTIONAL_LOCKS=0 NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py` | **337 separate rendered checks**,15.163s,exit0; page_errors empty |

No outer timeout;3600seconds per-suite limit. Existing40lock-matching QA dependency versions reused/unchanged; no install, restore or source edit. All549tracked/526source/23generated hashes, semantic staged entries/digest, HEAD/tree8f1248efa3fc27a253ae7e236035db00223e3717, README/lock hashes unchanged and clean. Raw Git index stat-cache bytes changed (four captured fingerprints), explicitly diagnostic rather than byte-identity claim. Each raw report has a current-stage timestamp/completion, byte-equal source copy, counts matching actual suite/log sums and pinned standalone hash. Post-run independent direct rehash matched all549files and clean status; all raw/proof assertions passed.

Full command report `/tmp/carpe-pr11-upload-gate.md`; complete proof `/tmp/carpe-pr11-upload-proof.json`; raw gate/layout/smoke JSON under the same prefix. RunIDa2886cdd-3b88-4cb5-8bdf-e9efb5c2cce7. StandaloneSHA256e960c2a7be00aa7f4dc2ffdf0f674e54c4f4b617d9dcc128e1ab831ae79c4add; PWA index463a1fc85844bb743f78159f9306c1d6885f4b523f0e61e1fd06763e9d99e8e0; contentversionfbd9c6126b4024308562, unchanged app/version. These are this successor's actual own counts, not copied from0e's previous68/1328run.

## Final remote/hosted observation and limits

At local completion, one fresh read-only GitHub workflow query still returned new run43097593412, number4, **queued/nullconclusion**. No repeated poll loop or trigger/rerun. No current hosted pass/fail or artifact delivery is claimed. Original run3's upload cause remains unknown, and the new workflow deliberately makes record delivery optional; it must be described as best effort, with a green job not guaranteeing a downloadable record. Minor explicit-warning improvement remains recorded above.

The post-run `git ls-remote` check failed with exit128, “could not read Username for https://github.com: No such device or address.” That was a remote credential-prompt failure after the passing gate, not a local source/test failure. No credential/configuration was changed. A separate fresh GitHub plugin PR metadata read confirmed exactheade77ef24affc9c4a6cf5281a93d2bd4551eccfdb8, base5588a49b10292bed422b7597ec227bce38173a2d, open/mergeabletrue. Local and remote heads had matched via Git at START. Root must still perform its final exact-head guarded upstream decision.

**No Important own-item source finding or local gate failure remains.** Root accepted the optional-artifact policy and owns final review/merge eligibility; this report does not claim the hosted run concluded. No GitHub/source/author-branch/settings write, dependency installation/removal, private evidence, emulator/physical phone/Safari/WebView, RF hardware/field, APK/signing or deployment by this reviewer. The full gate slot is released after complete proof capture.
