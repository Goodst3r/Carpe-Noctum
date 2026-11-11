/* Build 3 shared checklist engine, used by the pre-work safety card and the outage first-response card.
   A checklist is a list of prompts the technician ticks off, rewords, hides or adds to, plus a few short
   notes (a person's name or role, a time). Everything is kept on this device only, under one versioned
   key per checklist, outside jobs and job backups. Nothing here is a company procedure; the cards that use
   this engine say so. No customer names, addresses or account numbers are asked for or stored.
   The engine has no DOM; ChecklistUI below draws one checklist into a panel. */
const Checklist=(()=>{
 const MAX_CUSTOM=40,MAX_TEXT=160,MAX_NOTE=120;
 const DEFAULT_ID=/^[a-z0-9][a-z0-9-]{0,47}$/;
 const CUSTOM_ID=/^x-[a-z0-9]{4,40}$/;
 const TIME=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
 const NEWER='A newer version of the app saved this checklist on this device, so this version will not overwrite it. Update the app, or clear the checklist to start again.';
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 /* Text from a person: control, zero-width and direction-override characters become spaces, runs of space
    collapse, and the result is cut by whole characters (never through a surrogate pair). */
 const clean=(value,max)=>Array.from(String(value??'').replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g,' ').replace(/\s+/g,' ').trim()).slice(0,max).join('');
 const fail=error=>({ok:false,error});
 const clone=x=>JSON.parse(JSON.stringify(x));
 let counter=0;
 const newId=()=>'x-'+Date.now().toString(36)+(counter++).toString(36)+Math.floor(Math.random()*1e6).toString(36);

 function create(config){
  const key=String(config?.key||'');
  if(!/^nightsweep-[a-z0-9-]+-v\d+$/.test(key))throw Error('Checklist key must look like nightsweep-name-v1');
  const items=(config.items||[]).map(i=>Object.freeze({id:i.id,group:i.group,text:i.text}));
  const seen=new Set();
  for(const i of items){
   if(!DEFAULT_ID.test(i.id)||seen.has(i.id))throw Error('Bad or repeated checklist item id: '+i.id);
   if(!i.group||!clean(i.text,MAX_TEXT)||clean(i.text,MAX_TEXT)!==i.text)throw Error('Bad checklist item: '+i.id);
   seen.add(i.id);
  }
  const groups=[...new Set(items.map(i=>i.group))];
  const fieldDefs=(config.fields||[]).map(f=>Object.freeze({id:f.id,label:f.label,type:f.type==='time'?'time':'text',max:Math.min(f.max||MAX_NOTE,MAX_NOTE),hint:f.hint||'',keep:!!f.keep}));
  for(const f of fieldDefs)if(!DEFAULT_ID.test(f.id))throw Error('Bad checklist field id: '+f.id);
  const SIDE_KEY=key+'-unreadable';
  const emptyState=()=>({version:1,checked:[],edits:[],hidden:[],custom:[],fields:{}});
  const isItem=(s,id)=>seen.has(id)||s.custom.some(c=>c.id===id);

  /* What a stored value may hold, whatever is in it. Returns {status,state}: status is 'ok', 'newer'
     (written by a later version), or 'unreadable'. */
  function sanitize(saved){
   if(!saved||typeof saved!=='object'||Array.isArray(saved))return {status:'unreadable',state:emptyState()};
   if(typeof saved.version==='number'&&saved.version>1)return {status:'newer',state:emptyState()};
   if(saved.version!==1)return {status:'unreadable',state:emptyState()};
   const s=emptyState();
   for(const c of Array.isArray(saved.custom)?saved.custom:[]){
    if(s.custom.length>=MAX_CUSTOM)break;
    const text=clean(c?.text,MAX_TEXT),id=typeof c?.id==='string'?c.id:'';
    if(CUSTOM_ID.test(id)&&text&&!s.custom.some(x=>x.id===id))s.custom.push({id,group:groups.includes(c?.group)?c.group:groups[groups.length-1],text});
   }
   const take=list=>[...new Set((Array.isArray(list)?list:[]).filter(id=>typeof id==='string'&&isItem(s,id)))];
   s.checked=take(saved.checked);
   s.hidden=take(saved.hidden).filter(id=>seen.has(id));
   for(const e of Array.isArray(saved.edits)?saved.edits:[]){
    const text=clean(e?.text,MAX_TEXT);
    if(typeof e?.id==='string'&&seen.has(e.id)&&text&&!s.edits.some(x=>x.id===e.id))s.edits.push({id:e.id,text});
   }
   const savedFields=saved.fields&&typeof saved.fields==='object'&&!Array.isArray(saved.fields)?saved.fields:{};
   for(const f of fieldDefs){
    const v=own(savedFields,f.id)?clean(savedFields[f.id],f.max):'';
    s.fields[f.id]=f.type==='time'?(TIME.test(v)?v:''):v;
   }
   return {status:'ok',state:s};
  }
  function readStored(storage){
   let raw;
   try{raw=storage?.getItem(key);}catch(_){return {status:'blocked',state:null};}
   if(raw===null||raw===undefined)return {status:storage?'none':'blocked',state:storage?emptyState():null};
   try{return {...sanitize(JSON.parse(raw)),raw};}catch(_){return {status:'unreadable',state:emptyState(),raw};}
  }
  let state=emptyState(),loaded=false,loadStatus='none';
  const pending=[];   /* changes this browser could not store; they are applied again on top of every later write */
  function load(storage){
   const r=readStored(storage);
   loaded=true;loadStatus=r.status;
   state=r.state||emptyState();
   return loadStatus;
  }
  function ensureLoaded(){if(loaded)return;try{load(typeof localStorage!=='undefined'?localStorage:null);}catch(_){loaded=true;}}
  const status=()=>{ensureLoaded();return loadStatus;};
  /* The unreadable value is set aside before anything replaces it. True only when a copy of exactly this value is on the
     device now: written just now, or already there from an earlier attempt. If the copy cannot be made (storage full or
     blocked) or a different earlier copy is already there, the original is not safe to replace and the caller must not. */
  let keptCopy=null;   /* null: not tried; true: a copy is on this device; false: the copy could not be made */
  function keepUnreadable(storage,raw){
   try{
    if(!storage||typeof raw!=='string')return false;
    const have=storage.getItem(SIDE_KEY);
    if(have===null){storage.setItem(SIDE_KEY,raw);return storage.getItem(SIDE_KEY)===raw;}
    return have===raw;
   }catch(_){return false;}
  }
  /* Apply one change to what is stored now (so a second tab's work is not erased) and write it.
     Returns {ok,saved,...}. saved:false means this browser would not store it (or, when the stored value is
     unreadable, would not keep a copy of it first): the change stays in memory, the stored value is left as
     it was, and the change is written with the next change that does save. */
  function commit(op,storage){
   ensureLoaded();
   const r=readStored(storage);
   if(r.status==='newer'){loadStatus='newer';return fail(NEWER);}
   let kept=true;
   if(r.status==='unreadable'){kept=keepUnreadable(storage,r.raw);keptCopy=kept;}
   const next=clone(r.status==='blocked'?state:r.state);
   for(const earlier of pending)earlier(next);
   const outcome=op(next);
   if(outcome&&outcome.ok===false)return outcome;
   state=next;
   /* Never replace the stored value while it is unreadable and no copy of it is safe: the change stays in memory (and is
      applied again with the next write) and the original is left exactly as it was. */
   const hold=r.status==='unreadable'&&!kept;
   loadStatus=hold?'unreadable':'ok';
   let saved=!hold;
   if(!hold)try{if(!storage)throw new Error('no storage');storage.setItem(key,JSON.stringify(state));}catch(_){saved=false;}
   if(saved)pending.length=0;else pending.push(op);
   return {ok:true,saved,unreadableKept:r.status==='unreadable'?kept:undefined,...(outcome||{})};
  }
  const known=(s,id)=>typeof id==='string'&&isItem(s,id);
  const gone=()=>fail('That item is no longer in the list.');

  function toggle(id,on,storage){
   return commit(s=>{
    if(!known(s,id))return gone();
    s.checked=s.checked.filter(x=>x!==id);
    if(on)s.checked.push(id);
   },storage);
  }
  function uncheckAll(storage){return commit(s=>{s.checked=[];},storage);}
  /* A new pass or a new call: ticks go and so do the notes for this job. Notes marked keep (such as where the
     company's policy is kept) stay, and so do the technician's changes to the list. */
  function startOver(storage){
   return commit(s=>{
    s.checked=[];
    for(const f of fieldDefs)if(!f.keep)s.fields[f.id]='';
   },storage);
  }
  function editItem(id,text,storage){
   const t=clean(text,MAX_TEXT);
   if(!t)return fail('Enter the wording for this item, or use Restore wording to go back to the original.');
   return commit(s=>{
    if(!known(s,id))return gone();
    const custom=s.custom.find(c=>c.id===id);
    if(custom){custom.text=t;return;}
    s.edits=s.edits.filter(e=>e.id!==id);
    if(t!==items.find(i=>i.id===id).text)s.edits.push({id,text:t});
   },storage);
  }
  function restoreWording(id,storage){return commit(s=>{if(!known(s,id))return gone();s.edits=s.edits.filter(e=>e.id!==id);},storage);}
  function hideItem(id,storage){
   return commit(s=>{
    if(!seen.has(id))return fail('Only the original items can be hidden; delete one you added instead.');
    if(!s.hidden.includes(id))s.hidden.push(id);
   },storage);
  }
  function showItem(id,storage){return commit(s=>{s.hidden=s.hidden.filter(x=>x!==id);},storage);}
  function addItem(group,text,storage){
   const t=clean(text,MAX_TEXT);
   if(!t)return fail('Enter the wording for the new item.');
   if(!groups.includes(group))return fail('Choose which section the new item belongs in.');
   const id=newId();
   return commit(s=>{
    if(s.custom.some(c=>c.id===id))return;
    if(s.custom.length>=MAX_CUSTOM)return fail('You can add up to '+MAX_CUSTOM+' items. Delete one you no longer need first.');
    s.custom.push({id,group,text:t});
    return {id};
   },storage);
  }
  function removeItem(id,storage){
   return commit(s=>{
    const i=s.custom.findIndex(c=>c.id===id);
    if(i<0)return fail('Only items you added can be deleted; hide an original item instead.');
    s.custom.splice(i,1);s.checked=s.checked.filter(x=>x!==id);
   },storage);
  }
  function restoreOriginal(storage){return commit(s=>{s.edits=[];s.hidden=[];s.custom=[];s.checked=s.checked.filter(id=>seen.has(id));},storage);}
  function setField(id,value,storage){
   const def=fieldDefs.find(f=>f.id===id);
   if(!def)return fail('That entry does not exist.');
   const v=clean(value,def.max);
   if(def.type==='time'&&v!==''&&!TIME.test(v))return fail('Enter the time as hours and minutes on a 24-hour clock, such as 14:30, or leave it blank.');
   return commit(s=>{s.fields[id]=v;},storage);
  }
  /* Remove the whole checklist from this device. Memory changes only when the browser really removed it. */
  function clearAll(storage){
   ensureLoaded();
   try{if(!storage)throw new Error('no storage');storage.removeItem(key);}catch(_){return fail('This browser would not remove the saved checklist, so it may return when the page reloads.');}
   try{storage.removeItem(SIDE_KEY);}catch(_){}
   state=emptyState();pending.length=0;loadStatus='none';keptCopy=null;
   return {ok:true};
  }

  /* What to draw: sections in the original order, the original items minus hidden ones plus the ones
     the technician added, the tick count and the notes. */
  function view(){
   ensureLoaded();
   const hiddenSet=new Set(state.hidden),checkedSet=new Set(state.checked);
   const edit=id=>state.edits.find(e=>e.id===id)?.text;
   const sections=groups.map(group=>{
    const rows=[];
    for(const i of items)if(i.group===group&&!hiddenSet.has(i.id))rows.push({id:i.id,text:edit(i.id)??i.text,original:i.text,edited:edit(i.id)!==undefined,added:false,checked:checkedSet.has(i.id)});
    for(const c of state.custom)if(c.group===group)rows.push({id:c.id,text:c.text,original:c.text,edited:false,added:true,checked:checkedSet.has(c.id)});
    return {group,items:rows};
   });
   const all=sections.flatMap(s=>s.items);
   return {sections,hidden:items.filter(i=>hiddenSet.has(i.id)).map(i=>({id:i.id,group:i.group,text:i.text})),
    done:all.filter(i=>i.checked).length,total:all.length,
    fields:fieldDefs.map(f=>({id:f.id,label:f.label,type:f.type,hint:f.hint,max:f.max,keep:f.keep,value:state.fields[f.id]??''})),groups:[...groups],unreadableCopy:keptCopy};
  }
  /* Plain text of the checklist as it stands, for a note or a message. `when` is passed in so the engine stays pure. */
  function toText(title,when){
   const v=view(),lines=[String(title||'Checklist')];
   if(when)lines.push('Prepared '+when);
   lines.push('');
   for(const s of v.sections){
    if(!s.items.length)continue;
    lines.push(s.group);
    for(const i of s.items)lines.push((i.checked?'[x] ':'[ ] ')+i.text);
    lines.push('');
   }
   for(const f of v.fields)if(f.value)lines.push(f.label+': '+f.value);
   lines.push(v.done+' of '+v.total+' ticked');
   return lines.join('\r\n')+'\r\n';
  }
  return {key,SIDE_KEY,groups,items,fieldDefs,load,status,view,toText,toggle,uncheckAll,startOver,editItem,restoreWording,hideItem,showItem,addItem,removeItem,restoreOriginal,setField,clearAll,sanitize};
 }
 return {create,clean,MAX_CUSTOM,MAX_TEXT,MAX_NOTE,NEWER};
})();

