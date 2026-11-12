import re,sys
# keep both sides of every conflict hunk (incoming first, then ours) — only for files made of independent additions such as CSS
for p in sys.argv[1:]:
    t=open(p).read()
    pat=re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',re.S)
    n=len(pat.findall(t))
    t=pat.sub(lambda m:m.group(2)+m.group(1),t)
    open(p,'w').write(t);print(p,'hunks unioned:',n)
