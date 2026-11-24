import {loadCompressedModel} from './compressed-model.js?v=spacing237';
import {createStoneWear} from './stone-wear.js?v=spacing237';
import {createWallWater,wallWaterSites} from './wall-water.js?v=spacing237';
import {createTreeCollisions} from './tree-collisions.js?v=spacing237';
import * as T from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {inPolygon,crossings,coordinates,ribbonHeight} from './navigation.js?v=spacing237';
// All decoration grows outwards from stationary, exposed wall faces.
export function createNature(scene,polygons,temples=[],navigation=null){
 const treeCollisions=createTreeCollisions();scene.userData.treeCollisions=treeCollisions;if(navigation)navigation.treeCollisions=treeCollisions;
 const group=new T.Group();group.name='Living stone · moss and hanging vines';scene.add(group);
 let seed=7391;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const loader=new T.TextureLoader(),mossMap=loader.load('public/nature/moss-surface.webp'),mossNormal=loader.load('public/nature/moss-surface-normal.webp');mossMap.colorSpace=T.SRGBColorSpace;
 const mossMat=new T.MeshStandardMaterial({map:mossMap,normalMap:mossNormal,normalScale:new T.Vector2(.65,.65),color:'#a1b985',roughness:1});
 // Volumetric moss cushions and curved leaves replace flat wall cards.
 const leafMap=loader.load('public/nature/leaf-color.webp'),leafNormal=loader.load('public/nature/leaf-normal.webp');leafMap.colorSpace=T.SRGBColorSpace;
 const leafMat=new T.MeshPhysicalMaterial({map:leafMap,normalMap:leafNormal,normalScale:new T.Vector2(.4,.4),color:'#ffffff',roughness:.8,side:T.DoubleSide,clearcoat:.035,clearcoatRoughness:.85});
 // Three staggered layers fill the existing sprig footprint without extending into paths or entrances.
 // Preserve the original anchors, random sequence and wind/orb response.
 function makeSprig(variant){
 const detail=n=>{const v=Math.sin(n*127.1+variant*311.7)*43758.5453;return v-Math.floor(v);};
 const pos=[],uv=[],indices=[];const rows=5,cols=4;
 for(let leaflet=0;leaflet<27;leaflet++){
  if(variant&&detail(leaflet+90)<.12)continue;
  const layer=Math.floor(leaflet/9),slot=leaflet%9;
  const tier=Math.floor(slot/2),side=slot===8?0:slot%2?1:-1;
  const baseY=.05+tier*.24+layer*.055+detail(leaflet)*.075,angle=side*(.65+layer*.19+detail(leaflet+30)*.28),size=(slot===8?.42:.48-tier*.035)*(.82+detail(leaflet+60)*.32);
  const offset=pos.length/3;
  for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
   const v=y/rows,u=x/cols,lateral=u*2-1;
   const width=Math.pow(Math.sin(v*Math.PI),.75)*.22*size;
   const lx=lateral*width,ly=v*size;
   pos.push(lx*Math.cos(angle)+ly*Math.sin(angle),baseY-lx*Math.sin(angle)+ly*Math.cos(angle),(.025+detail(leaflet+120)*.06)*Math.sin(v*Math.PI)*(1-lateral*lateral)+slot*.004+(layer-1)*.085);
   uv.push(.16+u*.19,.60+v*.39);
  }
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=offset+y*(cols+1)+x;indices.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);}
 }
 const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));leafGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));leafGeo.setIndex(indices);leafGeo.computeVertexNormals();return leafGeo;}
 const leafGeos=Array.from({length:7},(_,i)=>makeSprig(i)),leafGeo=leafGeos[0];
 // Smaller overlapping moss granules remove the chunky low-poly cushions.
 const mossGeo=new T.IcosahedronGeometry(1,2);
 const mossPosition=mossGeo.attributes.position;for(let i=0;i<mossPosition.count;i++){const x=mossPosition.getX(i),y=mossPosition.getY(i),z=mossPosition.getZ(i),r=.82+.10*Math.sin(x*27+y*19+z*31);mossPosition.setXYZ(i,x*r,y*r,z*r);}mossGeo.computeVertexNormals();
 const leaves=[],moss=[],fernPoints=[],stems=[],treePoints=[],waterSites=[];const dummy=new T.Object3D();
 // Keep complete foliage clusters outside the solid temple foundations.
 const nearTemple=(x,z)=>temples.some(site=>{const dx=x-site.x,dz=z-site.z;return Math.abs((dx-dz)/Math.SQRT2)<4.3&&Math.abs((dx+dz)/Math.SQRT2)<4.3;});
 const nearPassage=(x,z)=>crossings.some(c=>{const p=coordinates(c,x,z);return Math.abs(p.along)<c.half+2&&Math.abs(p.across)<4.2});
 for(let id=2;id<polygons.length;id++){
  if(id===9)continue;
  const polygon=polygons[id];
  for(let e=0;e<polygon.length;e++){
   const a=polygon[e],b=polygon[(e+1)%polygon.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<2)continue;
   let nx=-dz/length,nz=dx/length;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(inPolygon(mx+nx*.1,mz+nz*.1,polygon)){nx=-nx;nz=-nz;}
   for(let d=1;d<length-1;d+=.8+random()*.9){
    const x=a[0]+dx*d/length,z=a[1]+dz*d/length,h=ribbonHeight(id-2,x,z);
    if(nearTemple(x,z)||nearPassage(x,z)||polygons.some((p,j)=>j!==id&&inPolygon(x+nx*.2,z+nz*.2,p)))continue;
    const angle=Math.atan2(nx,nz);
    for(let k=0;k<16;k++){const spread=(random()-.5)*1.4;moss.push({x:x+nx*.06+dx/length*spread,y:h-.12-random()**1.6*1.35,z:z+nz*.06+dz/length*spread,angle,s:.06+random()*.13});}
    if(random()<.52)fernPoints.push({x:x+nx*.05,y:h-.3,z:z+nz*.05,angle});
    if(treePoints.length<6&&random()<.045&&treePoints.every(p=>Math.hypot(p.x-x,p.z-z)>12))treePoints.push({x:x+nx*.65,y:h-1.6,z:z+nz*.65,nx,nz,angle});
    if(random()>.85)continue;
    const len=3.5+random()*8,phase=random()*6,points=[];
    for(let j=0;j<=20;j++){const u=j/20,wiggle=Math.sin(u*7+phase)*.16;points.push(new T.Vector3(x+nx*.12+dx/length*wiggle,h-.15-u*len,z+nz*.12+dz/length*wiggle));}
    const hangingStem=new T.TubeGeometry(new T.CatmullRomCurve3(points),20,.03,5,false);hangingStem.userData.vineAnchor=[x,h-.15,z,len];stems.push(hangingStem);
    for(let j=0;j<Math.floor(len*9);j++){const u=(j+random()*.65)/(len*9),f=u*20,p=points[Math.floor(f)].clone().lerp(points[Math.min(20,Math.floor(f)+1)],f%1),side=j%2?1:-1;leaves.push({anchor:[x,h-.15,z,len],x:p.x+dx/length*side*(.19+random()*.24),y:p.y,z:p.z+dz/length*side*(.19+random()*.24),angle:angle+side*(.25+random()*.7),roll:side*(.7+random()*.4),s:(.18+random()*.3)*(1-u*.5)});}
   }
  }
 }
 // Climbing stems follow the pillars; roof curtains stay outside the doorways.
 const overpassAnchors=new Set();
 const addVine=(points,scale=.25,followsOrb=false)=>{
  if(followsOrb)overpassAnchors.add([points[0].x,points[0].y,points[0].z].map(v=>v.toFixed(4)).join(','));
  const curve=new T.CatmullRomCurve3(points),stem=new T.TubeGeometry(curve,32,.025,5,false),drop=points[0].y-points[points.length-1].y;if(drop>.3)stem.userData.vineAnchor=[points[0].x,points[0].y,points[0].z,drop];stems.push(stem);
  const count=Math.ceil(curve.getLength()*7);
  for(let j=0;j<count;j++){const u=j/count,p=curve.getPoint(u),side=j%2?1:-1;leaves.push({anchor:drop>.3?[points[0].x,points[0].y,points[0].z,drop]:null,x:p.x+side*.13,y:p.y,z:p.z,angle:random()*Math.PI*2,roll:side*(.7+random()*.5),s:scale*(.65+random()*.7)*(1-u*.25)});}
 };
 for(const site of temples){
  const world=(u,y,v)=>new T.Vector3(site.x+(u+v)/Math.SQRT2,y,site.z+(-u+v)/Math.SQRT2);
  for(const u of [-1.95,1.95])for(const v of [-1.95,1.95]){
   const pts=[];for(let j=0;j<=32;j++){const t=j/32,a=t*Math.PI*4+u;pts.push(world(u+Math.cos(a)*.35,.85+t*2.65,v+Math.sin(a)*.35));}addVine(pts,.19);
  }
  for(let side=0;side<4;side++)for(const offset of [-2.1,-1.55,1.55,2.1]){
   const pts=[],len=.8+random()*1.3;
   for(let j=0;j<=16;j++){const t=j/16,a=side*Math.PI/2,u=offset+Math.sin(t*5)*.12,v=2.64+t*.16;pts.push(world(u*Math.cos(a)+v*Math.sin(a),3.67-t*len,-u*Math.sin(a)+v*Math.cos(a)));}addVine(pts,.21);
  }
 }
 for(const c of crossings){if(c.id===8)continue;for(const sign of [-1,1])for(const across of [-2.3,-1.6,1.6,2.3]){
  const along=sign*c.overpassEdges[sign<0?0:1],x=c.x+c.dx*along-c.dz*across,z=c.z+c.dz*along+c.dx*across;
  addVine([new T.Vector3(x,.3,z),new T.Vector3(x+c.dx*sign*.12,-.2,z+c.dz*sign*.12),new T.Vector3(x+c.dx*sign*.2,-.8-random()*.4,z+c.dz*sign*.2)],.18,true);
 }}
 const mossMesh=new T.InstancedMesh(mossGeo,mossMat,moss.length);moss.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,random()*.3);dummy.scale.set(p.s*(1.2+random()),p.s*(.6+random()),p.s*.6);dummy.updateMatrix();mossMesh.setMatrixAt(i,dummy.matrix);mossMesh.setColorAt(i,new T.Color().setHSL(.22+random()*.07,.24,.4+random()*.15))});mossMesh.receiveShadow=true;group.add(mossMesh);
 const leafMeshes=leafGeos.map((geo,k)=>new T.InstancedMesh(geo,leafMat,Math.ceil(Math.max(0,leaves.length-k)/leafGeos.length)));
 leafMeshes.forEach(mesh=>mesh.geometry.setAttribute('vineRoot',new T.InstancedBufferAttribute(new Float32Array(mesh.count*4),4)));
 leaves.forEach((p,i)=>{const mesh=leafMeshes[i%leafGeos.length],slot=Math.floor(i/leafGeos.length);mesh.geometry.attributes.vineRoot.setXYZW(slot,...(p.anchor||[0,0,0,0]));dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(-.35+random()*.7,p.angle,p.roll);dummy.scale.setScalar(p.s);dummy.updateMatrix();mesh.setMatrixAt(slot,dummy.matrix);mesh.setColorAt(slot,new T.Color().setHSL(.20+random()*.06,.12,.72+random()*.15));});leafMeshes.forEach(mesh=>{mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh)});
 const stemMat=new T.MeshStandardMaterial({color:'#3b4730',roughness:1});
 // Merge the thin tendrils into one geometry/draw call.
 const positions=[],normals=[],vineAnchors=[],vineWeights=[];for(const geo of stems){const g=geo.toNonIndexed();const anchor=geo.userData.vineAnchor;for(let i=0;i<g.attributes.position.count;i++){vineAnchors.push(...(anchor?anchor.slice(0,3):[0,0,0]));vineWeights.push(anchor?Math.min(1,Math.max(0,(anchor[1]-g.attributes.position.getY(i)-.12)/Math.max(.1,anchor[3]-.12))):0);}positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);geo.dispose();g.dispose();}const stemGeo=new T.BufferGeometry();stemGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));stemGeo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));stemGeo.setAttribute('vineAnchor',new T.Float32BufferAttribute(vineAnchors,3));stemGeo.setAttribute('vineWeight',new T.Float32BufferAttribute(vineWeights,1));group.add(new T.Mesh(stemGeo,stemMat));
 const wind={value:0},gustOrb={value:new T.Vector3(0,-1000,0)},gustStrength={value:0},gustDirection={value:new T.Vector3(1,0,0)},lastOrb=new T.Vector3(),gustDelta=new T.Vector3();let lastTime=0,hasOrb=false;
 // Each hanging vine is a rigid pendulum about its anchor: no length change.
 const vineStates=new Map(),key=a=>a.map(v=>v.toFixed(4)).join(',');
 const vineState=a=>{const k=key(a);if(!vineStates.has(k)){const hash=n=>{const x=Math.sin(a[0]*12.9898+a[1]*78.233+a[2]*37.719+n*19.19)*43758.5453;return x-Math.floor(x);};vineStates.set(k,{anchor:new T.Vector3(...a),angle:new T.Vector2(),velocity:new T.Vector2(),stiffness:1.6+hash(1)*1.2,damping:1.65+hash(2)*.65,strength:.75+hash(3)*.5,response:1.3+hash(4)*1.1,force:0,flow:new T.Vector2(),followsOrb:overpassAnchors.has(k),stems:[],leaves:[]});}return vineStates.get(k);};
 const stemBends=new T.BufferAttribute(new Float32Array(vineWeights.length*2),2);stemGeo.setAttribute('vineBend',stemBends);
 for(let i=0;i<vineWeights.length;i++)if(vineWeights[i]>0||vineAnchors[i*3]!==0||vineAnchors[i*3+1]!==0||vineAnchors[i*3+2]!==0)vineState(vineAnchors.slice(i*3,i*3+3)).stems.push(i);
 leafMeshes.forEach(mesh=>mesh.geometry.setAttribute('vineBend',new T.InstancedBufferAttribute(new Float32Array(mesh.count*2),2)));
 leaves.forEach((leaf,i)=>{if(leaf.anchor)vineState(leaf.anchor.slice(0,3)).leaves.push([leafMeshes[i%leafGeos.length].geometry.attributes.vineBend,Math.floor(i/leafGeos.length)]);});
 const vineRotation=`vec3 rotateVine(vec3 p,vec2 bend){float cx=cos(bend.x),sx=sin(bend.x),cz=cos(bend.y),sz=sin(bend.y);p=vec3(p.x,cx*p.y-sx*p.z,sx*p.y+cx*p.z);return vec3(cz*p.x-sz*p.y,sz*p.x+cz*p.y,p.z);}`;
 stemMat.onBeforeCompile=shader=>{
 shader.vertexShader='attribute vec3 vineAnchor;attribute vec2 vineBend;'+vineRotation+'\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=vineAnchor+rotateVine(position-vineAnchor,vineBend);');
 shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=rotateVine(objectNormal,vineBend);');
 };stemMat.customProgramCacheKey=()=> 'hanging-vine-pendulum-v2';
 function updateVines(dt,orb,reduced){
  for(const v of vineStates.values()){
   const dx=v.anchor.x-orb.x,dz=v.anchor.z-orb.z,dy=(v.anchor.y-orb.y)*.35,d=Math.hypot(dx,dy,dz),reach=1-T.MathUtils.smoothstep(d,.8,5),horizontal=Math.max(.01,Math.hypot(dx,dz));
   const desired=reduced?0:reach*gustStrength.value*(v.followsOrb?.30:.035)*v.strength;v.force=T.MathUtils.damp(v.force,desired,v.response,dt);const force=v.force;
   let tx=-dz/horizontal*force,tz=dx/horizontal*force;
   if(v.followsOrb){
    // Retain the passing orb's travel direction as the wake gently dissipates.
    v.flow.x=T.MathUtils.damp(v.flow.x,-gustDirection.value.z*desired,desired>.002?4.5:.75,dt);
    v.flow.y=T.MathUtils.damp(v.flow.y,gustDirection.value.x*desired,desired>.002?4.5:.75,dt);
    tx=v.flow.x;tz=v.flow.y;
   }
   // Damped spring retains a small, slow after-sway when the orb leaves.
   v.velocity.x+=((tx-v.angle.x)*v.stiffness*(v.followsOrb?2.5:1)-v.velocity.x*v.damping*(v.followsOrb?1.5:1))*dt;
   v.velocity.y+=((tz-v.angle.y)*v.stiffness*(v.followsOrb?2.5:1)-v.velocity.y*v.damping*(v.followsOrb?1.5:1))*dt;
   v.angle.addScaledVector(v.velocity,dt);
   for(const i of v.stems)stemBends.setXY(i,v.angle.x,v.angle.y);
   for(const [attr,i] of v.leaves)attr.setXY(i,v.angle.x,v.angle.y);
  }
  stemBends.needsUpdate=true;for(const mesh of leafMeshes)mesh.geometry.attributes.vineBend.needsUpdate=true;
 }
 const animateLeaves=(mat,amplitude=.06)=>{mat.onBeforeCompile=s=>{
  s.uniforms.natureTime=wind;s.uniforms.gustOrb=gustOrb;s.uniforms.gustStrength=gustStrength;s.uniforms.gustDirection=gustDirection;
  s.vertexShader=(mat===leafMat?'attribute vec4 vineRoot;attribute vec2 vineBend;'+vineRotation+'\n':'')+'uniform float natureTime;uniform vec3 gustOrb;uniform float gustStrength;uniform vec3 gustDirection;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 natureLocal=vec4(position,1.);
   #ifdef USE_INSTANCING
    natureLocal=instanceMatrix*natureLocal;
   #endif
   vec3 natureWorld=(modelMatrix*natureLocal).xyz;
   float flutter=sin(natureTime*.65+natureWorld.x*.7+natureWorld.y*.5)*${amplitude.toFixed(3)};
   vec3 away=natureWorld-gustOrb;away.y*=.35;
   float nearOrb=1.-smoothstep(1.,5.2,length(away));
   vec3 outward=away/max(length(away),.01);
   float ripple=.76+.24*sin(natureTime*3.2+natureWorld.x*1.3+natureWorld.z*.9);
   vec3 gust=(outward*.78+gustDirection*.22)*nearOrb*gustStrength*.36*ripple;
   vec3 worldSway=vec3(flutter,0.,sin(natureTime*.48+natureWorld.z)*${(amplitude*.65).toFixed(3)})+gust;
   worldSway*=clamp(abs(position.y),.38,1.2);
   ${mat===leafMat?'if(vineRoot.w>0.)worldSway=vineRoot.xyz+rotateVine(natureWorld-vineRoot.xyz,vineBend)-natureWorld;':''}
   // Convert a small WORLD-space breeze into each rotated/scaled plant's local space.
   // Applying world directions directly to local vertices caused apparent attraction.
   vec3 localSway=vec3(dot(worldSway,modelMatrix[0].xyz)/dot(modelMatrix[0].xyz,modelMatrix[0].xyz),dot(worldSway,modelMatrix[1].xyz)/dot(modelMatrix[1].xyz,modelMatrix[1].xyz),dot(worldSway,modelMatrix[2].xyz)/dot(modelMatrix[2].xyz,modelMatrix[2].xyz));
   #ifdef USE_INSTANCING
    localSway=vec3(dot(localSway,instanceMatrix[0].xyz)/dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),dot(localSway,instanceMatrix[1].xyz)/dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(localSway,instanceMatrix[2].xyz)/dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz));
   #endif
   transformed+=localSway;
  `);
 if(mat===leafMat)s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b))<.035)discard;');
 };mat.customProgramCacheKey=()=> 'passing-breeze-v5-'+amplitude;};animateLeaves(leafMat);
 new GLTFLoader().load('public/nature/fern/fern.gltf',gltf=>{
  const variants=[];gltf.scene.traverse(o=>{if(o.isMesh)variants.push(o)});
  variants.forEach((source,k)=>{const selected=fernPoints.filter((_,i)=>i%variants.length===k);const refined=leafMat.clone();animateLeaves(refined,.035);const inst=new T.InstancedMesh(leafGeos[k%leafGeos.length],refined,selected.length*7);selected.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(.45,p.angle,0);const scale=.35+random()*.3;for(let sprig=0;sprig<7;sprig++){dummy.rotation.set(.45+(sprig%3)*.2,p.angle+(sprig-3)*.32,(sprig-3)*.14);dummy.scale.setScalar(scale*(.8+(sprig%3)*.13));dummy.updateMatrix();inst.setMatrixAt(i*7+sprig,dummy.matrix)}});inst.receiveShadow=true;group.add(inst)});
 },undefined,()=>console.warn('Fern unavailable; moss and vines remain available.'));
 // Tapered, bark-textured buttress roots cling to the exposed wall face.
 const bark=loader.load('public/nature/bark-color.webp'),barkNormal=loader.load('public/nature/bark-normal.webp');bark.colorSpace=T.SRGBColorSpace;
 const barkMat=new T.MeshStandardMaterial({map:bark,normalMap:barkNormal,normalScale:new T.Vector2(.7,.7),roughness:.95});
 treePoints.forEach((p,i)=>p.variant=i);
 const topApproachTree=treePoints.reduce((best,p,i)=>p.x<0&&p.z<-20&&(best<0||Math.hypot(p.x+7.98,p.z+27.86)<Math.hypot(treePoints[best].x+7.98,treePoints[best].z+27.86))?i:best,-1);
 if(topApproachTree>=0)treePoints.splice(topApproachTree,1);
 for(const p of treePoints)for(let r=0;r<5;r++){
  const side=(r-2)*.48,len=2.7+random()*3,tx=-p.nz,tz=p.nx;
  const curve=new T.CatmullRomCurve3([new T.Vector3(p.x+p.nx*.7,p.y+.7,p.z+p.nz*.7),new T.Vector3(p.x+tx*side-p.nx*.45,p.y-.5,p.z+tz*side-p.nz*.45),new T.Vector3(p.x+tx*side*1.6-p.nx*.48,p.y-len*.55,p.z+tz*side*1.6-p.nz*.48),new T.Vector3(p.x+tx*side*2-p.nx*.5,p.y-len,p.z+tz*side*2-p.nz*.5)]);
  const g=new T.TubeGeometry(curve,24,.22,7,false),a=g.attributes.position;
  for(let j=0;j<=24;j++){const center=curve.getPointAt(j/24),scale=Math.pow(1-j/24,.8)*.94+.06;for(let k=0;k<=7;k++){const i=j*8+k;a.setXYZ(i,center.x+(a.getX(i)-center.x)*scale,center.y+(a.getY(i)-center.y)*scale,center.z+(a.getZ(i)-center.z)*scale);}}g.computeVertexNormals();const root=new T.Mesh(g,barkMat);root.castShadow=root.receiveShadow=true;group.add(root);
 }
 loadCompressedModel(new GLTFLoader(),'public/nature/tree/tree-packed.bin','public/nature/tree/tree.glb?v=foliage111',gltf=>{
  gltf.scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(gltf.scene),height=bounds.max.y-bounds.min.y;
  treeCollisions.flightBounds=[];
  treePoints.forEach((p,i)=>{const scale=(3.8+(p.variant%3)*.55)/height;dummy.position.set(p.x+p.nx*.7,p.y-bounds.min.y*scale,p.z+p.nz*.7);dummy.rotation.set(p.nz*.13,p.angle+p.variant*.7,-p.nx*.13);dummy.scale.setScalar(scale);dummy.updateMatrix();treeCollisions.flightBounds.push(bounds.clone().applyMatrix4(dummy.matrix).expandByScalar(.5));});
  gltf.scene.traverse(source=>{if(!source.isMesh)return;const geo=source.geometry.clone().applyMatrix4(source.matrixWorld),mat=source.material.clone(),isLeaf=/leaves/i.test(source.name+' '+mat.name);mat.transparent=false;mat.depthWrite=true;if(isLeaf){mat.alphaTest=.1;mat.side=T.DoubleSide;mat.roughness=.8;mat.color.set('#b8d39a');animateLeaves(mat,.045);}const inst=new T.InstancedMesh(geo,mat,treePoints.length);
   treePoints.forEach((p,i)=>{const scale=(3.8+(p.variant%3)*.55)/height;dummy.position.set(p.x+p.nx*.7,p.y-bounds.min.y*scale,p.z+p.nz*.7);dummy.rotation.set(p.nz*.13,p.angle+p.variant*.7,-p.nx*.13);dummy.scale.setScalar(scale);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.userData.treeCollider=true;const matrices=[];for(let i=0;i<inst.count;i++){const m=new T.Matrix4();inst.getMatrixAt(i,m);matrices.push(m);}treeCollisions.addGeometry(geo,matrices);if(!isLeaf)treeCollisions.addBranches(geo,matrices);inst.castShadow=inst.receiveShadow=true;group.add(inst);
  });
 },()=>console.warn('Tree asset unavailable.'));
 waterSites.push(...wallWaterSites(polygons,navigation));
 const cascades=createWallWater(group,waterSites);
 const stoneWear=createStoneWear(group,polygons,navigation);
 return {group,update:(time,reduced,orb)=>{cascades.update(time,reduced);stoneWear.update();wind.value=reduced?0:time;const dt=Math.min(.1,Math.max(.001,time-lastTime));lastTime=time;if(orb){if(!hasOrb){lastOrb.copy(orb);gustOrb.value.copy(orb);hasOrb=true;}gustDelta.copy(orb).sub(lastOrb);const moved=gustDelta.length(),speed=moved/dt;
 if(moved>2){gustStrength.value=0;gustOrb.value.copy(orb);}else{
  const moving=speed>.15&&!reduced;
  gustStrength.value=T.MathUtils.lerp(gustStrength.value,moving?Math.min(1,speed*.22):0,1-Math.exp(-dt*(moving?4:1.15)));
  if(moving){gustDirection.value.lerp(gustDelta.normalize(),1-Math.exp(-dt*4));gustDirection.value.y=0;if(gustDirection.value.lengthSq()>.001)gustDirection.value.normalize();}
  gustOrb.value.lerp(orb,1-Math.exp(-dt*5));
 }lastOrb.copy(orb);updateVines(dt,orb,reduced);}}};
}
