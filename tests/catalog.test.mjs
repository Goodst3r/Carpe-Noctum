import test from 'node:test';
import assert from 'node:assert/strict';
import {EQUIPMENT,CABLES,PARTS,lookupPartLoss} from '../app/catalog.mjs';
test('sourced HGD split variants and independent LE modes exist',()=>{assert.deepEqual(EQUIPMENT['gm-hgd-40'].band,[52,1002]);assert.deepEqual(EQUIPMENT['gm-hgd-42'].band,[54,1002]);for(const m of ['manual','thermal','agc'])assert.ok(EQUIPMENT['gm-le-'+m]);assert.equal(CABLES.p3_500.points.find(x=>x[0]===750)[1],2.16);});
test('EQ loss uses actual insertion table rather than nominal number',()=>{assert.equal(lookupPartLoss('forward-cable-1g/12',52).value,10.6);assert.equal(lookupPartLoss('forward-cable-1g/12',1002).value,1);assert.equal(lookupPartLoss('forward-cable-1g/12',57).status,'estimated');});
test('unknown jumper insertion is null and reverse204 interior is unknown',()=>{assert.equal(lookupPartLoss('forward-cable-1g/0',750).value,null);assert.equal(lookupPartLoss('standard-return-204/6',100).value,null);});
test('inverse parts remain referenced without fabricated loss curves',()=>{assert.equal(PARTS['forward-inverse-1g/3.3'].partNumber,'GM-EQINV-3.3-1G=');assert.equal(lookupPartLoss('forward-inverse-1g/3.3',753).value,null);});
test('all five documented LE splits use actual bandwidth filters',()=>{for(const [split,floor] of [[40,52],[55,70],[65,86],[85,102]])for(const mode of ['manual','thermal','agc'])assert.deepEqual(EQUIPMENT[`gm-le-${mode}-${split}`].band,[floor,1002]);});
test('manual reverse55 and65 table points are exact sourced facts',()=>{assert.equal(lookupPartLoss('standard-return-55/12',5).value,9.5);assert.equal(lookupPartLoss('standard-return-65/12',5).value,9.8);assert.equal(lookupPartLoss('standard-return-65/12',60).value,1.5);});
test('870MHz EQ and85MHz reverse parts stay distinct from1GHz/42MHz families',()=>{assert.equal(lookupPartLoss('forward-cable-870/12',52).value,10.4);assert.equal(lookupPartLoss('forward-cable-870/12',1002).value,null);assert.equal(PARTS['standard-return-85/12'].partNumber,'GM-EQREV-12-85M=');assert.equal(lookupPartLoss('standard-return-85/12',85).value,null);});
test('manufacturer-specific Digicomm cable/linear/inverse curves are separate and anomaly is quarantined',()=>{assert.equal(lookupPartLoss('digicomm-cable-1p2g/12',750).value,3.8);assert.equal(lookupPartLoss('digicomm-linear-1p2g/12',750).value,5.7);assert.equal(lookupPartLoss('digicomm-inverse-1p2g/12',750).value,7.9);assert.equal(lookupPartLoss('digicomm-cable-1p2g/16.5',1218).value,null);assert.equal(PARTS['digicomm-cable-1p2g/16.5'].solverCandidate,false);assert.equal(lookupPartLoss('digicomm-cable-1p2g/0',750).value,0);});
test('Scientific Atlanta Surge-Gap 712968 and 712969 retain sourced 750MHz maxima without inventing curves',()=>{
 const a=EQUIPMENT['scientific-atlanta-surge-gap-1ghz--sa-surge-gap-712968'];
 const b=EQUIPMENT['scientific-atlanta-surge-gap-1ghz--sa-surge-gap-712969'];
 assert.deepEqual(a.band,[750,750]);assert.deepEqual(b.band,[750,750]);
 assert.deepEqual(a.losses.main.points,[[750,2.2]]);assert.deepEqual(a.losses.branch.points,[[750,9.3]]);
 assert.deepEqual(b.losses.main.points,[[750,1.5]]);assert.deepEqual(b.losses.branch.points,[[750,13.2]]);
 assert.equal(a.losses.main.basis,'Maximum');assert.equal(a.losses.main.source,EQUIPMENT['scientific-atlanta-surge-gap-1ghz--sa-surge-gap-712969'].source);
 assert.notEqual(a.losses.main.points.find(x=>x[0]===750)[1],EQUIPMENT['cisco-surge-gap-1-25ghz--sg-passives-dc-08'].losses.main.points.find(x=>x[0]===750)[1]);
});
test('Scientific Atlanta 712971 exposes only its sourced 750MHz maximum-loss point',()=>{
 const m=EQUIPMENT['scientific-atlanta-surge-gap-1ghz--sa-surge-gap-712971'];
 assert.deepEqual(m.band,[750,750]);assert.equal(m.losses['each-output'].basis,'Maximum');
 assert.equal(m.losses['each-output'].min,750);assert.equal(m.losses['each-output'].max,750);
 assert.deepEqual(m.losses['each-output'].points,[[750,4.5]]);assert.equal(m.losses['each-output'].source,m.source);
});
