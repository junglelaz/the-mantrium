import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import './contact.js?v=spacing237';
import {createGlassApproaches} from './glass-approaches.js?v=spacing237';
import {wallWaterSites} from './wall-water.js?v=spacing237';
import {createCelestialAtmosphere} from './celestial-atmosphere.js?v=spacing237';
import {createFireflies} from './fireflies.js?v=spacing237';
import {setText} from './ui-utils.js?v=spacing237';
import './opening-glass.js?v=spacing237';
import './entrance-shine.js?v=spacing237';
import {createCosmos} from './cosmos.js?v=spacing237';
import {createBloom} from './bloom-fluid244.js';
import {createClouds,renderCloudScene,softenMistMaterial} from './clouds-fluid251.js';
import {createPresence} from './presence.js?v=spacing237';
import {createInhabitants} from './inhabitants.js?v=spacing237';
import {createNature} from './nature.js?v=spacing237';
import {detailTemple} from './temple-detail.js?v=spacing237';
import {createQuickNav} from './quicknav.js?v=spacing237';
import {createInteriors} from './interiors-fluid251.js';
import * as T from 'three';
import {createOrbShadow} from './orb-shadow-fluid245.js';
import {createSecret} from './secret-fluid243.js';
import {SVGLoader} from './vendor/SVGLoader.js';
import {Score} from './audio.js?v=spacing237';
import {TEMPLE_SITES,templeAt,createJourney} from './temples.js?v=spacing237';
import {createNavigation,crossings,ribbonHeight,tunnelHeight,FLOAT_HEIGHT,reversedCrossing,coordinates,lowerProfile,UNDERPASS_WIDTH,stairStart,STAIR_RISE,STAIR_RUN,STAIR_COUNT,STEP_BASE,STEP_TOP,stepHeight,inPolygon,templeFloorHeight} from './navigation.js?v=spacing237';
const $=s=>document.querySelector(s), score=new Score();let entered=false,inside=false,visited=false,pigmentAt=Infinity,overview=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const panel=$('#panel');const pages={work:'<div class="eyebrow">TEMPLE OF CREATION</div><h2>Ideas into existence.</h2><p>Our work brings together design, engineering and intelligent systems.</p><p>This first sanctuary is an interaction prototype. Selected projects and approved case studies will be added in the portfolio phase.</p><button id="panel-travel">Explore Creation</button>',studio:'<div class="eyebrow">THE STUDIO</div><h2>Human vision.<br>Intelligent systems.</h2><p>Mantrium is a creative technology studio founded by Laszlo and Narayana. We build thoughtful digital products that benefit people.</p><p>Creative direction, product design, front-end craft, backend engineering and AI systems.</p>',map:'<div class="eyebrow">THE SANCTUARY</div><h2>Choose your destination.</h2><img src="public/mark.svg" alt="Official Mantrium world outline" style="width:180px;display:block;margin:20px auto"><p>Four square temple blockouts now mark the north, east, south and west positions. Creation retains the first pigment interaction.</p><button id="panel-travel">Creation temple</button> <button id="panel-home">Central crossing</button>'};
function showPage(name){
 if(name==='map'){quickNav.toggle();return;}
 if(name.startsWith('temple-')){const t=TEMPLE_SITES[Number(name.slice(7))];if(t)pages[name]=`<div class="eyebrow">${t.theme}</div><h2>${t.heading}</h2><p>${t.copy}</p><p>Leave through any of the four open sides to absorb ${t.pigment}.</p>`}
 if(name==='map')pages.map='<div class="eyebrow">THE SANCTUARY</div><h2>Choose your destination.</h2><p>All four temples welcome you from every side.</p>'+TEMPLE_SITES.map(t=>`<button data-destination="${t.index}">${t.name}</button>`).join(' ')+'<p><button id="panel-home">Central crossing</button></p>';
 $('#panel-content').innerHTML=pages[name]||pages.work;panel.showModal();$('#panel-content').querySelectorAll('[data-destination]').forEach(b=>b.onclick=async()=>{panel.close();await enter();teleport(Number(b.dataset.destination))});$('#panel-travel')?.addEventListener('click',async()=>{panel.close();await enter();teleport(true)});$('#panel-home')?.addEventListener('click',()=>{panel.close();teleport(false)})}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));$('#close').onclick=()=>panel.close();$('#map').onclick=()=>showPage('map');
