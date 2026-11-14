'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{createHash}=require('node:crypto');
const PDF=require('../night-sweep/vendor/map/pdf-lib.js');
test('PDF updates group legs beside confirmed symbols, retain markup and original, and reject a changed source',async()=>{
 assert.ok(fs.existsSync('night-sweep/map-pdf.js'),'offline PDF update API exists');
 const M=require('../night-sweep/map-pdf.js'),doc=await PDF.PDFDocument.create();
 const page=doc.addPage([600,800]);page.drawText('SYNTHETIC ORIGINAL MARKUP',{x:20,y:760,size:14});
 const annotation=doc.context.obj({Type:'Annot',Subtype:'Text',Rect:[20,700,50,730],Contents:PDF.PDFString.of('Existing annotation')});page.node.set(PDF.PDFName.of('Annots'),doc.context.obj([doc.context.register(annotation)]));
 const bytes=await doc.save(),sha=createHash('sha256').update(bytes).digest('hex');
 const binding=(symbolId,kind,x)=>({sourceId:sha,page:1,symbolId,exactName:symbolId,tag:symbolId,kind,position:{x,y:200},positionConfirmed:true,modelConfirmed:true,status:'installed'});
 const owner={setup:{lowF:54,highF:860},rows:[{id:'r1',name:'A1',device:'active_gm_hgd',mapImport:binding('A1','active',100),workbench:{records:{main:{before:{low:{input:10},high:{output:40}}},aux:{after:{low:{output:20}}}}}},{id:'r2',name:'E1',device:'none',terminal:true,mapImport:binding('E1','terminal',450)}],mapImportSource:{id:sha,bytes:bytes.length,name:'synthetic.pdf',type:'application/pdf',pages:[{number:1,width:600,height:800,pdf:{viewBox:[0,0,600,800],rotation:0,userUnit:1,viewportTransform:[1,0,0,-1,0,800],width:600,height:800}}]}};
 owner.setup.lowF=55;owner.rows[0].workbench.records.main.before.low.inputFrequency=54;
 const original=Buffer.from(bytes),before=JSON.stringify(owner),plan=M.plan(owner);assert.equal(plan.tombstones.length,2);assert.ok(plan.tombstones[0].lines.some(s=>s.includes('aux')));
 assert.match(plan.tombstones[0].lines.join(' '),/recorded IN MHz L\/H: 54\.0/);assert.match(plan.tombstones[0].lines.join(' '),/not current-marker comparisons/);
 const out=await M.exportPDF(bytes,owner),second=await M.exportPDF(bytes,owner);assert.deepEqual(Buffer.from(out),Buffer.from(second));assert.deepEqual(Buffer.from(bytes),original);assert.equal(JSON.stringify(owner),before);
 for(const result of [out,second]){const reopened=await PDF.PDFDocument.load(result);assert.equal(reopened.getPageCount(),1);assert.equal(reopened.getPage(0).node.Annots().size(),1);}
 owner.rows[0].workbench.modelId='active_gm_le_manual';const oldModel=M.plan(owner).tombstones[0].lines.join(' ');assert.match(oldModel,/Historical model/);assert.doesNotMatch(oldModel,/raw IN 10\.0/);delete owner.rows[0].workbench.modelId;
 await assert.rejects(()=>M.exportPDF(new Uint8Array([1,2,3]),owner),/original|checksum|source/i);
 owner.rows[0].mapImport.positionConfirmed=false;assert.equal(M.plan(owner).tombstones.length,1);
 owner.rows[0].mapImport.positionConfirmed=true;owner.rows[0].mapImport.positionReadable=false;assert.equal(M.plan(owner).tombstones.length,1);
 owner.mapImportSource.type='image/png';assert.throws(()=>M.plan(owner),/PDF/i);
});
