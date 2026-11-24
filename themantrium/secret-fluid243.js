import {createInteriorStoneWear} from './stone-wear.js?v=spacing237';
import {crossings,coordinates} from './navigation.js?v=spacing237';
import {createInteriorAtmosphere} from './interior-atmosphere.js?v=spacing237';
import {createClouds} from './clouds-fluid243.js';
import {interiorMaterials,stoneUV} from './interior-surfaces.js?v=spacing237';
import * as T from 'three';
export const SECRET_FLOOR=-3.65;
// The central crossing alone settles; the outer emblem retains its footprint.
export function settledHeight(x,z,y,amount){
 return y>SECRET_FLOOR?T.MathUtils.lerp(y,SECRET_FLOOR,amount):y;
}
export function createSecret(scene,structure,stone){
 let exitTime=-1,exitReveal=0;
 const state={phase:'locked',elapsed:0,amount:0,radius:{value:0},fall:0,arrival:0};
 const shapes=structure.filter(m=>m.userData.secretBridge).map(m=>({m,original:m.geometry.attributes.position.array.slice()}));
 const materials=new Set(structure.map(m=>m.material));
 for(const mat of materials){const before=mat.onBeforeCompile;mat.onBeforeCompile=function(s){before.call(this,s);s.uniforms.secretRadius=state.radius;s.vertexShader='varying vec2 secretXZ;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nsecretXZ=(modelMatrix*vec4(transformed,1.)).xz;');s.fragmentShader='uniform float secretRadius; varying vec2 secretXZ;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(secretRadius>0. && length(secretXZ)<secretRadius) discard;');};mat.customProgramCacheKey=()=> 'secret-aperture-v1';mat.needsUpdate=true;}
 const rim=new T.Mesh(new T.TorusGeometry(1.9,.08,12,96),new T.MeshStandardMaterial({color:'#d7cdab',emissive:'#84b5ae',emissiveIntensity:.5}));rim.rotation.x=Math.PI/2;rim.position.y=SECRET_FLOOR-.08;rim.visible=false;scene.add(rim);
 const shaft=new T.Mesh(new T.CylinderGeometry(1.9,1.9,15,64,1,true),new T.MeshStandardMaterial({color:'#172929',side:T.BackSide,roughness:1}));shaft.position.y=SECRET_FLOOR-7.5;shaft.visible=false;scene.add(shaft);
 const apertureLight=new T.Group();apertureLight.visible=false;scene.add(apertureLight);
 const spill=new T.PointLight('#d4fff0',0,16,2);spill.position.set(0,SECRET_FLOOR+.8,0);apertureLight.add(spill);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(218,255,240,.75)');gradient.addColorStop(.3,'rgba(158,231,210,.25)');gradient.addColorStop(1,'rgba(134,218,204,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const glow=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0}));glow.position.set(0,SECRET_FLOOR+.35,0);glow.scale.set(8,8,1);apertureLight.add(glow);
 shaft.material.emissive=new T.Color('#7ac9b7');shaft.material.emissiveIntensity=.35;
 const chamber=new T.Group();chamber.visible=false;scene.add(chamber);
 const atmosphere=createInteriorAtmosphere(chamber,{floorY:-62,round:true,extraAnchors:Array.from({length:12},(_,i)=>({x:Math.cos(i*Math.PI/6)*1.03,z:Math.sin(i*Math.PI/6)*1.03,y:-60.79,width:.24,height:9}))});
 const chamberMaterials=interiorMaterials('#b1bfa9');chamberMaterials.stone.color.set('#c8cfca');chamberMaterials.floor.color.set('#d1d8ce');const mist=createClouds(chamber,{interior:true});mist.group.position.y=-62;for(const veil of mist.group.children)if(veil.material.uniforms?.strength)veil.material.uniforms.strength.value=.21;
 const pearlFill=new T.HemisphereLight('#e7ddff','#b5c9c2',.38);chamber.add(pearlFill);
 const guruLight=new T.PointLight('#fff0d2',22,12,2);guruLight.position.set(0,-57.8,0);chamber.add(guruLight);
 const roseLight=new T.PointLight('#f1d4e3',14,15,2);roseLight.position.set(-5,-56,-5);chamber.add(roseLight);
 const blueLight=new T.PointLight('#cbe9f4',16,15,2);blueLight.position.set(6,-56,3);chamber.add(blueLight);
 const moteBase=[],motePositions=new Float32Array(54*3);for(let i=0;i<54;i++){const a=i*2.39996,r=3.4+(i%7)*.65;moteBase.push([Math.cos(a)*r,-60+(i%9)*.75,Math.sin(a)*r]);motePositions.set(moteBase[i],i*3);}
 const moteGeometry=new T.BufferGeometry();moteGeometry.setAttribute('position',new T.BufferAttribute(motePositions,3));const motes=new T.Points(moteGeometry,new T.PointsMaterial({color:'#f8eedb',map:new T.CanvasTexture(glowCanvas),size:.13,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending}));chamber.add(motes);
 const floor=new T.Mesh(stoneUV(new T.CylinderGeometry(10,10,.5,64)),chamberMaterials.floor);floor.position.y=-62.25;chamber.add(floor);createInteriorStoneWear(chamber,4,-62,true);
 const walls=new T.Mesh(stoneUV(new T.CylinderGeometry(10,10,11,64,1,true)),chamberMaterials.stone);walls.material=walls.material.clone();walls.material.side=T.BackSide;walls.position.y=-56.5;chamber.add(walls);
 const light=new T.PointLight('#c5e5dd',90,25,1.4);light.position.set(0,-54,0);chamber.add(light);
 const ring=new T.Mesh(new T.TorusGeometry(8,.035,8,96),new T.MeshBasicMaterial({color:'#a1bfb5'}));ring.rotation.x=Math.PI/2;ring.position.y=-61.97;chamber.add(ring);

 // Three equal circular treads lead to Guru's central dais.
 const STEP=.22;
 for(let i=0;i<3;i++){const h=STEP*(i+1),m=new T.Mesh(stoneUV(new T.CylinderGeometry(2.5-i*.45,2.5-i*.45,h,96)),chamberMaterials.stone);m.position.y=-62+h/2;chamber.add(m);}
 const dais=new T.Mesh(stoneUV(new T.CylinderGeometry(1.15,1.15,.55,96)),chamberMaterials.stone);dais.position.y=-62+.66+.275;chamber.add(dais);
 const trim=new T.Mesh(new T.TorusGeometry(1.14,.025,8,96),new T.MeshStandardMaterial({color:'#d7ca9d',emissive:'#c8d8b5',emissiveIntensity:.3}));trim.rotation.x=Math.PI/2;trim.position.y=-60.78;chamber.add(trim);
 const ladder=new T.Group();ladder.position.set(7,-62,-6.3);ladder.rotation.y=Math.atan2(7,-6.3);chamber.add(ladder);
 const ladderMaterial=new T.MeshStandardMaterial({color:'#bdac7c',metalness:.62,roughness:.48});
 for(const x of [-.5,.5]){const rail=new T.Mesh(new T.CylinderGeometry(.065,.065,13,12),ladderMaterial);rail.position.set(x,6.5,0);ladder.add(rail);}
 for(let i=0;i<28;i++){const rung=new T.Mesh(new T.CylinderGeometry(.055,.055,1.1,12),ladderMaterial);rung.rotation.z=Math.PI/2;rung.position.set(0,.25+i*.44,.03);ladder.add(rung);}
 const exitLabel=document.createElement('button');exitLabel.className='sanctum-exit-label';exitLabel.innerHTML='Return to the Mantrium <span aria-hidden="true"></span>';exitLabel.hidden=true;document.body.append(exitLabel);const exitLine=document.createElement('div');exitLine.className='sanctum-exit-connector';exitLine.hidden=true;document.body.append(exitLine);exitLabel.onclick=()=>requestExit();
 function requestExit(){if(state.phase==='chamber'&&exitTime<0){exitTime=0;document.querySelectorAll('#hud #zone,#hud #objective,#hud #hint').forEach(element=>{const opacity=getComputedStyle(element).opacity;element.getAnimations().forEach(animation=>animation.cancel());element.animate([{opacity},{opacity:0}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?160:750,easing:'ease-out',fill:'forwards'});});exitLabel.hidden=true;exitLine.hidden=true;}}
 function floorHeight(x,z){const r=Math.hypot(x,z);return -62+(r<1.15?1.21:r<1.6?.66:r<2.05?.44:r<2.5?.22:0);}
 function move(player,dx,dz){if(exitTime>=0)return;const x=player.x+dx,z=player.z+dz;if(Math.hypot(x,z)<9.1&&Math.hypot(x,z)>1.1){player.x=x;player.z=z;player.height=floorHeight(x,z);}if(Math.hypot(player.x-ladder.position.x,player.z-ladder.position.z)<1.25)requestExit();}
 function updateLabel(camera){camera.updateMatrixWorld(true);ladder.updateWorldMatrix(true,false);exitLabel.hidden=state.phase!=='chamber'||exitTime>=0||state.arrival<1.8;exitLine.hidden=true;if(exitLabel.hidden)return;const rails=[-.5,.5].map(x=>ladder.localToWorld(new T.Vector3(x,2.01,0)).project(camera)),p=rails[0].x>rails[1].x?rails[0]:rails[1];exitLabel.hidden=p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;if(exitLabel.hidden)return;const x=(p.x*.5+.5)*innerWidth,y=(-p.y*.5+.5)*innerHeight;const left=innerWidth<=650?Math.max(12,Math.min(innerWidth-exitLabel.offsetWidth-12,x+26)):x+26,top=Math.max(innerWidth<=650?innerHeight*.52:90,Math.min(innerHeight-80,y-exitLabel.offsetHeight/2));exitLabel.style.left=left+'px';exitLabel.style.top=top+'px';const fromX=left,fromY=top+exitLabel.offsetHeight/2;exitLine.hidden=false;exitLine.style.left=fromX+'px';exitLine.style.top=fromY+'px';exitLine.style.width=Math.hypot(x-fromX,y-fromY)+'px';exitLine.style.transform='rotate('+Math.atan2(y-fromY,x-fromX)+'rad)';}

 let outside=[];
 function bridgeHeight(x,z,y,id){if((id===102||id===106)&&coordinates(crossings[id-100],x,z).along<0)return y;return settledHeight(x,z,y,state.amount);}
 function deform(){for(const {m,original} of shapes){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,bridgeHeight(original[i*3],original[i*3+2],original[i*3+1],m.userData.secretCrossing===undefined?9:100+m.userData.secretCrossing));p.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();}}
 let sharedEntryGuard=false;
 function unlock(shared=false){if(state.phase!=='locked')return false;sharedEntryGuard=shared;state.phase='lowering';state.elapsed=0;return true}
 function update(dt,player){
  const hadReveal=exitReveal>0;exitReveal=Math.max(0,exitReveal-dt);state.justReturned=hadReveal&&exitReveal===0;if(exitTime>=0){exitTime+=dt;if(exitTime>=1.1){leave(player);exitReveal=1.2;}return;}
  if(chamber.visible){const t=performance.now()/1000;for(let i=0;i<moteBase.length;i++){const b=moteBase[i];moteGeometry.attributes.position.setXYZ(i,b[0]+Math.sin(t*.12+i)*.3,b[1]+Math.sin(t*.1+i*1.7)*.35,b[2]+Math.cos(t*.09+i)*.3);}moteGeometry.attributes.position.needsUpdate=true;guruLight.intensity=22+Math.sin(t*.18)*1.2;atmosphere.update(performance.now()/1000,false);mist.update(performance.now()/1000,false,undefined,false,player);}
  if(state.phase==='lowering'){state.elapsed+=dt;state.amount=T.MathUtils.smoothstep(state.elapsed,0,4);deform();if(state.elapsed>=4){state.phase='opening';state.elapsed=0;}}
  else if(state.phase==='opening'){state.elapsed+=dt;state.radius.value=1.9*T.MathUtils.smoothstep(state.elapsed,0,2);rim.visible=shaft.visible=apertureLight.visible=true;spill.intensity=65*state.radius.value/1.9;glow.material.opacity=.5*state.radius.value/1.9;rim.scale.setScalar(Math.max(.001,state.radius.value/1.9));if(state.elapsed>=2)state.phase='open';}
  if(state.phase==='open'&&Math.hypot(player.x,player.z)>=1.2)sharedEntryGuard=false;
  if(state.phase==='open'&&!sharedEntryGuard&&Math.hypot(player.x,player.z)<1.2){state.phase='falling';state.fall=0;}
  if(state.phase==='chamber')state.arrival+=dt;
  if(state.phase==='falling'){state.fall+=dt;player.x*=Math.exp(-dt*3);player.z*=Math.exp(-dt*3);player.height-=Math.min(20,state.fall*9)*dt;if(player.height<=-62){player.height=-62;state.phase='chamber';state.arrival=0;player.x=0;player.z=4.2;outside=scene.children.filter(o=>o!==chamber&&(o.isMesh||o.isGroup||o.isPoints)&&o.visible);outside.forEach(o=>o.visible=false);chamber.visible=true;}}
 }
 function leave(player){document.querySelectorAll('#hud #zone,#hud #objective,#hud #hint').forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));exitTime=-1;exitLabel.hidden=true;exitLine.hidden=true;if(!['falling','chamber'].includes(state.phase))return;outside.forEach(o=>o.visible=true);chamber.visible=false;state.phase='open';player.x=3;player.z=0;player.height=SECRET_FLOOR;}
 return {requestExit,move,updateLabel,get exiting(){return exitTime>=0||exitReveal>0;},get glitch(){return exitTime>=0?Math.min(1,exitTime/.4):exitReveal>0?Math.min(1,exitReveal/.5):0;},get orbHidden(){return exitTime>=.4||exitReveal>.5;},get fade(){if(exitTime>=0)return T.MathUtils.smoothstep(exitTime,.4,1.1);if(exitReveal>0)return T.MathUtils.smoothstep(exitReveal,.3,1.2);return state.phase==='falling'?T.MathUtils.smoothstep(state.fall,1.6,3):state.phase==='chamber'?1-T.MathUtils.smoothstep(state.arrival,.2,1.8):0},state,unlock,update,leave,chamber,height:bridgeHeight};
}
