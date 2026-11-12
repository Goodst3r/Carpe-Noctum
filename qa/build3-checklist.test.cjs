/* Build 3 shared checklist engine and the outage first-response card (build list item 8).
   Engine rules (ticks, wording changes, hiding, adding, notes, merging with another tab, a browser that
   will not store, unreadable or newer stored data, hostile stored data), then the rendered card, the
   device-local key and the saved-job format. No calculations are involved, so there is no numeric
   reference. Synthetic text only. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict'), { webcrypto } = require('node:crypto');
const { JSDOM, VirtualConsole } = require('./runtime/node_modules/jsdom'), FDB = require('./runtime/node_modules/fake-indexeddb');
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const KEY = 'nightsweep-outage-v1', SIDE = KEY + '-unreadable', OUTAGE_KEY = KEY, LEGACY_SAFETY_KEY = 'nightsweep-safety-v1';
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

  /* ---- The shared checklist UI, exercised through the remaining Outage card ---- */
  await goto(h, 'outage');

  await check('Changing the list on screen: reword, hide and show, add and delete, restore; each one is saved', async () => {
    click(h, '#outage-edit'); await flush();
    assert.equal(h.d.getElementById('outage-edit').getAttribute('aria-pressed'), 'true');
    change(h, '[data-check-text="power-ac"]', 'Utility AC checked'); await flush();
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).edits[0].text, 'Utility AC checked');
    click(h, '[data-check-hide="node-nolight"]'); await flush();
    assert.match(words(h.d.querySelector('.check-hidden')), /If there is no light/);
    click(h, '[data-check-show="node-nolight"]'); await flush();
    change(h, '[data-check-add-group]', 'Power'); change(h, '[data-check-add-text]', 'Record the supply alarm state'); click(h, '[data-check-add]'); await flush();
    const added = JSON.parse(h.w.localStorage.getItem(KEY)).custom; assert.equal(added.length, 1); assert.equal(added[0].group, 'Power');
    click(h, '[data-check-add]'); await flush();
    assert.match(h.d.getElementById('outage-note').textContent, /Enter the wording for the new item/); assert(h.d.getElementById('outage-note').classList.contains('error'));
    click(h, `[data-check-delete="${added[0].id}"]`); await flush();
    assert.equal(JSON.parse(h.w.localStorage.getItem(KEY)).custom.length, 0);
    click(h, '[data-check-reword="power-ac"]'); await flush();
    assert.deepEqual(JSON.parse(h.w.localStorage.getItem(KEY)).edits, []);
    click(h, '#outage-edit'); await flush();
    assert.equal(h.d.getElementById('outage-edit').textContent, 'Change this list');
  });

  await check('Every control has a name a screen reader can tell apart, and each tick box is a real, large target', async () => {
    click(h, '#outage-edit'); await flush();
    for (const b of h.d.querySelectorAll('#outagePanel [data-check-hide], #outagePanel [data-check-delete], #outagePanel [data-check-reword], #outagePanel [data-check-show]')) assert(b.getAttribute('aria-label'), b.outerHTML);
    for (const i of h.d.querySelectorAll('[data-check-text]')) assert(i.closest('label'), 'edit field has a label');
    for (const i of h.d.querySelectorAll('[data-check]')) assert(i.closest('label.check-item'), 'tick box inside its label');
    click(h, '#outage-edit'); await flush();
    assert.equal(h.d.querySelectorAll('#outagePanel input:not([type=checkbox]):not([type=time]):not([type=text])').length, 0);
    assert.equal(h.d.querySelector('[data-check-field="arrived"]').type, 'time');
  });

  await check('Stored markup is shown as text, never run: a hostile wording, section name and note create no element', async () => {
    const x = boot({ seed: JSON.stringify({ version: 1, checked: [], hidden: [], edits: [{ id: 'power-ac', text: '<img src=x onerror=window.pwned=1> bold <b>b</b>' }],
      custom: [{ id: 'x-aaaa1', group: 'Power', text: '<script>window.pwned=2</script>' }], fields: { where: '"><img src=x onerror=window.pwned=3>', arrived: '', cause: '<b>x</b>' } }) });
    await flush(); await goto(x, 'outage');
    assert.equal(x.d.querySelectorAll('#outagePanel img, #outagePanel script, #outagePanel b').length, 0);
    assert.match(words(x.d.getElementById('outagePanel')), /<img src=x onerror=window.pwned=1> bold <b>b<\/b>/);
    assert.equal(x.d.querySelector('[data-check-field="where"]').value, '"><img src=x onerror=window.pwned=3>');
    assert.equal(x.w.pwned, undefined); assert.deepEqual(x.errors, []); x.close();
  });

  await check('A browser that will not store says so on screen, keeps the tick for this page, and writes it with the next change that saves', async () => {
    const x = boot(); await flush(); await goto(x, 'outage');
    const real = x.w.Storage.prototype.setItem; let fail = true;
    x.w.Storage.prototype.setItem = function (k, v) { if (k === KEY && fail) throw new x.w.DOMException('quota', 'QuotaExceededError'); return real.call(this, k, v); };
    tick(x, 'scope-what'); await flush();
    assert.match(x.d.getElementById('outage-note').textContent, /would not save it, so it lasts until you close the page/); assert(x.d.getElementById('outage-note').classList.contains('error'));
    assert.equal(x.d.querySelector('[data-check="scope-what"]').checked, true);
    fail = false; tick(x, 'scope-nearby'); await flush();
    assert.deepEqual(JSON.parse(x.w.localStorage.getItem(KEY)).checked.sort(), ['scope-nearby', 'scope-what']);
    x.close();
  });

  await check('Unreadable and newer stored data show a plain warning; the newer one is not overwritten', async () => {
    const u = boot({ seed: '{broken' }); await flush(); await goto(u, 'outage');
    assert.match(words(u.d.getElementById('outagePanel')), /could not be read, so the original list is shown/);
    tick(u, 'scope-what'); await flush();
    assert.equal(u.w.localStorage.getItem(SIDE), '{broken'); assert.equal(JSON.parse(u.w.localStorage.getItem(KEY)).checked[0], 'scope-what'); u.close();
    const raw = JSON.stringify({ version: 3, anything: true }), n = boot({ seed: raw }); await flush(); await goto(n, 'outage');
    assert.match(words(n.d.getElementById('outagePanel')), /newer version of the app saved this checklist/);
    tick(n, 'scope-what'); await flush();
    assert.equal(n.w.localStorage.getItem(KEY), raw); assert.match(n.d.getElementById('outage-note').textContent, /will not overwrite it/); n.close();
  });

  await check('Unreadable stored data is never replaced while no copy of it can be kept: the change waits in memory, the original stays byte for byte, and everything is written once the copy succeeds', () => {
    const KEY2 = 'nightsweep-test-v1', SIDE2 = KEY2 + '-unreadable', original = '{"version":1,"checked":[' + 'x'.repeat(2000);   // truncated JSON: unreadable
    const st = fakeStorage({ [KEY2]: original }), L = make();
    let sideFails = true; const real = st.setItem.bind(st); st.setItem = (k, v) => { if (k === SIDE2 && sideFails) throw new Error('quota'); real(k, v); };
    L.load(st); assert.equal(L.status(), 'unreadable');
    const r1 = plain(L.toggle('a-one', true, st));
    assert.deepEqual([r1.ok, r1.saved, r1.unreadableKept], [true, false, false]);
    assert.equal(st.getItem(KEY2), original, 'the unreadable original is untouched');
    assert.equal(st.getItem(SIDE2), null, 'no copy exists, so none is claimed');
    assert.equal(L.view().done, 1, 'the tick is held in memory'); assert.equal(L.view().unreadableCopy, false); assert.equal(L.status(), 'unreadable');
    const r2 = plain(L.setField('who', 'Sam', st));
    assert.deepEqual([r2.saved, r2.unreadableKept], [false, false]); assert.equal(st.getItem(KEY2), original);
    assert.equal(L.view().done, 1); assert.equal(L.view().fields[0].value, 'Sam', 'earlier held changes are still shown');
    sideFails = false;
    const r3 = plain(L.toggle('b-one', true, st));
    assert.deepEqual([r3.saved, r3.unreadableKept], [true, true]);
    assert.equal(st.getItem(SIDE2), original, 'the copy is exactly the original');
    const s = stored(st); assert.deepEqual(s.checked.sort(), ['a-one', 'b-one'], 'the held tick is written with the next change'); assert.equal(s.fields.who, 'Sam');
    assert.equal(L.status(), 'ok');
  });

  await check('An earlier, different unreadable copy also blocks replacement; the same copy allows it; an explicit clear removes both', () => {
    const KEY2 = 'nightsweep-test-v1', SIDE2 = KEY2 + '-unreadable';
    const st = fakeStorage({ [KEY2]: '{newer broken', [SIDE2]: '{older broken' }), L = make();
    L.load(st);
    const r1 = plain(L.toggle('a-one', true, st));
    assert.deepEqual([r1.saved, r1.unreadableKept], [false, false]); assert.equal(st.getItem(KEY2), '{newer broken'); assert.equal(st.getItem(SIDE2), '{older broken');
    assert.equal(L.view().done, 1);
    const same = fakeStorage({ [KEY2]: '{same broken', [SIDE2]: '{same broken' }), M = make(); M.load(same);
    const r2 = plain(M.toggle('a-one', true, same)); assert.deepEqual([r2.saved, r2.unreadableKept], [true, true]); assert.equal(stored(same).checked[0], 'a-one');
    assert.equal(L.clearAll(st).ok, true); assert.equal(st.getItem(KEY2), null); assert.equal(st.getItem(SIDE2), null);
    assert.equal(plain(L.toggle('a-one', true, st)).saved, true, 'after the explicit clear the list saves again');
  });

  await check('On screen: when the unreadable data cannot be copied the card says Not saved, keeps the tick and the original, and the next change that can copy it saves everything', async () => {
    const x = boot({ seed: '{broken' }); await flush(); await goto(x, 'outage');
    const real = x.w.Storage.prototype.setItem; let fail = true;
    x.w.Storage.prototype.setItem = function (k, v) { if (k === SIDE && fail) throw new x.w.DOMException('quota', 'QuotaExceededError'); return real.call(this, k, v); };
    tick(x, 'scope-what'); await flush();
    assert.equal(x.w.localStorage.getItem(KEY), '{broken', 'the unreadable original is still there'); assert.equal(x.w.localStorage.getItem(SIDE), null);
    const note = x.d.getElementById('outage-note'); assert.match(note.textContent, /^Not saved\./); assert.match(note.textContent, /left exactly as it was/); assert(note.classList.contains('error'));
    assert.equal(x.d.querySelector('[data-check="scope-what"]').checked, true, 'the tick stays on screen');
    assert.match(words(x.d.getElementById('outagePanel')), /a copy of it could not be set aside, so it has been left as it was/);
    assert(x.d.querySelector('#outagePanel [role="alert"]'), 'the warning is an alert');
    fail = false; tick(x, 'scope-nearby'); await flush();
    assert.equal(x.w.localStorage.getItem(SIDE), '{broken'); assert.deepEqual(JSON.parse(x.w.localStorage.getItem(KEY)).checked.sort(), ['scope-nearby', 'scope-what']);
    assert.match(x.d.getElementById('outage-note').textContent, /copy of the unreadable older data is kept/);
    x.close();
  });

  await check('A time box with only part filled in is refused, not saved as blank: the saved time stays, the box is marked and the reason is right under it; clearing every part is a deliberate blank', async () => {
    const x = boot(); await flush(); await goto(x, 'outage');
    const box = () => x.d.querySelector('[data-check-field="arrived"]'), saved = () => JSON.parse(x.w.localStorage.getItem(KEY)).fields.arrived;
    let el = box(); assert.equal(el.type, 'time'); el.value = '14:30'; el.dispatchEvent(new x.w.Event('change', { bubbles: true })); await flush();
    assert.equal(saved(), '14:30');
    el = box();   // the card redraws after a saved change
    Object.defineProperty(el, 'validity', { value: { badInput: true }, configurable: true }); el.value = '';
    for (const type of ['input', 'change']) { el.dispatchEvent(new x.w.Event(type, { bubbles: true })); await flush(); assert.equal(saved(), '14:30', 'a partial edit does not erase the saved time (' + type + ')'); assert.equal(box(), el, 'the box is not redrawn, so what was typed stays'); }
    assert.equal(el.getAttribute('aria-invalid'), 'true');
    const problem = el.closest('label').nextElementSibling; assert(problem && problem.classList.contains('check-field-error'), 'the reason sits right under the box'); assert.equal(problem.getAttribute('role'), 'alert');
    assert.match(problem.textContent, /^Not saved\. The time is incomplete/); assert.match(problem.textContent, /The saved time is still 14:30/); assert.equal(el.getAttribute('aria-describedby'), problem.id);
    assert.equal(x.d.querySelectorAll('.check-field-error').length, 1, 'repeated events do not stack messages');
    el.dispatchEvent(new x.w.Event('focusout', { bubbles: true })); await flush(); assert.equal(saved(), '14:30');
    Object.defineProperty(el, 'validity', { value: { badInput: false }, configurable: true }); el.value = '';   // every part cleared
    el.dispatchEvent(new x.w.Event('input', { bubbles: true })); await flush();
    assert.equal(saved(), '', 'a box with every part cleared is saved as blank'); assert(!el.hasAttribute('aria-invalid')); assert.equal(x.d.querySelectorAll('.check-field-error').length, 0);
    el.type = 'text'; el.value = '25:99'; el.dispatchEvent(new x.w.Event('change', { bubbles: true })); await flush();   // a browser without a time box (plain text)
    assert.equal(saved(), '', 'an impossible time is refused'); assert.match(x.d.querySelector('.check-field-error').textContent, /24-hour clock/);
    x.close();
  });

  await check('The three software caps are registered as Unknown application guards with units, conditions and a source, grouped on Test -> Limits, and tagged beside the controls they bound (never inside a label)', async () => {
    const x = boot(); await flush();
    const rows = x.json("Thresholds.rows.filter(r=>r.id.startsWith('checklist.')).map(r=>({id:r.id,label:r.label,value:r.value,units:r.units,source:r.source,conditions:r.conditions,usedBy:r.usedBy,kind:r.kind}))");
    assert.deepEqual(rows.map(r => [r.id, r.value, r.units]), [['checklist.items.max', 40, 'items per checklist'], ['checklist.itemText.max', 160, 'characters per item'], ['checklist.note.max', 120, 'characters per note box']]);
    for (const r of rows) { assert.equal(r.label, 'unknown'); assert.equal(r.kind, 'limit'); assert.match(r.source, /application guard/i); assert(r.conditions.length > 60 && /not|only/i.test(r.conditions)); assert.match(r.usedBy, /^Home → Outage/); }
    assert.match(rows.find(r => r.id === 'checklist.note.max').conditions, /who was told 80/); assert.match(rows.find(r => r.id === 'checklist.note.max').conditions, /what was found and done 120/);
    // the numbers the code really enforces are the registered ones
    assert.equal(x.json('Checklist.MAX_CUSTOM'), 40); assert.equal(x.json('Checklist.MAX_TEXT'), 160); assert.equal(x.json('Checklist.MAX_NOTE'), 120);
    await goto(x, 'limits');
    assert(/Checklist cards application guards/.test(words(x.d.getElementById('limitsList'))), 'the group appears on Test -> Limits');
    await goto(x, 'outage');
    const notesTag = x.d.querySelector('#outagePanel .check-notes h3 [data-threshold="checklist.note.max"]'); assert(notesTag, 'a tag beside Notes for this job');
    assert(!x.d.querySelector('#outagePanel label [data-threshold]'), 'no source tag sits inside a label');
    assert(!x.d.querySelector('#outagePanel .check-add'), 'the editor is closed until Change this list is pressed');
    click(x, '#outage-edit'); await flush();
    for (const id of ['checklist.items.max', 'checklist.itemText.max']) assert(x.d.querySelector(`#outagePanel .check-add h3 [data-threshold="${id}"]`), 'a tag beside Add an item for ' + id);
    assert(!x.d.querySelector('#outagePanel label [data-threshold]'), 'still no source tag inside a label');
    assert.match(x.d.querySelector('#outagePanel [data-threshold="checklist.items.max"]').getAttribute('aria-label'), /^Unknown source for how many items you can add/);
    // the real numbers still bound the real controls
    assert.equal(x.d.querySelector('[data-check-add-text]').maxLength, 160); assert.equal(x.d.querySelector('[data-check-field="tellwho"]').maxLength, 80); assert.equal(x.d.querySelector('[data-check-field="where"]').maxLength, 120);
    x.close();
  });

  await check('The card is not in the printed run sheet, the Limits screen has no new row, and nothing else in the app changed', () => {
    assert.match(fs.readFileSync('night-sweep/style.css', 'utf8'), /#outagePanel\{display:none!important\}|#outagePanel,|,#outagePanel/);
    assert.deepEqual(h.json('Thresholds.rows.filter(r=>/safety|outage|checklist/i.test(r.id)).map(r=>r.id).sort()'), ['checklist.itemText.max', 'checklist.items.max', 'checklist.note.max'], 'the cards add exactly their three software caps to the registry, and nothing else');
    assert.equal((html.match(/const Checklist=\(\(\)=>/g) || []).length, 1); assert.equal((html.match(/const Outage=\(\(\)=>/g) || []).length, 1);
    assert.equal(h.json('NightSweep.selfCheck.ok'), true);
    assert.deepEqual(h.errors, []);
  });


  // Keep the feature-specific Outage checks below independent of editor state above.
  click(h, '#outage-clear'); await flush();

  /* ---- The outage first-response card ---- */
  await goto(h, 'outage');

  await check('Home has an Outage tab; the screen opens with the company-procedure line, says it is not the procedure, and that a supervisor review is still needed', () => {
    const tabs = [...h.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim());
    assert.deepEqual(tabs, ['Home', 'Outage']);
    const panel = h.d.getElementById('outagePanel');
    assert.equal(panel.hidden, false); assert.equal(h.d.getElementById('safetyPanel'), null);
    const policy = panel.querySelector('.check-policy');
    assert(policy.compareDocumentPosition(panel.querySelector('.check-section')) & 4);
    assert.match(policy.textContent, /^Follow your company’s outage procedure first/); assert.match(policy.textContent, /not your company’s procedure/);
    assert.match(words(panel), /has not yet reviewed it against your local outage procedure, and that review is needed before coworkers use it/);
    assert.match(words(panel), /still writing its evidence-collection standard; this card does not implement it/);
    assert.deepEqual(h.json('Outage.list.groups'), ['Confirm the scope', 'Power', 'Node and optics', 'Actives, in order', 'Tell the right people', 'If damage or theft is suspected', 'Record the times']);
    assert.equal(h.d.querySelectorAll('#outagePanel [data-check]').length, h.json('Outage.ITEMS').length);
    assert.equal(h.d.querySelector('#taskTabs [aria-selected="true"]')?.textContent.trim(), 'Outage');
  });

  await check('No customer identifiers: the only entries are plant places, roles, times and what was found; no field asks for a name, address, phone or account', () => {
    const fields = h.json('Outage.FIELDS');
    assert.deepEqual(fields.map(f => f.id), ['where', 'arrived', 'found', 'told', 'restored', 'cause', 'tellwho', 'damage', 'damagetold', 'damagetime']);
    for (const f of fields) {
      assert(['text', 'time'].includes(f.type)); assert(f.type === 'time' || f.max <= 120, f.id);
      assert(!/\b(account|phone|address|email|customer)\b/i.test(f.label) || /no customer|a role/i.test(f.label), 'label asks for identity: ' + f.label);
    }
    assert.match(fields[0].label, /no customer names or addresses/); assert.match(fields[6].label, /a role/);
    const items = h.json('Outage.ITEMS').map(i => i.text).join(' ');
    assert.match(items, /Do not copy customer names or addresses into this card/); assert.doesNotMatch(items, /photo|picture|GPS|latitude|street address/i, 'no photos or locations');
    assert(h.json('Outage.ITEMS').every(i => i.text.length <= 160 && !/\d{2,}/.test(i.text)), 'no numbers or limits in the wording');
    assert.equal(h.json('Outage.ITEMS').length, new Set(h.json('Outage.ITEMS').map(i => i.id)).size);
    assert(!h.json('Outage.FIELDS').some(f => f.keep), 'every note belongs to one call');
    assert.match(h.d.querySelector('[data-check-field="where"]').getAttribute('placeholder'), /node leg 3/);
    assert.equal(h.d.querySelectorAll('#outagePanel input[type=time]').length, 5);
  });

  await check('Ticks and notes save under the outage key only; the safety key, the saved job and every other key are untouched', async () => {
    const before = JSON.stringify(h.json('evidenceExportProject(state)')), safetyBefore = h.w.localStorage.getItem(LEGACY_SAFETY_KEY);
    const keys = Object.keys(h.w.localStorage).filter(k => k !== OUTAGE_KEY).sort();
    tick(h, 'power-ac'); tick(h, 'node-lights'); tick(h, 'act-order');
    change(h, '[data-check-field="where"]', 'Node leg 3, amp 2'); change(h, '[data-check-field="arrived"]', '08:15'); change(h, '[data-check-field="cause"]', 'Blown fuse at the supply'); change(h, '[data-check-field="tellwho"]', 'dispatch'); await flush();
    const s = JSON.parse(h.w.localStorage.getItem(OUTAGE_KEY));
    assert.deepEqual(s.checked.sort(), ['act-order', 'node-lights', 'power-ac']);
    assert.deepEqual([s.fields.where, s.fields.arrived, s.fields.cause, s.fields.tellwho, s.fields.damage, s.fields.damagetime], ['Node leg 3, amp 2', '08:15', 'Blown fuse at the supply', 'dispatch', '', '']);
    assert.equal(h.w.localStorage.getItem(LEGACY_SAFETY_KEY), safetyBefore, 'the legacy Safety key is not touched');
    assert.deepEqual(Object.keys(h.w.localStorage).filter(k => k !== OUTAGE_KEY).sort(), keys, 'no other key changed');
    assert.equal(JSON.stringify(h.json('evidenceExportProject(state)')), before, 'job export identical'); assert(!('outage' in h.json('state')));
    assert.match(h.d.querySelector('#outagePanel .check-progress').textContent, /^3 of 22 ticked$/);
    // A time box cannot hold an invalid time in a browser; a bad string that still arrives is refused and the old time stays.
    assert.equal(h.json('Outage.list.setField("arrived","25:70",localStorage)').ok, false);
    assert.equal(JSON.parse(h.w.localStorage.getItem(OUTAGE_KEY)).fields.arrived, '08:15');
  });

  await check('Save as text carries the ticks, plant place, times and what was found, leaves blank notes out, and names the file for the outage call', async () => {
    change(h, '[data-check-field="damage"]', 'Cut strand and missing tap plate'); change(h, '[data-check-field="damagetold"]', 'supervisor'); change(h, '[data-check-field="damagetime"]', '09:40'); await flush();
    downloads = []; click(h, '#outage-export'); await flush();
    assert.equal(downloads.length, 1); assert.equal(downloads[0].name, 'CarpeNoctum_2.0_Alpha_build_3_Outage_First_Response.txt'); assert.equal(downloads[0].mime, 'text/plain');
    assert.match(h.d.getElementById('outage-note').textContent, /check it before you send it/);
    const text = downloads[0].text;
    assert.match(text, /^Outage first-response notes \(not a company procedure\)\r\nPrepared \d{4}-\d{2}-\d{2} \d{2}:\d{2}\r\n/);
    assert.match(text, /\[x\] Check whether utility AC power is present at the power supply\./); assert.match(text, /\[ \] Check the node’s status lights|\[x\] Check the node’s status lights/);
    assert.match(text, /Where on the plant \(node, leg, amp or pole; no customer names or addresses\): Node leg 3, amp 2/);
    assert.match(text, /Time I arrived \(24-hour\): 08:15/); assert.match(text, /Damage or theft: time it was reported \(24-hour\): 09:40/);
    assert.doesNotMatch(text, /Time I found the cause|Time service was restored/, 'blank notes are left out');
    assert.match(text, /3 of 22 ticked/);
  });

  await check('Start a new call clears ticks and every note (after a confirmation that can be cancelled) but keeps the technician\'s changes to the list', async () => {
    click(h, '#outage-edit'); await flush();
    change(h, '[data-check-text="power-ac"]', 'Check for utility AC at the supply'); click(h, '[data-check-hide="act-between"]'); await flush();
    click(h, '#outage-edit'); await flush();
    confirmAnswer = false; click(h, '#outage-untick'); await flush(); confirmAnswer = true;
    assert.match(h.d.querySelector('#outagePanel .check-progress').textContent, /^3 of /); assert.equal(h.d.querySelector('[data-check-field="where"]').value, 'Node leg 3, amp 2');
    click(h, '#outage-untick'); await flush();
    const s = JSON.parse(h.w.localStorage.getItem(OUTAGE_KEY));
    assert.deepEqual(s.checked, []); assert(Object.values(s.fields).every(v => v === ''), 'every note cleared');
    assert.equal(s.edits.length, 1); assert.deepEqual(s.hidden, ['act-between']);
    assert.equal(h.d.getElementById('outage-untick').textContent, 'Start a new call');
  });

  await check('Clearing Outage asks first, leaves other device data unchanged, and the remaining card uses the shared engine once', async () => {
    tick(h, 'power-ac'); await flush();
    const legacy = '{legacy Safety data retained exactly';
    h.w.localStorage.setItem(LEGACY_SAFETY_KEY, legacy);
    const others = Object.keys(h.w.localStorage).filter(k => k !== OUTAGE_KEY).sort().map(k => [k, h.w.localStorage.getItem(k)]);
    confirmAnswer = false; click(h, '#outage-clear'); await flush(); confirmAnswer = true;
    assert(h.w.localStorage.getItem(OUTAGE_KEY), 'cancelled clear keeps Outage data');
    click(h, '#outage-clear'); await flush();
    assert.equal(h.w.localStorage.getItem(OUTAGE_KEY), null);
    assert.deepEqual(Object.keys(h.w.localStorage).filter(k => k !== OUTAGE_KEY).sort().map(k => [k, h.w.localStorage.getItem(k)]), others);
    assert.equal(h.w.localStorage.getItem(LEGACY_SAFETY_KEY), legacy);
    assert.match(h.d.getElementById('outage-note').textContent, /Cleared on this device/);
    assert.equal(h.d.querySelector('[data-check-field="where"]').value, '');
    assert.equal(h.ev('Outage.list.key'), OUTAGE_KEY);
    assert.equal((html.match(/const Outage=\(\(\)=>/g) || []).length, 1);
    assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 checklist: ${cases.length} checks passed`);
  fs.writeFileSync('qa/build3-checklist-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, cases, scope: 'Shared checklist engine and Outage first-response card; JSDOM rendering, device-local storage and job format. Synthetic text only; no phone or field check.' }, null, 1));
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
