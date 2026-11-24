import {createFireflyCollisions,clearsOrb} from './firefly-collisions.js?v=spacing237';
import * as T from 'three';

// Small additive sprites share one draw call; no extra dynamic lights or textures.
export function createFireflies(scene,navigation){
 // Sample variation once so flight stays continuous rather than jittering each frame.
 const random=(min,max)=>min+Math.random()*(max-min);
 const formations=[{count:3,spread:.45},{count:10,spread:1.8},{count:5,spread:.7},{count:12,spread:2},{count:4,spread:.6},{count:8,spread:1.3}];
 const origins=[[-18,-13],[18,-14],[-22,13],[20,16],[0,-23],[1,20]];
 const swarms=origins.map(([x,z],index)=>{
  let home=null;
  for(let radius=0;radius<=20&&!home;radius+=.5)for(let step=0;step<24&&!home;step++){
   const px=x+Math.cos(step*Math.PI/12)*radius,pz=z+Math.sin(step*Math.PI/12)*radius;
   const heights=navigation.surfaces(px,pz);
   if(heights.length)home=new T.Vector3(px,Math.max(...heights)+2.1,pz);
  }
  if(!home)return null;
  const formation=formations[index];
  return {count:formation.count,spread:formation.spread*random(.9,1.1),home,center:home.clone(),target:home.clone(),phase:random(0,Math.PI*2),driftX:random(.035,.075),driftZ:random(.04,.085),driftSpeed:random(.18,.3),velocity:new T.Vector3(),roamHeight:home.y,following:0,cooldown:0};
 }).filter(Boolean);
 let count=0;for(const swarm of swarms){swarm.start=count;count+=swarm.count;}
 const positions=new Float32Array(count*3),seeds=new Float32Array(count),sizes=new Float32Array(count),motion=[];
 const localPose=new T.Vector3();
 function sampleFlight(m,time,out){
  out.set(m.x+Math.sin(time*m.fx+m.px)*m.ax+Math.sin(time*m.fx*.43+m.pz)*.16,
   m.y+Math.sin(time*m.fy+m.py)*m.ay,
   m.z+Math.sin(time*m.fz+m.pz)*m.az+Math.cos(time*m.fz*.61+m.px)*.14);
 }
 for(let i=0;i<count;i++){
  const swarm=swarms.find(s=>i>=s.start&&i<s.start+s.count);
  const m={x:random(-.8,.8),y:random(-.25,.25),z:random(-.8,.8),ax:random(.28,.7),ay:random(.15,.38),az:random(.25,.72),fx:random(.12,.3),fy:random(.18,.36),fz:random(.13,.29),px:random(0,Math.PI*2),py:random(0,Math.PI*2),pz:random(0,Math.PI*2)};
  m.x*=swarm.spread;m.z*=swarm.spread;m.ax*=swarm.spread;m.az*=swarm.spread;
  // Validate the actual starting position of every insect, not just its group centre.
  let surfaces=[];
  for(let attempt=0;attempt<48;attempt++){
   sampleFlight(m,0,localPose);surfaces=navigation.surfaces(swarm.home.x+localPose.x,swarm.home.z+localPose.z);
   if(surfaces.length)break;
   m.x=random(-.8,.8)*swarm.spread;m.z=random(-.8,.8)*swarm.spread;
  }
  if(!surfaces.length){sampleFlight(m,0,localPose);m.x-=localPose.x;m.z-=localPose.z;surfaces=navigation.surfaces(swarm.home.x,swarm.home.z);}
  sampleFlight(m,0,localPose);m.y+=Math.max(...surfaces)+2.1-(swarm.home.y+localPose.y);
  motion.push(m);seeds[i]=random(0,100);sizes[i]=random(.11,.164);
  // Begin on each insect's own trajectory: no startup ring or shared settling motion.
  sampleFlight(m,0,localPose);
  positions.set([swarm.home.x+localPose.x,swarm.home.y+localPose.y,swarm.home.z+localPose.z],i*3);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geometry.setAttribute('seed',new T.BufferAttribute(seeds,1));geometry.setAttribute('size',new T.BufferAttribute(sizes,1));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,toneMapped:false,uniforms:{time:{value:0},pixelScale:{value:innerHeight},visibility:{value:1}},vertexShader:`
 attribute float seed;attribute float size;uniform float pixelScale;varying float phase;
 void main(){phase=seed;vec4 view=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*view;gl_PointSize=clamp(size*pixelScale/max(1.,-view.z)*3.5,2.,28.);}`,
 fragmentShader:`uniform float time;uniform float visibility;varying float phase;
 void main(){float r=length(gl_PointCoord-.5)*2.;float halo=exp(-r*r*5.)*.26;float core=exp(-r*r*65.);float individuality=fract(sin(phase*12.9898+3.17)*43758.5453);float rhythm=mix(.48,.91,individuality);float offset=phase*2.37+individuality*6.28318;float breath=.5+.5*sin(time*rhythm+offset+.22*sin(time*.17+phase));float pulse=.48+.52*breath*breath;vec3 tint=mix(vec3(.69,1.,.52),vec3(1.,.82,.39),.5+.5*sin(phase));gl_FragColor=vec4(mix(tint,vec3(1.,1.,.85),core),(halo+core*.9)*pulse*visibility*(1.-smoothstep(.8,1.,r)));}`});
 const group=new T.Points(geometry,material);group.name='Curious firefly swarms';group.frustumCulled=false;scene.add(group);
 const collisions=createFireflyCollisions(scene),previousPosition=new T.Vector3(),slide=new T.Vector3();
 const previousOrb=new T.Vector3(),direction=new T.Vector3(),orbMotion=new T.Vector3(),desiredVelocity=new T.Vector3(),desired=new T.Vector3(),delta=new T.Vector3();let initialized=false,clock=0,spawnChecked=false;
 const ahead=new T.Vector3();
 const detours=Array.from({length:count},()=>({time:0,direction:new T.Vector3()}));
 function update(dt,t,orb,active,reduced,pixelScale){
  group.visible=active&&!document.body.classList.contains('is-loading');if(!group.visible){initialized=false;return;}
  collisions.prepare();
  if(!spawnChecked){
   spawnChecked=true;
   for(const swarm of swarms){if(!collisions.occupied(swarm.center))continue;let found=false;
    for(let radius=.5;radius<12&&!found;radius+=.5)for(let j=0;j<24&&!found;j++){
     const angle=j*Math.PI/12,x=swarm.center.x+Math.cos(angle)*radius,z=swarm.center.z+Math.sin(angle)*radius,heights=navigation.surfaces(x,z);if(!heights.length)continue;
     slide.set(x,Math.max(...heights)+2.1,z);if(collisions.occupied(slide))continue;
     delta.copy(slide).sub(swarm.center);for(let i=swarm.start;i<swarm.start+swarm.count;i++){positions[i*3]+=delta.x;positions[i*3+1]+=delta.y;positions[i*3+2]+=delta.z;}
     swarm.center.copy(slide);swarm.roamHeight=slide.y;found=true;
    }
   }
   for(let i=0;i<count;i++){const k=i*3;previousPosition.fromArray(positions,k);if(!collisions.occupied(previousPosition))continue;
    let found=false;for(let radius=.5;radius<12&&!found;radius+=.5)for(let j=0;j<24&&!found;j++){
     const angle=j*Math.PI/12,x=previousPosition.x+Math.cos(angle)*radius,z=previousPosition.z+Math.sin(angle)*radius,heights=navigation.surfaces(x,z);if(!heights.length)continue;
     slide.set(x,Math.max(...heights)+2.1,z);if(collisions.occupied(slide))continue;
     motion[i].x+=slide.x-previousPosition.x;motion[i].y+=slide.y-previousPosition.y;motion[i].z+=slide.z-previousPosition.z;slide.toArray(positions,k);found=true;
    }
   }
  }
  material.uniforms.pixelScale.value=pixelScale;
  if(!reduced)clock+=dt;material.uniforms.time.value=reduced?0:t;
  if(!initialized){previousOrb.copy(orb);initialized=true;}
  orbMotion.copy(orb).sub(previousOrb);orbMotion.y=0;if(orbMotion.lengthSq()>.00001){orbMotion.normalize();direction.lerp(orbMotion,1-Math.exp(-dt*1.2));}
  previousOrb.copy(orb);
  const steering=1-Math.exp(-dt*.85),flight=1-Math.exp(-dt*1.6);
  swarms.forEach((swarm,g)=>{
   swarm.cooldown=Math.max(0,swarm.cooldown-dt);
   const distance=swarm.center.distanceTo(orb);
   if(!reduced&&swarm.following<=0&&swarm.cooldown===0&&distance<4.6){swarm.following=4.5;swarm.cooldown=14;}
   const wasFollowing=swarm.following>0;
   swarm.following=Math.max(0,swarm.following-dt);
   // Continue from the release point; the original spawning point is never a destination.
   if(wasFollowing&&swarm.following===0)swarm.roamHeight=swarm.center.y;
   if(swarm.following>0&&!reduced){
    swarm.target.copy(orb).addScaledVector(direction,-2.6);
    swarm.target.x+=Math.cos(clock*.16+swarm.phase)*1.7;swarm.target.z+=Math.sin(clock*.16+swarm.phase)*1.7;swarm.target.y+=.65;
    desiredVelocity.copy(swarm.target).sub(swarm.center).multiplyScalar(.35).clampLength(0,.85);
   }else{
    // Slow meandering motion around the current location, not a return-to-home arc.
    desiredVelocity.set(Math.cos(clock*swarm.driftX+swarm.phase)*swarm.driftSpeed,(swarm.roamHeight+Math.sin(clock*.13+swarm.phase)*.3-swarm.center.y)*.2,Math.sin(clock*swarm.driftZ+swarm.phase*1.7)*swarm.driftSpeed);
    swarm.target.copy(swarm.center).add(desiredVelocity);
   }
   if(!reduced){
    if(swarm.avoidTime>0){swarm.avoidTime-=dt;desiredVelocity.copy(swarm.avoidDirection).multiplyScalar(.28);}
    ahead.copy(swarm.center).addScaledVector(desiredVelocity,5);
    if(!collisions.clear(swarm.center,ahead)){
     for(let a=0;a<32;a++){const angle=swarm.phase+a*2.399963;delta.set(Math.cos(angle),a%4===0?.9:a%4===1?-.6:.15,Math.sin(angle)).normalize();ahead.copy(swarm.center).addScaledVector(delta,1.8);
      if(collisions.clear(swarm.center,ahead)){swarm.avoidDirection=delta.clone();swarm.avoidTime=7;desiredVelocity.copy(delta).multiplyScalar(.28);swarm.following=0;swarm.cooldown=10;break;}
     }
    }
    swarm.velocity.lerp(desiredVelocity,steering);slide.copy(swarm.center).addScaledVector(swarm.velocity,dt);
    if(collisions.clear(swarm.center,slide))swarm.center.copy(slide);
    else {swarm.phase+=dt*.6;swarm.velocity.multiplyScalar(.9);swarm.following=0;swarm.cooldown=Math.max(swarm.cooldown,3);}
   }
   for(let j=0;j<swarm.count;j++){
    const i=swarm.start+j,k=i*3,phase=seeds[i];
    sampleFlight(motion[i],clock,desired);desired.add(swarm.center);
    // Give every nearby visitor/NPC the same anticipatory breathing room.
    for(const body of navigation.orbs||[]){
     if(body.owner==='player')continue;
     delta.set(desired.x-body.x,desired.y-body.y,desired.z-body.z);const distance=delta.length(),reach=body.radius+1;
     if(distance<reach){if(distance<.001)delta.set(Math.cos(phase),.35,Math.sin(phase));desired.addScaledVector(delta.normalize(),(reach-distance)*.8);}
    }
    delta.copy(desired).sub(orb);const d=delta.length();
    if(d<2.7){if(d<.001)delta.set(Math.cos(phase),.35,Math.sin(phase));delta.normalize();desired.addScaledVector(delta,(2.7-d)*.75);}
    desired.set(positions[k]+(desired.x-positions[k])*(reduced?1:flight),positions[k+1]+(desired.y-positions[k+1])*(reduced?1:flight),positions[k+2]+(desired.z-positions[k+2])*(reduced?1:flight));
    delta.copy(desired).sub(orb);if(delta.lengthSq()<1.05*1.05){if(delta.lengthSq()<.00001)delta.set(Math.cos(phase),.35,Math.sin(phase));desired.copy(orb).addScaledVector(delta.normalize(),1.05);}
    previousPosition.set(positions[k],positions[k+1],positions[k+2]);
    const detour=detours[i],wasDetouring=detour.time>0;detour.time=Math.max(0,detour.time-dt);
    if(wasDetouring&&detour.time===0){sampleFlight(motion[i],clock,localPose);motion[i].x+=previousPosition.x-swarm.center.x-localPose.x;motion[i].y+=previousPosition.y-swarm.center.y-localPose.y;motion[i].z+=previousPosition.z-swarm.center.z-localPose.z;desired.copy(previousPosition);}
    if(detour.time>0&&!reduced)desired.copy(previousPosition).addScaledVector(detour.direction,dt*.42);
    const clearOrbs=point=>clearsOrb(previousPosition,point,orb.x,orb.y,orb.z,1.05)&&(navigation.orbs||[]).every(body=>body.owner==='player'||clearsOrb(previousPosition,point,body.x,body.y,body.z,body.radius+.18));
    if(!clearOrbs(desired)||!collisions.clear(previousPosition,desired)){
     // Choose a short clear detour, including away/upward directions; never accept a zero-length "slide".
     let found=false;const step=Math.max(.003,Math.min(.025,dt*.42));
     for(let attempt=0;attempt<26;attempt++){
      const angle=phase+attempt*2.399963,vertical=attempt%3===0?.65:attempt%3===1?-.35:.05;
      delta.set(Math.cos(angle),vertical,Math.sin(angle)).normalize();slide.copy(previousPosition).addScaledVector(delta,step);
      ahead.copy(previousPosition).addScaledVector(delta,.9);
      if(clearOrbs(slide)&&collisions.clear(previousPosition,ahead)&&collisions.clear(previousPosition,slide)){desired.copy(slide);detour.direction.copy(delta);detour.time=4;found=true;break;}
     }
     if(!found)desired.copy(previousPosition);

    }
    positions[k]=desired.x;positions[k+1]=desired.y;positions[k+2]=desired.z;
   }
  });
  geometry.attributes.position.needsUpdate=true;
 }
 return {group,swarms,update};
}
