/* Private masked-image protocol. Generic suggestions only; no equipment names or originals. */
 const symbols=Object.freeze({node:{label:'Node'},tap2:{label:'2-port tap',ports:2},tap4:{label:'4-port tap',ports:4},tap8:{label:'8-port tap',ports:8},amplifier:{label:'Amplifier'},lineExtender:{label:'Line extender'},splitter2:{label:'2-way splitter'},coupler:{label:'Directional coupler',black:'tap',white:'through'},unknown:{label:'Review symbol'}});
 const kinds=Object.freeze(Object.keys(symbols)),ports=['through','tap','output1','output2','output3','high','low1','low2','A','B','C','D'],idRE=/^s[0-9]+$/;
 const directorKinds=['splitter2','coupler','unknown'],tapSides=['left','right','top','bottom','upper-left','upper-right','lower-left','lower-right','unknown'];
 const fail=m=>{throw Error(m);};
 const record=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const finite=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 function keys(o,allowed){if(!record(o)||Object.keys(o).some(k=>!allowed.includes(k)))fail('Unexpected protocol field.');}
 function validateFinding(f){
  keys(f,['symbols','connections']);if(!Array.isArray(f.symbols)||f.symbols.length>200||!Array.isArray(f.connections)||f.connections.length>400)fail('Invalid scan result size.');
  const ids=new Set();
  for(const s of f.symbols){keys(s,['id','kind','x','y','value','director']);if(!idRE.test(s.id)||ids.has(s.id))fail('Invalid or duplicate scan symbol ID.');ids.add(s.id);if(!kinds.includes(s.kind))fail('Invalid scan symbol kind.');if(!finite(s.x,0,1)||!finite(s.y,0,1))fail('Invalid scan coordinate.');if(s.value!==null&&!finite(s.value,0,60))fail('Invalid scan value.');if(s.director!==undefined&&s.director!==null){if(!['node','amplifier','lineExtender'].includes(s.kind))fail('Director must be inside active equipment.');keys(s.director,['kind','value','tapSide']);if(!directorKinds.includes(s.director.kind)||!(s.director.value===null||finite(s.director.value,0,60))||!tapSides.includes(s.director.tapSide))fail('Invalid director.');}}
  for(const e of f.connections){keys(e,['from','to','port']);if(!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||!ports.includes(e.port))fail('Invalid scan connection reference or port.');}
  return f;
 }
 function compare(a,b){
  if(a)validateFinding(a);if(b)validateFinding(b);const aa=a?.symbols||[],bb=b?.symbols||[],used=new Set(),items=[];
  const sameDirector=(left,right)=>{const x=left??null,y=right??null;return x===null||y===null?x===y:x.kind===y.kind&&x.value===y.value&&x.tapSide===y.tapSide;};
  for(const s of aa){let best=-1,d=.025;bb.forEach((t,i)=>{const n=Math.hypot(s.x-t.x,s.y-t.y);if(!used.has(i)&&n<d){best=i;d=n;}});const other=best<0?null:bb[best];if(best>=0)used.add(best);items.push({a:s,b:other,status:!other?'unresolved':s.kind===other.kind&&s.value===other.value&&sameDirector(s.director,other.director)?'agreement':'disagreement',confirmed:false});}
  bb.forEach((s,i)=>{if(!used.has(i))items.push({a:null,b:s,status:'unresolved',confirmed:false});});
  // Provider IDs are local. Compare connectivity after mapping matched symbol centers.
  const mapping=new Map(items.filter(i=>i.a&&i.b).map(i=>[i.a.id,i.b.id]));
  for(const item of items.filter(i=>i.a&&i.b)){
   const left=(a.connections||[]).filter(e=>e.from===item.a.id||e.to===item.a.id).map(e=>JSON.stringify([mapping.get(e.from)||'unmatched:'+e.from,mapping.get(e.to)||'unmatched:'+e.to,e.port])).sort();
   const right=(b.connections||[]).filter(e=>e.from===item.b.id||e.to===item.b.id).map(e=>JSON.stringify([e.from,e.to,e.port])).sort();
   item.connectionsAgree=JSON.stringify(left)===JSON.stringify(right);
   if(!item.connectionsAgree)item.status='disagreement';
  }
  return items;
 }
 function scanRequest(input){
  keys(input,['version','image','width','height','revision','stage',...(input?.stage==='crosscheck'?['findings']:[])]);
  const {image,width,height,revision,stage,findings}=input;
  if(input.version!==undefined&&input.version!==1)fail('Unsupported protocol version.');
  if(typeof image!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(image)||image.length>6*1048576)fail('Only a flattened PNG image is accepted (max 6 MiB encoded).');
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>2048||height>2048)fail('Invalid scan dimensions.');
  if(typeof revision!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(revision)||!['initial','crosscheck'].includes(stage))fail('Invalid scan stage or revision.');
  const result={version:1,stage,image,width,height,revision};
  if(stage==='crosscheck'){keys(findings,['openai','gemini']);result.findings={};for(const p of ['openai','gemini']){if(findings[p]===null)result.findings[p]=null;else result.findings[p]=validateFinding(findings[p]);}}
  return result;
 }
 const schema={type:'object',additionalProperties:false,required:['symbols','connections'],properties:{symbols:{type:'array',items:{type:'object',additionalProperties:false,required:['id','kind','x','y','value','director'],properties:{id:{type:'string'},kind:{type:'string',enum:kinds},x:{type:'number'},y:{type:'number'},value:{type:['number','null']},director:{anyOf:[{type:'null'},{type:'object',additionalProperties:false,required:['kind','value','tapSide'],properties:{kind:{type:'string',enum:directorKinds},value:{type:['number','null']},tapSide:{type:'string',enum:tapSides}}}]}}}},connections:{type:'array',items:{type:'object',additionalProperties:false,required:['from','to','port'],properties:{from:{type:'string'},to:{type:'string'},port:{type:'string',enum:ports}}}}}};

