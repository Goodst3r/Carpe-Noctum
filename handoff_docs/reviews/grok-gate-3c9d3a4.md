# Gate record · 3c9d3a4

Exact head: `3c9d3a4150c4042d41d6375652223f03ef02b0cf` (`grok/a5-power-pm`, pull request #30).

Local run 2026-11-12T08:18:15Z–08:32:01Z. Chromium `/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`. `NIGHTSWEEP_SUITE_TIMEOUT=3600`. Log `/tmp/grok-gate-3c9d3a4.log`. This record is not a pass. Do not overwrite it.

| Command | Exit |
| --- | --- |
| `python3 night-sweep/build.py` | 0 |
| `python3 build-pwa.py` | 0 |
| `python3 qa/run-pwa.py` | 0 |
| `python3 qa/build3-layout.test.py` | 1 |
| `python3 qa/browser-smoke.py` | 0 |
| `git status --porcelain` | 0 |

The wrapper shell exited 0 because it only echoed each suite’s exit code. That is not a green gate. Layout exited 1.

- Suites **91**, checks **2301**, total suite time **807.7 s**. `all_passed` true. Generated build unchanged during the tests. Worktree snapshot unchanged during the tests.
- Layout: exited 1 after **95** PASS lines. It stopped on the first failure and did not finish, so 95 is not a completed layout count.
- Smoke: **373** Chromium rendered checks passed, exit 0. The log also has `ConnectionResetError` traces from `http.server` after a client closed a socket.
- Standalone SHA-256 `c48d3b7650f2dc1b456330e374ee3850e092a1e661bbf8ac74ef934fdc96dc00`
- `git status --porcelain` afterwards: only `?? qa/runtime/node_modules`. Not committed.
- PWA content id at this head: `f40534be7d9ce9485990`.

Hosted CI on this exact SHA: [QA gate run 43181842081](https://github.com/Goodst3r/Carpe-Noctum/actions/runs/43181842081) failed. The failed job is the same layout assertion.

## Failing suite

Name: `qa/build3-layout.test.py` (Rendered Chromium - build 3 layout).

Reproduce: from this worktree, with `NIGHTSWEEP_CHROMIUM=/opt/pw-browsers/chromium-1254/chrome-linux64/chrome`,

`python3 qa/build3-layout.test.py`

A focused probe of the same page at 320 px, after Add this span, showed the chain text matched `5.5 V drop`, `tabIndex` was 0 and `role` was `region`. The region’s `scrollWidth` was 300 and `clientWidth` was 240. The table’s computed `min-width` was `300px` (`.hs-table`).

Last 60 lines of that suite’s output:

```
PASS night 320px Outage inputs keep field-sized controls
PASS night 320px Outage buttons are large controls
PASS night 320px Outage text contrast is at least 4.5:1
PASS night 320px Outage opens with the company-policy line before any checklist item
PASS night 320px Outage shows the count in words
PASS night 320px Impairments fits without sideways scrolling, with a 70-character unbroken point name in the candidate table
PASS night 320px the Impairments picker, card and tool stay inside the viewport
PASS night 320px Impairments text wraps inside its box and the candidate table scrolls inside its own region
PASS night 320px each Impairments picture is a 44 px row with a tick target of at least 24 px
PASS night 320px Impairments inputs keep field-sized controls
PASS night 320px Impairments source tags are at least 24 px tap targets
PASS night 320px Impairments text contrast is at least 4.5:1
PASS night 320px Impairments shows the distance and the candidate places in words
PASS night 320px Fiber fits without sideways scrolling
PASS night 320px both Fiber cards stay inside the viewport
PASS night 320px Fiber results and tables wrap or scroll inside their cards
PASS night 320px Fiber inputs keep field-sized controls
PASS night 320px Fiber buttons are 44 px controls
PASS night 320px Fiber source tags are at least 24 px tap targets
PASS night 320px Fiber text contrast is at least 4.5:1
PASS night 320px Fiber states each result in words, and a color name sits beside every swatch
PASS night 320px High split fits without sideways scrolling
PASS night 320px the three High split cards stay inside the viewport
PASS night 320px High split tables scroll inside their own region and every region can take focus
PASS night 320px High split long source lines and statements wrap inside their cards
PASS night 320px High split source tags are at least 24 px tap targets
PASS night 320px High split text contrast is at least 4.5:1
PASS night 320px High split states the Vecima gap in words in a visible warning, and every R-PHY step names its source
PASS night 320px Why cards fit without sideways scrolling with every card open
PASS night 320px all fourteen Why cards stay inside the viewport
PASS night 320px Why card text, citations and sources wrap inside their cards
PASS night 320px Why card headings and link buttons are 44 px controls
PASS night 320px Why card source tags are at least 44 px tap targets
PASS night 320px Why card text contrast is at least 4.5:1
PASS night 320px each Why card names its SCTE 293 monograph and year
PASS night 320px Proof of performance fits without sideways scrolling
PASS night 320px the four Proof of performance cards stay inside the viewport
PASS night 320px Proof of performance tables scroll inside their own focusable region
PASS night 320px Proof of performance statements wrap inside their cells
PASS night 320px Proof of performance source tags are at least 44 px tap targets
PASS night 320px Proof of performance rule text keeps a readable width, no table scrolls sideways and none grows past 2,800 px
PASS night 320px Proof of performance row names wrap instead of taking the table
PASS night 320px Proof of performance text contrast is at least 4.5:1
PASS night 320px every Proof of performance row names its rule section
PASS night 320px Study fits without sideways scrolling with a number question open
PASS night 320px Study shows a wrong answer, the right one and its working inside the card
PASS night 320px Study answer choices are 44 px rows with a radio button each
PASS night 320px Study buttons and fields are 40 px or taller
PASS night 320px Study text contrast is at least 4.5:1
PASS night 320px Study says in words that nothing is saved and a score is not a test result
PASS night 320px Supply PM fits without sideways scrolling
PASS night 320px Supply PM states the worked span drop and the published minimum in words
PASS night 320px Supply PM controls are at least 44 px
PASS night 320px Supply PM source tag is at least 24 px
Traceback (most recent call last):
  File "/tmp/wt-a5/qa/build3-layout.test.py", line 411, in <module>
    check(f'{label} Supply PM keeps the added span inside a focusable region', page.evaluate("(()=>{const r=document.querySelector('#powerPmPanel .table-scroll');return /5\\.5 V drop/.test(document.getElementById('powerPmChain').textContent)&&r.tabIndex===0&&r.getAttribute('role')==='region'&&r.scrollWidth<=r.clientWidth+1})()"))
  File "/tmp/wt-a5/qa/build3-layout.test.py", line 31, in check
    raise AssertionError(name)
AssertionError: night 320px Supply PM keeps the added span inside a focusable region
```
