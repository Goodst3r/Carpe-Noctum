#!/usr/bin/env python3
"""usage: resolve_guides.py <worktree> <json params> — resolve the Functions guide and Training Coverage conflicts for one stack level.
Keeps THEIRS (the lower level, which already holds build3 and every lower item), then adds this level's contribution.
params: name, anchor, prev_name, prev_anchor, feature_id, screens, features, count_word (Test screens word), sentence, custom_steps"""
import re, sys, os, json
wt = sys.argv[1]; P = json.loads(sys.argv[2])
pat = re.compile(r'<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n', re.S)

def process(path, fn):
    f = os.path.join(wt, path); s = open(f).read()
    if '<<<<<<<' not in s:
        return
    ms = list(pat.finditer(s)); out = []; pos = 0
    for m in ms:
        out.append(s[pos:m.start()]); out.append(fn(m.group(1), m.group(2)) + '\n'); pos = m.end()
    out.append(s[pos:]); open(f, 'w').write(''.join(out)); print('resolved', path, len(ms))

def functions(o, t):
    if 'This reference explains' in t:
        tl = t.split('\n')
        tl[0] = re.sub(r'(\d+) task screens and (\d+) entries', lambda m: f"{P['screens']} task screens and {P['features']} entries", tl[0])
        p = tl[2]
        p, n = re.subn(r'adds \w+ Test screens', f"adds {P['count_word']} Test screens", p); assert n == 1
        old = f" and [{P['prev_name']}](#{P['prev_anchor']})."; assert old in p, old
        p = p.replace(old, f", [{P['prev_name']}](#{P['prev_anchor']}) and [{P['name']}](#{P['anchor']}).", 1)
        tl[2] = p.rstrip() + ' ' + P['sentence']; return '\n'.join(tl)
    if re.search(r'^\d+\. \[', t, re.M):
        out = []; inserted = False
        prev_in_hunk = f"[{P['prev_name']}](#{P['prev_anchor']})" in t
        first = int(re.match(r'(\d+)\.', [l for l in t.split('\n') if re.match(r'\d+\. ', l)][0]).group(1))
        if not prev_in_hunk:
            out.append(f"{first}. [{P['name']}](#{P['anchor']})"); inserted = True
        for l in t.split('\n'):
            m = re.match(r'(\d+)\. (.*)$', l)
            if not m:
                out.append(l); continue
            n = int(m.group(1)); txt = m.group(2)
            if inserted:
                n += 1
            txt = re.sub(r'\d+-feature coverage index\]\(#\d+-feature-coverage-index\)', f"{P['features']}-feature coverage index](#{P['features']}-feature-coverage-index)", txt)
            out.append(f'{n}. {txt}')
            if prev_in_hunk and f"[{P['prev_name']}](#{P['prev_anchor']})" in txt and not inserted:
                out.append(f"{n+1}. [{P['name']}](#{P['anchor']})"); inserted = True
        assert inserted; return '\n'.join(out)
    if '| Route |' in t:
        tl = t.split('\n'); i = [k for k, l in enumerate(tl) if l.startswith('| Test |')][0]
        prev_row = P.get('prev_row', P['prev_name']); row = P.get('row_name', P['name'])
        a = f"{prev_row} |"; assert a in tl[i], (a, tl[i][:200])
        tl[i] = tl[i].replace(a, f"{prev_row}; {row} |", 1); return '\n'.join(tl)
    if 'supplied meter captures' in t:
        ol = o.split('\n'); tl = t.split('\n'); out = []
        for l in tl:
            if l.startswith('| **Custom curves'):
                row = [x for x in ol if x.startswith('| **Custom curves')][0]
                row = re.sub(r'\| \d+ steps', f"| {P['custom_steps']} steps", row, count=1)
                out.append(row)
            else:
                out.append(l)
        return '\n'.join(out)
    if re.match(r'## \d+-feature coverage index$', o.strip()):
        assert re.search(r'## \d+-feature coverage index$', t.rstrip())
        return re.sub(r'## \d+-feature coverage index$', f"## {P['features']}-feature coverage index", t.rstrip())
    if o.lstrip().startswith('| ') and f"feature:{P['feature_id']} " in o:
        row = [l for l in o.split('\n') if f"feature:{P['feature_id']} " in l][0]
        row = re.sub(r'^\| \d+ \|', f"| {P['features']} |", row)
        return t.rstrip('\n') + '\n' + row
    raise SystemExit('UNHANDLED functions hunk: ' + o[:160])

def coverage(o, t):
    ol = o.split('\n'); tl = t.split('\n'); out = []
    for l in tl:
        if l.startswith('| Custom curves'):
            out.append([x for x in ol if x.startswith('| Custom curves')][0])
        else:
            out.append(l)
    return '\n'.join(out)

process('docs/NightSweep_1.8_Alpha_Functions_README.md', functions)
process('docs/NightSweep_1.8_Training_Coverage.md', coverage)

def bump(path, pairs):
    f = os.path.join(wt, path); s = open(f).read()
    for rx, rep in pairs:
        s, n = re.subn(rx, rep, s)
        if n == 0:
            print('NOTE: no match in', path, rx)
    open(f, 'w').write(s)

tot = [(r'covers \d+ task screens and \d+ feature choices', f"covers {P['screens']} task screens and {P['features']} feature choices"),
       (r'\*\*\d+ task screens\*\*, \*\*\d+ feature choices\*\*', f"**{P['screens']} task screens**, **{P['features']} feature choices**"),
       (r'custom curves \d+, OEM AGC', f"custom curves {P['custom_steps']}, OEM AGC")]
bump('docs/NightSweep_1.8_Training_Coverage.md', tot)
for f in ('night-sweep/README.md', 'docs/NightSweep_1.8_Alpha_README.md'):
    bump(f, [(r'\*\*\d+ task screens\*\* and \*\*\d+ feature choices\*\*', f"**{P['screens']} task screens** and **{P['features']} feature choices**")])
