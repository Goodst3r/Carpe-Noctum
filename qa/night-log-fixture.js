/* Defined five-station synthetic handoff. Calls the live Station and Night-log controls. */
() => {
 loadState(TrainingJob.makePractice('aoi-six-active'));
 const set=(selector,value,type='input')=>{const el=document.querySelector(selector);if(!el)throw Error('Missing fixture control: '+selector);el.value=value;el.dispatchEvent(new Event(type,{bubbles:true}));};
 for(let i=1;i<=5;i++){
  WorkflowUI.go('station');set('[data-station-target]','r'+i,'change');
  for(const stage of ['before','after']){
   set('[data-station-scope="record"][data-station-field="stage"]',stage,'change');
   const forward={lowMHz:'261',highMHz:'993',measuredLow:stage==='before'?'35':'34',measuredHigh:stage==='before'?'45':'46',targetLow:'34',targetHigh:'46',plane:'Synthetic output / 6 MHz'};
   const returns={referencePointTarget:'0',insertionLoss:'0',actualInjection:'0',receiverReading:'0',receiverReference:'0',referencePoint:'Synthetic input / 6.4 MHz',receiverPlane:'Synthetic receiver / 6.4 MHz'};
   for(const[scope,values]of Object.entries({forward,returns}))for(const[k,v]of Object.entries(values))set(`[data-station-scope="${scope}"][data-station-field="${k}"]`,v);
  }
  WorkflowUI.go('nightLog');
  if(i===1)set('[data-night-window="ticket"]','PRACTICE-5');
  set('[data-night-draft="stationIdentity"]',StationView.records(state).find(r=>r.pointId==='r'+i).identity,'change');
  set('[data-night-draft="asset"]','A'+i);set('[data-night-draft="action"]','Adjusted');document.querySelector('[data-night-action="add"]').click();
 }
 document.querySelector('[data-night-action="generate"]').click();
 return {entries:NightLog.entries().length,preview:document.querySelector('#nightHandoffPreview').value};
}
