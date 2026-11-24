import * as T from 'three';
// Layered, world-space mist: the camera travels through the cloud deck.
export function createClouds(scene,{interior=false}={}){
 const group=new T.Group();group.userData.softClouds=true;group.name='Ethereal cloud canopy';scene.add(group);
 const vertex=`varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`;
 const fragment=`uniform sampler2D sceneDepth;uniform vec2 viewport;uniform float cameraNear;uniform float cameraFar;uniform float depthReady;uniform float time;uniform float strength;uniform float seed;uniform vec3 tint;uniform float lowMist;uniform vec2 breeze;uniform float stir;uniform vec2 orbBreeze;uniform float orbStir;varying vec2 vUv;varying vec3 vWorld;
 float viewDepth(float d){return cameraNear*cameraFar/(cameraFar-d*(cameraFar-cameraNear));}
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(3.7,9.2);a*=.5;}return v;}
 void main(){vec2 uv=vUv*2.-1.;float edge=1.-smoothstep(.42,1.,length(uv));
 float nearFade=smoothstep(.3,6.,abs(cameraPosition.y-vWorld.y));
 float below=mix(smoothstep(-8.,5.,cameraPosition.y-vWorld.y),1.,lowMist);
 float coverage=edge*strength*nearFade*below;
 if(coverage<.002)discard;
 if(depthReady>.5){
  float surface=viewDepth(texture2D(sceneDepth,gl_FragCoord.xy/viewport).r);
  float mist=viewDepth(gl_FragCoord.z);
  coverage*=smoothstep(0.,2.8,surface-mist);
  if(coverage<.002)discard;
 }
 vec2 p=vUv*4.+seed+vec2(time*.065,time*.025);vec2 delta=vWorld.xz-breeze;float reach=exp(-dot(delta,delta)/650.);vec2 swirl=vec2(-delta.y,delta.x)*.022*reach*stir;p+=swirl;vec2 od=vWorld.xz-orbBreeze;float orbReach=exp(-dot(od,od)/14.)*lowMist; p+=(vec2(-od.y,od.x)*.12-od*.09)*orbReach*orbStir;float n=fbm(p+fbm(p*.7));float body=smoothstep(.26,.72,n);float alpha=coverage*body*(1.-.42*orbReach*orbStir);if(alpha<.002)discard;vec3 silver=mix(vec3(.63,.71,.79),vec3(.98,.96,.94),smoothstep(.3,.75,n));gl_FragColor=vec4(silver*tint,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`;
 const layers=[];for(let i=0;i<12;i++){
  const angle=i*2.39996,r=14+(i%3)*9;
  const material=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{sceneDepth:{value:null},viewport:{value:new T.Vector2(1,1)},cameraNear:{value:.1},cameraFar:{value:1000},depthReady:{value:0},time:{value:0},strength:{value:.13},seed:{value:i*13.17},tint:{value:new T.Color(1,1,1)},lowMist:{value:0},breeze:{value:new T.Vector2()},stir:{value:0},orbBreeze:{value:new T.Vector2()},orbStir:{value:0}},transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true});
  const mesh=new T.Mesh(new T.PlaneGeometry(36+(i%3)*9,24+(i%4)*5),material);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=i*.7;mesh.position.set(Math.cos(angle)*r,36+i*2.7,Math.sin(angle)*r);group.add(mesh);layers.push({mesh,x:mesh.position.x,z:mesh.position.z,phase:i*1.7,edge:false});
 }
 // A wider outer bank fills the sides without adding density over the emblem.
 for(let i=0;i<8;i++){
  const material=layers[i].mesh.material.clone();material.uniforms.strength.value=.1;material.uniforms.seed.value=113+i*9.1;
  const mesh=new T.Mesh(new T.PlaneGeometry(65,48),material);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=i*.48;mesh.position.set((i%2?1:-1)*(46+(i%3)*7),40+(i%4)*5,(Math.floor(i/2)-1.5)*30);group.add(mesh);layers.push({mesh,x:mesh.position.x,z:mesh.position.z,phase:i*2.1,edge:true});
 }
 // Fine pastel veils nestle around the elevated paths, below the cloud canopy.
 const pastels=[new T.Color(1.12,.88,1.23),new T.Color(.83,1.18,1.17),new T.Color(1.23,.91,.98),new T.Color(1.16,1.12,.88)];
 for(let i=0;i<12;i++){
  const material=layers[i].mesh.material.clone();material.uniforms.strength.value=.15;material.uniforms.seed.value=220+i*11.7;material.uniforms.tint.value.copy(pastels[i%4]);material.uniforms.lowMist.value=1;
  const mesh=new T.Mesh(new T.PlaneGeometry(22+(i%3)*7,15+(i%4)*3),material);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=i*.83;
  const angle=i*2.39996,r=interior?3+(i%3)*3:12+(i%3)*10;mesh.position.set(Math.cos(angle)*r,interior?.8+(i%3)*.8:2+(i%4)*3.5,Math.sin(angle)*r);if(interior){mesh.geometry.dispose();mesh.geometry=new T.PlaneGeometry(13,9);material.uniforms.strength.value=.16;}group.add(mesh);layers.push({mesh,x:mesh.position.x,z:mesh.position.z,phase:i*1.4,edge:false});
 }
 // Cloud banks below the masonry give the Mantrium a floating, high-altitude foundation.
 if(!interior)for(let i=0;i<10;i++){
  const material=layers[i].mesh.material.clone();material.uniforms.strength.value=.33;material.uniforms.seed.value=410+i*17.3;material.uniforms.tint.value.copy(pastels[i%4]).lerp(new T.Color(1,1,1),.65);material.uniforms.lowMist.value=1;
  const mesh=new T.Mesh(new T.PlaneGeometry(48+(i%3)*10,38+(i%2)*12),material);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=i*.71;const angle=i*2.39996,r=23+(i%3)*10;mesh.position.set(Math.cos(angle)*r,-6-(i%3)*5,Math.sin(angle)*r);group.add(mesh);layers.push({mesh,x:mesh.position.x,z:mesh.position.z,phase:i*1.8,edge:false});
 }
 if(interior){for(const layer of layers.splice(0,20)){group.remove(layer.mesh);layer.mesh.geometry.dispose();layer.mesh.material.dispose();}}
 const zeroPointer=new T.Vector2(),orbSample=new T.Vector2(),breezeTarget=new T.Vector2();
 let orbEnergy=0;const previousOrb=new T.Vector2();let previousTime=0,energy=0,enabled=0;const previousPointer=new T.Vector2(),breeze=new T.Vector2();
 return {group,update(t,reduced,pointer=zeroPointer,opening=false,orbPosition=null){const dt=Math.min(.05,Math.max(.001,t-previousTime));previousTime=t;const orbPoint=orbPosition?orbSample.set(orbPosition.x,orbPosition.z):previousOrb;const orbSpeed=Math.min(1,orbPoint.distanceTo(previousOrb)/dt*.2);orbEnergy=T.MathUtils.damp(orbEnergy,orbPosition?orbSpeed:0,2,dt);previousOrb.copy(orbPoint);const speed=Math.min(3,pointer.distanceTo(previousPointer)/dt);previousPointer.copy(pointer);enabled=T.MathUtils.damp(enabled,opening?1:0,opening?3:.45,dt);energy=T.MathUtils.damp(energy,opening?speed:0,opening&&speed>energy?5:.20,dt);breeze.lerp(breezeTarget.set(pointer.x*45,pointer.y*35),1-Math.exp(-4*dt));const spread=Math.max(1,innerWidth/innerHeight/1.5);for(const {mesh,x,z,phase,edge} of layers){const time=t*(reduced?.25:1);mesh.material.uniforms.time.value=time;mesh.material.uniforms.orbBreeze.value.copy(orbPoint);mesh.material.uniforms.orbStir.value=orbEnergy;mesh.material.uniforms.breeze.value.copy(breeze);mesh.material.uniforms.stir.value=energy*enabled;mesh.position.x=x*(edge?spread:1)+Math.sin(time*.085+phase)*(interior?2:6);mesh.scale.x=edge?spread:1;mesh.position.z=z+Math.cos(time*.065+phase)*(interior?1.5:4.5);}}};
}

