'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
test('OCR draft geometry preserves branches without confirming unreadable symbols', () => {
const context = {console};
vm.createContext(context);
vm.runInContext(fs.readFileSync('night-sweep/map-import.js', 'utf8'), context);
const M = context.NightSweepMapImport;
const PDF = require('../night-sweep/map-pdf.js');
const token = (text, x, y) => ({text, x, y, w:20, h:12});
const schedule = [token('NAME',0,20),token('TAG',200,20),token('MODEL',300,20)];
for (const [i,name,tag,model] of [
  [0,'Launch','N1','NODE'],[1,'Branch Splitter','S1','2-WAY SPLITTER'],
  [2,'East Amp','A1','HGD'],[3,'South Amp','A2','LE'],[4,'Unlocated Amp','Z1','HGD'],
]) schedule.push(token(name,0,40+i*20),token(tag,200,40+i*20),token(model,300,40+i*20));
const segments = [{x1:0,y1:250,x2:200,y2:250},{x1:200,y1:250,x2:400,y2:250},{x1:200,y1:250,x2:200,y2:450}];
const diagram = [token('N1',0,230),token('St',190,230),token('A1',390,230),token('A',190,430)];
const page = {number:1,nativeTokens:[],ocrTokens:[...schedule,...diagram],annotations:[],segments};
const candidates = M.analyzeDocument([page]);
const source = {id:'a'.repeat(64),type:'application/pdf'};
const byName = name => candidates.find(c=>c.name===name);
const draft = M.buildDraft({source,pages:[page],candidates},{launchId:byName('Launch').id,port:'Main',destinationIds:[byName('East Amp').id,byName('South Amp').id]});
const splitter = draft.rows.find(r=>r.name==='Branch Splitter');
assert.ok(splitter, 'An uncertain OCR TAG must retain the provisional shared splitter in the route draft');
const east = draft.rows.find(r=>r.name==='East Amp');
const south = draft.rows.find(r=>r.name==='South Amp');
assert.equal(east.parent,splitter.id+'::through');
assert.equal(south.parent,splitter.id+'::through');
for (const row of [splitter,south]) {
  assert.equal(row.mapImport.positionReadable,false,'A fuzzy OCR association is not an exact diagram location');
  assert.equal(row.mapImport.positionConfirmed,false);
  assert.equal(row.mapImport.connectionConfirmed,false);
  assert.equal(row.mapImport.unreachable,false,'Provisional OCR geometry remains usable for draft routing');
  assert.ok(row.mapImport.reasons.some(r=>r.includes('Diagram tag is uncertain')));
  assert.ok(row.mapImport.reasons.some(r=>r.includes('No exact diagram symbol match')));
}
assert.equal(byName('Unlocated Amp').positionReadable,false);
assert.notEqual(byName('Unlocated Amp').draftPositionReadable,true,'Missing locations must not receive provisional geometry');
// Even a forged confirmation must not promote unreadable OCR positions into PDF overlays.
const forged = {...south,mapImport:{...south.mapImport,status:'installed',modelConfirmed:true,positionConfirmed:true}};
assert.equal(PDF.plan({mapImportSource:source,rows:[forged]}).tombstones.length,0);
// Native schedule identity still matches an exact diagram TAG on another sheet.
const nativePages = [{number:1,nativeTokens:schedule,ocrTokens:[],annotations:[],segments:[]},
  {number:2,nativeTokens:diagram.map(t=>({...t,text:t.text==='St'?'S1':t.text==='A'?'A2':t.text})),ocrTokens:[],annotations:[],segments}];
const native = M.analyzeDocument(nativePages).find(c=>c.name==='Branch Splitter');
assert.equal(native.page,2);
assert.equal(native.schedulePage,1);
assert.equal(native.tag,'S1');
assert.equal(native.positionReadable,true);
assert.equal(native.positionConfirmed,false);
console.log('map-ocr-regression: provisional splitter/branch retained; unreadable positions blocked; exact native cross-sheet matching preserved');
});
