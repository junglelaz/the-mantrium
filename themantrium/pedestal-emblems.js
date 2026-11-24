import * as T from 'three';
import {emblemShapes} from './emblem-shapes.js?v=spacing237';
const textures=new T.TextureLoader();
// The source 3PM animation uses an icosahedron with one subdivision and a -0.5 radian tilt.
export function create3PMEmblem(){
 const group=new T.Group(),geometry=new T.IcosahedronGeometry(1.13,1);
 const solid=new T.Mesh(geometry,new T.MeshStandardMaterial({color:'#d5b777',metalness:.72,roughness:.28,flatShading:true}));solid.rotation.z=-.5;group.add(solid);
 return group;
}
export function createBrandEmblem(name){
 const group=new T.Group();group.userData.emblem=true;
 const colours={nature:'#a6c1a7',football:'#d2dbe3',jungle:'#c8bea5'};
 const face=new T.MeshStandardMaterial({color:colours[name],emissive:colours[name],emissiveIntensity:.8,metalness:.38,roughness:.34});
 const edge=new T.MeshStandardMaterial({color:'#52696d',emissive:'#80968f',emissiveIntensity:.35,metalness:.7,roughness:.3});
 const size=name==='jungle'?2.65:2.35;
 const shapes=emblemShapes[name].map(({outline,holes})=>{
  const s=new T.Shape(outline.map(p=>new T.Vector2(...p)));
  s.holes=holes.map(h=>new T.Path(h.map(p=>new T.Vector2(...p))));return s;
 });
 const geo=new T.ExtrudeGeometry(shapes,{depth:.075,bevelEnabled:true,bevelThickness:.012,bevelSize:.008,bevelSegments:3,steps:1,curveSegments:2});
 geo.translate(0,0,-.0375);geo.scale(size,size,size);
 const mesh=new T.Mesh(geo,[face,edge]);group.add(mesh);
 if(name==='jungle'||name==='nature'){
  const map=textures.load('public/emblems/'+name+'.webp');map.colorSpace=T.SRGBColorSpace;
  // UVs follow the traced bounds so the artwork sits on the actual extruded silhouette.
  geo.computeBoundingBox();const b=geo.boundingBox,uv=geo.attributes.uv,p=geo.attributes.position;const bevel=.008*size;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-b.min.x-bevel)/(b.max.x-b.min.x-2*bevel),(p.getY(i)-b.min.y-bevel)/(b.max.y-b.min.y-2*bevel));
  face.map=map;
  // Preserve linework while bringing the bright source pigments into the temple's mineral palette.
  face.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float ink=dot(diffuseColor.rgb,vec3(.299,.587,.114));
   diffuseColor.rgb=mix(vec3(.13,.22,.22),vec3(.82,.84,.69),sqrt(ink));`).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   totalEmissiveRadiance*=mix(.25,1.,sqrt(ink));`);};
  face.customProgramCacheKey=()=> 'temple-emblem-mineral-v2';
 }
 return group;
}
