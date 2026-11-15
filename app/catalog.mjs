import reference from './data/rf-reference.json' with {type:'json'};
import digicomm from './data/digicomm-reference.json' with {type:'json'};
/** Public catalog facts, independent of saved-job and UI representation. */
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const SOURCES=freeze({
 hgd40:{title:'GainMaker High Gain Dual 5–40 / 52–1002 MHz',url:'https://www.cisco.com/c/dam/en/us/products/collateral/video/40-52-mhz-split/product_data_sheet0900aecd806d3546.pdf',locator:'pp.3–5: gain, internal tilt, input reference, AGC and accessories',status:'supplied manufacturer PDF checked'},
 hgd42:{title:'GainMaker High Gain Dual 42/54 MHz',url:'https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d35ae.pdf',locator:'Forward operational gain reference; retained sourced catalog',status:'reference'},
 le:{title:'GainMaker 1 GHz Line Extender',url:'https://www.cisco.com/c/dam/en/us/products/collateral/video/42-54-mhz-split/product_data_sheet0900aecd806d3566.pdf',locator:'p.2: mode-specific operational gain, 9.5 dB internal tilt and factory interstage EQ; Firecrawl source quote 2026-11-15',status:'manufacturer PDF independently retrieved'},
 manual:{title:'1 GHz GainMaker Line Extender Installation and Operation Guide',url:'https://www.cisco.com/c/dam/en/us/td/docs/video/access_edge/Amplifiers/GainMaker/Installation_and_Operation/OL-31155-01.pdf',locator:'OL-31155-01: AGC procedure; pp.98–108 EQ loss and parts tables',status:'supplied manufacturer PDF text checked'},
 aoi:{title:'AOI Quantum18 HGD',url:'https://ao-inc.com/assets/resources-element-files/Spanish/QB18-HGD-SA-Datasheet_ES.pdf',locator:'204/258 operational reference; not a measured gain curve',status:'manufacturer PDF independently retrieved; operational minimum49 dB, not output dBmV'}
});
const gm=(id,label,band,ports,gainDb,factoryEqDb,mode,source,internalTiltDb=null)=>({id,label,kind:'active',family:'GainMaker',band,ports,gainDb,factoryEqDb,mode,source,internalTiltDb,testPointLoss:20,testPointNote:ports.length===3?'HGD datasheet: RF test points -20 dB (±0.5 dB). Verify selected physical test point.':'GainMaker LE OL-31155-01: RF test points -20 dB. Verify selected physical test point.',referenceInputPadDb:1,eqFamily:'forward-cable-1g',agcOffsetDb:ports.length===3?34:29,padRange:[0,20.5,.5],note:'Gain curve is an estimate from operational gain and fixed factory baseline; verify with measured transfer samples.'});
export const EQUIPMENT=freeze(Object.fromEntries([
 {id:'gs7k',label:'Cisco GS7000',kind:'node',ports:['1','2','3','4'],band:[5,1218],testPointLoss:20,testPointNote:'Operator-supplied HA0005 GS7K Port 4 offset: 20 dB. Verify other physical test points.'},
 {id:'vecima',label:'Vecima EN9000',kind:'node',ports:['1','2','3','4'],band:[5,1794],testPointLoss:null,testPointNote:'No verified offset for this physical test point. Enter the equipment value.'},
 {id:'eol',label:'End of line',kind:'eol',ports:['main'],band:[5,1800]},
 {id:'cable-only',label:'Cable junction',kind:'passive',ports:['main'],band:[5,1800],losses:{main:{points:[[5,0],[1800,0]],basis:'Identity junction; no RF component'}}},
 gm('gm-hgd-40','GainMaker HGD · 40/52 · 1 GHz',[52,1002],['main','aux1','aux2'],43,10.5,'agc',SOURCES.hgd40,15.5),
 gm('gm-hgd-42','GainMaker HGD · 42/54 · 1 GHz',[54,1002],['main','aux1','aux2'],43,10.5,'agc',SOURCES.hgd42,15.5),
 gm('gm-le-manual','GainMaker LE · Manual · 42/54',[54,1002],['main'],39.5,9,'manual',SOURCES.le,9.5),
 gm('gm-le-thermal','GainMaker LE · Thermal · 42/54',[54,1002],['main'],34,7.5,'thermal',SOURCES.le,9.5),
 gm('gm-le-agc','GainMaker LE · AGC · 42/54',[54,1002],['main'],33,9,'agc',SOURCES.le,9.5),
 {id:'aoi-hgd',label:'AOI Quantum18 HGD · 204/258',kind:'active',family:'AOI',band:[258,1794],ports:['main','aux1','aux2'],gainDb:49,source:SOURCES.aoi,note:'Electronic alignment: no GainMaker plug-in compatibility. Gain curve requires measured samples.'},
 {id:'aoi-le',label:'AOI Quantum18 LE · 204/258',kind:'active',family:'AOI',band:[258,1794],ports:['main'],gainDb:46,source:{...SOURCES.aoi,url:'https://ao-inc.com/assets/resources-element-files/Spanish/QB18-LE-Datasheet_ES.pdf'},note:'Electronic alignment; no GainMaker plug-in compatibility.'},
 ...[[40,52],[55,70],[65,86],[85,102]].flatMap(([split,floor])=>['manual','thermal','agc'].map(mode=>({...gm(`gm-le-${mode}-${split}`,`GainMaker LE · ${mode} · ${split}/${floor}`,[floor,1002],['main'],null,mode==='thermal'?7.5:9,mode,{...SOURCES.manual,locator:'p.3 documented split and mode availability; gain for this split not established'}),note:'Documented installed split. Enter measured gain samples; 42/54 gain is not silently reused.'}))),
 ...reference.passives
].map(x=>[x.id,x])));
export const CABLES=freeze(Object.fromEntries(reference.cables.map(x=>[x.id,x])));
const inverse=[1.6,3.3,4.9,6.5,8.1,9.8,11.4,13,14.6,16.2].map((v,i)=>({id:`forward-inverse-1g/${v}`,familyId:'forward-inverse-1g',partNumber:`GM-EQINV-${v}-1G=`,identifiers:[String(4007486+i)],nominalDb:v,orderingValue:v,band:[52,1002],direction:'forward',points:[],source:{...SOURCES.manual,locator:'p.106 inverse EQ part numbers'},notes:'Cable-equivalent nominal only. No insertion-loss curve supplied; excluded from numeric optimization.'}));
export const PARTS=freeze(Object.fromEntries([...reference.parts,...inverse,...digicomm.parts].map(x=>[x.id,x])));
export const PADS=freeze(Array.from({length:42},(_,i)=>({value:i/2,partNumber:i?`GM-PAD-1G-${(i/2).toFixed(1)}=`:'GM-PAD-1G-00=',legacyPartNumber:String(589693+i),source:{...SOURCES.manual,locator:'pp.103–104'}})));
export const DIRECTORS=freeze({
 ...digicomm.directors,
 splitter:{source:SOURCES.hgd40,status:'estimated',note:'Part identifier sourced; 3.5 dB per leg is a nominal engineering estimate, not a verified loss curve.',id:'splitter',label:'2-way splitter',partNumber:'4008364',losses:{main:0,aux1:3.5,aux2:3.5}},
 dc8:{source:SOURCES.hgd40,status:'estimated',note:'Part identifier sourced; 1.5/8 dB are nominal engineering estimates, not verified loss curves.',id:'dc8',label:'DC-8',partNumber:'4008365',losses:{main:0,aux1:1.5,aux2:8}},
 dc12:{source:SOURCES.hgd40,status:'estimated',note:'Part identifier sourced; 1/12 dB are nominal engineering estimates, not verified loss curves.',id:'dc12',label:'DC-12',partNumber:'4008366',losses:{main:0,aux1:1,aux2:12}},
 jumper:{source:SOURCES.hgd40,status:'estimated',note:'Part identifier sourced; lossless selected leg is a planning estimate. Unconnected leg remains unknown.',id:'jumper',label:'Jumper to Aux 1',partNumber:'4008208',losses:{main:0,aux1:0,aux2:null}}
});
/** Interpolation preserves missing cells and never extrapolates. */
export function sampleAt(samples,f){
 if(!Number.isFinite(f)||!Array.isArray(samples))return null;
 const p=samples.filter(x=>Array.isArray(x)&&Number.isFinite(x[0])).slice().sort((a,b)=>a[0]-b[0]);
 const exact=p.find(x=>x[0]===f);if(exact)return Number.isFinite(exact[1])?exact[1]:null;
 const i=p.findIndex(x=>x[0]>f);if(i<1)return null;
 const a=p[i-1],b=p[i];if(!Number.isFinite(a[1])||!Number.isFinite(b[1]))return null;
 return a[1]+(b[1]-a[1])*(f-a[0])/(b[0]-a[0]);
}
export function lookupPartLoss(id,f){
 const matches=PARTS[id]?[PARTS[id]]:Object.values(PARTS).filter(p=>p.partNumber===id||p.identifiers.includes(id));
 const p=matches.length===1?matches[0]:null;
 const base={value:null,status:'unknown',partId:p?.id||null,source:p?.source||null};
 if(!p||!Number.isFinite(f)||f<p.band[0]||f>p.band[1]||(!p.orderingValue&&!p.zeroLossPublished))return {...base,reason:'Unsupported frequency, absent curve, or jumper with no published loss cells.'};
 const exact=p.points.find(x=>x[0]===f);
 if(exact&&Number.isFinite(exact[1]))return {...base,value:exact[1],status:'published-typical'};
 if(p.familyId==='standard-return-204')return {...base,reason:'Only 5/204 MHz endpoints published; no interior curve.'};
 const value=sampleAt(p.points,f);
 return {...base,value,status:value===null?'unknown':'estimated',reason:'Linear interpolation between sourced table cells; sparse intervals may not represent actual curve.'};
}
