import test from 'node:test';
import assert from 'node:assert/strict';
import { traceRoute, validateGraph } from '../app/graph.mjs';

const job = {
  nodes: [
    { id: 'node' }, { id: 'amp' }, { id: 'tap' },
    { id: 'end1', kind: 'eol' }, { id: 'end2', kind: 'eol' },
  ],
  edges: [
    { id: 'e1', from: 'node', port: '1', to: 'amp' },
    { id: 'e2', from: 'node', port: '2', to: 'end2' },
    { id: 'e3', from: 'amp', port: 'main', to: 'tap' },
    { id: 'e4', from: 'tap', port: 'main', to: 'end1' },
  ],
};

test('all trace follows only the chosen physical start port', () => {
  assert.deepEqual(traceRoute(job, { startId: 'node', port: '1', mode: 'all' }), {
    nodeIds: ['node', 'amp', 'tap', 'end1'], edgeIds: ['e1', 'e3', 'e4'], issues: [],
  });
});

test('destination trace keeps union of paths to selected reachable destinations', () => {
  assert.deepEqual(traceRoute(job, { startId: 'node', port: '1', mode: 'destinations', destinations: ['amp', 'end1', 'end2'] }), {
    nodeIds: ['node', 'amp', 'tap', 'end1'], edgeIds: ['e1', 'e3', 'e4'], issues: [],
  });
});

test('graph validation detects loops, multiple feeds, and islands', () => {
  const broken = { nodes: [...job.nodes, { id: 'island' }], edges: [...job.edges,
    { id: 'e5', from: 'end1', port: 'main', to: 'amp' },
    { id: 'e6', from: 'end2', port: 'main', to: 'tap' },
  ] };
  const issues = validateGraph(broken).join(' | ');
  assert.match(issues, /cycle/i);
  assert.match(issues, /multiple.*feed/i);
  assert.match(issues, /disconnected/i);
});

test('edge leaving a known model must name an actual physical output port', () => {
  const invalid = { nodes: [{ id: 'node', modelId: 'gs7k' }, { id: 'end', modelId: 'eol' }],
    edges: [{ id: 'e', from: 'node', port: '5', to: 'end' }] };
  assert.match(validateGraph(invalid).join(' | '), /port/i);
});
