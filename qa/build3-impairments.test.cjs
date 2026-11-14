/* Build 3 impairment decision tree and signature cards (build list item 11): the standing-wave candidate search
   against an independent 50-digit decimal reference on the complete practice route, the cards and the picker,
   five synthetic practice symptoms that each lead to a planted fault, the rendered screen, the registry row and
   the saved-job format. Synthetic data only; nothing is read from a meter. */
'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const reference = JSON.parse(fs.readFileSync('research/build3/impairments-reference.json', 'utf8'));
const html = process.env.NIGHTSWEEP_BUILD2_SOURCE_TEST === '1' ? require('./build2-source-harness.cjs').assembleHtml() : fs.readFileSync('outputs/Night_Sweep.html', 'utf8');
const cases = [];
let comparisons = 0;

function boot() { return require('./build2-source-harness.cjs').bootApp({ html }); }
const flush = () => new Promise(r => setImmediate(r));
async function check(name, fn) { await fn(); await flush(); cases.push(name); console.log('PASS ' + name); }
function close(actual, expected, label, tol = 1e-11) {
  const e = Number(expected);
  assert(Number.isFinite(actual), label + ' is finite: ' + actual);
  assert(Math.abs(actual - e) <= Math.max(tol, Math.abs(e) * tol), `${label}: app ${actual} vs reference ${expected}`);
  comparisons++;
}
const goto = async (h, tab) => { h.ev(`WorkflowUI.go(${JSON.stringify(tab)})`); await flush(); };
function words(el) { const out = [], walk = el.ownerDocument.createTreeWalker(el, 4); while (walk.nextNode()) { const s = walk.currentNode.nodeValue.trim(); if (s) out.push(s); } return out.join(' ').replace(/\s+/g, ' '); }
const pick = (h, shape) => { const el = h.d.querySelector(`input[name=impShape][value="${shape}"]`); assert(el, shape); el.checked = true; el.dispatchEvent(new h.w.Event('change', { bubbles: true })); };
const set = (h, selector, value) => { const el = h.d.querySelector(selector); assert(el, selector); el.value = value; el.dispatchEvent(new h.w.Event('input', { bubbles: true })); };
const title = h => h.d.getElementById('impCardTitle')?.textContent;

