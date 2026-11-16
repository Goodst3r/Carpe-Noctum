import { recognizePdfPages } from './map-ocr.mjs';
import { EQUIPMENT, CABLES } from './catalog.mjs';
import { recognizeSymbol, cablePathCandidates, contactDistance, pointInsideContour, solidRoundContour } from './map-geometry.mjs';
/**
 * Immutable PDF adapter. PDF.js/PDFLib are supplied by the offline app shell.
 * Parsed pages use displayed (rotation/crop/UserUnit applied), top-left fractions:
 * {pageNumber,width,height,viewBox,rotation,userUnit,viewportTransform,
 *  text:[{str,x,y,width,height,baseline:[x,y],source:'native'}],
 *  vectors:[{id,points:[[x,y]],closed,curved,stroke,fill,lineWidth,bounds}],
 *  annotations:[{id,subtype,contents,rect:[x,y,w,h]}],scheduleRegions:[],symbols:[]}.
 * A/E identity label bounds, equipment bounds and cable attachment points are
 * distinct and remain unconfirmed until reviewed.
 * The native linework is evidence, not a confirmed physical network. Crossings
 * never become junctions, and imported edges never acquire physical port bindings.
 */
const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,n));
const finite = n => typeof n==='number' && Number.isFinite(n);
const ident = [1,0,0,1,0,0];
const mul = (a,b) => [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
const point = (m,x,y) => [m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
const center = t => [t.x+t.width/2,t.y+t.height/2];
const clean = s => String(s??'').replace(/\s+/g,' ').trim();
const tagPattern = /^(A|E)\s*[-:]?\s*(\d+)$/i;
const tagOf = s => {const m=clean(s).match(tagPattern);return m?`${m[1].toUpperCase()}${Number(m[2])}`:null;};
const nodeId = tag => `map-${tag.toLowerCase()}`;
function bytesOf(bytes) {
  const size=bytes?.byteLength;if(finite(size)&&size>20*1024*1024)throw new Error('PDF source exceeds the 20 MiB local import limit.');
  if(bytes instanceof ArrayBuffer)return new Uint8Array(bytes).slice();
  if(ArrayBuffer.isView(bytes))return new Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength).slice();
  throw new TypeError('PDF source must be bytes.');
}
async function hash(bytes) {
  if(!globalThis.crypto?.subtle)throw new Error('SHA-256 verification is unavailable in this browser.');
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function reader() {
  if(!globalThis.pdfjsLib?.getDocument)throw new Error('The offline PDF reader is unavailable.');
  return globalThis.pdfjsLib;
}
async function open(bytes) {
  const pdf=await reader().getDocument({data:bytesOf(bytes),verbosity:0,isEvalSupported:false,useSystemFonts:true}).promise;
  if(pdf.numPages>200){await pdf.destroy();throw new Error('PDF exceeds the local limit of 200 pages, including station reports.');}
  return pdf;
}
function sectionType(s) {
  if(/^ACTIVES?\b/i.test(clean(s)))return 'active';
  if(/^(?:EOL|END\s+OF\s+LINE)\s*(?:[-:]?\s*\d+)?$/i.test(clean(s)))return 'eol';
  if(/^(?:FIBER TERMINATION|PASSIVES|CABLES|POWER SUPPLIES|BILL OF MATERIALS)\b/i.test(clean(s)))return 'other';
  return null;
}
function textRows(items) {
  const rows=[];
  for(const t of [...items].sort((a,b)=>a.y-b.y||a.x-b.x)){
    let row=rows.at(-1);
    if(!row||Math.abs(row.y-t.y)>Math.max(t.height,row.height)*.45){row={y:t.y,height:t.height,items:[]};rows.push(row);}
    row.items.push(t);row.height=Math.max(row.height,t.height);
  }
  for(const r of rows)r.items.sort((a,b)=>a.x-b.x);
  return rows;
}
/** Only identity and allowed schedule metadata are extracted; RF design columns
 * and model cells are deliberately never copied into the normalized node. */
export function extractSchedules(pages) {
  const nodes=[],regions=[],issues=[],seen=new Map();
  let current=null,columns=null,lastWidth=null;
  for(const page of pages){
    const text=(page.text||[]).filter(t=>clean(t.str));
    const anchors=text.map(t=>({t,type:sectionType(t.str)})).filter(a=>a.type).sort((a,b)=>a.t.y-b.t.y);
    const tagHeaders=text.filter(t=>/^TAG$/i.test(clean(t.str))).sort((a,b)=>a.y-b.y);
    // A bare TAG header followed by NAME identifies an active table even when
    // a continuation page omits its ACTIVES title.
    for(const t of tagHeaders){
      const near=text.filter(v=>Math.abs(v.y-t.y)<Math.max(t.height,v.height)*1.4);
      const name=near.find(v=>/^NAME$/i.test(clean(v.str))&&v.x>t.x);
      const preceding=anchors.filter(a=>a.t.y<=t.y).at(-1);
      const kind=preceding?.type||(name?'active':current);
      if(kind==='active'||kind==='eol'){
        const find=re=>near.find(v=>re.test(clean(v.str)));
        anchors.push({t:{...t,y:t.y+Math.max(t.height,.0001)*.2},type:kind,header:true,columns:{
          tag:t,name:name||null,dla:find(/^DLA$/i)||null,powerSupply:find(/^POWER\s*SUPPLY$/i)||null,
          all:near.filter(v=>!/^[DA]$/.test(clean(v.str))).sort((a,b)=>a.x-b.x)
        }});
      }
    }
    anchors.sort((a,b)=>a.t.y-b.t.y);
    if(lastWidth&&Math.abs(page.width-lastWidth)>lastWidth*.05&&!anchors.length){current=null;columns=null;}
    let ai=0,region=null;
    const startRegion=(kind,y)=>{if(region)region.bottom=y;region={page:page.pageNumber,kind,top:y,bottom:1};regions.push(region);};
    if(current==='active'||current==='eol')startRegion(current,0);
    for(const row of textRows(text)){
      while(ai<anchors.length&&anchors[ai].t.y<=row.y+row.height*.3){
        const a=anchors[ai++];
        if(a.type!==current){current=a.type;columns=a.columns||null;startRegion(current,a.t.y);}
        if(a.columns)columns=a.columns;
      }
      if(current!=='active'&&current!=='eol')continue;
      for(const tagItem of row.items){
        const tag=tagOf(tagItem.str);if(!tag||!tag.startsWith(current==='active'?'A':'E'))continue;
        if(columns?.tag&&Math.abs(center(tagItem)[0]-center(columns.tag)[0])>Math.max(.025,columns.tag.width*2))continue;
        // No headers, no inference: a continuation requires a previous table.
        if(!columns)continue;
        if(seen.has(tag)){issues.push(`Duplicate schedule identifier ${tag} on page ${page.pageNumber}; confirm its identity.`);continue;}
        const right=row.items.filter(t=>t.x>tagItem.x+tagItem.width*.6);
        let name=tag;
        if(current==='active'){
          const nameItem=right[0];
          if(!nameItem||/^[-+]?\d+(?:\.\d+)?$/.test(clean(nameItem.str))){issues.push(`Missing NAME for ${tag} on page ${page.pageNumber}.`);continue;}
          name=clean(nameItem.str);
        }
        const schedule={page:page.pageNumber};
        if(current==='active'){
          // Each header gets its own bounded cell. Matching item centres handles
          // centred headers over left-aligned table content, including TAG/NAME.
          const cell=(header)=>{
            if(!header)return null;
            const hc=center(header)[0],others=columns.all.filter(h=>h!==header).map(h=>center(h)[0]);
            const before=Math.max(0,...others.filter(x=>x<hc)),after=Math.min(1,...others.filter(x=>x>hc));
            const left=(before+hc)/2,rightBound=(after+hc)/2;
            return row.items.filter(t=>center(t)[0]>=left&&center(t)[0]<rightBound).sort((a,b)=>Math.abs(center(a)[0]-hc)-Math.abs(center(b)[0]-hc))[0]||null;
          };
          const dla=clean(cell(columns.dla)?.str),ps=clean(cell(columns.powerSupply)?.str);
          if(dla&&/^\d+(?:\.\d+)?$/.test(dla))schedule.dla=Number(dla);
          if(ps)schedule.powerSupply=ps;
        }
        const node={id:nodeId(tag),tag,name,kind:current,modelId:'',settings:{},schedule};
        seen.set(tag,node);nodes.push(node);
      }
    }
    lastWidth=page.width;
  }
  return {nodes,regions:regions.filter(r=>r.kind==='active'||r.kind==='eol'),issues};
}
function normalizedText(item,viewport) {
  const m=mul(viewport.transform,item.transform),base=point(viewport.transform,item.transform[4],item.transform[5]);
  const h=Math.max(Math.hypot(m[2],m[3]),item.height*(viewport.scale||1));
  const advance=Math.hypot(m[0],m[1])||1;
  const w=item.width*(viewport.scale||1)*(viewport.userUnit||1);
  const along=[m[0]/advance*w,m[1]/advance*w],up=[m[2],m[3]];
  const corners=[base,[base[0]+along[0],base[1]+along[1]],[base[0]+up[0],base[1]+up[1]],[base[0]+along[0]+up[0],base[1]+along[1]+up[1]]];
  const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
  return {str:item.str,x:Math.min(...xs)/viewport.width,y:Math.min(...ys)/viewport.height,width:(Math.max(...xs)-Math.min(...xs))/viewport.width,height:(Math.max(...ys)-Math.min(...ys))/viewport.height,baseline:[base[0]/viewport.width,base[1]/viewport.height],source:'native'};
}
function bounds(points) {
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
function extractVectors(operatorList,viewport,pageNumber) {
  const O=reader().OPS,paths=[],stack=[];let matrix=ident,stroke='#000000',fill='#000000',lineWidth=1;
  const saved=()=>({matrix:[...matrix],stroke,fill,lineWidth});
  const restore=s=>{if(s)({matrix,stroke,fill,lineWidth}=s);};
  function add(raw,paintOp,legacy=false){
    const display=mul(viewport.transform,matrix);let points=[],closed=false,curved=false;
    const stroked=[O.stroke,O.closeStroke,O.fillStroke,O.eoFillStroke,O.closeFillStroke,O.closeEOFillStroke].includes(paintOp);
    const filled=[O.fill,O.eoFill,O.fillStroke,O.eoFillStroke,O.closeFillStroke,O.closeEOFillStroke].includes(paintOp);
    const flush=()=>{
      if(points.length>1&&(stroked||filled))paths.push({id:`p${pageNumber}-v${paths.length+1}`,points,closed,curved,stroke:stroked?stroke:null,fill:filled?fill:null,lineWidth:lineWidth*Math.hypot(matrix[0],matrix[1])*(viewport.scale||1)*(viewport.userUnit||1),bounds:bounds(points)});
      points=[];closed=false;curved=false;
    };
    const put=(x,y)=>{const p=point(display,x,y);points.push([p[0]/viewport.width,p[1]/viewport.height]);};
    if(legacy){
      const [ops,args]=raw;let k=0;
      for(const op of ops){
        if(op===O.moveTo){flush();put(args[k++],args[k++]);}
        else if(op===O.lineTo)put(args[k++],args[k++]);
        else if(op===O.rectangle){flush();const [x,y,w,h]=args.slice(k,k+4);k+=4;put(x,y);put(x+w,y);put(x+w,y+h);put(x,y+h);closed=true;flush();}
        else if(op===O.curveTo){k+=4;put(args[k++],args[k++]);curved=true;}
        else if(op===O.curveTo2||op===O.curveTo3){k+=2;put(args[k++],args[k++]);curved=true;}
        else if(op===O.closePath)closed=true;
      }
    }else{
      for(let k=0;k<raw.length;){
        const op=raw[k++];
        if(op===0){flush();put(raw[k++],raw[k++]);}
        else if(op===1)put(raw[k++],raw[k++]);
        else if(op===2){k+=4;put(raw[k++],raw[k++]);curved=true;}
        else if(op===3){k+=2;put(raw[k++],raw[k++]);curved=true;}
        else if(op===4)closed=true;
        else break;
      }
    }
    flush();
  }
  for(let i=0;i<operatorList.fnArray.length;i++){
    const op=operatorList.fnArray[i],a=operatorList.argsArray[i];
    if(op===O.save)stack.push(saved());
    else if(op===O.restore)restore(stack.pop());
    else if(op===O.transform)matrix=mul(matrix,a);
    else if(op===O.paintFormXObjectBegin){stack.push(saved());if(a?.[0])matrix=mul(matrix,a[0]);}
    else if(op===O.paintFormXObjectEnd)restore(stack.pop());
    else if(op===O.setStrokeRGBColor||op===O.setStrokeGray||op===O.setStrokeCMYKColor)stroke=Array.from(a).join(',');
    else if(op===O.setFillRGBColor||op===O.setFillGray||op===O.setFillCMYKColor)fill=Array.from(a).join(',');
    else if(op===O.setLineWidth)lineWidth=a[0];
    else if(op===O.constructPath){
      if(typeof a[0]==='number'){for(const raw of a[1]||[])if(raw)add(raw,a[0]);}
      else {const next=operatorList.fnArray[i+1];add(a,next,true);}
    }
  }
  return paths;
}
function nativeAnnotations(annotations,viewport) {
  return annotations.map(a=>{
    const r=a.rect||[0,0,0,0],p=point(viewport.transform,r[0],r[1]),q=point(viewport.transform,r[2],r[3]);
    return {id:a.id,subtype:a.subtype||'',contents:clean(a.contentsObj?.str||a.contents||''),rect:[Math.min(p[0],q[0])/viewport.width,Math.min(p[1],q[1])/viewport.height,Math.abs(p[0]-q[0])/viewport.width,Math.abs(p[1]-q[1])/viewport.height]};
  });
}
function inSchedule(text,pageNumber,regions){return regions.some(r=>r.page===pageNumber&&text.y>=r.top-.002&&text.y<=r.bottom);}
const passiveParts=new Map();
for(const equipment of Object.values(EQUIPMENT).filter(e=>e.kind==='passive'&&e.id!=='cable-only')){
  for(const alias of [equipment.id,equipment.label?.split('·')[0].trim()]){
    if(!alias)continue;const key=alias.toUpperCase();if(!passiveParts.has(key))passiveParts.set(key,[]);passiveParts.get(key).push(equipment.id);
  }
}
function attachCableEvidence(pages,edges,regions){
  const cables=Object.values(CABLES);
  const segmentDistance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy,t=den?clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
  for(const page of pages){
    page.cableLabels=[];
    for(const text of page.text){
      if(text.source!=='native'||inSchedule(text,page.pageNumber,regions))continue;
      const str=clean(text.str),length=str.match(/^(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')$/i),construction=str.match(/^(?:(P3|QR|MC2)\s*([.0-9]+)|(RG\s*(?:6|11)))$/i),size=str.match(/^(?:0?\.)?(412|440|500|540|565|625|650|700|715|750|860|875|1000)$/);
      if(!length&&!construction&&!size)continue;
      let label={text:str,x:text.x,y:text.y,width:text.width,height:text.height,confirmed:false};
      if(length)label={...label,kind:'length',lengthFt:Number(length[1]),basis:'Explicit feet label near native linework; association unconfirmed'};
      else if(construction){
        const normalized=str.toUpperCase().replace(/\s+/g,'');
        label={...label,kind:'construction',candidateCableIds:cables.filter(c=>c.label.toUpperCase().replace(/\s+/g,'').includes(normalized)).map(c=>c.id)};
      }else label={...label,kind:'size',sizeText:size[1],basis:'Unqualified size label; construction unconfirmed'};
      page.cableLabels.push(label);
    }
    const paths=new Map(page.vectors.map(v=>[v.id,v]));
    for(const edge of edges.filter(e=>e.evidence.page===page.pageNumber)){
      const route=(edge.evidence.vectorIds||[]).map(id=>paths.get(id)).filter(Boolean),near=[];
      for(const label of page.cableLabels){
        const c=[(label.x+label.width/2)*page.width,(label.y+label.height/2)*page.height],radius=Math.max(1,label.height*page.height*3);
        if(route.some(path=>path.points.some((b,i)=>i>0&&segmentDistance(c,[path.points[i-1][0]*page.width,path.points[i-1][1]*page.height],[b[0]*page.width,b[1]*page.height])<=radius)))near.push(label);
      }
      edge.evidence.nearbyLabels=near.slice(0,24);
    }
  }
}
function attachSymbols(pages,nodes,regions,issues) {
  const byTag=new Map(nodes.map(n=>[n.tag,n]));
  for(const page of pages){
    page.symbols=[];
    // Highlighted map identities may live entirely in PDF FreeText annotations.
    // Missing schedule rows remain visible as provisional review identities.
    const annotationTags=(page.annotations||[]).filter(a=>a.subtype==='FreeText'&&tagOf(a.contents)&&Array.isArray(a.rect)&&a.rect.length===4&&a.rect.every(finite)&&a.rect[2]>0&&a.rect[3]>0)
      .filter(a=>!page.text.some(t=>tagOf(t.str)===tagOf(a.contents)&&center(t)[0]>=a.rect[0]&&center(t)[0]<=a.rect[0]+a.rect[2]&&center(t)[1]>=a.rect[1]&&center(t)[1]<=a.rect[1]+a.rect[3]))
      .map(a=>({str:a.contents,x:a.rect[0],y:a.rect[1],width:a.rect[2],height:a.rect[3],source:'annotation',annotationId:a.id}));
    for(const t of [...page.text,...annotationTags]){
      if(inSchedule(t,page.pageNumber,regions))continue;
      const part=passiveParts.get(clean(t.str).toUpperCase());
      const tag=tagOf(t.str)||(part?`P${page.pageNumber}-${page.symbols.length+1}`:null);if(!tag)continue;
      let node=byTag.get(tag);
      if(part){node={id:nodeId(tag),tag,name:clean(t.str),kind:'passive',modelId:'',settings:{},evidence:{type:'native-part-label',text:clean(t.str),candidateModelIds:part}};nodes.push(node);}
      if(!node){node={id:nodeId(tag),tag,name:tag,kind:tag[0]==='A'?'active':'eol',modelId:'',settings:{},evidence:{type:'unmatched-map-label',scheduleMatched:false}};nodes.push(node);byTag.set(tag,node);issues.push(`${tag}: map label has no matching schedule row; confirm its identity.`);}
      const labelBounds={x:t.x,y:t.y,width:t.width,height:t.height};
      const geometry=recognizeSymbol(page,labelBounds,{kind:node.kind});
      if(geometry.symbolKind==='unknown')issues.push(`${tag}: equipment shape unresolved; confirm the actual symbol rather than its label position.`);
      const b=geometry.symbolBounds,c=b?center(b):center(t);
      const symbol={id:`p${page.pageNumber}-${tag}`,tag,nodeId:node.id,page:page.pageNumber,x:c[0],y:c[1],labelBounds,
        symbolBounds:b,outlinePoints:geometry.outlinePoints,symbolKind:geometry.symbolKind,geometryConfidence:geometry.confidence,attachmentPoints:[],
        vectorIds:geometry.vectorIds,source:t.source||'native',scheduleMatched:!!node.schedule,confidence:t.confidence??null,confirmed:false,...(t.annotationId?{annotationId:t.annotationId}:{})};
      page.symbols.push(symbol);
      if(node.map){issues.push(`${tag}: multiple native map labels; confirm the symbol on page ${page.pageNumber}.`);node.map.ambiguous=true;}
      else node.map={page:page.pageNumber,x:c[0],y:c[1],symbolId:symbol.id,labelBounds,symbolBounds:b,
        symbolKind:symbol.symbolKind,geometryConfidence:symbol.geometryConfidence,attachmentPoints:[],
        source:symbol.source,scheduleMatched:symbol.scheduleMatched,confidence:symbol.confidence,confirmed:false,...(t.annotationId?{annotationId:t.annotationId}:{})};
    }
    const unresolved=page.symbols.filter(s=>s.tag.startsWith('A')&&s.symbolKind==='unknown'&&s.source==='annotation').length;
    if(unresolved)issues.push(`Page ${page.pageNumber}: ${unresolved} active annotation placements have no compatible equipment contour; review their symbol bounds and cable contacts.`);
    page.scheduleRegions=regions.filter(r=>r.page===page.pageNumber);
  }
  for(const n of nodes)if(!n.map)issues.push(`${n.tag}: schedule identity has no native map symbol; place it manually.`);
}
function discoverPassives(pages,nodes,regions,issues) {
  const passiveKinds=new Set(['tap2','tap4','tap8','splitter2','coupler']);
  for(const page of pages){
    const paths=cablePathCandidates(page),endpoints=paths.flatMap(path=>[
      {point:path.points[0],pathId:path.id},{point:path.points.at(-1),pathId:path.id}
    ]),seen=[];
    const excluded=point=>page.symbols.some(s=>pointInsideContour(point,s));
    const add=(label,printedValue)=>{
      const point=center(label);if(excluded(point)||seen.some(p=>distance([p[0]*page.width,p[1]*page.height],[point[0]*page.width,point[1]*page.height])<2.5))return;
      const geometry=recognizeSymbol(page,label,{kind:'passive'});
      if(!passiveKinds.has(geometry.symbolKind)||!geometry.symbolBounds)return;
      const candidate={symbolBounds:geometry.symbolBounds,outlinePoints:geometry.outlinePoints,labelBounds:label};
      const contacts=endpoints.filter(e=>contactDistance(e.point,candidate,page)<=.85);
      if(new Set(contacts.map(e=>e.pathId)).size<2)return;
      seen.push(point);
      const id=`map-passive-p${page.pageNumber}-${seen.length}`,symbolId=`p${page.pageNumber}-passive-${seen.length}`;
      const b=geometry.symbolBounds,c=center(b),labelBounds={x:label.x,y:label.y,width:label.width,height:label.height};
      const symbol={id:symbolId,tag:'',nodeId:id,page:page.pageNumber,x:c[0],y:c[1],labelBounds,symbolBounds:b,
        outlinePoints:geometry.outlinePoints,symbolKind:geometry.symbolKind,printedValue,vectorIds:geometry.vectorIds,
        geometryConfidence:geometry.confidence,attachmentPoints:[],source:'native-geometry',scheduleMatched:false,confirmed:false};
      const node={id,tag:'',name:'Passive candidate',kind:'passive',modelId:'',settings:{},needsIdentity:true,
        evidence:{type:'native-passive-symbol',printedValue,vectorIds:geometry.vectorIds},
        map:{page:page.pageNumber,x:c[0],y:c[1],symbolId,labelBounds,symbolBounds:b,symbolKind:geometry.symbolKind,
          printedValue,geometryConfidence:geometry.confidence,attachmentPoints:[],source:'native-geometry',scheduleMatched:false,confirmed:false}};
      page.symbols.push(symbol);nodes.push(node);
    };
    for(const t of page.text){
      const value=clean(t.str);if(!/^\d{1,3}$/.test(value)||inSchedule(t,page.pageNumber,regions))continue;
      add({x:t.x,y:t.y,width:t.width,height:t.height},value);
    }
    for(const v of page.vectors){
      if(!solidRoundContour(v,page))continue;
      const w=v.bounds.width*page.width,h=v.bounds.height*page.height;if(w<1||h<1||w>15||h>15)continue;
      const c=center(v.bounds),label={x:c[0]-.00005,y:c[1]-.00005,width:.0001,height:.0001};
      add(label,null);
    }
    const count=seen.length;if(count)issues.push(`Page ${page.pageNumber}: ${count} native passive shapes need identity, model and physical contact review.`);
  }
}
function proposeEdges(pages,nodes,issues) {
  const edges=[];
  for(const page of pages){
    if(!page.symbols.length)continue;
    const paths=cablePathCandidates(page),tolerance=.08,cellSize=tolerance*2,vertices=[],grid=new Map(),segments=[];
    const px=p=>[p[0]*page.width,p[1]*page.height];
    function vertex(p){
      const gx=Math.floor(p[0]/cellSize),gy=Math.floor(p[1]/cellSize);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const id of grid.get(`${gx+dx},${gy+dy}`)||[])if(distance(vertices[id].p,p)<=tolerance)return id;
      const id=vertices.length;vertices.push({p,links:[],nodes:[]});const key=`${gx},${gy}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(id);return id;
    }
    for(const path of paths){
      const a=vertex(px(path.points[0])),b=vertex(px(path.points.at(-1)));
      const length=path.points.reduce((sum,p,i)=>i?sum+distance(px(path.points[i-1]),px(p)):0,0);
      if(a!==b){vertices[a].links.push({to:b,pathId:path.id,length});vertices[b].links.push({to:a,pathId:path.id,length});}
      for(let k=1;k<path.points.length;k++){
        const p=px(path.points[k-1]),q=px(path.points[k]);
        if(distance(p,q)>.001)segments.push({a:p,b:q,pathId:path.id,curved:path.curved});
      }
    }
    const bindings=[],claimed=new Map();
    for(const symbol of page.symbols){
      if(symbol.tag.startsWith('A')&&symbol.symbolKind==='unknown'&&symbol.source==='annotation')continue;
      const labelHeight=symbol.labelBounds.height*page.height;
      const radius=symbol.symbolBounds?.width?Math.max(.85,Math.min(1.5,labelHeight*.6)):Math.max(8,labelHeight*3);
      const nearby=vertices.map((v,id)=>({id,d:contactDistance([v.p[0]/page.width,v.p[1]/page.height],symbol,page)}))
        .filter(v=>v.d<=radius).sort((a,b)=>a.d-b.d).slice(0,12);
      for(const hit of nearby){const old=claimed.get(hit.id);if(!old||hit.d<old.d)claimed.set(hit.id,{symbol,d:hit.d});}
    }
    for(const [id,{symbol,d}] of claimed){
      vertices[id].nodes.push(symbol.nodeId);
      bindings.push({symbol,vertex:id});
      const point={x:vertices[id].p[0]/page.width,y:vertices[id].p[1]/page.height};
      symbol.attachmentPoints.push(point);
      symbol.lineworkBinding??={vertex:id,distance:d,candidates:[],confirmed:false};
      symbol.lineworkBinding.candidates.push(id);
    }
    for(const symbol of page.symbols){const node=nodes.find(n=>n.id===symbol.nodeId);if(node?.map?.symbolId===symbol.id)node.map.attachmentPoints=symbol.attachmentPoints;}
    // A degree-one endpoint connected to mapped equipment is review evidence.
    // It is not assigned to an unplaced schedule E# or certified as an EOL.
    const components=new Set(),border=Math.max(2,Math.min(page.width,page.height)*.003);let terminalCount=0,terminalTruncated=false;
    for(let start=0;start<vertices.length;start++){
      if(components.has(start))continue;
      const queue=[start],component=[];components.add(start);
      for(let i=0;i<queue.length;i++){
        const id=queue[i];component.push(id);
        for(const link of vertices[id].links)if(!components.has(link.to)){components.add(link.to);queue.push(link.to);}
      }
      const upstream=[...new Set(component.flatMap(id=>vertices[id].nodes))];if(!upstream.length)continue;
      for(const id of component){
        const v=vertices[id],p=v.p;
        if(v.links.length!==1||v.nodes.length)continue;
        if(p[0]<border||p[1]<border||p[0]>page.width-border||p[1]>page.height-border)continue;
        if(page.symbols.some(s=>distance(px([s.x,s.y]),p)<2))continue;
        if(terminalCount>=256){terminalTruncated=true;continue;}
        terminalCount++;
        const x=p[0]/page.width,y=p[1]/page.height,nodeId=`map-terminal-p${page.pageNumber}-${terminalCount}`;
        const symbolId=`p${page.pageNumber}-terminal-${terminalCount}`,labelBounds={x,y,width:0,height:0};
        const symbol={id:symbolId,tag:'',nodeId,page:page.pageNumber,x,y,labelBounds,symbolBounds:null,
          symbolKind:'unknown-endpoint',vectorIds:[],attachmentPoints:[{x,y}],source:'native-cable-end',confirmed:false};
        const node={id:nodeId,tag:'',name:'Unlabeled cable end',kind:'eol',modelId:'',settings:{},needsIdentity:true,
          evidence:{type:'unlabeled-cable-end',classification:'terminal-or-continuation',upstreamCandidates:upstream},
          map:{page:page.pageNumber,x,y,symbolId,symbolKind:'unknown-endpoint',labelBounds,symbolBounds:null,
            attachmentPoints:[{x,y}],source:'native-cable-end',confirmed:false}};
        page.symbols.push(symbol);nodes.push(node);v.nodes.push(nodeId);bindings.push({symbol,vertex:id});
      }
    }
    if(terminalCount)issues.push(`Page ${page.pageNumber}: ${terminalCount} unlabeled connected cable ends need terminal/continuation and schedule identity review.`);
    if(terminalTruncated)issues.push(`Page ${page.pageNumber}: the 256 connected-end review limit was reached; inspect remaining cable ends manually.`);
    const pairs=new Set();
    for(const binding of bindings){
      const queue=[{v:binding.vertex,path:[],length:0}],visited=new Set([binding.vertex]);let qi=0;
      while(qi<queue.length&&qi<12000){
        const item=queue[qi++],v=vertices[item.v];
        const other=v.nodes.filter(id=>id!==binding.symbol.nodeId);
        if(other.length){
          for(const target of other){
            const pair=[binding.symbol.nodeId,target].sort().join('|');if(pairs.has(pair)||!item.path.length)continue;pairs.add(pair);
            const from=binding.symbol.nodeId,to=target,directionEvidence='unresolved';
            edges.push({id:`map-edge-${edges.length+1}`,from,to,port:'',cableId:'',lengthFt:null,confirmed:false,
              evidence:{page:page.pageNumber,type:'native-endpoint-continuity',vectorIds:[...new Set(item.path)],direction:directionEvidence},
              requiresConfirmation:['physical route','direction','output port','cable type','cable length']});
          }
          continue;
        }
        for(const link of v.links)if(!visited.has(link.to)){visited.add(link.to);queue.push({v:link.to,path:[...item.path,link.pathId],length:item.length+link.length});}
      }
    }
    // Proper interior crossings are recorded without connecting their segments.
    // Spatial bins keep the native CAD page check bounded on mobile hardware.
    const bins=new Map(),checked=new Set(),crossings=[];const size=Math.max(page.width,page.height)/70;let checks=0;
    for(let i=0;i<segments.length;i++){
      const s=segments[i],a=s.a,b=s.b;
      const x0=Math.floor(Math.min(a[0],b[0])/size),x1=Math.floor(Math.max(a[0],b[0])/size),y0=Math.floor(Math.min(a[1],b[1])/size),y1=Math.floor(Math.max(a[1],b[1])/size);
      if((x1-x0+1)*(y1-y0+1)>500)continue;
      for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
        const key=`${x},${y}`,prior=bins.get(key)||[];
        if(checks<200000&&crossings.length<100)for(const j of prior){
          const pair=`${j}:${i}`;if(checked.has(pair))continue;checked.add(pair);checks++;
          const t=segments[j];if(s.pathId===t.pathId||s.curved||t.curved)continue;
          const c=t.a,d=t.b;if([a,b].some(p=>[c,d].some(q=>distance(p,q)<tolerance)))continue;
          const ab=[b[0]-a[0],b[1]-a[1]],cd=[d[0]-c[0],d[1]-c[1]],den=ab[0]*cd[1]-ab[1]*cd[0];if(Math.abs(den)<1e-8)continue;
          const ac=[c[0]-a[0],c[1]-a[1]],u=(ac[0]*cd[1]-ac[1]*cd[0])/den,v=(ac[0]*ab[1]-ac[1]*ab[0])/den;
          if(u>.001&&u<.999&&v>.001&&v<.999)crossings.push({x:(a[0]+u*ab[0])/page.width,y:(a[1]+u*ab[1])/page.height,vectorIds:[s.pathId,t.pathId],confirmed:false});
        }
        prior.push(i);bins.set(key,prior);
      }
    }
    page.crossings=crossings;
    if(crossings.length)issues.push(`Page ${page.pageNumber}: ${crossings.length}${crossings.length===100?'+':''} native linework crossings require junction/bypass confirmation; crossings were not joined.`);
    if(checks>=200000)issues.push(`Page ${page.pageNumber}: crossing analysis reached its bound; review remaining linework manually.`);
  }
  if(edges.length)issues.push(`${edges.length} native geometry route candidates require physical route, direction, port, cable and length confirmation.`);
  else if(nodes.length>1)issues.push('Native linework did not resolve a reliable endpoint route. Connect the physical route manually.');
  return edges;
}
export async function importMap(bytes,{onProgress,ocr=false,signal}={}) {
  if(signal?.aborted)throw new DOMException('Map import cancelled.','AbortError');
  const source=bytesOf(bytes),sha256=await hash(source),pdf=await open(source),pages=[],issues=[];
  try{
    for(let n=1;n<=pdf.numPages;n++){
      if(signal?.aborted)throw new DOMException('Map import cancelled.','AbortError');
      onProgress?.({phase:'reading',page:n,total:pdf.numPages});
      const p=await pdf.getPage(n),v=p.getViewport({scale:1});
      const [content,operators,annotations]=await Promise.all([p.getTextContent(),p.getOperatorList(),p.getAnnotations({intent:'display'})]);
      const page={pageNumber:n,width:v.width,height:v.height,viewBox:[...p.view],rotation:p.rotate,userUnit:p.userUnit||1,viewportTransform:[...v.transform],text:content.items.filter(t=>typeof t.str==='string'&&clean(t.str)).map(t=>normalizedText(t,v)),vectors:extractVectors(operators,v,n),annotations:nativeAnnotations(annotations,v)};
      pages.push(page);
      if(!page.text.length)issues.push(`Page ${n} has no native text; identities require OCR/manual verification. Original raster artwork is preserved.`);
      p.cleanup();
    }
    let schedule=extractSchedules(pages);
    if(ocr){
      const selected=pages.filter(p=>!p.text.length||(!schedule.regions.some(r=>r.page===p.pageNumber)&&!p.text.some(t=>tagOf(t.str)))).map(p=>p.pageNumber);
      const options=typeof ocr==='object'?ocr:{};
      const result=await recognizePdfPages(pdf,pages,{...options,pages:options.pages||selected,onProgress,signal});
      issues.push(...result.issues);schedule=extractSchedules(pages);
    }
    issues.push(...schedule.issues);const nodes=schedule.nodes;
    attachSymbols(pages,nodes,schedule.regions,issues);
    discoverPassives(pages,nodes,schedule.regions,issues);
    const edges=proposeEdges(pages,nodes,issues);attachCableEvidence(pages,edges,schedule.regions);
    if(!nodes.length)issues.push('No active/EOL identifiers found. Add identities and bind symbols manually.');
    if(nodes.length)issues.push('Imported identities and symbols are provisional. Select equipment and confirm every symbol; schedule models and RF design levels are not imported as equipment or readings.');
    onProgress?.({phase:'complete',page:pdf.numPages,total:pdf.numPages});
    return {sha256,pages,nodes,edges,issues};
  }finally{await pdf.destroy();}
}
export async function renderPage(bytes,pageNumber,canvas,{hideAnnotations=false}={}) {
  if(!canvas?.getContext)throw new TypeError('A canvas is required to render a PDF page.');
  const pdf=await open(bytes);
  try{
    if(!Number.isInteger(pageNumber)||pageNumber<1||pageNumber>pdf.numPages)throw new RangeError('PDF page is out of range.');
    const page=await pdf.getPage(pageNumber),base=page.getViewport({scale:1}),desired=canvas.clientWidth||canvas.width||1200;
    const pixelRatio=Math.min(globalThis.devicePixelRatio||1,2),scale=Math.min(3,Math.max(.1,desired/base.width*pixelRatio),Math.sqrt(16000000/(base.width*base.height)));
    const viewport=page.getViewport({scale});canvas.width=Math.max(1,Math.round(viewport.width));canvas.height=Math.max(1,Math.round(viewport.height));
    await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)',...(hideAnnotations?{annotationMode:reader().AnnotationMode?.DISABLE??0}:{})}).promise;
    const content=await page.getTextContent();const textBounds=content.items.filter(t=>typeof t.str==='string'&&t.str.trim()).map(t=>normalizedText(t,base)).map(t=>({x:t.x*canvas.width,y:t.y*canvas.height,width:t.width*canvas.width,height:t.height*canvas.height}));
    const annotations=await page.getAnnotations({intent:'display'});
    const annotationLabels=nativeAnnotations(annotations.filter(a=>['FreeText','Highlight','Stamp'].includes(a.subtype)&&typeof (a.contentsObj?.str??a.contents)==='string'&&clean(a.contentsObj?.str??a.contents)).slice(0,500),base)
      .filter(a=>a.rect.every(Number.isFinite)&&a.rect[2]>0&&a.rect[3]>0)
      .map((a,i)=>{const x=clamp(a.rect[0]),y=clamp(a.rect[1]);return {id:typeof a.id==='string'?a.id.slice(0,200):`annotation-${i}`,subtype:a.subtype,text:a.contents.slice(0,500),rect:[x,y,Math.min(clamp(a.rect[2]),1-x),Math.min(clamp(a.rect[3]),1-y)]};})
      .filter(a=>a.rect[2]>0&&a.rect[3]>0);
    // Annotation appearances can contain names even when Contents is empty.
    // Mask every visible annotation rectangle, not just movable text labels.
    const annotationBounds=nativeAnnotations(annotations.slice(0,500),base)
      .filter(a=>a.rect.every(Number.isFinite)&&a.rect[2]>0&&a.rect[3]>0)
      .map(a=>({x:a.rect[0]*canvas.width,y:a.rect[1]*canvas.height,width:a.rect[2]*canvas.width,height:a.rect[3]*canvas.height}));
    if(!hideAnnotations)textBounds.push(...annotationBounds);
    const annotationBoundsComplete=annotations.length<=500&&annotationBounds.length===annotations.length;
    return {pageNumber,width:base.width,height:base.height,rotation:page.rotate,userUnit:page.userUnit||1,scale,textBounds,textAvailable:textBounds.length>0&&annotationBoundsComplete,annotationLabels};
  }finally{await pdf.destroy();}
}
/** Render only the visible PDF region. No names or cropped coordinates enter scan transport. */
export async function renderMapViewport(bytes,pageNumber,canvas,{view,signal}={}) {
  const aborted=()=>{if(signal?.aborted)throw new DOMException('Map render cancelled.','AbortError');};aborted();
  if(!view||!['x','y','scale','mapWidth','mapHeight','width','height'].every(k=>Number.isFinite(view[k]))||view.scale<=0||view.mapWidth<=0||view.mapHeight<=0||view.width<=0||view.height<=0)throw new TypeError('Invalid map viewport.');
  const pdf=await open(bytes);let task;const cancel=()=>task?.cancel();
  try {
    aborted();if(!Number.isInteger(pageNumber)||pageNumber<1||pageNumber>pdf.numPages)throw new RangeError('PDF page is out of range.');
    const page=await pdf.getPage(pageNumber),base=page.getViewport({scale:1});aborted();
    const deviceScale=Math.min(globalThis.devicePixelRatio||1,2,Math.sqrt(4000000/(view.width*view.height)));
    canvas.width=Math.max(1,Math.round(view.width*deviceScale));canvas.height=Math.max(1,Math.round(view.height*deviceScale));
    const viewport=page.getViewport({scale:view.mapWidth/base.width*view.scale});
    signal?.addEventListener('abort',cancel,{once:true});aborted();
    task=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[deviceScale,0,0,deviceScale,view.x*deviceScale,view.y*deviceScale],background:'rgb(255,255,255)'});
    try {await task.promise;}catch(error){aborted();throw error;}aborted();
    return {width:view.width,height:view.height,deviceScale};
  }finally{signal?.removeEventListener('abort',cancel);await pdf.destroy();}
}
// Tombstones are compact summaries, not serialized solver results. Bound text
// before measuring it; the full evidence remains in the station and job views.
const printable=s=>String(s??'').replace(/[\u2010-\u2015]/g,'-').replace(/[^\x20-\x7e]/g,'?');
const brief=(value,limit=96)=>{
  const text=typeof value==='string'||typeof value==='number'?String(value):'';
  return printable(text.length>limit?text.slice(0,limit-3)+'...':text);
};
const level=value=>finite(value)?Number(value.toFixed(2)).toString():'unknown';
function sampleLines(samples) {
  let first,last,count=0,minimum=Infinity,maximum=-Infinity;
  for(const sample of Array.isArray(samples)?samples:[]){
    if(!Array.isArray(sample)||!finite(sample[0]))continue;
    count++;if(!first||sample[0]<first[0])first=sample;if(!last||sample[0]>last[0])last=sample;
    if(finite(sample[1])){minimum=Math.min(minimum,sample[1]);maximum=Math.max(maximum,sample[1]);}
  }
  if(!count)return 'missing';
  const endpoint=sample=>`${level(sample[0])} MHz: ${level(sample[1])}`;
  return `${endpoint(first)}${count>1?` | ${endpoint(last)}`:''} (${count} pts; ${finite(minimum)?`${level(minimum)}..${level(maximum)}`:'unknown'} range)`;
}
function tombstoneLines(node,evaluation) {
  const station=evaluation?.stations?.[node.id],recommendation=station?.recommendation,shared=recommendation?.shared;
  const lines=[`Carpe Noctum | ${brief(node.tag||node.name||node.id,64)}`,`${brief(node.name||node.tag||node.id,64)} | ${brief(node.modelId||'equipment unselected',40)}`];
  lines.push(`Calculated input dBmV: ${sampleLines(station?.input)}`);
  const ports=Object.entries(station?.outputs||{}).slice(0,3);
  if(ports.length)for(const [port,samples]of ports){
    lines.push(`${brief(port,12)} output dBmV: ${sampleLines(samples)}`);
    if(station.targets?.[port])lines.push(`${brief(port,12)} target dBmV: ${sampleLines(station.targets[port])}`);
  }else if(node.kind!=='eol')lines.push('Outputs: missing sweep / route / equipment');
  if(node.kind==='eol')lines.push('EOL calculated level; confirm measurement separately');
  lines.push(`Status: ${brief(station?.gainStatus||recommendation?.gainStatus||'unknown',24)}; shortfall ${level(station?.shortfall??recommendation?.shortfall)} dB; headroom unknown`);
  if(shared){
    lines.push(`Input pad: ${level(shared.inputPadDb)} dB | ${brief(shared.inputPadPartNumber||'part unknown',40)}`);
    lines.push(`EQ: ${brief(shared.eqPartNumber||shared.eqPartId||'unknown',48)} (${level(shared.eqNominalDb)} dB)`);
    lines.push(`Factory EQ ${level(shared.factoryEqDb)} dB; AGC pad ${level(shared.agcPadDb)} dB; director ${brief(shared.director||'unknown',28)}`);
  }else if(recommendation)lines.push('Parts: no supported recommendation; see station details.');
  const issues=station?.issues||[];
  for(const issue of issues.slice(0,2))lines.push(`Check: ${brief(typeof issue==='string'?issue:'Additional station issue; see station details.',96)}`);
  if(issues.length>2)lines.push(`${issues.length-2} more checks; see station details.`);
  return lines;
}
function endpointLevels(samples) {
  const values=(Array.isArray(samples)?samples:[]).filter(p=>Array.isArray(p)&&finite(p[0])).slice().sort((a,b)=>a[0]-b[0]);
  if(!values.length)return 'unknown';
  const value=p=>`${level(p[0])} MHz: ${level(p[1])}`;
  return value(values[0])+(values.length>1?` | ${value(values.at(-1))}`:'');
}
/** On-map summaries retain all physical legs; complete alignment evidence goes in reports. */
export function compactTombstoneLines(node,evaluation) {
  const station=evaluation?.stations?.[node.id],model=EQUIPMENT[node.modelId];
  const lines=[`Carpe Noctum | ${brief(node.tag||node.name||node.id,64)}`,brief(node.modelId||'equipment unselected',80),`Input dBmV: ${endpointLevels(station?.input)}`];
  const outputs=Object.keys(station?.outputs||{}),ports=outputs.length?outputs:model?.ports||[];
  for(const port of ports)lines.push(`${brief(port,12)} output dBmV: ${endpointLevels(station?.outputs?.[port])}`);
  if(!ports.length)lines.push('Outputs: unknown');
  lines.push(`Status: ${brief(station?.gainStatus||'unknown',32)}${finite(station?.shortfall)?`; shortfall ${level(station.shortfall)} dB`:''}`,'Full details: linked station report');
  return lines;
}
function wrapLines(lines,font,size,maxWidth) {
  const out=[],widths=new Map(),pairs=new Map(),width=Math.max(.1,maxWidth);
  const charWidth=c=>{if(!widths.has(c))widths.set(c,font.widthOfTextAtSize(c,size));return widths.get(c);};
  const addition=(previous,c)=>{
    if(!previous)return charWidth(c);
    const pair=previous+c;
    if(!pairs.has(pair))pairs.set(pair,font.widthOfTextAtSize(pair,size)-charWidth(previous));
    return pairs.get(pair);
  };
  // At most two display rows per summary line, and 32 rows overall. Each
  // character is visited once; even a pasted megabyte-long name is clipped
  // before entering this routine. Pair widths preserve Helvetica kerning.
  for(const raw of lines.slice(0,16)){
    const line=brief(raw,240);let current='',used=0,rows=0;
    for(let i=0;i<line.length;i++){
      const c=line[i],extra=addition(current.at(-1),c);
      if(current&&used+extra>width){
        if(rows===1){current=current.slice(0,-3)+'...';break;}
        out.push(current.trimEnd());rows++;current='';used=0;
      }
      if(!current&&c===' ')continue;
      used+=addition(current.at(-1),c);current+=c;
    }
    if(current)out.push(current.trimEnd());
  }
  return out;
}
function pageFrame(page,lib) {
  const crop=page.getCropBox(),media=page.getMediaBox(),x=Math.max(crop.x,media.x),y=Math.max(crop.y,media.y),right=Math.min(crop.x+crop.width,media.x+media.width),top=Math.min(crop.y+crop.height,media.y+media.height);
  const w=right-x,h=top-y;if(w<=0||h<=0)throw new Error('PDF page has an empty crop box.');
  const rotation=((page.getRotation().angle%360)+360)%360,userUnit=page.node.get(lib.PDFName.of('UserUnit'))?.asNumber?.()||1;
  const width=(rotation%180?h:w)*userUnit,height=(rotation%180?w:h)*userUnit;
  // Displayed bottom-left physical-point coordinates -> original PDF user space.
  const inv=rotation===90?[0,1/userUnit,-1/userUnit,0,x+w,y]:rotation===180?[-1/userUnit,0,0,-1/userUnit,x+w,y+h]:rotation===270?[0,-1/userUnit,1/userUnit,0,x,y+h]:[1/userUnit,0,0,1/userUnit,x,y];
  return {width,height,inv};
}
/** Exact shared preview/export rectangles in normalized displayed coordinates.
 * Font metrics come from the same pinned Helvetica embedder as the PDF writer. */
export function layoutTombstones(job,evaluation,{pageFrames}={}) {
  const lib=globalThis.PDFLib;
  if(!lib?.StandardFontEmbedder)throw new Error('The offline PDF writer is unavailable.');
  const font=lib.StandardFontEmbedder.for(lib.StandardFonts.Helvetica),pages=pageFrames||job.map?.pages||[],occupied=new Map(),layout=[];
  for(const node of job.nodes||[]){
    if(!['active','eol'].includes(node.kind)||node.map?.confirmed!==true)continue;
    const saved=job.placements?.[node.id],anchor=node.map,placement=saved||anchor,pageNumber=Number(placement.page??anchor.page);
    if(pageNumber!==Number(anchor.page))throw new Error(`The tombstone for ${node.tag||node.id} must remain on the same page as its symbol.`);
    const frame=pages.find(p=>p.pageNumber===pageNumber)||pages[pageNumber-1];
    if(!frame||!finite(frame.width)||!finite(frame.height)||frame.width<=0||frame.height<=0)throw new Error(`Invalid PDF placement page for ${node.tag||node.id}.`);
    const symbol=job.map?.pages?.find(p=>p.pageNumber===pageNumber)?.symbols?.find(s=>s.id===anchor.symbolId);
    const fontSize=8,padding=5;
    const minimumWidth=Math.min(180,frame.width),defaultWidth=Math.min(240,frame.width);
    const width=finite(placement.width)?clamp(placement.width*frame.width,minimumWidth,frame.width):defaultWidth;
    const lines=wrapLines(compactTombstoneLines(node,evaluation),font,fontSize,width-padding*2),height=lines.length*(fontSize*1.25)+padding*2;
    if(height>frame.height)throw new Error(`Page is too small for a readable tombstone for ${node.tag||node.id}. Use a larger map page.`);
    let x=clamp(finite(placement.x)?placement.x:0)*frame.width,y=clamp(finite(placement.y)?placement.y:0)*frame.height;
    if(!saved)x+=Math.max(fontSize,frame.width*.002);
    x=clamp(x,0,Math.max(0,frame.width-width));y=clamp(y,0,Math.max(0,frame.height-height));
    if(!saved){
      const boxes=occupied.get(pageNumber)||[];
      for(let k=0;k<boxes.length+1;k++){
        const hit=boxes.find(b=>x<b.x+b.width+fontSize&&x+width+fontSize>b.x&&y<b.y+b.height+fontSize&&y+height+fontSize>b.y);
        if(!hit)break;
        if(hit.y+hit.height+height+fontSize<=frame.height)y=hit.y+hit.height+fontSize;
        else{x=clamp(hit.x-width-fontSize,0,Math.max(0,frame.width-width));y=clamp(anchor.y*frame.height,0,Math.max(0,frame.height-height));}
      }
      boxes.push({x,y,width,height});occupied.set(pageNumber,boxes);
    }
    layout.push({nodeId:node.id,page:pageNumber,x:x/frame.width,y:y/frame.height,width:width/frame.width,height:height/frame.height,fontSize,padding,lines});
  }
  return layout;
}
/** Remove only a replaceable A# annotation tied to a confirmed active's
 * actual tombstone. This edits an in-memory copy, never the original attachment. */
function removeReplacedActiveAnnotations(doc,job,layout,frames,lib) {
  let removed=0;
  for(let pageIndex=0;pageIndex<doc.getPageCount();pageIndex++){
    const page=doc.getPage(pageIndex),array=page.node.Annots();if(!array)continue;
    const frame=frames[pageIndex],stored=job.map?.pages?.find(p=>p.pageNumber===pageIndex+1),candidates=[];
    const [a,b,c,d,e,f]=frame.inv,det=a*d-b*c;
    for(let i=0;i<array.size();i++){
      try{
        const ref=array.get(i),dict=doc.context.lookup(ref,lib.PDFDict);
        if(doc.context.lookup(dict.get(lib.PDFName.of('Subtype')))?.decodeText?.()!=='FreeText')continue;
        const tag=tagOf(doc.context.lookup(dict.get(lib.PDFName.of('Contents')))?.decodeText?.());if(!tag?.startsWith('A'))continue;
        const raw=doc.context.lookup(dict.get(lib.PDFName.of('Rect')),lib.PDFArray).asArray().map(v=>v.asNumber());
        if(raw.length!==4||!raw.every(finite)||!det)continue;
        const points=[[raw[0],raw[1]],[raw[0],raw[3]],[raw[2],raw[1]],[raw[2],raw[3]]].map(([x,y])=>[(d*(x-e)-c*(y-f))/det/frame.width,1-(-b*(x-e)+a*(y-f))/det/frame.height]);
        const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),rect={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
        if(rect.width<=0||rect.height<=0)continue;
        const id=Number.isInteger(ref.objectNumber)?`${ref.objectNumber}R${ref.generationNumber||''}`:null;
        const original=stored?.annotations?.find(annotation=>annotation.id===id);
        if(original&&(original.subtype!=='FreeText'||tagOf(original.contents)!==tag))continue;
        candidates.push({index:i,tag,rect,id});
      }catch{/* Malformed or unrelated annotations are preserved. */}
    }
    const selected=new Set();
    for(const box of layout.filter(box=>box.page===pageIndex+1)){
      const node=job.nodes.find(n=>n.id===box.nodeId);
      if(node?.kind!=='active'||node.map?.confirmed!==true)continue;
      const tag=tagOf(node.tag);if(!tag?.startsWith('A'))continue;
      const symbol=stored?.symbols?.find(s=>s.id===node.map.symbolId),bounds=node.map.labelBounds||symbol?.labelBounds;
      const matching=candidates.filter(candidate=>{
        if(candidate.tag!==tag||node.map.annotationId&&candidate.id!==node.map.annotationId)return false;
        const r=candidate.rect;
        if(bounds&&[bounds.x,bounds.y,bounds.width,bounds.height].every(finite))return Math.min(r.x+r.width,bounds.x+bounds.width)>Math.max(r.x,bounds.x)&&Math.min(r.y+r.height,bounds.y+bounds.height)>Math.max(r.y,bounds.y);
        return finite(node.map.x)&&finite(node.map.y)&&node.map.x>=r.x&&node.map.x<=r.x+r.width&&node.map.y>=r.y&&node.map.y<=r.y+r.height;
      });
      // Duplicate or overlapping labels remain unresolved rather than deleting
      // an unrelated annotation with the same printed identifier.
      if(matching.length===1)selected.add(matching[0].index);
    }
    for(const index of [...selected].sort((a,b)=>b-a)){array.remove(index);removed++;}
  }
  return removed;
}
async function originalMapCopy(bytes,job,evaluation){
  const source=bytesOf(bytes),expected=job?.map?.sha256;
  if(!expected||await hash(source)!==expected)throw new Error('Original PDF hash does not match this job. Restore its verified original before exporting.');
  const lib=globalThis.PDFLib;if(!lib?.PDFDocument)throw new Error('The offline PDF writer is unavailable.');
  const doc=await lib.PDFDocument.load(source,{updateMetadata:false});
  const frames=doc.getPages().map((p,i)=>({...pageFrame(p,lib),pageNumber:i+1}));
  const layout=layoutTombstones(job,evaluation,{pageFrames:frames});
  const removed=removeReplacedActiveAnnotations(doc,job,layout,frames,lib);
  return {source,lib,doc,frames,layout,removed};
}
/** UI renders this derived copy, then places its shared tombstone overlays.
 * Flattened labels cannot be removed; no pixels are painted over or invented. */
export async function prepareMapPreview(bytes,job,evaluation){
  const {source,doc,removed}=await originalMapCopy(bytes,job,evaluation);
  return removed?doc.save({useObjectStreams:true}):source;
}
function internalLink(doc,page,rect,destination,lib) {
  const link=doc.context.obj({Type:'Annot',Subtype:'Link',Rect:rect,Border:[0,0,0],Dest:destination});
  page.node.addAnnot(doc.context.register(link));
}
function pdfRectangle(frame,box) {
  const {x,y,width,height}=box,a=frame.inv;
  const top=frame.height-y*frame.height,bottom=top-height*frame.height,left=x*frame.width,right=left+width*frame.width;
  const points=[[left,bottom],[left,top],[right,bottom],[right,top]].map(([px,py])=>[a[0]*px+a[2]*py+a[4],a[1]*px+a[3]*py+a[5]]);
  return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
}
function stationReportLines(node,evaluation) {
  const station=evaluation?.stations?.[node.id],lines=tombstoneLines(node,evaluation).slice(1);
  lines.push('Installed settings (operator supplied):');
  for(const key of ['mode','director','directorReversed','inputPadDb','eqPartId','eqFamily','pilotMHz','availableGainDb','componentCompatibilityConfirmed']) {
    const value=node.settings?.[key];if(value!==undefined&&value!==null)lines.push(`${key}: ${brief(String(value),120)}`);
  }
  if(!node.settings||!Object.keys(node.settings).length)lines.push('Installed settings unknown.');
  for(const [port,reading] of Object.entries(node.readings||{}))for(const stage of ['before','after'])if(reading?.[stage]?.samples)lines.push(`Measured ${brief(port,12)} ${stage}: ${sampleLines(reading[stage].samples)}`);
  for(const [port,samples] of Object.entries(station?.targets||{}))lines.push(`${brief(port,12)} target dBmV: ${sampleLines(samples)}`);
  const issues=station?.issues||[];if(issues.length)lines.push('Checks and limitations:',...issues.slice(0,200).map(issue=>brief(typeof issue==='string'?issue:'Review station details.',240)));
  if(issues.length>200)lines.push(`${issues.length-200} additional checks remain in the app.`);
  lines.push('Unknown values require equipment, physical route or measured sweep confirmation.');
  return lines;
}
function appendStationReports(doc,job,evaluation,layout,frames,font,lib) {
  const reports=new Map();
  const newPage=()=>{if(doc.getPageCount()>=200)throw new Error('Export exceeds the 200-page local PDF limit, including station reports. Split the job into smaller map files.');return doc.addPage([612,792]);};
  for(const box of layout) {
    const node=job.nodes.find(n=>n.id===box.nodeId),sourcePage=doc.getPage(box.page-1),frame=frames[box.page-1];
    const returnRect=pdfRectangle(frame,box),returnDestination=[sourcePage.ref,lib.PDFName.of('FitR'),...returnRect];
    let report=newPage(),y=720;reports.set(node.id,report);
    const header=()=>{report.drawText(brief(`Station report | ${node.tag||node.name||node.id}`,96),{x:36,y:754,size:14,font});report.drawText(`Back to map page ${box.page}`,{x:36,y:735,size:9,font,color:lib.rgb(.1,.3,.6)});internalLink(doc,report,[34,731,220,747],returnDestination,lib);y=712;};
    header();
    for(const raw of stationReportLines(node,evaluation))for(const line of wrapLines([raw],font,9,540)) {
      if(y<40){report=newPage();header();}
      report.drawText(line,{x:36,y,size:9,font});y-=13;
    }
  }
  return reports;
}
/** Reloading a verified original on every export prevents duplicate marks. */
export async function exportMap(bytes,job,evaluation) {
  const {lib,doc,frames,layout}=await originalMapCopy(bytes,job,evaluation),font=await doc.embedFont(lib.StandardFonts.Helvetica);
  const reports=appendStationReports(doc,job,evaluation,layout,frames,font,lib);
  for(const box of layout){
    const page=doc.getPage(box.page-1),frame=frames[box.page-1],node=job.nodes.find(n=>n.id===box.nodeId),anchor=node.map;
    const {fontSize,padding,lines}=box,x=box.x*frame.width,y=box.y*frame.height,width=box.width*frame.width,height=box.height*frame.height;
    page.pushOperators(lib.pushGraphicsState(),lib.concatTransformationMatrix(...frame.inv));
    const bottom=frame.height-y-height;
    page.drawRectangle({x,y:bottom,width,height,color:lib.rgb(1,1,1),opacity:.94,borderColor:lib.rgb(.1,.23,.33),borderWidth:Math.max(.1,fontSize*.1)});
    lines.forEach((line,i)=>page.drawText(line,{x:x+padding,y:frame.height-y-padding-fontSize-i*fontSize*1.25,size:fontSize,font,color:lib.rgb(.04,.09,.15)}));
    const ax=anchor.x*frame.width,ay=(1-anchor.y)*frame.height,bx=clamp(ax,x,x+width),by=clamp(ay,bottom,bottom+height);
    if(Math.hypot(ax-bx,ay-by)>fontSize)page.drawLine({start:{x:ax,y:ay},end:{x:bx,y:by},thickness:Math.max(.1,fontSize*.07),color:lib.rgb(.1,.23,.33)});
    page.pushOperators(lib.popGraphicsState());
    internalLink(doc,page,pdfRectangle(frame,box),[reports.get(node.id).ref,lib.PDFName.of('Fit')],lib);
  }
  return doc.save({useObjectStreams:true});
}
