import urllib.request,hashlib,pathlib,zipfile,concurrent.futures
p=pathlib.Path(__file__).parent
jobs=[('https://dl.google.com/android/repository/platform-35_r02.zip','platform.zip','0bb560a90a7a2cbd0dd8348224d518b638fe7949'),('https://dl.google.com/android/repository/build-tools_r35_linux.zip','build-tools.zip','2cfaa0bbb2336e9ec18ed3ecea84fa2e2af607bc'),('https://repo.maven.apache.org/maven2/org/eclipse/jdt/ecj/3.40.0/ecj-3.40.0.jar','ecj.jar','5c26f6a20278196f8038a284d885c3796cd7d422')]
def get(j):
 u,n,h=j;f=p/n
 if not f.exists():
  with urllib.request.urlopen(u,timeout=30) as r, f.open('wb') as w:
   while b:=r.read(1024*1024):w.write(b)
 if h:assert hashlib.sha1(f.read_bytes()).hexdigest()==h
 print(n, f.stat().st_size,'verified' if h else 'downloaded',flush=True)
 if n.endswith('.zip'):
  with zipfile.ZipFile(f) as z:z.extractall(p/n[:-4])
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as x:list(x.map(get,jobs))
