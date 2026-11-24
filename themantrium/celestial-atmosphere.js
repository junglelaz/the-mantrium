import * as T from 'three';
// A quiet celestial horizon and translucent light shafts; no new camera controls.
export function createCelestialAtmosphere(scene,temples=[],{anchors:customAnchors=null}={}){
 const time={value:0},group=new T.Group();group.name='Pearl horizon and drifting light';scene.add(group);
 const sky=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({depthWrite:false,depthTest:false,toneMapped:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.999999,1.);}',fragmentShader:`varying vec2 vUv;void main(){
  vec3 deep=vec3(.13,.23,.27),pearl=vec3(.30,.39,.46);float horizon=pow(max(0.,1.-abs(vUv.y-.48)*1.5),2.);
  vec3 color=mix(deep,pearl,horizon*.65);float dawn=exp(-length((vUv-vec2(.83,.67))*vec2(1.2,1.8))*4.);
  color+=vec3(.19,.13,.105)*dawn;gl_FragColor=vec4(color,1.);
 }`}));sky.userData.nonCollidable=true;sky.renderOrder=-100;sky.frustumCulled=false;group.add(sky);
 const vertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
 const fragment=`uniform float time;uniform float phase;varying vec2 vUv;void main(){
  float across=pow(max(0.,sin(vUv.x*3.14159265)),3.);float ends=smoothstep(0.,.07,vUv.y)*(1.-smoothstep(.65,1.,vUv.y));
  float threads=.76+.24*sin(vUv.x*17.+time*.075+phase);float breath=.9+.1*sin(time*.12+phase);
  gl_FragColor=vec4(vec3(.86,.89,1.),across*ends*threads*breath*.025);
 }`;
 const anchors=customAnchors||[];
 // Four corners of the level central deck, immediately inside its stair joins.
 if(!customAnchors)for(const along of [-3,3])for(const across of [-2.7,2.7])anchors.push({x:(along+across)/Math.SQRT2,z:(-along+across)/Math.SQRT2,y:.35,width:1.05,height:24});
 if(!customAnchors)for(const temple of temples)for(const u of [-2.575,2.575])for(const v of [-2.575,2.575])anchors.push({x:temple.x+(u+v)/Math.SQRT2,z:temple.z+(-u+v)/Math.SQRT2,y:3.79,width:1.05,height:19});
 const beams=anchors.map((anchor,i)=>{
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,side:T.DoubleSide,toneMapped:false,uniforms:{time,phase:{value:i*1.9}},vertexShader:vertex,fragmentShader:fragment});
  const geometry=new T.PlaneGeometry(anchor.width,anchor.height,1,1);geometry.translate(0,anchor.height/2,0);
  const mesh=new T.Mesh(geometry,material);mesh.position.set(anchor.x,anchor.y,anchor.z);mesh.rotation.y=.4+i*.65;group.add(mesh);return mesh;
 });
 return {group,update(t,reduced,bridgeY=.35){if(!customAnchors)for(let i=0;i<4;i++)beams[i].position.y=bridgeY;time.value=reduced?0:t;beams.forEach((beam,i)=>{beam.rotation.z=reduced?0:Math.sin(t*.055+i*1.7)*.012;});}};
}
