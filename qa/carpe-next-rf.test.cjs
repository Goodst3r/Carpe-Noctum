#!/usr/bin/env node
'use strict';
/**
 * RF checks against the frozen engine, workbench and sourced pad/EQ solver.
 *
 * 42/54 main-leg budget, derived outside the solver:
 *   Flat launch 10 dBmV at 54 and 860 MHz, zero-length span, so input is 10.
 *   Entered GainMaker operating gain is 31 dB at both markers and output loss is 0.
 *   Predicted output = 10 + 31 - 0 = 41 dBmV.
 *   Target 43 dBmV. Required gain = 43 + 0 - 10 = 33 dB. Margin = 31 - 33 = -2 dB.
 *   Catalog published forward gain for active_gm_hgd is the 43 dB screening
 *   reference (Cisco GainMaker HGD), not the operating gain used above.
 *   Forward band 54–1002 MHz and return ceiling 42 MHz classify the split as 42.
 *
 * Independent auxiliary leg, same input, not copied from main:
 *   Gain 20 dB, additional output loss 1 dB, target 35 dBmV, limit 40 dBmV.
 *   Predicted output = 10 + 20 - 1 = 29 dBmV.
 *   Required gain = 35 + 1 - 10 = 26 dB. Margin = 20 - 26 = -6 dB.
 *   Limit margin = 40 - 29 = 11 dB. Main has no output limit.
 *
 * 204/258 is the AOI HGD profile: forward 258–1794 MHz, return ceiling 204 MHz.
 * A 54 MHz marker is below that forward floor. A 1218 MHz marker is above the
 * GainMaker 1002 MHz forward edge. Company node formulas are separate:
 *   42/54: L(f) = 32 + 11 × (f − 54) / 699, 54 ≤ f ≤ 753 (32 at 54, 43 at 753).
 *   204/258: H(f) = 34 + 15 × (f − 261) / 954, 261 ≤ f ≤ 1215 (34 at 261, 49 at 1215).
 *   Mid-span 403.5 MHz on the 42/54 line is 37.5. Acceptance stays null.
 *
 * Sourced pad/EQ, GainMaker 1 GHz forward cable EQ typical insertion loss
 * (Cisco OL-31156-01 Appendix A; Scientific-Atlanta 716336 Rev D). Linear
 * interpolation in MHz, gap ratio limit 1.5, so 54 MHz uses 52–70 and 860 MHz
 * uses 750–870. Procedure is tilt, then level at the high pilot. Pads are
 * 0–20.5 dB in 0.5 dB steps; a tie takes the larger pad.
 *   Context: port plane, SC-QAM channel power, 6 MHz, 75 ohm, both markers.
 *   Installed pad 6 dB, installed EQ 9 dB.
 *   54 MHz EQ-9 loss = 8.2 + (7.9−8.2)×(54−52)/(70−52) = 8.1666... dB.
 *   860 MHz EQ-9 loss = 2.4 + (1.7−2.4)×(860−750)/(870−750) = 1.7583... dB.
 *   The closest charted tilt is EQ 4.5. Ideal pad is 6.933..., so the pick is 7.
 *   Predicted levels after that pick are 38.988... and 48.933... dBmV.
 *   This does not accept the station. AOI has no sourced plug-in list.
 */
const assert = require('node:assert/strict');

if (process.env.NIGHTSWEEP_RELEASE_TEST !== '1') {
  console.error('FAIL: NIGHTSWEEP_RELEASE_TEST=1 is required. Refusing a source-assembly pass.');
  process.exit(1);
}

const {bootApp} = require('./build2-source-harness.cjs');
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks += 1; };
const ok = (value, message) => { assert.ok(value, message); checks += 1; };

function near(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, message + ' expected ' + expected + ' got ' + actual);
  checks += 1;
}

const reading = output => ({
  output,
  outputFrequency: null,
  outputPlane: 'port',
  outputBasis: 'sc-qam',
  outputBandwidthMHz: 6,
  outputImpedanceOhms: 75
});

