// Native PDF geometry is evidence for provisional stations and cable contacts.
// Coordinates on input/output are displayed-page fractions; distances are page units.
const center = b => [b.x+b.width/2,b.y+b.height/2];
const dist = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
const pxBounds = (v,page) => ({x:v.bounds.x*page.width,y:v.bounds.y*page.height,width:v.bounds.width*page.width,height:v.bounds.height*page.height});
const intersects = (a,b,pad=0) => a.x<=b.x+b.width+pad&&b.x<=a.x+a.width+pad&&a.y<=b.y+b.height+pad&&b.y<=a.y+a.height+pad;
const expanded = (b,pad) => ({x:b.x-pad,y:b.y-pad,width:b.width+2*pad,height:b.height+2*pad});
const uniqueCorners = points => {const out=[];for(const p of points)if(!out.some(q=>dist(p,q)<.00005))out.push(p);return out.length;};
const loop = v => v.closed||(v.points.length>2&&dist(v.points[0],v.points.at(-1))<.00005);
// Some CAD exporters express straight-looking triangle sides as Beziers.
const triangle = v => loop(v)&&uniqueCorners(v.points)===3;
const rectangle = v => loop(v)&&uniqueCorners(v.points)===4&&!v.curved;
const round = (v,b) => loop(v)&&(v.curved||v.points.length>=12)&&b.width>1&&b.height>1&&b.width/b.height>.55&&b.width/b.height<1.6;
function elongatedRectangle(v,page) {
  if(!rectangle(v))return false;
  const corners=[];for(const p of v.points)if(!corners.some(q=>dist(p,q)<.00005))corners.push(p);
  const lengths=corners.map((p,i)=>dist([p[0]*page.width,p[1]*page.height],[corners[(i+1)%4][0]*page.width,corners[(i+1)%4][1]*page.height]));
  return Math.max(...lengths)>5&&Math.min(...lengths)>1&&Math.max(...lengths)/Math.min(...lengths)>1.45;
}
function insideTriangle(point,shape,page) {
  const corners=[];
  for(const p of shape.v.points)if(!corners.some(q=>dist(p,q)<.00005))corners.push(p);
  if(corners.length!==3)return false;
  const p=[point[0],point[1]],v=corners.map(q=>[q[0]*page.width,q[1]*page.height]);
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const orientation=Math.sign(cross(v[0],v[1],v[2]));
  return v.every((a,i)=>{const b=v[(i+1)%3];return orientation*cross(a,b,p)>=-.22*dist(a,b);});
}
function openTriangle(glyph,page,at) {
  const vertices=[],links=[],edges=[];
  const vertex=p=>{let i=vertices.findIndex(q=>dist(p,q)<.12);if(i<0){i=vertices.length;vertices.push(p);links.push([]);}return i;};
  for(const {v,b} of glyph){
    if(v.points.length!==2||v.closed||v.lineWidth<.03||v.lineWidth>.2||b.width+b.height>8)continue;
    const a=vertex([v.points[0][0]*page.width,v.points[0][1]*page.height]);
    const z=vertex([v.points[1][0]*page.width,v.points[1][1]*page.height]);
    if(a===z)continue;
    const id=edges.length;edges.push({a,b:z,id:v.id});links[a].push(id);links[z].push(id);
  }
  const results=[],seen=new Set();
  for(let start=0;start<vertices.length;start++){
    const walk=(atVertex,path,used)=>{
      if(path.length>10)return;
      for(const ei of links[atVertex]){
        if(used.has(ei))continue;
        const edge=edges[ei],next=edge.a===atVertex?edge.b:edge.a;
        if(next===start){
          if(path.length<3)continue;
          const ids=[...used,ei].sort((a,b)=>a-b),key=ids.join(',');if(seen.has(key))continue;seen.add(key);
          const points=path.map(i=>vertices[i]),corners=points.filter((p,i)=>{
            const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
            const a=[p[0]-prev[0],p[1]-prev[1]],b=[next[0]-p[0],next[1]-p[1]];
            const sine=Math.abs(a[0]*b[1]-a[1]*b[0])/(Math.hypot(...a)*Math.hypot(...b)||1);
            return sine>.16||a[0]*b[0]+a[1]*b[1]<0;
          });
          if(corners.length!==3)continue;
          const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]),box={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
          if(box.width<1||box.height<1||box.width>12||box.height>12||dist(center(box),at)>5)continue;
          results.push({b:box,v:{points:[...corners,corners[0]].map(p=>[p[0]/page.width,p[1]/page.height]),closed:true,curved:false,fill:null},ids:ids.map(i=>edges[i].id),synthetic:true});
          continue;
        }
        if(path.includes(next))continue;
        const nextUsed=new Set(used);nextUsed.add(ei);walk(next,[...path,next],nextUsed);
      }
    };
    walk(start,[start],new Set());
  }
  return results.sort((a,b)=>dist(center(a.b),at)-dist(center(b.b),at))[0]||null;
}