// Fade mist into opaque surfaces using their depth, rather than exposing a
// hard plane intersection. Shared by the hall and all temple cameras.
const mistDepthTargets=new WeakMap();
const mistDepthMaterials=new Map();
function mistDepthMaterial(material){
 if(!material.isMeshStandardMaterial||material.alphaTest>0||material.alphaHash||
    material.displacementMap||material.clippingPlanes?.length||material.wireframe||
    !material.depthWrite||!material.depthTest||material.polygonOffset||material.stencilWrite||
    material.onBeforeCompile!==T.Material.prototype.onBeforeCompile) return material;
 let depth=mistDepthMaterials.get(material.side);
 if(!depth){
  depth=new T.MeshDepthMaterial({side:material.side,colorWrite:false});
  mistDepthMaterials.set(material.side,depth);
 }
 return depth;
}
export function renderCloudScene(renderer,scene,camera){
 if(scene.userData.useNativeMistDepth){renderer.render(scene,camera);return;}
 const clouds=[],hidden=[],replaced=[];scene.traverseVisible(o=>{if(o.userData.softClouds)clouds.push(o);});
 if(!clouds.length){renderer.render(scene,camera);return;}
 let target=mistDepthTargets.get(renderer);
 if(!target){target=new T.WebGLRenderTarget(1,1,{depthBuffer:true,stencilBuffer:false});target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);mistDepthTargets.set(renderer,target);}
 const size=renderer.getDrawingBufferSize(new T.Vector2()),w=Math.ceil(size.x/2),h=Math.ceil(size.y/2);if(target.width!==w||target.height!==h)target.setSize(w,h);
 // Transparent atmosphere and orbs must not masquerade as solid wall depth.
 scene.traverseVisible(o=>{
  const material=o.material;
  if(o.userData.softClouds||(material&&(Array.isArray(material)?material.some(m=>m.transparent):material.transparent))){
   hidden.push(o);
  }else if(o.isMesh&&material&&!Array.isArray(material)){
   const depth=mistDepthMaterial(material);
   if(depth!==material){replaced.push([o,material]);o.material=depth;}
  }
 });
 const previous=renderer.getRenderTarget(),autoShadow=renderer.shadowMap.autoUpdate;
 try{for(const o of hidden)o.visible=false;renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(target);renderer.render(scene,camera);}
 finally{
  for(const o of hidden)o.visible=true;
  for(const [object,material] of replaced)object.material=material;
  renderer.shadowMap.autoUpdate=autoShadow;renderer.setRenderTarget(previous);
 }
 for(const group of clouds)group.traverse(o=>{const u=o.material?.uniforms;if(u?.sceneDepth){u.sceneDepth.value=target.depthTexture;u.viewport.value.copy(size);u.cameraNear.value=camera.near;u.cameraFar.value=camera.far;u.depthReady.value=1;}});
 renderer.render(scene,camera);
}

// Also cover legacy atmospheric sheets that are not created by createClouds.
export function softenMistMaterial(material){
 Object.assign(material.uniforms,{sceneDepth:{value:null},viewport:{value:new T.Vector2(1,1)},cameraNear:{value:.1},cameraFar:{value:1000},depthReady:{value:0}});
 const declarations='uniform sampler2D sceneDepth;uniform vec2 viewport;uniform float cameraNear;uniform float cameraFar;uniform float depthReady;float mistViewDepth(float d){return cameraNear*cameraFar/(cameraFar-d*(cameraFar-cameraNear));}';
 const end=material.fragmentShader.lastIndexOf('}');
 material.fragmentShader=declarations+material.fragmentShader.slice(0,end)+'if(depthReady>.5){float surface=mistViewDepth(texture2D(sceneDepth,gl_FragCoord.xy/viewport).r);gl_FragColor.a*=smoothstep(0.,2.8,surface-mistViewDepth(gl_FragCoord.z));}'+material.fragmentShader.slice(end);
 material.needsUpdate=true;return material;
}
