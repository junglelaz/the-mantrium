import * as T from 'three';
import {inPolygon,ribbonHeight} from './navigation.js?v=spacing237';
export function wallWaterSites(polygons,navigation=null){
 const faces=[[3,5,588,246],[10,3,618,246],[7,8,531,302],[2,6,561,302],[9,2,646,304],[10,3,676,304],[9,2,588,361],[5,5,618,361]];
 return faces.map(([id,e,sx,sz])=>{
  const p=polygons[id],a=p[e],b=p[(e+1)%p.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),tx=(sx-603)*.14,tz=(sz-317)*.14;
  const t=Math.max(0,Math.min(1,((tx-a[0])*dx+(tz-a[1])*dz)/(length*length))),x=a[0]+dx*t,z=a[1]+dz*t;
  let nx=-dz/length,nz=dx/length;if(inPolygon(x+nx*.1,z+nz*.1,p)){nx=-nx;nz=-nz;}
  const y=-5.1; // Entire opening remains below the settled bridge at -3.65.
  return {id,e,t,length,x,y,z,width:1.15,top:y+.28,bottom:y-.08,angle:Math.atan2(nx,nz),height:()=>y};
 });
}
// Recessed-looking wall mouths and thin falling sheets, lit by the scene itself.
export function createWallWater(parent,sites){
 const time={value:0},group=new T.Group();group.name='Quiet wall cascades';parent.add(group);
 const loader=new T.TextureLoader(),stoneMap=loader.load('public/nature/marble-color.webp');stoneMap.colorSpace=T.SRGBColorSpace;
 const stone=new T.MeshStandardMaterial({map:stoneMap,color:'#adb9ac',roughness:.72});
 const recess=new T.MeshStandardMaterial({color:'#112726',roughness:.9});
 const lip=new T.MeshStandardMaterial({color:'#8b9278',metalness:.55,roughness:.34});
 const sky=document.createElement('canvas');sky.width=256;sky.height=128;const ctx=sky.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'#b8d8df');gradient.addColorStop(.38,'#dbe5cf');gradient.addColorStop(.54,'#526d72');gradient.addColorStop(1,'#142c30');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,128);const reflection=new T.CanvasTexture(sky);reflection.mapping=T.EquirectangularReflectionMapping;reflection.colorSpace=T.SRGBColorSpace;
 const water=new T.MeshPhysicalMaterial({color:'#a4c9c5',emissive:'#b8e9df',emissiveIntensity:.13,metalness:.08,roughness:.19,ior:1.333,clearcoat:1,clearcoatRoughness:.12,envMap:reflection,envMapIntensity:.42,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false});
 water.onBeforeCompile=shader=>{shader.uniforms.cascadeTime=time;shader.vertexShader='uniform float cascadeTime;varying vec2 cascadeUV;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 cascadeUV=uv;float fall=1.-uv.y;transformed.z+=(sin(uv.y*65.+cascadeTime*2.6+uv.x*9.)*.022+sin(uv.y*23.+cascadeTime*1.7)*.018)*smoothstep(0.,.06,fall);
 `);shader.fragmentShader='uniform float cascadeTime;varying vec2 cascadeUV;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 float ripple=sin(cascadeUV.x*92.+sin(cascadeUV.y*34.+cascadeTime*2.6)*1.3);normal=normalize(normal+vec3(ripple*.13,cos(cascadeUV.y*66.+cascadeTime*3.)*.045,0.));
 `);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float edge=smoothstep(0.,.09,cascadeUV.x)*smoothstep(0.,.09,1.-cascadeUV.x);
 float depthFade=smoothstep(0.,.38,cascadeUV.y);
 float strands=.66+.34*sin(cascadeUV.x*115.+sin(cascadeUV.y*39.+cascadeTime*3.)*.65);
 diffuseColor.a*=edge*depthFade*strands;diffuseColor.rgb*=.88+.12*strands;
 `);};water.customProgramCacheKey=()=> 'quiet-cascades-v1';
 const sheet=new T.PlaneGeometry(1.05,22,12,80),positions=sheet.attributes.position;
 for(let i=0;i<positions.count;i++){const fall=(11-positions.getY(i))/22;positions.setX(i,positions.getX(i)*(1-.25*Math.min(1,fall*3)));positions.setZ(i,.035+.34*(1-Math.exp(-fall*14)));positions.setY(i,positions.getY(i)-11);}sheet.computeVertexNormals();
 function box(root,w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);}
 const roots=[];sites.forEach((site,i)=>{const root=new T.Group();root.position.set(site.x,site.y,site.z);root.rotation.y=site.angle;group.add(root);roots.push(root);
 // Dark cavity and internal stone reveals sit behind a real cut in the wall.
 box(root,1.15,.36,.025,0,.10,-.34,recess);
 box(root,1.15,.045,.36,0,.28,-.16,stone);
 box(root,.045,.36,.36,-.575,.10,-.16,stone);
 box(root,.045,.36,.36,.575,.10,-.16,stone);
 box(root,1.15,.045,.40,0,-.08,-.15,lip);
 const flow=new T.Mesh(sheet,water);flow.receiveShadow=true;flow.renderOrder=1;root.add(flow);});
 return {update(t,reduced){time.value=reduced?0:t;roots.forEach((root,i)=>{root.position.y=sites[i].height?.()??sites[i].y;});},group};
}
