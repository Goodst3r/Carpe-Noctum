# NightSweep roadmap: 1.8 to 2.0 beta

> **Snapshot, Nov 11, 2026.** Exported from the Claude Doc (revision 15). The timeline graphic is replaced by the table under "At a glance." Signing-key handling is left out of this public copy. Otherwise the roadmap is unchanged and was written on Nov 10, before the 2.0 builds below.
>
> **Since it was written:** NightSweep is now **Carpe Noctum**. 2.0 Alpha builds 1 and 2 shipped Phase 1 ease-of-use changes 1–10 (not the station view or the field tools). Source and history are on GitHub at `Goodst3r/Carpe-Noctum`, which is public rather than the private repo Phase 0 suggests. Still open from Phase 0: the real-phone check, the supervisor OK, and tests running automatically on every push.

Nov 10, 2026 · @Spencer

NightSweep can reach a closed coworker beta by Feb 15, 2027 and a 2.0 release in early April 2027. That's two weeks of foundation work, a nine-week 2.0 alpha, two weeks of beta prep, then six weeks with 4–6 coworkers. The first task is running 1.8 on real phones: it never has, and everything after depends on it. Dates assume a few evenings a week with AI help.

## At a glance

| Phase | Dates | Main work | Gate at the end |
| --- | --- | --- | --- |
| 0. Foundation | Nov 16 – Nov 29, 2026 | Real-phone check; repo, tests, signing key | Ready to build (phones checked, supervisor OK) |
| 1. 2.0 alpha | Nov 30, 2026 – Jan 31, 2027 | Ease-of-use fixes; 8 field tools; saving, sharing, problem reports | Alpha gate |
| 2. Beta prep | Feb 1 – Feb 14, 2027 | Hosting and install; quick start; feedback | Beta ready |
| 3. Closed beta | Feb 15 – Mar 28, 2027 | 4–6 coworkers; weekly builds | Release gate (2.0 around Apr 4, 2027) |

The next phase starts only when the gate before it passes. The release gate is the one that matters most.

## Where 1.8 stands

The math and equipment data are solid; what blocks a beta is that it has never run on a real phone, coworkers have no easy way to install it, and it's harder to use than it needs to be.

| Area | Today (1.8 Alpha build 2) | What it means for beta |
| --- | --- | --- |
| Calculations | 56 of 57 test suites passed in my run; the one miss was a test-setup path, not the app | Solid. Keep tests running on every change |
| Equipment data | 516 catalog parts, 25 actives, 17 cables, each with source and manual revision | Solid |
| Real phones | Never run on a physical Android or iPhone. The Android emulator's WebView crashed on both 1.7 and 1.8 | Blocker. Test first |
| Getting it to coworkers | iPhone needs a hosted HTTPS link; the hosted site hasn't been updated to 1.8 build 2 | Blocker |
| Ease of use | Home is 4 phone screens tall; about 7,200 words of on-screen text across 19 screens; three different ways to save | Main 2.0 alpha work |
| Saving and sharing | Jobs live on one phone only; moving one means exporting a JSON file. Jobs sit in browser storage capped near 5 MB | Fix before beta |
| Feedback | No in-app way to report a problem or capture errors | Fix before beta |
| Code upkeep | No version history; dense code (app.js is 77 KB on 335 lines); the version is typed in 21 places; package.json still says 1.7.0 | Phase 0 |

## Phase 0: Foundation

Nov 16, 2026 to Nov 29, 2026. No new features; this makes every later change safer and faster. Do the real-phone check first, because what it finds can reorder everything below.

