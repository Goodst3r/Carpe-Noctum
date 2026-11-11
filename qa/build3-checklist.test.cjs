/* Build 3 shared checklist engine and the pre-work safety card (build list item 9).
   Engine rules (ticks, wording changes, hiding, adding, notes, merging with another tab, a browser that
   will not store, unreadable or newer stored data, hostile stored data), then the rendered card, the
   device-local key and the saved-job format. No calculations are involved, so there is no numeric
   reference. Synthetic text only. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const KEY = 'nightsweep-safety-v1', SIDE = KEY + '-unreadable';
const cases = [];
let downloads = [], confirmAnswer = true;

function boot({ seed = null } = {}) {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, { url: 'https://nightsweep.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
    w.ResizeObserver = class { observe() {} }; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; w.confirm = () => confirmAnswer; w.print = () => {}; w.structuredClone = structuredClone;
    w.indexedDB = new FDB.IDBFactory(); w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; Object.defineProperty(w.crypto, 'subtle', { value: webcrypto.subtle });
    w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
    w.NightSweepAndroid = { saveFile: (name, text, mime) => downloads.push({ name, text, mime }), saveBinary() {}, printReport() {} };
    if (seed !== null) w.localStorage.setItem(KEY, seed);
  } });
  const w = dom.window, d = w.document, ev = s => w.eval(s), json = s => JSON.parse(ev('JSON.stringify(' + s + ')'));
  return { dom, w, d, ev, json, errors, close: () => w.close() };
}
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
const plain = x => JSON.parse(JSON.stringify(x));
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };
const click = (h, selector) => { const el = h.d.querySelector(selector); assert(el, selector); el.click(); };
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const change = (h, selector, value) => { const el = h.d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new h.w.Event('change', { bubbles: true })); return el; };
const tick = (h, id, on = true) => { const el = h.d.querySelector(`[data-check="${id}"]`); assert(el, id); el.checked = on; el.dispatchEvent(new h.w.Event('change', { bubbles: true })); };

/* An in-memory Storage that can be told to fail writes, to throw on reads, or to hold unreadable text. */
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { data, failWrites: false, failReads: false, failRemoves: false,
    getItem(k) { if (this.failReads) throw new Error('blocked'); return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { if (this.failWrites) throw new Error('quota'); data.set(k, String(v)); },
    removeItem(k) { if (this.failRemoves) throw new Error('blocked'); data.delete(k); } };
}

