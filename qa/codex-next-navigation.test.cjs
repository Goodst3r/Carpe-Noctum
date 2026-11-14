'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {bootApp}=require('./build2-source-harness.cjs');
test('calculator starts without creating a job; route is directly reachable; Field and Leakage are retired',()=>{
 const app=bootApp();try{
  assert.equal(app.ev('WorkflowUI.current()'),'calculators');
  assert.equal(app.d.getElementById('calculatorPanel').hidden,false);
  assert.equal(app.d.querySelector('[data-main-tab="field"]'),null);
  assert.equal(app.ev('WorkflowUI.groups.field'),undefined);
  assert.equal(app.ev('Object.values(WorkflowUI.groups).some(g=>g.tabs.some(t=>t[0]==="leakage"))'),false);
  app.d.querySelector('[data-main-tab="plan"]').click();
  assert.equal(app.ev('WorkflowUI.current()'),'route');
  for(const id of ['gain','readings'])assert.equal(app.ev(`WorkflowUI.go('${id}')`),'route');
  for(const id of ['sweepSetup','station','evidence','tdr'])assert.equal(app.ev(`WorkflowUI.go('${id}')`),id);
  assert.equal(app.ev("WorkflowUI.go('leakage')"),'calculators');
  assert.deepEqual(app.errors,[]);
 }finally{app.close();}
});