function localPaths(page,label) {
  const at=[(label.x+label.width/2)*page.width,(label.y+label.height/2)*page.height];
  const glyph=page.vectors.map(v=>({v,b:pxBounds(v,page)})).filter(({v,b})=>{
    if(b.width>22||b.height>22||b.width+b.height<.2)return false;
    if(!v.stroke&&!v.fill)return false;
    return intersects(b,{x:at[0],y:at[1],width:0,height:0},5);
  });
  return {at,glyph};
}

/** Find a compact symbol component around one printed or annotated identity. */
export function recognizeSymbol(page,label,{kind='active'}={}) {
  const {at,glyph}=localPaths(page,label),contours=glyph.filter(({v,b})=>loop(v)&&b.width>=.7&&b.height>=.7);
  const enclosing=contours.filter(({b})=>intersects(expanded(b,.8),{x:at[0],y:at[1],width:0,height:0}));
  let outer=(enclosing.length?enclosing:contours.filter(({b})=>dist(center(b),at)<5))
    .sort((a,b)=>b.b.width*b.b.height-a.b.width*a.b.height)[0];
  if(kind==='active'){
    const nodeOuter=contours.filter(({v,b})=>elongatedRectangle(v,page)&&intersects(expanded(b,.8),{x:at[0],y:at[1],width:0,height:0}))
      .find(({b})=>contours.some(r=>round(r.v,r.b)&&intersects(r.b,b))&&contours.some(t=>triangle(t.v)&&intersects(t.b,b)));
    const activeOuter=contours.filter(({v,b})=>triangle(v)&&!v.fill&&dist(center(b),at)<5)
      .sort((a,b)=>dist(center(a.b),at)-dist(center(b.b),at))[0];
    outer=nodeOuter||activeOuter||openTriangle(glyph,page,at)||null;
  }
  let box=outer?.b;
  if(!box&&kind!=='active'){
    // Some CAD glyphs are disjoint open segments. Group only short nearby strokes.
    const strokes=glyph.filter(({v,b})=>v.lineWidth>=.03&&b.width+b.height<8&&dist(center(b),at)<3.5);
    if(strokes.length){const x0=Math.min(...strokes.map(z=>z.b.x)),y0=Math.min(...strokes.map(z=>z.b.y));box={x:x0,y:y0,width:Math.max(...strokes.map(z=>z.b.x+z.b.width))-x0,height:Math.max(...strokes.map(z=>z.b.y+z.b.height))-y0};}
  }
  const selected=box?glyph.filter(({b})=>intersects(expanded(box,.35),b)&&b.width<box.width+2&&b.height<box.height+2):[];
  let symbolKind=kind==='eol'?'eol':'unknown';
  if(kind!=='eol'){
    const rects=selected.filter(({v})=>rectangle(v));
    const triangles=[...selected.filter(({v})=>triangle(v)),...(outer?.synthetic?[outer]:[])];
    const rounds=selected.filter(({v,b})=>round(v,b));
    const octagons=selected.filter(({v})=>loop(v)&&!v.curved&&uniqueCorners(v.points)===8);
    const node=rects.some(({v,b})=>elongatedRectangle(v,page)&&rounds.some(r=>intersects(r.b,b))&&triangles.some(t=>intersects(t.b,b)));
    if(node)symbolKind='node';
    else if(rounds.length&&(!outer||!triangle(outer.v))){
      const ring=rounds.sort((a,b)=>b.b.width*b.b.height-a.b.width*a.b.height)[0];
      const innerFill=selected.filter(({v,b})=>!!v.fill&&intersects(ring.b,b));
      const area=ring.b.width*ring.b.height;
      const largeFill=innerFill.some(({b})=>b.width*b.height>area*.7);
      const halfFill=innerFill.some(({b})=>b.width*b.height>area*.12);
      if(largeFill)symbolKind='splitter2';
      else if(halfFill)symbolKind='coupler';
      else symbolKind='tap2';
    }else if(triangles.length){
      const outerTri=triangles.filter(({v})=>!v.fill).sort((a,b)=>b.b.width*b.b.height-a.b.width*a.b.height)[0];
      const innerBlack=triangles.some(({v,b})=>!!v.fill&&(!outerTri||(
        insideTriangle(center(b),outerTri,page)&&
        b.width*b.height<=outerTri.b.width*outerTri.b.height*1.1)));
      symbolKind=innerBlack?'amplifier':'lineExtender';
    }else if(octagons.length)symbolKind='tap8';
    else if(rects.length)symbolKind='tap4';
  }
  if(!box)return {symbolKind,symbolBounds:null,vectorIds:[],confidence:'label-only'};
  const symbolBounds={x:box.x/page.width,y:box.y/page.height,width:box.width/page.width,height:box.height/page.height};
  return {symbolKind,symbolBounds,outlinePoints:outer?.v?.points||null,
    vectorIds:[...new Set([...selected.map(z=>z.v.id),...(outer?.ids||[])])].slice(0,24),confidence:outer?.synthetic?'reconstructed-contour':outer?'contour':'glyph-strokes'};
}

