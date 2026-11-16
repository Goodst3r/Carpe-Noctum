import { Inflate, Gunzip, strFromU8 } from 'fflate';

const INPUT = 20 * 1024 * 1024, JSON_LIMIT = 10 * 1024 * 1024, HTML_LIMIT = 5 * 1024 * 1024, TOTAL = 20 * 1024 * 1024;
const u16 = (b,p) => b[p] | b[p+1]<<8;
const u32 = (b,p) => (b[p] | b[p+1]<<8 | b[p+2]<<16 | b[p+3]<<24) >>> 0;
function crc32(bytes) { let c=0xffffffff; for (const b of bytes) { c^=b; for(let i=0;i<8;i++) c=(c>>>1)^(-(c&1)&0xedb88320); } return (c^0xffffffff)>>>0; }
function decode(bytes, label) { try { return new TextDecoder('utf-8',{fatal:true}).decode(bytes); } catch { throw new Error(`ONX ${label} has invalid UTF-8`); } }
function decompress(bytes, kind, limit) {
  let chunks=[], size=0, finished=false;
  try {
    const decoder = new (kind === 'gzip' ? Gunzip : Inflate)((chunk, final) => {
      size += chunk.length; if (size > limit) throw new Error('ONX decoded size exceeds limit');
      chunks.push(chunk); if(final) finished=true;
    });
    for(let i=0;i<bytes.length;i+=4096) decoder.push(bytes.subarray(i,i+4096), i+4096>=bytes.length);
    if(!finished) throw new Error('truncated');
  } catch(e) { if(e.message.includes('limit')) throw e; throw new Error(`ONX ${kind} is invalid or truncated`); }
  const out=new Uint8Array(size); let at=0; for(const chunk of chunks){out.set(chunk,at);at+=chunk.length;} return out;
}
function unzip(bytes) {
  let end=-1; for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--) if(u32(bytes,p)===0x06054b50 && p+22+u16(bytes,p+20)===bytes.length){end=p;break;}
  if(end<0 || u16(bytes,end+4)!==0 || u16(bytes,end+6)!==0 || u16(bytes,end+8)!==u16(bytes,end+10)) throw new Error('ONX ZIP is invalid');
  const count=u16(bytes,end+10), offset=u32(bytes,end+16), length=u32(bytes,end+12);
  if(count>64 || offset+length!==end) throw new Error('ONX ZIP record count or directory invalid');
  let p=offset, total=0; const names=new Set(), entries=[], ranges=[];
  for(let i=0;i<count;i++) {
    if(p+46>end || u32(bytes,p)!==0x02014b50) throw new Error('ONX ZIP directory invalid');
    const flags=u16(bytes,p+8), method=u16(bytes,p+10), crc=u32(bytes,p+16), packed=u32(bytes,p+20), size=u32(bytes,p+24), nl=u16(bytes,p+28), el=u16(bytes,p+30), cl=u16(bytes,p+32), local=u32(bytes,p+42);
    if(p+46+nl+el+cl>end || flags&1 || ![0,8].includes(method) || packed===0xffffffff || size===0xffffffff) throw new Error('ONX ZIP entry invalid or unsupported');
    const name=decode(bytes.subarray(p+46,p+46+nl),'ZIP name'); p+=46+nl+el+cl;
    const dir=name.endsWith('/'), parts=(dir?name.slice(0,-1):name).split('/');
    if(!name || name.startsWith('/') || /[\\\x00-\x1f\x7f]/.test(name) || /^[A-Za-z]:/.test(name) || parts.some(x=>!x || x==='.' || x==='..')) throw new Error('ONX ZIP unsafe path');
    const key=name.toLowerCase(); if(names.has(key)) throw new Error('ONX ZIP duplicate path'); names.add(key);
    if(local+30>offset || u32(bytes,local)!==0x04034b50 || u16(bytes,local+6)!==flags || u16(bytes,local+8)!==method) throw new Error('ONX ZIP local header invalid');
    const lnl=u16(bytes,local+26), lel=u16(bytes,local+28), start=local+30+lnl+lel;
    if(decode(bytes.subarray(local+30,local+30+lnl),'ZIP name')!==name || start+packed>offset) throw new Error('ONX ZIP local entry invalid');
    if(ranges.some(([a,b])=>local<b && start+packed>a)) throw new Error('ONX ZIP overlapping entries'); ranges.push([local,start+packed]);
    const lower=name.toLowerCase(), limit=lower.endsWith('.json')?JSON_LIMIT:HTML_LIMIT;
    if(size>limit || total+size>TOTAL) throw new Error('ONX ZIP decoded size exceeds limit');
    const payload=method===0?bytes.slice(start,start+packed):decompress(bytes.subarray(start,start+packed),'deflate',limit);
    total+=payload.length; if(payload.length!==size || total>TOTAL || crc32(payload)!==crc) throw new Error('ONX ZIP entry size or checksum invalid');
    if(!dir && !lower.endsWith('.json') && !lower.endsWith('.html') && !lower.endsWith('.onx_html')) throw new Error('ONX ZIP unsupported entry');
    if(!dir) entries.push({name,bytes:payload});
  }
  if(p!==end) throw new Error('ONX ZIP directory invalid'); return entries;
}
function tableCell(cell) { const value=cell?.value; return {value: ['string','number','boolean'].includes(typeof value) ? value : null, ...(typeof cell?.status==='string'?{status:cell.status}:{})}; }
function cdm(document, metadata) {
  if(!Array.isArray(document.tests) || document.tests.length!==1) throw new Error('ONX multiple or missing measurement tests');
  const t=document.tests[0], type=String(t.type ?? '').toLowerCase(), reverse=type==='sweepmode_app' && /reverse/i.test(t.label ?? '');
  if(!reverse && type!=='onecheckexpert') throw new Error('ONX unsupported CDM measurement');
  const data=t.results?.data ?? {}, series=[], tables=[];
  for(const [key,section] of Object.entries(data)) {
    if(!section || typeof section!=='object') continue;
    if(Array.isArray(section.tableData) && section.tableData.length) {
      if(section.tableData.length>10000) throw new Error('ONX table limit exceeded');
      tables.push({id:key,label:section.label ?? key,columns:(section.tableColumnHeaders ?? []).map(x=>typeof x==='string'?x:[x?.label,x?.units].filter(Boolean).join(' ')),rows:section.tableData.map(row=>{if(!Array.isArray(row) || row.length>100) throw new Error('ONX invalid table'); return row.map(tableCell);})});
    }
    for(const [name,item] of Object.entries(section)) {
      if(!item || !Array.isArray(item.data) || !Array.isArray(item.units) || item.units.length<2) continue;
      if(item.data.length>10000 || item.data.some(pair=>!Array.isArray(pair) || pair.length!==2 || !pair.every(Number.isFinite))) throw new Error('ONX invalid diagnostic series');
      series.push({id:`${key}.${name}`,label:name,section:section.label ?? key,direction:reverse?'reverse':/upstream/i.test(key)?'reverse':'forward',frequencyUnit:item.units[0],levelUnit:item.units[1],samples:item.data.map(p=>[...p]),status:item.status});
    }
  }
  Object.assign(metadata,{testName:t.label ?? t.type,testTime:t.results?.testTime ?? t.testTime ?? null,status:t.results?.status ?? t.status ?? null,meter:document.assetInfo ?? null,workOrder:document.workflow?.workOrderId ?? null,configuredCompensation:t.configuration?.networkConfig ?? null});
  return {kind:reverse?'reverse-relative':'onecheck',direction:reverse?'reverse':'mixed',metadata,series,tables,warnings:['Diagnostic evidence is not a forward RF sweep.']};
}
function textContent(s) { return s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'').replace(/<[^>]*>/g,' ').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,x)=>{const n=x[0]==='#'?(x[1].toLowerCase()==='x'?parseInt(x.slice(2),16):parseInt(x.slice(1),10)):null; return n!==null?(n>0 && n<=0x10ffff?String.fromCodePoint(n):'�'):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[x.toLowerCase()] ?? '');}).replace(/\s+/g,' ').trim(); }
function htmlReport(html,metadata) {
  const clean=html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,''); const tables=[];
  for(const match of clean.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi)) {
    if(tables.length>=100) throw new Error('ONX HTML table count limit');
    const preceding=clean.slice(0,match.index); const headings=[...preceding.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]\s*>/gi)];
    const heading=headings.length?textContent(headings.at(-1)[1]):'';
    const body=match[1], caption=body.match(/<caption\b[^>]*>([\s\S]*?)<\/caption\s*>/i), rows=[];
    for(const row of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)) {
      const cells=[...row[1].matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi)].map(c=>({value:textContent(c[3]),...(c[2].match(/\bclass\s*=\s*["']([^"']+)["']/i)?.[1]?{status:c[2].match(/\bclass\s*=\s*["']([^"']+)["']/i)[1]}:{})}));
      if(cells.length) rows.push(cells); if(rows.length>10000 || cells.length>100) throw new Error('ONX HTML table limit');
    }
    const header=body.slice(0,body.search(/<tr\b/i) < 0 ? body.length : body.search(/<tr\b/i));
    const columns=[...header.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th\s*>/gi)].map(x=>textContent(x[1]));
    if(rows.length || columns.length) tables.push({id:`table-${tables.length+1}`,label:caption?textContent(caption[1]):heading || `Table ${tables.length+1}`,columns,rows});
  }
  if(!tables.length) throw new Error('ONX HTML report has no measurement tables');
  return {kind:'onecheck',direction:'mixed',metadata,series:[],tables,warnings:['Diagnostic evidence is not a forward RF sweep.','Chart scripts were not executed.']};
}
function native(document,metadata) {
 const group=document.testGroup, matches=[];
 for(const test of group.tests ?? []) for(const result of test.resultGroups ?? []) for(const series of result.resultSeries ?? []) {
  const f=series.independent, a=(series.dependent ?? []).filter(x=>x.label==='Absolute' && x.units==='dBmV');
  if(f?.label==='Frequency' && f.units==='MHz' && a.length===1) matches.push({test,result,series,f,a:a[0]});
 }
 if(matches.length!==1) throw new Error('ONX needs one Frequency MHz / Absolute dBmV result series');
 const {test,result,series,f,a}=matches[0];
 if(!Array.isArray(f.values) || !Array.isArray(a.values) || f.values.length!==a.values.length) throw new Error('ONX frequency and absolute level samples do not align');
 if(f.values.length>10000) throw new Error('ONX sample count exceeds the limit');
 let previous=-Infinity; for(let i=0;i<f.values.length;i++) {const x=f.values[i],y=a.values[i]; if(!Number.isFinite(x)||x<=0||x>3000||x<=previous||!Number.isFinite(y)||y< -150||y>150) throw new Error('ONX invalid sweep sample or frequency order'); previous=x;}
 if(!f.values.length) throw new Error('ONX sweep needs measured samples');
 Object.assign(metadata,{testGroupId:group.id,testId:test.id,resultGroupId:result.id,seriesId:series.id,infoGroup:group.infoGroup ?? null,setupGroups:test.setupGroups ?? [],testName:group.id,testTime:group.infoGroup?.generalInfo?.date ?? null,status:test.status ?? result.status ?? null,meter:group.infoGroup?.assetInfo ?? null,workOrder:group.infoGroup?.generalInfo?.workOrder ?? null});
 const cfg=metadata.setupGroups.flatMap(x=>x.configs ?? []).find(x=>x.id==='forwardTestPointCompensation'); metadata.configuredCompensation=cfg ?? null; metadata.meterCompensationDb=cfg?.value;
 return {kind:'forward-sweep',direction:'forward',metadata,series:[{id:series.id ?? 'Levels',label:'Absolute',direction:'forward',frequencyUnit:'MHz',levelUnit:'dBmV',samples:f.values.map((x,i)=>[x,a.values[i]])}],tables:[],warnings:[]};
}
export async function inspectONX(bytes,{filename}={}) {
 const input=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes); if(input.length>INPUT) throw new Error('ONX input exceeds the 20 MiB size limit');
 let entries,format;
 if(input[0]===0x50 && input[1]===0x4b){entries=unzip(input);format='zip';}
 else if(input[0]===0x1f && input[1]===0x8b){ if(input.length<18) throw new Error('ONX gzip invalid or truncated'); const result=decompress(input,'gzip',JSON_LIMIT); if(u32(input,input.length-4)!==(result.length>>>0) || u32(input,input.length-8)!==crc32(result)) throw new Error('ONX gzip checksum invalid or truncated'); entries=[{name:null,bytes:result}];format='gzip'; }
 else {if(input.length>JSON_LIMIT) throw new Error('ONX JSON exceeds the size limit');entries=[{name:null,bytes:input}];format='json';}
 const jsons=entries.filter(x=>x.name===null || x.name.toLowerCase().endsWith('.json')), htmls=entries.filter(x=>x.name?.toLowerCase().endsWith('.html'));
 if(jsons.length>1 || htmls.length>1) throw new Error('ONX archive has multiple ambiguous documents');
 let doc=null; if(jsons.length) {try{doc=JSON.parse(decode(jsons[0].bytes,'JSON'));}catch {throw new Error('ONX JSON result is invalid');}}
 const metadata={filename:filename ?? null,memberName:jsons[0]?.name ?? htmls[0]?.name ?? null,sourceFormat:format};
 if(doc?.testGroup) {if(htmls.length) throw new Error('ONX archive has multiple ambiguous measurement documents');return native(doc,metadata);}
 if(doc?.cdmVersion){if(htmls.length) throw new Error('ONX archive has multiple ambiguous measurement documents');return cdm(doc,metadata);}
 if(doc && !Array.isArray(doc.channels)) throw new Error('ONX unrecognized JSON result');
 if(htmls.length){metadata.memberName=htmls[0].name;return htmlReport(decode(htmls[0].bytes,'HTML'),metadata);}
 if(doc && Array.isArray(doc.channels)) return {kind:'channel-plan',direction:'none',metadata,series:[],tables:[],warnings:['Channel plan contains configured values, not measurements.']};
 throw new Error('ONX archive has no recognized result');
}
