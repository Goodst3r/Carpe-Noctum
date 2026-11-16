import test from 'node:test';
import assert from 'node:assert/strict';
import {recognizeSymbol,cablePathCandidates,contactDistance} from '../app/map-geometry.mjs';
import {PDFDocument,StandardFonts,PDFName,PDFString,degrees,moveTo,lineTo,closePath,stroke,setLineWidth} from 'pdf-lib';
import {DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});
globalThis.pdfjsLib=await import('pdfjs-dist/legacy/build/pdf.mjs');
const {importMap}=await import('../app/maps.mjs');

const page={width:100,height:100,vectors:[]};
const path=(id,xy,{closed=true,curved=false,fill=null,stroke='#000000',lineWidth=.07}={})=>{
  const points=xy.map(([x,y])=>[x/100,y/100]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return {id,points,closed,curved,fill,stroke,lineWidth,bounds:{x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)}};
};
const label=(x=50,y=50)=>({x:x/100-.005,y:y/100-.005,width:.01,height:.01});
const circle=(x,y,r,n=32)=>Array.from({length:n+1},(_,i)=>[x+r*Math.cos(i*2*Math.PI/n),y+r*Math.sin(i*2*Math.PI/n)]);
const nativePath=(pdfPage,xy,width=.07)=>{pdfPage.pushOperators(setLineWidth(width),moveTo(...xy[0]),...xy.slice(1).map(p=>lineTo(...p)),closePath(),stroke());};
const nativeAnnotation=(doc,pdfPage,contents,rect)=>{const value=doc.context.obj({Type:'Annot',Subtype:'FreeText',Rect:rect,Contents:PDFString.of(contents),DA:PDFString.of('/Helv 10 Tf 0 g')});pdfPage.node.addAnnot(doc.context.register(value));};

test('composite node retains outer bounds while cable contacts sit on its perimeter',()=>{
  const p={...page,vectors:[
    path('outer',[[47,44],[53,44],[53,56],[47,56],[47,44]]),
    path('upper',circle(50,48,2),{curved:true}),
    path('lower',[[48,53],[52,53],[50,55],[48,53]]),
    path('black',[[49,47],[51,47],[50,48],[49,47]],{fill:'#000000'}),
    path('cable',[[40,48],[46.6,48]],{closed:false,lineWidth:.01})
  ]};
  const symbol=recognizeSymbol(p,label(),{kind:'active'});
  assert.equal(symbol.symbolKind,'node');assert.ok(symbol.vectorIds.includes('outer'));
  assert.ok(Math.abs(symbol.symbolBounds.x-.47)<1e-9);
  assert.ok(contactDistance([.466,.48],symbol,p)<.5);
  assert.deepEqual(cablePathCandidates(p).map(v=>v.id),['cable']);
});

test('closed contour contact includes the implicit final edge',()=>{
  const p={...page,vectors:[path('triangle',[[47,47],[53,50],[47,53]],{closed:true})]};
  const symbol=recognizeSymbol(p,label(),{kind:'active'});
  assert.equal(symbol.symbolKind,'lineExtender');
  assert.ok(contactDistance([.47,.50],symbol,p)<.001);
});

test('compound node remains a node across right-angle and oblique PDF rotations',()=>{
  const rotate=(xy,degrees)=>xy.map(([x,y])=>{const a=degrees*Math.PI/180,dx=x-50,dy=y-50;return [50+dx*Math.cos(a)-dy*Math.sin(a),50+dx*Math.sin(a)+dy*Math.cos(a)];});
  for(const angle of [0,90,180,270,40]){
    const p={...page,vectors:[
      path('outer',rotate([[47,44],[53,44],[53,56],[47,56],[47,44]],angle)),
      path('upper',rotate(circle(50,48,2),angle),{curved:true}),
      path('lower',rotate([[48,53],[52,53],[50,55],[48,53]],angle))
    ]};
    assert.equal(recognizeSymbol(p,label(),{kind:'active'}).symbolKind,'node',`rotation ${angle}`);
  }
});

test('filled inner triangle distinguishes an amplifier from a hollow line extender',()=>{
  const outer=path('outer',[[47,47],[53,50],[47,53],[47,47]]);
  const black=path('black',[[48,49],[50,50],[48,51],[48,49]],{fill:'#000000'});
  assert.equal(recognizeSymbol({...page,vectors:[outer]},label(),{kind:'active'}).symbolKind,'lineExtender');
  assert.equal(recognizeSymbol({...page,vectors:[outer,black]},label(),{kind:'active'}).symbolKind,'amplifier');
});

