/* Build 3 outage first-response card (build list item 8). Prompts for the first steps of an outage call:
   confirm the scope, check power, check the node, work through the actives in order, tell the right people,
   write down the times. The wording is original and is not any company's outage procedure: the card says
   so, and it needs a supervisor's review against the local procedure before coworkers use it.
   It asks for plant places (node, leg, amp, pole) and roles, never customer names, addresses, phone numbers
   or account numbers, and it has no limits or numbers, so it has no registry row. It does not hold photos
   or locations. Kept on this device only. Built on the shared engine in checklist.js. */
const Outage=(()=>{
 const ITEMS=[
  {id:'scope-what',group:'Confirm the scope',text:'Find out what is down: one tap or leg, an amplifier or node, or a wider area. Use plant names, not customer names.'},
  {id:'scope-nearby',group:'Confirm the scope',text:'Check whether nearby nodes or services are also affected.'},
  {id:'scope-planned',group:'Confirm the scope',text:'Check for planned work, a utility power outage or severe weather in the area.'},
  {id:'scope-notes',group:'Confirm the scope',text:'Read the dispatch notes for the area. Do not copy customer names or addresses into this card.'},
  {id:'safe-scene',group:'Safety on arrival',text:'Look over the site before you get out: traffic, downed lines, fire, flooding, people or animals. Leave and call it in if it is not safe.'},
  {id:'safe-checklist',group:'Safety on arrival',text:'Complete your company’s pre-work safety steps. Job → Safety has reminders.'},
  {id:'power-ac',group:'Power',text:'Check whether utility AC power is present at the power supply.'},
  {id:'power-status',group:'Power',text:'Check the power supply’s status: on utility power or on battery, and any alarm lights. Note what you see.'},
  {id:'power-report',group:'Power',text:'If the supply is on battery or off, tell your supervisor or the ROC and note how long it has been out, if you know.'},
  {id:'node-lights',group:'Node and optics',text:'Check the node’s status lights and any alarm. Note them.'},
  {id:'node-optics',group:'Node and optics',text:'Check the optical input and the return path indicator with your approved meter. Note the reading and the value your company expects.'},
  {id:'node-nolight',group:'Node and optics',text:'If there is no light, follow your company’s fiber procedure and call it in. Never look into a fiber end.'},
  {id:'act-order',group:'Actives, in order',text:'Work outward from the node, one active at a time, checking power and signal at each.'},
  {id:'act-last',group:'Actives, in order',text:'Note the last active that works and the first one that does not.'},
  {id:'act-between',group:'Actives, in order',text:'If the fault lies between two actives, check the passives and cable between them next.'},
  {id:'tell-roc',group:'Tell the right people',text:'Tell the ROC or dispatch what you found, where and when. Use plant names and your company’s work reference.'},
  {id:'tell-supervisor',group:'Tell the right people',text:'Tell your supervisor if the cause is unclear, you need help or the repair needs more people or equipment.'},
  {id:'tell-damage',group:'Tell the right people',text:'If you suspect damage, theft or vandalism, tell your supervisor and follow your company’s procedure before you touch anything.'},
  {id:'dmg-safe',group:'If damage or theft is suspected',text:'Make sure the area is safe first. Do not confront anyone.'},
  {id:'dmg-leave',group:'If damage or theft is suspected',text:'Leave the scene as it is until your company’s procedure says it may be changed.'},
  {id:'dmg-record',group:'If damage or theft is suspected',text:'Write down what you found, where and when, as your company’s procedure says. Leave customers out of it.'},
  {id:'rec-times',group:'Record the times',text:'Write down when you arrived, found the cause, told the ROC and when service came back. Fill them in below.'},
  {id:'rec-cause',group:'Record the times',text:'Write down what you found and what you did, in plant terms.'},
  {id:'rec-restored',group:'Record the times',text:'Confirm with the ROC that service is back before you leave.'}
 ];
 const FIELDS=[
  {id:'where',label:'Where on the plant (node, leg, amp or pole; no customer names or addresses)',type:'text',max:120,hint:'e.g. node leg 3, amp 2'},
  {id:'arrived',label:'Time I arrived (24-hour)',type:'time'},
  {id:'found',label:'Time I found the cause (24-hour)',type:'time'},
  {id:'told',label:'Time I told the ROC or dispatch (24-hour)',type:'time'},
  {id:'restored',label:'Time service was restored (24-hour)',type:'time'},
  {id:'cause',label:'What I found and did (plant terms)',type:'text',max:120},
  {id:'tellwho',label:'Who I told (a role, such as dispatch or supervisor)',type:'text',max:80},
  {id:'damage',label:'If damage or theft is suspected: what was found',type:'text',max:120},
  {id:'damagetold',label:'Damage or theft: who was told (a role)',type:'text',max:80},
  {id:'damagetime',label:'Damage or theft: time it was reported (24-hour)',type:'time'}
 ];
 const list=Checklist.create({key:'nightsweep-outage-v1',items:ITEMS,fields:FIELDS});
 const OPTIONS={panelId:'outagePanel',prefix:'outage',title:'Outage first response',
  lead:'Prompts for the first steps of an outage call: scope, power, node, actives in order, who to tell and the times. Change the list to match your company’s own.',
  policy:'Follow your company’s outage procedure first, and your supervisor’s direction. This list is a set of prompts written for this app. It is not your company’s procedure. Enter plant places and roles only: no customer names, addresses, phone numbers or account numbers.',
  source:'Wording written for this app from general field practice; no NCTI or SCTE text is copied. The damage and theft prompts only point at SCTE’s 2026 Critical Infrastructure Protection Subcommittee, which is still writing its evidence-collection standard; this card does not implement it.',
  reviewNote:'A supervisor has not yet reviewed it against your local outage procedure, and that review is needed before coworkers use it.',
  startLabel:'Start a new call',exportName:'CarpeNoctum_2.0_Alpha_build_3_Outage_First_Response.txt',exportTitle:'Outage first-response notes (not a company procedure)'};
 let ui=null;
 function init(){
  if(ui||typeof document==='undefined')return;
  let st=null;try{st=window.localStorage;}catch(_){}
  list.load(st);ui=ChecklistUI.mount(OPTIONS,list);
 }
 return {ITEMS,FIELDS,list,OPTIONS,init};
})();
