import re
p='night-sweep/thresholds.js';t=open(p).read()
pat=re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',re.S)
ent=re.compile(r"\['[^'\]]*',r=>.*?\]\s*(?=,\[|\];)",re.S)
def entries(line):
    m=re.search(r"const groups=\[(.*)\];",line,re.S)
    body=m.group(1)
    parts=re.findall(r"(\['[^']*',r=>(?:(?!\],\[).)*?\])(?=,\[|$)",body,re.S)
    assert ''.join(parts).replace(',','')==body.replace(',','') or ','.join(parts)==body,('parse mismatch',body[:200])
    return parts
name=lambda e:re.match(r"\['([^']*)'",e).group(1)
def fix(m):
    ours,theirs=m.group(1),m.group(2)
    if 'const groups=' not in ours: raise SystemExit('unexpected conflict hunk:\n'+ours[:300])
    o=entries(ours.strip());th=entries(theirs.strip())
    # THEIRS is the lower level (build3 plus everything below): keep its entries as they are, add the entries only OURS has
    res=list(th);have={name(e) for e in res}
    for i,e in enumerate(o):
        if name(e) in have: continue
        prev=name(o[i-1]) if i>0 else None
        idx=[k for k,x in enumerate(res) if name(x)==prev]
        if idx: res.insert(idx[0]+1,e)
        else: res.append(e)
        have.add(name(e))
    return ' const groups=['+','.join(res)+'];\n'
t,n=pat.subn(fix,t);open(p,'w').write(t);print('thresholds hunks resolved:',n)
