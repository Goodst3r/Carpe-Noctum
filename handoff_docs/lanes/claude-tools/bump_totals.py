#!/usr/bin/env python3
"""usage: bump_totals.py <worktree> <screens> <features> <custom_steps> — set every place in the guides that states the app's
screen, feature and custom-curves step totals to this level's measured numbers (unconditional, idempotent)."""
import re, sys, os
wt, screens, features, custom = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
def edit(path, pairs):
    p = os.path.join(wt, path); s = open(p).read(); o = s
    for rx, rep, flags in pairs:
        s, n = re.subn(rx, rep, s, flags=flags)
        if n == 0: print('NOTE no match', path, rx[:60])
    if s != o: open(p, 'w').write(s)
edit('docs/NightSweep_1.8_Alpha_Functions_README.md', [
    (r'it covers \d+ task screens and \d+ entries', f'it covers {screens} task screens and {features} entries', 0),
    (r'(\| \*\*Custom curves and reverse TDR\*\* \|[^\n]*?\| )\d+( steps)', rf'\g<1>{custom}\g<2>', 0),
])
edit('docs/NightSweep_1.8_Training_Coverage.md', [
    (r'covers \d+ task screens and \d+ feature choices', f'covers {screens} task screens and {features} feature choices', 0),
    (r'\*\*\d+ task screens\*\*, \*\*\d+ feature choices\*\*', f'**{screens} task screens**, **{features} feature choices**', 0),
    (r'custom curves \d+, OEM AGC', f'custom curves {custom}, OEM AGC', 0),
    (r'has \*\*\d+ choices\*\*', f'has **{features} choices**', 0),
    (r'The custom-curves exercise has \*\*\d+ steps\*\*', f'The custom-curves exercise has **{custom} steps**', 0),
])
for f in ('night-sweep/README.md', 'docs/NightSweep_1.8_Alpha_README.md'):
    edit(f, [
        (r'\*\*\d+ task screens\*\* and \*\*\d+ feature choices\*\*', f'**{screens} task screens** and **{features} feature choices**', 0),
        (r'(\| \*\*Custom curves and reverse TDR\*\* \|[^\n]*?\| )\d+( \|)', rf'\g<1>{custom}\g<2>', 0),
    ])