test('active annotation selects a farther amplifier triangle over an adjacent numbered tap',()=>{
  const ring=path('tap',circle(46,50,2),{curved:true});
  const outer=path('amp',[[50,47],[56,50],[50,53],[50,47]]);
  const black=path('black',[[51,49],[53,50],[51,51],[51,49]],{fill:'#000000'});
  const symbol=recognizeSymbol({...page,vectors:[ring,outer,black]},label(48.5,50),{kind:'active'});
  assert.equal(symbol.symbolKind,'amplifier');
  assert.ok(symbol.symbolBounds.x>=.5);assert.ok(symbol.vectorIds.includes('amp'));
  assert.ok(contactDistance([.555,.475],symbol,page)>1,'an endpoint inside the bbox but outside the triangle is not an active contact');
  assert.notEqual(recognizeSymbol({...page,vectors:[ring]},label(48,50),{kind:'active'}).symbolKind,'tap2');
});

test('open CAD segments reconstruct a hollow active triangle',()=>{
  const points=[[[48,47],[50,48.5]],[[50,48.5],[52,50]],[[52,50],[50,51.5]],[[50,51.5],[48,53]],[[48,53],[48,50]],[[48,50],[48,47]]];
  const p={...page,vectors:points.map((xy,i)=>path(`segment-${i}`,xy,{closed:false}))};
  const symbol=recognizeSymbol(p,label(49,50),{kind:'active'});
  assert.equal(symbol.symbolKind,'lineExtender');
  assert.equal(symbol.confidence,'reconstructed-contour');
  assert.ok(symbol.vectorIds.includes('segment-0'));
});

test('circle, square, octagon, solid disk and half-filled disk give distinct passive motifs',()=>{
  const ring=path('ring',circle(50,50,3),{curved:true});
  const square=path('square',[[47,47],[53,47],[53,53],[47,53],[47,47]]);
  const octagon=path('oct',Array.from({length:9},(_,i)=>[50+3*Math.cos(i*2*Math.PI/8),50+3*Math.sin(i*2*Math.PI/8)]));
  const full=path('full',circle(50,50,2.8),{curved:true,fill:'#000000'});
  const half=path('half',[[47.5,50],[50,47.5],[52.5,50],[47.5,50]],{curved:true,fill:'#000000'});
  assert.equal(recognizeSymbol({...page,vectors:[ring]},label(),{kind:'passive'}).symbolKind,'tap2');
  assert.equal(recognizeSymbol({...page,vectors:[square]},label(),{kind:'passive'}).symbolKind,'tap4');
  assert.equal(recognizeSymbol({...page,vectors:[octagon]},label(),{kind:'passive'}).symbolKind,'tap8');
  assert.equal(recognizeSymbol({...page,vectors:[ring,full]},label(),{kind:'passive'}).symbolKind,'splitter2');
  assert.equal(recognizeSymbol({...page,vectors:[ring,half]},label(),{kind:'passive'}).symbolKind,'coupler');
});

test('closed outlines and out-of-page strokes cannot be traced as cable routes',()=>{
  const loop=path('building',[[10,10],[90,10],[90,90],[10,90],[10,10]]);
  const huge=path('bad',[[10,10],[100000,10]],{closed:false,lineWidth:.005});
  const cable=path('cable',[[10,50],[90,50]],{closed:false,lineWidth:.01});
  assert.deepEqual(cablePathCandidates({...page,vectors:[loop,huge,cable]}).map(v=>v.id),['cable']);
});

test('native PDF closePath supplies its implicit triangle side as a cable contact',async()=>{
  const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica),map=d.addPage([400,400]);
  nativePath(map,[[247,47],[253,50],[247,53]]);
  nativeAnnotation(d,map,'A1',[248,48,251,52]);
  map.drawText('E1',{x:38,y:47,size:10,font});
  map.pushOperators(setLineWidth(.01),moveTo(247,50),lineTo(50,50),stroke());
  const active=d.addPage([1000,800]);for(const [text,x,y]of [['ACTIVES - 1',10,760],['TAG',10,720],['NAME',120,720],['A1',10,680],['SYNTHETIC',110,680]])active.drawText(text,{x,y,size:12,font});
  const eol=d.addPage([1000,800]);for(const [text,x,y]of [['EOL - 1',10,760],['TAG',10,720],['E1',10,680]])eol.drawText(text,{x,y,size:12,font});
  const result=await importMap(await d.save()),triangle=result.pages[0].vectors.find(v=>v.closed&&v.points.length===3);
  assert.ok(triangle,'PDF.js extracts the three-point close-path');
  assert.equal(result.nodes.find(n=>n.tag==='A1').map.symbolKind,'lineExtender');
  assert.ok(result.nodes.find(n=>n.tag==='A1').map.attachmentPoints.length>0);
  assert.ok(result.edges.some(e=>[e.from,e.to].sort().join('|')==='map-a1|map-e1'));
});

