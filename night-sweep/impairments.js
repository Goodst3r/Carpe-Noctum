/* Build 3 impairment decision tree and signature cards (build list item 11).
   The technician picks what the meter or spectrum display shows; the screen shows the matching card:
   what it looks like, what usually causes it in the plant, look-alikes, and a five-step flow (analyze,
   localize, prioritize, repair, validate). The standing-wave card finds candidate places on the saved
   route from the ripple spacing. Wording is our own paraphrase; SCTE 280 2022 (downstream) is the source for
   most cards and the SCTE PNM series (April 2026) for the five-step flow. Nothing is read from a meter or
   modem, nothing is stored, and a candidate is a place to look first, not a finding. */
const Impairments=(()=>{
 const FLOW=Object.freeze(['analyze','localize','prioritize','repair','validate']);
 const FLOW_LABEL=Object.freeze({analyze:'Analyze',localize:'Localize',prioritize:'Prioritize',repair:'Repair',validate:'Validate'});
 const SEARCH_WIDTH_PERCENT=10;           // default width of the candidate search, ± percent of the distance (Expert, adjustable)
 const MAX_CANDIDATES=12;
 const SOURCES=Object.freeze({
  scte280:'SCTE 280 2022, Understanding and Troubleshooting Cable RF Spectrum',
  pnm:'SCTE PNM course series announcement, April 30, 2026'
 });
 /* What the meter shows, in plain words, and the card each leads to. */
 const SHAPES=Object.freeze([
  {id:'ripple',text:'A regular up-and-down ripple that repeats across the spectrum, with the same spacing in MHz',card:'standing-wave'},
  {id:'notch',text:'One notch, a dip that spans a few channels',card:'suckout'},
  {id:'hump',text:'One hump that rises and falls again, sometimes with a dip beside it',card:'resonant-peaking'},
  {id:'high-decline',text:'Levels fall away gradually toward the top of the band',card:'roll-off'},
  {id:'slope',text:'A steady slope across the band: the high end too high or too low against the low end',card:'tilt'},
  {id:'flat-drop',text:'Every frequency is lower by about the same amount',card:'flat-loss'},
  {id:'spikes',text:'Narrow spikes at fixed frequencies, in the downstream or the upstream, such as in the FM or VHF range',card:'ingress'},
  {id:'cellular',text:'Interference high in the downstream band, near the cellular range, above about 600 MHz',card:'lte-ingress'},
  {id:'return-floor',text:'A raised noise floor, or repeating hump-shaped haystacks, on the upstream that goes with the downstream signals',card:'cpd'},
  {id:'bursts',text:'Short bursts of wide-band noise across much of the upstream',card:'impulse'}
 ]);
 const GROUPS=Object.freeze(['Ripple and reflections','Level and frequency response','Noise and ingress']);
 const CARDS=Object.freeze([
  {id:'standing-wave',name:'Standing wave (ripple)',group:GROUPS[0],ref:'SCTE 280 §9.7, §9.7.1 to §9.7.3',verified:'primary',
   looks:'A periodic rise and fall in level, like a sine wave, across the spectrum. The peaks keep the same spacing in MHz. The wider the spacing, the shorter the distance between the two mismatches.',
   causes:['An impedance mismatch at two points on the cable path between the node and the modem: any active or passive device, a loose or damaged connector, a damaged cable, water, a missing or bad terminator.','Several ripples laid over one another (compound) point to more than two mismatches.','A ripple that shrinks with frequency is normal for a long echo path, because the cable attenuates the reflection.'],
   lookalikes:['Irregular, non-periodic waves that move around are usually water in a drop or passive (the water-wave pattern), not a standing wave.','A single notch is a suckout, which is a very short standing wave.'],
   flow:{analyze:'Read the spacing between neighbouring peaks in MHz on a spectrum or channel-response display, and the velocity of propagation of the cable.',
    localize:'Distance between the two mismatches = 492 × velocity of propagation ÷ peak spacing in MHz, in feet. Enter the spacing below: the tool lists the places on the saved route that are that far apart.',
    prioritize:'A standing wave affects the whole spectrum. Work first on ripple that shows on several modems on the same node, then on the strongest ripple.',
    repair:'Look at the connector, splitter, tap, terminator or cable at both ends of each candidate span, and at the device nearest the source of the reflection. Fix the worst mismatch first, then look again.',
    validate:'Capture the spectrum again. The ripple should be gone or much smaller, and levels and modem error rates should recover.'}},
  {id:'suckout',name:'Suckout',group:GROUPS[1],ref:'SCTE 280 §9.3, §9.3.1, §9.3.2',verified:'primary',
   looks:'One notch in the frequency response that often spans several channels. It is a half period of a long standing wave caused by a very short reflection.',
   causes:['Loose or poorly made mechanical parts in an active or passive: seizure mechanisms and screws, module retainer screws, connectors, housing lids that are not torqued, a hardline connector pin of the wrong length, a kinked cable.','Manufacturing faults: cold solder joints, poor module grounding, some third-party accessories that do not meet the maker\'s specification.','Several mismatches spaced evenly through the plant add to the width and depth of one notch.'],
   lookalikes:['A suckout at the top band edge can look like roll-off.','A filter or a missing channel is a flat gap, not a notch with sloping sides.'],
   flow:{analyze:'Note the frequency and depth of the notch and whether the same notch shows on several modems or only one.',
    localize:'If it shows on many modems on the node, work upstream toward the node, one active at a time. If on one modem, start at the house. Use a sweep or spectrum view before and after you touch a part.',
    prioritize:'Take the notch that falls on a pilot or on many channels first.',
    repair:'Check and re-seat the seizure screws, module retainers and connector pins, torque the lid, replace a kinked cable or a faulty part.',
    validate:'Look at the response again. The notch should be gone, and affected channels should recover.'}},
  {id:'resonant-peaking',name:'Resonant peaking',group:GROUPS[1],ref:'SCTE 280 §9.5, §9.5.1, §9.5.2',verified:'primary',
   looks:'A hump: the level rises over a narrow range and then falls back. It sometimes comes with a notch. It is easiest to see on the full-spectrum response and it can come and go or move in frequency.',
   causes:['Poor or degraded grounding inside an active (node or amplifier): a module that is not fully seated, oxidation, loose screws. This can make the device oscillate at one frequency.','Improper alignment techniques.','A faulty passive can sometimes look like a peak.','It can depend on temperature, so it may be worse at some hours.'],
   lookalikes:['A peak and a standing wave can look alike on a short capture: a standing wave repeats, a resonant peak does not.'],
   flow:{analyze:'Find the frequency of the hump and whether it comes and goes with temperature or time of day.',
    localize:'It usually comes from an active. If the hump is on a pilot, the amplifiers react to it level for level and several channels move; if it is away from the pilot, the damage shows as poor SNR and error rates on nearby channels.',
    prioritize:'Take a hump on or near an AGC pilot first: it changes the levels of the other channels downstream of it.',
    repair:'Re-seat the module, check the ground and the screws on the housing and the module, clean oxidation, and check the alignment.',
    validate:'Watch the response over a warm and a cool part of the day. The hump should stay gone.'}},
  {id:'roll-off',name:'Roll-off',group:GROUPS[1],ref:'SCTE 280 §9.6 to §9.6.4',verified:'primary',
   looks:'A gradual, curved decline in level toward the top of the frequency range. It is not a straight tilt.',
   causes:['Water in passives or cable, from water that has travelled along the cable. High frequencies are lost first.','Devices with a pass band that is too low for the signals sent through them, such as older components built for 450, 550, 650, 750 or 870 MHz; several in a row make the roll-off sharper.','Amplifier or node equalizers that stop below the top of the plant, or old cable that was not built for today\'s frequencies.','Improper alignment, and environment.'],
   lookalikes:['A suckout at the upper band edge can look like roll-off.','A steady slope is tilt, not roll-off.'],
   flow:{analyze:'Note the frequency where the decline starts and how fast it falls. Check it on more than one modem.',
    localize:'If it appears at the same place for many modems, it is in the shared plant: step back toward the node. If one house, check the drop, tap and splitters for water.',
    prioritize:'A roll-off that takes channels out of service goes first, then one that only eats margin.',
    repair:'Replace water-damaged parts, replace band-limited devices and cable, and correct the equalizer and alignment.',
    validate:'Measure again at the same points. The decline should be gone, and the top channels should come back.'}},
  {id:'tilt',name:'Tilt',group:GROUPS[1],ref:'SCTE 280 §9.8 (heading only); SCTE PNM series, Course 4',verified:'unverified',
   looks:'Level that changes steadily from the low end of the band to the high end: the high end sits above or below the low end by more than the plant design expects.',
   causes:['Equalizer or pad settings that do not fit the cable and devices ahead of them, or alignment that was not done for the current temperature.','Cable or passive loss that differs from the design.','A device that passes the low end but not the high end.'],
   lookalikes:['A curved decline at the top is roll-off, not tilt.','Every frequency lower by the same amount is flat loss.'],
   flow:{analyze:'Read the level at a low and a high pilot and subtract. Compare with the design tilt and your company\'s target, which the app does not know.',
    localize:'Check where along the cascade the tilt appears: measure at the input and output of each active.',
    prioritize:'Take the active that adds the most error, or the first one where the error appears.',
    repair:'Adjust the input equalizer and pad as the maker\'s procedure says (the Calculators card for the pad and EQ shows the published steps), or fix the part that is out of design.',
    validate:'Measure the two pilots again and confirm the tilt is back inside your target.'}},
  {id:'flat-loss',name:'Excessive flat loss',group:GROUPS[1],ref:'SCTE 280 §9.9 (heading only); SCTE PNM series, Course 4',verified:'unverified',
   looks:'The whole spectrum sits lower by about the same number of dB at every frequency, with the same shape as a good response.',
   causes:['A part or connection that adds loss equally at all frequencies: a bad connector, a pad that is too large, a damaged or very long cable.','A device that is not delivering its gain.'],
   lookalikes:['Loss that grows with frequency is tilt or roll-off.'],
   flow:{analyze:'Check whether the shape is unchanged and only the level is down. Note by how many dB.',
    localize:'Compare levels against the design at each point along the path. The step where the drop begins is the place.',
    prioritize:'Take a drop that puts channels below the modem\'s input range, or one that affects many customers, first.',
    repair:'Clean and tighten the connector, replace a bad pad or cable, or repair the device.',
    validate:'Measure again at the same point and confirm the level is back to the design value.'}},
  {id:'ingress',name:'Ingress (narrow-band)',group:GROUPS[2],ref:'SCTE 280 §9.4, §9.4.2, §9.4.4; SCTE 294 2024r1',verified:'primary',
   looks:'Narrow spikes at fixed frequencies on the noise floor or between channels, for example from FM broadcast, VHF, UHF, two-way radio or amateur radio. They can be steady or come and go.',
   causes:['A fault in the shielding of the network: loose, wrong or damaged connectors, cracked shielding, rodent chews, warped or loose lids on amplifiers and passives.','Damaged drop cable, including a drop that is old or kinked.','Ingress can sit on any frequency, so a spike at one frequency does not mean other frequencies are clear.'],
   lookalikes:['Direct pickup enters a device without a cable.','HPNA and other in-home signals are inside the plant, not over the air.'],
   flow:{analyze:'Note the frequencies and whether they match a known broadcaster or service. Check whether it is steady or intermittent.',
    localize:'Compare modems or nodes: ingress that shows on many at once is early in the path; on one it is at the house. Move toward the stronger reading.',
    prioritize:'Ingress near the node end of the downstream path or in the upstream affects the most customers.',
    repair:'Tighten or replace connectors, replace damaged cable or drops, close and torque lids, replace a faulty passive.',
    validate:'Look again at the same frequencies. The spikes should be gone, and leakage readings for that span should be clean.'}},
  {id:'lte-ingress',name:'Cellular (LTE) ingress',group:GROUPS[2],ref:'SCTE 280 §9.4.3',verified:'primary',
   looks:'Interference that comes from cellular devices and base stations, shown high in the downstream band: above about 600 MHz.',
   causes:['The same kinds of shielding faults as other ingress: connectors, drops, lids, damaged cable.','It is strongest near towers and where devices are used close to the cable.'],
   lookalikes:['A suckout or a roll-off at the top of the band is not narrow-band.'],
   flow:{analyze:'Note the frequency range and compare it with the cellular bands that are in use in your area.',
    localize:'Check the places with the cellular interference first: the drop and the tap at the affected house, then the plant.',
    prioritize:'Take interference that falls on a channel that carries service before one in a guard band.',
    repair:'Replace damaged or loose connectors and drop cable and check shielding at each passive.',
    validate:'Capture the downstream again. The cellular interference should be gone from the channels it was in.'}},
  {id:'cpd',name:'Common path distortion (CPD)',group:GROUPS[2],ref:'SCTE 280 §9.4.7; SCTE 294 2024r1',verified:'primary',
   looks:'In the upstream, a raised noise floor (third order) or repeating hump-shaped haystacks (second order) that appear when the downstream signals are present. It is not ingress, and not true noise, though it can look like noise.',
   causes:['The downstream signals pass through a diode-like nonlinearity where corrosion has formed in the signal path shared by the downstream and the upstream: a loose seizure screw, a defective end-of-line terminator, a corroded connector.','The oxide layer is fragile, so wind, vibration, temperature and the downstream level can make it come and go.'],
   lookalikes:['Impulse and burst noise are short events, not a steady raised floor.','Ingress is at fixed frequencies, not a smooth floor.'],
   flow:{analyze:'Look at the upstream with the downstream carriers present and note the shape of the floor and any haystacks.',
    localize:'Because it comes and goes, check places where the shared path has metal-to-metal joints: amplifier seizure screws, terminators, connectors, starting at the strongest reading.',
    prioritize:'Take CPD that raises the floor under upstream channels used by many modems first.',
    repair:'Re-seat and tighten seizure screws and connectors, replace defective terminators and corroded parts.',
    validate:'Watch the upstream for a period that covers wind and temperature changes. The floor should stay down.'}},
  {id:'impulse',name:'Impulse and burst noise',group:GROUPS[2],ref:'SCTE 280 §9.4.6; SCTE 294 2024r1',verified:'primary',
   looks:'Short bursts of noise across much of the upstream. They can be power-line gap noise, which comes from sparking or arcing on power lines and related hardware.',
   causes:['Power-line gap noise getting into the cable network as ingress, or coupling in through code-required neutral bonds.','Other sources of sparks and bursts near the plant.'],
   lookalikes:['A steady raised floor is not impulse noise.'],
   flow:{analyze:'Note how often the bursts occur and whether they follow a pattern, for example wet weather or time of day.',
    localize:'Electric utilities use special equipment to find gap noise at the source. Ask for help from the utility RFI group for a power-line source.',
    prioritize:'Bursts that damage many upstream channels, or that appear on many nodes, go first.',
    repair:'Fix the cable-side entry points (connectors, drops, lids) and ask the utility to repair a power-line source.',
    validate:'Check the upstream again over a similar period and conditions.'}}
 ]);
 const byId=Object.freeze(Object.fromEntries(CARDS.map(c=>[c.id,c])));
 const card=id=>Object.prototype.hasOwnProperty.call(byId,id)?byId[id]:null;
 const cardForShape=shapeId=>{const s=SHAPES.find(x=>x.id===shapeId);return s?card(s.card):null;};

 /* ---- Standing wave: candidate places on the saved route ---- */
 const number=x=>(typeof x==='number'||typeof x==='string')&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const fail=error=>({ok:false,error});
 const pointName=r=>String(r?.row?.name||'').trim()||String(r?.id||'');
 /* Two mismatches this far apart give the ripple. A candidate is a pair of points on one path of the route whose cable
    distance is within the search width of that distance: the launch point and each point's end of its incoming span. */
 function candidates(state,catalog,distanceFeet,widthPercent=SEARCH_WIDTH_PERCENT){
  const D=number(distanceFeet),w=number(widthPercent);
  if(D===null||!(D>0))return fail('Enter the ripple spacing and the cable velocity first, so there is a distance to look for.');
  if(w===null||!(w>0)||w>50)return fail('Enter a search width above 0 and at most 50 percent.');
  if(typeof HFC==='undefined'||typeof HFC.routeDistances!=='function')return fail('The route calculation is not available.');
  const distances=HFC.routeDistances(state,catalog);
  const rows=distances.rows.filter(r=>!r.error&&Number.isFinite(r.end));
  if(!rows.length)return fail('The saved route has no point with a valid distance. Build the route in Route → Cable route first.');
  const byId=new Map(distances.rows.map(r=>[r.id,r]));
  const found=[];
  for(const r of rows){
   // walk back along this point's path to the launch, taking each earlier end as a possible first mismatch
   const path=[];let cur=r;
   while(cur){path.push(cur);cur=cur.parentId?byId.get(cur.parentId):null;if(path.length>rows.length+1)break;}
   const ancestors=[{id:'source',name:'Launch',end:0},...path.slice(1).reverse().map(p=>({id:p.id,name:pointName(p),end:p.end}))];
   for(const a of ancestors){
    const feet=r.end-a.end;
    if(!(feet>0))continue;
    const errorPercent=(feet-D)/D*100;
    if(Math.abs(errorPercent)<=w+1e-9)found.push({from:a.id,fromName:a.name,to:r.id,toName:pointName(r),feet,errorPercent});
   }
  }
  found.sort((x,y)=>Math.abs(x.errorPercent)-Math.abs(y.errorPercent)||x.feet-y.feet||x.to.localeCompare(y.to)||x.from.localeCompare(y.from));
  const shown=found.slice(0,MAX_CANDIDATES);
  return {ok:true,distance:D,widthPercent:w,candidates:shown,total:found.length,truncated:found.length>shown.length,routePoints:rows.length,invalidPoints:distances.rows.length-rows.length};
 }
 return {FLOW,FLOW_LABEL,SEARCH_WIDTH_PERCENT,MAX_CANDIDATES,SOURCES,SHAPES,GROUPS,CARDS,card,cardForShape,candidates};
})();

const ImpairmentsUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(id,context)=>typeof Thresholds!=='undefined'?Thresholds.tag(id,context):'';
 const trim=(v,d=1)=>String(Number(v.toFixed(d)));
 let selected='',initialized=false;
 function shapePicker(){
  return `<fieldset class="imp-picker"><legend>What does the meter or spectrum show?</legend>${Impairments.SHAPES.map(s=>`<label class="imp-shape"><input type="radio" name="impShape" value="${s.id}"${selected===s.id?' checked':''}><span>${escape(s.text)}</span></label>`).join('')}</fieldset>`;
 }
 function flow(c){
  return `<ol class="imp-flow">${Impairments.FLOW.map(k=>`<li><strong>${Impairments.FLOW_LABEL[k]}.</strong> ${escape(c.flow[k])}</li>`).join('')}</ol>`;
 }
 function rippleTool(){
  return `<div class="imp-tool" id="impRipple"><h4>Find the two mismatches on the saved route ${tag('calc.ripple.distance','ripple to distance')}</h4><div class="calc-fields"><label>Ripple spacing, peak to peak (MHz)<input type="number" step="any" data-imp="spacing" placeholder="e.g. 1.7"></label><label>Cable velocity of propagation (VP)<input type="number" step="any" data-imp="vp" placeholder="e.g. 0.87"></label><label>Search width (± percent) ${tag('app.impairment.rippleSearchWidth','candidate search width')}<input type="number" step="any" data-imp="width" value="${Impairments.SEARCH_WIDTH_PERCENT}"></label></div><div class="calc-result" id="impRippleResult" role="status" aria-live="polite"></div><p class="note calc-conditions">The distance is the cable length between the two mismatches. Either end can be a connector, splitter, tap, amplifier or the cable itself, so a candidate is a place to look first, not a finding. The search only uses the route you saved in this job; it reads nothing from a meter.</p></div>`;
 }
 function cardMarkup(c){
  return `<article class="imp-card" aria-labelledby="impCardTitle"><div class="calc-card-head"><h3 id="impCardTitle">${escape(c.name)}</h3><span class="note">${escape(c.group)}</span></div>${c.verified==='unverified'?'<p class="status warning">The body text of the source for this card was not read: the wording is general practice, labeled Expert. Check it against your company\'s procedure.</p>':''}<h4>What it looks like</h4><p>${escape(c.looks)}</p><h4>What usually causes it</h4><ul>${c.causes.map(x=>`<li>${escape(x)}</li>`).join('')}</ul><h4>Easily mistaken for</h4><ul>${c.lookalikes.map(x=>`<li>${escape(x)}</li>`).join('')}</ul><h4>Five steps</h4>${flow(c)}${c.id==='standing-wave'?rippleTool():''}<p class="note calc-conditions">What it looks like and what causes it follow ${escape(c.ref)}, paraphrased and not copied. The five-step order (analyze, localize, prioritize, repair, validate) is the SCTE PNM series workflow; the steps under each are general practice, labeled Expert, and are not your company's procedure.</p></article>`;
 }
 function render(){
  const body=document.getElementById('impBody');if(!body)return;
  const c=Impairments.cardForShape(selected);
  body.innerHTML=c?cardMarkup(c):'<p class="note">Choose what you see above to open its card.</p>';
  if(c&&c.id==='standing-wave')updateRipple();
 }
 function updateRipple(){
  const out=document.getElementById('impRippleResult');if(!out)return;
  const v={};document.querySelectorAll('[data-imp]').forEach(el=>{v[el.dataset.imp]=el.value;});
  if(String(v.spacing??'').trim()===''&&String(v.vp??'').trim()===''){out.classList.remove('error');out.innerHTML='<p class="note">Enter the spacing and the cable velocity to see the distance and the candidate places on your route.</p>';return;}
  const r=typeof FieldCalc!=='undefined'?FieldCalc.rippleDistance(v.spacing,v.vp):{ok:false,error:'The ripple calculator is not available.'};
  if(!r.ok){out.classList.add('error');out.innerHTML=`<p class="note">${escape(r.error)}</p>`;return;}
  out.classList.remove('error');
  const head=`<div class="health-row"><span>Distance between the two mismatches</span><strong>${trim(r.feet,1)} <small>ft (${trim(r.meters,1)} m)</small></strong></div>`;
  const s=typeof state!=='undefined'?state:null,cat=typeof catalog!=='undefined'?catalog:null;
  const found=Impairments.candidates(s,cat,r.feet,v.width===''?undefined:v.width);
  if(!found.ok){out.innerHTML=`${head}<p class="note">${escape(found.error)}</p>`;return;}
  if(!found.candidates.length){out.innerHTML=`${head}<p class="health-status neutral">• No pair of points on the saved route is ${trim(found.distance,1)} ft ± ${trim(found.widthPercent,1)}% apart. The reflection may be on a part of the plant that is not in the route, or one end may be a device the route does not show. Widen the search or check the spacing and VP.</p>`;return;}
  const rows=found.candidates.map(c=>`<tr><td>${escape(c.fromName)}</td><td>${escape(c.toName)}</td><td>${trim(c.feet,1)} ft</td><td>${c.errorPercent>0?'+':c.errorPercent<0?'−':''}${trim(Math.abs(c.errorPercent),1)}%</td></tr>`).join('');
  out.innerHTML=`${head}<p class="health-status neutral">• ${found.total} candidate ${found.total===1?'place':'places'} on the saved route${found.truncated?' (the closest '+found.candidates.length+' are shown)':''}.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Candidate places on the route"><table class="leak-table"><thead><tr><th scope="col">From</th><th scope="col">To</th><th scope="col">Cable between</th><th scope="col">Difference</th></tr></thead><tbody>${rows}</tbody></table></div>`;
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>Impairments</h2><p class="note tight">Pick what the meter or spectrum shows. Each card gives what it looks like, what usually causes it, and five steps: analyze, localize, prioritize, repair, validate. Written for this app from SCTE 280 and the SCTE PNM series; it is your own aid and not your company's procedure. Nothing is read from a meter and nothing is stored.</p></div></div>${shapePicker()}<div id="impBody" class="imp-body"></div>`;
 }
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('impairmentsPanel');if(!panel)return;
  panel.innerHTML=markup();render();
  panel.addEventListener('change',event=>{
   const t=event.target;if(!panel.contains(t))return;
   if(t.name==='impShape'){selected=t.value;render();}
   else if(t.dataset&&t.dataset.imp)updateRipple();
  });
  panel.addEventListener('input',event=>{const t=event.target;if(t.dataset&&t.dataset.imp)updateRipple();});
 }
 return {init,render,updateRipple,select:id=>{selected=id;render();}};
})();
