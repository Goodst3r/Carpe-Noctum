// Cluster intersecting 44px touch targets in screen coordinates, including transitive overlaps.
export function clusterMarkers(nodes, state, map) {
  const points=nodes.filter(n=>Number.isFinite(n.map?.x)&&Number.isFinite(n.map?.y)).map(n=>({node:n,x:state.x+n.map.x*map.width*state.scale,y:state.y+n.map.y*map.height*state.scale}));
  const groups=[];
  while(points.length) {
    const members=[points.pop()];
    for(let i=0;i<members.length;i++) for(let j=points.length-1;j>=0;j--) {
      if(Math.abs(points[j].x-members[i].x)<44 && Math.abs(points[j].y-members[i].y)<44) members.push(points.splice(j,1)[0]);
    }
    groups.push({x:members.reduce((s,p)=>s+p.x,0)/members.length,y:members.reduce((s,p)=>s+p.y,0)/members.length,nodes:members.map(p=>p.node)});
  }
  return groups;
}

// The chooser is positioned in viewport CSS pixels, then made relative to its marker.
export function chooserPlacement(point, view, count) {
  const width=Math.min(180,Math.max(0,view.width));
  const maxHeight=Math.min(180,Math.max(0,view.height),Math.max(44,count*44));
  const left=Math.max(0,Math.min(view.width-width,point.x-22));
  const below=point.y+22, above=point.y-22-maxHeight;
  const top=below+maxHeight<=view.height?below:Math.max(0,Math.min(view.height-maxHeight,above));
  return {left,top,width,maxHeight};
}

/** Manual coordinates may move the symbol without losing its original A# annotation. */
export function relocateMapStation(node,{page,x,y}) {
 if(!Number.isInteger(page)||page<1||![x,y].every(v=>Number.isFinite(v)&&v>=0&&v<=1))throw new Error('Invalid map placement.');
 const prior=node.map?.page===page?node.map:{};
 return {...prior,page,x,y,confirmed:true,manualPosition:true,symbolBounds:null,equipmentBounds:null,attachmentPoints:[]};
}