async function main() {
  const app = bootApp();
  try {
    const bands = app.json(`(()=>{
      const gm=catalog.devices.find(d=>d.id==='active_gm_hgd');
      const aoi=catalog.devices.find(d=>d.id==='active_aoi_hgd');
      if(!gm||!aoi) throw new Error('Frozen catalog is missing GainMaker HGD or AOI HGD.');
      return {gm:{forward:gm.publishedGain.forwardBand,reverse:gm.publishedGain.reverseBand,gain:gm.publishedGain.forward},aoi:{forward:aoi.publishedGain.forwardBand,reverse:aoi.publishedGain.reverseBand,gain:aoi.publishedGain.forward}};
    })()`);
    eq(bands.gm.forward[0], 54, 'GainMaker forward floor');
    eq(bands.gm.forward[1], 1002, 'GainMaker forward ceiling');
    eq(bands.gm.reverse[1], 42, 'GainMaker return ceiling');
    eq(bands.gm.gain, 43, 'published GainMaker screening gain stays 43 dB');
    eq(bands.aoi.forward[0], 258, 'AOI forward floor');
    eq(bands.aoi.reverse[1], 204, 'AOI return ceiling');
    eq(bands.aoi.gain, 49, 'published AOI screening gain is not the GainMaker value');
    const splits = app.json(`(()=>{
      const owner=deviceId=>StationView.targets({setup:{sourceType:'active',sourceModel:deviceId},rows:[]})[0].split;
      return {gm:owner('active_gm_hgd'),aoi:owner('active_aoi_hgd')};
    })()`);
    eq(splits.gm, '42', 'GainMaker station split is 42/54');
    eq(splits.aoi, '204', 'AOI station split is 204/258');
    ok(splits.gm !== splits.aoi, 'the two splits stay separate');

    const budget = app.json(`(()=>{
      const setup={lowF:54,highF:860,lowLevel:10,highLevel:10,launchMode:'linear',basis:'nominal',temperature:68};
      const row={id:'r1',parent:'source',length:0,cable:'p3_625',device:'active_gm_hgd',activeMode:'anchors',gainLowF:54,gainHighF:860,gainLow:31,gainHigh:31,targetLow:43,targetHigh:43,workbench:{legGain:{aux:{lowF:54,highF:860,low:20,high:20,targetLow:35,targetHigh:35,targetLowF:54,targetHighF:860,loss:1,limitLow:40,limitHigh:40,limitLowF:54,limitHighF:860}}}};
      const state={setup,rows:[row]};
      const main=HFC.gainBudget(state,catalog,{rowId:'r1',legId:'main'});
      const aux=HFC.gainBudget(state,catalog,{rowId:'r1',legId:'aux'});
      const blank=HFC.gainBudget({setup,rows:[{...row,targetLow:'',targetHigh:''}]},catalog,{rowId:'r1'});
      const company=HFC.gainBudget({setup:{...setup,companyTargetProfile:'company-42-20261113'},rows:[{...row,targetLow:'',targetHigh:''}]},catalog,{rowId:'r1'});
      const stale=HFC.gainBudget({setup,rows:[{...row,targetLowF:55,targetHighF:55}]},catalog,{rowId:'r1'});
      const zeroTarget=HFC.gainBudget({setup,rows:[{...row,targetLow:0,targetHigh:0,targetLowF:54,targetHighF:860}]},catalog,{rowId:'r1'});
      const aoiLow=HFC.gainBudget({setup,rows:[{...row,device:'active_aoi_hgd',gainLowF:258,gainHighF:1218,gainLow:20,gainHigh:20}]},catalog,{rowId:'r1'});
      const gmHigh=HFC.gainBudget({setup:{...setup,lowF:258,highF:1218,lowLevel:10,highLevel:10},rows:[{...row,gainLowF:258,gainHighF:1218,gainLow:20,gainHigh:20,targetLow:34,targetHigh:49,targetLowF:258,targetHighF:1218}]},catalog,{rowId:'r1'});
      const aoiHigh=HFC.gainBudget({setup:{...setup,lowF:258,highF:1218,lowLevel:10,highLevel:10},rows:[{...row,device:'active_aoi_hgd',gainLowF:258,gainHighF:1218,gainLow:20,gainHigh:20,targetLow:34,targetHigh:49,targetLowF:258,targetHighF:1218}]},catalog,{rowId:'r1'});
      return {main,aux,blank,company,stale,zeroTarget,aoiLow,gmHigh,aoiHigh};
    })()`);
    near(budget.main.low.input, 10, '42/54 input');
    near(budget.main.low.predictedOutput, 41, '42/54 predicted output');
    near(budget.main.low.requiredGain, 33, '42/54 required gain');
    near(budget.main.low.margin, -2, '42/54 margin');
    eq(budget.main.low.outputLimit, null, 'main limit stays blank');
    near(budget.aux.low.predictedOutput, 29, 'aux predicted output');
    near(budget.aux.low.target, 35, 'aux target is not the main target');
    near(budget.aux.low.margin, -6, 'aux margin');
    near(budget.aux.low.outputLimit, 40, 'aux limit is independent');
    near(budget.aux.low.predictedLimitMargin, 11, 'aux limit margin');
    eq(budget.main.low.target === budget.aux.low.target, false, 'leg targets are not shared');
    eq(budget.blank.low.target, null, 'blank target is not zero');
    eq(budget.blank.low.margin, null, 'blank target does not invent a margin');
    near(budget.blank.low.predictedOutput, 41, 'blank target still reports the entered-gain output');
    eq(budget.company.low.target, null, 'company node profile does not fill an amplifier target');
    ok(budget.company.warnings.some(line => /amplifier target unknown/i.test(line)), 'unknown company amplifier target is stated');
    eq(budget.stale.low.target, null, 'target recorded at another frequency is suppressed');
    eq(budget.stale.low.margin, null, 'stale target does not keep a margin');
    near(budget.zeroTarget.low.target, 0, 'an entered zero target remains zero');
    eq(budget.aoiLow.low.availableGain, null, '204/258 equipment has no gain at the 42/54 low marker');
    eq(budget.gmHigh.high.availableGain, null, 'GainMaker 1 GHz has no gain at the 1218 MHz high-split marker');
    near(budget.aoiHigh.low.availableGain, 20, 'AOI operating gain is available at 258 MHz');
    near(budget.aoiHigh.high.availableGain, 20, 'AOI operating gain is available at 1218 MHz');
    near(budget.aoiHigh.low.predictedOutput, 30, '204/258 predicted output uses its own gain');

    const context = app.json(`(()=>{
      const full={input:0,output:10,inputPlane:'port',outputPlane:'port',inputBasis:'sc-qam',outputBasis:'sc-qam',inputBandwidthMHz:6,outputBandwidthMHz:6,inputImpedanceOhms:75,outputImpedanceOhms:75};
      return {
        zero:RouteWorkbench.measuredGain(full,54,54),
        blank:RouteWorkbench.measuredGain({...full,input:''},54,54),
        blankBandwidth:RouteWorkbench.measuredGain({...full,inputBandwidthMHz:''},54,54),
        zeroBandwidth:RouteWorkbench.measuredGain({...full,inputBandwidthMHz:0,outputBandwidthMHz:0},54,54),
        plc:RouteWorkbench.measuredGain({...full,outputBasis:'ofdm-plc'},54,54),
        tpBlank:RouteWorkbench.correctedLevel(5,'tp','')
      };
    })()`);
    near(context.zero, 10, 'entered zero input is a real level');
    eq(context.blank, null, 'blank input is not a zero level');
    eq(context.blankBandwidth, null, 'blank bandwidth suppresses gain');
    eq(context.zeroBandwidth, null, 'zero bandwidth is not a usable measurement');
    eq(context.plc, null, 'SC-QAM and OFDM PLC are not compared');
    eq(context.tpBlank, null, 'blank test-point correction is not zero');

    const solved = app.json(`(()=>{
      const H=HFC,A=Alignment;
      const base=output=>({output,outputPlane:'port',outputBasis:'sc-qam',outputBandwidthMHz:6,outputImpedanceOhms:75});
      const mainRow={id:'r1',device:'active_gm_hgd',parent:'source',targetLow:39,targetHigh:49,targetLowF:54,targetHighF:860,workbench:{records:{main:{before:{low:{...base(36.4),outputFrequency:54},high:{...base(49.6),outputFrequency:860}}}},pads:{'Forward input pad':{installed:6},'Forward input EQ':{installed:9}}}};
      const auxRow={id:'r1',device:'active_gm_hgd',parent:'source',targetLow:39,targetHigh:49,targetLowF:54,targetHighF:860,workbench:{legGain:{aux:{targetLow:30,targetHigh:40,targetLowF:54,targetHighF:860}},records:{aux:{before:{low:{...base(36.4),outputFrequency:54},high:{...base(49.6),outputFrequency:860}}}},pads:{'Forward input pad':{installed:6},'Forward input EQ':{installed:9}}}};
      const state={setup:{lowF:54,highF:860},rows:[mainRow]};
      const main=RouteWorkbench.balance(H,A,state,catalog,mainRow,'before','main');
      const aux=RouteWorkbench.balance(H,A,{setup:state.setup,rows:[auxRow]},catalog,auxRow,'before','aux');
      const aoiRow={...mainRow,device:'active_aoi_hgd'};
      const aoi=RouteWorkbench.balance(H,A,{setup:state.setup,rows:[aoiRow]},catalog,aoiRow,'before','main');
      const mixed=RouteWorkbench.balance(H,A,state,catalog,{...mainRow,workbench:{...mainRow.workbench,records:{main:{before:{low:mainRow.workbench.records.main.before.low,high:{...mainRow.workbench.records.main.before.high,outputBasis:'ofdm-plc'}}}}}},'before','main');
      return {main,aux,aoi,mixed,profile:!!A.profileFor('active_gm_hgd'),aoiProfile:A.profileFor('active_aoi_hgd')};
    })()`);
    eq(solved.profile, true, 'GainMaker has a sourced pad/EQ profile');
    eq(solved.aoiProfile, null, 'AOI has no sourced plug-in pad/EQ profile');
    eq(solved.main.ok, true, 'sourced GainMaker solve runs');
    near(solved.main.targetLow, 39, 'main solve uses the main low target');
    near(solved.main.targetHigh, 49, 'main solve uses the main high target');
    eq(solved.main.catalog.eq.from, 9, 'installed EQ');
    eq(solved.main.catalog.eq.to, 4.5, 'independently derived EQ pick');
    eq(solved.main.catalog.pad.from, 6, 'installed pad');
    eq(solved.main.catalog.pad.to, 7, 'independently derived pad pick');
    near(solved.main.catalog.after.low, 38.98888888888889, 'level after the derived EQ and pad');
    near(solved.main.catalog.after.high, 48.93333333333334, 'high level after the derived EQ and pad');
    near(solved.aux.targetLow, 30, 'auxiliary solve uses the auxiliary target');
    ok(solved.aux.targetLow !== solved.main.targetLow, 'auxiliary target is not the main target');
    eq(solved.aoi.ok, false, 'AOI pad/EQ solve refuses');
    eq(solved.mixed.ok, false, 'mixed SC-QAM and OFDM PLC readings refuse a pad pick');

    const company = app.json(`(()=>{
      const low=CompanyTargets.targetAt('company-42-20261113',54);
      const mid=CompanyTargets.targetAt('company-42-20261113',403.5);
      const high=CompanyTargets.targetAt('company-42-20261113',753);
      const outside=CompanyTargets.targetAt('company-42-20261113',754);
      const hLow=CompanyTargets.targetAt('company-aoi-v15',261);
      const hHigh=CompanyTargets.targetAt('company-aoi-v15',1215);
      const wrong=CompanyTargets.compare('company-42-20261113',{split:'204',plane:'node-output',unit:'dBmV',lowMHz:54,highMHz:753,measuredLow:'',measuredHigh:40});
      const other=CompanyTargets.compare('company-aoi-v15',{split:'42',plane:'node-output',unit:'dBmV',lowMHz:261,highMHz:1215,measuredLow:34,measuredHigh:49});
      return {low,mid,high,outside,hLow,hHigh,wrong,other};
    })()`);
    near(company.low.value, 32, '42/54 company anchor');
    near(company.mid.value, 37.5, '42/54 company mid-span');
    near(company.high.value, 43, '42/54 company high anchor');
    eq(company.outside.value, null, 'company target is not extrapolated');
    near(company.hLow.value, 34, '204/258 company anchor');
    near(company.hHigh.value, 49, '204/258 company high anchor');
    eq(company.wrong.applicable, false, '42/54 company reference does not apply to a 204/258 station');
    eq(company.wrong.acceptance, null, 'unknown basis does not become acceptance');
    eq(company.wrong.measuredLow, null, 'blank company measurement is not zero');
    eq(company.other.applicable, false, '204/258 company reference does not apply to a 42/54 station');
    eq(company.other.acceptance, null, 'a split mismatch is not acceptance');
    eq(app.errors.length, 0, 'RF page reported no errors');
    console.log('Harper RF: ' + checks + ' checks');
  } finally {
    app.close();
  }
}

main().catch(error => {
  console.error('FAIL ' + (error && error.stack || error));
  process.exit(1);
});
