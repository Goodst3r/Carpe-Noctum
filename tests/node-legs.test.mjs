import test from 'node:test';
import assert from 'node:assert/strict';
import {NODE_LEGS,validateLegPorts,portLabel} from '../app/node-legs.mjs';
test('four node map legs follow the supplied top and bottom convention',()=>{assert.deepEqual(NODE_LEGS.map(x=>[x.id,x.position]),[['A','upper-left'],['B','upper-right'],['C','lower-left'],['D','lower-right']]);});
test('node map letters bind only explicitly confirmed physical ports',()=>{assert.deepEqual(validateLegPorts({},['1','2','3','4']),{});assert.deepEqual(validateLegPorts({A:'4',D:'2'},['1','2','3','4']),{A:'4',D:'2'});assert.throws(()=>validateLegPorts({A:'4',B:'4'},['1','2','3','4']),/different/);assert.throws(()=>validateLegPorts({A:'8'},['1','2','3','4']),/physical/);assert.throws(()=>validateLegPorts({E:'1'},['1','2','3','4']),/leg/);assert.equal(portLabel({kind:'node',settings:{mapLegPorts:{A:'4'}}},'4'),'Leg A · physical port 4');assert.equal(portLabel({kind:'node',settings:{}},'1'),'Physical port 1');});