let noticeTimer;function notify(text){$('#notice').textContent=text;$('#notice').style.opacity=1;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').style.opacity=0,5000)}
const scene=new T.Scene();scene.userData.useNativeMistDepth=true;scene.background=new T.Color('#284449');scene.fog=new T.FogExp2('#284449',.007);const clouds=createClouds(scene);const cosmos=createCosmos(scene);const celestial=createCelestialAtmosphere(scene,TEMPLE_SITES);
const mobileRender=matchMedia('(pointer:coarse)').matches||innerWidth<=650;
let renderer;try{renderer=new T.WebGLRenderer({canvas:$('#world'),antialias:!mobileRender,alpha:false});}catch(e){$('#enter').disabled=true;$('#enter').textContent='3D unavailable';showPage('work');throw e}
const initialPixelRatio=Math.min(devicePixelRatio,mobileRender?1.5:1.4);
const minimumPixelRatio=Math.min(initialPixelRatio,mobileRender?1.2:.8);
renderer.setPixelRatio(initialPixelRatio);renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;const bloom=mobileRender?{render:draw=>draw()}:createBloom(renderer);
const camera=new T.PerspectiveCamera(43,innerWidth/innerHeight,.1,1000);camera.position.set(0,105/Math.min(1,camera.aspect),1);camera.lookAt(0,0,0);
const ambient=new T.HemisphereLight('#e6efff','#536168',2.8);scene.add(ambient);const sun=new T.DirectionalLight('#fff0db',3.25);sun.position.set(-25,50,20);sun.castShadow=true;const shadowSize=mobileRender?1024:2048;sun.shadow.mapSize.set(shadowSize,shadowSize);Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:.5,far:250});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0004;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;scene.add(sun);
const stone=new T.MeshStandardMaterial({color:'#c4ccbb',roughness:.78,metalness:.1}),gold=new T.MeshStandardMaterial({color:'#b99b60',metalness:.65,roughness:.3}),dark=new T.MeshStandardMaterial({color:'#283e36',roughness:.85}),leaf=new T.MeshStandardMaterial({color:'#264c3c',roughness:.95}),water=new T.MeshPhysicalMaterial({color:'#5eaeaa',metalness:.45,roughness:.16,transparent:true,opacity:.8});
// Height-based atmospheric extinction hides every deep wall edge, independent of camera distance.
function fadeIntoDepth(material){
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying float vDepthWorldY;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvDepthWorldY=(modelMatrix*vec4(transformed,1.0)).y;');
  shader.fragmentShader='varying float vDepthWorldY;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\nfloat depthFade=smoothstep(6.0,48.0,-vDepthWorldY);\ngl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(0.156862745,0.266666667,0.28627451),depthFade);');
 };
 material.customProgramCacheKey=()=> 'mantrium-depth-fade-v2';
 return material;
}
// Deterministic, seamless multi-scale mineral detail; shared physical-size UVs below.
function mineralTexture(seed){
 const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(size,size);
 const hash=(x,y)=>{let n=Math.imul(x+seed,374761393)^Math.imul(y+seed,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295};
 // The three noise layers repeatedly sample the same periodic lattice.
 const layers=[4,16,64].map(scale=>{
  const lattice=new Float64Array(scale*scale);
  for(let y=0;y<scale;y++)for(let x=0;x<scale;x++)lattice[y*scale+x]=hash(x,y);
  return {scale,lattice};
 });
 const noise=(x,y,{scale,lattice})=>{
  const gx=x/size*scale,gy=y/size*scale,ix=Math.floor(gx),iy=Math.floor(gy);
  const tx=gx-ix,ty=gy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
  const x2=(ix+1)%scale,row=iy*scale,nextRow=((iy+1)%scale)*scale;
  const a=T.MathUtils.lerp(lattice[row+ix],lattice[row+x2],sx);
  const b=T.MathUtils.lerp(lattice[nextRow+ix],lattice[nextRow+x2],sx);
  return T.MathUtils.lerp(a,b,sy);
 };
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const n=noise(x,y,layers[0])*.32+noise(x,y,layers[1])*.25+noise(x,y,layers[2])*.23+hash(x,y)*.2,pores=hash(x+97,y+19)>.986?.2:0,v=Math.round(190+n*64-pores*100),i=(y*size+x)*4;pixels.data[i]=v;pixels.data[i+1]=v;pixels.data[i+2]=v;pixels.data[i+3]=255}
 ctx.putImageData(pixels,0,0);const map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return map;
}
const stoneGrain=mineralTexture(17),metalGrain=mineralTexture(71);
function textureStone(material,depth=.065){material.map=stoneGrain;material.bumpMap=stoneGrain;material.bumpScale=depth;material.roughnessMap=stoneGrain;material.roughness=.93;material.metalness=0;return material}
textureStone(stone);textureStone(dark,.09);gold.map=metalGrain;gold.roughnessMap=metalGrain;gold.bumpMap=metalGrain;gold.bumpScale=.012;gold.roughness=.38;
const marbleLoader=new T.TextureLoader();stone.map=marbleLoader.load('public/nature/marble-color.webp');stone.map.colorSpace=T.SRGBColorSpace;stone.normalMap=marbleLoader.load('public/nature/marble-normal.webp');stone.normalScale=new T.Vector2(.25,.25);stone.roughnessMap=marbleLoader.load('public/nature/marble-rough.webp');stone.roughness=.8;for(const map of [stone.map,stone.normalMap,stone.roughnessMap]){map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;}
fadeIntoDepth(stone);fadeIntoDepth(dark);
function surfaceUV(geo){const p=geo.getAttribute('position'),n=geo.getAttribute('normal');if(!p||!n)return;const uv=[];for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));if(ay>=ax&&ay>=az)uv.push(p.getX(i)*.32,p.getZ(i)*.32);else if(ax>=az)uv.push(p.getZ(i)*.32,p.getY(i)*.32);else uv.push(p.getX(i)*.32,p.getY(i)*.32)}geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2))}
function mesh(geo,mat,x,y,z,parent=scene){if(mat.map||mat.bumpMap)surfaceUV(geo);let m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(w,h,d,x,y,z,mat=stone,p=scene){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,p)}
function cylinder(r1,r2,h,x,y,z,mat=stone,p=scene){return mesh(new T.CylinderGeometry(r1,r2,h,48),mat,x,y,z,p)}
// The SVG paths are both the visible deck outlines and the navigation boundaries.
const svg="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"330 45 550 545\"><g fill=\"#d9f7e7\"><path d=\"M603 60 630 87 603 114 576 87Z M603 518 630 545 603 572 576 545Z\"/><path d=\"M546 118 595 167 568 195 546 173 517 201 595 280 568 308 461 201Z M660 118 744 201 694 251 667 223 689 201 660 173 582 251 554 223Z M775 233 858 317 775 400 725 350 753 323 775 345 803 317 775 288 696 366 668 339Z M744 431 660 516 610 466 638 439 660 461 689 431 610 353 638 325Z M546 516 461 431 511 381 539 409 517 431 546 461 624 382 652 409Z M347 317 431 233 481 282 454 310 431 288 402 317 431 345 510 267 538 295 431 400Z M497 352 524 325 595 396 568 424Z M554 339 625 268 653 296 582 367Z M610 238 637 211 709 282 682 309Z\"/></g></svg>\n";const data=new SVGLoader().parse(svg);
const polygons=data.paths.flatMap(path=>SVGLoader.createShapes(path)).map(shape=>shape.getPoints().map(p=>[(p.x-603)*.14,(p.y-317)*.14]));
const wallOutlets=wallWaterSites(polygons);
// Exact slanted wall planes from the SVG, shared by portal lips and tunnel lining.
for(const c of crossings){
 const hits=[];
 for(const polygon of polygons)for(let i=0;i<polygon.length;i++){
  const a=coordinates(c,...polygon[i]),b=coordinates(c,...polygon[(i+1)%polygon.length]);
  if(a.across*b.across>=0)continue;
  const slope=(b.along-a.along)/(b.across-a.across),intercept=a.along-slope*a.across;
  if(Math.abs(intercept)<c.half-4-.25)hits.push({intercept,slope});
 }
 hits.sort((a,b)=>a.intercept-b.intercept);c.portalEnds=[hits[0],hits[hits.length-1]];
}
const PORTAL_RADIUS=.55;
const portalRound=across=>{const d=Math.min(PORTAL_RADIUS,Math.max(0,Math.abs(across)-(UNDERPASS_WIDTH/2-PORTAL_RADIUS)));return PORTAL_RADIUS-Math.sqrt(Math.max(0,PORTAL_RADIUS*PORTAL_RADIUS-d*d))};
// Wall seams depend only on physical decks, never the polar free-flight zones.
function physicalDeckHeights(x,z){
 const heights=[];
 polygons.forEach((p,id)=>{if(inPolygon(x,z,p))heights.push(id<2?.15:ribbonHeight(id-2,x,z))});
 for(const c of crossings)if(inPolygon(x,z,c.outline))heights.push(tunnelHeight(c,x,z));
 return heights;
}
const stairLevel=stepHeight;
function deck(points,height,material,landingCreases=[],supportDepth=2000,drawTop=true,solidSupport=false,flatTop=false){
 const positions=[];
 const creases=[...crossings,...landingCreases].flatMap(c=>[-1,1].flatMap(sign=>[0,STAIR_RUN*STAIR_COUNT].map(offset=>({c,boundary:sign*(stairStart(c,sign)+offset)}))));
 function triangle(a,b,c,depth=0){
  if(flatTop){
   const level=stairLevel(height(...a));
   positions.push(a[0],level,a[1],c[0],level,c[1],b[0],level,b[1]);
   return;
  }
  if(depth===0){
   // Keep triangulation on each side of the exact stair/landing crease.
   let pieces=[[a,b,c]];
   for(const {c:crossing,boundary} of creases){
    const distance=p=>coordinates(crossing,...p).along-boundary;
    const split=(poly,side)=>{const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],u=distance(p)*side,v=distance(q)*side;if(u>=0)out.push(p);if((u>0&&v<0)||(u<0&&v>0)){const t=u/(u-v);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}}return out};
    pieces=pieces.flatMap(poly=>{const ds=poly.map(distance);return Math.min(...ds)<-1e-9&&Math.max(...ds)>1e-9?[split(poly,1),split(poly,-1)]:[poly]});
   }
   for(const poly of pieces)for(let i=1;i<poly.length-1;i++)triangle(poly[0],poly[i],poly[i+1],1);
   return;
  }
  const length=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  if(depth<7&&Math.max(length(a,b),length(b,c),length(c,a))>.6){const ab=[(a[0]+b[0])/2,(a[1]+b[1])/2],bc=[(b[0]+c[0])/2,(b[1]+c[1])/2],ca=[(c[0]+a[0])/2,(c[1]+a[1])/2];triangle(a,ab,ca,depth+1);triangle(ab,b,bc,depth+1);triangle(ca,bc,c,depth+1);triangle(ab,bc,ca,depth+1);return}
  // Slice each height-field triangle into horizontal treads; never draw a sloped top.
  const verts=[a,c,b].map(p=>({x:p[0],z:p[1],h:height(...p)}));
  const clip=(poly,bound,above)=>{const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],pin=above?p.h>=bound:p.h<=bound,qin=above?q.h>=bound:q.h<=bound;if(pin)out.push(p);if(pin!==qin){const t=(bound-p.h)/(q.h-p.h);out.push({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t,h:bound})}}return out};
  const min=Math.min(...verts.map(p=>p.h)),max=Math.max(...verts.map(p=>p.h));
  if(max-min<1e-6){for(const p of verts)positions.push(p.x,stairLevel(p.h),p.z);return}
  for(let step=0;step<=STAIR_COUNT;step++){
   const top=STEP_BASE+step*STAIR_RISE,bottom=top-STAIR_RISE;
   if(top<min-1e-7||bottom>=max)continue;
   const poly=clip(clip(verts,bottom,true),top,false);
   for(let i=1;i<poly.length-1;i++)for(const p of [poly[0],poly[i],poly[i+1]])positions.push(p.x,top,p.z);
   if(bottom>=min-1e-7&&bottom<max-1e-7){const edge=[];for(let i=0;i<3;i++){const p=verts[i],q=verts[(i+1)%3];if((p.h<=bottom)!==(q.h<=bottom)){const t=(bottom-p.h)/(q.h-p.h);edge.push({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t})}}if(edge.length===2){const [p,q]=edge;positions.push(p.x,top,p.z,q.x,top,q.z,q.x,bottom,q.z,p.x,top,p.z,q.x,bottom,q.z,p.x,bottom,p.z)}}
  }
 }
 const triangles=T.ShapeUtils.triangulateShape(points.map(p=>new T.Vector2(...p)),[]);if(drawTop)for(const [a,b,c] of triangles)triangle(points[a],points[b],points[c]);
 // Walls descend into fog; internal seams are omitted, and lower routes get clear archways.
 function wall(p,q,topP,topQ,bottomP,bottomQ){positions.push(p[0],topP,p[1],q[0],topQ,q[1],q[0],bottomQ,q[1],p[0],topP,p[1],q[0],bottomQ,q[1],p[0],bottomP,p[1])}
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.ceil(length/.3),nx=-(b[1]-a[1])/length*.09,nz=(b[0]-a[0])/length*.09;
  // Cut wall edges at exact tread boundaries. Every wall cap is horizontal and flush.
  const edgePoint=t=>[T.MathUtils.lerp(a[0],b[0],t),T.MathUtils.lerp(a[1],b[1],t)];
  const edgeHeight=t=>height(...edgePoint(t));
  const cuts=Array.from({length:steps+1},(_,j)=>j/steps);
  const outlets=wallOutlets.filter(o=>polygons[o.id]===points&&o.e===i);
  for(const o of outlets)cuts.push(o.t-o.width/(2*length),o.t+o.width/(2*length));
  for(let j=0;j<steps;j++)for(let level=1;level<=STAIR_COUNT;level++){
   const boundary=STEP_BASE+level*STAIR_RISE;let lo=j/steps,hi=(j+1)/steps,ha=edgeHeight(lo)-boundary,hb=edgeHeight(hi)-boundary;
   if(ha*hb<0){for(let iteration=0;iteration<32;iteration++){const m=(lo+hi)/2,hm=edgeHeight(m)-boundary;if(ha*hm<=0)hi=m;else{lo=m;ha=hm}}cuts.push((lo+hi)/2)}
  }
  // Split exactly at portal planes; sampling must never round an opening wider or narrower.
  for(const c of crossings){
   const pa=coordinates(c,...a),pb=coordinates(c,...b);
   for(const axis of ['along','across']){
    const span=axis===(reversedCrossing(c)?'along':'across')?UNDERPASS_WIDTH/2:c.half-4+.8;
    const boundaries=[-span,span];if(axis===(reversedCrossing(c)?'along':'across'))for(let j=0;j<=16;j++)for(const sign of [-1,1])boundaries.push(sign*(span-.55+j*.55/16));
    for(const boundary of boundaries){const t=(boundary-pa[axis])/(pb[axis]-pa[axis]);if(t>0&&t<1)cuts.push(t)}
   }
  }
  // Clamp planes also split wall caps: no sampled sliver at the first or last riser.
  for(const {c,boundary} of creases){const pa=coordinates(c,...a).along,pb=coordinates(c,...b).along,t=(boundary-pa)/(pb-pa);if(t>0&&t<1)cuts.push(t)}
  cuts.sort((a,b)=>a-b);
  for(let j=0;j<cuts.length-1;j++){
   if(cuts[j+1]-cuts[j]<1e-9)continue;
   const p=edgePoint(cuts[j]),q=edgePoint(cuts[j+1]),h=stairLevel(edgeHeight((cuts[j]+cuts[j+1])/2)),k=h,x=(p[0]+q[0])/2,z=(p[1]+q[1])/2,mid=h;
   const supported=(x,z)=>physicalDeckHeights(x,z).some(y=>Math.abs(y-mid)<.45);
   if(!solidSupport&&supported(x+nx,z+nz)&&supported(x-nx,z-nz))continue;
   let passage=null,portal=null;
   for(const c of supportDepth>1&&!solidSupport?crossings:[]){
    const local=coordinates(c,x,z),along=reversedCrossing(c)?local.across:local.along,across=reversedCrossing(c)?local.along:local.across;
    const low=STEP_BASE;
    if(Math.abs(along)<c.half-4+.8&&Math.abs(across)<UNDERPASS_WIDTH/2&&mid-low>2.5){passage=passage===null?low:Math.min(passage,low);portal=c;}
   }
   const outlet=outlets.find(o=>Math.abs((cuts[j]+cuts[j+1])/2-o.t)<o.width/(2*length)-1e-8);
   if(outlet){wall(p,q,h,k,outlet.top,outlet.top);wall(p,q,outlet.bottom,outlet.bottom,-2000,-2000);}
   else if(passage!==null){
    const round=point=>portalRound(coordinates(portal,...point).across);
    const rp=round(p),rq=round(q);
    wall(p,q,h,k,h-.55-rp,k-.55-rq);wall(p,q,passage+rp,passage+rq,-2000,-2000);
   }
   else wall(p,q,h,k,supportDepth>1?-2000:h-supportDepth,supportDepth>1?-2000:k-supportDepth);
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();return mesh(geo,material,0,0,0);
}
const structureStart=scene.children.length;
stone.side=T.DoubleSide;
polygons.forEach((p,id)=>{const m=deck(p,(x,z)=>id<2?.15:ribbonHeight(id-2,x,z),stone,[],2000,true,false,id<2);m.userData.secretBridge=id===9;});
for(const c of crossings){const m=deck(c.outline,(x,z)=>tunnelHeight(c,x,z),stone);m.userData.secretBridge=c.id===2||c.id===6;m.userData.secretCrossing=c.id;}
// A single continuous lining follows the exact front/back portal planes, including its floor.
const tunnelFloorStone=stone.clone();tunnelFloorStone.polygonOffset=true;tunnelFloorStone.polygonOffsetFactor=1;tunnelFloorStone.polygonOffsetUnits=1;fadeIntoDepth(tunnelFloorStone);
for(const c of crossings){
 const half=UNDERPASS_WIDTH/2,ceiling=STEP_TOP-.55,floor=STEP_BASE,positions=[];
 const samples=[-half,half];for(const sign of [-1,1])for(let i=0;i<=16;i++)samples.push(sign*(half-PORTAL_RADIUS+i*PORTAL_RADIUS/16));samples.sort((a,b)=>a-b);
 const point=(end,across,y)=>{const face=c.portalEnds[end],along=face.intercept+face.slope*across;return [c.x+c.dx*along-c.dz*across,y,c.z+c.dz*along+c.dx*across]};
 const quad=(a,b,c,d)=>positions.push(...a,...b,...c,...a,...c,...d);
 for(let i=0;i<samples.length-1;i++){
  const a=samples[i],b=samples[i+1];if(b-a<1e-8)continue;
  const ra=portalRound(a),rb=portalRound(b);
  quad(point(0,a,ceiling-ra),point(1,a,ceiling-ra),point(1,b,ceiling-rb),point(0,b,ceiling-rb));
  quad(point(0,a,floor+ra),point(0,b,floor+rb),point(1,b,floor+rb),point(1,a,floor+ra));
  // Solid aprons beneath the rounded lower lips close them down to the path/support.
  for(const end of [0,1])quad(point(end,a,floor+ra),point(end,b,floor+rb),point(end,b,-2000),point(end,a,-2000));
 }
 for(const side of [-1,1]){const a=side*half;quad(point(0,a,floor+PORTAL_RADIUS),point(1,a,floor+PORTAL_RADIUS),point(1,a,ceiling-PORTAL_RADIUS),point(0,a,ceiling-PORTAL_RADIUS))}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();const lining=mesh(geometry,tunnelFloorStone,0,0,0);lining.userData.secretBridge=c.id===8;
}

