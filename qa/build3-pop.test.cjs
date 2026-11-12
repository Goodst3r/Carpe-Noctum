/* Build 3 FCC proof-of-performance card (build list item 20): the numbers on the screen against the rule clauses and the
   independent parser in research/build3/pop-reference.py, every item's rule section, the registry rows, the rendered screen,
   and that nothing is stored. A reference only: no input, no result, no filing. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const reference = JSON.parse(fs.readFileSync('research/build3/pop-reference.json', 'utf8'));
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const cases = [];
let comparisons = 0;
const boot = () => require('./build2-source-harness.cjs').bootApp({ html });
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const WORDS = { twice: 2, once: 1, six: 6, seven: 7, five: 5, ten: 10 };
// Numbers in a statement, with the rule-section numbers ("76.601(b)(1)") removed and number words read.
function numbersIn(text) {
  const cleaned = text.replace(/76\.\d+(?:\([a-z0-9]+\))*/g, ' ');
  const out = new Set();
  for (const m of cleaned.matchAll(/\d[\d,]*(?:\.\d+)?|\b(?:twice|once|six|seven|five|ten)\b/g)) out.add(m[0] in WORDS ? WORDS[m[0]] : Number(m[0].replace(/,/g, '')));
  return out;
}

(async () => {
  const h = boot();
  await flush();
  const items = h.json('ProofOfPerformance.GROUPS.flatMap(g=>g.items)');
  const byId = Object.fromEntries(items.map(i => [i.id, i]));

  await check('Every number the rule clause gives is on the screen for its item, and the item’s statement holds no other number', () => {
    assert.deepEqual(h.json('ProofOfPerformance.selfCheck()'), []);
    for (const [id, ref] of Object.entries(reference)) {
      const item = byId[id]; assert(item, 'item for ' + id);
      const reg = item.registry ? h.json(`Thresholds.get(${JSON.stringify(item.registry)})`) : null;
      const shown = numbersIn(item.limit + ' ' + (reg ? reg.rangeText + ' ' + reg.conditions : ''));
      const stated = numbersIn(item.limit);
      for (const n of ref.numbers) { assert(shown.has(n), `${id}: the rule number ${n} is not shown`); comparisons++; }
      for (const n of stated) { assert(ref.numbers.includes(n), `${id}: the screen states ${n}, which the rule clause does not`); comparisons++; }
      if (reg) for (const n of numbersIn(reg.rangeText)) { assert(ref.numbers.includes(n), `${id}: the registry row states ${n}, which the rule clause does not`); comparisons++; }
      assert.match(item.loc, new RegExp('^' + ref.rule.split('(')[0].replace('.', '\\.')), `${id} locator ${item.loc} vs ${ref.rule}`);
    }
    assert.equal(Object.keys(reference).length, 14);
  });

  await check('Each item names its rule section and locator, each section is one of the four read, and the registry rows are labeled spec, primary and name their section', () => {
    const rules = h.json('ProofOfPerformance.RULES');
    assert.deepEqual(Object.keys(rules).sort(), ['s1704', 's601', 's605', 's609']);
    for (const i of items) { assert(rules[i.rule], i.id); assert(/^76\.\d{3,4}/.test(i.loc), i.id); }
    const ids = [...new Set(items.map(i => i.registry).filter(Boolean))];
    const own = ids.filter(id => id.startsWith('fcc.pop.'));
    assert.equal(own.length, 14, 'fourteen rows of its own');
    for (const id of own) {
      const r = h.json(`Thresholds.get(${JSON.stringify(id)})`);
      assert.equal(r.label, 'spec', id); assert.equal(r.verification, 'primary', id); assert.equal(r.scope, 'all', id); assert.equal(r.kind, 'limit', id);
      assert.match(r.locator, /^Section 76\.\d+/, id); assert.match(r.source, /47 CFR Part 76/); assert.match(r.revision, /November 11, 2026/);
      assert(r.conditions.length > 20 && r.units, id); comparisons++;
    }
    assert.equal(h.json('Thresholds.get("leak.fcc.analog.near")').label, 'spec');
  });

  await check('The screen is Test → Proof of performance after Why cards, shows only there, names the four rule sections, is a reference only and says official results belong to engineering', async () => {
    await goto(h, 'projects'); assert.equal(h.d.getElementById('popPanel').hidden, true);
    await goto(h, 'pop');
    const tabs = [...h.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim()); assert.deepEqual(tabs.slice(9, 12), ['Why cards', 'Proof of performance', 'Study']);
    assert.equal(h.d.getElementById('popPanel').hidden, false); assert.match(h.d.getElementById('screenTitle').textContent, /FCC proof of performance/);
    const text = words(h.d.getElementById('popPanel'));
    for (const rule of ['76.601', '76.605', '76.609', '76.1704']) assert(text.includes(rule), rule);
    assert.match(text, /Official results belong to your engineering group/); assert.match(text, /does not make or record a test and is not a filing/);
    assert.match(text, /SCTE 204 2025/); assert.match(text, /found in the SCTE catalog and not read/);
    assert.match(text, /ANSI\/SCTE 40 2016/); assert.match(text, /Its requirements are not listed here/);
    const tables = h.d.querySelectorAll('#popPanel table'); assert.equal(tables.length, 4);
    assert.equal(h.d.querySelectorAll('#popPanel tbody tr').length, items.length);
    for (const r of h.d.querySelectorAll('#popPanel tbody tr')) assert.match(r.children[2].textContent, /^47 CFR 76\.\d+/);
    assert.equal(h.d.querySelectorAll('#popPanel input,#popPanel textarea,#popPanel select').length, 0, 'no input to type into');
  });

  await check('The two shortcuts the rule allows keep their conditions on the screen and in the registry: one noise reading needs constant noise (76.609(e)), and the isolation waiver needs the sample sizes and the exhibit (76.609(g))', () => {
    assert.match(reference.noise.clause, /If it is established that the noise level is constant within this bandwidth/); assert.match(reference.isolation.clause, /no less than 500/); assert.match(reference.isolation.clause, /no less than 50 subscriber taps/);
    const noise = byId.noise, iso = byId.isolation, regNoise = h.json("Thresholds.get('fcc.pop.noise')"), regIso = h.json("Thresholds.get('fcc.pop.isolation')");
    assert.match(noise.limit, /may be used only if it has been established that the noise level is constant within that band/); assert.match(regNoise.conditions, /allowed only if it has been established that the noise level is constant within that band/);
    assert.doesNotMatch(noise.limit, /, or in one reading/, 'the old unconditional alternative is gone');
    for (const x of [iso.limit, regIso.conditions]) { assert.match(x, /500 (subscriber )?taps/); assert.match(x, /50 (subscriber )?taps/); assert.match(x, /each proof-of-performance record|exhibit to each proof-of-performance record/); assert.match(x, /76\.609\(g\)/); }
    assert.doesNotMatch(iso.limit, /a manufacturer’s specification can stand in for periodic testing/, 'the unspecified waiver is gone');
    comparisons += 12;
  });

  await check('Every tag is one registry row and Limits shows one tag for every row; opening the screen writes nothing and leaves the saved job alone', async () => {
    await goto(h, 'pop');
    const ids = new Set();
    for (const t of h.d.querySelectorAll('#popPanel [data-threshold]')) { assert.equal(h.json(`Thresholds.matches(${JSON.stringify(t.dataset.threshold)})`), 1, t.dataset.threshold); ids.add(t.dataset.threshold); }
    assert.equal(ids.size, 15, '14 own rows and the leakage table row');
    await goto(h, 'limits');
    assert.equal(h.d.querySelectorAll('#limitsList [data-threshold]').length, h.json('Thresholds.rows.length'), 'one tag per registry row in Limits');
    assert.match(words(h.d.getElementById('limitsList')), /FCC proof of performance/);
    const x = boot(); await flush();
    const before = JSON.stringify(x.json('evidenceExportProject(state)')), values = JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)]));
    await goto(x, 'pop'); await goto(x, 'limits'); await goto(x, 'pop');
    assert.equal(JSON.stringify(x.json('evidenceExportProject(state)')), before);
    assert.equal(JSON.stringify(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)])), values);
    assert(!('pop' in x.json('state')), 'no new job field'); assert.deepEqual(x.errors, []); x.close();
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal((html.match(/const ProofOfPerformance=\(\(\)=>/g) || []).length, 1); assert.equal(h.json('NightSweep.selfCheck.ok'), true); assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 proof of performance: ${cases.length} checks passed (${comparisons} comparisons with the rule clauses)`);
  fs.writeFileSync('qa/build3-pop-results.json', JSON.stringify({ version: '2.0 Alpha build 3', count: cases.length, comparisons, cases, scope: 'App statements against the rule clauses parsed by pop-reference.py (kept in research/build3), plus the rendered screen, the registry rows and the saved-job format. No input, no storage.' }, null, 1) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
