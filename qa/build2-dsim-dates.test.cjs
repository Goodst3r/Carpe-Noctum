'use strict';
const assert=require('node:assert/strict'),{bootApp}=require('./build2-source-harness.cjs');
const app=bootApp();let checks=0;function check(name,f){f();checks++;console.log('PASS '+name);}
const record={station:'SYNTHETIC A1',node:'SYNTHETIC N1',ampModel:'GainMaker HGD',dsimModel:'DSIM-SG Rev H',upper:1002,route:'Aerial',modeBefore:'MGC',modeAfter:'AGC',pilot:609,pilotType:'QAM',locked:'Yes',fallback:'No',ambient:68,s1:3,agcPad:0,backoffMHz:750,backoff:4.1,tgc:18,verified:'Yes',technician:'Practice technician',date:'2026-11-11',confirmed:'Yes'};
function status(date){return app.ev('projectDsimStatus('+JSON.stringify({...record,date})+')');}
try{
 check('imported February31 remains readable but cannot become a complete setup record',()=>{const candidate=app.json('TrainingJob.makePractice("gainmaker-dsim")');candidate.project.dsim=[{...record,date:'2026-02-31'}];assert(Number.isFinite(Date.parse(candidate.project.dsim[0].date)),'Reproduce JavaScript calendar normalization');app.ev('loadState('+JSON.stringify(candidate)+',false)');assert.equal(app.ev('state.project.dsim[0].date'),'2026-02-31');assert.equal(app.ev('projectDsimStatus(state.project.dsim[0])'),'Enter a valid setup date.');});
 check('ordinary and Gregorian century leap-day rules are exact',()=>{for(const date of ['2024-02-29','2000-02-29','2400-02-29'])assert.match(status(date),/complete for review/,date);for(const date of ['2026-02-29','1900-02-29','2100-02-29'])assert.equal(status(date),'Enter a valid setup date.',date);});
 check('all thirty-day months reject normalized day31',()=>{for(const month of ['04','06','09','11']){assert.match(status('2026-'+month+'-30'),/complete for review/);assert.equal(status('2026-'+month+'-31'),'Enter a valid setup date.');}});
 check('all thirty-one-day months retain their valid month ends',()=>{for(const month of ['01','03','05','07','08','10','12'])assert.match(status('2026-'+month+'-31'),/complete for review/);assert.match(status('2026-02-28'),/complete for review/);});
 check('invalid month day zero and malformed date strings remain invalid',()=>{for(const date of ['2026-00-01','2026-13-01','2026-01-00','2026-01-32','2026-2-3','2026-01-01T00:00:00Z','unknown',' 2026-01-01 '])assert.equal(status(date),'Enter a valid setup date.',date);});
 check('legitimate previously accepted four-digit date years remain readable',()=>{for(const date of ['0000-02-29','0099-01-31','0100-01-31','9999-12-31'])assert.match(status(date),/complete for review/,date);});
 check('missing dates preserve incomplete status instead of being invented',()=>{for(const date of ['',null,undefined])assert.match(status(date),/Incomplete setup record/);});
 check('checking a date does not mutate source data or approve RF acceptance',()=>{const original=JSON.stringify(record),out=status(record.date);assert.equal(JSON.stringify(record),original);assert.match(out,/RF acceptance is separate/);assert.deepEqual(app.errors,[]);});
 console.log(`Build2 DSIM dates: ${checks} checks passed`);
}finally{app.close();}