const secretStructure=scene.children.slice(structureStart).filter(o=>o.isMesh);
// Logo-only variant: no central court, fountain, or water effects.
const jets=[];
// Square footprints match the four red annotations in SVG coordinates.
const templeSites=TEMPLE_SITES,templeLights=[];
const journey=createJourney();
const experienceButton=document.createElement('button');experienceButton.id='temple-experience';experienceButton.textContent='Explore this temple';experienceButton.hidden=true;$('#temple-actions').append(experienceButton);
experienceButton.onclick=()=>{if(journey.active>=0)showPage('temple-'+journey.active)};
const navigation=createNavigation(polygons,templeSites);
const fireflies=createFireflies(scene,navigation);
const player={x:0,z:0,height:.35};let lastHallPosition={...player};
const portals=[];
const rayMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{tint:{value:new T.Color('#d3e4bd')}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 tint;void main(){float edge=pow(max(0.,sin(vUv.x*3.14159)),3.);float fade=pow(1.-vUv.y,3.);gl_FragColor=vec4(tint,edge*fade*.035);}'});

// Matte side-temple roofs recede into the background from above.
const templeStoneMaps={
 color:marbleLoader.load('public/nature/stone-color.webp'),
 normal:marbleLoader.load('public/nature/stone-normal.webp'),
 roughness:marbleLoader.load('public/nature/stone-rough.webp')
};
templeStoneMaps.color.colorSpace=T.SRGBColorSpace;
for(const map of Object.values(templeStoneMaps))map.wrapS=map.wrapT=T.RepeatWrapping;
const shadowStone=fadeIntoDepth(new T.MeshStandardMaterial({color:'#0b1719',roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
textureStone(shadowStone,.045);
const backgroundRoof=textureStone(new T.MeshStandardMaterial({color:'#0b191b',roughness:1}),.04);
function batchTempleStone(temple){
 const batches=new Map();
 for(const part of temple.children){
  if(!part.isMesh||part.children.length||part.material.transparent)continue;
  const group=batches.get(part.material)||[];
  group.push(part);
  batches.set(part.material,group);
 }
 for(const [material,parts] of batches){
  if(parts.length<2)continue;
  const pieces=parts.map(part=>{
   part.updateMatrix();
   const geometry=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();
   return geometry.applyMatrix4(part.matrix);
  });
  const merged=mergeGeometries(pieces);
  pieces.forEach(piece=>piece.dispose());
  if(!merged)continue;
  const mesh=new T.Mesh(merged,material);
  mesh.castShadow=mesh.receiveShadow=true;
  temple.add(mesh);
  for(const part of parts){temple.remove(part);part.geometry.dispose();}
 }
}
for(const site of templeSites){
 const temple=new T.Group();temple.name=site.name;temple.position.set(site.x,0,site.z);temple.rotation.y=Math.PI/4;scene.add(temple);
 const isSide=site.sx!==603;

 const body=(isSide?shadowStone:stone).clone();textureStone(body);fadeIntoDepth(body);body.map=templeStoneMaps.color;body.normalMap=templeStoneMaps.normal;body.normalScale=new T.Vector2(.5,.5);body.roughnessMap=templeStoneMaps.roughness;body.bumpMap=null;
 const accent=new T.MeshStandardMaterial({color:isSide?'#142629':site.color,metalness:isSide?0:.55,roughness:isSide?1:.32});
 if(isSide)textureStone(accent,.035);else{accent.map=metalGrain;accent.roughnessMap=metalGrain;accent.bumpMap=metalGrain;accent.bumpScale=.012}
 const roof=isSide?backgroundRoof:stone;
 const roofTrim=isSide?backgroundRoof:accent;
 // 5.35-unit square = 7.56-unit diamond, matching each marked footprint.
 const plinthWidth=isSide?5.25:54*.14/Math.SQRT2;
 if(isSide){
  // One inset tread only. The pillar-aligned plinth drops vertically into darkness.
  const half=plinthWidth/2,outline=[[-half,-half],[half,-half],[half,half],[-half,half]].map(([u,v])=>[site.x+(u+v)/Math.SQRT2,site.z+(-u+v)/Math.SQRT2]);
  const sign=Math.sign(site.x),dx=-sign/Math.SQRT2,dz=sign/Math.SQRT2,landing=half-STAIR_RUN;
  body.side=T.DoubleSide;body.transparent=false;body.opacity=1;body.depthWrite=true;body.depthTest=true;deck(outline,(x,z)=>templeFloorHeight(site,x,z),body,[{x:site.x,z:site.z,dx,dz,half:landing+5}],2000,true,true);
 }else{
  // The original emblem diamond supplies the continuous deep base; do not overlay another near-coplanar shell.
  // deck() rounds the polar foundation to STEP_TOP (.35), not its input height (.15).
  // Start the plinth exactly there so their side faces never overlap.
  const baseTop=stepHeight(.15),plinthTop=.525;
  box(plinthWidth,plinthTop-baseTop,plinthWidth,0,(plinthTop+baseTop)/2,0,body,temple);box(5.05,.18,5.05,0,.61,0,accent,temple);
 }
 for(const x of [-1.95,1.95])for(const z of [-1.95,1.95]){
  if(isSide){const floor=templeFloorHeight(site,site.x+(x+z)/Math.SQRT2,site.z+(-x+z)/Math.SQRT2);box(.68,.82-(floor),.68,x,(floor+.82)/2,z,body,temple)}
  cylinder(.24,.32,2.8,x,2.05,z,body,temple);
  navigation.obstacles.push({kind:'circle',x:site.x+(x+z)/Math.SQRT2,z:site.z+(-x+z)/Math.SQRT2,radius:.4,bottom:.65+temple.position.y,top:3.55+temple.position.y});
  box(.68,.18,.68,x,.82,z,accent,temple);box(.68,.18,.68,x,3.42,z,accent,temple);
 }
 box(5.15,.28,5.15,0,3.65,0,roof,temple);
 box(4.7,.18,4.7,0,3.88,0,roofTrim,temple);
 box(3.8,.2,3.8,0,4.07,0,roof,temple);
 navigation.obstacles.push({kind:'box',x:site.x,z:site.z,hx:2.575,hz:2.575,angle:Math.PI/4,bottom:3.51+temple.position.y,top:4.2+temple.position.y});
 detailTemple(temple,site,body,accent);batchTempleStone(temple);const ray=new T.Mesh(new T.CylinderGeometry(.8,2.5,11,24,1,true),rayMat.clone());ray.material.uniforms.tint.value.set(site.color);ray.position.set(site.x,6,site.z);scene.add(ray);
 // Pigment-coloured light makes every sanctuary visible without brightening its roof.
 const templeLight=new T.PointLight(site.color,35,13,2);templeLight.position.set(0,1.8,0);temple.add(templeLight);templeLights.push(templeLight);
 const haloMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{colour:{value:new T.Color(site.color)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform vec3 colour;void main(){float r=length(vUv-.5)*2.;float a=(1.-smoothstep(.35,1.,r))*.4;gl_FragColor=vec4(colour,a);}'});
 const halo=new T.Mesh(new T.PlaneGeometry(11,11),haloMaterial);halo.rotation.x=-Math.PI/2;halo.position.y=.73;temple.add(halo);
 const portalMat=new T.MeshBasicMaterial({color:site.color,transparent:true,opacity:.15,side:T.DoubleSide});
 for(let side=0;side<4;side++){const angle=side*Math.PI/2;const portal=mesh(new T.PlaneGeometry(3.2,2.5),portalMat,Math.sin(angle)*1.96,2.05,Math.cos(angle)*1.96,temple);portal.rotation.y=angle;portals.push(portal)}
}
const nature=createNature(scene,polygons,templeSites,navigation);
const glassApproaches=createGlassApproaches(scene,templeSites,polygons);
const orbMat=new T.ShaderMaterial({transparent:true,uniforms:{bumpOffset:{value:new T.Vector2()},palette:{value:templeSites.map(s=>new T.Color(s.color))},colourCount:{value:0},glitch:{value:0},time:{value:0},pigment:{value:0},tint:{value:new T.Color('#d9a751')}},vertexShader:'uniform vec2 bumpOffset;uniform float glitch;uniform float time;varying vec3 p;varying vec3 n;void main(){p=position;n=normalize(normalMatrix*normal);vec3 distorted=position;distorted.xz+=bumpOffset;distorted.x+=sin(floor(position.y*18.)*7.+time*80.)*glitch*.3;gl_Position=projectionMatrix*modelViewMatrix*vec4(distorted,1.);}',fragmentShader:'uniform vec3 palette[4];uniform float colourCount;uniform float glitch;varying vec3 p;varying vec3 n;uniform float time;uniform float pigment;uniform vec3 tint;void main(){if(glitch>0.&&fract(sin(floor(gl_FragCoord.y/3.)*12.98+floor(time*30.))*43758.54)<glitch*.7)discard;float flow=sin(p.y*9.+sin(p.x*7.+time*.7)*2.+p.z*4.-time)*.5+.5;float rim=pow(1.-abs(n.z),2.);vec3 grey=vec3(.66,.79,.77);vec3 pigmentColor=palette[0];float wave=sin(p.y*5.+sin(p.x*6.+time*.35)+p.z*4.-time*.3)*.5+.5;for(int i=1;i<4;i++){float enabled=clamp(colourCount-float(i),0.,1.);float lane=sin(p.x*5.+p.y*7.+p.z*3.+float(i)*2.1+sin(time*.4+p.z*5.))* .5+.5;pigmentColor=mix(pigmentColor,palette[i],smoothstep(.28,.72,lane)*enabled);}vec3 spectrum=.55+.45*cos(6.28318*(vec3(0.,.33,.67)+wave*.7+time*.035));pigmentColor=mix(pigmentColor,spectrum,clamp(colourCount-3.,0.,1.)*pigment);vec3 amber=mix(pigmentColor*.45,pigmentColor*1.25,flow);vec3 col=mix(grey,amber,min(1.,colourCount)*(.3+.7*flow));gl_FragColor=vec4(mix(col+rim*.6,vec3(.65,1.,.93),glitch*.6),(.58+rim*.4)*(1.-glitch*.5));}'});const orb=mesh(new T.SphereGeometry(.65,48,32),orbMat,player.x,player.height+FLOAT_HEIGHT,player.z);const glow=new T.PointLight('#dcefe1',4,7);orb.add(glow);
const dustGeo=new T.BufferGeometry(),dustPositions=[],dustSeeds=[],dustSizes=[];
for(let i=0;i<(innerWidth<=650?300:700);i++){dustPositions.push((Math.random()-.5)*100,Math.random()*21-2,(Math.random()-.5)*100);dustSeeds.push(Math.random()*Math.PI*2);dustSizes.push(.045+Math.random()*.085)}
dustGeo.setAttribute('position',new T.Float32BufferAttribute(dustPositions,3));dustGeo.setAttribute('seed',new T.Float32BufferAttribute(dustSeeds,1));dustGeo.setAttribute('size',new T.Float32BufferAttribute(dustSizes,1));
const dustMat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},pixelScale:{value:innerHeight*renderer.getPixelRatio()},colour:{value:new T.Color('#d5e5de')}},vertexShader:'attribute float seed;attribute float size;uniform float time;uniform float pixelScale;varying float fade;void main(){vec3 p=position;p.x+=sin(time*.11+seed+p.y*.12)*.65;p.z+=cos(time*.09+seed*1.7)*.5;p.y+=sin(time*.07+seed)*.4;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(size*pixelScale/max(1.,-mv.z),1.,6.);fade=(.12+.16*(.5+.5*sin(seed+time*.13)))*(1.-smoothstep(20.,90.,-mv.z));}',fragmentShader:'uniform vec3 colour;varying float fade;void main(){float r=length(gl_PointCoord-.5)*2.;float a=exp(-r*r*4.)*(1.-smoothstep(.75,1.,r))*fade;gl_FragColor=vec4(colour,a);}'});
const dust=new T.Points(dustGeo,dustMat);dust.frustumCulled=false;scene.add(dust);
const mistUniforms={time:{value:0}};const mistMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:mistUniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){vec2 p=vUv-.5;float edge=1.-smoothstep(.12,.5,length(p));float ribbons=pow(.5+.5*sin(p.x*13.+sin(p.y*9.+time*.035)*2.+time*.025),3.);gl_FragColor=vec4(.66,.73,.82,edge*ribbons*.085);}' });
softenMistMaterial(mistMaterial);
for(let i=0;i<3;i++){const mist=new T.Mesh(new T.PlaneGeometry(145,145),mistMaterial);mist.userData.softClouds=true;mist.rotation.x=-Math.PI/2;mist.rotation.z=i*1.9;mist.position.y=-8-i*9;scene.add(mist);}
const rimLight=new T.DirectionalLight('#e1dbfa',1.1);rimLight.position.set(25,12,-35);scene.add(rimLight);
const ambientBase=new T.Color('#e6efff'),ambientWarm=new T.Color('#f0dec8'),ambientCool=new T.Color('#bedce5'),ambientTarget=new T.Color();
function updateAtmosphere(dt,t){mistUniforms.time.value=reduced?0:t;
 const blend=.5+.5*Math.sin(player.x*.065+player.z*.085);ambientTarget.copy(ambientWarm).lerp(ambientCool,blend).lerp(ambientBase,.65);
 const speed=1-Math.exp(-dt*.8);ambient.color.lerp(ambientTarget,speed);ambient.intensity=T.MathUtils.lerp(ambient.intensity,2.8+.12*Math.cos(player.x*.045-player.z*.07),speed);
 dustMat.uniforms.colour.value.copy(ambient.color);if(!reduced)dustMat.uniforms.time.value=t;dustMat.uniforms.pixelScale.value=innerHeight*renderer.getPixelRatio();
}

const interiors=createInteriors(renderer,templeSites,orbMat);
let templeCooldown=0;
const secret=createSecret(scene,secretStructure,stone);
const inhabitants=createInhabitants(scene,navigation,camera);
let sanctumSequence=null;
function playSanctumOpening(){
 if(sanctumSequence)return;
 score.cue('lowering');
 const duration=2500,frames=[];
 const quiet=matchMedia('(prefers-reduced-motion:reduce)').matches;
 for(let i=0;i<=75;i++){
  const u=i/75,t=u*duration/1000;
  const strength=quiet?0:Math.min(1,u*8,(1-u)*5);
  const x=(Math.sin(t*43)+.55*Math.sin(t*71))*4*strength;
  const y=(Math.sin(t*51)+.4*Math.sin(t*87))*2.5*strength;
  frames.push({transform:'translate('+x+'px,'+y+'px) scale('+(1+.045*strength)+')'});
 }
 sanctumSequence=renderer.domElement.animate(frames,{duration,easing:'linear'});
 sanctumSequence.onfinish=()=>{
  sanctumSequence=null;
  const message='Someone opened the Secret Sanctum...';
  notify(message);
  const notice=document.querySelector('#notice');
  notice.style.visibility='visible';notice.style.zIndex='100';
  setTimeout(()=>{notice.style.removeProperty('visibility');notice.style.removeProperty('z-index');},5600);
 };
}
let visitorView=null;
const visitorPose=new T.PerspectiveCamera(),visitorOffset=new T.Vector3(0,7,9);
function showVisitor(peer){
 if(visitorView || !entered || panel.open || quickNav.active || interiors.state.index>=0 || templeTransfer || inhabitants.chatting)return;
 velocity.set(0,0);
 visitorView={peer,started:performance.now(),focus:peer.mesh.position.clone(),returnAt:null,returnWeight:1};
}
function updateVisitorView(now){
 const view=visitorView;
 if(!view)return;
 if(!entered || quickNav.active || quickNav.open || homeReturn || panel.open || templeTransfer || interiors.state.index>=0 || secret.state.phase==='falling' || secret.state.phase==='chamber'){
  visitorView=null;return;
 }
 const travel=reduced?0:1000,elapsed=now-view.started;
 let weight=travel?T.MathUtils.smoothstep(elapsed,0,travel):1;
 if(view.returnAt===null){
  if(view.peer.alive && view.peer.mesh.visible)view.focus.copy(view.peer.mesh.position);
  if(!view.peer.alive || !view.peer.mesh.visible || elapsed>=travel+3000){
   view.returnAt=Math.min(now,view.started+travel+3000);view.returnWeight=weight;
  }
 }
 if(view.returnAt!==null){
  weight=travel?view.returnWeight*(1-T.MathUtils.smoothstep(now-view.returnAt,0,travel)):0;
  if(weight<=0){visitorView=null;return;}
 }
 visitorPose.position.copy(view.focus).add(visitorOffset);
 visitorPose.lookAt(view.focus);
 camera.position.lerp(visitorPose.position,weight);
 camera.quaternion.slerp(visitorPose.quaternion,weight);
 camera.updateMatrixWorld();
}
const presence=createPresence(scene,navigation,()=>{
 secret.unlock(true);playSanctumOpening();
},showVisitor,inhabitants);
navigation.heightTransform=(x,z,y,id)=>[9,102,106].includes(id)?secret.height(x,z,y,id):y;
const mobileView=matchMedia('(any-pointer:coarse), (max-width:650px)').matches||navigator.maxTouchPoints>0;
let zoomTarget=1,zoomBlend=zoomTarget;
// Menu approaches follow the marked doorways in the top-down emblem:
// Creation southwest; Knowledge southeast; Intelligence northeast; Origin southeast.
const menuDoorNormals=[[-1,1],[1,1],[1,-1],[1,1]].map(([x,z])=>({x:x/Math.SQRT2,z:z/Math.SQRT2}));
let templeTransfer=null;
function beginTempleTransfer(index){interiors.returnImmediately();if(secret.state.phase==='chamber'||secret.state.phase==='falling')secret.leave(player);if(!entered)enter();descent=performance.now()-4500;resetTouch();templeTransfer={index,elapsed:0,relocated:false,camera:camera.clone()};}
function updateTempleTransfer(dt){if(!templeTransfer)return;const tr=templeTransfer;tr.elapsed+=dt;const t=tr.elapsed,site=templeSites[tr.index];orbMat.uniforms.glitch.value=reduced?0:t<.45?t/.45:t<.8?1:t<1.35?1-(t-.8)/.55:0;orb.visible=t<.45;
 if(t>=.6&&!tr.relocated){tr.relocated=true;const normal=menuDoorNormals[tr.index];player.x=site.x+normal.x*3.2;player.z=site.z+normal.z*3.2;player.height=templeFloorHeight(site,player.x,player.z);lastHallPosition={...player};tr.front={...player};orb.position.set(player.x,player.height+FLOAT_HEIGHT,player.z);}
 if(t>=1.5&&tr.front){const u=entranceEase((t-1.5));player.x=T.MathUtils.lerp(tr.front.x,site.x,u);player.z=T.MathUtils.lerp(tr.front.z,site.z,u);player.height=templeFloorHeight(site,player.x,player.z);orb.position.set(player.x,player.height+FLOAT_HEIGHT,player.z);}
 if(t>=2.5){templeTransfer=null;orb.visible=false;orbMat.uniforms.glitch.value=0;templeCooldown=0;teleport(tr.index,tr.front);interiors.hideArrivalOrb();}}
const quickNav=createQuickNav(camera,templeSites,templeLights,index=>beginTempleTransfer(index),()=>resetTouch(),orb,()=>interiors.state.index>=0?templeSites[interiors.state.index]:null);
function overOpeningOrb(event){if(entered||quickNav.active||homeReturn||!orb.visible)return false;camera.updateMatrixWorld();const p=orb.position.clone().project(camera),rect=renderer.domElement.getBoundingClientRect();return p.z<1&&Math.hypot(event.clientX-(rect.left+(p.x*.5+.5)*rect.width),event.clientY-(rect.top+(-p.y*.5+.5)*rect.height))<=24;}
renderer.domElement.addEventListener('click',event=>{if(overOpeningOrb(event))$('#enter').click();});
renderer.domElement.addEventListener('pointermove',event=>{renderer.domElement.style.cursor=overOpeningOrb(event)?'pointer':'';});
renderer.domElement.addEventListener('pointerleave',()=>{renderer.domElement.style.cursor='';});

addEventListener('wheel',event=>{if(quickNav.open){event.preventDefault();if(event.deltaY<=0)return;quickNav.toggle(false);zoomTarget=mobileView?.72:1;if(!entered)enter();return;}if(!entered||panel.open||interiors.state.index>=0)return;event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);zoomTarget=T.MathUtils.clamp(zoomTarget+delta*.0015,0,1)},{passive:false});
const entranceEase=value=>{const u=T.MathUtils.clamp(value,0,1);return u*u*u*(u*(u*6-15)+10);};
const hoverBase={position:camera.position.clone(),quaternion:camera.quaternion.clone(),look:new T.Vector3(),scale:0};let homeReturn=null,homePending=false;let controlsIntroduced=false;let descent=0;async function enter(){if(entered||homeReturn)return;if(mobileView){zoomTarget=1;zoomBlend=1;}entered=true;const intro=$('#intro');intro.classList.add('departing');intro.inert=true;setTimeout(()=>{if(entered)intro.hidden=true;intro.classList.remove('departing')},reduced?0:750);$('#hud').hidden=false;document.body.classList.add('exploring');updateTouchUI(true);if(!controlsIntroduced){controlsIntroduced=true;setTimeout(()=>{if(!entered)return;document.body.classList.add('controls-introduction');setTimeout(()=>document.body.classList.remove('controls-introduction'),3000);},reduced?0:800);}descent=performance.now();try{await score.start();$('#sound').title='Turn sound off';$('#sound').setAttribute('aria-pressed','true')}catch{notify('Audio unavailable. You can still explore.')}}
function returnToOpening(){
 if(homeReturn)return;
 if(interiors.state.index>=0){homePending=true;interiors.leave();return;}
 homePending=false;mouseTilt.set(0,0);if(quickNav.active){hoverBase.position.copy(camera.position);hoverBase.quaternion.copy(camera.quaternion);hoverBase.look.set(0,0,0);hoverBase.scale=0;}if(secret.state.phase==='chamber'||secret.state.phase==='falling')secret.leave(player);
 homeReturn={elapsed:0,position:hoverBase.position.clone(),quaternion:hoverBase.quaternion.clone(),look:hoverBase.look.clone(),scale:hoverBase.scale};
 entered=false;templeTransfer=null;quickNav.toggle(false);keys.clear();velocity.set(0,0);resetTouch();$('#joystick').hidden=true;
 document.body.classList.remove('exploring');$('#hud').hidden=true;
 const intro=$('#intro');intro.hidden=false;intro.inert=false;intro.classList.remove('departing');intro.classList.add('returning');
 const instructions=$('#instructions');instructions.classList.add('copy-fading');setTimeout(()=>{instructions.textContent='BESPOKE SERVICES FOR THE DIGITAL ELITE';instructions.classList.remove('copy-fading')},reduced?0:400);
}
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();if(panel.open)panel.close();returnToOpening();});
const requestedTemple=templeSites.findIndex(t=>t.name.toLowerCase()===new URLSearchParams(location.search).get('temple'));if(requestedTemple>=0)$('#enter').textContent='Enter '+templeSites[requestedTemple].name;$('#enter').onclick=()=>{enter();if(requestedTemple>=0)beginTempleTransfer(requestedTemple)};$('#sound').onclick=async()=>{if(!score.ctx){await score.start();$('#sound').title='Turn sound off';$('#sound').setAttribute('aria-pressed','true')}else{const on=score.mute();$('#sound').title=on?'Turn sound off':'Turn sound on';$('#sound').setAttribute('aria-pressed',on)}};
function teleport(destination,approach=null){if(interiors.state.index>=0){interiors.leave();return;}if(secret.state.phase==='chamber'||secret.state.phase==='falling'){secret.leave(player);orb.visible=true;resetTouch();return;}if(!entered)enter();const index=destination===true?0:destination===false?-1:Number(destination);const site=templeSites[index];player.x=site?site.x:0;player.z=site?site.z:0;player.height=site?templeFloorHeight(site,site.x,site.z):.35;lastHallPosition=approach?{...approach}:site?{x:site.x+Math.cos(Math.atan2(site.z,site.x))*2.4,z:site.z+Math.sin(Math.atan2(site.z,site.x))*2.4,height:player.height}:{...player};velocity.set(0,0);orb.position.set(player.x,player.height+FLOAT_HEIGHT,player.z);checkTemple()}
$('#travel').onclick=()=>showPage('map');$('#travel').textContent='Choose a temple';$('#return').onclick=()=>teleport(false);
// An exit must restore a supported, collision-free footprint, not a guessed plinth height.
function restoreHallPosition(site){
 navigation.movingOrb='player';
 // Fixed exits match the marked hall positions: north SE, east NW, south NW, west SE.
 const offset=[[3.4,3.4],[-3.8,-3.8],[-3.4,-3.4],[3.8,3.8]][site.index];
 const desired={x:site.x+offset[0],z:site.z+offset[1],height:lastHallPosition.height};
 const candidates=navigation.surfaces(desired.x,desired.z).map(height=>({...desired,height}));
 const heading=Math.atan2(desired.z-site.z,desired.x-site.x);
 for(let radius=2.8;radius<=8;radius+=.35)for(let j=0;j<16;j++){
  const a=heading+(j%2?-1:1)*Math.ceil(j/2)*Math.PI/8;
  const x=site.x+Math.cos(a)*radius,z=site.z+Math.sin(a)*radius;
  for(const height of navigation.surfaces(x,z))candidates.push({x,z,height});
 }
 const safe=candidates.find(p=>{
  if(templeAt(p.x,p.z,p.height)>=0||navigation.valid(p.x,p.z,p.height)===null)return false;
  return [[.2,0],[-.2,0],[0,.2],[0,-.2]].some(([dx,dz])=>navigation.valid(p.x+dx,p.z+dz,p.height)!==null);
 });
 if(safe){Object.assign(player,safe);player.height=navigation.valid(safe.x,safe.z,safe.height);lastHallPosition={...player};}
 navigation.movingOrb=null;resetTouch();orb.visible=true;orb.position.set(player.x,player.height+FLOAT_HEIGHT,player.z);
}
const hudElements=Object.fromEntries(['zone','objective','hint','return','travel'].map(id=>[id,document.getElementById(id)]));
function checkTemple(){
 if(interiors.state.index>=0||secret.state.phase!=='locked')hudElements.hint.classList.remove('temple-invitation');
 if(interiors.state.index>=0){const site=templeSites[interiors.state.index];setText(hudElements.zone,'TEMPLE OF '+site.name.toUpperCase());setText(hudElements.objective,interiors.near?.label||site.heading);setText(hudElements.hint,interiors.near?'A first study in '+site.theme.toLowerCase()+'.': 'Explore the three studies. Cross a glowing threshold to return.');hudElements.travel.hidden=true;hudElements.return.hidden=false;setText(hudElements.return,'Return to the Mantrium');experienceButton.hidden=true;return;}

 if(secret.state.phase==='chamber'){setText(hudElements.zone,'THE SECRET SANCTUM');setText(hudElements.objective,'A moment of insight.');setText(hudElements.hint,'Approach Guru for a personal reading.');hudElements.travel.hidden=true;hudElements.return.hidden=true;setText(hudElements.return,'Return to the Mantrium');experienceButton.hidden=true;return;}
 setText(hudElements.return,'Return to the centre');

 const next=templeAt(player.x,player.z,player.height),event=journey.update(next);
 if(event.exited>=0){const site=templeSites[event.exited];visited=true;pigmentAt=performance.now()/1000;if(score.gains)score.addTemple(event.exited);orbMat.uniforms.pigment.value=0;const colours=[...journey.completed].map(i=>new T.Color(templeSites[i].color));const tint=new T.Color(0,0,0);colours.forEach(c=>tint.add(c));tint.multiplyScalar(1/colours.length);orbMat.uniforms.tint.value.copy(tint);orbMat.uniforms.colourCount.value=colours.length-1;colours.forEach((c,i)=>orbMat.uniforms.palette.value[i].copy(c));notify(site.name+' stays with you. '+site.pigment[0].toUpperCase()+site.pigment.slice(1)+' and a new harmony emerge together.')}
 if(journey.completed.size===4&&secret.unlock()){presence.announceOpening();playSanctumOpening();}
 inside=next>=0;const site=templeSites[next];
 if(event.entered>=0&&performance.now()>templeCooldown){notify('Welcome to '+site.name+'. '+site.theme+'.');interiors.enter(next,()=>{templeCooldown=performance.now()+1800;orb.visible=true;checkTemple();},{prepareExit:()=>{restoreHallPosition(site);visualHeight=player.height;velocity.set(0,0);},hideAtStart:!orb.visible,x:player.x,z:player.z,height:player.height,dx:(lastHallPosition.x-site.x)/Math.max(.01,Math.hypot(lastHallPosition.x-site.x,lastHallPosition.z-site.z)),dz:(lastHallPosition.z-site.z)/Math.max(.01,Math.hypot(lastHallPosition.x-site.x,lastHallPosition.z-site.z))});}
 setText(hudElements.zone,site?'TEMPLE OF '+site.name.toUpperCase():'THE CENTRAL CROSSING');
 setText(hudElements.objective,site?site.heading:visited?'Carry what you discover.':'Follow your curiosity.');
 hudElements.hint.classList.toggle('temple-invitation',!site&&!visited&&secret.state.phase==='locked');
 setText(hudElements.hint,site?site.theme+'. Leave on any side to carry its '+site.pigment+' pigment.':visited?journey.completed.size+' of '+templeSites.length+' temples visited.':'enter a temple');
 if(!inside&&secret.state.phase!=='locked'){setText(hudElements.objective,secret.state.phase==='lowering'?'The centre is opening.':'A passage awaits.');setText(hudElements.hint,'4 of 4 temples visited. Return to the centre and enter the circular opening.');}
 hudElements.travel.hidden=inside;hudElements.return.hidden=!inside;experienceButton.hidden=!inside;
}
const keys=new Set(),velocity=new T.Vector2(),stick=new T.Vector2();addEventListener('keydown',e=>{if(e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input,textarea,select,[contenteditable="true"]') || (e.key===' ' && e.target.closest('button,a[href]')) || panel.open||(document.body.classList.contains('temple-ui')&&!document.body.classList.contains('temple-gallery')))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='m'&&!e.repeat)showPage('map')});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();stick.set(0,0)});panel.addEventListener('close',()=>keys.clear());const joy=$('#joystick');
let stickPointer=null,stickBounds=null;
const touchPoints=new Map();let pinchDistance=null;
function updateTouchUI(fade=false){const touch=matchMedia('(any-pointer:coarse), (max-width:650px)').matches||navigator.maxTouchPoints>0;joy.hidden=!entered||!touch;const instructions=$('#instructions'),text=touch?'☉ = Move · Pinch = Zoom · Double Tap = Speak · Triple Tap = Pulse':'WASD / <svg class="ui-arrow" width="1em" height="1em" role="img" aria-label="up arrow" focusable="false"><use href="public/ui-arrows.svg#up"></use></svg><svg class="ui-arrow" width="1em" height="1em" role="img" aria-label="left arrow" focusable="false"><use href="public/ui-arrows.svg#left"></use></svg><svg class="ui-arrow" width="1em" height="1em" role="img" aria-label="down arrow" focusable="false"><use href="public/ui-arrows.svg#down"></use></svg><svg class="ui-arrow" width="1em" height="1em" role="img" aria-label="right arrow" focusable="false"><use href="public/ui-arrows.svg#right"></use></svg> = MOVE · SCROLL = ZOOM IN / OUT · / = SPEAK · P = SEND PULSE · M = MAP';if(fade&&!reduced){instructions.classList.add('copy-fading');setTimeout(()=>{instructions.innerHTML=text;instructions.classList.remove('copy-fading')},400)}else instructions.innerHTML=text;}
function resetStick(){stickPointer=null;stickBounds=null;stick.set(0,0);velocity.set(0,0);joy.firstElementChild.style.transform='none'}
addEventListener('mantrium:reading-open',()=>{resetTouch();velocity.set(0,0)});
function resetTouch(){resetStick();touchPoints.clear();pinchDistance=null;keys.clear();cancelPulseTap()}
joy.addEventListener('pointerdown',e=>{if(!entered||panel.open||stickPointer!==null)return;e.preventDefault();stickPointer=e.pointerId;stickBounds=joy.getBoundingClientRect();joy.setPointerCapture(e.pointerId);moveStick(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e)});
function moveStick(e){const r=stickBounds,radius=r.width*.38;stick.set((e.clientX-r.left-r.width/2)/radius,(e.clientY-r.top-r.height/2)/radius).clampLength(0,1);joy.firstElementChild.style.transform=`translate(${stick.x*r.width*.27}px,${stick.y*r.height*.27}px)`}
for(const type of ['pointerup','pointercancel','lostpointercapture'])joy.addEventListener(type,e=>{if(e.pointerId===stickPointer)resetStick()});

// Observe taps without consuming joystick, camera or scrolling gestures.
const pulseExcluded = 'dialog, #instructions, .temple-reading, .speech-bubble, nav, #quick-nav, header, a, button, input, textarea, select, [contenteditable="true"], [role="button"], [role="navigation"], [role="menuitem"]';
let pulseTouch = null;
let previousTap = null;
let pendingSpeech = null;
const thirdTapWindow = 240;
const tapOptions = {capture:true, passive:true};
function cancelPulseTap(){
  clearTimeout(pendingSpeech);
  pendingSpeech=null;
  pulseTouch=null;
  previousTap=null;
}
document.addEventListener('touchstart',event=>{
  if(!entered || panel.open || quickNav.open || event.touches.length!==1 || event.target.closest(pulseExcluded)){
    cancelPulseTap();
    return;
  }
  const t=event.changedTouches[0];
  const now=performance.now();
  if(previousTap){
    const gap=previousTap.count===2?thirdTapWindow:350;
    if(now-previousTap.time>gap || Math.hypot(t.clientX-previousTap.x,t.clientY-previousTap.y)>32){
      cancelPulseTap();
    }else if(previousTap.count===2){
      // Reserve the third tap on contact, even when it lifts after the deadline.
      clearTimeout(pendingSpeech);
      pendingSpeech=null;
    }
  }
  pulseTouch={id:t.identifier,x:t.clientX,y:t.clientY,time:now};
},tapOptions);
document.addEventListener('touchmove',event=>{
  if(!pulseTouch)return;
  const t=event.touches[0];
  if(!t || Math.hypot(t.clientX-pulseTouch.x,t.clientY-pulseTouch.y)>10)cancelPulseTap();
},tapOptions);
document.addEventListener('touchcancel',cancelPulseTap,tapOptions);
document.addEventListener('touchend',event=>{
  const start=pulseTouch;
  pulseTouch=null;
  if(!start)return;
  const t=event.changedTouches[0], now=performance.now();
  if(event.touches.length || t.identifier!==start.id || now-start.time>250 ||
     Math.hypot(t.clientX-start.x,t.clientY-start.y)>10 ||
     document.elementFromPoint(t.clientX,t.clientY)?.closest(pulseExcluded)){
    cancelPulseTap();
    return;
  }
  if(previousTap){
    event.preventDefault();
    if(previousTap.count===2){
      cancelPulseTap();
      presence.sendPulse();
    }else{
      previousTap={count:2,x:t.clientX,y:t.clientY,time:now};
      pendingSpeech=setTimeout(()=>{
        cancelPulseTap();
        if(entered && !document.hidden && !panel.open && !quickNav.open)inhabitants.startChat();
      },thirdTapWindow);
    }
  }else previousTap={count:1,x:t.clientX,y:t.clientY,time:now};
},{capture:true,passive:false});
const canvas=renderer.domElement;
function pinch(){if(interiors.state.index>=0)return;if(touchPoints.size!==2){pinchDistance=null;return}const [a,b]=[...touchPoints.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(quickNav.open){if(pinchDistance>0&&distance>pinchDistance*1.015){quickNav.toggle(false);zoomTarget=innerWidth<=650?.72:1;}pinchDistance=distance;return;}if(pinchDistance>0&&distance>0)zoomTarget=T.MathUtils.clamp(zoomTarget+Math.log(distance/pinchDistance)*1.5,0,1);pinchDistance=distance}
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||!entered||panel.open)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});pinch()});
canvas.addEventListener('pointermove',e=>{if(!touchPoints.has(e.pointerId))return;e.preventDefault();touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});pinch()});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{touchPoints.delete(e.pointerId);pinchDistance=null});
addEventListener('blur',resetTouch);addEventListener('resize',resetTouch);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetTouch()});panel.addEventListener('close',resetTouch);new MutationObserver(()=>{if(panel.open)resetTouch()}).observe(panel,{attributes:true,attributeFilter:['open']});matchMedia('(any-pointer:coarse), (max-width:650px)').addEventListener('change',updateTouchUI);

