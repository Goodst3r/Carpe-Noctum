# Tools and setup

Updated November 11, 2026 by Lane B (task B3). How to get a machine ready to build and test Carpe Noctum, which tools a session may find, and what the repo's environment variables do. Commands come from `docs/DEVELOPER_BUILD.md` and `android-build/README.md`; the environment details below were checked in a Linux cloud container (4 CPUs, 15 GB, Python 3.13, Node 22) and are marked "not checked" where they were not.

## What you need

| Need | For | Notes |
| --- | --- | --- |
| Python 3 | builds, rendered suites, the gate runner | Standard library only for the builds. |
| Node.js (22 was used) | automated suites | `qa/runtime/package-lock.json` pins `jsdom ^26.1.0` and `fake-indexeddb 6.2.4`. |
| Python `playwright` package | `qa/build3-layout.test.py`, `qa/browser-smoke.py`, `qa/build2-layout.test.py` | **Not installed by default.** `python3 -m pip install playwright`. Without it those suites fail with `ModuleNotFoundError`, including one inside `qa/run-pwa.py`. |
| A Chromium | the same rendered suites | In the cloud container: `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`. Set `NIGHTSWEEP_CHROMIUM` to its path, or let Playwright use its own after `python3 -m playwright install chromium` (not checked here). |
| Java 21, Android SDK Platform 35 r2, Build-Tools 35.0.0, Eclipse compiler 3.40.0, the original signing key | building and signing an APK | **Not needed for `build3` work.** Nobody builds or signs an APK during the build 3 marathon; the owner does that off-repo. See `android-build/README.md`. |

## Commands

```sh
npm ci --prefix qa/runtime --no-audit --no-fund    # once per checkout
python3 night-sweep/build.py                        # writes outputs/Night_Sweep.html
python3 build-pwa.py                                # writes dist/
python3 qa/run-pwa.py                               # all automated suites; writes qa/pwa-test-results.json
python3 qa/build3-layout.test.py                    # rendered Chromium, 320 to 1280 px, both palettes, print
python3 qa/browser-smoke.py                         # rendered Chromium smoke, offline contexts
```

Reference timings from one run on 4 CPUs: the automated gate about 6 minutes, the layout suite about 9 seconds, the smoke suite about 19 seconds. A machine about 50 times slower needs far longer; see `NIGHTSWEEP_SUITE_TIMEOUT` below and run the gate in the background.

Preview the built PWA: `python3 release/preview.py --port 4173` serves `dist/` with no caching. Rebuild guides with `node docs/render_readme.cjs` and the filename pairs in `docs/DEVELOPER_BUILD.md`, then rebuild the PWA (guide bytes are part of its cache hashes).

After a change to `outputs/Night_Sweep.html` or `dist/`, rebuild with the two build commands and commit the result. Never hand-merge those files.

## Environment variables

| Variable | Effect | Since |
| --- | --- | --- |
| `NIGHTSWEEP_CHROMIUM` | Path of the Chromium executable for the rendered suites. | build 2 |
| `NIGHTSWEEP_RELEASE_TEST` | Set to `1` by the runner: suites test the frozen `outputs/Night_Sweep.html` instead of re-assembling the source. | build 2 |
| `NIGHTSWEEP_TRAINING_SOURCE_TEST`, `NIGHTSWEEP_BUILD2_SOURCE_TEST` | Development switches used by specific training and migration suites (source candidate instead of the committed practice backups). Leave them unset for the gate. | build 2 |
| `NIGHTSWEEP_SUITE_TIMEOUT` | Seconds each suite may run, default 150. An invalid value stops the runner with exit code 2. | task B1 (when merged) |
| `NIGHTSWEEP_WRITE_EVIDENCE` | `1` lets the suites rewrite the tracked evidence files under `release/`, `research/` and `night-sweep/research/`. By default they write to the untracked `qa/evidence-out/`, so a gate run leaves `git status` clean. | task B1 (when merged) |

## Keeping the working tree clean

Until task B1 is merged, some suites rewrite tracked evidence files with new timings and IDs on every run (8 files from the automated gate and 12 from the browser smoke, 19 distinct, counted on the build3 head). Do not commit that: `git checkout -- release research` before committing. After B1, a clean `git status` after a full gate is part of the definition of done. Test results and logs (`qa/*results.json`, `qa/pwa-testlogs/`) are already git-ignored.

## Tools a session may have

This is what a Claude Code cloud session had; Codex or ChatGPT sessions differ. The plugin policy (`NightSweep_Automatic_Plugin_Instructions.txt`) says to use relevant connected tools automatically and report what was actually used, so check your own tool list rather than this one.

| Tool | Use here | Caveat |
| --- | --- | --- |
| GitHub (MCP tools) | branches, pull requests, reviews, merges | No `gh` CLI for writes. The session's access was limited to `Goodst3r/Carpe-Noctum`. Pushing a workflow file under `.github/workflows/` worked. |
| Shell, Git, Node, Python, local Chromium via Playwright | builds, all tests, rendered checks | The only way to run the app. A tool opinion or mockup is not a test. |
| Firecrawl (search, scrape, PDF parsing) | manufacturer documents and standards | Credits ran out once during the build 3 research; unverified items are marked "not re-verified". Not re-checked in the session that wrote this file. |
| Context7, Exa and other web search/fetch | library documentation, discovery | Context7 is not an authority on HFC specifications. Different search engines repeating one source are not independent corroboration. |
| Wolfram, Figma, Notion | named in the plugin policy | Not present in the session that wrote this file. Independent math checks were done with Python decimal arithmetic and a LibreOffice-recalculated spreadsheet instead; see `research/build3/field-calcs-reference.py` and `alignment-spreadsheet.py`. |

Every new formula still needs a worked reference computed outside the app and a regression test against the app's real output (`PARALLEL_TASKS.md` rule 8).

## Privacy and secrets

- Only synthetic meter files and jobs go in the repository. Real exports can carry employer, customer or plant identifiers.
- Signing keys, passwords and private field evidence stay outside the repository and every handoff. The build 2 master ZIP authorization in `AGENTS.md` is specific to that archive.
- Do not put the owner's name, email, project or employer details into requests to external services.