export {symbols,kinds,ports,validateFinding,compare,scanRequest,schema};

export function validateScanResponse(value,{revision,stage}={}) {
 keys(value,['version','revision','stage','providers']);
 if(value.version!==1||value.revision!==revision||value.stage!==stage)fail('Stale or invalid scanner response.');
 keys(value.providers,['openai','gemini']);
 for(const provider of ['openai','gemini']){
  const result=value.providers[provider];
  if(result?.status==='ok'){
   keys(result,['status','model','finding']);
   if(typeof result.model!=='string'||!/^[a-zA-Z0-9._-]{1,100}$/.test(result.model))fail('Invalid provider model.');
   validateFinding(result.finding);
  }else{
   keys(result,['status','code']);
   if(result.status!=='error'||!['not_configured','provider_failed'].includes(result.code))fail('Invalid provider status.');
  }
 }
 return value;
}

export async function runDualScan({image,width,height,revision,endpoint,token,fetcher=globalThis.fetch,signal,onStage}){
 const url=new URL(endpoint);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!['','/','/v1/map-scans'].includes(url.pathname))fail('Scanner requires an HTTPS service origin.');
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{32,256}$/.test(token))fail('Invalid device token.');
 url.pathname='/v1/map-scans';
 const request=async(stage,findings)=>{
  onStage?.(stage);
  const body=scanRequest({image,width,height,revision,stage,...(stage==='crosscheck'?{findings}:{})});
  const response=await fetcher(url.href,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',redirect:'error'});
  if(!response.ok)fail('Scanner request failed ('+response.status+').');
  return validateScanResponse(await response.json(),{revision,stage});
 };
 const initial=await request('initial');
 const findings=Object.fromEntries(['openai','gemini'].map(p=>[p,initial.providers[p].status==='ok'?initial.providers[p].finding:null]));
 const crosscheck=await request('crosscheck',findings);
 const final=p=>crosscheck.providers[p].status==='ok'?crosscheck.providers[p].finding:null;
 return {initial,crosscheck,comparison:compare(final('openai'),final('gemini'))};
}