// Reuse transient frame math; never retain these scratch values in scene objects.
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
const frameInput=new T.Vector2(),zeroTilt=new T.Vector2(),overviewPosition=new T.Vector3(),frameLook=new T.Vector3();
const mouseTilt=new T.Vector2(),smoothedTilt=new T.Vector2();
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!finePointer.matches)return;mouseTilt.set((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2)});
document.documentElement.addEventListener('pointerleave',()=>mouseTilt.set(0,0));addEventListener('blur',()=>mouseTilt.set(0,0));
let visualHeight=player.height;let lastSecretPhase=secret.state.phase;let last=performance.now();
let frameBudgetStart=0,framesInBudget=0,slowFramesInBudget=0,lastShadowUpdate=-Infinity;
function adjustRenderResolution(now,frameTime){
 if(document.hidden){
  frameBudgetStart=0;
  framesInBudget=0;
  slowFramesInBudget=0;
  return;
 }
 if(!frameBudgetStart){frameBudgetStart=now;return;}
 framesInBudget++;
 if(frameTime>25)slowFramesInBudget++;
 const elapsed=now-frameBudgetStart;
 if(elapsed<1000)return;
 const fps=framesInBudget*1000/elapsed;
 const pixelRatio=renderer.getPixelRatio();
 if(pixelRatio>minimumPixelRatio&&(fps<53||slowFramesInBudget/framesInBudget>.15)){
  renderer.setPixelRatio(Math.max(minimumPixelRatio,pixelRatio*.85));
 }
 frameBudgetStart=now;
 framesInBudget=0;
 slowFramesInBudget=0;
}
function updateCanvasPresentation(canvas, opacity, zoom) {
 const opacityText = String(opacity);
 const zoomText = zoom.toFixed(3);
 if (canvas.style.opacity !== opacityText) canvas.style.opacity = opacityText;
 if (canvas.dataset.viewZoom !== zoomText) canvas.dataset.viewZoom = zoomText;
}
const bumpDirection=new T.Vector2();
let bumpStarted=-Infinity,holdingBoundary=false;
function checkBoundaryImpact(now,dx,dz,movedX,movedZ,steering){
 const travel=dx*dx+dz*dz;
 if(reduced || !steering || travel<1e-10){holdingBoundary=false;return;}
 // A glancing slide preserves motion along the intended direction.
 const progress=(dx*movedX+dz*movedZ)/travel;
 if(progress>.55){holdingBoundary=false;return;}
 if(progress>.18 || holdingBoundary)return;
 holdingBoundary=true;
 bumpStarted=now;
 bumpDirection.set(dx,dz).normalize();
}
function drawBoundaryBump(now){
 const phase=Math.min(1,(now-bumpStarted)/310);
 const shift=phase<1 ? .22*Math.sin(phase*Math.PI*2)*(1-phase)**2 : 0;
 orbMat.uniforms.bumpOffset.value.copy(bumpDirection).multiplyScalar(shift);
}
const target=new T.Vector3(),look=new T.Vector3(),blendedRotation=new T.Quaternion();
function animate(now){requestAnimationFrame(animate);adjustRenderResolution(now,now-last);
 if(!document.hidden&&now-lastShadowUpdate>=(mobileRender?350:125)&&interiors.state.index<0){
  sun.shadow.needsUpdate=true;
  lastShadowUpdate=now;
 }
 const dt=Math.min((now-last)/1000,.08);last=now;const t=now/1000;orbMat.uniforms.time.value=reduced?0:t;const hallVisible=interiors.state.blend<1 || quickNav.open || quickNav.active || interiors.state.target===0;
 if(hallVisible){updateAtmosphere(dt,t);cosmos.update(t,reduced);celestial.update(t,reduced,.35-4*secret.state.amount);nature.update(t,reduced,orb.position);glassApproaches.update(t,reduced,camera.position.y,orb.position);clouds.update(t,reduced,mouseTilt,camera.position.y>32,orb.position,camera.position.y);}
 secret.update(dt,player);if(secret.state.phase!==lastSecretPhase){if(secret.state.phase==='falling')score.cue('fall');lastSecretPhase=secret.state.phase;}navigation.orbs=interiors.state.index<0&&secret.state.phase!=='chamber'?[...inhabitants.bodies,...presence.bodies,{owner:'player',x:player.x,z:player.z,y:player.height+FLOAT_HEIGHT,radius:.65}]:[];updateTempleTransfer(dt);interiors.update(dt,reduced);if(homePending&&interiors.state.index<0)returnToOpening();if(score.gains)score.setInterior(interiors.state.index,interiors.state.blend);
if(secret.state.phase==='lowering'||secret.state.phase==='opening'){const heights=navigation.surfaces(player.x,player.z);if(heights.length)player.height=heights.sort((a,b)=>Math.abs(a-player.height)-Math.abs(b-player.height))[0];}
document.body.classList.toggle('secret-interior',secret.state.phase==='chamber');if(secret.state.phase==='chamber'){orb.visible=true;checkTemple();}
if(visited){const elapsed=t-pigmentAt;orbMat.uniforms.pigment.value=T.MathUtils.clamp(elapsed/.8,0,1);orbMat.uniforms.colourCount.value=Math.max(0,journey.completed.size-1)+orbMat.uniforms.pigment.value}if(!reduced){jets.forEach(({p,curve,offset})=>p.position.copy(curve.getPoint((t*.5+offset)%1)));portals.forEach(portal=>portal.material.opacity=.13+Math.sin(t)*.035)}if(entered&&!visitorView&&!panel.open&&!quickNav.active&&!templeTransfer&&!secret.exiting&&!document.body.classList.contains('birth-reading-active')){let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+stick.x,z=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+stick.y;const input=frameInput.set(x,z).clampLength(0,1);input.multiplyScalar(7);
if(stickPointer!==null)velocity.copy(input);
else velocity.lerp(input,1-Math.exp(-18*dt));
const dx=velocity.x*dt,dz=velocity.y*dt;
const inRoom=interiors.state.index>=0;
const position=inRoom?interiors.state:player;
const fromX=position.x,fromZ=position.z;
let canBump=true;
if(inRoom){
 canBump=interiors.move(dx,dz)===true;
}else if(secret.state.phase==='chamber'){
 secret.move(player,dx,dz);
 canBump=!secret.exiting;
}else if(secret.state.phase!=='falling'){
 if(templeAt(player.x,player.z,player.height)<0)Object.assign(lastHallPosition,player);
 if(velocity.lengthSq()>1e-12 || secret.state.phase==='lowering'||secret.state.phase==='opening')navigation.move(player,dx,dz,'player');
}else canBump=false;
checkBoundaryImpact(now,dx,dz,position.x-fromX,position.z-fromZ,canBump && input.lengthSq()>.04);
orb.position.x=player.x;orb.position.z=player.z;checkTemple();
}else{holdingBoundary=false;bumpStarted=-Infinity;}
drawBoundaryBump(now);
if(secret.exiting){orb.position.x=player.x;orb.position.z=player.z;visualHeight=player.height;velocity.set(0,0);keys.clear();stick.set(0,0);}
visualHeight=secret.state.phase==='falling'?player.height:T.MathUtils.damp(visualHeight,player.height,12,dt);orb.position.y=visualHeight+FLOAT_HEIGHT+(reduced?0:Math.sin(t*1.7)*.06);if(entered){zoomBlend=reduced?zoomTarget:T.MathUtils.lerp(zoomBlend,zoomTarget,1-Math.exp(-11*dt));let u=(reduced?1:entranceEase((now-descent)/4500))*zoomBlend;target.set(orb.position.x*.65,20,orb.position.z+23);target.y+=.35;camera.position.lerpVectors(overviewPosition.set(0,105/Math.min(1,camera.aspect),1),target,u);look.set(orb.position.x*.7,.35,orb.position.z-5);camera.lookAt(look.multiplyScalar(u))}else{camera.position.set(0,105/Math.min(1,camera.aspect),1);camera.lookAt(0,0,0)}if(secret.state.phase==='falling'){const follow=T.MathUtils.smoothstep(secret.state.fall,0,1.4);camera.position.y+= (player.height-.35)*follow;look.y+=(player.height-.35)*follow;camera.lookAt(look);}if(secret.state.phase==='chamber'){camera.position.set(player.x*.45,-49,player.z+14);look.set(player.x*.5,-61,player.z-2);const portraitRoom=Math.min(1.8,Math.max(1,.82/camera.aspect));camera.position.sub(look).multiplyScalar(portraitRoom).add(look);camera.lookAt(look);scene.fog.density=.018;}
if(templeTransfer){const amount=entranceEase(Math.max(0,(templeTransfer.elapsed-.45)/2));camera.position.lerpVectors(templeTransfer.camera.position,camera.position,amount);camera.quaternion.copy(blendedRotation.copy(templeTransfer.camera.quaternion).slerp(camera.quaternion,amount));}
const tiltEnabled=entered&&!reduced&&!quickNav.active&&!panel.open&&finePointer.matches;
smoothedTilt.lerp(tiltEnabled?mouseTilt:zeroTilt,1-Math.exp(-3*dt));
let tiltScale=entered?zoomBlend*(reduced?1:entranceEase((now-descent)/4500)):0;
const hoverLook=entered?frameLook.copy(look):frameLook.set(0,0,0);
// Blend the underlying view first, then apply one continuous hover offset.
if(homeReturn){homeReturn.elapsed+=dt;const u=reduced?1:entranceEase(homeReturn.elapsed/2.4);camera.position.lerpVectors(homeReturn.position,camera.position,u);camera.quaternion.copy(blendedRotation.copy(homeReturn.quaternion).slerp(camera.quaternion,u));hoverLook.lerpVectors(homeReturn.look,hoverLook,u);tiltScale=T.MathUtils.lerp(homeReturn.scale,0,u);if(u>=1){homeReturn=null;$('#intro').classList.remove('returning');}}
hoverBase.position.copy(camera.position);hoverBase.quaternion.copy(camera.quaternion);hoverBase.look.copy(hoverLook);hoverBase.scale=tiltScale;
camera.position.x+=smoothedTilt.x*T.MathUtils.lerp(.12,.9,tiltScale);
camera.position.y+=smoothedTilt.y*.65*tiltScale;
camera.position.z+=smoothedTilt.y*.08*(1-tiltScale);
// In overview, translate the aim with the camera to preserve the emblem orientation.
hoverLook.x+=smoothedTilt.x*.12*(1-tiltScale);hoverLook.z+=smoothedTilt.y*.08*(1-tiltScale);
if(!templeTransfer)camera.lookAt(hoverLook);
const menuActive=quickNav.update(dt,reduced);
updateVisitorView(now);
secret.updateLabel(camera);if(secret.exiting||secret.state.justReturned){orbMat.uniforms.glitch.value=reduced?0:secret.glitch;orb.visible=!secret.orbHidden;}
const speechZoomLimit=mobileView?.65:.8;
const speechCameraSettled=(reduced||now-descent>=4500)&&!quickNav.active&&!quickNav.open&&!homeReturn&&!templeTransfer&&Math.abs(zoomBlend-zoomTarget)<.002&&(secret.state.phase!=='chamber'||secret.state.arrival>=1.8);
const muteSpeech=!!visitorView||secret.exiting||!entered||!speechCameraSettled||zoomBlend<speechZoomLimit||zoomTarget<speechZoomLimit;
if(document.body.classList.contains('speech-muted')!==muteSpeech)document.body.classList.toggle('speech-muted',muteSpeech);
fireflies.update(dt,t,orb.position,interiors.state.index<0&&!secret.fade&&secret.state.phase!=='chamber',reduced,innerHeight*renderer.getPixelRatio());
{const body=navigation.orbs.find(o=>o.owner==='player');if(body){body.x=player.x;body.z=player.z;body.y=player.height+FLOAT_HEIGHT;}}presence.update(dt,player,[...journey.completed].reduce((mask,i)=>mask|(1<<i),0),entered&&!templeTransfer&&interiors.state.index<0&&!['falling','chamber'].includes(secret.state.phase),entered);inhabitants.update(dt,t,player,journey.completed.size,!templeTransfer&&interiors.state.index<0&&secret.state.phase!=='falling',reduced,orb.position,secret.state.phase==='chamber',!muteSpeech);updateCanvasPresentation(renderer.domElement, 1 - secret.fade, zoomBlend);scene.fog.color.set(secret.state.phase==='chamber'?'#a4b9bd':'#284449');scene.fog.density=secret.state.phase==='chamber'?.018:.009*Math.min(1,105/Math.max(20,camera.position.y));scene.fog.density=T.MathUtils.lerp(scene.fog.density,.0008,quickNav.blend);updateOrbShadow(orb.visible&&interiors.state.index<0&&secret.state.phase!=='falling'&&secret.state.phase!=='chamber');bloom.render(()=>menuActive&&interiors.state.index<0?renderCloudScene(renderer,scene,camera):interiors.render(scene,camera,zoomBlend,orb,quickNav.blend))}
const updateOrbShadow=createOrbShadow(scene,orb,sun);
requestAnimationFrame(animate);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});if(location.hash==='#work'||location.hash==='#studio')showPage(location.hash.slice(1));

