// Map leg letters are visual labels. Physical output ports are assigned separately.
export const NODE_LEGS = Object.freeze([
  Object.freeze({id: 'A', position: 'upper-left'}),
  Object.freeze({id: 'B', position: 'upper-right'}),
  Object.freeze({id: 'C', position: 'lower-left'}),
  Object.freeze({id: 'D', position: 'lower-right'})
]);

export function validateLegPorts(bindings, physicalPorts) {
  const result = {};
  const used = new Set();
  const allowed = new Set(physicalPorts.map(String));
  for (const [leg, value] of Object.entries(bindings || {})) {
    if (!NODE_LEGS.some(item => item.id === leg)) throw new Error(`Unknown map leg ${leg}`);
    const port = String(value);
    if (!allowed.has(port)) throw new Error(`Unknown physical port ${port}`);
    if (used.has(port)) throw new Error('Each leg must use a different physical port');
    used.add(port);
    result[leg] = port;
  }
  return result;
}

export function portLabel(node, port) {
  const physical = String(port);
  if (node?.kind !== 'node') return physical.toUpperCase();
  const match = NODE_LEGS.find(({id}) => String(node.settings?.mapLegPorts?.[id] ?? '') === physical);
  return match ? `Leg ${match.id} · physical port ${physical}` : `Physical port ${physical}`;
}

export function nodeLegDiagram() {
  return `<svg viewBox="0 0 240 190" role="img" aria-label="Node map symbol: leg A upper left, leg B upper right, leg C lower left, leg D lower right" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="currentColor" stroke-width="3">
    <path d="M70 50H30M170 50h40M70 140H30M170 140h40"/>
    <rect x="70" y="20" width="100" height="150"/>
    <circle cx="120" cy="65" r="32"/>
    <path d="M94 120h52l-26 32z"/>
  </g>
  <path fill="currentColor" d="M98 65l17-13v26zM142 65l-17-13v26z"/>
  <g fill="currentColor" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">
    <text x="20" y="55">A</text><text x="220" y="55">B</text>
    <text x="20" y="145">C</text><text x="220" y="145">D</text>
  </g></svg>`;
}
