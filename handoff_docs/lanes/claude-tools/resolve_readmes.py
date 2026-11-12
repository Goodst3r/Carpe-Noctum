#!/usr/bin/env python3
"""usage: resolve_readmes.py <worktree> — README copies conflict on the screen/feature totals line; after resolve_guides bumps the totals
both sides are identical, so keep one; the two copies must end byte-identical."""
import re, sys, os
wt=sys.argv[1]
pat=re.compile(r'<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n',re.S)
for f in ('night-sweep/README.md','docs/NightSweep_1.8_Alpha_README.md'):
    p=os.path.join(wt,f); s=open(p).read()
    def r(m):
        if m.group(1)!=m.group(2): sys.exit('README hunk differs after bump in '+f+':\nOURS: '+m.group(1)[:300]+'\nTHEIRS: '+m.group(2)[:300])
        return m.group(1)+'\n'
    s2=pat.sub(r,s)
    if s2!=s: open(p,'w').write(s2); print('resolved README conflict in',f)
a=open(os.path.join(wt,'night-sweep/README.md')).read(); b=open(os.path.join(wt,'docs/NightSweep_1.8_Alpha_README.md')).read()
if a!=b: sys.exit('README copies differ')