// Exact homogeneous projection of the SVG plane, including perspective and viewport offset.
export function arrivalTransform(){
 camera.updateMatrixWorld();
 const view=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 const o=new T.Vector4((330-603)*.14,STEP_TOP,(45-317)*.14,1).applyMatrix4(view);
 const u=new T.Vector4(.14,0,0,0).applyMatrix4(view);
 const v=new T.Vector4(0,0,.14,0).applyMatrix4(view);
 const rect=renderer.domElement.getBoundingClientRect();
 const screen=p=>[(p.x+p.w)*rect.width/2+rect.left*p.w,(p.w-p.y)*rect.height/2+rect.top*p.w,p.w];
 const a=screen(u),b=screen(v),c=screen(o),w=c[2];
 return `matrix3d(${[a[0]/w,a[1]/w,0,a[2]/w,b[0]/w,b[1]/w,0,b[2]/w,0,0,1,0,c[0]/w,c[1]/w,0,1].join(',')})`;
}

// A cloud-only arrival veil conceals architecture until the emblem is aligned.
export function arrivalCloudVeil(){
 const visibility=scene.children.map(object=>[object,object.visible]);
 const veil=document.createElement('canvas');veil.className='arrival-clouds';
 veil.width=renderer.domElement.width;veil.height=renderer.domElement.height;
 try{
  for(const [object] of visibility)if(!object.userData.softClouds&&!object.isLight)object.visible=false;
  renderCloudScene(renderer,scene,camera);
  veil.getContext('2d').drawImage(renderer.domElement,0,0);
 }finally{for(const [object,visible] of visibility)object.visible=visible;}
 return veil;
}
