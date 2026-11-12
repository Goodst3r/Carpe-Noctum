/* Study mode (build list item 19, 2.0 Alpha build 3): original practice questions built from this app's own calculators
   and reference screens, tagged by the five SCTE BDS domains (architectures; distribution components; signal types;
   maintenance and troubleshooting; safety and construction). Nothing here is taken from an SCTE or NCTI exam or question
   bank: every question is generated from a calculator or a screen of this app, with numbers chosen on a fixed grid from a
   seed, and its answer is computed by the same function the app uses. Practice only: a score is kept for this visit,
   never saved, and it is not a test result. */
const StudyMode=(()=>{
 const DOMAINS=Object.freeze([
  {id:'architectures',name:'Architectures'},
  {id:'components',name:'Distribution components'},
  {id:'signals',name:'Signal types'},
  {id:'troubleshooting',name:'Maintenance and troubleshooting'},
  {id:'safety',name:'Safety and construction'}
 ].map(Object.freeze));
 /* A small seeded generator, so a question can be reproduced from its number and seed. */
 function rng(seed){
  let a=(Math.trunc(seed)>>>0)||1;
  return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
 }
 const pick=(r,list)=>list[Math.floor(r()*list.length)];
 const grid=(r,lo,hi,step)=>{const n=Math.round((hi-lo)/step);return lo+Math.floor(r()*(n+1))*step;};
 const round=(x,d=2)=>Number(x.toFixed(d));
 const shuffle=(r,list)=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const app=()=>({
  calc:typeof FieldCalc!=='undefined'?FieldCalc:null,leak:typeof Leakage!=='undefined'?Leakage:null,fiber:typeof FiberTools!=='undefined'?FiberTools:null,
  docsis:typeof DocsisHealth!=='undefined'?DocsisHealth:null,split:typeof HighSplit!=='undefined'?HighSplit:null,imp:typeof Impairments!=='undefined'?Impairments:null,
  safety:typeof Safety!=='undefined'?Safety:null,outage:typeof Outage!=='undefined'?Outage:null
 });
 /* Choices: the right answer is placed at a random position among the others, never repeated. */
 function choice(r,right,others){
  const pool=[...new Set(others.filter(x=>x!==right))];
  const picked=shuffle(r,pool).slice(0,3);
  const all=shuffle(r,[right,...picked]);
  return {choices:all,correct:all.indexOf(right)};
 }
 const number=(q)=>({kind:'number',...q});
 /* Each generator: id, domain, tool (the screen that practices it) and make(seed) -> a question. `params` holds the inputs of a
    numeric answer, so qa/build3-study.test.cjs can recompute it independently. */
 const GENERATORS=[
  {id:'dbm',domain:'signals',tool:{task:'calculators',label:'Test → Calculators'},make:r=>{
   const level=grid(r,-10,50,0.5),a=app();
   const x=a.calc.convertLevel(level,'dBmV',75);
   return number({prompt:`A meter reads ${level} dBmV across 75 ohms. What is that level in dBm?`,unit:'dBm',answer:x.dBm,tol:0.05,params:{level},working:['dBm = dBmV − 48.75 dB at 75 ohms (the dB converter in Test → Calculators).',`${level} − 48.75 = ${round(x.dBm)} dBm.`],source:'SCTE 293-10 2025, signal level'});
  }},
  {id:'dbuv',domain:'signals',tool:{task:'calculators',label:'Test → Calculators'},make:r=>{
   const level=grid(r,-10,50,0.5),a=app();
   const x=a.calc.convertLevel(level,'dBmV',75);
   return number({prompt:`A level is ${level} dBmV. What is it in dBµV?`,unit:'dBµV',answer:x.dBuV,tol:0.05,params:{level},working:['dBµV = dBmV + 60 dB, because 1 mV is 1000 µV.',`${level} + 60 = ${round(x.dBuV)} dBµV.`],source:'SCTE 293-1 2024, the decibel'});
  }},
  {id:'ofdm6',domain:'signals',tool:{task:'calculators',label:'Test → Calculators'},make:r=>{
   const bandwidth=pick(r,[24,48,96,192]),power=grid(r,10,60,0.5),a=app();
   const x=a.calc.ofdmPower(power,bandwidth,bandwidth);
   return number({prompt:`A downstream OFDM channel occupies ${bandwidth} MHz, and its power is spread evenly across that occupied bandwidth (flat power spectral density, so every 6 MHz carries the same power). The total power over the ${bandwidth} MHz measures ${power} dBmV. What is the average power per 6 MHz?`,unit:'dBmV per 6 MHz',answer:x.per6,tol:0.05,params:{power,bandwidth},working:['This holds when the power is spread evenly across the occupied bandwidth (flat power spectral density). Then power per 6 MHz = total power − 10·log10(occupied bandwidth ÷ 6 MHz). A channel whose power is not flat has the same average, but its individual 6 MHz segments differ from it.',`${power} − 10·log10(${bandwidth} ÷ 6) = ${round(x.per6)} dBmV average per 6 MHz.`],source:'SCTE 293-10 2025, signal level (the per-6 MHz basis); flat power is the assumption of the Field calculators card'});
  }},
  {id:'scqam',domain:'signals',tool:{task:'docsisHealth',label:'Test → DOCSIS health'},make:r=>{
   const level=grid(r,-20,20,1),a=app();
   const x=a.docsis.scqam({level});
   const right=x.status==='inside'?'Inside the range':x.status==='below'?'Below the range':'Above the range';
   const c=choice(r,right,['Inside the range','Below the range','Above the range']);
   return {kind:'choice',prompt:`A downstream SC-QAM channel reads ${level} dBmV at the modem. A DOCSIS modem must accept −15 to +15 dBmV per 6 MHz channel. Where is the reading?`,choices:c.choices,correct:c.correct,params:{level},working:['The range is inclusive: −15 and +15 dBmV are inside it.',`${level} dBmV is ${right.toLowerCase()}.`],source:'CM-SP-PHYv3.0 C01, Table 6–22'};
  }},
  {id:'ofdmbasis',domain:'signals',tool:{task:'why',label:'Test → Why cards'},make:r=>{
   const right='Average power per 6 MHz';
   const c=choice(r,right,['Peak envelope power of the visual carrier','Power of the strongest subcarrier','Total power over the whole channel bandwidth, whatever its width','The voltage across 50 ohms']);
   return {kind:'choice',prompt:'How is the signal level of a downstream OFDM channel usually stated?',choices:c.choices,correct:c.correct,working:['A downstream OFDM channel’s level is its average power, stated per 6 MHz so it can be compared with other channels.','Peak envelope power is how an analog TV visual carrier is measured.'],source:'SCTE 293-10 2025, signal level'};
  }},
  {id:'splitter',domain:'components',tool:{task:'calculators',label:'Test → Calculators'},make:r=>{
   const ways=pick(r,[2,3,4,8]),level=grid(r,0,50,1);
   const answer=level-10*Math.log10(ways);
   return number({prompt:`An ideal ${ways}-way splitter shares the signal equally. The input is ${level} dBmV. What is the level at each output?`,unit:'dBmV',answer,tol:0.05,params:{ways,level},working:['An equal split divides the power by the number of outputs: loss = 10·log10(outputs).',`${level} − 10·log10(${ways}) = ${round(answer)} dBmV. A real splitter has more loss than the ideal.`],source:'SCTE 293-4 2024, loss'});
  }},
  {id:'fiberbudget',domain:'components',tool:{task:'fiber',label:'Test → Fiber'},make:r=>{
   const length=pick(r,[2,5,8,12,20]),attenuation=pick(r,[0.35,0.4,0.5]),connectors=pick(r,[2,4,6]),splices=pick(r,[0,2,4,6]),a=app();
   const x=a.fiber.budget({length,attenuation,connectors,connectorLoss:0.3,splices,spliceLoss:0.1,margin:0});
   return number({prompt:`A single-mode link is ${length} km at ${attenuation} dB/km with ${connectors} mated connector pairs at 0.3 dB each and ${splices} splices at 0.1 dB each. No other loss, no margin. What is the estimated loss?`,unit:'dB',answer:x.estimated,tol:0.01,params:{length,attenuation,connectors,splices},working:['Loss = length × attenuation + pairs × loss per pair + splices × loss per splice.',`${length} × ${attenuation} + ${connectors} × 0.3 + ${splices} × 0.1 = ${round(x.estimated)} dB.`],source:'SCTE 181 2025 and FOA loss-budget guidance (see Test → Fiber)'});
  }},
  {id:'fibercolor',domain:'components',tool:{task:'fiber',label:'Test → Fiber'},make:r=>{
   const fiber=grid(r,1,288,1),a=app();
   const x=a.fiber.locate(fiber);
   const c=choice(r,x.fiberColor,a.fiber.COLORS);
   return {kind:'choice',prompt:`Counting from 1 with 12 fibers in each tube, which color is fiber ${fiber}?`,choices:c.choices,correct:c.correct,params:{fiber},working:[`Fiber ${fiber} is position ${x.position} in tube ${x.tube}.`,`The TIA-598 order is ${a.fiber.COLORS.join(', ')}, so position ${x.position} is ${x.fiberColor}.`],source:'TIA-598 color code (see Test → Fiber)'};
  }},
  {id:'unity',domain:'components',tool:{task:'gain',label:'Route → Amp gain'},make:r=>{
   const cable=grid(r,10,30,0.5),passives=grid(r,1,8,0.5);
   const answer=cable+passives;
   return number({prompt:`A span has ${cable} dB of cable loss and ${passives} dB of passive loss at the highest operating frequency. For unity gain, how much operational gain should the amplifier after it have?`,unit:'dB',answer,tol:0.05,params:{cable,passives},working:['Unity gain: the amplifier’s gain equals the loss of the span ahead of it at the same frequency.',`${cable} + ${passives} = ${round(answer)} dB.`],source:'SCTE 293-5 2024, unity gain'});
  }},
  {id:'aero',domain:'architectures',tool:{task:'highSplit',label:'Test → High split'},make:r=>{
   const a=app(),plan=pick(r,a.split.PLANS);
   const names={sub:'a 42/54 MHz plant',mid:'a mid-split (85/108 MHz) plant',high:'a 204/258 MHz plant'};
   const right=a.split.aeroBandSide(plan)==='upstream'?'Upstream':'Downstream';
   const c={choices:['Upstream','Downstream'],correct:['Upstream','Downstream'].indexOf(right)};
   return {kind:'choice',prompt:`On ${names[plan.id]}, which direction carries the 108 to 137 MHz aeronautical band?`,choices:c.choices,correct:c.correct,params:{plan:plan.id},working:[`The upstream ends at ${plan.upper[0]} MHz and the downstream starts at ${plan.dsLow[0]} MHz.`,`108 to 137 MHz is ${right.toLowerCase()} on this plan.`],source:'CM-SP-PHYv4.0 I08, Table 29'};
  }},
  {id:'edge',domain:'architectures',tool:{task:'highSplit',label:'Test → High split'},make:r=>{
   const a=app(),plan=pick(r,a.split.PLANS.filter(p=>p.dsLow.length===1));
   const names={mid:'Mid-split',high:'High-split'};
   const right=names[plan.id];
   const c=choice(r,right,['Mid-split','High-split','Sub-split','Ultra-high split']);
   return {kind:'choice',prompt:`Which DOCSIS 4.0 split has its downstream starting at ${plan.dsLow[0]} MHz?`,choices:c.choices,correct:c.correct,params:{plan:plan.id},working:['From the band table: sub-split 50 to 54 MHz, mid-split 108 MHz, high-split 258 MHz.',`${plan.dsLow[0]} MHz is the ${right.toLowerCase()} downstream edge.`],source:'CM-SP-PHYv4.0 I08, Table 29'};
  }},
  {id:'gap',domain:'architectures',tool:{task:'highSplit',label:'Test → High split'},make:r=>{
   const a=app(),plan=pick(r,a.split.PLANS.filter(p=>p.dsLow.length===1));
   const g=a.split.gaps().find(x=>x.id===plan.id);
   return number({prompt:`In the ${plan.id==='mid'?'mid':'high'}-split plan the upstream ends at ${plan.upper[0]} MHz and the downstream starts at ${plan.dsLow[0]} MHz. How many MHz lie between them?`,unit:'MHz',answer:g.min,tol:0,params:{upper:plan.upper[0],dsLow:plan.dsLow[0]},working:['Subtract the upstream upper edge from the downstream lower edge.',`${plan.dsLow[0]} − ${plan.upper[0]} = ${g.min} MHz (the specification calls this a transition band).`],source:'CM-SP-PHYv4.0 I08, Table 29 (our subtraction)'});
  }},
  {id:'ripple',domain:'troubleshooting',tool:{task:'calculators',label:'Test → Calculators'},make:r=>{
   const spacing=grid(r,0.5,8,0.1),vp=pick(r,[0.85,0.87,0.9]),a=app();
   const spacingR=round(spacing,1);
   const x=a.calc.rippleDistance(spacingR,vp);
   return number({prompt:`A sweep shows a standing-wave ripple whose peaks are ${spacingR} MHz apart, on cable with a velocity of propagation of ${vp}. How far apart, in feet, are the two mismatches?`,unit:'ft',answer:x.feet,tol:0.01,relative:true,params:{spacing:spacingR,vp},working:[`Distance (ft) = ${round(a.calc.C_FT_PER_US/2,1)} × VP ÷ ripple spacing (MHz), where ${round(a.calc.C_FT_PER_US/2,1)} ft·MHz is half the speed of light in feet per microsecond.`,`${round(a.calc.C_FT_PER_US/2,1)} × ${vp} ÷ ${spacingR} = ${round(x.feet,1)} ft.`],source:'SCTE 280 2022, standing waves (see Test → Impairments)'});
  }},
  {id:'leak3m',domain:'troubleshooting',tool:{task:'leakage',label:'Test → Leakage'},make:r=>{
   const field=grid(r,20,200,5),distance=pick(r,[10,30,100]),a=app();
   const x=a.leak.normalize({field,distance,unit:'m'});
   return number({prompt:`A leak reads ${field} µV/m at ${distance} m. What is that restated at 3 m?`,unit:'µV/m',answer:x.at3,tol:0.005,relative:true,params:{field,distance},working:['In the far field the field strength falls in proportion to distance: E at 3 m ≈ E × distance ÷ 3 m.',`${field} × ${distance} ÷ 3 = ${round(x.at3,1)} µV/m (an approximation; measure at 3 m when you can).`],source:'SCTE 221 2020 (R2026) and SCTE 293-12 2025'});
  }},
  {id:'cli',domain:'troubleshooting',tool:{task:'leakage',label:'Test → Leakage'},make:r=>{
   const leaks=[grid(r,60,300,10),grid(r,60,300,10),grid(r,60,300,10)],theta=pick(r,[0.8,0.9,1]),a=app();
   const x=a.leak.cli({leaks:leaks.join(' '),theta:String(theta)});
   return number({prompt:`Three leaks of ${leaks.join(', ')} µV/m were found at 3 m on the 108–137 MHz basis, with ${Math.round(theta*100)}% of the plant examined. What is the cumulative leakage index in dB?`,unit:'dB',answer:x.cli,tol:0.05,params:{leaks,theta},working:['CLI = 10·log10( (1 ÷ fraction examined) × the sum of each leak’s field strength squared ), counting leaks of 50 µV/m or more.',`10·log10( (${leaks.map(v=>v+'²').join(' + ')}) ÷ ${theta} ) = ${round(x.cli)} dB. The limit is 64 dB.`],source:'47 CFR 76.611(a)(1)'});
  }},
  {id:'impairment',domain:'troubleshooting',tool:{task:'impairments',label:'Test → Impairments'},make:r=>{
   const a=app(),ids=['ripple','notch','high-decline','slope','flat-drop','bursts'],shapeId=pick(r,ids),shape=a.imp.SHAPES.find(s=>s.id===shapeId);
   const right=a.imp.cardForShape(shape.id).name;
   const others=ids.filter(i=>i!==shape.id).map(i=>a.imp.cardForShape(i).name);
   const c=choice(r,right,others);
   return {kind:'choice',prompt:`A trace shows this: ${shape.text.charAt(0).toLowerCase()+shape.text.slice(1)}. Which impairment card fits?`,choices:c.choices,correct:c.correct,params:{shape:shape.id},working:[`The impairment cards are picked by what the trace looks like. This shape opens the “${right}” card.`],source:'SCTE 280 2022 (see Test → Impairments)'};
  }},
  {id:'popcnr',domain:'troubleshooting',tool:{task:'pop',label:'Test → Proof of performance'},make:r=>{
   const right='Not less than 43 dB';
   const c=choice(r,right,['Not less than 51 dB','Not less than 18 dB','Not less than 30 dB','Not less than 60 dB']);
   return {kind:'choice',prompt:'What is the FCC minimum ratio of visual carrier to system noise for an analog channel?',choices:c.choices,correct:c.correct,working:['47 CFR 76.605(b)(7): the ratio of RF visual signal level to system noise shall not be less than 43 dB.','51 dB is the coherent-disturbance figure and 18 dB the terminal isolation.'],source:'47 CFR 76.605(b)(7)'};
  }},
  {id:'safetysection',domain:'safety',tool:{task:'safety',label:'Job → Safety'},make:r=>{
   const a=app(),items=a.safety.ITEMS,item=pick(r,items);
   const groups=[...new Set(items.map(i=>i.group))];
   const c=choice(r,item.group,groups);
   return {kind:'choice',prompt:`In which section of the pre-work safety card does this reminder appear? “${item.text}”`,choices:c.choices,correct:c.correct,params:{item:item.id},working:[`It is in “${item.group}”.`,'The card is a set of reminders written for this app. It is not your company’s procedure; follow company policy first.'],source:'This app’s Job → Safety card'};
  }},
  {id:'outagesection',domain:'safety',tool:{task:'outage',label:'Job → Outage'},make:r=>{
   const a=app(),items=a.outage.ITEMS,item=pick(r,items);
   const groups=[...new Set(items.map(i=>i.group))];
   const c=choice(r,item.group,groups);
   return {kind:'choice',prompt:`In which section of the outage first-response card does this prompt appear? “${item.text}”`,choices:c.choices,correct:c.correct,params:{item:item.id},working:[`It is in “${item.group}”.`,'The card is a set of prompts written for this app. It is not your company’s procedure; follow it first.'],source:'This app’s Job → Outage card'};
  }}
 ].map(g=>Object.freeze(g));
 const SEED_STEP=7919;
 /* Question number k (0 based) within a domain filter, for a base seed. */
 function list(domain){return domain&&domain!=='all'?GENERATORS.filter(g=>g.domain===domain):GENERATORS;}
 function question(domain,index,seed){
  const gens=list(domain);if(!gens.length)return null;
  const g=gens[((Math.trunc(index)%gens.length)+gens.length)%gens.length];
  const q=g.make(rng(Math.trunc(seed)+Math.trunc(index)*SEED_STEP));
  return {id:g.id,domain:g.domain,tool:g.tool,...q};
 }
 const DECIMAL=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
 /* Checks one response. A number is read strictly as a plain decimal; blank is "no answer", never zero. */
 function check(q,response){
  if(!q)return {ok:false,error:'There is no question.'};
  if(q.kind==='choice'){
   if(response===null||response===undefined||response==='')return {ok:false,error:'Choose an answer first.'};
   const i=Number(response);if(!Number.isInteger(i)||i<0||i>=q.choices.length)return {ok:false,error:'Choose one of the answers shown.'};
   return {ok:true,right:i===q.correct,answer:q.choices[q.correct]};
  }
  const text=String(response??'').trim();
  if(text==='')return {ok:false,error:'Type your answer first.'};
  if(text.length>20||!DECIMAL.test(text))return {ok:false,error:'Type the answer as a plain number, such as 12.5.'};
  const v=Number(text);if(!Number.isFinite(v))return {ok:false,error:'Type the answer as a plain number, such as 12.5.'};
  const allowed=q.relative?Math.abs(q.answer)*q.tol:q.tol;
  return {ok:true,right:Math.abs(v-q.answer)<=allowed+1e-9,answer:round(q.answer,2),entered:v};
 }
 /* What counts as right, in words, so the person knows the precision asked for before answering. */
 function toleranceText(q){
  if(!q||q.kind!=='number')return '';
  if(q.relative)return 'Counts as right within '+round(q.tol*100,2)+' percent of the correct value.';
  if(q.tol===0)return 'Give the exact whole number.';
  return 'Counts as right within '+q.tol+(q.unit?' '+q.unit:'')+' of the correct value.';
 }
 return {DOMAINS,GENERATORS,list,question,check,rng,toleranceText};
})();

const StudyModeUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 /* A number box whose text is not a number (a lone "-") reports an empty value but is marked badInput; it must read as text
    that is not a number, never as an empty answer. */
 const typed=el=>el.validity&&el.validity.badInput?'not a number':el.value;
 const state={domain:'all',index:0,seed:1,right:0,asked:0,answered:false};
 let initialized=false;
 function current(){return StudyMode.question(state.domain,state.index,state.seed);}
 function body(q){
  const total=StudyMode.list(state.domain).length;
  const answer=q.kind==='choice'
   ?`<fieldset class="study-choices"><legend class="sr-only">Answers</legend>${q.choices.map((c,i)=>`<label class="study-choice"><input type="radio" name="studyAnswer" value="${i}"> <span>${escape(c)}</span></label>`).join('')}</fieldset>`
   :`<label class="study-number">Your answer${q.unit?` (${escape(q.unit)})`:''}<input type="number" step="any" id="studyNumber" data-study="answer" autocomplete="off" aria-describedby="studyTolerance"></label><p class="note tight" id="studyTolerance">${escape(StudyMode.toleranceText(q))}</p>`;
  return `<p class="note tight" id="studyWhere">Question ${state.index+1} · ${escape(StudyMode.DOMAINS.find(d=>d.id===q.domain).name)} · ${total} question${total===1?'':'s'} in this set</p><p class="study-prompt" id="studyPrompt">${escape(q.prompt)}</p>${answer}<div class="toolbar"><button type="button" id="studyCheck">Check my answer</button><button type="button" id="studyNext">Next question</button><button type="button" id="studyNew">New numbers</button></div><div class="study-feedback" id="studyFeedback" role="status" aria-live="polite"></div>`;
 }
 function render(){
  const panel=document.getElementById('studyPanel');if(!panel)return;
  const q=current();state.answered=false;
  const where=panel.querySelector('#studyBody');if(where)where.innerHTML=q?body(q):'<p class="note">No questions in this set.</p>';
  const score=panel.querySelector('#studyScore');if(score)score.textContent=state.asked?`This visit: ${state.right} right of ${state.asked}. Nothing is saved.`:'Nothing is saved, and a score here is not a test result.';
 }
 function markup(){
  return `<div class="sectionhead"><div><h2>Study mode</h2><p class="note tight">Practice questions made from this app’s own calculators and reference screens, grouped by the five SCTE Broadband Distribution Specialist domains. Every question is original: the numbers come from a seed and the answer comes from the same function the app uses. They are not SCTE or NCTI questions and not an exam. A score is kept for this visit only.</p></div></div><section class="calc-card study-card"><div class="calc-fields"><label>Domain<select id="studyDomain" data-study="domain"><option value="all">All five domains</option>${StudyMode.DOMAINS.map(d=>`<option value="${d.id}">${escape(d.name)}</option>`).join('')}</select></label></div><div id="studyBody"></div><p class="note tight" id="studyScore"></p></section>`;
 }
 function showResult(q,res,panel){
  const out=panel.querySelector('#studyFeedback');
  if(!res.ok){out.classList.add('error');out.innerHTML=`<p class="note">${escape(res.error)}</p>`;return;}
  out.classList.remove('error');
  if(!state.answered){state.answered=true;state.asked++;if(res.right)state.right++;}
  const score=panel.querySelector('#studyScore');if(score)score.textContent=`This visit: ${state.right} right of ${state.asked}. Nothing is saved.`;
  const tool=q.tool?`<button type="button" class="study-go" data-study-go="${escape(q.tool.task)}">${escape(q.tool.label)}</button>`:'';
  out.innerHTML=`<p class="health-status ${res.right?'ok':'warn'}">${res.right?'✓ Right.':'✗ Not quite.'} The answer is ${escape(res.answer)}${q.unit&&q.kind==='number'?' '+escape(q.unit):''}.</p><p><strong>Working.</strong></p><ul class="hs-list">${q.working.map(w=>`<li>${escape(w)}</li>`).join('')}</ul><p class="note tight">Source: ${escape(q.source)}. ${tool}</p>`;
 }
 function init(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  const panel=document.getElementById('studyPanel');if(!panel)return;
  panel.innerHTML=markup();render();
  panel.addEventListener('change',event=>{
   if(event.target.id==='studyDomain'){state.domain=event.target.value;state.index=0;render();}
  });
  panel.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b||!panel.contains(b))return;
   const q=current();
   if(b.id==='studyCheck'){
    let response='';
    if(q.kind==='choice'){const r=panel.querySelector('input[name="studyAnswer"]:checked');response=r?r.value:'';}
    else{const el=panel.querySelector('#studyNumber');response=el?typed(el):'';}
    showResult(q,StudyMode.check(q,response),panel);
   }else if(b.id==='studyNext'){state.index++;render();}
   else if(b.id==='studyNew'){state.seed++;render();}
   else if(b.dataset.studyGo&&typeof WorkflowUI!=='undefined')WorkflowUI.go(b.dataset.studyGo);
  });
 }
 return {init,markup,state,render};
})();
