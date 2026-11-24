// Navigation and visible decks share this geometry. Units are world metres.
export const ORB_RADIUS=.65;
export const UNDERPASS_WIDTH=6.55;
export const FLOAT_HEIGHT=1.45;
export const toWorld=([x,z])=>[(x-603)*.14,(z-317)*.14];
const links=[
 [[581.5,181],[623.5,224.5],0,8],
 [[568,237],[524,281],1,5],
 [[680.5,237],[639,282],1,7],
 [[739,336.5],[695.5,295.5],2,8],
 [[682,352.5],[638,395.5],2,4],
 [[624,452.5],[581.5,410],3,6],
 [[525,395],[568,353],4,7],
 [[467.5,296],[510.5,338.5],5,6],
 [[581.5,294],[624,339],0,3]
];
const connectorEdges=[
 [[595,167],[568,195],[610,238],[637,211]],
 [[582,251],[554,223],[510,267],[538,295]],
 [[694,251],[667,223],[625,268],[653,296]],
 [[725,350],[753,323],[709,282],[682,309]],
 [[696,366],[668,339],[624,382],[652,409]],
 [[610,466],[638,439],[595,396],[568,424]],
 [[511,381],[539,409],[582,367],[554,339]],
 [[481,282],[454,310],[497,352],[524,325]],
 [[595,280],[568,308],[610,353],[638,325]]
];
// Distances to each original SVG overpass edge, measured along its lower route.
const overpassEdges=[[2.76454738,2.74753257],[2.81599646,2.67286363],[2.59983495,2.74875316],[2.892841,2.56651701],[2.67304019,2.82647873],[2.70609433,2.72740544],[2.77182236,2.6235477],[2.94068814,2.58176006],[2.59967786,2.94630158]];
export const crossings=links.map(([sa,sb,a,b],id)=>{
 const pa=toWorld(sa),pb=toWorld(sb),length=Math.hypot(pb[0]-pa[0],pb[1]-pa[1]);
 return {id,a,b,overpassEdges:overpassEdges[id],outline:connectorEdges[id].map(toWorld),x:(pa[0]+pb[0])/2,z:(pa[1]+pb[1])/2,dx:(pb[0]-pa[0])/length,dz:(pb[1]-pa[1])/length,half:length/2+4,width:5.15};
});
export function coordinates(c,x,z){const px=x-c.x,pz=z-c.z;return {along:px*c.dx+pz*c.dz,across:-px*c.dz+pz*c.dx}}
// Logo gaps are always the lower route; uninterrupted SVG ribbons pass above.
export const reversedCrossing=c=>false;
export const STAIR_RISE=.4,STAIR_RUN=.5,STAIR_COUNT=10;
export const STEP_BASE=-3.65,STEP_TOP=.35;
export const stepHeight=h=>Math.min(STEP_TOP,STEP_BASE+Math.ceil((h-STEP_BASE-1e-7)/STAIR_RISE)*STAIR_RISE);
export const STAIR_CLEARANCE=.65;
export const stairStart=(c,sign)=>c.overpassEdges?c.overpassEdges[sign<0?0:1]+STAIR_CLEARANCE:c.half-5;
export function lowerProfile(c,d){const u=Math.max(0,Math.min(1,(Math.abs(d)-stairStart(c,d))/(STAIR_RUN*STAIR_COUNT)));return -3.65+STAIR_RISE*STAIR_COUNT*u}
export function tunnelHeight(c,x,z){return lowerProfile(c,coordinates(c,x,z).along)}
export function ribbonHeight(id,x,z){let h=.35;for(const c of crossings){
 if(c.a!==id&&c.b!==id)continue;
 const p=coordinates(c,x,z);
 if(Math.abs(p.along)>=c.half-4-.5&&Math.abs(p.along)<=stairStart(c,p.along)+STAIR_RUN*STAIR_COUNT&&Math.abs(p.across)<=c.width/2+1)h=Math.min(h,tunnelHeight(c,x,z));
 }
 return h}
