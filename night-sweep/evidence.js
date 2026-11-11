(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.EvidenceCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const limits=Object.freeze({fileBytes:8*1024*1024,totalBytes:12*1024*1024,count:30,textBytes:2*1024*1024,samples:10000});
 const kinds=Object.freeze(['Sweep','Ingress','OneCheck']);
 const stages=Object.freeze(['Before','After','Reference']);
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const owns=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
 const unsafe=/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
 const inlineUnsafe=/[\u0000-\u001f\u007f]/;
 const numberPattern=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
 const scalar=x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=1000000;
 function textBytes(s){
  if(typeof TextEncoder!=='undefined')return new TextEncoder().encode(s).length;
  let n=0;for(const c of s){const p=c.codePointAt(0);n+=p<128?1:p<2048?2:p<65536?3:4;}return n;
 }
 function boundedString(value,label,max,required=false,multiline=false){
  if(typeof value!=='string'||value.length>max||(required&&!value.trim())||(multiline?unsafe:inlineUnsafe).test(value))throw Error('Invalid evidence '+label+'.');
 }
 function ownKeys(value,allowed,label){
  for(const key of Object.keys(value))if(!allowed.includes(key))throw Error('Unsupported evidence '+label+' field: '+key+'.');
 }
 function numberCell(value,label,row){
  const s=value.trim();
  if(!numberPattern.test(s)||!scalar(Number(s)))throw Error('CSV row '+row+': '+label+' must be a complete finite number.');
  return Number(s);
 }
 function csvRows(text){
  const rows=[];let row=[],value='',quoted=false,afterQuote=false,started=false;
  const addValue=()=>{if(value.length>4000)throw Error('CSV field exceeds 4,000 characters.');row.push(value);value='';started=false;afterQuote=false;if(row.length>100)throw Error('CSV exceeds 100 columns.');};
  const addRow=()=>{addValue();rows.push(row);row=[];if(rows.length>limits.samples+1)throw Error('CSV exceeds '+limits.samples+' data rows.');};
  for(let i=0;i<text.length;i++){
   const c=text[i];
   if(quoted){if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;afterQuote=true;}}else value+=c;continue;}
   if(afterQuote&&c!==','&&c!=='\r'&&c!=='\n')throw Error('CSV has characters after a closing quote.');
   if(c==='"'){if(started||value)throw Error('CSV has a quote inside an unquoted field.');quoted=true;started=true;}
   else if(c===',')addValue();
   else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;addRow();}
   else{value+=c;started=true;}
  }
  if(quoted)throw Error('CSV has an unclosed quoted field.');
  if(value.length||row.length||started||afterQuote)addRow();
  return rows;
 }
 const aliases={
  frequency_mhz:['frequency_mhz','frequency (mhz)','frequency mhz','freq_mhz','freq (mhz)'],
  level_dbmv:['level_dbmv','level (dbmv)','level dbmv','amplitude_dbmv','amplitude (dbmv)'],
  response_db:['response_db','response (db)','response db','relative_response_db','relative response (db)'],
  channel:['channel','channel_name','channel name'],
  mer_db:['mer_db','mer (db)','mer db']
 };
 // Only the two inspected, typed VIAVI layouts are supported. Document metadata
 // stays in the original bytes; these adapters emit technical state and samples.
 function parseNative(text,kind){
  const attachment=(message,native)=>Object.assign({status:'attachment',message:'Original JSON retained; preview unavailable. '+message},native?{native}:{});
  if(kind!=='Sweep')return attachment('Native sweep JSON requires the Sweep category.');
  if(textBytes(text)>limits.textBytes)return attachment('Preview decoding is limited to 2 MiB of text.');
  if(unsafe.test(text))return attachment('Unsupported control characters prevent decoding.');
  let native;
  try{
   const doc=JSON.parse(text.replace(/^\uFEFF/,'')),traces=[],warnings=[];
   const warn=s=>{if(!warnings.includes(s)&&warnings.length<8)warnings.push(s);};
   const vector=(values,label)=>{if(!Array.isArray(values))throw Error('Invalid '+label+' sample array.');if(values.length>limits.samples)throw Error('Native trace exceeds '+limits.samples+' samples.');return values;};
   const samples=(pairs)=>{
    const seen=new Set(),points=[];
    for(const p of pairs){
     if(!Array.isArray(p)||p.length!==2||!scalar(p[0])||!scalar(p[1]))throw Error('Every sample must be a pair of finite JSON numbers.');
     if(p[0]<5||p[0]>1800)throw Error('Sample frequency is outside 5–1800 MHz.');
     if(seen.has(p[0]))throw Error('Duplicate sample frequency.');
     seen.add(p[0]);points.push([p[0],p[1]]);
    }
    return points.sort((a,b)=>a[0]-b[0]);
   };
   if(plain(doc)&&plain(doc.testGroup)&&Array.isArray(doc.testGroup.tests)){
    native={format:'viavi-testgroup',direction:'unknown',referenceState:'unknown'};
    for(const test of doc.testGroup.tests){
     if(!plain(test)||test.id!=='sweeplessSweep')continue;
     if(!Array.isArray(test.resultGroups))throw Error('Unsupported sweep result groups.');
     for(const group of test.resultGroups){
      if(!plain(group)||group.id!=='sweep')continue;
      if(!Array.isArray(group.resultSeries))throw Error('Unsupported sweep result series.');
      for(const series of group.resultSeries){
       if(!plain(series)||series.id!=='Levels')continue;
       const x=series.independent;
       if(!plain(x)||x.label!=='Frequency'||x.type!=='set'||x.units!=='MHz')throw Error('Unsupported frequency type or units; explicit MHz is required.');
       const frequencies=vector(x.values,'frequency');
       if(!Array.isArray(series.dependent))throw Error('Unsupported dependent sample arrays.');
       for(const y of series.dependent){
        if(!plain(y)||y.type!=='set'||!['Absolute','Referenced'].includes(y.label))throw Error('Unsupported dependent trace type.');
        const unit=y.label==='Absolute'?'dBmV':'dB';
        if(y.units!==unit)throw Error('Unsupported or inconsistent trace units.');
        const values=vector(y.values,'dependent');
        if(!values.length){warn(y.label==='Referenced'?'Empty Referenced trace skipped; no response samples are available.':'Empty Absolute trace skipped; no level samples are available.');continue;}
        if(frequencies.length!==values.length)throw Error('Frequency and dependent sample lengths do not match.');
        traces.push({unit,points:samples(values.map((value,i)=>[frequencies[i],value])),referenceState:y.label==='Absolute'?'unreferenced':'referenced'});
       }
      }
     }
    }
   }else if(plain(doc)&&doc.cdmVersion==='2.0'&&Array.isArray(doc.tests)){
    native={format:'viavi-cdm2',direction:'unknown',referenceState:'unknown'};
    for(const test of doc.tests){
     if(!plain(test)||test.type!=='sweepmode_app')continue;
     if(!plain(test.results)||!plain(test.results.data))throw Error('Unsupported CDM sweep results.');
     const results=Object.values(test.results.data);let conflictingReference=false;
     for(const table of results){
      if(!plain(table)||table.eType!=='resultTable'||!Array.isArray(table.tableData))continue;
      for(const row of table.tableData){
       if(!Array.isArray(row)||row.length!==2||!plain(row[0])||!plain(row[1]))continue;
       if((row[0].value==='Reference name'&&row[1].value!=='NONE')||(row[0].value==='Reference date'&&row[1].value!=='---'))conflictingReference=true;
      }
     }
     for(const chart of results){
      if(!plain(chart)||chart.eType!=='resultSeries')continue;
      if(chart.type!=='line')throw Error('Unsupported CDM chart type.');
      if(chart.xAxisLabel!=='MHz'||!['dBmV','dB'].includes(chart.yAxisLabel))throw Error('Unsupported chart axis units.');
      const label=typeof chart.label==='string'?chart.label:'',sweep=/\bsweep\b/i.test(label),forward=/\bforward\b/i.test(label),reverse=/\breverse\b/i.test(label);
      const direction=sweep&&forward!==reverse?(forward?'forward':'reverse'):'unknown';
      for(const child of Object.values(chart)){
       if(!plain(child)||child.eType!=='series')continue;
       if(child.name!=='Unreferenced'||child.dimensions!==2)throw Error('Unsupported CDM trace name or dimensions.');
       if(!Array.isArray(child.units)||child.units.length!==2||child.units[0]!=='MHz'||child.units[1]!=='dBmV'||child.units[1]!==chart.yAxisLabel)throw Error('Unsupported or inconsistent trace units.');
       const data=vector(child.data,'trace');
       if(!data.length){warn('Empty Unreferenced trace skipped; no level samples are available.');continue;}
       traces.push({unit:'dBmV',points:samples(data),direction,referenceState:conflictingReference?'unknown':'unreferenced'});
       if(conflictingReference)warn('Reference metadata conflicts with the Unreferenced trace; reference state is unknown.');
      }
     }
    }
   }else return attachment('JSON does not match a supported native sweep schema or version.');
   if(traces.length!==1)throw Error(traces.length?'Multiple nonempty sweep traces are ambiguous; no trace was selected.':'No nonempty supported sweep samples are available.');
   const trace=traces[0];native.direction=trace.direction||'unknown';native.referenceState=trace.referenceState;
   if(native.direction==='unknown')warn('Sweep direction is not explicit in supported metadata.');
   if(warnings.length)native.warnings=warnings;
   return {status:'parsed',message:'Decoded '+trace.points.length+' explicit native sweep points ('+trace.unit+'). Raw values only; no test-point, lead or reference correction applied. This is not an acceptance result.'+(warnings.length?' '+warnings.join(' '):''),native,series:{unit:trace.unit,label:trace.unit==='dBmV'?'Absolute level':'Relative response',points:trace.points}};
  }catch(e){return attachment(e instanceof SyntaxError?'JSON is malformed.':e.message,native);}
 }
 function parseText(text,filename,kind){
  const attachment=message=>({status:'attachment',message});
  if(typeof text!=='string')return attachment('Original attachment retained; no text was supplied for decoding.');
  if(/\.json$/i.test(String(filename||'')))return parseNative(text,kind);
  if(!/\.csv$/i.test(String(filename||'')))return attachment('Original attachment only. This file type is not decoded by the text preview.');
  if(!kinds.includes(kind))return attachment('Choose Sweep, Ingress or OneCheck before importing.');
  if(textBytes(text)>limits.textBytes)return attachment('Original CSV retained. Preview decoding is limited to 2 MiB of text.');
  if(unsafe.test(text))return attachment('Original CSV retained. Unsupported control characters prevent decoding.');
  try{
   const rows=csvRows(text.replace(/^\uFEFF/,''));
   if(rows.length<2)throw Error('CSV needs a header and at least one complete data row.');
   const headers=rows[0].map(v=>v.trim().toLowerCase()),map={};
   if(headers.some(v=>!v)||new Set(headers).size!==headers.length)throw Error('CSV headers are blank or duplicated.');
   for(let i=0;i<headers.length;i++)for(const key of Object.keys(aliases))if(aliases[key].includes(headers[i])){if(owns(map,key))throw Error('CSV has ambiguous '+key+' columns.');map[key]=i;}
   if(!owns(map,'frequency_mhz'))throw Error('CSV needs an explicit frequency_mhz column; frequency units are never guessed.');
   if(owns(map,'level_dbmv')===owns(map,'response_db'))throw Error('CSV needs exactly one of level_dbmv or response_db.');
   if(owns(map,'channel')!==owns(map,'mer_db'))throw Error('Channel result CSV needs both channel and mer_db columns.');
   const oneCheck=owns(map,'channel');
   if(oneCheck&&(kind!=='OneCheck'||!owns(map,'level_dbmv')))throw Error('Channel and MER columns require OneCheck with absolute level_dbmv.');
   const unit=owns(map,'level_dbmv')?'dBmV':'dB',levelKey=unit==='dBmV'?'level_dbmv':'response_db',points=[],channels=[],seen=new Set();
   for(let i=1;i<rows.length;i++){
    const row=rows[i];
    if(row.length!==headers.length)throw Error('CSV row '+(i+1)+' has '+row.length+' fields; expected '+headers.length+'.');
    const freq=numberCell(row[map.frequency_mhz],'frequency_mhz',i+1),level=numberCell(row[map[levelKey]],levelKey,i+1);
    if(freq<5||freq>1800)throw Error('CSV row '+(i+1)+': frequency is outside 5–1800 MHz.');
    if(seen.has(freq))throw Error('CSV row '+(i+1)+': duplicate frequency '+freq+' MHz.');
    seen.add(freq);points.push([freq,level]);
    if(oneCheck){const channel=row[map.channel].trim();if(!channel||channel.length>200||inlineUnsafe.test(channel))throw Error('CSV row '+(i+1)+': invalid channel name.');channels.push({channel,frequencyMHz:freq,levelDbmv:level,merDb:numberCell(row[map.mer_db],'mer_db',i+1)});}
   }
   points.sort((a,b)=>a[0]-b[0]);
   const ignored=headers.length-Object.keys(map).length;
   const result={status:'parsed',message:'Decoded '+points.length+' explicit CSV points ('+unit+'). Raw values only; no test-point, lead or reference correction applied. This is not an acceptance result.'+(ignored?' '+ignored+' additional column(s) retained in the original file but not interpreted.':''),series:{unit,label:unit==='dBmV'?'Absolute level':'Relative response',points}};
   if(oneCheck)result.rows=channels;
   return result;
  }catch(e){return attachment('Original CSV retained; preview unavailable. '+e.message);}
 }
 function validateParse(parse){
  if(!plain(parse)||!['parsed','attachment'].includes(parse.status))throw Error('Invalid evidence parse result.');
  ownKeys(parse,['status','message','series','rows','native'],'parse');
  boundedString(parse.message,'parse message',1200,true,true);
  if(owns(parse,'native')){
   const native=parse.native;
   if(!plain(native))throw Error('Invalid native evidence descriptor.');
   ownKeys(native,['format','direction','referenceState','warnings'],'native');
   if(!['viavi-testgroup','viavi-cdm2'].includes(native.format)||!['forward','reverse','unknown'].includes(native.direction)||!['unreferenced','referenced','unknown'].includes(native.referenceState))throw Error('Invalid native evidence state.');
   if(owns(native,'warnings')){
    if(!Array.isArray(native.warnings)||native.warnings.length>8)throw Error('Invalid native evidence warnings.');
    for(const warning of native.warnings)boundedString(warning,'native warning',200,true);
   }
  }
  if(parse.status==='attachment'){if(owns(parse,'series')||owns(parse,'rows'))throw Error('Attachment-only evidence cannot claim decoded measurements.');return;}
  const series=parse.series;
  if(!plain(series)||!['dBmV','dB'].includes(series.unit)||!Array.isArray(series.points)||!series.points.length||series.points.length>limits.samples)throw Error('Invalid evidence series.');
  ownKeys(series,['unit','points','label'],'series');
  if(owns(series,'label'))boundedString(series.label,'series label',200);
  let prior=-Infinity;
  for(const p of series.points){if(!Array.isArray(p)||p.length!==2||!scalar(p[0])||p[0]<5||p[0]>1800||p[0]<=prior||!scalar(p[1]))throw Error('Invalid, duplicate or unsorted evidence sample.');prior=p[0];}
  if(owns(parse,'rows')){
   if(series.unit!=='dBmV'||!Array.isArray(parse.rows)||parse.rows.length!==series.points.length)throw Error('Invalid evidence channel rows.');
   const seen=new Set(),pointMap=new Map(series.points.map(p=>[p[0],p[1]]));
   for(const row of parse.rows){
    if(!plain(row))throw Error('Invalid evidence channel row.');
    ownKeys(row,['channel','frequencyMHz','levelDbmv','merDb'],'channel');
    boundedString(row.channel,'channel name',200,true);
    if(!scalar(row.frequencyMHz)||!scalar(row.levelDbmv)||!scalar(row.merDb)||!pointMap.has(row.frequencyMHz)||pointMap.get(row.frequencyMHz)!==row.levelDbmv||seen.has(row.frequencyMHz))throw Error('Evidence channel rows do not match the series.');
    seen.add(row.frequencyMHz);
   }
  }
 }
 function validateEvidence(list){
  if(!Array.isArray(list)||list.length>limits.count)throw Error('Evidence must contain at most '+limits.count+' attachments.');
  const ids=new Set();let total=0;
  for(const item of list){
   if(!plain(item))throw Error('Invalid evidence attachment.');
   ownKeys(item,['id','name','size','type','kind','stage','asset','notes','importedAt','sha256','parse'],'attachment');
   if(typeof item.id!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(item.id)||ids.has(item.id))throw Error('Invalid or duplicate evidence ID.');
   ids.add(item.id);boundedString(item.name,'filename',300,true);
   if(!Number.isInteger(item.size)||item.size<0||item.size>limits.fileBytes)throw Error('Each evidence file must be 8 MiB or smaller.');
   total+=item.size;
   for(const [key,max,multiline]of [['type',200,false],['asset',200,false],['notes',2000,true]])if(owns(item,key))boundedString(item[key],key,max,false,multiline);
   if(!kinds.includes(item.kind)||!stages.includes(item.stage))throw Error('Invalid evidence test category or stage.');
   boundedString(item.importedAt,'import date',64,true);
   if(!/^\d{4}-\d{2}-\d{2}T/.test(item.importedAt)||!Number.isFinite(Date.parse(item.importedAt)))throw Error('Invalid evidence import date.');
   if(typeof item.sha256!=='string'||!/^[a-fA-F0-9]{64}$/.test(item.sha256))throw Error('Invalid evidence SHA-256.');
   validateParse(item.parse);
   if(item.parse.rows&&item.kind!=='OneCheck')throw Error('Decoded channel rows require OneCheck evidence.');
   if(item.parse.native&&item.kind!=='Sweep')throw Error('Native sweep descriptors require Sweep evidence.');
  }
  if(total>limits.totalBytes)throw Error('Project evidence exceeds the 12 MiB total limit.');
  return true;
 }
 function bytesToBase64(bytes){
  if(!(bytes instanceof Uint8Array)||bytes.length>limits.fileBytes)throw Error('Invalid or oversized evidence bytes.');
  if(typeof Buffer!=='undefined')return Buffer.from(bytes).toString('base64');
  let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary);
 }
 function base64ToBytes(text,maxBytes=limits.fileBytes){
  if(!Number.isInteger(maxBytes)||maxBytes<0||maxBytes>limits.totalBytes)throw Error('Invalid base64 size limit.');
  if(typeof text!=='string'||text.length>4*Math.ceil(maxBytes/3)||text.length%4!==0)throw Error('Invalid or oversized evidence base64.');
  const pad=text.indexOf('='),body=pad<0?text:text.slice(0,pad),tail=pad<0?'':text.slice(pad);
  // A repeated grouped regex can overflow the JS stack on legitimate 8 MiB files.
  if(/[^A-Za-z0-9+/]/.test(body)||(tail!==''&&tail!=='='&&tail!=='=='))throw Error('Invalid evidence base64.');
  let bytes;
  if(typeof Buffer!=='undefined')bytes=new Uint8Array(Buffer.from(text,'base64'));
  else{const binary=atob(text);bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);}
  if(bytes.length>maxBytes||bytesToCanonicalBase64(bytes)!==text)throw Error('Invalid or noncanonical evidence base64.');
  return bytes;
 }
 function bytesToCanonicalBase64(bytes){
  if(typeof Buffer!=='undefined')return Buffer.from(bytes).toString('base64');
  let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary);
 }
 return Object.freeze({limits,kinds,stages,parseText,validateEvidence,validateParse,bytesToBase64,base64ToBytes});
});
