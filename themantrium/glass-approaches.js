import * as T from 'three';
// Light stepping tiles mark the existing open-air approaches; the emblem is untouched.
export function createGlassApproaches(scene,temples,polygons){
 const group=new T.Group();group.name='Floating glass temple approaches';scene.add(group);
 const glass=new T.MeshPhysicalMaterial({color:'#b8ddd8',roughness:.13,metalness:.02,transmission:.65,thickness:.16,ior:1.45,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:.035,depthWrite:false});
 const rim=new T.LineBasicMaterial({color:'#d4f4eb',transparent:true,opacity:.035,depthWrite:false});
 const geometry=new T.BoxGeometry(1.7,.12,1.7),edges=new T.EdgesGeometry(geometry),tiles=[];
 for(const temple of temples.filter(t=>Math.abs(t.x)<1)){
  const direction=Math.sign(temple.z);
  for(const side of [-1,1]){
   const nx=side/Math.SQRT2,nz=-direction/Math.SQRT2;
   let pathDistance=Infinity;
   for(const polygon of polygons.slice(2))for(let j=0;j<polygon.length;j++){
    const a=polygon[j],b=polygon[(j+1)%polygon.length],ex=b[0]-a[0],ez=b[1]-a[1],ax=a[0]-temple.x,az=a[1]-temple.z,det=nx*ez-nz*ex;
    if(Math.abs(det)<1e-8)continue;
    const distance=(ax*ez-az*ex)/det,u=(ax*nz-az*nx)/det;
    if(distance>3&&u>=0&&u<=1)pathDistance=Math.min(pathDistance,distance);
   }
   if(!Number.isFinite(pathDistance))continue;
   const templeEdge=54*.14/Math.SQRT2/2,gap=pathDistance-templeEdge,width=Math.min(1.7,gap*.35),spacing=(gap-2*width)/3;
   for(let i=0;i<2;i++){
    const distance=templeEdge+spacing+width/2+i*(width+spacing),tile=new T.Group();
    tile.position.set(temple.x+nx*distance,.15,temple.z+nz*distance);tile.rotation.y=Math.PI/4;tile.scale.set(width/1.7,1,width/1.7);
    const surface=new T.Mesh(geometry,glass.clone());surface.receiveShadow=true;tile.add(surface,new T.LineSegments(edges,rim.clone()));group.add(tile);
    tiles.push({tile,phase:tiles.length*1.73,glow:0});
   }
  }
 }
 let lastTime=0;
 return {group,update(time,reduced,cameraHeight=105,orb=null){
  const dt=Math.min(.05,Math.max(0,time-lastTime));lastTime=time;
  const close=1-T.MathUtils.smoothstep(cameraHeight,30,90);
  for(const item of tiles){const {tile,phase}=item;tile.position.y=.15+(reduced?0:Math.sin(time*.65+phase)*.045);
   const dx=orb?orb.x-tile.position.x:100,dz=orb?orb.z-tile.position.z:100,u=(dx-dz)/Math.SQRT2,v=(dx+dz)/Math.SQRT2,half=.85*tile.scale.x;
   const nearby=orb&&Math.abs(orb.y-tile.position.y)<3?1-T.MathUtils.smoothstep(Math.max(Math.abs(u),Math.abs(v)),half*.65,half+.45):0;
   item.glow=T.MathUtils.damp(item.glow,nearby,nearby>item.glow?5:2.5,dt);
   const material=tile.children[0].material;material.opacity=T.MathUtils.lerp(.12,.38,close)+item.glow*.2;material.emissive.set('#a9f2e5');material.emissiveIntensity=item.glow*.55;
   tile.children[1].material.opacity=T.MathUtils.lerp(.14,.32,close)+item.glow*.5;
  }
 }};
}
