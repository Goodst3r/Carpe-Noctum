#!/usr/bin/env python3
"""usage: normalize_index.py <worktree> — make the Functions guide's feature coverage index follow night-sweep/training.js:
rows are gathered from anywhere in the guide (a merge can strand one), placed in feature order in the index table and numbered 1..N;
the section heading and the contents entry get N. Also fixes the featureControls 'sweep-grading' style omissions by reporting them."""
import re, sys, os
wt = sys.argv[1]
src = open(os.path.join(wt, 'night-sweep/training.js')).read()
m = re.search(r'features=\[([\s\S]*?)\]\.map\(\(\[id,label', src)
ids = [x.group(1) for x in re.finditer(r"^\s*\['([\w-]+)',", m.group(1), re.M)]
N = len(ids)
path = os.path.join(wt, 'docs/NightSweep_1.8_Alpha_Functions_README.md')
lines = open(path).read().split('\n')
row_re = re.compile(r'^\| (\d+) \| .*<!-- feature:([\w-]+) -->')
rows = {}
keep = []
table_start = None
for i, l in enumerate(lines):
    r = row_re.match(l)
    if r:
        fid = r.group(2)
        assert fid not in rows, ('duplicate index row', fid)
        rows[fid] = l
    else:
        keep.append(l)
missing = [f for f in ids if f not in rows]
extra = [f for f in rows if f not in ids]
if missing or extra:
    sys.exit(f'index rows do not match training.js features: missing {missing} extra {extra}')
# find where the index table was: the heading
h = [i for i, l in enumerate(keep) if re.match(r'## \d+-feature coverage index$', l)]
assert len(h) == 1, h
h = h[0]
# the table header row and separator follow the intro paragraph: find the first line starting with '| #' or '| No' after the heading
t = next(i for i in range(h, len(keep)) if keep[i].startswith('| ') and 'Application feature' in keep[i] or keep[i].startswith('| # |') or keep[i].startswith('| No |'))
sep = t + 1
assert keep[sep].startswith('| ---'), keep[sep][:60]
new_rows = []
for n, fid in enumerate(ids, 1):
    new_rows.append(re.sub(r'^\| \d+ \|', f'| {n} |', rows[fid]))
out = keep[:sep + 1] + new_rows + keep[sep + 1:]
text = '\n'.join(out)
text = re.sub(r'## \d+-feature coverage index', f'## {N}-feature coverage index', text)
text = re.sub(r'\d+-feature coverage index\]\(#\d+-feature-coverage-index\)', f'{N}-feature coverage index](#{N}-feature-coverage-index)', text)
open(path, 'w').write(text)
print(f'index normalized: {N} features, {len(new_rows)} rows')
# featureControls keys must exist for every feature id
fc = re.search(r'const featureControls=\{(.*?)\};', src, re.S).group(1)
keys = set(re.findall(r"(?:^|,)(?:'([\w-]+)'|(\w+)):'", fc))
keys = {a or b for a, b in keys}
lack = [f for f in ids if f not in keys and f not in ('station',)]
print('features without a featureControls key:', lack)
