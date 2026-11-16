import test from 'node:test';
import assert from 'node:assert/strict';
import {clusterMarkers} from '../app/map-display.mjs';
import {fitBounds,zoomAt} from '../app/map-viewport.mjs';
test('overlapping touch targets form a selectable cluster and separate on zoom',()=>{
 const nodes=[{id:'a',map:{x:.5,y:.5}},{id:'b',map:{x:.51,y:.5}}];
 assert.equal(clusterMarkers(nodes,{x:0,y:0,scale:1},{width:1000,height:1000})[0].nodes.length,2);
 assert.equal(clusterMarkers(nodes,{x:0,y:0,scale:8},{width:1000,height:1000}).length,2);
});
test('selected bounds fit actual geometry and zoom remains focal up to 32',()=>{
 const v=fitBounds({width:800,height:600},{width:1000,height:1000},[{x:.5,y:.5},{x:.51,y:.51}]);
 assert.ok(v.scale>4); const z=zoomAt({x:10,y:20,scale:1},32,{x:100,y:100}); assert.equal(z.scale,32); assert.equal((100-z.x)/z.scale,90);
});

test('chooser is clamped inside bottom-right viewport and scrolls within it',async()=>{
 const {chooserPlacement}=await import('../app/map-display.mjs');
 const p=chooserPlacement({x:290,y:290},{width:300,height:300},10);
 assert.ok(p.left>=0 && p.left+p.width<=300);assert.ok(p.top>=0 && p.top+p.maxHeight<=300);
 assert.ok(p.top<290);assert.ok(p.maxHeight>=44);
});

test('very small CAD symbol bounds can be inspected without giant touch markers',()=>{const fitted=fitBounds({width:360,height:415},{width:360,height:233},[{x:.5,y:.5},{x:.501,y:.502}]);assert.ok(fitted.scale>=64);assert.ok(fitted.scale<=128);});
test('manual placement retains same-page annotation identity but discards stale equipment bounds',async()=>{const {relocateMapStation}=await import('../app/map-display.mjs');const node={map:{page:1,x:.2,y:.3,annotationId:'12R',labelBounds:{x:.2,y:.3,width:.01,height:.01},symbolBounds:{x:.1,y:.1,width:.1,height:.1},symbolId:'original',attachmentPoints:[{x:.1,y:.2}]}};const moved=relocateMapStation(node,{page:1,x:.7,y:.8});assert.equal(moved.annotationId,'12R');assert.deepEqual(moved.labelBounds,node.map.labelBounds);assert.equal(moved.symbolBounds,null);assert.deepEqual(moved.attachmentPoints,[]);assert.equal(moved.manualPosition,true);assert.equal(node.map.x,.2);const other=relocateMapStation(node,{page:2,x:.4,y:.5});assert.equal(other.annotationId,undefined);});