(async () => {
  const h = boot();
  await flush();
  const Checklist = h.ev('Checklist');   // a top-level const in the app is not a window property
  const make = (extra = {}) => Checklist.create({ key: 'nightsweep-test-v1',
    items: [{ id: 'a-one', group: 'First', text: 'Alpha item' }, { id: 'a-two', group: 'First', text: 'Beta item' }, { id: 'b-one', group: 'Second', text: 'Gamma item' }],
    fields: [{ id: 'who', label: 'Who', type: 'text', max: 20 }, { id: 'at', label: 'At', type: 'time' }], ...extra });
  const stored = (st, key = 'nightsweep-test-v1') => JSON.parse(st.getItem(key));

  await check('The engine refuses a bad key, bad or repeated item ids and bad wording when a checklist is defined', () => {
    const C = Checklist;
    const base = { key: 'nightsweep-test-v1', items: [{ id: 'ok-1', group: 'G', text: 'Fine' }] };
    assert.doesNotThrow(() => C.create(base));
    assert.throws(() => C.create({ ...base, key: 'jobs' }), /Checklist key/);
    assert.throws(() => C.create({ ...base, items: [{ id: 'Bad Id', group: 'G', text: 'x' }] }), /item id/);
    assert.throws(() => C.create({ ...base, items: [{ id: 'x-abcd', group: 'G', text: 'x' }, { id: 'x-abcd', group: 'G', text: 'y' }] }), /item id/);
    assert.throws(() => C.create({ ...base, items: [{ id: 'dup', group: 'G', text: 'x' }, { id: 'dup', group: 'G', text: 'y' }] }), /item id/);
    assert.throws(() => C.create({ ...base, items: [{ id: 'ok-1', group: 'G', text: '  spaced   text ' }] }), /Bad checklist item/);
    assert.throws(() => C.create({ ...base, items: [{ id: 'ok-1', group: 'G', text: '' }] }), /Bad checklist item/);
  });

  await check('Ticks: set, clear, count, refuse an unknown item, untick all', () => {
    const st = fakeStorage(), L = make();
    L.load(st);
    assert.deepEqual(plain(L.view()).sections.map(s => [s.group, s.items.length]), [['First', 2], ['Second', 1]]);
    assert.equal(L.view().done, 0); assert.equal(L.view().total, 3);
    assert.equal(L.toggle('a-one', true, st).ok, true); assert.equal(L.toggle('b-one', true, st).ok, true); assert.equal(L.toggle('a-one', true, st).ok, true);
    assert.equal(L.view().done, 2); assert.deepEqual(stored(st).checked.sort(), ['a-one', 'b-one'], 'a repeated tick is stored once');
    assert.equal(L.toggle('a-one', false, st).ok, true); assert.equal(L.view().done, 1);
    for (const bad of ['nope', '', '__proto__', 'constructor', 'x-zzzz', null, undefined, 5]) { const r = plain(L.toggle(bad, true, st)); assert.equal(r.ok, false, String(bad)); assert.match(r.error, /no longer in the list/); }
    assert.equal(L.uncheckAll(st).ok, true); assert.equal(L.view().done, 0);
  });

  await check('Start over clears ticks and the notes for this job, keeps standing notes and the technician\'s changes to the list', () => {
    const st = fakeStorage(), L = make({ fields: [{ id: 'who', label: 'Who', type: 'text', max: 20 }, { id: 'at', label: 'At', type: 'time' }, { id: 'where', label: 'Where', type: 'text', keep: true }] });
    L.load(st); L.toggle('a-one', true, st); L.editItem('a-two', 'Reworded', st); L.addItem('First', 'Mine', st); L.setField('who', 'Dana', st); L.setField('at', '10:15', st); L.setField('where', 'Handbook', st);
    assert.equal(L.startOver(st).ok, true);
    const s = stored(st); assert.deepEqual([s.checked, s.fields.who, s.fields.at, s.fields.where, s.edits.length, s.custom.length], [[], '', '', 'Handbook', 1, 1]);
    assert.equal(L.uncheckAll(st).ok, true);
  });

  await check('Wording: change an item, go back to the original, refuse blank wording; changed wording is cleaned', () => {
    const st = fakeStorage(), L = make();
    L.load(st);
    assert.equal(L.editItem('a-one', '  Alpha   reworded  ', st).ok, true);
    let row = plain(L.view()).sections[0].items[0];
    assert.deepEqual([row.text, row.original, row.edited], ['Alpha reworded', 'Alpha item', true]);
    assert.deepEqual(stored(st).edits, [{ id: 'a-one', text: 'Alpha reworded' }]);
    assert.equal(L.editItem('a-one', 'Alpha item', st).ok, true); assert.deepEqual(stored(st).edits, [], 'typing the original back stores nothing');
    L.editItem('a-two', 'Changed', st); assert.equal(L.restoreWording('a-two', st).ok, true); assert.equal(plain(L.view()).sections[0].items[1].text, 'Beta item');
    for (const blank of ['', '   ', '\u200b\u200b', '\u202e\u0007', null]) { const r = plain(L.editItem('a-one', blank, st)); assert.equal(r.ok, false, JSON.stringify(blank)); assert.match(r.error, /Enter the wording/); }
    L.editItem('a-one', 'bell\u0007 zero\u200bwidth \u202eoverride', st);
    assert.equal(plain(L.view()).sections[0].items[0].text, 'bell zero width override');
    L.editItem('a-one', '😀'.repeat(200), st); assert.equal(Array.from(plain(L.view()).sections[0].items[0].text).length, 160, 'cut by characters, not code units');
    assert.doesNotMatch(plain(L.view()).sections[0].items[0].text, /[\ud800-\udbff](?![\udc00-\udfff])/, 'no cut surrogate pair');
  });

  await check('Hide and show original items; hidden items leave the count; an added item cannot be hidden and an original cannot be deleted', () => {
    const st = fakeStorage(), L = make();
    L.load(st);
    L.toggle('a-two', true, st);
    assert.equal(L.hideItem('a-two', st).ok, true);
    let v = plain(L.view()); assert.equal(v.total, 2); assert.equal(v.done, 0, 'a hidden item is not counted as ticked'); assert.deepEqual(v.hidden.map(x => x.id), ['a-two']);
    assert.equal(L.showItem('a-two', st).ok, true); v = plain(L.view()); assert.equal(v.total, 3);
    const add = plain(L.addItem('First', 'Mine', st)); assert.equal(add.ok, true);
    assert.match(plain(L.hideItem(add.id, st)).error, /Only the original items can be hidden/);
    assert.match(plain(L.removeItem('a-one', st)).error, /Only items you added/);
    assert.equal(L.removeItem(add.id, st).ok, true); assert.equal(plain(L.view()).total, 3);
    assert.match(plain(L.hideItem('nope', st)).error, /Only the original items/);
  });

  await check('Adding: needs wording and a real section, caps at 40, lands in its section, drops its tick when deleted', () => {
    const st = fakeStorage(), L = make();
    L.load(st);
    assert.match(plain(L.addItem('First', '  ', st)).error, /Enter the wording/);
    assert.match(plain(L.addItem('Nowhere', 'x', st)).error, /Choose which section/);
    assert.match(plain(L.addItem('__proto__', 'x', st)).error, /Choose which section/);
    const r = plain(L.addItem('Second', 'My own check', st)); assert.equal(r.ok, true); assert.match(r.id, /^x-[a-z0-9]{4,40}$/);
    assert.deepEqual(plain(L.view()).sections[1].items.map(i => [i.text, i.added]), [['Gamma item', false], ['My own check', true]]);
    L.toggle(r.id, true, st); assert.equal(L.view().done, 1);
    assert.equal(L.editItem(r.id, 'My own check, reworded', st).ok, true); assert.equal(stored(st).custom[0].text, 'My own check, reworded');
    L.removeItem(r.id, st); assert.equal(L.view().done, 0); assert.deepEqual(stored(st).checked, []);
    for (let i = 0; i < 40; i++) assert.equal(L.addItem('First', 'Item ' + i, st).ok, true, 'item ' + i);
    assert.match(plain(L.addItem('First', 'one too many', st)).error, /up to 40 items/);
    assert.equal(plain(L.view()).total, 43);
    assert.equal(L.restoreOriginal(st).ok, true); assert.equal(plain(L.view()).total, 3, 'restoring the original list removes added items');
  });

  await check('Restoring the original list removes wording changes, hidden items and added items but keeps ticks on original items', () => {
    const st = fakeStorage(), L = make();
    L.load(st);
    L.editItem('a-one', 'Changed', st); L.hideItem('a-two', st); const added = plain(L.addItem('First', 'Extra', st)); L.toggle('b-one', true, st); L.toggle(added.id, true, st);
    assert.equal(L.restoreOriginal(st).ok, true);
    const s = stored(st); assert.deepEqual([s.edits, s.hidden, s.custom, s.checked], [[], [], [], ['b-one']]);
  });

  await check('Notes: text is cleaned and cut, a time must be HH:MM on a 24-hour clock, unknown notes are refused', () => {
    const st = fakeStorage(), L = make();
    L.load(st);
    assert.equal(L.setField('who', '  Crew\u200b lead  ', st).ok, true); assert.equal(plain(L.view()).fields[0].value, 'Crew lead');
    L.setField('who', 'x'.repeat(50), st); assert.equal(plain(L.view()).fields[0].value.length, 20);
    for (const good of ['00:00', '09:05', '23:59', '']) assert.equal(L.setField('at', good, st).ok, true, good);
    for (const bad of ['24:00', '9:05', '12:60', '1230', 'noon', '12:30:00', '12:3']) { const r = plain(L.setField('at', bad, st)); assert.equal(r.ok, false, bad); assert.match(r.error, /24-hour clock/); }
    L.setField('at', '14:30', st); L.setField('at', '25:00', st); assert.equal(plain(L.view()).fields[1].value, '14:30', 'a refused time leaves the old one');
    for (const bad of ['nope', '__proto__', 'constructor', '']) assert.match(plain(L.setField(bad, 'x', st)).error, /does not exist/);
    assert.equal(stored(st).fields.who.length, 20); assert.equal(Object.keys(stored(st).fields).sort().join(), 'at,who');
  });

  await check('A second tab\'s work is kept: each change is applied to what is stored now', () => {
    const st = fakeStorage(), A = make(), B = make();
    A.load(st); B.load(st);
    A.toggle('a-one', true, st); B.toggle('b-one', true, st); B.addItem('First', 'From B', st); A.setField('who', 'Dana', st);
    const s = stored(st);
    assert.deepEqual(s.checked.sort(), ['a-one', 'b-one']); assert.equal(s.custom.length, 1); assert.equal(s.fields.who, 'Dana');
    assert.equal(A.view().done, 2, 'A sees B\'s tick after its own next change');
  });

  await check('A browser that will not store: changes stay in memory, the screen can say so, and every one is written later (nothing silently lost)', () => {
    const st = fakeStorage(), L = make();
    L.load(st);
    assert.equal(plain(L.toggle('a-one', true, st)).saved, true);
    st.failWrites = true;
    const r2 = plain(L.toggle('a-two', true, st)), r3 = plain(L.addItem('First', 'Written later', st)), r4 = plain(L.setField('who', 'Sam', st));
    assert.deepEqual([r2.saved, r3.saved, r4.saved], [false, false, false]);
    assert.equal(L.view().done, 2); assert.equal(plain(L.view()).sections[0].items.length, 3); assert.equal(plain(L.view()).fields[0].value, 'Sam');
    assert.deepEqual(stored(st).checked, ['a-one'], 'nothing new reached storage');
    st.failWrites = false;
    const r5 = plain(L.toggle('b-one', true, st)); assert.equal(r5.saved, true);
    const s = stored(st);
    assert.deepEqual(s.checked.sort(), ['a-one', 'a-two', 'b-one'], 'the unsaved tick is written with the next change');
    assert.equal(s.custom.length, 1); assert.equal(s.custom[0].text, 'Written later'); assert.equal(s.fields.who, 'Sam');
    st.failWrites = true; L.toggle('a-one', false, st); st.failWrites = false; L.toggle('b-one', false, st);
    assert.deepEqual(stored(st).checked, ['a-two'], 'an unsaved untick is applied too');
  });

  await check('A browser that blocks storage reads and writes still lets the list work for this page', () => {
    const st = fakeStorage(); st.failReads = true; st.failWrites = true;
    const L = make(); L.load(st);
    assert.equal(L.status(), 'blocked');
    assert.equal(plain(L.toggle('a-one', true, st)).saved, false); assert.equal(plain(L.toggle('a-two', true, st)).saved, false);
    assert.equal(L.view().done, 2, 'memory keeps both');
    const none = make(); none.load(null);
    assert.equal(plain(none.toggle('a-one', true, null)).saved, false); assert.equal(none.view().done, 1);
  });

  await check('Unreadable stored data is kept in a side key before the first change replaces it, and only once', () => {
    for (const raw of ['{not json', '"text"', '[1,2]', 'null', JSON.stringify({ version: 'one' }), JSON.stringify({ version: 0 }), JSON.stringify({})]) {
      const st = fakeStorage({ 'nightsweep-test-v1': raw }), L = make();
      assert.equal(L.load(st), 'unreadable', raw);
      assert.equal(L.view().done, 0, 'the original list is shown');
      const r = plain(L.toggle('a-one', true, st)); assert.equal(r.ok, true); assert.equal(r.unreadableKept, true, raw);
      assert.equal(st.getItem('nightsweep-test-v1-unreadable'), raw, 'the unreadable text is kept as it was');
      L.toggle('a-two', true, st); st.setItem('nightsweep-test-v1', raw); L.toggle('b-one', true, st);
      assert.equal(st.getItem('nightsweep-test-v1-unreadable'), raw, 'the first copy is never overwritten');
      assert.deepEqual(stored(st).checked, ['b-one'], 'the replaced list holds only the newest change');
    }
  });

  await check('Data saved by a newer version is never overwritten: the change is refused with a plain message and storage is untouched', () => {
    const raw = JSON.stringify({ version: 2, checked: ['a-one'], extra: 'future' }), st = fakeStorage({ 'nightsweep-test-v1': raw }), L = make();
    assert.equal(L.load(st), 'newer');
    for (const op of [() => L.toggle('a-one', true, st), () => L.addItem('First', 'x', st), () => L.setField('who', 'x', st), () => L.uncheckAll(st), () => L.restoreOriginal(st)]) {
      const r = plain(op()); assert.equal(r.ok, false); assert.equal(r.error, Checklist.NEWER);
    }
    assert.equal(st.getItem('nightsweep-test-v1'), raw); assert.equal(st.getItem('nightsweep-test-v1-unreadable'), null);
    assert.equal(L.clearAll(st).ok, true, 'the person can still clear it'); assert.equal(st.getItem('nightsweep-test-v1'), null);
  });

  await check('Hostile or oversized stored data is cut down to known items, valid text and the limits, with no script error and no prototype change', () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ id: 'x-' + 'a'.repeat(4) + i.toString(36), group: 'First', text: 'Row ' + i }));
    const raw = JSON.stringify({ version: 1,
      checked: ['a-one', 'a-one', '__proto__', 'constructor', 'toString', 'unknown', 5, null, {}, ['a-two']],
      hidden: ['b-one', 'x-aaaa1', 'nope', '__proto__'],
      edits: [{ id: 'a-one', text: '<img src=x onerror=alert(1)>' }, { id: 'a-one', text: 'second for same id' }, { id: '__proto__', text: 'x' }, { id: 'a-two', text: '   ' }, { id: 'a-two', text: 'y'.repeat(900) }, 'junk'],
      custom: [...many, { id: '__proto__', group: 'First', text: 'bad' }, { id: 'x-ab', group: 'First', text: 'short id' }, { id: 'x-aaaa1', group: 'Nowhere', text: 'odd section' }],
      fields: { who: 'z'.repeat(500), at: '25:99', __proto__: { polluted: true }, constructor: 'x', extra: 'ignored' } });
    const st = fakeStorage({ 'nightsweep-test-v1': raw }), L = make();
    assert.equal(L.load(st), 'ok');
    const v = plain(L.view()), s = plain(L.sanitize(JSON.parse(raw)).state);
    assert.deepEqual(s.checked.sort(), ['a-one']); assert.deepEqual(s.hidden, ['b-one']);
    assert.deepEqual(s.edits.map(e => e.id), ['a-one', 'a-two']); assert.equal(s.edits[0].text, '<img src=x onerror=alert(1)>', 'markup is kept as text; the screen escapes it');
    assert.equal(s.edits[1].text.length, 160);
    assert.equal(s.custom.length, 40, 'capped'); assert(s.custom.every(c => /^x-[a-z0-9]{4,40}$/.test(c.id) && c.group === 'First'));
    assert.equal(s.fields.who.length, 20); assert.equal(s.fields.at, ''); assert.deepEqual(Object.keys(s.fields).sort(), ['at', 'who']);
    assert.equal(({}).polluted, undefined); assert.equal(h.w.Object.prototype.polluted, undefined);
    assert.equal(v.total, 2 + 40, 'one original hidden, forty added');
  });

  await check('Clearing: memory changes only when the browser removed the data, the side copy goes too, and another tab\'s clear is respected', () => {
    const st = fakeStorage({ 'nightsweep-test-v1-unreadable': 'old' }), L = make();
    L.load(st); L.toggle('a-one', true, st);
    st.failRemoves = true;
    const bad = plain(L.clearAll(st)); assert.equal(bad.ok, false); assert.match(bad.error, /would not remove/); assert.equal(L.view().done, 1, 'memory is unchanged');
    st.failRemoves = false;
    assert.equal(L.clearAll(st).ok, true); assert.equal(L.view().done, 0); assert.equal(st.getItem('nightsweep-test-v1'), null); assert.equal(st.getItem('nightsweep-test-v1-unreadable'), null);
    const A = make(), B = make(), s2 = fakeStorage();
    A.load(s2); B.load(s2); A.toggle('a-one', true, s2); B.view();
    A.clearAll(s2); B.toggle('b-one', true, s2);
    assert.deepEqual(stored(s2).checked, ['b-one'], 'a cleared tick does not come back when the other tab writes');
  });

  await check('Text export lists sections, [x] or [ ] for each item, the notes and the count, with Windows line ends', () => {
    const st = fakeStorage(), L = make();
    L.load(st); L.toggle('a-one', true, st); L.hideItem('b-one', st); L.setField('who', 'Dana', st);
    const t = L.toText('Test list', '2026-11-11 09:30');
    assert.equal(t, 'Test list\r\nPrepared 2026-11-11 09:30\r\n\r\nFirst\r\n[x] Alpha item\r\n[ ] Beta item\r\n\r\nWho: Dana\r\n1 of 2 ticked\r\n');
  });

  /* ---- The pre-work safety card ---- */
  await goto(h, 'safety');

  await check('Job has a Safety tab; its screen opens with "Follow company policy" and says it is not the company procedure', () => {
    const tabs = [...h.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim());
    assert(tabs.includes('Safety'), tabs.join());
    const panel = h.d.getElementById('safetyPanel');
    assert.equal(panel.hidden, false); assert.equal(panel.dataset.screen, 'job');
    const policy = panel.querySelector('.check-policy');
    assert(policy.compareDocumentPosition(panel.querySelector('.check-section')) & 4, 'the policy line comes before the first section');
    assert.match(policy.textContent, /^Follow company policy first/);
    assert.match(policy.textContent, /not your company’s procedure/);
    assert.match(words(panel), /A supervisor or safety officer has not reviewed it yet/);
    assert.match(words(panel), /no NCTI or SCTE course text is copied/);
    assert.equal(h.d.querySelector('#taskTabs [aria-selected="true"]')?.textContent.trim(), 'Safety');
  });

  await check('The list covers the areas the build list names: PPE, ladder, climbing gear, traffic control, voltage check, fiber and laser, who knows where I am', () => {
    const groups = h.json('Safety.list.groups');
    assert.deepEqual(groups, ['Before you leave', 'Protective equipment', 'Vehicle and traffic', 'Ladders and climbing', 'Electrical', 'Digging and underground', 'Fiber and laser', 'Before you leave the site']);
    const all = h.json('Safety.ITEMS').map(i => i.text).join(' ').toLowerCase();
    for (const word of ['protective equipment', 'ladder', 'harness', 'traffic control', 'stray voltage', 'fiber', 'lit', 'check in', 'company']) assert(all.includes(word), word);
    const fields = h.json('Safety.FIELDS').map(f => f.id); assert.deepEqual(fields, ['who', 'checkin', 'policy']);
    assert.equal(h.json('Safety.ITEMS').length, new Set(h.json('Safety.ITEMS').map(i => i.id)).size);
    assert(h.json('Safety.ITEMS').every(i => i.text.length <= 160 && !/\d{2,}/.test(i.text)), 'no numbers or limits in the wording');
    assert.equal(h.d.querySelectorAll('[data-check]').length, h.json('Safety.ITEMS').length);
    assert.equal(h.d.querySelector('.check-progress').textContent.trim(), `0 of ${h.json('Safety.ITEMS').length} ticked`);
  });

  await check('Ticking saves under the one device-local key and updates the count; the saved job and every other storage key are unchanged', async () => {
    const before = JSON.stringify(h.json('evidenceExportProject(state)')), keysBefore = Object.keys(h.w.localStorage).filter(k => k !== KEY).sort();
    tick(h, 'ppe-hivis'); tick(h, 'lad-inspect'); await flush();
    assert.deepEqual(JSON.parse(h.w.localStorage.getItem(KEY)).checked.sort(), ['lad-inspect', 'ppe-hivis']);
    assert.match(h.d.querySelector('.check-progress').textContent, /^2 of /);
    change(h, '[data-check-field="who"]', 'Crew lead'); change(h, '[data-check-field="checkin"]', '14:30'); change(h, '[data-check-field="policy"]', 'Safety handbook'); await flush();
    assert.deepEqual(JSON.parse(h.w.localStorage.getItem(KEY)).fields, { who: 'Crew lead', checkin: '14:30', policy: 'Safety handbook' });
    assert.equal(JSON.stringify(h.json('evidenceExportProject(state)')), before, 'job export identical');
    assert.deepEqual(Object.keys(h.w.localStorage).filter(k => k !== KEY).sort(), keysBefore, 'no other key changed');
    assert(!('safety' in h.json('state')), 'no new job field');
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).version, 1);
  });

  await check('Changing the list on screen: reword, hide and show, add and delete, restore; each one is saved', async () => {
    click(h, '#safety-edit'); await flush();
    assert.equal(h.d.getElementById('safety-edit').getAttribute('aria-pressed'), 'true');
    change(h, '[data-check-text="ppe-hivis"]', 'High-visibility vest on'); await flush();
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).edits[0].text, 'High-visibility vest on');
    click(h, '[data-check-hide="fiber-hygiene"]'); await flush();
    assert.match(words(h.d.querySelector('.check-hidden')), /No food or drink at the fiber work area/);
    click(h, '[data-check-show="fiber-hygiene"]'); await flush();
    change(h, '[data-check-add-group]', 'Electrical'); change(h, '[data-check-add-text]', 'Lock out the supply before I open it'); click(h, '[data-check-add]'); await flush();
    const added = JSON.parse(h.w.localStorage.getItem(KEY)).custom; assert.equal(added.length, 1); assert.equal(added[0].group, 'Electrical');
    click(h, '[data-check-add]'); await flush();
    assert.match(h.d.getElementById('safety-note').textContent, /Enter the wording for the new item/); assert(h.d.getElementById('safety-note').classList.contains('error'));
    click(h, `[data-check-delete="${added[0].id}"]`); await flush();
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).custom.length, 0);
    click(h, '[data-check-reword="ppe-hivis"]'); await flush();
    assert.deepEqual(JSON.parse(h.w.localStorage.getItem(KEY)).edits, []);
    click(h, '#safety-edit'); await flush();
    assert.equal(h.d.getElementById('safety-edit').textContent, 'Change this list');
  });

  await check('Every control has a name a screen reader can tell apart, and each tick box is a real, large target', async () => {
    click(h, '#safety-edit'); await flush();
    for (const b of h.d.querySelectorAll('#safetyPanel [data-check-hide], #safetyPanel [data-check-delete], #safetyPanel [data-check-reword], #safetyPanel [data-check-show]')) assert(b.getAttribute('aria-label'), b.outerHTML);
    for (const i of h.d.querySelectorAll('[data-check-text]')) assert(i.closest('label'), 'edit field has a label');
    for (const i of h.d.querySelectorAll('[data-check]')) assert(i.closest('label.check-item'), 'tick box inside its label');
    click(h, '#safety-edit'); await flush();
    assert.equal(h.d.querySelectorAll('#safetyPanel input:not([type=checkbox]):not([type=time]):not([type=text])').length, 0);
    assert.equal(h.d.querySelector('[data-check-field="checkin"]').type, 'time');
  });

  await check('Stored markup is shown as text, never run: a hostile wording, section name and note create no element', async () => {
    const x = boot({ seed: JSON.stringify({ version: 1, checked: [], hidden: [], edits: [{ id: 'ppe-hivis', text: '<img src=x onerror=window.pwned=1> bold <b>b</b>' }],
      custom: [{ id: 'x-aaaa1', group: 'Electrical', text: '<script>window.pwned=2</script>' }], fields: { who: '"><img src=x onerror=window.pwned=3>', checkin: '', policy: '<b>x</b>' } }) });
    await flush(); await goto(x, 'safety');
    assert.equal(x.d.querySelectorAll('#safetyPanel img, #safetyPanel script, #safetyPanel b').length, 0);
    assert.match(words(x.d.getElementById('safetyPanel')), /<img src=x onerror=window.pwned=1> bold <b>b<\/b>/);
    assert.equal(x.d.querySelector('[data-check-field="who"]').value, '"><img src=x onerror=window.pwned=3>');
    assert.equal(x.w.pwned, undefined); assert.deepEqual(x.errors, []); x.close();
  });

  await check('A browser that will not store says so on screen, keeps the tick for this page, and writes it with the next change that saves', async () => {
    const x = boot(); await flush(); await goto(x, 'safety');
    const real = x.w.Storage.prototype.setItem; let fail = true;
    x.w.Storage.prototype.setItem = function (k, v) { if (k === KEY && fail) throw new x.w.DOMException('quota', 'QuotaExceededError'); return real.call(this, k, v); };
    tick(x, 'brief-job'); await flush();
    assert.match(x.d.getElementById('safety-note').textContent, /would not save it, so it lasts until you close the page/); assert(x.d.getElementById('safety-note').classList.contains('error'));
    assert.equal(x.d.querySelector('[data-check="brief-job"]').checked, true);
    fail = false; tick(x, 'brief-hazards'); await flush();
    assert.deepEqual(JSON.parse(x.w.localStorage.getItem(KEY)).checked.sort(), ['brief-hazards', 'brief-job']);
    x.close();
  });

  await check('Unreadable and newer stored data show a plain warning; the newer one is not overwritten', async () => {
    const u = boot({ seed: '{broken' }); await flush(); await goto(u, 'safety');
    assert.match(words(u.d.getElementById('safetyPanel')), /could not be read, so the original list is shown/);
    tick(u, 'brief-job'); await flush();
    assert.equal(u.w.localStorage.getItem(SIDE), '{broken'); assert.equal(JSON.parse(u.w.localStorage.getItem(KEY)).checked[0], 'brief-job'); u.close();
    const raw = JSON.stringify({ version: 3, anything: true }), n = boot({ seed: raw }); await flush(); await goto(n, 'safety');
    assert.match(words(n.d.getElementById('safetyPanel')), /newer version of the app saved this checklist/);
    tick(n, 'brief-job'); await flush();
    assert.equal(n.w.localStorage.getItem(KEY), raw); assert.match(n.d.getElementById('safety-note').textContent, /will not overwrite it/); n.close();
  });

  await check('Untick, save as text and clear: the export carries items and notes and says to check it; clear asks first and can be cancelled', async () => {
    downloads = [];
    click(h, '#safety-export'); await flush();
    assert.equal(downloads.length, 1); assert.equal(downloads[0].name, 'CarpeNoctum_2.0_Alpha_build_3_Pre-work_Safety.txt'); assert.equal(downloads[0].mime, 'text/plain');
    assert.match(downloads[0].text, /^Pre-work safety reminders \(not a company procedure\)\r\nPrepared \d{4}-\d{2}-\d{2} \d{2}:\d{2}\r\n/);
    assert.match(downloads[0].text, /\[x\] High-visibility clothing on when you work near a road or moving vehicles\./);
    assert.match(downloads[0].text, /\[x\] Inspect the ladder: rating, rungs, feet and locks\./);
    assert.match(downloads[0].text, /\[ \] Check for stray voltage with your approved tester/);
    assert.match(downloads[0].text, /Who knows where I am \(a name or role\): Crew lead/);
    assert.match(h.d.getElementById('safety-note').textContent, /check it before you send it/);
    confirmAnswer = false; click(h, '#safety-untick'); await flush(); confirmAnswer = true;
    assert.match(h.d.querySelector('.check-progress').textContent, /^[1-9]\d* of /, 'cancelling keeps the ticks');
    assert.equal(h.d.querySelector('[data-check-field="who"]').value, 'Crew lead', 'and the notes');
    click(h, '#safety-untick'); await flush(); assert.match(h.d.querySelector('.check-progress').textContent, /^0 of /);
    assert.deepEqual(['who', 'checkin', 'policy'].map(f => h.d.querySelector(`[data-check-field="${f}"]`).value), ['', '', 'Safety handbook'], 'the notes for this job clear; the standing policy note stays');
    tick(h, 'brief-job'); await flush();
    confirmAnswer = false; click(h, '#safety-clear'); await flush(); confirmAnswer = true;
    assert(h.w.localStorage.getItem(KEY), 'cancelled clear keeps the data');
    click(h, '#safety-clear'); await flush();
    assert.equal(h.w.localStorage.getItem(KEY), null); assert.match(h.d.getElementById('safety-note').textContent, /Cleared on this device/);
    assert.equal(h.d.querySelector('[data-check-field="who"]').value, '');
  });

  await check('The card is not in the printed run sheet, the Limits screen has no new row, and nothing else in the app changed', () => {
    assert.match(fs.readFileSync('night-sweep/style.css', 'utf8'), /#safetyPanel\{display:none!important\}|#safetyPanel,|,#safetyPanel/);
    assert.equal(h.json('Thresholds.rows.some(r=>/safety|outage|checklist/i.test(r.id))'), false, 'the card has no limits, so it adds no registry row');
    assert.equal((html.match(/const Checklist=\(\(\)=>/g) || []).length, 1); assert.equal((html.match(/const Safety=\(\(\)=>/g) || []).length, 1);
    assert.equal(h.json('NightSweep.selfCheck.ok'), true);
    assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 checklist: ${cases.length} checks passed`);
  fs.writeFileSync('qa/build3-checklist-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, cases, scope: 'Shared checklist engine and pre-work safety card; JSDOM rendering, device-local storage and job format. Synthetic text only; no phone or field check.' }, null, 1));
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
