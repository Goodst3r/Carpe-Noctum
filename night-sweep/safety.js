/* Build 3 pre-work safety card (build list item 9). A reminder list to tick before climbing, opening plant or
   working near a road. The wording was written for this app from general field-safety practice. It is not
   copied from NCTI or SCTE material and it is not any company's procedure: the card opens by saying so.
   The list has no safety limits, numbers or targets; its only numbers are the engine's software caps (items you can add,
   characters per item and per note box), registered as Unknown application guards. A company policy reference and the
   person who knows where you are are notes the technician types in. Kept on this device only. */
const Safety=(()=>{
 const ITEMS=[
  {id:'brief-job',group:'Before you leave',text:'Read the work order and know what you will open, climb or dig.'},
  {id:'brief-hazards',group:'Before you leave',text:'Think through the hazards at this site: traffic, power lines, weather, animals and people.'},
  {id:'brief-weather',group:'Before you leave',text:'Check the weather. Do not climb or open plant in lightning, ice or high wind.'},
  {id:'brief-checkin',group:'Before you leave',text:'Tell someone where you are working and when you will check in. Fill in the notes below.'},
  {id:'brief-phone',group:'Before you leave',text:'Carry a charged phone. Know the emergency number and your company’s safety line.'},
  {id:'ppe-required',group:'Protective equipment',text:'Wear the protective equipment your company requires for this task.'},
  {id:'ppe-head-eye',group:'Protective equipment',text:'Hard hat and eye protection on, fitted and in good condition.'},
  {id:'ppe-hivis',group:'Protective equipment',text:'High-visibility clothing on when you work near a road or moving vehicles.'},
  {id:'ppe-hands-feet',group:'Protective equipment',text:'Gloves and footwear suited to the task, as your company requires.'},
  {id:'ppe-inspect',group:'Protective equipment',text:'Look over each item for damage or wear before you use it.'},
  {id:'veh-park',group:'Vehicle and traffic',text:'Park so the vehicle and work area can be seen, with warning devices out as your company requires.'},
  {id:'veh-traffic',group:'Vehicle and traffic',text:'Set up traffic control as your company and the road authority require before working near moving traffic.'},
  {id:'veh-ground',group:'Vehicle and traffic',text:'Check the ground around the work area for holes, slopes and loose material.'},
  {id:'lad-inspect',group:'Ladders and climbing',text:'Inspect the ladder: rating, rungs, feet and locks. Do not use a damaged ladder.'},
  {id:'lad-set',group:'Ladders and climbing',text:'Set the ladder on firm, stable ground and secure it as your company requires.'},
  {id:'lad-gear',group:'Ladders and climbing',text:'Inspect the harness, lanyard, hooks and climbing gear before every climb. Retire anything that fails.'},
  {id:'lad-structure',group:'Ladders and climbing',text:'Check the pole or structure and the strand before you climb. Do not climb one that looks unsafe.'},
  {id:'lad-powerlines',group:'Ladders and climbing',text:'Find overhead power lines before you raise a ladder or climb, and stay clear of them.'},
  {id:'lad-zone',group:'Ladders and climbing',text:'On a pole, stay in the communications space and keep clear of the power space, as your company’s rules define them.'},
  {id:'elec-assume',group:'Electrical',text:'Treat cable plant, pedestals and housings as possibly energized. AC power can ride on the coax.'},
  {id:'elec-ground',group:'Electrical',text:'Check the bonding and grounding at the housing or pole. Report a missing or damaged ground and do not work around it.'},
  {id:'elec-voltage',group:'Electrical',text:'Check for stray voltage with your approved tester before you touch metal housings, strand or grounds.'},
  {id:'elec-procedure',group:'Electrical',text:'Follow your company’s procedure before opening an active, a power supply or a power inserter.'},
  {id:'elec-wet',group:'Electrical',text:'Do not work on plant in standing water or during a thunderstorm.'},
  {id:'dig-locate',group:'Digging and underground',text:'Confirm that underground utilities are located and marked before anyone digs.'},
  {id:'dig-vault',group:'Digging and underground',text:'Test the air and follow your company’s confined-space rules before entering a vault.'},
  {id:'fiber-lit',group:'Fiber and laser',text:'Never look into a fiber end, connector or port. Treat it as lit until your approved power meter shows otherwise.'},
  {id:'fiber-scraps',group:'Fiber and laser',text:'Keep fiber scraps in a closed container, away from skin, eyes and clothing.'},
  {id:'fiber-scope',group:'Fiber and laser',text:'Inspect connectors only with approved, filtered equipment, and never while the fiber may be lit.'},
  {id:'fiber-hygiene',group:'Fiber and laser',text:'No food or drink at the fiber work area. Wash your hands afterwards.'},
  {id:'end-tools',group:'Before you leave the site',text:'Count your tools, take your waste and close and lock every enclosure.'},
  {id:'end-checkin',group:'Before you leave the site',text:'Tell the person you checked in with that you are finished.'},
  {id:'end-report',group:'Before you leave the site',text:'Report any hazard, damaged equipment or near miss to your supervisor.'}
 ];
 const FIELDS=[
  {id:'who',label:'Who knows where I am (a name or role)',type:'text',max:80,hint:'e.g. dispatcher or crew lead'},
  {id:'checkin',label:'Check in with them by (24-hour time)',type:'time'},
  {id:'policy',label:'Where to find my company’s safety policy or safety line',type:'text',max:120,hint:'document name or phone line',keep:true}
 ];
 const list=Checklist.create({key:'nightsweep-safety-v1',items:ITEMS,fields:FIELDS});
 const OPTIONS={panelId:'safetyPanel',prefix:'safety',title:'Pre-work safety',
  lead:'Reminders to tick before you climb, open plant or work near a road. Change the list to match your company’s own.',
  policy:'Follow company policy first, and your supervisor’s direction. This list is a set of reminders written for this app. It is not your company’s procedure and does not replace training, permits or any rule that applies to you.',
  source:'Wording written for this app from general field-safety practice; no NCTI or SCTE course text is copied. Course headings consulted only: NCTI Field Safety and Fiber-Optic Installation I: Safety; the SCTE safety and construction domain.',
  reviewNote:'A supervisor or safety officer has not reviewed it yet.',
  startLabel:'Start a new pass',exportName:'CarpeNoctum_2.0_Alpha_build_3_Pre-work_Safety.txt',exportTitle:'Pre-work safety reminders (not a company procedure)'};
 let ui=null;
 function init(){
  if(ui||typeof document==='undefined')return;
  let st=null;try{st=window.localStorage;}catch(_){}
  list.load(st);ui=ChecklistUI.mount(OPTIONS,list);
 }
 return {ITEMS,FIELDS,list,OPTIONS,init};
})();
