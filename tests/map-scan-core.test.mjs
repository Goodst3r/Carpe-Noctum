import test from 'node:test';
import assert from 'node:assert/strict';
import {scanRequest,validateFinding,compare,runDualScan} from '../app/map-scan-core.mjs';
const finding={symbols:[{id:'s1',kind:'tap2',x:.2,y:.3,value:17}],connections:[]};
const args={image:'data:image/png;base64,aGVsbG8=',width:10,height:10,revision:'r1',stage:'initial'};
test('protocol rejects names, originals, missing fields and extra fields',()=>{
 assert.throws(()=>scanRequest({...args,originalPDF:'private'}));
 assert.throws(()=>validateFinding({symbols:[{...finding.symbols[0],name:'private'}],connections:[]}));
 assert.throws(()=>validateFinding({symbols:[{id:'s1',kind:'node',x:0,y:0}],connections:[]}));
 assert.equal(scanRequest(args).stage,'initial');
});
test('findings compare as unconfirmed suggestions',()=>{assert.equal(compare(finding,finding)[0].confirmed,false);assert.equal(compare(finding,finding)[0].status,'agreement');});
test('client performs independent stage before mutual crosscheck',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{const body=JSON.parse(options.body);calls.push(body);return Response.json({version:1,revision:'r1',stage:body.stage,providers:Object.fromEntries(['openai','gemini'].map(p=>[p,{status:'ok',model:'synthetic',finding}]))});};
 const result=await runDualScan({...args,endpoint:'https://scanner.example',token:'a'.repeat(32),fetcher});
 assert.equal(calls.length,2);assert.equal(calls[0].findings,undefined);assert.deepEqual(calls[1].findings,{openai:finding,gemini:finding});assert.equal(result.comparison[0].confirmed,false);
});
test('comparison flags differing connectivity and port roles',()=>{
 const symbols=[...finding.symbols,{id:'s2',kind:'tap4',x:.5,y:.5,value:null}];
 const left={symbols,connections:[{from:'s1',to:'s2',port:'tap'}]};
 const right={symbols,connections:[{from:'s1',to:'s2',port:'through'}]};
 assert.equal(compare(left,right)[0].status,'disagreement');
 assert.equal(compare(left,right)[0].connectionsAgree,false);
});