export function inPolygon(x,z,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
export function templeFloorHeight(t,x,z){
 if(Math.abs(t.x)<20)return .7;
 const sign=Math.sign(t.x),dx=-sign/Math.SQRT2,dz=sign/Math.SQRT2,half=2.625;
 const toward=(x-t.x)*dx+(z-t.z)*dz;
 return Math.max(STEP_TOP-STAIR_RISE,Math.min(STEP_TOP,STEP_TOP-(STAIR_RISE/STAIR_RUN)*(toward-(half-STAIR_RUN))));
}
export function createNavigation(polygons,temples){
 const obstacles=[];
 const edgeProbes=Array.from({length:64},(_,i)=>[Math.cos(i*Math.PI/32)*ORB_RADIUS,Math.sin(i*Math.PI/32)*ORB_RADIUS]);
 // A point only needs exact containment tests for outlines touching its grid cell.
 const cells=new Map(),cellSize=6;
 function indexOutline(points,id,crossing){
  if(!points.length)return;
  const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);
  const entry={points,id,crossing};
  for(let i=Math.floor(Math.min(...xs)/cellSize);i<=Math.floor(Math.max(...xs)/cellSize);i++){
   if(!cells.has(i))cells.set(i,new Map());
   const column=cells.get(i);
   for(let j=Math.floor(Math.min(...zs)/cellSize);j<=Math.floor(Math.max(...zs)/cellSize);j++){
    if(!column.has(j))column.set(j,[]);
    column.get(j).push(entry);
   }
  }
 }
 polygons.forEach((p,id)=>indexOutline(p,id,null));
 crossings.forEach(c=>indexOutline(c.outline,100+c.id,c));
 const empty=[];
 function surfaces(x,z){const hs=[];
  const nearby=cells.get(Math.floor(x/cellSize))?.get(Math.floor(z/cellSize))||empty;
  for(const {points,id,crossing} of nearby){
   if(!inPolygon(x,z,points))continue;
   const h=crossing?tunnelHeight(crossing,x,z):id<2?.15:ribbonHeight(id-2,x,z);
   hs.push(api.heightTransform?api.heightTransform(x,z,h,id):h);
  }
  // The polar approaches supply a floor only in open space. Where an actual
  // deck exists, keep its height through the descent and under the bridge.
  if(!hs.length && ((x/11)**2+((z+31)/9)**2<=1||(x/11)**2+((z-31)/9)**2<=1))hs.push(.15);
  for(const t of temples)if(Math.abs(x-t.x)+Math.abs(z-t.z)<=(Math.abs(t.x)>20?6.25:5.05)/Math.SQRT2)hs.push(templeFloorHeight(t,x,z));
  return hs;
 }
 function sample(x,z,fromHeight){let hs=surfaces(x,z);hs.sort((a,b)=>Math.abs(a-fromHeight)-Math.abs(b-fromHeight));const entry=temples.some(t=>Math.abs(t.x)>20&&Math.hypot(x-t.x,z-t.z)<4.8);return hs.find(h=>Math.abs(h-fromHeight)<(entry?FLOAT_HEIGHT+ORB_RADIUS+STAIR_RISE:.7))}
 function valid(x,z,fromHeight){const h=sample(x,z,fromHeight);if(h===undefined)return null;
  // Require support around the whole orb, not just its centre.
  for(const [dx,dz] of edgeProbes){if(sample(x+dx,z+dz,h)===undefined)return null}
  const y=h+FLOAT_HEIGHT;
  if(api.treeCollisions?.occupiedBranches(x,y,z,ORB_RADIUS+.015))return null;
  for(const o of obstacles){if(y+ORB_RADIUS<=o.bottom||y-ORB_RADIUS>=o.top)continue;
   const dx=x-o.x,dz=z-o.z;
   if(o.kind==='box'){const ca=Math.cos(o.angle||0),sa=Math.sin(o.angle||0),lx=dx*ca+dz*sa,lz=-dx*sa+dz*ca;const qx=Math.max(Math.abs(lx)-o.hx,0),qz=Math.max(Math.abs(lz)-o.hz,0);if(qx*qx+qz*qz<(ORB_RADIUS+.04)**2)return null}
   else if(Math.hypot(dx,dz)<o.radius+ORB_RADIUS+.04)return null;
  }
  for(const o of api.orbs){if(o.owner===api.movingOrb)continue;const dy=h+FLOAT_HEIGHT-o.y;if(Math.hypot(x-o.x,z-o.z,dy)<ORB_RADIUS+o.radius+.06)return null;}
  return h;
 }
 // Resolve angled input along the stair, including where its sides taper.
 function slideOnStair(state,dx,dz){
  for(const c of crossings){
   const {along,across}=coordinates(c,state.x,state.z);
   if(Math.abs(along)>stairStart(c,along)+STAIR_COUNT*STAIR_RUN ||
      Math.abs(across)<1.5 || Math.abs(across)>UNDERPASS_WIDTH/2)continue;
   const floor=lowerProfile(c,along);
   const h=api.heightTransform?api.heightTransform(state.x,state.z,floor,100+c.id):floor;
   if(Math.abs(state.height-h)>.2)continue;
   const side=Math.sign(across);
   if(side*(-dx*c.dz+dz*c.dx)<=0)continue;
   const forward=dx*c.dx+dz*c.dz;
   if(Math.abs(forward)<.35*Math.hypot(dx,dz))return true;
   const x=state.x+c.dx*forward,z=state.z+c.dz*forward;
   // A small inward component handles the join between nonparallel edges.
   for(const inward of [0,.08*Math.abs(forward),.2*Math.abs(forward)]){
    const nextX=x+side*c.dz*inward,nextZ=z-side*c.dx*inward;
    const nextHeight=valid(nextX,nextZ,state.height);
    if(nextHeight!==null){state.x=nextX;state.z=nextZ;state.height=nextHeight;return true;}
   }
  }
  return false;
 }
 function move(state,dx,dz,owner=null){api.movingOrb=owner;const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));dx/=count;dz/=count;
  for(let i=0;i<count;i++){
   let h=valid(state.x+dx,state.z+dz,state.height);
   if(h!==null){state.x+=dx;state.z+=dz;state.height=h;continue}
   if(owner==='player' && slideOnStair(state,dx,dz))continue;
   // Slide along path edges and obstacle faces without crossing them.
   h=valid(state.x+dx,state.z,state.height);if(h!==null){state.x+=dx;state.height=h}
   h=valid(state.x,state.z+dz,state.height);if(h!==null){state.z+=dz;state.height=h}
  }api.movingOrb=null;return state;
 }
 const api={surfaces,valid,move,obstacles,orbs:[],movingOrb:null,heightTransform:null};return api;
}
