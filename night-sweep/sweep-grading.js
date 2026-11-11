(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SweepGrading=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 // Existing EvidenceCore software guards, not equipment capabilities or company limits.
 const maxSamples=10000,maxScalar=1000000,minMHz=5,maxMHz=1800;
 const profileKeys=['lowFrequencyMHz','highFrequencyMHz','ptvLimitDb','lowTargetDbmv','highTargetDbmv','maxLevelErrorDb','tiltTargetDb','maxTiltErrorDb'];
 const owns=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
 const plain=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
 const scalar=value=>typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=maxScalar;
 const unknownCheck=reason=>({status:'unknown',reason,value:null,limit:null,target:null,unit:'dB',targetUnit:null});
 function blankResult(){
  return {
   qualification:'Technician grading aid for caller-supplied normalized samples; not official acceptance.',
   overall:'unknown',reason:'Measurements and explicitly entered criteria are required.',
   source:{qualification:'Raw normalized series supplied by the caller; file origin, units and measurement plane require adapter verification.',unit:null,frequencyUnit:'MHz',sampleCount:null,spanMHz:null,bandMHz:null,inBandSampleCount:null,inBandSpanMHz:null},
   metrics:{ptvDb:null,lowValue:null,highValue:null,measuredTiltDb:null,lowLevelErrorDb:null,highLevelErrorDb:null,tiltErrorDb:null},
   checks:{ptv:unknownCheck('Enter a peak-to-valley limit.'),lowLevel:unknownCheck('Enter an absolute low-level target and tolerance.'),highLevel:unknownCheck('Enter an absolute high-level target and tolerance.'),tilt:unknownCheck('Enter a signed tilt target and tolerance.')}
  };
 }
 function unavailable(result,reason){
  result.reason=reason;
  for(const key of Object.keys(result.checks))result.checks[key]=unknownCheck(reason);
  return result;
 }
 function criterion(profile,key,nonnegative=false,frequency=false){
  const value=owns(profile,key)?profile[key]:undefined;
  if(value===undefined||value===null||(typeof value==='string'&&!value.trim()))return {value:null,reason:'Enter '+key+' explicitly; blank is unknown.'};
  if(!scalar(value)||(nonnegative&&value<0)||(frequency&&(value<minMHz||value>maxMHz)))return {value:null,reason:key+' must be a finite numeric value within the software guard'+(nonnegative?' and at least zero':'')+'.'};
  return {value,reason:''};
 }
 function compare(value,limit,target,reason,scale,label,targetUnit=null){
  const result={status:'unknown',reason,value,limit:limit.value,target:target?target.value:null,unit:'dB',targetUnit:target&&target.value!==null?targetUnit:null};
  if(reason)return result;
  if(limit.value===null){result.reason=limit.reason;return result;}
  // Only a machine-roundoff allowance: no displayed rounding or operating tolerance is added.
  const roundoff=4*Number.EPSILON*Math.max(1,scale,Math.abs(value),Math.abs(limit.value));
  result.status=Math.abs(value)<=limit.value+roundoff?'pass':'fail';
  result.reason=label+(result.status==='pass'?' is within the explicitly entered inclusive limit.':' exceeds the explicitly entered limit.');
  return result;
 }
 function evaluateSeries(series,profile){
  const result=blankResult();
  if(!plain(series)||Object.keys(series).some(key=>!['unit','points','label'].includes(key)))return unavailable(result,'Supply one normalized EvidenceCore series with explicit units. Unsupported series fields cannot be interpreted.');
  if(!owns(series,'unit')||!['dBmV','dB'].includes(series.unit))return unavailable(result,'Series unit must explicitly be dBmV or dB; units are never inferred.');
  result.source.unit=series.unit;
  if(owns(series,'label')&&(typeof series.label!=='string'||series.label.length>200||/[\u0000-\u001f\u007f]/.test(series.label)))return unavailable(result,'Invalid optional normalized series label.');
  if(!owns(series,'points')||!Array.isArray(series.points)||!series.points.length||series.points.length>maxSamples)return unavailable(result,'Supply 1 to 10,000 complete normalized samples within the existing EvidenceCore software guards.');
  const seen=new Set(),points=[];
  for(const point of series.points){
   if(!Array.isArray(point)||point.length!==2||!scalar(point[0])||point[0]<minMHz||point[0]>maxMHz||!scalar(point[1]))return unavailable(result,'Every sample needs a finite numeric MHz frequency from 5 to 1800 and a finite numeric value within the existing EvidenceCore scalar guard.');
   if(seen.has(point[0]))return unavailable(result,'Duplicate measured frequencies make the series ambiguous.');
   seen.add(point[0]);points.push([point[0],point[1]]);
  }
  points.sort((a,b)=>a[0]-b[0]);
  result.source.sampleCount=points.length;
  result.source.spanMHz=[points[0][0],points[points.length-1][0]];
  if(profile===undefined||profile===null)profile={};
  if(!plain(profile)||Object.keys(profile).some(key=>!profileKeys.includes(key)))return unavailable(result,'Supply only the explicit grading profile fields; unsupported profile fields cannot be interpreted.');
  const low=criterion(profile,'lowFrequencyMHz',false,true),high=criterion(profile,'highFrequencyMHz',false,true);
  if(low.value===null||high.value===null)return unavailable(result,low.reason||high.reason);
  if(low.value>=high.value)return unavailable(result,'Low marker frequency must be below high marker frequency.');
  result.source.bandMHz=[low.value,high.value];
  const band=points.filter(point=>point[0]>=low.value&&point[0]<=high.value);
  result.source.inBandSampleCount=band.length;
  result.source.inBandSpanMHz=band.length?[band[0][0],band[band.length-1][0]]:null;
  if(band.length<2||band[0][0]!==low.value||band[band.length-1][0]!==high.value)return unavailable(result,'Exact measured samples are required at both entered markers with at least two samples in the band; no interpolation or extrapolation is applied.');
  let minimum=Infinity,maximum=-Infinity;
  for(const point of band){minimum=Math.min(minimum,point[1]);maximum=Math.max(maximum,point[1]);}
  const m=result.metrics,lowValue=band[0][1],highValue=band[band.length-1][1];
  m.ptvDb=maximum-minimum;m.lowValue=lowValue;m.highValue=highValue;m.measuredTiltDb=highValue-lowValue;
  const ptvLimit=criterion(profile,'ptvLimitDb',true),lowTarget=criterion(profile,'lowTargetDbmv'),highTarget=criterion(profile,'highTargetDbmv');
  const levelLimit=criterion(profile,'maxLevelErrorDb',true),tiltTarget=criterion(profile,'tiltTargetDb'),tiltLimit=criterion(profile,'maxTiltErrorDb',true);
  result.checks.ptv=compare(m.ptvDb,ptvLimit,null,'',Math.max(Math.abs(minimum),Math.abs(maximum)),'Raw peak-to-valley');
  if(series.unit==='dBmV'){
   if(lowTarget.value!==null)m.lowLevelErrorDb=lowValue-lowTarget.value;
   if(highTarget.value!==null)m.highLevelErrorDb=highValue-highTarget.value;
   result.checks.lowLevel=compare(m.lowLevelErrorDb,levelLimit,lowTarget,lowTarget.reason,lowTarget.value===null?Math.abs(lowValue):Math.max(Math.abs(lowValue),Math.abs(lowTarget.value)),'Absolute low-level error','dBmV');
   result.checks.highLevel=compare(m.highLevelErrorDb,levelLimit,highTarget,highTarget.reason,highTarget.value===null?Math.abs(highValue):Math.max(Math.abs(highValue),Math.abs(highTarget.value)),'Absolute high-level error','dBmV');
  }else{
   result.checks.lowLevel=unknownCheck('Relative dB response cannot establish an absolute dBmV low level.');
   result.checks.highLevel=unknownCheck('Relative dB response cannot establish an absolute dBmV high level.');
  }
  if(tiltTarget.value!==null)m.tiltErrorDb=m.measuredTiltDb-tiltTarget.value;
  const tiltScale=tiltTarget.value===null?Math.max(Math.abs(lowValue),Math.abs(highValue)):Math.max(Math.abs(lowValue),Math.abs(highValue),Math.abs(tiltTarget.value));
  result.checks.tilt=compare(m.tiltErrorDb,tiltLimit,tiltTarget,tiltTarget.reason,tiltScale,'Signed tilt error','dB');
  const checks=Object.values(result.checks);
  result.overall=checks.some(check=>check.status==='fail')?'fail':checks.every(check=>check.status==='pass')?'pass':'unknown';
  result.reason=result.overall==='fail'?'At least one established check exceeds an entered criterion.':result.overall==='pass'?'All four checks satisfy the explicitly entered criteria.':'At least one required check remains unknown; available checks are reported separately.';
  return result;
 }
 return Object.freeze({evaluateSeries});
});
