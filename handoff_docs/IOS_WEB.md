# iPhone web release: deployment blocked

The existing public site is <https://nightsweep-field.goodst3r.chatgpt.site/>. On 2026-11-13, before any deployment, its `release.json` reported version `ffada9f24b84cec7bf99`, app version `2.0 Alpha build 2`. No deployment was made in this session, so build 3 has no after-deployment live version. The existing address and hosting project were not changed.

## Why publication stopped

The Sites publisher requires a saved version tied to the head of the Site's separate source repository. Its current saved version does not identify the frozen build 3 commit. Pushing that exact commit would transfer Git objects containing `android-build/`, `release/`, and `handoff_docs/`, which the request explicitly excluded from upload. The required deployment archive also contains the hosting manifest alongside `dist/`; the configured public directory is `dist/`. No supported static-only deployment path was found. No source or archive was uploaded to Sites and no site version was saved or deployed.

## Frozen candidate

- Source: `248e77802f333a1a461563dfb1973315a2043d67` (`origin/build3`), with no differences from that commit in `night-sweep`, `outputs`, `dist`, or `build-pwa.py`.
- Rebuilt `dist/release.json`: `2fcbba4edc01f3770854`, app version `2.0 Alpha build 3`.
- `dist/index.html` SHA-256: `d5ea917ce64168586870ffafca9a1b239c27fcde0806a65fd2856f53ece3aaa3`.
- `outputs/Night_Sweep.html` SHA-256: `844c53b06d11e6af60cd9473fbcef2de3015732fc09ede12a986296ee7d51137`.
- Both build commands completed successfully and the working tree was clean afterward.

## iPhone-emulated browser checks

Playwright WebKit with the iPhone 13 profile tested the rebuilt files on `http://127.0.0.1`, not the live site. The page displayed “Ready for offline use” and registered `sw.2fcbba4edc01f3770854.js`. After the local HTTP server was stopped, an uncached network request failed, the app reloaded, a synthetic 72 dBµV conversion returned 12.00 dBmV, and a named training job was saved and persisted after a second reload. `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node /tmp/cn-webkit-serverdown.cjs` exited 0.

Playwright `context.setOffline(true)` followed by reload produced “WebKit encountered an internal error” locally; a separate minimal cached-service-worker example reproduced it. The server-stopped check provides separate offline evidence but does not prove the Playwright offline-mode scenario passed.

## Not tested

Build 3 was not deployed. Its served release, index hash, manifest, icon, iPhone guide, HTTPS service worker, or live-site offline behavior were not tested. No physical iPhone, Safari Add to Home Screen action, installed Home Screen app, iOS storage separation, Android emulator, or field use was tested. No APK was built or signed.

For a future successful release, open the link in Safari, wait for the offline-ready message, use Share → Add to Home Screen, and open the Home Screen icon. On iPhone, Safari-tab jobs and Home Screen app jobs are stored separately. Use Home → Back up project to keep copies because iPhone can clear website storage. The existing site is public to anyone with the link; practice data is synthetic.

## Gate on frozen source

On `248e77802f333a1a461563dfb1973315a2043d67`, the local gate completed with exit code 0 for each command:

- `npm ci --prefix qa/runtime --no-audit --no-fund`
- `python3 night-sweep/build.py` and `python3 build-pwa.py`
- `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium NIGHTSWEEP_SUITE_TIMEOUT=3600 python3 qa/run-pwa.py`: **106 suites, 2,890 checks**, counted from this run's PASS lines.
- `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/build3-layout.test.py`: **1,252 checks**.
- `NIGHTSWEEP_CHROMIUM=/usr/bin/chromium python3 qa/browser-smoke.py`: **370 checks**.
- `git diff --check` and `git status --porcelain`: no output; the tree was clean.

The [hosted QA gate](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43362549486) was manually dispatched on the same SHA and completed successfully. It does not replace the local counts above.
