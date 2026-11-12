import re,sys
p='qa/run-pwa.py';t=open(p).read()
pat=re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',re.S)
t,n=pat.subn(lambda m:m.group(1)+m.group(2),t)   # keep both sides
old="('Build 3 shared checklist engine and pre-work safety card','build3-checklist.test.cjs'"
t=''.join(l for l in t.splitlines(True) if old not in l)
open(p,'w').write(t);print('run-pwa hunks resolved:',n)
