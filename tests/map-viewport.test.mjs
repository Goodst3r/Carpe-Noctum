import test from 'node:test';
import assert from 'node:assert/strict';
import {zoomAt, fitBounds, normalizedPoint} from '../app/map-viewport.mjs';

test('zoom keeps the map point under the focal point', () => {
  const before = {x: 40, y: -20, scale: 2};
  const after = zoomAt(before, 3, {x: 150, y: 100});
  assert.equal((150 - after.x) / after.scale, (150 - before.x) / before.scale);
  assert.equal((100 - after.y) / after.scale, (100 - before.y) / before.scale);
});

test('fit bounds centers a route and handles a single point', () => {
  const view = {width: 800, height: 600};
  const map = {width: 1000, height: 500};
  const result = fitBounds(view, map, [{x: .25, y: .25}, {x: .75, y: .75}], 50);
  assert.equal(result.scale, 1.4);
  assert.equal(result.x, -300);
  assert.equal(result.y, -50);
  const single = fitBounds(view, map, [{x: .5, y: .5}], 50);
  assert.ok(Number.isFinite(single.scale));
  assert.equal(single.x + 500 * single.scale, 400);
  assert.equal(single.y + 250 * single.scale, 300);
});

test('normalized point inverts viewport and clamps to page', () => {
  assert.deepEqual(normalizedPoint({x: 250, y: 100}, {x: 50, y: 0, scale: 2}, {width: 200, height: 100}), {x: .5, y: .5});
  assert.deepEqual(normalizedPoint({x: -20, y: 500}, {x: 0, y: 0, scale: 1}, {width: 200, height: 100}), {x: 0, y: 1});
});

test('pointer pinch can transition to one finger without a jump and suppresses drag click', async () => {
  const {JSDOM} = await import('jsdom');
  const {mountMapViewport} = await import('../app/map-viewport.mjs');
  const dom = new JSDOM('<div id="view"><div class="map-surface"></div></div>');
  const view = dom.window.document.querySelector('#view');
  const surface = view.firstElementChild;
  Object.defineProperties(view, {clientWidth: {value: 800}, clientHeight: {value: 600}});
  Object.defineProperties(surface, {offsetWidth: {value: 800}, offsetHeight: {value: 600}});
  view.getBoundingClientRect = () => ({left: 0, top: 0});
  let clicks = 0;
  view.addEventListener('click', () => clicks++);
  const viewport = mountMapViewport(view, {initialState: {x: 10, y: 20, scale: 1}});
  const pointer = (type, id, x, y) => {
    const event = new dom.window.MouseEvent(type, {bubbles: true, clientX: x, clientY: y, button: 0});
    Object.defineProperty(event, 'pointerId', {value: id});
    view.dispatchEvent(event);
  };
  pointer('pointerdown', 1, 100, 100);
  pointer('pointerdown', 2, 200, 100);
  pointer('pointermove', 2, 300, 100);
  const pinched = viewport.getState();
  assert.equal(pinched.scale, 2);
  pointer('pointerup', 2, 300, 100);
  pointer('pointermove', 1, 110, 110);
  assert.deepEqual(viewport.getState(), {...pinched, x: pinched.x + 10, y: pinched.y + 10});
  pointer('pointerup', 1, 110, 110);
  view.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}));
  assert.equal(clicks, 0);
  assert.equal(viewport.setState({x: NaN, y: 0, scale: 1}), false);
  assert.equal(viewport.setState({x: 1, y: 2, scale: 100}), true);
  assert.deepEqual(viewport.getState(), {x: 1, y: 2, scale: 8});
  viewport.destroy();
});

test('editing disables single finger pan but allows pinch', async () => {
  const {JSDOM} = await import('jsdom');
  const {mountMapViewport} = await import('../app/map-viewport.mjs');
  const dom = new JSDOM('<div><div class="map-surface"></div></div>');
  const view = dom.window.document.body.firstElementChild;
  Object.defineProperties(view, {clientWidth: {value: 500}, clientHeight: {value: 500}});
  Object.defineProperties(view.firstElementChild, {offsetWidth: {value: 500}, offsetHeight: {value: 500}});
  view.getBoundingClientRect = () => ({left: 0, top: 0});
  const captures = [];
  view.setPointerCapture = id => captures.push(id);
  const viewport = mountMapViewport(view, {isEditing: () => true});
  const pointer = (type, id, x) => {
    const event = new dom.window.MouseEvent(type, {bubbles: true, clientX: x, button: 0});
    Object.defineProperty(event, 'pointerId', {value: id});
    view.dispatchEvent(event);
  };
  pointer('pointerdown', 1, 100); pointer('pointermove', 1, 150);
  assert.deepEqual(captures, []);
  assert.deepEqual(viewport.getState(), {x: 0, y: 0, scale: 1});
  pointer('pointerdown', 2, 250); pointer('pointermove', 2, 350);
  assert.equal(viewport.getState().scale, 2);
  viewport.destroy();
});