const pathLength=(v,page)=>v.points.reduce((n,p,i)=>i?n+dist([p[0]*page.width,p[1]*page.height],[v.points[i-1][0]*page.width,v.points[i-1][1]*page.height]):0,0);
/** Return plausible routes; the caller must still prove contacts at both ends. */
export function cablePathCandidates(page) {
  const diag=Math.hypot(page.width,page.height);
  return page.vectors.filter(v=>{
    if(!v.stroke||v.fill||loop(v)||v.points.length<2||v.lineWidth<.003)return false;
    if(v.points.some(p=>!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<-.005||p[0]>1.005||p[1]<-.005||p[1]>1.005))return false;
    const length=pathLength(v,page);
    if(length<3||length>diag*.85)return false;
    return v.lineWidth<=.04||(length>=25&&v.lineWidth<=2);
  });
}

function pointBoxDistance(p,b) {
  const x=Math.max(b.x,Math.min(p[0],b.x+b.width)),y=Math.max(b.y,Math.min(p[1],b.y+b.height));
  return dist(p,[x,y]);
}

/** Contact to outer equipment contour, never to label center when a contour exists. */
export function contactDistance(endpoint,symbol,page) {
  const p=[endpoint[0]*page.width,endpoint[1]*page.height],b=symbol.symbolBounds;
  if(symbol.outlinePoints?.length>1){
    const points=symbol.outlinePoints.map(q=>[q[0]*page.width,q[1]*page.height]);
    let nearest=Infinity;
    for(let i=0;i<points.length;i++){
      const a=points[i],z=points[(i+1)%points.length],dx=z[0]-a[0],dy=z[1]-a[1],den=dx*dx+dy*dy;
      const t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;
      nearest=Math.min(nearest,dist(p,[a[0]+t*dx,a[1]+t*dy]));
    }
    return nearest;
  }
  if(b){const box={x:b.x*page.width,y:b.y*page.height,width:b.width*page.width,height:b.height*page.height};return pointBoxDistance(p,box);}
  const l=symbol.labelBounds;
  return dist(p,[(l.x+l.width/2)*page.width,(l.y+l.height/2)*page.height]);
}

/** Reject an interior director or numeral before proposing an independent passive. */
export function pointInsideContour(point,symbol) {
  const points=symbol.outlinePoints;if(!Array.isArray(points)||points.length<3)return false;
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j],crosses=(a[1]>point[1])!==(b[1]>point[1]);
    if(crosses&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
