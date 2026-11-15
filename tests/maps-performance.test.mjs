import test from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {recommendParts} from '../app/rf.mjs';
import {layoutTombstones} from '../app/maps.mjs';

globalThis.PDFLib=await import('pdf-lib');
function fixture(count,name='HGD station') {
  const samples=Array.from({length:count},(_,i)=>[57+i*696/(count-1),31+12*i/(count-1)]);
  const input=samples.map(([f,v])=>[f,v-30]);
  const recommendation=recommendParts('gm-hgd-40',input,samples,{director:'splitter'});
  const job={map:{pages:[{pageNumber:1,width:792,height:612}]},nodes:[{id:'amp',name,tag:'A1',kind:'active',modelId:'gm-hgd-40',map:{page:1,x:.2,y:.2,confirmed:true}}],placements:{}};
  const evaluation={stations:{amp:{input,outputs:recommendation.outputs,targets:recommendation.targets,gainStatus:recommendation.gainStatus,shortfall:recommendation.shortfall,recommendation,issues:recommendation.issues}}};
  return {job,evaluation};
}

test('tombstones summarize parts and status without serializing recommendation internals',()=>{
  const {job,evaluation}=fixture(2);
  const [box]=layoutTombstones(job,evaluation),text=box.lines.join(' ');
  assert.doesNotMatch(text,/\{"|"sources"|"residuals"|"outputs"|https:\/\//);
  assert.match(text,/Input pad/);assert.match(text,/EQ/);assert.match(text,/Status/);assert.match(text,/shortfall/i);
  assert.match(text,/main.*aux1.*aux2/);
  assert.ok(box.lines.length<=32);
});

for(const count of [98,1000])test(`${count}-point HGD layout stays bounded and responsive with an extreme station name`,()=>{
  const {job,evaluation}=fixture(count,'X'.repeat(1000000));
  const start=performance.now(),[box]=layoutTombstones(job,evaluation),elapsed=performance.now()-start;
  assert.ok(elapsed<2000,`Layout took ${elapsed.toFixed(1)} ms; expected less than 2 seconds`);
  assert.ok(box.lines.length<=32);assert.ok(box.lines.join('').length<2500);
  assert.match(box.lines.join(' '),new RegExp(`${count} pts`));
  assert.doesNotMatch(box.lines.join(' '),/\{"|"sources"|"residuals"|https:\/\//);
  assert.equal(box.page,1);assert.ok(box.x+box.width<=1);assert.ok(box.y+box.height<=1);
});
