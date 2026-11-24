import * as T from 'three';
import {stars as catalog} from './stars-data.js?v=spacing237';
export function createCosmos(scene){
 const group=new T.Group();group.name='Distant celestial sky';scene.add(group);
 const points=[],colors=[],sizes=[],brightness=[];
 // A rigid celestial rotation preserves every constellation's true angular pattern.
 const ra0=5.6*Math.PI/12,centre=new T.Vector3(.48,-1,.05).normalize();
 const north=new T.Vector3(0,0,-1).addScaledVector(centre,centre.z).normalize();
 const east=new T.Vector3().crossVectors(north,centre).normalize();
 const direction=new T.Vector3();
 const warm=new T.Color('#ffe2ba'),cool=new T.Color('#d6e5ff'),neutral=new T.Color('#edf0ed');
 for(const [ra,dec,mag,ci] of catalog){
  const a=ra*Math.PI/12-ra0,d=dec*Math.PI/180;
  const v=direction.copy(centre).multiplyScalar(Math.cos(d)*Math.cos(a)).addScaledVector(east,Math.cos(d)*Math.sin(a)).addScaledVector(north,Math.sin(d));
  points.push(v.x*500,v.y*500,v.z*500);
  const c=ci>1?warm:ci<0?cool:neutral;colors.push(c.r,c.g,c.b);
  sizes.push(Math.max(1,3.8-mag*.4));brightness.push(Math.max(.12,Math.min(.92,.98*Math.pow(10,-.10*mag))));
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('starSize',new T.Float32BufferAttribute(sizes,1));geometry.setAttribute('brightness',new T.Float32BufferAttribute(brightness,1));
 const starMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{twinkleTime:{value:0},twinkleAmount:{value:1},pixelRatio:{value:Math.min(devicePixelRatio,1.7)}},vertexShader:`attribute vec3 color;attribute float starSize;attribute float brightness;uniform float pixelRatio;uniform float twinkleTime;uniform float twinkleAmount;varying vec3 tint;varying float light;void main(){tint=color;float seed=fract(sin(dot(position,vec3(12.9898,78.233,37.719)))*43758.5453);float phase=seed*6.283185;float shimmer=sin(twinkleTime*(.24+seed*.25)+phase)*.09+sin(twinkleTime*(.13+seed*.1)+phase*2.7)*.035;light=brightness*(1.+shimmer*twinkleAmount);vec3 direction=mat3(viewMatrix)*position;gl_Position=projectionMatrix*vec4(direction,1.);gl_Position.z=gl_Position.w*.99999;gl_PointSize=starSize*pixelRatio;}`,fragmentShader:`varying vec3 tint;varying float light;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(tint,light*(1.-smoothstep(.2,1.,r)));}`});
 const stars=new T.Points(geometry,starMaterial);stars.frustumCulled=false;stars.renderOrder=-1;group.add(stars);
 const planets=[];
 // All three planets share the same painted surface.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,256),a=new T.Color('#94b1a7'),b=new T.Color('#426b6e'),pixel=new T.Color();
 for(let v=0;v<256;v++)for(let u=0;u<512;u++){
  const lon=u/512*Math.PI*2,lat=v/256*Math.PI;
  const wave=Math.sin(lat*12+Math.sin(lon*3)*.8+Math.sin(lon*7+lat*9)*.25)*.5+.5;
  const c=pixel.copy(a).lerp(b,.25+wave*.65),n=(v*512+u)*4;
  pixels.data[n]=c.r*255;pixels.data[n+1]=c.g*255;pixels.data[n+2]=c.b*255;pixels.data[n+3]=255;
 }
 ctx.putImageData(pixels,0,0);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 [[-64,-35,-28,6.5],[66,-47,-43,8],[54,-50,47,5.2]].forEach(([x,y,z,r],i)=>{
  const distanceScale=(105-y*3)/(105-y);x*=distanceScale;z*=distanceScale;r*=distanceScale;y*=3;
  const material=new T.MeshStandardMaterial({map,color:'#8eaaa5',roughness:1,fog:false,transparent:true,opacity:.15,depthWrite:true,emissive:'#426b6e',emissiveIntensity:.13});
  const planet=new T.Mesh(new T.SphereGeometry(r,48,32),material);planet.renderOrder=-2;planet.position.set(x,y,z);planet.rotation.x=1.12;planet.rotation.z=.2+i*.23;planet.scale.setScalar(1.8);group.add(planet);
  planets.push({planet,x,y,z,i});
 });
 // A short-lived meteor behind the architecture and planets, ahead of the distant stars.
 const meteorMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{head:{value:new T.Vector2()},tail:{value:new T.Vector2()},alpha:{value:0},aspect:{value:innerWidth/innerHeight}},vertexShader:`uniform vec2 head;uniform vec2 tail;uniform float aspect;varying vec2 trailUV;void main(){trailUV=uv;vec2 d=normalize(vec2((head.x-tail.x)*aspect,head.y-tail.y));vec2 normal=vec2(-d.y/aspect,d.x);vec2 point=mix(tail,head,uv.x)+normal*(uv.y-.5)*.009;gl_Position=vec4(point,.99998,1.);}`,fragmentShader:`uniform float alpha;varying vec2 trailUV;void main(){float width=exp(-pow((trailUV.y-.5)*7.,2.));float taper=pow(trailUV.x,2.2);float tip=exp(-pow((trailUV.x-.96)*24.,2.));gl_FragColor=vec4(mix(vec3(.65,.82,.86),vec3(.96,1.,.95),trailUV.x),width*(taper*.4+tip*.45)*alpha);}`});
 const meteor=new T.Mesh(new T.PlaneGeometry(1,1),meteorMaterial);meteor.frustumCulled=false;meteor.renderOrder=-1;meteor.visible=false;group.add(meteor);
 let nextMeteor=null,meteorStart=null;const origin=new T.Vector2(),travel=new T.Vector2();
 function updateMeteor(t,reduced){
  if(nextMeteor===null)nextMeteor=t+20+Math.random()*10;
  if(reduced){meteor.visible=false;meteorStart=null;nextMeteor=t+20+Math.random()*10;return;}
  if(t>=nextMeteor){meteorStart=t;nextMeteor=t+20+Math.random()*10;origin.set(-.85+Math.random()*1.1,.45+Math.random()*.35);travel.set(.35+Math.random()*.25,-.2-Math.random()*.2);}
  if(meteorStart===null)return;
  const age=t-meteorStart,duration=1.25;
  if(age>=duration){meteor.visible=false;meteorStart=null;return;}
  const u=age/duration;meteor.visible=true;meteorMaterial.uniforms.aspect.value=innerWidth/innerHeight;
  meteorMaterial.uniforms.head.value.copy(origin).addScaledVector(travel,u);
  meteorMaterial.uniforms.tail.value.copy(meteorMaterial.uniforms.head.value).addScaledVector(travel,-.28);
  meteorMaterial.uniforms.alpha.value=Math.sin(Math.PI*u)*.7;
 }
 return {update(t,reduced){const time=t*(reduced?.15:1);updateMeteor(t,reduced);starMaterial.uniforms.twinkleTime.value=t;starMaterial.uniforms.twinkleAmount.value=reduced?0:1;for(const {planet,x,y,z,i} of planets){planet.position.set(x+Math.sin(time*.035+i*2)*1.8,y+Math.sin(time*.026+i)*.8,z+Math.cos(time*.03+i*2)*1.5);planet.rotation.y=time*(.018+i*.004);}}};
}
