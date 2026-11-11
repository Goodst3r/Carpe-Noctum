(function(root,factory){
 'use strict';
 const api=factory(typeof module==='object'&&module.exports?require('./evidence.js'):root.EvidenceCore);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.EvidenceArchive=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(EvidenceCore){
 'use strict';
 // No files are extracted. Only bounded byte views and decoded chunks are used.
 const limits=Object.freeze({inputBytes:EvidenceCore.limits.fileBytes,decodedBytes:EvidenceCore.limits.textBytes,entries:32});
 const fail=message=>{throw Error(message);};
 const attachment=message=>({status:'attachment',message:'Original attachment retained; preview unavailable. '+message});
 function decodeText(bytes){
  if(typeof TextDecoder==='undefined')fail('UTF-8 text decoding is unavailable in this browser.');
  try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch(e){fail('Invalid UTF-8 text prevents decoding.');}
 }
 async function inflate(bytes,format,limit){
  if(typeof DecompressionStream==='undefined'||typeof ReadableStream==='undefined')fail('Browser decompression is unavailable; this compressed file remains an attachment.');
  let decoder;
  try{decoder=new DecompressionStream(format);}catch(e){fail('Browser decompression for '+format+' is unavailable; this compressed file remains an attachment.');}
  let offset=0;
  const input=new ReadableStream({pull(controller){if(offset===bytes.length){controller.close();return;}const end=Math.min(offset+65536,bytes.length);controller.enqueue(bytes.subarray(offset,end));offset=end;}});
  const reader=input.pipeThrough(decoder).getReader(),chunks=[];let total=0;
  try{
   while(true){
    const part=await reader.read();if(part.done)break;
    total+=part.value.byteLength;
    if(total>limit){await reader.cancel().catch(()=>{});fail('Decoded data exceeds the 2 MiB preview limit.');}
    chunks.push(part.value);
   }
  }catch(e){
   await reader.cancel().catch(()=>{});
   if(e.message==='Decoded data exceeds the 2 MiB preview limit.')throw e;
   fail('Compressed data is malformed, truncated or has an integrity mismatch.');
  }finally{reader.releaseLock();}
  const result=new Uint8Array(total);let position=0;
  for(const chunk of chunks){result.set(chunk,position);position+=chunk.byteLength;}
  return result;
 }
 let crcTable;
 function crc32(bytes){
  if(!crcTable){
   const table=new Uint32Array(256);
   for(let byte=0;byte<256;byte++){
    let value=byte;for(let i=0;i<8;i++)value=(value>>>1)^((value&1)?0xedb88320:0);
    table[byte]=value>>>0;
   }
   crcTable=table;
  }
  let crc=0xffffffff;
  for(let i=0;i<bytes.length;i++)crc=(crc>>>8)^crcTable[(crc^bytes[i])&255];
  return (crc^0xffffffff)>>>0;
 }
 async function unzip(bytes,limit){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),length=bytes.length;
  const inside=(offset,size,end=length)=>Number.isInteger(offset)&&Number.isInteger(size)&&offset>=0&&size>=0&&offset<=end&&size<=end-offset;
  const u16=offset=>{if(!inside(offset,2))fail('ZIP header is truncated.');return view.getUint16(offset,true);};
  const u32=offset=>{if(!inside(offset,4))fail('ZIP header is truncated.');return view.getUint32(offset,true);};
  const extras=(offset,size)=>{
   if(!inside(offset,size))fail('ZIP extra fields are truncated.');
   const end=offset+size;
   while(offset<end){if(!inside(offset,4,end))fail('Malformed ZIP extra fields.');const type=u16(offset),n=u16(offset+2);offset+=4;if(!inside(offset,n,end))fail('Malformed ZIP extra fields.');if(type===1)fail('ZIP64 archives are unsupported.');offset+=n;}
  };
  let end=-1;
  for(let i=length-22;i>=Math.max(0,length-65557);i--)if(u32(i)===0x06054b50&&inside(i,22)&&i+22+u16(i+20)===length){end=i;break;}
  if(end<0)fail('ZIP end header is malformed or truncated.');
  const count=u16(end+10),centralSize=u32(end+12),centralOffset=u32(end+16);
  if(count===0xffff||centralSize===0xffffffff||centralOffset===0xffffffff)fail('ZIP64 archives are unsupported.');
  if(u16(end+4)!==0||u16(end+6)!==0||u16(end+8)!==count)fail('Multidisk ZIP archives are unsupported.');
  if(count>limits.entries)fail('ZIP exceeds the '+limits.entries+'-entry preview limit.');
  if(!inside(centralOffset,centralSize,end)||centralOffset+centralSize!==end)fail('ZIP central directory bounds are malformed.');
  const entries=[],names=new Set();let cursor=centralOffset,totalDeclared=0;
  for(let i=0;i<count;i++){
   if(!inside(cursor,46,end)||u32(cursor)!==0x02014b50)fail('ZIP central header is malformed or truncated.');
   const version=u16(cursor+6),flags=u16(cursor+8),method=u16(cursor+10),crc=u32(cursor+16),compressed=u32(cursor+20),size=u32(cursor+24),nameSize=u16(cursor+28),extraSize=u16(cursor+30),commentSize=u16(cursor+32),disk=u16(cursor+34),local=u32(cursor+42);
   if(compressed===0xffffffff||size===0xffffffff||local===0xffffffff||disk===0xffff)fail('ZIP64 archives are unsupported.');
   if(disk!==0)fail('Multidisk ZIP archives are unsupported.');
   if(flags&(1|64|8192))fail('Encrypted ZIP archives are unsupported.');
   if(flags&~(8|2048|2|4))fail('Unsupported ZIP flags.');
   if(version>20)fail('Unsupported ZIP version; ZIP64 archives are unsupported.');
   if(![0,8].includes(method)||(method===0&&(flags&6)))fail('Unsupported ZIP compression method.');
   if(!nameSize||nameSize>512||!inside(cursor+46,nameSize+extraSize+commentSize,end))fail('ZIP member name or header is malformed.');
   const nameBytes=bytes.subarray(cursor+46,cursor+46+nameSize),name=decodeText(nameBytes);
   if(/[\u0000-\u001f\u007f\\:]/.test(name)||name.startsWith('/')||name.split('/').some((part,index,parts)=>part==='.'||part==='..'||(part===''&&index!==parts.length-1)))fail('Unsafe ZIP member path; traversal is unsupported.');
   if(names.has(name))fail('Duplicate ZIP member names are ambiguous.');names.add(name);
   extras(cursor+46+nameSize,extraSize);
   totalDeclared+=size;
   if(totalDeclared>limit)fail('Decoded ZIP data exceeds the 2 MiB preview limit.');
   if(method===0&&compressed!==size)fail('Stored ZIP compressed and decoded sizes do not match.');
   entries.push({version,flags,method,crc,compressed,size,local,nameBytes,json:/\.json$/i.test(name),directory:name.endsWith('/')});
   cursor+=46+nameSize+extraSize+commentSize;
  }
  if(cursor!==centralOffset+centralSize)fail('ZIP central directory size or entry count does not match.');
  const candidates=entries.filter(e=>e.json&&!e.directory);
  if(candidates.length!==1)fail(candidates.length?'Multiple JSON members are ambiguous; no member was selected.':'ZIP needs exactly one JSON member; nested archives are unsupported.');
  const ranges=[];
  for(const entry of entries){
   const local=entry.local;
   if(!inside(local,30,centralOffset)||u32(local)!==0x04034b50)fail('ZIP local header is malformed or truncated.');
   const nameSize=u16(local+26),extraSize=u16(local+28),data=local+30+nameSize+extraSize;
   if(u16(local+4)!==entry.version||u16(local+6)!==entry.flags||u16(local+8)!==entry.method)fail('ZIP local and central headers do not match.');
   if(nameSize!==entry.nameBytes.length||!inside(local+30,nameSize+extraSize,centralOffset))fail('ZIP local member name is malformed.');
   for(let i=0;i<nameSize;i++)if(bytes[local+30+i]!==entry.nameBytes[i])fail('ZIP local and central member names do not match.');
   extras(local+30+nameSize,extraSize);
   const localCRC=u32(local+14),localCompressed=u32(local+18),localSize=u32(local+22),descriptor=!!(entry.flags&8);
   if(descriptor){
    if((localCRC!==0&&localCRC!==entry.crc)||(localCompressed!==0&&localCompressed!==entry.compressed)||(localSize!==0&&localSize!==entry.size))fail('ZIP local sizes or CRC do not match the central directory.');
   }else if(localCRC!==entry.crc||localCompressed!==entry.compressed||localSize!==entry.size)fail('ZIP local sizes or CRC do not match the central directory.');
   if(!inside(data,entry.compressed,centralOffset))fail('ZIP compressed size is out of bounds or truncated.');
   let recordEnd=data+entry.compressed;
   if(descriptor){
    const signed=inside(recordEnd,4,centralOffset)&&u32(recordEnd)===0x08074b50,descriptorStart=recordEnd+(signed?4:0);
    if(!inside(descriptorStart,12,centralOffset)||u32(descriptorStart)!==entry.crc||u32(descriptorStart+4)!==entry.compressed||u32(descriptorStart+8)!==entry.size)fail('ZIP data descriptor sizes or CRC do not match.');
    recordEnd=descriptorStart+12;
   }
   entry.data=data;ranges.push([local,recordEnd]);
  }
  ranges.sort((a,b)=>a[0]-b[0]);let boundary=0;
  for(const range of ranges){if(range[0]!==boundary)fail('ZIP local records overlap or contain unsupported gaps.');boundary=range[1];}
  if(boundary!==centralOffset)fail('ZIP local record sizes do not match the central directory.');
  let candidate,totalDecoded=0;
  for(const entry of entries){
   const compressed=bytes.subarray(entry.data,entry.data+entry.compressed);
   const decoded=entry.method===0?compressed:await inflate(compressed,'deflate-raw',limit-totalDecoded);
   totalDecoded+=decoded.length;
   if(decoded.length!==entry.size)fail('ZIP decoded size does not match its declared size.');
   if(crc32(decoded)!==entry.crc)fail('ZIP CRC integrity mismatch.');
   if(entry.json&&!entry.directory)candidate=decoded;
  }
  return candidate;
 }
 async function parseBytes(input,filename,kind){
  try{
   if(!EvidenceCore||typeof EvidenceCore.parseText!=='function')fail('Evidence preview is unavailable.');
   let bytes;
   if(input instanceof Uint8Array)bytes=input;
   else if(input instanceof ArrayBuffer)bytes=new Uint8Array(input);
   else fail('Preview requires an original byte array.');
   if(bytes.length>limits.inputBytes)fail('Original files must be 8 MiB or smaller.');
   const name=String(filename||''),limit=limits.decodedBytes;
   let textName=name,decoded=bytes;
   if(/\.zip$/i.test(name)){decoded=await unzip(bytes,limit);textName='decoded.json';}
   else if(/\.gz$/i.test(name)){decoded=await inflate(bytes,'gzip',limit);textName='decoded.json';}
   else if(!/\.(?:json|csv)$/i.test(name))return attachment('This file type is not supported by the evidence preview.');
   if(decoded.length>limit)fail('Decoded text exceeds the 2 MiB preview limit.');
   return EvidenceCore.parseText(decodeText(decoded),textName,kind);
  }catch(e){return attachment(e.message||'Unsupported file data.');}
 }
 return Object.freeze({limits,parseBytes});
});