- [ ] **Run 1.8 on your own phones.** Install the APK and the browser version on one Android, and the hosted version on one iPhone. Open the complete practice job, go offline in airplane mode, save a job, restore a backup. Write down anything that breaks.
- [ ] **Ask your supervisor first.** Confirm coworkers may use a personal tool on company work, what plant data can sit on personal phones, and that a hosted link is fine. The answer decides what beta can include.
- [ ] **Start a private GitHub repo** as the one home for the source. Commit 1.8 build 2 as the baseline and tag it, so every later change can be compared and undone.
- [ ] **Run the tests automatically** on every push (GitHub Actions). Fix the layout test's hard-coded browser path; it's why that suite failed in my run.
- [ ] **One version number.** Generate "2.0 Alpha" everywhere (app, Android, service worker, docs) from a single file instead of 21 hand-typed copies.
- [ ] **Make the code readable.** Auto-format the JavaScript so each line holds one statement. No behavior change; the tests prove it.
- [ ] **Slim the release paperwork.** Keep the tests and checksums; let the automated test run replace the hand-assembled receipts and multi-page verification write-ups.

## Phase 1: 2.0 alpha, easier to use

Nov 30, 2026 to Jan 31, 2027, holidays included. These come from walking every screen as a first-time tech; do them in this order, since the first five change a new user's first ten minutes most. Sizes assume AI does most of the coding: S is an evening, M a few evenings, L about two weeks. All of Phase 1 is tight for nine weeks; if it runs long, move tools 5–8 and the station view to 2.1 rather than slip the alpha gate.

| # | Change | What it fixes | Size |
| --- | --- | --- | --- |
| 1 | Home shows the working job and 4–6 task buttons on the first screen | Task buttons now start 2½ screens down, under install/update and a 120-word practice paragraph | S |
| 2 | "New blank job" asks: 42/54 GS7K/GainMaker or 204/258 Vecima/AOI, then fills the matching anchors | Every blank job starts at 261/993 MHz and 34/46 dBmV, the high-split numbers | S |
| 3 | Search by the part number on the faceplate fills type, family and model | Picking a tap takes three dropdowns, with search buried between them | S |
| 4 | Each route point shows low and high pilot levels side by side, plus tilt | The point card shows one frequency at a time | S |
| 5 | New points copy the last span's cable type | Every new point starts at 0 ft of P3 .625 with no equipment | S |
| 6 | "Start from route" builds the power plan | Power makes you re-enter every amp and cable run | M |
| 7 | One Predicted / Measured badge plus one info button per screen | "993 MHz does not certify 1.8 GHz" appears three times on the Sweep screen | M |
| 8 | Every job saves itself into the job list; one "Back up" button | Autosave, named jobs and project export are three separate ideas | M |
| 9 | Sweep screen shows the chart first, settings below | The chart sits under graph mode, view range and normalize | S |
| 10 | Clearer tab names, a searchable catalog, a sun/moon icon, plain wording | "Equipment" vs "Equipment setup", "Sweep setup" vs "Sweep"; a 13-screen catalog; terms like "original-only diagram" | M |
| 11 | Station view: one screen per amp with targets at both pilots, your readings, pad/EQ to change, and a done check | The night's real unit of work is the amp, not the tab | L |

## Phase 1: 2.0 alpha, first new field tools

Add only the quick wins from the field-tools research in 2.0; they're offline, deterministic, and fit the "show the arithmetic" style. The tilt/EQ/pad solver comes first because the station view is built on it.

| # | Tool | What a tech gets | Size |
| --- | --- | --- | --- |
| 1 | Tilt / EQ / pad solver | Two measured pilots plus targets give level error, tilt error, and the pad and EQ change, using the catalog's real cable curves | M |
| 2 | dB unit converter | dBmV, dBm, dBµV, mV and mW in one screen, 75 Ω or 50 Ω | S |
| 3 | Ripple-to-distance | Ripple spacing on a sweep plus the cable's velocity of propagation gives feet to the mismatch (D = 492 × VP ÷ ΔF) | S |
| 4 | OFDM / OFDMA level converter | Per-6 MHz, per-1.6 MHz and total power, so meter and modem numbers line up (a 96 MHz block is +12 dB total) | S |
| 5 | DOCSIS health card | Modem receive, transmit and MER marked pass, marginal or fail against company targets you can edit | S |
| 6 | FCC leakage card | Part 76 leakage limits plus a µV/m distance converter | S |
| 7 | Fiber loss budget and color code | Fiber, splice, connector and splitter loss totals; the TIA-598 color order | S |
| 8 | Shift handoff note | Open issues, power supplies on battery, leaks, hazards and next steps, as short text to paste into a ticket | S |