/* Draws one checklist into a panel. `options`: panelId, prefix (for element ids), title, lead, policy (the
   line shown first), source (where the wording came from), exportName (adds a text export when given),
   reviewNote (what still needs a person's review), registerClear (extra text for the clear confirm). */
const ChecklistUI=(()=>{
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function storage(){try{return window.localStorage;}catch(_){return null;}}
 function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
 const savedText=r=>r.unreadableKept===false?'Not saved. The checklist already on this device could not be read, and a copy of it could not be set aside (storage may be full), so it was left exactly as it was. Your change lasts only until you close the page. Free some space or back up your projects and change something again, or use Clear this checklist to discard the unreadable data.':r.saved?(r.unreadableKept===true?'Saved on this device only. A copy of the unreadable older data is kept on this device. It is not part of a job backup.':'Saved on this device only. It is not part of a job backup.'):'This browser would not save it, so it lasts until you close the page.';
 function mount(options,list){
  const panel=document.getElementById(options.panelId);if(!panel)return null;
  const p=options.prefix;
  let editing=false;
  const note=(text,error)=>{const el=panel.querySelector('#'+p+'-note');if(el){el.textContent=text;el.classList.toggle('error',!!error);}};
  /* A refused entry is explained right under its own box, and the box is marked, so the reason is on screen where the
     person is looking. The box keeps what they typed (a half-edited native time is not stored, and not thrown away). */
  function clearProblem(t){
   t.removeAttribute('aria-invalid');t.removeAttribute('aria-describedby');
   const e=t.closest('label')?.nextElementSibling;if(e&&e.classList.contains('check-field-error'))e.remove();
  }
  function showProblem(t,text){
   clearProblem(t);const label=t.closest('label');if(!label){note(text,true);return;}
   const e=document.createElement('p');e.className='status error check-field-error';e.setAttribute('role','alert');e.id=p+'-problem-'+t.dataset.checkField;e.textContent=text;
   label.insertAdjacentElement('afterend',e);t.setAttribute('aria-invalid','true');t.setAttribute('aria-describedby',e.id);
  }
  /* Store one note box. A native time box with a part filled in and a part blank reads as '' but is not blank
     (validity.badInput): that is refused, not saved as blank, and the saved time stays. A box with every part
     cleared is deliberately blank and is saved as blank. */
  function saveField(t,fromInput){
   const id=t.dataset.checkField,def=list.view().fields.find(f=>f.id===id),time=t.type==='time';
   const still=time?(def&&def.value?' The saved time is still '+def.value+'.':' No time is saved yet.'):'';
   if(time&&t.validity&&t.validity.badInput){showProblem(t,'Not saved. The time is incomplete. Fill in every part (hours, minutes, and AM or PM if shown), or clear every part to leave it blank.'+still);return;}
   const r=list.setField(id,t.value,storage());
   if(!r.ok){showProblem(t,'Not saved. '+r.error+still);return;}
   clearProblem(t);note(savedText(r),!r.saved);
   if(!fromInput&&!time)render();   /* a time box is never redrawn under the person's finger: its value is already exactly what is stored */
  }
  function itemRow(i){
   const label=escape(i.text);
   if(!editing)return `<li class="check-row"><label class="check-item"><input type="checkbox" data-check="${i.id}"${i.checked?' checked':''}><span>${label}</span></label></li>`;
   return `<li class="check-row check-editing"><label class="check-edit">Wording<input type="text" maxlength="${Checklist.MAX_TEXT}" data-check-text="${i.id}" value="${label}"></label><div class="toolbar">${i.added?`<button type="button" data-check-delete="${i.id}" class="danger" aria-label="Delete item: ${label}">Delete</button>`:`<button type="button" data-check-hide="${i.id}" aria-label="Hide item: ${label}">Hide</button>`}${i.edited?`<button type="button" data-check-reword="${i.id}" aria-label="Restore the original wording of: ${label}">Restore wording</button>`:''}</div></li>`;
  }
  function render(){
   const v=list.view(),st=list.status();
   const fields=v.fields.map(f=>`<label>${escape(f.label)}<input type="${f.type==='time'?'time':'text'}" maxlength="${f.max}" data-check-field="${f.id}" value="${escape(f.value)}"${f.hint?` placeholder="${escape(f.hint)}"`:''}></label>`).join('');
   const sections=v.sections.map(s=>`<fieldset class="check-section"><legend>${escape(s.group)}</legend><ul class="check-list">${s.items.map(itemRow).join('')||'<li class="note tight">Every item in this section is hidden.</li>'}</ul></fieldset>`).join('');
   const hiddenBox=v.hidden.length?`<div class="check-hidden"><h3>Hidden items</h3><ul class="check-list">${v.hidden.map(h=>`<li class="check-row"><span>${escape(h.text)}</span><button type="button" data-check-show="${h.id}" aria-label="Show item again: ${escape(h.text)}">Show again</button></li>`).join('')}</ul></div>`:'';
   const editor=editing?`<div class="check-add"><h3>Add an item</h3><div class="calc-fields"><label>Section<select data-check-add-group>${v.groups.map(g=>`<option value="${escape(g)}">${escape(g)}</option>`).join('')}</select></label><label class="calc-wide">Wording<input type="text" maxlength="${Checklist.MAX_TEXT}" data-check-add-text></label></div><div class="toolbar"><button type="button" data-check-add>Add item</button><button type="button" data-check-restore class="danger">Restore the original list</button></div></div>${hiddenBox}`:'';
   const warn=st==='newer'?`<p class="status warning" role="status">${escape(Checklist.NEWER)}</p>`:st==='unreadable'?(v.unreadableCopy===false?'<p class="status error" role="alert">The saved checklist on this device could not be read, and a copy of it could not be set aside, so it has been left as it was. Changes you make now last only until you close the page. Free some space or back up your projects and change something again, or use Clear this checklist to discard the unreadable data.</p>':'<p class="status warning" role="status">The saved checklist on this device could not be read, so the original list is shown. Before your next change replaces it, a copy of the unreadable data is set aside on this device; if that copy cannot be made, the unreadable data is left as it is and your change is kept only until you close the page.</p>'):'';
   panel.querySelector('#'+p+'-body').innerHTML=`${warn}<p class="check-progress" aria-live="polite"><strong>${v.done} of ${v.total}</strong> ticked</p>${sections}<div class="check-notes"><h3>Notes for this job</h3><div class="calc-fields">${fields}</div></div>${editor}`;
   const edit=panel.querySelector('#'+p+'-edit');if(edit){edit.setAttribute('aria-pressed',String(editing));edit.textContent=editing?'Done changing the list':'Change this list';}
  }
  panel.innerHTML=`<div class="sectionhead"><div><h2>${escape(options.title)}</h2><p class="note tight">${escape(options.lead)}</p></div></div><p class="status warning check-policy">${escape(options.policy)}</p><div id="${p}-body"></div><div class="toolbar"><button type="button" id="${p}-edit" aria-pressed="false">Change this list</button><button type="button" id="${p}-untick">${escape(options.startLabel||'Start a new pass')}</button>${options.exportName?`<button type="button" id="${p}-export">Save as text</button>`:''}<button type="button" id="${p}-clear" class="danger">Clear everything on this device</button></div><p class="note" id="${p}-note" role="status" aria-live="polite"></p><p class="note calc-conditions">${escape(options.source)} ${escape(options.reviewNote||'')} Ticks, notes and your changes are kept in this browser on this device only, for every job: they are not in a job or its backups, and clearing browser data erases them.</p>`;
  render();
  panel.addEventListener('change',event=>{
   const t=event.target;if(!panel.contains(t))return;
   if(t.dataset.check!==undefined){const r=list.toggle(t.dataset.check,t.checked,storage());if(!r.ok)note(r.error,true);else note(r.saved&&r.unreadableKept!==true?'':savedText(r),!r.saved);render();}
   else if(t.dataset.checkField!==undefined)saveField(t,false);
   else if(t.dataset.checkText!==undefined){const r=list.editItem(t.dataset.checkText,t.value,storage());if(!r.ok){note(r.error,true);render();return;}note(savedText(r),!r.saved);render();}
  });
  /* A native time box reports a finished time, or every part cleared, through input as well as change; and leaving it
     half filled can send no change at all, so whatever the box holds is reconciled with what is saved when it loses focus. */
  panel.addEventListener('input',event=>{
   const t=event.target;if(t.dataset&&t.dataset.checkField!==undefined&&t.type==='time')saveField(t,true);
  });
  panel.addEventListener('focusout',event=>{
   const t=event.target;
   if(!t.dataset||t.dataset.checkField===undefined||t.type!=='time')return;
   const def=list.view().fields.find(f=>f.id===t.dataset.checkField);
   if(t.validity&&t.validity.badInput||t.value!==(def?def.value:''))saveField(t,true);   /* nothing to say when it already matches */
  });
  panel.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b||!panel.contains(b))return;
   const d=b.dataset;let r=null;
   if(b.id===p+'-edit'){editing=!editing;note('',false);render();return;}
   if(b.id===p+'-untick'){
    const noted=list.view().fields.some(f=>!f.keep&&f.value);
    if(noted&&typeof confirm==='function'&&!confirm('Untick everything and clear your notes for this job? The list and your changes to it stay.'))return;
    r=list.startOver(storage());
   }
   else if(b.id===p+'-clear'){
    if(typeof confirm==='function'&&!confirm('Clear this checklist from this device? That removes your ticks, notes and every change you made to the list, and any copy of unreadable data kept for safety. It cannot be exported first.'))return;
    r=list.clearAll(storage());if(!r.ok){note(r.error,true);return;}editing=false;note('Cleared on this device.',false);render();return;
   }
   else if(b.id===p+'-export'){
    const text=list.toText(options.exportTitle||options.title,today());
    if(typeof download==='function')download(options.exportName,text,'text/plain');
    note('Text note prepared. Finish the save or share step on your device. It lists the items and your notes; check it before you send it.',false);return;
   }
   else if(d.checkHide!==undefined)r=list.hideItem(d.checkHide,storage());
   else if(d.checkShow!==undefined)r=list.showItem(d.checkShow,storage());
   else if(d.checkDelete!==undefined)r=list.removeItem(d.checkDelete,storage());
   else if(d.checkReword!==undefined)r=list.restoreWording(d.checkReword,storage());
   else if(d.checkAdd!==undefined){
    const text=panel.querySelector('[data-check-add-text]'),group=panel.querySelector('[data-check-add-group]');
    r=list.addItem(group?.value,text?.value,storage());
    if(!r.ok){note(r.error,true);return;}
   }
   else if(d.checkRestore!==undefined){
    if(typeof confirm==='function'&&!confirm('Restore the original list? Your reworded, hidden and added items are removed. Ticks on original items stay.'))return;
    r=list.restoreOriginal(storage());
   }
   else return;
   if(!r.ok){note(r.error,true);return;}
   note(savedText(r),!r.saved);render();
  });
  return {render};
 }
 return {mount};
})();
