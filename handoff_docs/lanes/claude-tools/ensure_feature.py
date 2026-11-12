#!/usr/bin/env python3
"""usage: ensure_feature.py <worktree> <feature_id> — after a merge, make sure night-sweep/training.js still holds this level's
feature entry and featureControls key (taken from HEAD, the pre-merge branch tip, when missing) and that the custom-curves
summary count equals the real number of custom-curves guide steps."""
import re, sys, os, subprocess
wt, fid = sys.argv[1], sys.argv[2]
path = os.path.join(wt, 'night-sweep/training.js')
s = open(path).read()
head = subprocess.run(['git', '-C', wt, 'show', 'HEAD:night-sweep/training.js'], capture_output=True, text=True).stdout

def feature_ids(src):
    m = re.search(r'features=\[([\s\S]*?)\]\.map\(\(\[id,label', src)
    return m, [x.group(1) for x in re.finditer(r"^\s*\['([\w-]+)',", m.group(1), re.M)]

m, ids = feature_ids(s)
if fid not in ids:
    hm, hids = feature_ids(head)
    line = [l for l in hm.group(1).split('\n') if re.match(r"\s*\['%s'," % re.escape(fid), l)]
    assert len(line) == 1, ('feature entry not found in HEAD', fid)
    entry = line[0].rstrip().rstrip(',')
    lines = s.split('\n')
    # the last feature entry line is the last line matching an entry before '].map(([id,label'
    maprow = next(i for i, l in enumerate(lines) if l.lstrip().startswith('].map(([id,label,group,variant,step,task,seed])'))
    last = max(i for i in range(maprow) if re.match(r"\s*\['[\w-]+',", lines[i]))
    if not lines[last].rstrip().endswith(','):
        lines[last] = lines[last].rstrip() + ','
    lines.insert(last + 1, entry)
    s = '\n'.join(lines)
    print('re-added feature entry', fid)
# featureControls key
key_re = re.compile(r"(?:^|[{,])(?:'%s'|%s):'" % (re.escape(fid), re.escape(fid)))
fc = re.search(r'const featureControls=\{(.*?)\};', s, re.S)
if not key_re.search('{' + fc.group(1)):
    hfc = re.search(r'const featureControls=\{(.*?)\};', head, re.S).group(1)
    km = re.search(r"((?:'%s'|%s):'(?:[^'])*')" % (re.escape(fid), re.escape(fid)), hfc)
    assert km, ('featureControls key not found in HEAD', fid)
    s = s.replace('const featureControls={', 'const featureControls={' + km.group(1) + ',', 1)
    print('re-added featureControls key', fid)
# custom-curves summary count = real number of custom steps
i = s.index('const customSteps=[')
seg = s[i:]
end = seg.index('\n ];') if '\n ];' in seg else seg.index('];')
n = len(re.findall(r"^\s*\['[\w-]+',", seg[:end], re.M))
cm = re.search(r"(id:'custom-curves'[^}]*?summary:')(\d+) steps", s)
if int(cm.group(2)) != n:
    s = s.replace(cm.group(0), cm.group(1) + f'{n} steps', 1)
    print('custom-curves summary count', cm.group(2), '->', n)
open(path, 'w').write(s)
print('custom steps counted:', n)
