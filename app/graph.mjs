import {portInfo} from './ports.mjs';
import { EQUIPMENT } from './catalog.mjs';

// Edges name the physical output port at their upstream node.
export function validateGraph(job) {
  const nodes = Array.isArray(job?.nodes) ? job.nodes : [];
  const edges = Array.isArray(job?.edges) ? job.edges : [];
  const ids = new Set(nodes.map(node => node.id));
  const byId = new Map(nodes.map(node => [node.id, node]));
  const issues = [];
  if (ids.size !== nodes.length) issues.push('Duplicate node ID');
  const edgeIds = new Set();
  const feeds = new Map();
  const outgoing = new Map(nodes.map(node => [node.id, []]));
  for (const edge of edges) {
    if (!edge?.id || edgeIds.has(edge.id)) issues.push(`Duplicate or missing edge ID ${edge?.id ?? ''}`);
    edgeIds.add(edge?.id);
    if (!ids.has(edge?.from) || !ids.has(edge?.to)) {
      issues.push(`Edge ${edge?.id ?? ''} references a missing node`);
      continue;
    }
    if (!edge.port) issues.push(`Edge ${edge.id} has no physical port`);
    else {
      const source=byId.get(edge.from),info=portInfo(source);
      if(EQUIPMENT[source?.modelId]&&!info.known.includes(edge.port))issues.push(`Edge ${edge.id} uses unsupported physical port ${edge.port}`);
      else if(info.unverified.includes(edge.port))issues.push(`Physical port ${edge.port} requires installed-hardware verification on ${edge.from}.`);
    }
    outgoing.get(edge.from).push(edge);
    feeds.set(edge.to, (feeds.get(edge.to) ?? 0) + 1);
  }
  for (const [id, count] of feeds) if (count > 1) issues.push(`Node ${id} has multiple upstream feeds`);
  const visiting = new Set(), visited = new Set();
  function checkCycle(id) {
    if (visiting.has(id)) { issues.push(`Cycle includes node ${id}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const edge of outgoing.get(id) ?? []) checkCycle(edge.to);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) checkCycle(id);
  const root = ids.has('node') ? 'node' : nodes.find(node => !feeds.has(node.id))?.id;
  if (root) {
    const reachable = new Set([root]), queue = [root];
    for (let i = 0; i < queue.length; i++) {
      for (const edge of outgoing.get(queue[i]) ?? []) {
        if (!reachable.has(edge.to)) { reachable.add(edge.to); queue.push(edge.to); }
      }
    }
    for (const id of ids) if (!reachable.has(id)) issues.push(`Node ${id} is disconnected from source ${root}`);
  } else if (ids.size) issues.push('Graph has no source; nodes are disconnected');
  return [...new Set(issues)];
}

export function traceRoute(job, { startId, port, mode = 'all', destinations = [] } = {}) {
  const ids = new Set((job?.nodes ?? []).map(node => node.id));
  if (!ids.has(startId)) return { nodeIds: [], edgeIds: [], issues: [`Unknown start node ${startId ?? ''}`] };
  if(portInfo(job.nodes.find(n=>n.id===startId)).unverified.includes(port))return {nodeIds:[startId],edgeIds:[],issues:[`Physical port ${port} requires installed-hardware verification.`]};
  if (!port) return { nodeIds: [startId], edgeIds: [], issues: ['Select a physical start port'] };
  if (!['all', 'destinations'].includes(mode)) throw new Error(`Unknown trace mode ${mode}`);
  const outgoing = new Map([...ids].map(id => [id, []]));
  for (const edge of job.edges ?? []) if (ids.has(edge.from) && ids.has(edge.to)) outgoing.get(edge.from).push(edge);
  const includedNodes = new Set([startId]), includedEdges = new Set();
  const wanted = new Set(destinations);
  function visit(id, stack) {
    if (stack.has(id)) return false;
    const nextStack = new Set(stack).add(id);
    let keep = mode === 'all' || wanted.has(id);
    for (const edge of outgoing.get(id) ?? []) {
      if (id === startId && edge.port !== port) continue;
      if (visit(edge.to, nextStack)) {
        includedEdges.add(edge.id);
        includedNodes.add(edge.to);
        keep = true;
      }
    }
    return keep;
  }
  visit(startId, new Set());
  // Preserve source-first traversal order, independent of DFS unwinding.
  const nodeIds = [startId], edgeIds = [], seen = new Set([startId]);
  function ordered(id) {
    for (const edge of outgoing.get(id) ?? []) {
      if (includedEdges.has(edge.id) && !edgeIds.includes(edge.id)) {
        edgeIds.push(edge.id);
        if (!seen.has(edge.to)) { seen.add(edge.to); nodeIds.push(edge.to); ordered(edge.to); }
      }
    }
  }
  ordered(startId);
  return { nodeIds, edgeIds, issues: validateGraph(job) };
}
