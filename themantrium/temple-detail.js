import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
export function detailTemple(temple,site,body,accent){
 const original=new Set(temple.children);
 const metal=new T.MeshStandardMaterial({color:site.color,metalness:.72,roughness:.42});
 const add=(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;temple.add(o);return o};
 // Recessed mouldings and carved column collars remain within the existing footprint.
 for(const x of [-1.95,1.95])for(const z of [-1.95,1.95]){
  for(const y of [1.02,1.12,3.05,3.17]){const ring=add(new T.TorusGeometry(.285,.035,6,24),y===1.12||y===3.05?metal:body,x,y,z);ring.rotation.x=Math.PI/2;}
  for(let a=0;a<12;a++){const q=a*Math.PI/6;add(new T.CylinderGeometry(.018,.025,1.7,4),body,x+Math.cos(q)*.25,2.1,z+Math.sin(q)*.25);}
  const cap=add(new T.BoxGeometry(.52,.16,.52),body,x,3.25,z);cap.rotation.y=Math.PI/4;
 }
 for(let side=0;side<4;side++){
  const rail=new T.Group();rail.rotation.y=side*Math.PI/2;temple.add(rail);
  const m=new T.Mesh(new T.BoxGeometry(4.5,.035,.035),metal);m.position.set(0,3.79,2.45);rail.add(m);
  for(let i=-8;i<=8;i++){const dentil=new T.Mesh(new T.BoxGeometry(.1,.13,.12),body);dentil.position.set(i*.24,3.43,2.38);rail.add(dentil);}
 }
 // A shallow inset roof medallion catches highlights without changing its silhouette.
 const medallion=add(new T.TorusGeometry(.85,.018,5,64),metal,0,4.179,0);medallion.rotation.x=Math.PI/2;
 const inner=add(new T.TorusGeometry(.72,.012,4,64),metal,0,4.179,0);inner.rotation.x=Math.PI/2;
 const batches=new Map();temple.updateMatrixWorld(true);const extras=temple.children.filter(o=>!original.has(o));for(const root of extras)root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(new T.Matrix4().copy(temple.matrixWorld).invert().multiply(o.matrixWorld));if(g.index)g.setIndex(g.index.clone());const list=batches.get(o.material)||[];list.push(g.toNonIndexed());batches.set(o.material,list)});extras.forEach(o=>temple.remove(o));for(const [mat,geos] of batches){const m=new T.Mesh(mergeGeometries(geos),mat);m.castShadow=true;m.receiveShadow=true;temple.add(m);geos.forEach(g=>g.dispose())}
}
