#!/usr/bin/env python3
"""usage: resolve_level.py <worktree> — resolve shell.html, workflow.js and training.js conflicts when merging a lower stack level
(theirs) into the next one up (ours): keep theirs, then add what only ours has (placeholder lines, init calls, visibleIds keys,
feature entries, featureControls keys), keep ours' custom-curves summary line and theirs' other summary lines."""
import re, sys, os
wt=sys.argv[1]
pat=re.compile(r'<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n',re.S)
def apply(path,fn):
    f=os.path.join(wt,path)
    if '<<<<<<<' not in open(f).read(): return
    s=open(f).read(); ms=list(pat.finditer(s)); out=[]; pos=0
    for i,m in enumerate(ms):
        out.append(s[pos:m.start()]); out.append(fn(i,m.group(1),m.group(2))+'\n'); pos=m.end()
    out.append(s[pos:]); open(f,'w').write(''.join(out)); print('resolved',path,len(ms),'hunk(s)')
def shell(i,o,t):
    ol=o.split('\n'); tl=t.split('\n')
    init_o=[l for l in ol if l.startswith('<script>init')][0]; init_t=[l for l in tl if l.startswith('<script>init')][0]
    calls_o=re.findall(r'(\w+\.init\(\);)',init_o); calls_t=re.findall(r'(\w+\.init\(\);)',init_t)
    add=[c for c in calls_o if c not in calls_t]
    for c in add: init_t=init_t.replace('initWorkflow();',c+'initWorkflow();',1)
    extra=[l for l in ol if l.startswith('<script><!--') and l not in tl]
    return '\n'.join(extra+[l for l in tl if not l.startswith('<script>init')]+[init_t]) if False else '\n'.join(extra+[l if not l.startswith('<script>init') else init_t for l in tl])
def workflow(i,o,t):
    key=re.compile(r"(\w+):\[[^\]]*\]")
    ko=key.findall(o); kt=key.findall(t)
    only=[k for k in ko if k not in kt]
    ents={m.group(1):m.group(0) for m in key.finditer(o)}
    for k in only: t=t.replace("power:['powerPanel'],",ents[k]+",power:['powerPanel'],",1)
    return t
def training(i,o,t):
    ol=o.split('\n'); tl=t.split('\n')
    if any(l.lstrip().startswith("{id:'complete'") for l in tl):
        assert len(ol)==3 and len(tl)==3
        n=os.environ.get('CUSTOM_STEPS')
        line=ol[2]
        if n: line=re.sub(r"summary:'\d+ steps",f"summary:'{n} steps",line,count=1)
        return '\n'.join([tl[0],tl[1],line])
    ent=lambda L:[l for l in L if re.match(r"\s*\['[\w-]+',",l)]
    eo=ent(ol); et=ent(tl)
    only_fc = not eo and not et
    idof=lambda l:re.match(r"\s*\['([\w-]+)'",l).group(1)
    ids_t={idof(l) for l in et}; only=[l for l in eo if idof(l) not in ids_t]
    rows=[l.rstrip() for l in et]+[l.rstrip() for l in only]
    rows=[r.rstrip(',') for r in rows]
    body='\n'.join([r+',' for r in rows[:-1]]+[rows[-1]]) if rows else ''
    mapl=([l for l in tl if l.lstrip().startswith('].map')] or [''])[0]
    fo=[l for l in ol if 'const featureControls' in l][0]; ft=[l for l in tl if 'const featureControls' in l][0]
    kv=re.compile(r"((?:\w+|'[\w-]+')):'((?:[^'])*)'")
    ko=[m.group(0) for m in kv.finditer(fo)]; kt=[m.group(1) for m in kv.finditer(ft)]
    for m in kv.finditer(fo):
        if m.group(1) not in kt:
            ft=ft.replace("{sweepDue:'#sweepDueInterval',","{sweepDue:'#sweepDueInterval',"+m.group(0)+",",1) if "{sweepDue:'#sweepDueInterval'," in ft else ft
    return ft if only_fc else '\n'.join([body,mapl,ft])
apply('night-sweep/shell.html',shell); apply('night-sweep/workflow.js',workflow); apply('night-sweep/training.js',training)
