import {createScreenshotOrb} from './screenshot-orb.js?v=spacing237';
import {createBrandEmblem,create3PMEmblem} from './pedestal-emblems.js?v=spacing237';
import {createInteriorStoneWear} from './stone-wear.js?v=spacing237';
import {createInteriorAtmosphere} from './interior-atmosphere.js?v=spacing237';
import {dressTemple} from './temple-identity.js?v=spacing237';
import {createClouds,renderCloudScene} from './clouds-fluid251.js';
import {interiorMaterials,stoneUV} from './interior-surfaces.js?v=spacing237';
import {createTemplePages} from './temple-pages-fluid248.js';
import * as T from 'three';
const viewPoint=new T.Vector3(),screenOffset=new T.Vector3();
export function pinScreenPoint(camera,point,anchor,amount=1){camera.updateMatrixWorld();const local=viewPoint.copy(point).applyMatrix4(camera.matrixWorldInverse),tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));const delta=screenOffset.set(local.x+local.z*tan*camera.aspect*anchor.x,local.y+local.z*tan*anchor.y,0).multiplyScalar(amount).applyQuaternion(camera.quaternion);camera.position.add(delta);camera.updateMatrixWorld();}
function placeScreenPoint(camera,orb,anchor,amount=1){camera.updateMatrixWorld();const local=viewPoint.copy(orb.position).applyMatrix4(camera.matrixWorldInverse),tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));const delta=screenOffset.set(-local.z*tan*camera.aspect*anchor.x-local.x,-local.z*tan*anchor.y-local.y,0).multiplyScalar(amount).applyQuaternion(camera.quaternion);orb.position.add(delta);}
// Radius in normalized screen units; matching this ratio preserves the silhouette.
export function screenRadius(camera,orb){camera.updateMatrixWorld();const depth=-viewPoint.copy(orb.position).applyMatrix4(camera.matrixWorldInverse).z;return orb.geometry.parameters.radius*orb.scale.x/(depth*Math.tan(T.MathUtils.degToRad(camera.fov/2)));}
export function matchScreenRadius(camera,orb,radius,amount=1){camera.updateMatrixWorld();const depth=-viewPoint.copy(orb.position).applyMatrix4(camera.matrixWorldInverse).z;const scale=radius*depth*Math.tan(T.MathUtils.degToRad(camera.fov/2))/orb.geometry.parameters.radius;orb.scale.setScalar(T.MathUtils.lerp(1,scale,amount));}
// Approach the physical doorway, cross its threshold, then reveal the interior.
export function createInteriors(renderer,sites,orbMaterial){
 const screenshotOrb=createScreenshotOrb();
 const state={index:-1,blend:0,target:0,x:0,z:8,elapsed:0};
 const mobileFraming=matchMedia('(pointer:coarse), (max-width:650px)');
 const frontCaps=[new T.Vector3(-10.6,7.15,10.6),new T.Vector3(10.6,7.15,10.6)];
 const roomBounds=[],viewCorner=new T.Vector3();
 for(const [radius,height] of [[11,-1],[11,0],[10.6,7.15]]){
  for(const x of [-radius,radius])for(const z of [-radius,radius])roomBounds.push(new T.Vector3(x,height,z));
 }
 const rooms=[];
 function buildRoom(index){
  const site=sites[index];
  const scene=new T.Scene();scene.userData.useNativeMistDepth=matchMedia('(pointer:coarse), (max-width:650px)').matches;scene.background=new T.Color('#284449');scene.fog=new T.FogExp2('#394b57',.012);
  scene.add(new T.HemisphereLight('#e6efff','#536168',2.8));
  const atmosphere=createInteriorAtmosphere(scene);
  const {stone,floor,metal}=interiorMaterials(site.color),mist=createClouds(scene,{interior:true}),glow=new T.MeshStandardMaterial({color:site.color,emissive:site.color,emissiveIntensity:1.1});
  const add=(geometry,material,x,y,z)=>{const mesh=new T.Mesh(stoneUV(geometry),material);mesh.position.set(x,y,z);scene.add(mesh);return mesh};
  add(new T.BoxGeometry(22,1,22),floor,0,-.5,0);
  createInteriorStoneWear(scene,index);
  for(const x of [-10,10])for(const z of [-10,10]){add(new T.CylinderGeometry(.4,.5,7,12),stone,x,3.5,z);add(new T.BoxGeometry(1.2,.3,1.2),metal,x,7,z);add(new T.BoxGeometry(1.2,.3,1.2),stone,x,.15,z);}
  for(const x of [-10,10])for(const z of [-10,10])for(const y of [.5,.7,6.4,6.65]){const collar=add(new T.TorusGeometry(.46,.045,6,32),metal,x,y,z);collar.rotation.x=Math.PI/2;}
  // Four clearly marked thresholds; walk beyond the rim to return to the Mantrium.
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const gate=add(new T.BoxGeometry(2.6,.04,1),glow,Math.sin(a)*10,.03,Math.cos(a)*10);gate.rotation.y=a;}
  const light=new T.PointLight(site.color,140,35,1.7);light.position.set(0,6,0);scene.add(light);
  const exhibits=[],nodes=[[-5,-3],[0,-6],[5,-3]];
  const labels=[['3PM','Drakensberg Cannabis','Local LLM'],['Football Careers','True2Nature','Jungle Laz'],['Design','Engineering','Intelligence'],['Intention','Craft','Connection']][index];
  (index<2?nodes:[[0,-3]]).forEach(([x,z],i)=>{add(new T.CylinderGeometry(1.2,1.35,.65,32),stone,x,.325,z);let item;
   if(index===0){const forms=[new T.ConeGeometry(1.15,1.7,4),new T.TetrahedronGeometry(1.2),new T.OctahedronGeometry(1)];item=add(forms[i],metal,x,2,z);if(i===0)item.rotation.y=Math.PI/4;if(i===2){scene.remove(item);item=new T.Group();item.position.set(x,2.1,z);scene.add(item);const upper=new T.Mesh(new T.ConeGeometry(.75,1.5,4),metal),lower=new T.Mesh(new T.ConeGeometry(.75,.9,4),metal);upper.position.y=.85;lower.position.y=-.55;lower.rotation.z=Math.PI;upper.rotation.y=lower.rotation.y=Math.PI/4;item.add(upper,lower);}}
   if(index===1){item=new T.Group();item.position.set(x,1.7,z);scene.add(item);for(let j=0;j<5;j++){const slab=new T.Mesh(new T.BoxGeometry(1.4,.12,1),j===i?glow:metal);slab.position.y=j*.23-.5;slab.rotation.y=j*.12;item.add(slab);}}
   if(index===2){item=new T.Group();item.position.set(x,2,z);scene.add(item);for(let j=0;j<3;j++){const ring=new T.Mesh(new T.TorusGeometry(.85,.035,8,48),glow);ring.rotation.set(j*Math.PI/3,i+j,0);item.add(ring);}}
   if(index===3)item=add(new T.OctahedronGeometry(.85),metal,x,2,z);
   if(index===1||(index===0&&i===0)){scene.remove(item);item=index===0?create3PMEmblem():createBrandEmblem(['football','nature','jungle'][i]);item.position.set(x,index===1&&i===2?2.22:2,z);scene.add(item);}
   for(const radius of [2,2.3]){const ring=add(new T.TorusGeometry(radius,.025,6,96),new T.MeshBasicMaterial({color:'#e9f4ed',transparent:true,opacity:.65}),x,.045,z);ring.rotation.x=Math.PI/2;}
   const glowMaterials=[];
   item.traverse(part=>{if(!part.isMesh)return;const clone=material=>{const m=material.clone();m.onBeforeCompile=material.onBeforeCompile;m.customProgramCacheKey=material.customProgramCacheKey;if(m.emissive){const base=m.emissive.getHex()===0?0:m.emissiveIntensity;m.emissive.set(m.emissive.getHex()===0?site.color:m.emissive);m.emissiveIntensity=base;glowMaterials.push({material:m,base});}return m;};part.material=Array.isArray(part.material)?part.material.map(clone):clone(part.material);});
   const proximityLight=new T.PointLight(site.color,0,4,2);item.add(proximityLight);
   exhibits.push({x,z,item,label:labels[i],base:item.position.y,glowMaterials,proximityLight,proximity:0});
  });
  const readingOrbMaterial=orbMaterial.clone();readingOrbMaterial.uniforms={...orbMaterial.uniforms,readingFlow:{value:0},scrollPhase:{value:0},templeTint:{value:new T.Color(site.color)}};readingOrbMaterial.fragmentShader='uniform float readingFlow;uniform float scrollPhase;uniform vec3 templeTint;'+readingOrbMaterial.fragmentShader;readingOrbMaterial.fragmentShader=readingOrbMaterial.fragmentShader.replace('gl_FragColor=vec4(mix(col',`float slowFlow=sin(p.y*6.+sin(p.x*5.+time*.7+scrollPhase*5.)*1.8+p.z*4.-time*.85+scrollPhase*8.)*.5+.5;vec3 innerColour=mix(vec3(.76,.9,.87),templeTint,.28+slowFlow*.65);innerColour*=.7+.5*(sin(p.x*8.-p.y*4.+time*.6+scrollPhase*6.)*.5+.5);col=mix(col,innerColour,readingFlow*.9);gl_FragColor=vec4(mix(col`);readingOrbMaterial.depthTest=false;readingOrbMaterial.depthWrite=false;const orb=new T.Mesh(new T.SphereGeometry(.62,32,24),readingOrbMaterial);orb.renderOrder=100;scene.add(orb);const companionLight=new T.PointLight(site.color,55,18,1.6);scene.add(companionLight);
  dressTemple(scene,index,{stone,floor,metal});
  const camera=new T.PerspectiveCamera(43,1,.1,100);
  return {scene,camera,orb,exhibits,light,companionLight,mist,atmosphere};
 }
 let a=new T.FramebufferTexture(1,1),b=new T.FramebufferTexture(1,1);const screen=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const material=new T.ShaderMaterial({toneMapped:false,uniforms:{hall:{value:a},room:{value:b},mixAmount:{value:0},reduced:{value:0},aspect:{value:1},entrance:{value:0},exiting:{value:0},phase:{value:0},lightCenter:{value:new T.Vector2(.5,.5)},lightColour:{value:new T.Color('#f0f5e8')}},vertexShader:'varying vec2 uvv;void main(){uvv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D hall;uniform sampler2D room;uniform float mixAmount;uniform float entrance;uniform float exiting;uniform float phase;uniform float aspect;uniform vec2 lightCenter;uniform vec3 lightColour;varying vec2 uvv;
 void main(){
  vec4 outside=texture2D(hall,uvv),inside=texture2D(room,uvv);
  if(entrance<.5){gl_FragColor=mix(outside,inside,mixAmount);return;}
  vec2 delta=(uvv-lightCenter)*vec2(aspect,1.);
  float revealPhase=exiting>.5?smoothstep(.48,.96,phase):phase;
  float expansion=smoothstep(.06,.62,revealPhase),radius=mix(.025,2.3,expansion*expansion);
  float halo=exp(-dot(delta,delta)/(radius*radius))*smoothstep(.02,.3,revealPhase);
  float veil=smoothstep(.44,.64,revealPhase);
  vec4 source=mix(outside,inside,exiting),destination=mix(inside,outside,exiting);
  vec4 luminous=mix(source,vec4(lightColour,1.),clamp(halo+veil*(1.-halo),0.,1.));
  gl_FragColor=mix(luminous,destination,smoothstep(.68,1.,revealPhase));
 }`,depthTest:false,depthWrite:false});screen.add(new T.Mesh(new T.PlaneGeometry(2,2),material));
 const mistPosition=new T.Vector3();
 let onExit=()=>{},near=null;
 const aimCamera=new T.PerspectiveCamera();
 const matchedPosition=new T.Vector3(),matchedRotation=new T.Quaternion();
 const inverseYaw=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-Math.PI/4);
 const roomOrigin=new T.Vector3();
 let menuCamera=null,menuRoom=-1;
 let exitCamera=null,exitNormal=new T.Vector3(1,0,0);
 let entry=null,startCamera=null,motionReduced=false,anchor=null,anchorRadius=0,settle=0,roomSettle=1,lastDt=0,deferOrb=false,reveal=0,exitGlitch=0,exitReveal=0;
 // Translate along camera-local axes to preserve an exact normalized screen point.


 let selection=null,readingFollow=0,roomReturn=null,roomPosition={x:0,z:8},pedestalArmed=true;let mobileFilmBlend=0;const readingAnchor=new T.Vector3(.54,-.12,0);
 const pages=createTemplePages({leave,onOpen:()=>{roomPosition={x:state.x,z:state.z};roomReturn=null;pedestalArmed=false;},onRoom:()=>{selection=null;roomReturn={...roomPosition};pedestalArmed=false;},select:i=>{if(state.index<0||state.index>3||selection)return;const e=rooms[state.index].exhibits[i];selection={i,x:e.x,z:e.z+2.1};}});
 const raycaster=new T.Raycaster(),mouse=new T.Vector2();let mousePedestal=-1;
 function pickPedestal(event){
  if(state.index<0||state.index>3||state.blend!==1||roomSettle>.15||pages.mode!=='gallery'||selection||document.body.classList.contains('quick-nav-open')||event.target.closest?.('button,a,input,textarea,.crystal-viewer'))return -1;
  const r=rooms[state.index],rect=renderer.domElement.getBoundingClientRect();mouse.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);raycaster.setFromCamera(mouse,r.camera);
  const hit=raycaster.intersectObjects(r.exhibits.map(e=>e.item),true)[0];if(!hit)return -1;
  return r.exhibits.findIndex(e=>{let o=hit.object;while(o){if(o===e.item)return true;o=o.parent}return false});
 }
 document.addEventListener('pointermove',event=>{mousePedestal=pickPedestal(event);renderer.domElement.style.cursor=mousePedestal>=0?'pointer':'';});
 document.addEventListener('pointerleave',()=>{mousePedestal=-1;renderer.domElement.style.cursor='';});
 document.addEventListener('click',event=>{const i=pickPedestal(event);if(i<0)return;const e=rooms[state.index].exhibits[i];selection={i,x:e.x,z:e.z+2.1};mousePedestal=-1;renderer.domElement.style.cursor='';});
 function enter(index,exit,arrival){if(state.index>=0)return;
  rooms[index] ??= buildRoom(index);
  pages.reset();selection=null;readingFollow=0;mobileFilmBlend=0;roomReturn=null;roomPosition={x:0,z:8};pedestalArmed=true;entry=arrival;startCamera=null;anchor=null;settle=0;roomSettle=1;deferOrb=true;reveal=0;exitReveal=0;if(state.index>=0)return;state.index=index;document.body.classList.add('interior-active');state.target=1;state.x=0;state.z=8;state.elapsed=0;onExit=exit;}
 function leave(walkedThrough=null){if(state.index<0||!state.target)return;pages.fadeExit();pages.hide();selection=null;const r=rooms[state.index];r.camera.updateMatrixWorld();exitCamera=r.camera.clone();
 const edge=walkedThrough?Math.max(Math.abs(walkedThrough.x),Math.abs(walkedThrough.z)):0;
 exitNormal.set(1,0,0);
 if(edge>=8){if(Math.abs(walkedThrough.x)>=Math.abs(walkedThrough.z))exitNormal.set(Math.sign(walkedThrough.x)||1,0,0);else exitNormal.set(0,0,Math.sign(walkedThrough.z)||1);}
 anchor=r.orb.position.clone().project(r.camera);anchorRadius=anchorRadius;exitGlitch=0;entry?.prepareExit?.();state.target=0;}
 function move(dx,dz){
  if(state.index<0||state.index>3||state.target!==1||state.blend<1||roomSettle>.15||deferOrb||reveal>0||pages.mode!=='gallery'||selection||roomReturn||readingFollow>.05)return;
  const r=rooms[state.index],count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
  for(let step=0;step<count;step++){
   const x=state.x+dx/count,z=state.z+dz/count;
   if(Math.abs(x)>9.2||Math.abs(z)>9.2){if(Math.min(Math.abs(x),Math.abs(z))<1.3){leave({x,z});return;}continue;}
   const distance=r.exhibits.map(e=>Math.hypot(x-e.x,z-e.z));
   if(distance.every(d=>d>3.1))pedestalArmed=true;
   const closest=distance.indexOf(Math.min(...distance));
   if(pedestalArmed&&distance[closest]<2.65){state.x=x;state.z=z;pages.openPage(closest);return;}
   if(distance.some(d=>d<1.95))continue;
   state.x=x;state.z=z;
  }
  return true;
 }
 function update(dt,reduced){lastDt=dt;if(state.index<0)return;motionReduced=reduced;state.elapsed+=dt;if(state.target===0&&exitGlitch<.45){exitGlitch+=dt;orbMaterial.uniforms.glitch.value=reduced?0:Math.min(1,exitGlitch/.45);return;}if(state.target===1&&state.elapsed<.45){orbMaterial.uniforms.glitch.value=reduced?0:state.elapsed/.45;return;}orbMaterial.uniforms.glitch.value=0;const step=dt/(reduced?.3:4.2);state.blend=T.MathUtils.clamp(state.blend+(state.target?step:-step),0,1);if(!state.target&&state.blend===0){state.index=-1;document.body.classList.remove('interior-active');settle=0;exitReveal=.65;onExit();return;}const r=rooms[state.index];r.atmosphere.update(performance.now()/1000,reduced);r.mist.update(performance.now()/1000,reduced,undefined,false,mistPosition.set(state.x,1.45,state.z));
 if(state.target===1&&state.blend===1&&!deferOrb){
  if(roomReturn){state.x=T.MathUtils.damp(state.x,roomReturn.x,3,dt);state.z=T.MathUtils.damp(state.z,roomReturn.z,3,dt);if(Math.hypot(state.x-roomReturn.x,state.z-roomReturn.z)<.02){state.x=roomReturn.x;state.z=roomReturn.z;roomReturn=null;}}
  else if(selection){state.x=T.MathUtils.damp(state.x,selection.x,3,dt);state.z=T.MathUtils.damp(state.z,selection.z,3,dt);if(Math.hypot(state.x-selection.x,state.z-selection.z)<.12){pages.openPage(selection.i);selection=null;}}
  
 }
 r.companionLight.position.set(state.x,2.8,state.z);r.companionLight.intensity=T.MathUtils.damp(r.companionLight.intensity,55+pages.activeSection*8,2,dt);
 if(deferOrb&&state.blend===1&&roomSettle<=.15){deferOrb=false;reveal=.65;}if(reveal>0){reveal=Math.max(0,reveal-dt);orbMaterial.uniforms.glitch.value=reduced?0:reveal/.65;}r.orb.visible=state.target===1?!deferOrb:exitGlitch<.45;r.orb.position.set(state.x,1.45+(reduced?0:Math.sin(state.elapsed*1.7)*.06),state.z);near=r.exhibits.find(e=>Math.hypot(state.x-e.x,state.z-e.z)<3.2);const hoveredPedestal=pages.hoveredPedestal;for(const e of r.exhibits){if(!reduced){if(e.item.userData.emblem)e.item.rotation.y=Math.sin(state.elapsed*.35+iHash(e.label))*.28;else e.item.rotation.y+=dt*.18;e.item.position.y=e.base+Math.sin(state.elapsed+iHash(e.label))*.1;}const distance=Math.hypot(state.x-e.x,state.z-e.z),strength=Math.max(1-T.MathUtils.smoothstep(distance,1.8,6),(hoveredPedestal===r.exhibits.indexOf(e)||(pages.mode==='gallery'&&mousePedestal===r.exhibits.indexOf(e)))?1:0);
 e.proximity=T.MathUtils.damp(e.proximity,strength,5,dt);
 for(const g of e.glowMaterials)g.material.emissiveIntensity=g.base+e.proximity*(e.item.userData.emblem?.12:.65);
 e.proximityLight.intensity=e.proximity*5;e.item.scale.setScalar(1+e.proximity*.06);}}
 function iHash(s){return s.length;}
 function render(hall,hallCamera,zoom,hallOrb,menuBlend=0){
  if(menuBlend>0&&state.index>=0){
   const r=rooms[state.index];
   if(!menuCamera||menuRoom!==state.index){screenshotOrb.dismiss(false);menuCamera=r.camera.clone();menuRoom=state.index;}
   // Map the exterior roof plane into the room's 22-unit square. Both
   // cameras then project the same four corners throughout the dissolve.
   const site=sites[state.index],scale=5.15/22;
   matchedPosition.set(hallCamera.position.x-site.x,hallCamera.position.y-3.79,hallCamera.position.z-site.z);
   matchedPosition.applyQuaternion(inverseYaw).divideScalar(scale);
   matchedRotation.copy(hallCamera.quaternion).premultiply(inverseYaw);
   const rise=T.MathUtils.smoothstep(menuBlend,0,.42);
   r.camera.copy(menuCamera);r.camera.aspect=hallCamera.aspect;
   r.camera.fov=T.MathUtils.lerp(menuCamera.fov,hallCamera.fov,rise);r.camera.far=2000;r.camera.updateProjectionMatrix();
   r.camera.position.lerp(matchedPosition,rise);r.camera.quaternion.slerp(matchedRotation,rise);
   r.camera.updateMatrixWorld();
   const cross=T.MathUtils.smoothstep(menuBlend,.46,.64);
   const panel=document.querySelector('#temple-pages');
   panel.style.opacity=String(1-T.MathUtils.smoothstep(menuBlend,0,.18));
   panel.style.pointerEvents='none';
   if(cross===0){renderCloudScene(renderer,r.scene,r.camera);return}
   if(cross===1){renderCloudScene(renderer,hall,hallCamera);return}
   const size=renderer.getDrawingBufferSize(new T.Vector2());
   if(a.image.width!==size.x||a.image.height!==size.y){a.dispose();b.dispose();a=new T.FramebufferTexture(size.x,size.y);b=new T.FramebufferTexture(size.x,size.y);material.uniforms.hall.value=a;material.uniforms.room.value=b;}
   renderer.setRenderTarget(null);renderCloudScene(renderer,hall,hallCamera);renderer.copyFramebufferToTexture(a);
   renderCloudScene(renderer,r.scene,r.camera);renderer.copyFramebufferToTexture(b);
   material.uniforms.entrance.value=0;material.uniforms.mixAmount.value=1-cross;
   renderer.render(screen,camera);
   return;
  }
  if(menuCamera){menuCamera=null;menuRoom=-1;const panel=document.querySelector('#temple-pages');panel.style.removeProperty('opacity');panel.style.removeProperty('pointer-events');}

  if(state.index<0){pages.hide();if(settle>0||exitReveal>0)hallOrb.visible=settle<=.15;if(settle<=.15&&exitReveal>0){exitReveal=Math.max(0,exitReveal-lastDt);orbMaterial.uniforms.glitch.value=motionReduced?0:exitReveal/.65;}if(settle>0&&anchor){pinScreenPoint(hallCamera,hallOrb.position,anchor,settle);matchScreenRadius(hallCamera,hallOrb,anchorRadius,settle);settle=Math.max(0,settle-lastDt*.5);}else hallOrb.scale.setScalar(1);renderCloudScene(renderer,hall,hallCamera);return}
  if(!startCamera){startCamera=hallCamera.clone();hallCamera.updateMatrixWorld();anchor=hallOrb.position.clone().project(hallCamera);anchorRadius=screenRadius(hallCamera,hallOrb);}
  const r=rooms[state.index],aspect=hallCamera.aspect,progress=state.blend;hallOrb.visible=state.target===1&&state.elapsed<.45&&!entry?.hideAtStart;
  const far=mobileFraming.matches?Math.max(100,80/aspect):100;
  if(r.camera.aspect!==aspect||r.camera.far!==far){
   r.camera.aspect=aspect;r.camera.far=far;r.camera.updateProjectionMatrix();
  }
  const distance=(1.4+(1-zoom)*.7)/Math.min(1,aspect);
  const orbPoint=new T.Vector3(state.x,1.45,state.z),close=orbPoint.clone().add(new T.Vector3(0,2.4,5));
  const wide=new T.Vector3(state.x*.3,18*distance,state.z*.3+20*distance);
  const unfold=state.target===1?1:T.MathUtils.smoothstep(progress,.6,1);
  r.camera.position.copy(close).lerp(wide,motionReduced?1:unfold);
  const roomLook=orbPoint.clone().lerp(new T.Vector3(state.x*.25,0,state.z*.25-1),motionReduced?1:unfold);
  r.camera.lookAt(roomLook);
  const doorway=entry||{x:sites[state.index].x,z:sites[state.index].z,height:.35,dx:0,dz:1};
  const focus=new T.Vector3(sites[state.index].x,doorway.height+1.45,sites[state.index].z);
  if(!motionReduced&&state.target===1){
   // Door normals are rotated 45 degrees with the exterior temple.
   // Align outside the pillars first, then travel straight through the opening.
   const angle=Math.PI/4+Math.round((Math.atan2(doorway.dx,doorway.dz)-Math.PI/4)/(Math.PI/2))*Math.PI/2;
   const normal=new T.Vector3(Math.sin(angle),0,Math.cos(angle));
   const ease=u=>{u=T.MathUtils.clamp(u,0,1);return u*u*u*(u*(u*6-15)+10);};
   const align=ease(progress/.3),through=ease((progress-.3)/.36);
   const outside=focus.clone().addScaledVector(normal,9);outside.y+=3;
   const inside=focus.clone().addScaledVector(normal,.6);
   const aligned=outside.clone().lerp(inside,through);
   hallCamera.position.copy(startCamera.position).lerp(aligned,align);
   aimCamera.position.copy(hallCamera.position);aimCamera.up.copy(hallCamera.up);aimCamera.lookAt(focus);
   hallCamera.quaternion.copy(startCamera.quaternion).slerp(aimCamera.quaternion,align);
  }
  if(state.target===1){placeScreenPoint(hallCamera,hallOrb,anchor);}

  pinScreenPoint(r.camera,roomOrigin,roomOrigin);
  if(mobileFraming.matches && state.target===1){
   // Fit the floor and pillar caps within the viewport at the overview angle.
   r.camera.updateMatrixWorld();
   const tangent=Math.tan(T.MathUtils.degToRad(r.camera.fov/2));
   let shift=-Infinity;
   const portrait=aspect<1;
   const horizontalLimit=1-2*Math.min(12,innerWidth*.025)/innerWidth;
   for(const corner of (portrait?frontCaps:roomBounds)){
    viewCorner.copy(corner).applyMatrix4(r.camera.matrixWorldInverse);
    if(portrait){shift=Math.max(shift,viewCorner.z+Math.abs(viewCorner.x)/(horizontalLimit*aspect*tangent));continue;}
    shift=Math.max(shift,viewCorner.z+Math.abs(viewCorner.x)/(1.035*aspect*tangent),
     viewCorner.z+Math.abs(viewCorner.y)/(1.035*tangent));
   }
   r.camera.translateZ(shift*T.MathUtils.smoothstep(progress,.35,1));
   if(portrait){
    // Move the overview down by up to 30 CSS pixels before blending into reading mode.
    r.camera.updateMatrixWorld();
    viewCorner.set(0,0,0).applyMatrix4(r.camera.matrixWorldInverse);
    const offset=Math.min(30,innerHeight*.043)*2/innerHeight;
    r.camera.translateY(-viewCorner.z*tangent*offset*T.MathUtils.smoothstep(progress,.35,1));
   }
   r.camera.updateMatrixWorld();
  }
  placeScreenPoint(r.camera,r.orb,anchor,progress<1?1:roomSettle);

  readingFollow=T.MathUtils.damp(readingFollow,progress===1&&roomSettle<=.15&&pages.mode==='reading'?1:0,1.5,lastDt);
  // Preserve the orb's world position and size; the entire room moves closer through the camera.
  if(state.target===1)matchScreenRadius(hallCamera,hallOrb,anchorRadius);matchScreenRadius(r.camera,r.orb,anchorRadius);
  const focusPoint=r.orb.position.clone();
  const mobileFilm=screenshotOrb.mobileVideoOpen;
  if(mobileFilmBlend!==Number(mobileFilm)){
   mobileFilmBlend=T.MathUtils.damp(mobileFilmBlend,Number(mobileFilm),7,lastDt);
   if(motionReduced||Math.abs(mobileFilmBlend-Number(mobileFilm))<.001)mobileFilmBlend=Number(mobileFilm);
  }
  const readingRadius=T.MathUtils.lerp(.27*aspect,Math.min(.86*aspect,.65),mobileFilmBlend);
  const framingDistance=screenRadius(r.camera,r.orb)/readingRadius;
  r.camera.position.lerp(focusPoint.clone().add(r.camera.position.clone().sub(focusPoint).multiplyScalar(framingDistance)),readingFollow);
  const desiredReadingAnchor=new T.Vector3(mobileFilm?0:pages.orbAnchor.x,mobileFilm ? .08 : pages.orbAnchor.y,0);
  // Move only the camera between editorial lanes; the orb stays at its pedestal.
  readingAnchor.lerp(desiredReadingAnchor,motionReduced?1:1-Math.exp(-4*lastDt));
  pinScreenPoint(r.camera,focusPoint,readingAnchor,readingFollow);
  if(state.target===0&&!motionReduced&&exitCamera){
   // Two joined Bezier segments share a nonzero tangent at alignment.
   // The final segment stays on the doorway centreline, with no mid-flight stop.
   const ease=u=>{u=T.MathUtils.clamp(u,0,1);return u*u*u*(u*(u*6-15)+10);};
   const travel=T.MathUtils.clamp((1-progress)/.86,0,1),align=ease(travel*2);
   const inside=exitNormal.clone().multiplyScalar(-18);inside.y=3.5;
   const outside=exitNormal.clone().multiplyScalar(11);outside.y=3.5;
   const tangent=exitNormal.clone().multiplyScalar(29/3);
   const u=travel<.5?travel*2:(travel-.5)*2,v=1-u;
   const p0=travel<.5?exitCamera.position:inside;
   const p1=travel<.5?exitCamera.position:inside.clone().add(tangent);
   const p2=travel<.5?inside.clone().sub(tangent):outside;
   const p3=travel<.5?inside:outside;
   r.camera.position.copy(p0).multiplyScalar(v*v*v).addScaledVector(p1,3*v*v*u).addScaledVector(p2,3*v*u*u).addScaledVector(p3,u*u*u);
   aimCamera.position.copy(r.camera.position);aimCamera.up.copy(exitCamera.up);
   const aim=exitNormal.clone().multiplyScalar(10);aim.y=3.5;
   if(r.camera.position.dot(exitNormal)>=9.9)aim.copy(r.camera.position).add(exitNormal);
   aimCamera.lookAt(aim);
   r.camera.quaternion.copy(exitCamera.quaternion).slerp(aimCamera.quaternion,align);
   if(exitNormal.z>.5){
    // The overview already faces the bottom doorway from outside. Preserve
    // that view rather than crossing the entire room and turning 180 degrees.
    const t=ease(travel),v=1-t;
    const end=new T.Vector3(0,3.5,9.3);
    const control1=exitCamera.position.clone();control1.y=T.MathUtils.lerp(control1.y,3.5,.45);
    const control2=new T.Vector3(0,3.5,14);
    r.camera.position.copy(exitCamera.position).multiplyScalar(v*v*v).addScaledVector(control1,3*v*v*t).addScaledVector(control2,3*v*t*t).addScaledVector(end,t*t*t);
    const initialAim=exitCamera.position.clone().add(exitCamera.getWorldDirection(new T.Vector3()).multiplyScalar(25));
    const aim=initialAim.lerp(new T.Vector3(0,3.5,0),ease(travel/.45));
    r.camera.lookAt(aim);
   }
  }
  r.camera.updateMatrixWorld();
  r.companionLight.position.copy(r.orb.position).add(new T.Vector3(0,1.5,0));
  pages.setInputReady(readingFollow>=.95);r.orb.material.uniforms.readingFlow.value=readingFollow;r.orb.material.uniforms.scrollPhase.value=T.MathUtils.damp(r.orb.material.uniforms.scrollPhase.value,pages.progress,3,lastDt);
  if(progress>=1)roomSettle=Math.max(0,roomSettle-lastDt*1.25);
  const exitPoint=new T.Vector3(10,.15,0).project(r.camera);
  pages.update(state.index,progress===1&&state.target===1&&roomSettle<=.15&&!document.body.classList.contains('quick-nav-open'),{x:(exitPoint.x*.5+.5)*innerWidth,y:(-.5*exitPoint.y+.5)*innerHeight,z:exitPoint.z});
  screenshotOrb.update(r.camera,r.orb,pages.mode==='reading'&&progress>=1&&!document.body.classList.contains('quick-nav-open'));
  if(progress>=1){renderCloudScene(renderer,r.scene,r.camera);return}
  if(progress<=.02&&!motionReduced&&state.target===1){renderCloudScene(renderer,hall,hallCamera);return}
  const size=renderer.getDrawingBufferSize(new T.Vector2());
  if(a.image.width!==size.x||a.image.height!==size.y){a.dispose();b.dispose();a=new T.FramebufferTexture(size.x,size.y);b=new T.FramebufferTexture(size.x,size.y);material.uniforms.hall.value=a;material.uniforms.room.value=b;}
  // Capture the same display-ready rendering used once the transition completes.
  // This keeps tone mapping, transparent glows and lighting identical on both sides.
  renderer.setRenderTarget(null);
  const entering=state.target===1,phase=entering?progress:1-progress;
  // The destination's shader weight is exactly zero until phase .68.
  const needsDestination=motionReduced || phase>.68;
  if(entering || needsDestination){renderCloudScene(renderer,hall,hallCamera);renderer.copyFramebufferToTexture(a);}
  if(!entering || needsDestination){renderCloudScene(renderer,r.scene,r.camera);renderer.copyFramebufferToTexture(b);}
  material.uniforms.mixAmount.value=motionReduced?progress:T.MathUtils.smoothstep(progress,.28,.82);
  material.uniforms.reduced.value=motionReduced?1:0;material.uniforms.aspect.value=aspect;
  material.uniforms.entrance.value=motionReduced?0:1;
  material.uniforms.exiting.value=state.target===0?1:0;
  material.uniforms.phase.value=state.target===1?progress:1-progress;
  const lightPoint=state.target===1?focus.clone().project(hallCamera):exitNormal.clone().multiplyScalar(10).setY(2.4).project(r.camera);material.uniforms.lightCenter.value.set(lightPoint.x*.5+.5,lightPoint.y*.5+.5);
  material.uniforms.lightColour.value.set(sites[state.index].color).lerp(new T.Color('#fffef2'),.88);
  renderer.render(screen,camera);
 }

 return {state,enter,leave,move,update,render,hideArrivalOrb(){deferOrb=true;if(state.index>=0)rooms[state.index].orb.visible=false;},returnImmediately(){pages.reset();selection=null;document.body.classList.remove('interior-active');if(state.index>=0){state.index=-1;state.blend=0;settle=0;exitReveal=0;reveal=0;deferOrb=false;entry?.prepareExit?.();orbMaterial.uniforms.glitch.value=0;onExit();}},get near(){return near}};
}
