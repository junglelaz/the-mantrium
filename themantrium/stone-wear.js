import * as T from 'three';
import {inPolygon,ribbonHeight} from './navigation.js?v=spacing237';
// Sparse, unique surface fractures. Navigation and the emblem remain intact.
export function createStoneWear(parent,polygons,navigation,options={}){
 const group=new T.Group();group.name='Quiet age · stone fractures';parent.add(group);
 let seed=options.seed??92071;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const patches=[],plane=new T.PlaneGeometry(1,1);plane.rotateX(-Math.PI/2);
 for(let attempt=0;attempt<2200&&patches.length<(options.count??34);attempt++){
  const x=(random()-.5)*(options.span??65),z=(random()-.5)*(options.span??60);
  if(options.exclude?.(x,z))continue;
  const id=polygons.findIndex((p,i)=>i>=2&&inPolygon(x,z,p));if(id<2)continue;
  const h=options.floor??ribbonHeight(id-2,x,z),size=.65+random()*.75;
  if((options.floor===undefined&&Math.abs(h-.35)>.001)||patches.some(p=>Math.hypot(p.x-x,p.z-z)<(options.spacing??4.5)))continue;
  if(Array.from({length:8},(_,i)=>i*Math.PI/4).some(a=>!inPolygon(x+Math.cos(a)*size,z+Math.sin(a)*size,polygons[id])||(options.floor===undefined&&Math.abs(ribbonHeight(id-2,x+Math.cos(a)*size,z+Math.sin(a)*size)-h)>.001)))continue;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
  const points=[];let px=40+random()*30,py=20;
  const segments=6+Math.floor(random()*6);
  for(let i=0;i<segments;i++){points.push([px,py]);px=Math.max(25,Math.min(230,px+(random()-.32)*38));py+=205/segments*(.7+random()*.6);}
  const stroke=(pts,width,color,offset=0)=>{ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a+offset,b+offset):ctx.moveTo(a+offset,b+offset));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();};
  stroke(points,3.4,'rgba(39,43,31,.18)');stroke(points,2.3,'rgba(35,39,29,.65)');stroke(points,1,'rgba(226,225,196,.36)',1.7);
  for(let j=0,n=1+Math.floor(random()*4);j<n;j++){const p=points[1+Math.floor(random()*(points.length-2))],branch=[p,[p[0]-18-random()*12,p[1]+8],[p[0]-30-random()*20,p[1]+30+random()*20]];stroke(branch,1.8,'rgba(40,44,32,.44)');}
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  const material=new T.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const mesh=new T.Mesh(plane,material);mesh.position.set(x,h+.009,z);mesh.scale.setScalar(size);mesh.rotation.y=random()*Math.PI*2;mesh.receiveShadow=true;group.add(mesh);patches.push({mesh,x,z,h,id});
 }
 return {update(){for(const p of patches)p.mesh.position.y=(navigation?.heightTransform?.(p.x,p.z,p.h,p.id)??p.h)+.009;},group};
}

export function createInteriorStoneWear(parent,index,floor=0,circular=false){
 const outline=circular?Array.from({length:48},(_,i)=>[Math.cos(i*Math.PI/24)*9.5,Math.sin(i*Math.PI/24)*9.5]):[[-10,-10],[10,-10],[10,10],[-10,10]];
 return createStoneWear(parent,[[],[],outline],null,{seed:18071+index*7919,floor,span:19,count:11,spacing:2.8,exclude:(x,z)=>circular?Math.hypot(x,z)<3.3:[[-5,-3],[0,-6],[5,-3],[0,-3]].some(([a,b])=>Math.hypot(x-a,z-b)<2.7)});
}
