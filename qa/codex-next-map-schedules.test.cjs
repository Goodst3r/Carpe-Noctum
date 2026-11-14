'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('night-sweep/map-import.js','utf8'),c);const M=c.NightSweepMapImport;
const t=(text,x,y)=>({text,x,y,w:text.length*7,h:12});
test('native schedule NAME/TAG match diagram symbols across sheets and mark EOL separately',()=>{
 assert.equal(typeof M.analyzeDocument,'function');
 const pages=[{number:1,width:600,height:800,nativeTokens:[t('NAME',10,10),t('TAG',200,10),t('MODEL',300,10),t('Exact / Active',10,40),t('A1',200,40),t('HGD',300,40),t('Exact EOL',10,65),t('E9',200,65),t('EOL',300,65)],ocrTokens:[],segments:[],annotations:[]},{number:2,width:600,height:800,nativeTokens:[t('A1',80,200),t('E9',400,200)],ocrTokens:[],segments:[{x1:100,y1:220,x2:420,y2:220}],annotations:[]}];
 const rows=M.analyzeDocument(pages);assert.equal(rows.length,2);assert.equal(rows[0].name,'Exact / Active');assert.equal(rows[0].page,2);assert.equal(rows[0].schedulePage,1);assert.equal(rows[0].positionReadable,true);assert.equal(rows[1].kind,'terminal');
 pages[1].annotations=[{text:'A1 ABSENT'}];assert.equal(M.analyzeDocument(pages)[0].status,'absent');
});