One rule for all of them: every threshold lives in an editable target profile that shows its source and labels it spec, expert guidance or company target. Formulas and limits come from the research: [Hranac on linear distortions](https://www.cablefax.com/archives/linear-distortions-part-1), the [VIAVI DOCSIS 3.1 poster](https://www.normann-engineering.com/support/presentations/%7B8db11f80-96de-453e-bdb5-d060db6bae9e%7D_VIAVI_DOCSISPoster_v9_FINAL.pdf) and [FCC Part 76 Subpart K](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-K).

## Phase 1: 2.0 alpha, saving, sharing and problem reports

Once other people use it, a lost job or a silent bug costs trust fast, so these go in the alpha, not after it. Jobs stay on the phone; there is still no account or cloud sync.

- [ ] **Store saved jobs in IndexedDB**, where meter files already live. Browser storage holds about 5 MB; at 6–23 KB per job it fills after a few hundred jobs, well under the app's 1,000-job limit. (M)
- [ ] **Backup reminder on Home**, such as "Last backup 9 days ago." iPhone Safari can clear a website's data after 7 days without a visit unless it's on the Home Screen, and the Android APK turns off Android's own backup, so a lost phone loses every job. (S)
- [ ] **Share a job with a coworker** through the phone's share sheet (text, email, AirDrop, Nearby Share); the file opens straight into NightSweep. (M)
- [ ] **"Report a problem" button** that writes a message with the app version, phone, screen and last error, and can attach the job. (S)
- [ ] **Local error log** that keeps the last 50 app errors on the phone and adds them to problem reports. Works offline. (S)
- [ ] **Migration check:** open every 1.8 job and backup you have in 2.0 and confirm the numbers match. (S)

## Alpha gate

Target Jan 31, 2027. 2.0 alpha goes to anyone else only when every box is ticked; you are the only alpha tester.

- [ ] All automated tests pass on every push
- [ ] Every 1.8 job and backup you have opens in 2.0 with the same numbers
- [ ] You've used 2.0 on at least three real nights, covering both the 42/54 and 204/258 plants
- [ ] It works on an Android APK, Android Chrome and an iPhone Home Screen install, including in airplane mode
- [ ] A backup made on one phone restores on another
- [ ] No known bug loses data or shows a wrong number
- [ ] Supervisor OK is in hand, with the data rules written down

## Phase 2: Beta prep

Feb 1, 2027 to Feb 14, 2027. A tester should go from a text message to a working app in five minutes, and you should hear about every problem without chasing anyone.

- [ ] **Host it at one stable HTTPS link**, with a separate beta address so a beta build never replaces the stable one. The web app needs this for iPhone.
- [ ] **Make the web app the default install** for everyone: one link, the same on iPhone and Android, updates through "Check for updates." Offer the APK only to Android testers who want native save, share and print; company-managed phones may block APKs from outside the Play Store.
- [ ] **One-page quick start with a QR code:** install, airplane-mode test, open the practice job, start a first real job, back up. Keep the 29-page guide as reference, not the starting point.
- [ ] **One place for feedback.** Problem reports from the in-app button come to you; log each one in a single tracker with status.
- [ ] **Data rules card**, based on what your supervisor said: practice data first, and no customer names, addresses, account numbers or modem MACs in notes.
- [ ] **Beta labeling:** a "2.0 Beta" badge, the build number in Help, and a three-line "what changed" note with each weekly build.
- [ ] **Tester pack:** the link and QR code, the quick start, five tasks to try, how to report, and how to reach you.

## Phase 3: Closed beta with coworkers

Feb 15, 2027 to Mar 28, 2027, six weeks with 4–6 testers, aiming at a 2.0 release around Apr 4, 2027.

**Who:** one or two senior sweep techs to catch wrong numbers, one or two newer techs to catch confusion, and one lead or supervisor for records and run sheets. Cover both plants (42/54 and 204/258) and both Android and iPhone.

**Schedule:**

1. Week 1: install, finish the practice job, 15-minute first-impressions call.
2. Weeks 2–5: real nights. One new build a week on a set day, with a 10-minute check-in or group text.
3. Week 6: short survey, then decide what's in 2.0 and what waits.

**Five tasks every tester tries:**

1. Install from the link and pass the airplane-mode test.
2. Finish the complete practice job.
3. Build a real route for one amp and compare predicted levels with meter readings.
4. Back up a job and restore it on another phone, or send it to a coworker.
5. Use one new tool on a real night: tilt/EQ solver, ripple distance or handoff note.

**What to measure, and the bar for release:**

| Measure | Bar for 2.0 release |
| --- | --- |
| Install works on the first try | Every tester |
| Time from a new job to the first tap level | Under 3 minutes |
| Open bugs that lose data or show a wrong number | Zero |
| Testers who used it on real nights | At least 4 |
| "Would you keep using it?" | Most say yes |
| Top confusion points reported | Top 5 fixed, quick start updated |

## After beta: 2.1 and later

Pick from this list using what testers asked for, not this order alone. All of it works offline on the phone.

| Feature | What it does | Size |
| --- | --- | --- |
| Maintenance-window log | Window times, change ticket, nodes, timestamped steps, rollback plan, post-checks, sign-off | L |
| Leak log | GPS, level and distance, detector, cause, repair, after-level and photo; a CLI estimate for supervisors | L |
| Span-by-span voltage drop | Extends Power with each cable's loop resistance, so you see voltage at every active | M |
| Impairment decision tree | Pick a symptom (suckout, standing wave, tilt, roll-off, ingress, CPD, LTE) to get likely causes and checks | L |
| High-split and 1.8 GHz guide | Band plans, aeronautical-band overlap and OUDP leakage detection for the 204/258 plant | M |
| Power supply and battery record | Battery string readings and date codes, plus an alarm decoder for common standby supplies | M |
| Fiber tools | OTDR distance helper, PON power card, DWDM/CWDM channel calculator | M |
| R-PHY node bring-up checklist | Optics, timing, registration and RF checks for Vecima nodes, tied to manual revisions | M |
| Practice quizzes | Random problems built from the calculators, mapped to SCTE BDS topics | M |

Later in the suite, a sibling fiber app can reuse NightSweep's shell, storage and backup.

**Don't build** unless your employer backs it: live modem or CMTS polling, PNM analytics, XPERTrak or StrataSync sync, map editing, accounts or cloud sync. These need company systems and credentials; importing an exported file covers most of the need.

## Decisions and risks

Six decisions are yours; my suggestion is listed first in each.

- [ ] **Hosting:** GitHub Pages, free and next to the repo; or Cloudflare Pages; or the current host.
- [ ] **Beta install:** the web app for everyone with the APK optional; or APK-first on Android.
- [ ] **Data testers may enter:** set by your supervisor's answer in Phase 0.
- [ ] **Testers:** the 4–6 names, covering both plants and both phone types.
- [ ] **Station view:** in 2.0 alpha as a first version; or held for 2.1.
- [ ] **Development setup:** slim the AI-agent rule files to match the lighter process; or keep them as they are.

| Risk | What we do about it |
| --- | --- |
| Real phones show bugs the emulator didn't | That's why the phone check is the first Phase 0 task; Phase 1 keeps a week of slack |
| A wrong number reaches the field | Predicted badge, show-the-arithmetic, senior techs in the beta, and zero wrong-number bugs as a release bar |
| An iPhone clears saved jobs | Require the Home Screen install; backup reminder on Home |
| Your employer says no | Keep it for personal use and practice data until approved |
| The research list grows the scope | Only the eight quick wins in 2.0; everything else waits for 2.1 |
| One person maintains it | Repo, automated tests and readable code let someone else, or an AI, pick it up |
