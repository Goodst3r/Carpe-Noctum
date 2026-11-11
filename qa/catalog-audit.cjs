const fs=require('fs'),assert=require('assert');
const c=JSON.parse(fs.readFileSync(__dirname+'/../night-sweep/catalog.json','utf8'));
let curves=0, points=0;
for(const group of ['devices','cables','powerEquipment']) {const ids=c[group].map(x=>x.id);assert.equal(new Set(ids).size,ids.length,group+' duplicate ids');}
function curve(x,label){ if(!x)return;curves++;assert(Number.isFinite(x.min)&&Number.isFinite(x.max)&&x.max>=x.min,label+' range');
const rows=x.points||x.bands;assert(rows&&rows.length,label+' rows');
rows.forEach((p,i)=>{points++;assert(p.every(Number.isFinite),label+' finite');assert(p[p.length-1]>=0,label+' nonnegative');if(i)assert(p[0]>rows[i-1][0],label+' ordered');if(x.points)assert(p[0]>=x.min&&p[0]<=x.max,label+' bounds');else {assert(p.length===3&&p[1]>p[0],label+' band');if(i)assert(p[0]>=rows[i-1][1],label+' overlap');}});}
for(const d of c.devices){assert(d.id&&d.label&&d.family&&d.ports,d.id);assert.equal(new Set(d.ports.map(p=>p.id)).size,d.ports.length,d.id+' duplicate ports');for(const p of d.ports){assert(p.label&&p.role,d.id);curve(p.nominal,d.id+'/'+p.id+'/nominal');curve(p.maximum,d.id+'/'+p.id+'/maximum');}}
for(const cable of c.cables){curve(cable.curve,cable.id);if(cable.dc&&Number.isFinite(cable.dc.inner_ohm_per_1000ft)&&Number.isFinite(cable.dc.outer_ohm_per_1000ft))assert(Math.abs(cable.dc.loop_ohm_per_1000ft-cable.dc.inner_ohm_per_1000ft-cable.dc.outer_ohm_per_1000ft)<1e-8,cable.id+' dc total');}
for(const e of c.powerEquipment){if(e.mode==='curve'){assert(e.source_url,e.id+' source');curve({min:e.min_voltage,max:e.max_voltage,points:e.points},e.id);}}
console.log(JSON.stringify({passiveEntries:c.devices.length,cables:c.cables.length,equipment:c.powerEquipment.length,curves,points,status:'PASS'},null,2));
