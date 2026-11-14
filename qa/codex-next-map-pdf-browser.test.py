"""Actual offline PDF parsing, viewport geometry, writing and raster preservation."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from io import BytesIO
import base64, hashlib, json, os, subprocess
from pypdf import PdfReader
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
checks = 0
def check(name, ok):
    global checks
    if not ok:
        raise AssertionError(name)
    checks += 1
    print('PASS ' + name, flush=True)

# Public/synthetic fixture only; include real /Rotate, nonzero CropBox and UserUnit.
script = r"""
const P=require(process.argv[1]);
(async()=>{const d=await P.PDFDocument.create();for(const rot of [0,90,180,270]){
 const p=d.addPage([900,900]);p.setCropBox(50,70,800,800);p.setRotation(P.degrees(rot));
 if(rot===270)p.node.set(P.PDFName.of('UserUnit'),P.PDFNumber.of(2));
 p.drawCircle({x:300,y:450,size:7,color:P.rgb(1,0,0)});p.drawText('SYNTHETIC '+rot,{x:80,y:800,size:18});
 const a=d.context.obj({Type:'Annot',Subtype:'Text',Rect:[80,100,100,120],Contents:P.PDFString.of('Existing synthetic annotation')});
 p.node.set(P.PDFName.of('Annots'),d.context.obj([d.context.register(a)]));
}process.stdout.write(Buffer.from(await d.save()).toString('base64'));})();
"""
encoded = subprocess.check_output(['node','-e',script,str(ROOT/'night-sweep/vendor/map/pdf-lib.js')],text=True)
raw = base64.b64decode(encoded)
sha = hashlib.sha256(raw).hexdigest()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT/'outputs'),**kwargs)
    def log_message(self,*args):
        pass

server = ThreadingHTTPServer(('127.0.0.1',0),Handler)
thread = Thread(target=server.serve_forever,daemon=True)
thread.start()
try:
    with sync_playwright() as p:
        executable = os.environ.get('NIGHTSWEEP_CHROMIUM')
        browser = p.chromium.launch(**({'executable_path':executable} if executable else {}),args=['--no-sandbox'])
        context = browser.new_context(viewport={'width':390,'height':844})
        page = context.new_page()
        errors = []
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{server.server_port}/Night_Sweep.html',wait_until='load')
        requests = []
        page.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http://','https://')) else None)
        context.set_offline(True)
        result = page.evaluate(r"""async ({encoded,sha})=>{
 const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),doc=await NightSweepMapImport.read(new File([bytes],'synthetic.pdf',{type:'application/pdf'}));
 const rows=doc.pages.map((p,i)=>{const [a,b,c,d,e,f]=p.pdf.viewportTransform;return {id:'r'+(i+1),name:'SYNTHETIC A'+i,device:'active_gm_hgd',terminal:i===3,mapImport:{sourceId:sha,page:i+1,symbolId:'A'+i,exactName:'SYNTHETIC A'+i,tag:'TAG'+i,kind:i===3?'terminal':'active',position:{x:a*300+c*450+e,y:b*300+d*450+f},positionConfirmed:true,modelConfirmed:true,status:'installed'},workbench:{records:{main:{before:{low:{input:10},high:{output:40}}},aux:{after:{low:{output:20}}}}}}});
 const owner={setup:{lowF:54,highF:860},rows,mapImportSource:{id:sha,bytes:bytes.length,name:'synthetic.pdf',type:'application/pdf',pages:doc.source.pages}};
 const before=JSON.stringify(owner),original=Array.from(bytes),plan=NightSweepMapPDF.plan(owner),out=await NightSweepMapPDF.exportPDF(bytes,owner),again=await NightSweepMapPDF.exportPDF(bytes,owner);
 const lib=window.pdfjsLib,load=async data=>lib.getDocument({data:new Uint8Array(data),isEvalSupported:false,useWasm:false,enableXfa:false,useWorkerFetch:false,disableAutoFetch:true,disableStream:true,verbosity:0}).promise;
 const originalPDF=await load(bytes),updatedPDF=await load(out),rasters=[];
 for(const t of plan.tombstones){
  const canvases=[];for(const pdf of [originalPDF,updatedPDF]){const p=await pdf.getPage(t.page),base=p.getViewport({scale:1}),viewport=p.getViewport({scale:t.geometry.width/base.width}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await p.render({canvasContext:canvas.getContext('2d'),viewport,annotationMode:lib.AnnotationMode.ENABLE}).promise;canvases.push(canvas);}
  const counts=canvases.map(canvas=>{const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let ink=0,red=0;for(let y=Math.floor(t.y);y<Math.ceil(t.y+t.height);y++)for(let x=Math.floor(t.x);x<Math.ceil(t.x+t.width);x++){const k=(y*canvas.width+x)*4;if(data[k]<100&&data[k+1]<100&&data[k+2]<100)ink++;}const radius=12*Math.hypot(...t.geometry.viewportTransform.slice(0,2));for(let y=Math.floor(t.anchor.y-radius);y<Math.ceil(t.anchor.y+radius);y++)for(let x=Math.floor(t.anchor.x-radius);x<Math.ceil(t.anchor.x+radius);x++){const k=(y*canvas.width+x)*4;if(data[k]>180&&data[k+1]<100&&data[k+2]<100)red++;}return {ink,red};});
  rasters.push({page:t.page,anchor:{x:t.anchor.x/t.geometry.width,y:t.anchor.y/t.geometry.height},rotation:t.geometry.rotation,crop:t.geometry.viewBox,userUnit:t.geometry.userUnit,grouped:t.lines.some(s=>s.includes('aux')),counts});canvases.forEach(c=>c.width=c.height=1);
 }
 await originalPDF.destroy();await updatedPDF.destroy();
 return {rasters,unchanged:before===JSON.stringify(owner)&&original.every((v,i)=>bytes[i]===v),same:out.length===again.length&&out.every((v,i)=>again[i]===v),output:btoa(Array.from(out,x=>String.fromCharCode(x)).join(''))};
}""",{'encoded':encoded,'sha':sha})
        check('four physical symbols produce four grouped tombstones',len(result['rasters'])==4)
        expected=[(.3125,.525),(.475,.3125),(.6875,.475),(.525,.6875)]
        for i,r in enumerate(result['rasters']):
            check(f'page {i+1} actual rotation retained',r['rotation']==i*90)
            check(f'page {i+1} distinct nonzero CropBox retained',r['crop']==[50,70,850,870])
            check(f'page {i+1} independent expected symbol position',abs(r['anchor']['x']-expected[i][0])<1e-9 and abs(r['anchor']['y']-expected[i][1])<1e-9)
            check(f'page {i+1} multiple physical legs grouped',r['grouped'])
            check(f'page {i+1} actual raster contains overlay at planned position',r['counts'][1]['ink']>r['counts'][0]['ink']+100)
            check(f'page {i+1} original red symbol remains visible',r['counts'][0]['red']>0 and r['counts'][1]['red']>=r['counts'][0]['red']*.75)
        check('non-default UserUnit is retained',result['rasters'][3]['userUnit']==2)
        check('original bytes and job RF records are unchanged',result['unchanged'])
        check('repeat export from original is byte-identical',result['same'])
        output=base64.b64decode(result['output'])
        source=PdfReader(BytesIO(raw));updated=PdfReader(BytesIO(output))
        check('original page count retained',len(updated.pages)==len(source.pages)==4)
        for i,(old,new) in enumerate(zip(source.pages,updated.pages)):
            check(f'page {i+1} existing annotation retained',len(new.get('/Annots',[]))==len(old.get('/Annots',[]))==1)
            check(f'page {i+1} original text markup retained','SYNTHETIC '+str(i*90) in new.extract_text())
            check(f'page {i+1} only one current tombstone',new.extract_text().count('NAME:')==1)
        check('source SHA-256 unchanged',hashlib.sha256(raw).hexdigest()==sha)
        check('no network requests after offline transition',not requests)
        check('no browser runtime errors',not errors)
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join()
print(f'Next PDF browser: {checks} checks passed')
