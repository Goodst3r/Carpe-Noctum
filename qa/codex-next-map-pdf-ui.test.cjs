'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{bootApp}=require('./build2-source-harness.cjs');
test('saving a tombstone coordinate preserves the position controls and keyboard focus',()=>{
 const a=bootApp();try{
  a.ev(`state.mapImportSource={id:'a'.repeat(64),type:'application/pdf',pages:[{number:1,pdf:{width:600,height:800,viewportTransform:[1,0,0,-1,0,800]}}]};state.rows=[{id:'r1',device:'active_gm_hgd',mapImport:{sourceId:'a'.repeat(64),page:1,symbolId:'A1',kind:'active',status:'installed',modelConfirmed:true,positionConfirmed:true,position:{x:100,y:200}}}];renderMapPDF()`);
  const input=a.d.querySelector('[data-tombstone="x"]'),next=a.d.querySelector('[data-tombstone="y"]');input.focus();input.value='30';input.dispatchEvent(new a.w.Event('change',{bubbles:true}));
  assert.equal(input.isConnected,true);assert.equal(next.isConnected,true);assert.equal(a.d.activeElement,input);assert.equal(a.ev('Object.values(state.mapTombstones)[0].x'),0.3);assert.deepEqual(a.errors,[]);
 }finally{a.close();}
});