test('native PDF page rotations preserve compound node recognition',async()=>{
  for(const angle of [0,90,180,270]){
    const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica),map=d.addPage([400,400]);map.setRotation(degrees(angle));
    nativePath(map,[[197,194],[203,194],[203,206],[197,206]]);
    nativePath(map,circle(200,203,2,16).slice(0,-1));
    nativePath(map,[[198,197],[202,197],[200,195]]);
    nativeAnnotation(d,map,'A1',[199,199,201,201]);
    const active=d.addPage([1000,800]);for(const [text,x,y]of [['ACTIVES - 1',10,760],['TAG',10,720],['NAME',120,720],['A1',10,680],['SYNTHETIC',110,680]])active.drawText(text,{x,y,size:12,font});
    const result=await importMap(await d.save()),node=result.nodes.find(n=>n.tag==='A1');
    assert.equal(node.map.symbolKind,'node',`PDF page rotation ${angle}`);
    assert.ok(node.map.symbolBounds,`PDF page rotation ${angle} retains outer contour`);
  }
});

test('E schedule annotations are placed provisionally while an unmarked cable crossing stays disconnected',async()=>{
  const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica),map=d.addPage([400,400]);
  map.drawText('A1',{x:52,y:198,size:10,font});
  map.drawLine({start:{x:66,y:200},end:{x:345,y:200},thickness:.01});
  map.drawLine({start:{x:200,y:100},end:{x:200,y:300},thickness:.01});
  const annotations=[['E1',[340,195,355,205]],['E2',[194,295,207,305]],['E999',[295,95,315,105]]].map(([contents,rect])=>{
    const value=d.context.obj({Type:'Annot',Subtype:'FreeText',Rect:rect,Contents:PDFString.of(contents),DA:PDFString.of('/Helv 10 Tf 0 g')});
    return d.context.register(value);
  });
  map.node.set(PDFName.of('Annots'),d.context.obj(annotations));
  const schedule=d.addPage([1000,800]);
  for(const [text,x,y]of [['ACTIVES - 1',10,760],['TAG',10,720],['NAME',120,720],['A1',10,680],['SYNTHETIC',110,680]])schedule.drawText(text,{x,y,size:12,font});
  const eol=d.addPage([1000,800]);
  for(const [text,x,y]of [['EOL - 1',10,760],['TAG',10,720],['E1',10,680],['E2',10,640]])eol.drawText(text,{x,y,size:12,font});
  const result=await importMap(await d.save());
  assert.equal(result.nodes.filter(n=>n.map).length,4);
  for(const tag of ['E1','E2']){const n=result.nodes.find(n=>n.tag===tag);assert.equal(n.map.source,'annotation');assert.ok(n.map.annotationId);assert.ok(n.map.labelBounds);assert.equal(n.map.symbolKind,'eol');assert.equal(n.map.scheduleMatched,true);assert.equal(n.map.confirmed,false);}
  assert.ok(result.edges.some(e=>[e.from,e.to].sort().join('|')==='map-a1|map-e1'));
  assert.ok(result.edges.every(e=>![e.from,e.to].includes('map-e2')));
  assert.ok(result.edges.every(e=>!e.confirmed&&!e.port&&!e.cableId&&e.lengthFt===null));
  const orphan=result.nodes.find(n=>n.tag==='E999');
  assert.equal(orphan.kind,'eol');assert.equal(orphan.schedule,undefined);assert.equal(orphan.modelId,'');
  assert.equal(orphan.map.source,'annotation');assert.equal(orphan.map.scheduleMatched,false);assert.equal(orphan.map.confirmed,false);
  assert.equal(orphan.evidence.type,'unmatched-map-label');
  assert.ok(result.issues.some(issue=>issue.includes('E999')&&issue.includes('no matching schedule row')));
});
