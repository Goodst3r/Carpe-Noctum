import { recognizePdfPages } from './map-ocr.mjs';
import { EQUIPMENT, CABLES } from './catalog.mjs';
/**
 * Immutable PDF adapter. PDF.js/PDFLib are supplied by the offline app shell.
 * Parsed pages use displayed (rotation/crop/UserUnit applied), top-left fractions:
 * {pageNumber,width,height,viewBox,rotation,userUnit,viewportTransform,
 *  text:[{str,x,y,width,height,baseline:[x,y],source:'native'}],
 *  vectors:[{id,points:[[x,y]],closed,curved,stroke,fill,lineWidth,bounds}],
 *  annotations:[{id,subtype,contents,rect:[x,y,w,h]}],scheduleRegions:[],symbols:[]}.
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
  if(pdf.numPages>20){await pdf.destroy();throw new Error('PDF exceeds the local limit of 20 pages.');}
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
    for(const t of page.text){
      if(inSchedule(t,page.pageNumber,regions))continue;
      const part=passiveParts.get(clean(t.str).toUpperCase());
      const tag=tagOf(t.str)||(part?`P${page.pageNumber}-${page.symbols.length+1}`:null);if(!tag)continue;
      let node=byTag.get(tag);
      if(part){node={id:nodeId(tag),tag,name:clean(t.str),kind:'passive',modelId:'',settings:{},evidence:{type:'native-part-label',text:clean(t.str),candidateModelIds:part}};nodes.push(node);}
      if(!node){node={id:nodeId(tag),tag,name:tag,kind:tag[0]==='A'?'active':'eol',modelId:'',settings:{}};nodes.push(node);byTag.set(tag,node);issues.push(`${tag}: map label has no matching schedule row; confirm its identity.`);}
      const c=center(t),fontHeight=Math.max(t.height*page.height,t.width*page.width/Math.max(t.str.length,1)),radius=Math.max(fontHeight*5,.5);
      const candidates=page.vectors.filter(v=>v.closed&&v.bounds.width*page.width<=radius*2&&v.bounds.height*page.height<=radius*2).map(v=>({v,d:Math.hypot((v.bounds.x+v.bounds.width/2-c[0])*page.width,(v.bounds.y+v.bounds.height/2-c[1])*page.height)})).filter(v=>v.d<radius).sort((a,b)=>a.d-b.d);
      const symbol={id:`p${page.pageNumber}-${tag}`,tag,nodeId:node.id,page:page.pageNumber,x:c[0],y:c[1],labelBounds:{x:t.x,y:t.y,width:t.width,height:t.height},vectorIds:candidates.slice(0,5).map(c=>c.v.id),source:t.source||'native',confidence:t.confidence??null,confirmed:false};
      page.symbols.push(symbol);
      if(node.map){issues.push(`${tag}: multiple native map labels; confirm the symbol on page ${page.pageNumber}.`);node.map.ambiguous=true;}
      else node.map={page:page.pageNumber,x:c[0],y:c[1],symbolId:symbol.id,source:symbol.source,confidence:symbol.confidence,confirmed:false};
    }
    page.scheduleRegions=regions.filter(r=>r.page===page.pageNumber);
  }
  for(const n of nodes)if(!n.map)issues.push(`${n.tag}: schedule identity has no native map symbol; place it manually.`);
}
function proposeEdges(pages,nodes,issues) {
  const edges=[];
  for(const page of pages){
    if(page.symbols.length<2)continue;
    const heights=page.symbols.map(s=>s.labelBounds.height*page.height).sort((a,b)=>a-b),font=heights[Math.floor(heights.length/2)]||2;
    const tolerance=Math.max(.02,font*.15),cellSize=tolerance*2,vertices=[],grid=new Map(),segments=[];
    const px=p=>[p[0]*page.width,p[1]*page.height];
    function vertex(p){
      const gx=Math.floor(p[0]/cellSize),gy=Math.floor(p[1]/cellSize);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const id of grid.get(`${gx+dx},${gy+dy}`)||[])if(distance(vertices[id].p,p)<=tolerance)return id;
      const id=vertices.length;vertices.push({p,links:[],nodes:[]});const key=`${gx},${gy}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(id);return id;
    }
    for(const path of page.vectors){
      if(!path.stroke||path.closed||path.fill||path.lineWidth>font*2.5)continue;
      for(let k=1;k<path.points.length;k++){
        const p=px(path.points[k-1]),q=px(path.points[k]),len=distance(p,q);
        if(len<tolerance||len>Math.max(page.width,page.height)*.85)continue;
        const a=vertex(p),b=vertex(q),segment={a,b,pathId:path.id,length:len,curved:path.curved};
        segments.push(segment);vertices[a].links.push({to:b,segment});vertices[b].links.push({to:a,segment});
      }
    }
    const bindings=[];
    for(const symbol of page.symbols){
      const p=px([symbol.x,symbol.y]),radius=Math.max(font*4,1);
      const nearby=vertices.map((v,id)=>({id,d:distance(v.p,p)})).filter(v=>v.d<=radius).sort((a,b)=>a.d-b.d);
      if(!nearby.length)continue;
      const closest=nearby[0];vertices[closest.id].nodes.push(symbol.nodeId);bindings.push({symbol,vertex:closest.id});
      symbol.lineworkBinding={vertex:closest.id,distance:closest.d,candidates:nearby.slice(0,4).map(v=>v.id),confirmed:false};
    }
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
        for(const link of v.links)if(!visited.has(link.to)){visited.add(link.to);queue.push({v:link.to,path:[...item.path,link.segment.pathId],length:item.length+link.segment.length});}
      }
    }
    // Proper interior crossings are recorded without connecting their segments.
    // Spatial bins keep the native CAD page check bounded on mobile hardware.
    const bins=new Map(),checked=new Set(),crossings=[];const size=Math.max(page.width,page.height)/70;let checks=0;
    for(let i=0;i<segments.length;i++){
      const s=segments[i],a=vertices[s.a].p,b=vertices[s.b].p;
      const x0=Math.floor(Math.min(a[0],b[0])/size),x1=Math.floor(Math.max(a[0],b[0])/size),y0=Math.floor(Math.min(a[1],b[1])/size),y1=Math.floor(Math.max(a[1],b[1])/size);
      if((x1-x0+1)*(y1-y0+1)>500)continue;
      for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
        const key=`${x},${y}`,prior=bins.get(key)||[];
        if(checks<200000&&crossings.length<100)for(const j of prior){
          const pair=`${j}:${i}`;if(checked.has(pair))continue;checked.add(pair);checks++;
          const t=segments[j];if(s.pathId===t.pathId||s.a===t.a||s.a===t.b||s.b===t.a||s.b===t.b||s.curved||t.curved)continue;
          const c=vertices[t.a].p,d=vertices[t.b].p,ab=[b[0]-a[0],b[1]-a[1]],cd=[d[0]-c[0],d[1]-c[1]],den=ab[0]*cd[1]-ab[1]*cd[0];if(Math.abs(den)<1e-8)continue;
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
    const edges=proposeEdges(pages,nodes,issues);attachCableEvidence(pages,edges,schedule.regions);
    if(!nodes.length)issues.push('No active/EOL identifiers found. Add identities and bind symbols manually.');
    if(nodes.length)issues.push('Imported identities and symbols are provisional. Select equipment and confirm every symbol; schedule models and RF design levels are not imported as equipment or readings.');
    onProgress?.({phase:'complete',page:pdf.numPages,total:pdf.numPages});
    return {sha256,pages,nodes,edges,issues};
  }finally{await pdf.destroy();}
}
export async function renderPage(bytes,pageNumber,canvas) {
  if(!canvas?.getContext)throw new TypeError('A canvas is required to render a PDF page.');
  const pdf=await open(bytes);
  try{
    if(!Number.isInteger(pageNumber)||pageNumber<1||pageNumber>pdf.numPages)throw new RangeError('PDF page is out of range.');
    const page=await pdf.getPage(pageNumber),base=page.getViewport({scale:1}),desired=canvas.clientWidth||canvas.width||1200;
    const pixelRatio=Math.min(globalThis.devicePixelRatio||1,2),scale=Math.min(3,Math.max(.1,desired/base.width*pixelRatio),Math.sqrt(16000000/(base.width*base.height)));
    const viewport=page.getViewport({scale});canvas.width=Math.max(1,Math.round(viewport.width));canvas.height=Math.max(1,Math.round(viewport.height));
    await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)'}).promise;
    const content=await page.getTextContent();const textBounds=content.items.filter(t=>typeof t.str==='string'&&t.str.trim()).map(t=>normalizedText(t,base)).map(t=>({x:t.x*canvas.width,y:t.y*canvas.height,width:t.width*canvas.width,height:t.height*canvas.height}));
    return {pageNumber,width:base.width,height:base.height,rotation:page.rotate,userUnit:page.userUnit||1,scale,textBounds,textAvailable:textBounds.length>0};
  }finally{await pdf.destroy();}
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
    const labelHeight=(anchor.labelBounds||symbol?.labelBounds)?.height*frame.height;
    let fontSize=finite(labelHeight)?clamp(labelHeight*.85,.7,8):5.5;
    const padding=Math.max(.7,fontSize*.7),defaultWidth=finite(labelHeight)?Math.max(24,labelHeight*42):240;
    const width=finite(placement.width)?clamp(placement.width,.05,1)*frame.width:Math.min(defaultWidth,frame.width*.32);
    let lines=wrapLines(tombstoneLines(node,evaluation),font,fontSize,width-padding*2),height=lines.length*(fontSize*1.25)+padding*2;
    if(height>frame.height*.95){fontSize*=frame.height*.95/height;lines=wrapLines(tombstoneLines(node,evaluation),font,fontSize,width-padding*2);height=lines.length*fontSize*1.25+padding*2;}
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
/** Reloading a verified original on every export prevents duplicate marks. */
export async function exportMap(bytes,job,evaluation) {
  const source=bytesOf(bytes),expected=job?.map?.sha256;
  if(!expected||await hash(source)!==expected)throw new Error('Original PDF hash does not match this job. Restore its verified original before exporting.');
  const lib=globalThis.PDFLib;if(!lib?.PDFDocument)throw new Error('The offline PDF writer is unavailable.');
  const doc=await lib.PDFDocument.load(source,{updateMetadata:false}),font=await doc.embedFont(lib.StandardFonts.Helvetica);
  const frames=doc.getPages().map((p,i)=>({...pageFrame(p,lib),pageNumber:i+1}));
  for(const box of layoutTombstones(job,evaluation,{pageFrames:frames})){
    const page=doc.getPage(box.page-1),frame=frames[box.page-1],node=job.nodes.find(n=>n.id===box.nodeId),anchor=node.map;
    const {fontSize,padding,lines}=box,x=box.x*frame.width,y=box.y*frame.height,width=box.width*frame.width,height=box.height*frame.height;
    page.pushOperators(lib.pushGraphicsState(),lib.concatTransformationMatrix(...frame.inv));
    const bottom=frame.height-y-height;
    page.drawRectangle({x,y:bottom,width,height,color:lib.rgb(1,1,1),opacity:.94,borderColor:lib.rgb(.1,.23,.33),borderWidth:Math.max(.1,fontSize*.1)});
    lines.forEach((line,i)=>page.drawText(line,{x:x+padding,y:frame.height-y-padding-fontSize-i*fontSize*1.25,size:fontSize,font,color:lib.rgb(.04,.09,.15)}));
    const ax=anchor.x*frame.width,ay=(1-anchor.y)*frame.height,bx=clamp(ax,x,x+width),by=clamp(ay,bottom,bottom+height);
    if(Math.hypot(ax-bx,ay-by)>fontSize)page.drawLine({start:{x:ax,y:ay},end:{x:bx,y:by},thickness:Math.max(.1,fontSize*.07),color:lib.rgb(.1,.23,.33)});
    page.pushOperators(lib.popGraphicsState());
  }
  return doc.save({useObjectStreams:true});
}