(async () => {
  const h = boot();
  await flush();

  await check('The ripple distance and the candidate search match the independent decimal reference on the complete practice route, branches included', async () => {
    for (const c of reference.cases.distance) {
      const r = h.json(`FieldCalc.rippleDistance(${JSON.stringify(c.input.spacing)},${JSON.stringify(c.input.vp)})`);
      assert.equal(r.ok, true); close(r.feet, c.expected.feet, 'feet ' + JSON.stringify(c.input), 1e-12); close(r.meters, c.expected.meters, 'meters', 1e-12);
    }
    h.ev('TrainingJob.open()'); await new Promise(r => setTimeout(r, 900));
    assert.deepEqual(h.json('state.rows.map(r=>r.id)'), reference.tree.map(t => t[0]), 'the practice route has the reference shape');
    assert.deepEqual(h.json('state.rows.map(r=>r.parent.split("::")[0])'), reference.tree.map(t => t[1]));
    for (const c of reference.cases.candidates) {
      h.ev(`(()=>{const L=${JSON.stringify(c.lengths)};state.rows.forEach(r=>{r.length=String(L[r.id]);r.slack='0';});})()`);
      const r = h.json(`Impairments.candidates(state,catalog,${Number(c.input.feet)},${c.input.width})`);
      assert.equal(r.ok, true, JSON.stringify(c.input)); assert.equal(r.total, c.expected.total, c.name + ' ' + JSON.stringify(c.input));
      assert.equal(r.candidates.length, c.expected.candidates.length);
      c.expected.candidates.forEach((e, i) => {
        const g = r.candidates[i];
        assert.equal(g.from, e.from, `${c.name} ${JSON.stringify(c.input)} #${i} from`); assert.equal(g.to, e.to, `${c.name} ${JSON.stringify(c.input)} #${i} to`);
        close(g.feet, e.feet, 'feet', 1e-12); close(g.errorPercent, e.errorPercent, 'error percent', 1e-9);
      });
    }
  });

  await check('Search inputs that make no sense give a reason and no list; a route with no valid point says so; a long distance and a width of 50 percent are bounded', () => {
    for (const bad of [['', 10], ['abc', 10], [0, 10], [-5, 10], [250, 0], [250, -1], [250, 51], [250, 'x'], [null, 10], [Infinity, 10]]) {
      const r = h.json(`Impairments.candidates(state,catalog,${JSON.stringify(bad[0])},${JSON.stringify(bad[1])})`); assert.equal(r.ok, false, JSON.stringify(bad)); assert(r.error.length > 20 && r.candidates === undefined, JSON.stringify(bad));
    }
    h.ev('state.rows.forEach(r=>{r.length="";});');
    const none = h.json('Impairments.candidates(state,catalog,250,10)'); assert.equal(none.ok, false); assert.match(none.error, /no point with a valid distance/);
    h.ev('state.rows.forEach(r=>{r.length="2500";r.slack="0";});');
    const wide = h.json('Impairments.candidates(state,catalog,2500,50)'); assert.equal(wide.ok, true); assert(wide.candidates.length <= 12); assert.equal(wide.truncated, wide.total > 12);
  });

  await check('The picker lists ten shapes, each leading to its own card of ten; every card has the five steps, causes, look-alikes and a source', () => {
    const shapes = h.json('Impairments.SHAPES'), cards = h.json('Impairments.CARDS');
    assert.equal(shapes.length, 10); assert.equal(cards.length, 10); assert.equal(new Set(shapes.map(s => s.card)).size, 10, 'one card per shape');
    for (const s of shapes) assert(cards.some(c => c.id === s.card), s.id);
    assert.deepEqual(h.json('Impairments.FLOW'), ['analyze', 'localize', 'prioritize', 'repair', 'validate']);
    for (const c of cards) {
      for (const k of ['analyze', 'localize', 'prioritize', 'repair', 'validate']) assert(c.flow[k] && c.flow[k].length > 30, c.id + ' ' + k);
      assert(c.looks.length > 40 && c.causes.length >= 2 && c.lookalikes.length >= 1 && /SCTE/.test(c.ref), c.id);
      assert(['primary', 'unverified'].includes(c.verified), c.id);
    }
    assert.deepEqual(cards.filter(c => c.verified === 'unverified').map(c => c.id).sort(), ['flat-loss', 'tilt'], 'the two cards whose source body was not read say so');
    assert.deepEqual(shapes.map(s => s.card).sort(), ['cpd', 'flat-loss', 'impulse', 'ingress', 'lte-ingress', 'resonant-peaking', 'roll-off', 'standing-wave', 'suckout', 'tilt']);
    for (const bad of ['', '__proto__', 'constructor', 'toString', 'nope']) { assert.equal(h.ev(`Impairments.card(${JSON.stringify(bad)})`), null, bad); assert.equal(h.ev(`Impairments.cardForShape(${JSON.stringify(bad)})`), null, bad); }
  });

  /* ---- Five synthetic practice symptoms, each with a planted fault ---- */
  await goto(h, 'impairments');
  await check('Practice symptom 1: a 1.7 MHz ripple on 0.87 VP cable leads to the standing-wave card and, on the sample route, to the planted fault between Tap 1 and Tap 2', async () => {
    const f = boot(); await flush(); await goto(f, 'impairments');
    pick(f, 'ripple'); await flush();
    assert.equal(title(f), 'Standing wave (ripple)');
    set(f, '[data-imp=spacing]', '1.7'); set(f, '[data-imp=vp]', '0.87');
    const text = words(f.d.getElementById('impRippleResult'));
    assert.match(text, /Distance between the two mismatches 251\.\d ft/); assert.match(text, /1 candidate place on the saved route/); assert.match(text, /Tap 1 Tap 2 250 ft −0\.7%/, 'the planted fault: a mismatch at each end of the 250 ft span from Tap 1 to Tap 2');
    f.close();
  });
  const practice = [
    ['notch', 'Suckout', /seizure/, 'a loose seizure screw in an active'],
    ['return-floor', 'Common path distortion (CPD)', /seizure screw[\s\S]*terminator/, 'a corroded joint at a loose seizure screw or a defective terminator'],
    ['spikes', 'Ingress (narrow-band)', /loose, wrong or damaged connectors/, 'a loose connector or a damaged drop'],
    ['bursts', 'Impulse and burst noise', /power-line gap noise/i, 'power-line gap noise getting in'],
  ];
  let n = 2;
  for (const [shape, name, cause, planted] of practice) {
    await check(`Practice symptom ${n++}: "${shape}" leads to the ${name} card, whose causes name the planted fault (${planted})`, () => {
      pick(h, shape);
      assert.equal(title(h), name); const text = words(h.d.querySelector('.imp-card'));
      assert.match(text, cause); assert.equal(h.d.querySelectorAll('.imp-flow li').length, 5);
    });
  }

  await check('Every shape opens its card with the five steps in order, a source line that says it is paraphrased and not the company procedure; the two unverified cards carry a warning', () => {
    for (const s of h.json('Impairments.SHAPES')) {
      pick(h, s.id); const card = h.json(`Impairments.card(${JSON.stringify(s.card)})`);
      assert.equal(title(h), card.name, s.id);
      assert.deepEqual([...h.d.querySelectorAll('.imp-flow li strong')].map(x => x.textContent), ['Analyze.', 'Localize.', 'Prioritize.', 'Repair.', 'Validate.'], s.id);
      const text = words(h.d.querySelector('.imp-card'));
      assert.match(text, /paraphrased and not copied/); assert.match(text, /not your company's procedure/); assert(text.includes(card.ref.split(';')[0].split(',')[0]), s.id + ' cites ' + card.ref);
      assert.equal(!!h.d.querySelector('.imp-card .status.warning'), card.verified === 'unverified', s.id);
    }
  });

  await check('The standing-wave tool matches the calculator, refuses a bad spacing or VP, explains an empty result, and escapes route names', async () => {
    const f = boot(); await flush(); await goto(f, 'impairments'); pick(f, 'ripple');
    assert.match(words(f.d.getElementById('impRippleResult')), /Enter the spacing and the cable velocity/);
    set(f, '[data-imp=spacing]', '0'); set(f, '[data-imp=vp]', '0.87'); assert(f.d.getElementById('impRippleResult').classList.contains('error')); assert.match(words(f.d.getElementById('impRippleResult')), /above 0/);
    set(f, '[data-imp=spacing]', '1.7'); set(f, '[data-imp=vp]', '2'); assert(f.d.getElementById('impRippleResult').classList.contains('error'));
    set(f, '[data-imp=vp]', '0.87'); set(f, '[data-imp=spacing]', '40');
    assert.match(words(f.d.getElementById('impRippleResult')), /No pair of points on the saved route is 10\.7 ft ± 10% apart/);
    set(f, '[data-imp=width]', '60'); assert.match(words(f.d.getElementById('impRippleResult')), /search width above 0 and at most 50 percent/);
    set(f, '[data-imp=width]', '10'); set(f, '[data-imp=spacing]', '1.7');
    f.ev('state.rows[1].name=\'<img src=x onerror=window.pwned=1>\'; ImpairmentsUI.updateRipple();');
    assert.equal(f.d.querySelectorAll('#impairmentsPanel img').length, 0); assert.match(words(f.d.getElementById('impRippleResult')), /<img src=x onerror=window\.pwned=1>/); assert.equal(f.w.pwned, undefined);
    f.ev('state.rows.length=0; ImpairmentsUI.updateRipple();'); assert.match(words(f.d.getElementById('impRippleResult')), /no point with a valid distance/);
    assert.deepEqual(f.errors, []); f.close();
  });

  await check('The screen is Tools → Impairments in the Cards list, shows only there, stores nothing, and leaves the saved job and every storage key as they were', async () => {
    const f = boot(); await flush();
    const before = JSON.stringify(f.json('evidenceExportProject(state)')), keys = JSON.stringify(Object.keys(f.w.localStorage).sort()), values = JSON.stringify(Object.keys(f.w.localStorage).sort().map(k => f.w.localStorage.getItem(k)));
    await goto(f, 'projects'); assert.equal(f.d.getElementById('impairmentsPanel').hidden, true);
    await goto(f, 'impairments');
    const tabs = [...f.d.querySelectorAll('#taskTabs button[data-task]')].map(b => b.textContent.trim()); assert.deepEqual(tabs.slice(5, 8), ['DOCSIS health', 'Impairments', 'Fiber']);
    assert.equal(f.d.getElementById('impairmentsPanel').hidden, false); assert.match(f.d.getElementById('screenTitle').textContent, /Find the impairment/);
    pick(f, 'ripple'); set(f, '[data-imp=spacing]', '1.7'); set(f, '[data-imp=vp]', '0.87'); pick(f, 'slope');
    assert.equal(JSON.stringify(f.json('evidenceExportProject(state)')), before, 'job export identical'); assert.equal(JSON.stringify(Object.keys(f.w.localStorage).sort()), keys, 'no new key');
    assert.equal(JSON.stringify(Object.keys(f.w.localStorage).sort().map(k => f.w.localStorage.getItem(k))), values, 'no value changed');
    assert(!('impairments' in f.json('state')));
    assert.equal(f.d.querySelectorAll('#impairmentsPanel input[type=radio]').length, 10); assert.equal(f.d.querySelectorAll('#impairmentsPanel input[inputmode]').length, 0);
    assert.match(words(f.d.getElementById('impairmentsPanel')), /your own aid and not your company's procedure/);
    f.close();
  });

  await check('The app-chosen search width is registered Unknown with its unchanged bounds and a real source dialog', async () => {
    const row = h.json('Thresholds.rows').find(r => r.id === 'app.impairment.rippleSearchWidth');
    assert(row); assert.equal(row.label, 'unknown'); assert.equal(row.verification, 'unverified'); assert.equal(row.value, 10); assert.equal(h.json('Impairments.SEARCH_WIDTH_PERCENT'), 10);
    assert.match(row.conditions, /not saved/); assert.equal(h.json('Thresholds.rows').filter(r => /impairment/i.test(r.id)).length, 1);
    assert.match(row.name, /app.chosen/i); assert.match(row.conditions, /above 0.*at most 50/i);
    pick(h, 'ripple'); assert(h.d.querySelectorAll('#impairmentsPanel [data-threshold]').length >= 2, 'ripple distance and search width tags');
    assert.match(words(h.d.querySelector('label[for="impWidth"]')), /app.chosen/i); assert.equal(h.d.getElementById('impWidth').value, '10');
    const widthTag = h.d.querySelector('#impRipple [data-threshold="app.impairment.rippleSearchWidth"]');
    assert.equal(widthTag.dataset.label, 'unknown'); assert.equal(widthTag.textContent.trim(), 'Unknown');
    assert.equal(h.d.querySelector('#impRipple [data-threshold="calc.ripple.distance"]').dataset.label, 'expert', 'the distance formula keeps its separate Expert source');
    widthTag.click(); await flush(); const sheet = h.d.querySelector('dialog.source-sheet'); assert(sheet); assert.equal(sheet.dataset.sheetFor, row.id);
    for (const text of [row.source, row.revision, row.locator, row.conditions]) assert(sheet.textContent.includes(text), 'actual source dialog shows '+text);
    h.ev('Thresholds.close()'); await flush(); assert.equal(h.d.querySelector('dialog.source-sheet'), null);
    for (const t of h.d.querySelectorAll('#impairmentsPanel [data-threshold]')) assert.equal(h.json(`Thresholds.matches(${JSON.stringify(t.dataset.threshold)})`), 1, t.dataset.threshold);
  });

  await check('Wide-band interference is kept among the look-alikes (SCTE 280 §9.4): a raised floor alone does not identify CPD, and extra cable is not flat loss', () => {
    const cpd = h.json("Impairments.card('cpd')"), ingress = h.json("Impairments.card('ingress')"), flat = h.json("Impairments.card('flat-loss')");
    assert(cpd.lookalikes.some(x => /wide-band interference/i.test(x) && /raised floor alone does not point to CPD/i.test(x)), 'the CPD card keeps wide-band interference as a look-alike');
    assert(!cpd.lookalikes.some(x => /^Ingress is at fixed frequencies/.test(x)), 'the old blanket statement is gone');
    assert(ingress.lookalikes.some(x => /wide-band interference raises the noise floor/i.test(x)), 'the ingress card separates narrow spikes from a raised floor');
    assert(!flat.causes.some(x => /very long cable/i.test(x)), 'very long cable is not listed as a flat-loss cause');
    assert(flat.lookalikes.some(x => /More cable than the design has/i.test(x) && /not flat loss/i.test(x)), 'extra cable is named as frequency-dependent loss');
  });

  await check('The module is bundled once, loads without script errors and the built-in self-check still passes', () => {
    assert.equal((html.match(/const Impairments=\(\(\)=>/g) || []).length, 1); assert.equal(h.json('NightSweep.selfCheck.ok'), true); assert.deepEqual(h.errors, []);
  });

  console.log(`Build3 impairments: ${cases.length} checks passed (${comparisons} comparisons with the independent reference)`);
  fs.writeFileSync('qa/build3-impairments-results.json', JSON.stringify({ version: '2.0 Alpha build 4', count: cases.length, comparisons, cases, scope: 'Candidate search against the independent reference built by impairments-reference.py in research/build3 (Python decimal, 50 digits); JSDOM rendering; synthetic practice symptoms. Nothing read from a meter.' }, null, 2) + '\n');
  h.close();
})().catch(e => { console.error(e); process.exit(1); });
