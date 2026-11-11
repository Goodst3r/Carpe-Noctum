'use strict';
// Source-backed regression guards for node procedure applicability, not field acceptance.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const catalog=read('night-sweep/catalog.json'),records=read('night-sweep/setup-manuals.json').records;
const expected=[
 'gs7000-1g-manual','gs7000-12g-manual','gs7000-sho-manual','gs7000-intelligent-manual',
 'gs7000-intelligent-lcs','gs7000-intelligent-manager24','en9000-2026-brief',
 'en9000-2025-brief','en9000-2024-brief','vecima-manual-access',
 'en9000-erm3-2026-brief','en9000-erm4-2026-brief'
];
const known=new Set(['devices','nodeProfiles','powerEquipment'].flatMap(k=>(catalog[k]||[]).map(r=>r.id)));
const get=id=>{const matches=records.filter(r=>r.id===id);assert.equal(matches.length,1,id+' must have one current record');return matches[0];};
const text=r=>[r.title,r.revision,r.sections,r.scope,...(r.steps||[]),...(r.gaps||[])].join('\n');
let checks=0,failures=0;
function check(label,fn){try{fn();checks++;console.log('PASS '+label);}catch(e){failures++;console.error('FAIL '+label+'\n'+e.message);}}

check('All twelve refreshed records exist once and map only to catalog equipment',()=>{
 for(const id of expected){const r=get(id);assert(r.equipmentIds.length,id);for(const key of r.equipmentIds)assert(known.has(key),id+': '+key);assert(['manual','datasheet','request'].includes(r.kind));}
});
check('Standard optical manuals do not cross-map 1 GHz, 1.2 GHz, SHO or Intelligent variants',()=>{
 assert.deepEqual(get('gs7000-1g-manual').equipmentIds,['gs7000-1g','gs7000-1g-1rx-1tx','gs7000-1g-4rx-4tx']);
 assert.deepEqual(get('gs7000-12g-manual').equipmentIds,['gs7000-12g','gs7000-12g-1rx-1tx','gs7000-12g-4rx-4tx']);
 assert.deepEqual(get('gs7000-sho-manual').equipmentIds,['gs7000-12g-fiberdeep']);
 for(const id of ['gs7000-intelligent-manual','gs7000-intelligent-lcs','gs7000-intelligent-manager24'])assert.deepEqual(get(id).equipmentIds,['gs7000-12g-intelligent']);
});
check('1 GHz standard procedure retains exact revision and forward/reverse page ranges',()=>{
 const r=get('gs7000-1g-manual');assert.match(r.revision,/OL-29643-02/);assert.match(r.sections,/107\s*[–-]\s*110/);assert.match(r.sections,/111\s*[–-]\s*112/);assert.match(r.url,/Cisco-GS7000-GainMaker-Scalable-4-Port-Node-Installation-and-Operation-Guide\.pdf$/);
});
check('Standard 1.2 GHz manual fixes first publication and printed setup pages',()=>{
 const r=get('gs7000-12g-manual');assert.match(r.revision,/October\s*2015/);assert.match(r.sections,/93\s*[–-]\s*95/);assert.match(r.sections,/96\s*[–-]\s*97/);assert.match(r.url,/Cisco-1_2-GHz-GS7000-Node-Installation-and-Operation-Guide\.pdf$/);
 assert.match(text(r),/receiver-specific|receiver table/i);assert.match(text(r),/not.*(?:borrow|universal)|do not borrow/i);
});
check('Optical procedures expose actual OIB/output pad and EQ adjustment points',()=>{
 for(const id of ['gs7000-1g-manual','gs7000-12g-manual','gs7000-sho-manual']){const s=get(id).steps.join(' ');assert.match(s,/OIB/);assert.match(s,/FWD PORT OUT/);assert.match(s,/EQ/);assert.match(s,/design/i);}
});
check('Conventional LCM discovery cannot be presented as RF level or tilt auto alignment',()=>{
 for(const id of ['gs7000-1g-manual','gs7000-12g-manual','gs7000-sho-manual']){const s=text(get(id));assert.match(s,/module discovery|discovers (?:installed )?modules/i);assert.match(s,/not (?:perform |the )?(?:Intelligent|RF)|does not perform RF/i);}
});
check('Intelligent hardware record explicitly rejects physical RF test-point correction',()=>{
 const s=text(get('gs7000-intelligent-manual'));assert.match(s,/no physical.*test points/i);assert.match(s,/internal spectrum/i);assert.match(s,/never.*(?:−|-|20).*correction/i);
});
check('Intelligent LCS saves enabled Port 1 targets before forward Auto Setup',()=>{
 const r=get('gs7000-intelligent-lcs'),steps=r.steps.join('\n');assert.match(r.sections,/RF Configuration/);assert.match(r.url,/chapter_0100\.html$/);
 const targetIndex=r.steps.findIndex(s=>/Port\s*1/i.test(s)&&/sav/i.test(s)&&/enable/i.test(s));
 const runIndex=r.steps.findIndex(s=>/start Auto Setup/i.test(s));assert(targetIndex>=0);assert(runIndex>targetIndex);
 assert.match(steps,/MHz/);assert.match(steps,/dBmV/);assert.match(steps,/does not align the return/i);assert.match(text(r),/4\s*[–-]\s*7\s*minutes/i);assert.match(steps,/AGC|alarms/);
});
check('Remote manager guidance stays version-specific and is an alternative to LCS',()=>{
 const r=get('gs7000-intelligent-manager24'),s=text(r);assert.match(r.revision,/24\.1/);assert.match(r.url,/24-1\/m-inode-manager-usage\.html$/);assert.match(s,/4\.0\.0/);assert.match(s,/alternative/i);assert.match(s,/Port\s*1/);assert.match(s,/Save RF settings/i);assert.match(s,/Normal/);
});
check('SHO source conflict preserves both 21 and 22 dB without turning them into job targets',()=>{
 const r=get('gs7000-sho-manual');assert.match(r.sections,/60/);assert.match(r.sections,/63/);const gap=r.gaps.join(' ');assert.match(gap,/21\s*dB/);assert.match(gap,/22\s*dB/);assert.match(gap,/conflict/i);assert.match(gap,/not.*(?:universal|target)/i);assert.match(r.steps.join(' '),/common EQ/);assert.match(r.steps.join(' '),/left\/right EQ/i);
});
check('Newest EN9000 public brief is a September 2026 datasheet with no invented setup steps',()=>{
 const r=get('en9000-2026-brief');assert.equal(r.kind,'datasheet');assert.match(r.url,/2026\/09\/Vecima-Product-Brief-EN9000-Sep2026\.pdf$/);assert.match(r.revision,/September\s*2026/);assert.deepEqual(r.steps,[]);assert.match(text(r),/not.*(?:setup|installation|AGC)/i);assert.match(text(r),/ERM3/);assert.match(text(r),/not.*(?:launch targets|launch target)/i);
});
check('New EN9000 source does not erase the older test-point provenance',()=>{
 const old=get('en9000-2024-brief'),fresh=get('en9000-2026-brief');assert.match(old.url,/2024\/05/);assert.match(text(old),/20\s*±\s*1/);assert.match(text(fresh),/May\s*2024/);assert.match(text(fresh),/does not.*(?:repeat|restate)|not restated|No.*coupling.*restated/i);assert.deepEqual(old.steps,[]);
});
check('ERM3 and ERM4 references preserve module and configuration boundaries',()=>{
 const three=get('en9000-erm3-2026-brief'),four=get('en9000-erm4-2026-brief');for(const r of [three,four]){assert.equal(r.kind,'datasheet');assert.deepEqual(r.steps,[]);assert.deepEqual(r.equipmentIds,['vecima-en9000','vecima-en9000-manual']);}
 assert.match(text(three),/1\.2\s*GHz/);assert.match(text(three),/204\s*MHz/);assert.match(text(three),/not.*(?:whole-node|node AC)/i);assert.match(text(four),/March\s*2026/);assert.match(text(four),/discrepancy/i);assert.match(text(four),/Do not use ERM3/i);
});
check('Vecima portal gap cannot masquerade as a verified commissioning procedure',()=>{
 const r=get('vecima-manual-access');assert.equal(r.kind,'request');assert.deepEqual(r.steps,[]);assert.match(r.url,/vecima\.com\/company\/product-support\//);assert.match(text(r),/Customer Portal/i);assert.match(text(r),/not verified|unverified/i);assert.match(text(r),/No EN9000 AGC command/i);
});
check('EN9000 has no fabricated whole-node current curve or zero-watt default',()=>{
 const p=catalog.powerEquipment.find(r=>r.id==='vecima-en9000-manual');assert(p);assert.equal(p.manual,true);assert.equal(p.watts,null);assert.equal(p.power_factor,null);assert(!Array.isArray(p.points)||p.points.length===0);
 const s=text(get('en9000-2026-brief'));assert.match(s,/180\s*W/);assert.match(s,/200\s*W/);assert.match(s,/do not define typical AC/i);
});
console.log(`Node setup refresh: ${checks} checks passed; ${failures} failed`);
if(failures)process.exitCode=1;
