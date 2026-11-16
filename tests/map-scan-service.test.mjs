import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{processScan,validPNG,ScanGate} from '../map-service/worker.mjs';
const finding={symbols:[{id:'s1',kind:'coupler',x:.4,y:.4,value:9}],connections:[]};
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==';
const body={version:1,stage:'initial',image:png,width:1,height:1,revision:'r1'};
const env={OPENAI_MODEL:'mock-openai',GEMINI_MODEL:'mock-gemini',OPENAI_API_KEY:'secret-a',GEMINI_API_KEY:'secret-b'};
test('both adapters independently read, then each sees only the other finding',async()=>{
 const calls=[];
 const fetcher=async(url,opts)=>{const p=JSON.parse(opts.body);calls.push([url,p]);return Response.json(url.includes('openai')?{output:[{content:[{text:JSON.stringify(finding)}]}]}:{candidates:[{content:{parts:[{text:JSON.stringify(finding)}]}}]});};
 assert.equal((await processScan(body,env,fetcher)).providers.openai.status,'ok');
 assert.ok(calls.every(([,p])=>!JSON.stringify(p).includes('Other provider data:')));
 await processScan({...body,stage:'crosscheck',findings:{openai:finding,gemini:{symbols:[],connections:[]}}},env,fetcher);
 const prompt=calls[2][1].input[0].content[0].text;
 assert.ok(prompt.includes('Other provider data: {"symbols":[],"connections":[]}'));
 assert.equal(calls[0][1].store,false);
});
test('malformed and named provider findings are errors without response leakage',async()=>{
 const result=await processScan(body,env,async()=>Response.json({output:[{content:[{text:'{"name":"PRIVATE"}'}]}]}));
 assert.deepEqual(result.providers.openai,{status:'error',code:'provider_failed'});
 assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});
test('PNG rejects dimension mismatch and non PNG',()=>{validPNG(body);assert.throws(()=>validPNG({...body,width:2}));assert.throws(()=>validPNG({...body,image:'data:image/png;base64,aGVsbG8='}));});
test('service enforces exact origins and hashed device authorization',async()=>{
 const token='a'.repeat(32);const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');
 const settings={...env,ALLOWED_ORIGINS:'https://app.example',DEVICE_TOKEN_HASHES:JSON.stringify([hash]),SCAN_GATE:{}};
 const request=(origin,auth,payload=body)=>new Request('https://scanner.example/v1/map-scans',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+auth},body:JSON.stringify(payload)});
 assert.equal((await worker.fetch(request('https://app.example.evil',token),settings)).status,403);
 assert.equal((await worker.fetch(request('https://app.example','b'.repeat(32)),settings)).status,401);
 const response=await worker.fetch(request('https://app.example',token,{...body,filename:'private.pdf'}),settings);
 assert.equal(response.status,400);assert.equal(response.headers.get('cache-control'),'no-store');
});
test('gate stores counters and short leases only; enforces active and daily limits',async()=>{
 const records=new Map();const storage={get:async k=>records.get(k),put:async(k,v)=>records.set(k,structuredClone(v)),transaction:async fn=>fn(storage)};
 const gate=new ScanGate({storage},{MAX_REQUESTS_PER_DAY:1});const req=path=>new Request('https://gate/'+path,{method:'POST'});
 const first=await gate.fetch(req('acquire'));const lease=await first.json();assert.equal(first.status,200);
 assert.equal((await gate.fetch(req('acquire'))).status,409);
 await gate.fetch(new Request('https://gate/release',{method:'POST',body:JSON.stringify(lease)}));
 assert.equal((await gate.fetch(req('acquire'))).status,429);
 assert.deepEqual(Object.keys(records.get('gate')).sort(),['active','count','day']);
});
