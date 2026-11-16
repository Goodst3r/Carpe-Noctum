import test from 'node:test';
import assert from 'node:assert/strict';
import {scanRequest,validateFinding,compare,runDualScan,schema,ports} from '../app/map-scan-core.mjs';
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
test('composite node roles are generic and director stays optional for legacy findings',()=>{
 assert.deepEqual(['A','B','C','D'].every(role=>ports.includes(role)),true);
 const node={id:'s1',kind:'node',x:.5,y:.5,value:null};
 const finding={symbols:[node,{id:'s2',kind:'tap2',x:.7,y:.7,value:8}],connections:[{from:'s1',to:'s2',port:'A'}]};
 assert.equal(validateFinding(finding),finding);
 assert.ok(schema.properties.symbols.items.required.includes('director'));
 assert.ok(schema.properties.connections.items.properties.port.enum.includes('D'));
});
test('director suggestions validate only on active equipment and affect agreement',()=>{
 const director={kind:'coupler',value:12,tapSide:'lower-left'};
 const active={id:'s1',kind:'node',x:.5,y:.5,value:null,director};
 const left={symbols:[active],connections:[]};
 assert.equal(validateFinding(left),left);
 assert.equal(compare(left,{symbols:[{...active,director:{tapSide:'lower-left',value:12,kind:'coupler'}}],connections:[]})[0].status,'agreement');
 assert.equal(compare(left,{symbols:[{...active,director:{...director,tapSide:'right'}}],connections:[]})[0].status,'disagreement');
 assert.equal(compare(left,{symbols:[{...active,director:null}],connections:[]})[0].status,'disagreement');
 assert.throws(()=>validateFinding({symbols:[{...active,kind:'tap2'}],connections:[]}));
 assert.throws(()=>validateFinding({symbols:[{...active,director:{...director,tapSide:'port-1'}}],connections:[]}));
 assert.throws(()=>validateFinding({symbols:[{...active,director:{...director,value:61}}],connections:[]}));
});
