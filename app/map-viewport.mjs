// Coordinates are in untransformed surface pixels; scale is relative to its layout size.
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));

export function zoomAt(state, scale, focal) {
  scale = clamp(scale, MIN_SCALE, MAX_SCALE);
  const ratio = scale / state.scale;
  return {scale, x: focal.x - (focal.x - state.x) * ratio, y: focal.y - (focal.y - state.y) * ratio};
}

export function fitBounds(view, map, points = [], padding = 24) {
  const valid = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  const xs = valid.length ? valid.map(p => clamp(p.x, 0, 1)) : [0, 1];
  const ys = valid.length ? valid.map(p => clamp(p.y, 0, 1)) : [0, 1];
  const left = Math.min(...xs) * map.width, right = Math.max(...xs) * map.width;
  const top = Math.min(...ys) * map.height, bottom = Math.max(...ys) * map.height;
  // A small route should remain useful, rather than zooming infinitely into one point.
  const width = Math.max(right - left, map.width * 0.1, 1);
  const height = Math.max(bottom - top, map.height * 0.1, 1);
  const scale = clamp(Math.min(Math.max(1, view.width - 2 * padding) / width,
    Math.max(1, view.height - 2 * padding) / height), MIN_SCALE, valid.length ? 4 : MAX_SCALE);
  return {scale, x: view.width / 2 - (left + right) / 2 * scale,
    y: view.height / 2 - (top + bottom) / 2 * scale};
}

export function normalizedPoint(point, state, map) {
  return {x: clamp((point.x - state.x) / state.scale / map.width, 0, 1),
    y: clamp((point.y - state.y) / state.scale / map.height, 0, 1)};
}

export function mountMapViewport(element, {onChange = () => {}, initialState, isEditing = () => false} = {}) {
  const surface = element.querySelector('.map-surface');
  if (!surface) throw new Error('Map viewport requires a .map-surface');
  const originalElementStyle = element.getAttribute('style');
  const originalSurfaceStyle = surface.getAttribute('style');
  element.style.overflow = 'hidden';
  element.style.touchAction = 'none';
  surface.style.width = '100%';
  surface.style.minWidth = '0';
  surface.style.transformOrigin = '0 0';
  surface.style.willChange = 'transform';
  let state = {x: 0, y: 0, scale: 1};
  const pointers = new Map();
  let gesture = null, moved = false, suppressClick = false;
  const size = () => ({width: surface.offsetWidth || 1, height: surface.offsetHeight || 1});
  const view = () => ({width: element.clientWidth || 1, height: element.clientHeight || 1});
  const local = e => { const r = element.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
  function apply(next) {
    state = next;
    surface.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    onChange({...state});
  }
  function fitMap() { apply(fitBounds(view(), size(), [], 0)); }
  function fitRoute(points) { apply(fitBounds(view(), size(), points)); }
  function zoom(factor, point = {x: view().width / 2, y: view().height / 2}) { apply(zoomAt(state, state.scale * factor, point)); }
  function beginGesture() {
    const p = [...pointers.values()];
    if (p.length === 1) gesture = {state: {...state}, point: p[0]};
    else if (p.length >= 2) {
      const center = {x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2};
      gesture = {state: {...state}, center, distance: Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y) || 1};
    } else gesture = null;
  }
  function down(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('button, input, select, textarea, a, [data-drag-marker]')) return;
    pointers.set(e.pointerId, local(e));
    if (pointers.size === 1) { moved = false; suppressClick = false; }
    const editing = typeof isEditing === 'function' ? isEditing() : isEditing;
    if (!editing) element.setPointerCapture?.(e.pointerId);
    else if (pointers.size === 2) {
      for (const id of pointers.keys()) element.setPointerCapture?.(id);
    }
    beginGesture();
  }
  function move(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, local(e));
    const p = [...pointers.values()];
    if (p.length === 1) {
      if (typeof isEditing === 'function' ? isEditing() : isEditing) return;
      const dx = p[0].x - gesture.point.x, dy = p[0].y - gesture.point.y;
      if (Math.hypot(dx, dy) > 3) moved = true;
      apply({...gesture.state, x: gesture.state.x + dx, y: gesture.state.y + dy});
    } else {
      const center = {x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2};
      const distance = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
      const next = zoomAt(gesture.state, gesture.state.scale * distance / gesture.distance, gesture.center);
      next.x += center.x - gesture.center.x; next.y += center.y - gesture.center.y;
      moved = true; apply(next);
    }
  }
  function up(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (!pointers.size && moved && e.type === 'pointerup') suppressClick = true;
    beginGesture();
  }
  function click(e) { if (suppressClick) { suppressClick = false; e.preventDefault(); e.stopImmediatePropagation(); } }
  function wheel(e) { e.preventDefault(); zoom(Math.exp(-e.deltaY * 0.002), local(e)); }
  element.addEventListener('pointerdown', down);
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', up);
  element.addEventListener('pointercancel', up);
  element.addEventListener('click', click, true);
  element.addEventListener('wheel', wheel, {passive: false});
  function setState(next) {
    if (!next || !Number.isFinite(next.x) || !Number.isFinite(next.y) || !Number.isFinite(next.scale) || next.scale <= 0) return false;
    apply({...next, scale: clamp(next.scale, MIN_SCALE, MAX_SCALE)});
    return true;
  }
  if (!setState(initialState)) fitMap();
  return {
    zoomIn: () => zoom(1.25), zoomOut: () => zoom(1 / 1.25), fitMap, fitRoute, reset: fitMap, setState,
    getState: () => ({...state}),
    toNormalized: (clientX, clientY) => normalizedPoint(local({clientX, clientY}), state, size()),
    destroy() {
      element.removeEventListener('pointerdown', down); element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up); element.removeEventListener('pointercancel', up);
      element.removeEventListener('click', click, true); element.removeEventListener('wheel', wheel);
      if (originalElementStyle === null) element.removeAttribute('style'); else element.setAttribute('style', originalElementStyle);
      if (originalSurfaceStyle === null) surface.removeAttribute('style'); else surface.setAttribute('style', originalSurfaceStyle);
    }
  };
}
