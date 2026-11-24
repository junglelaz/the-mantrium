import * as T from 'three';

// A cached spatial index and triangle hierarchy keep swept collision queries local.
export function createFireflyCollisions(scene){
 const radius=.12,cell=6,grid=new Map(),geometryTrees=new Map(),dynamic=[];
 const ray=new T.Ray(),localRay=new T.Ray(),direction=new T.Vector3(),start=new T.Vector3(),end=new T.Vector3(),localEnd=new T.Vector3(),point=new T.Vector3(),hit=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 const instanceMatrix=new T.Matrix4(),worldMatrix=new T.Matrix4(),segmentBox=new T.Box3(),candidates=new Set();
 const offsets=[new T.Vector3(),new T.Vector3(radius,0,0),new T.Vector3(-radius,0,0),new T.Vector3(0,radius,0),new T.Vector3(0,-radius,0),new T.Vector3(0,0,radius),new T.Vector3(0,0,-radius)];
 let prepared=false;
 function triangle(geometry,id){const index=geometry.index,position=geometry.attributes.position;const k=id*3;a.fromBufferAttribute(position,index?index.getX(k):k);b.fromBufferAttribute(position,index?index.getX(k+1):k+1);c.fromBufferAttribute(position,index?index.getX(k+2):k+2);}
 // Decode each triangle once while building the hierarchy. Leaves retain the
 // original triangle IDs, so intersection tests and later refits stay exact.
 function buildTree(geometry){
  const count=(geometry.index?.count||geometry.attributes.position.count)/3;
  const bounds=new Array(count),centres=new Float64Array(count*3);
  for(let id=0;id<count;id++){
   triangle(geometry,id);
   bounds[id]=new T.Box3().expandByPoint(a).expandByPoint(b).expandByPoint(c);
   centres[3*id]=(a.x+b.x+c.x)/3;
   centres[3*id+1]=(a.y+b.y+c.y)/3;
   centres[3*id+2]=(a.z+b.z+c.z)/3;
  }
  function partition(ids){
   const box=new T.Box3();for(const id of ids)box.union(bounds[id]);
   if(ids.length<=12)return {box,ids};
   const size=box.getSize(new T.Vector3());
   const axis=size.x>size.y&&size.x>size.z?0:size.y>size.z?1:2;
   ids.sort((i,j)=>centres[i*3+axis]-centres[j*3+axis]);
   const mid=Math.floor(ids.length/2);
   return {box,left:partition(ids.slice(0,mid)),right:partition(ids.slice(mid))};
  }
  return partition(Array.from({length:count},(_,i)=>i));
 }
 function refit(geometry,node){node.box.makeEmpty();if(node.ids){for(const id of node.ids){triangle(geometry,id);node.box.expandByPoint(a).expandByPoint(b).expandByPoint(c);}}else{refit(geometry,node.left);refit(geometry,node.right);node.box.union(node.left.box).union(node.right.box);}}
 function add(entry){for(let x=Math.floor(entry.box.min.x/cell);x<=Math.floor(entry.box.max.x/cell);x++)for(let z=Math.floor(entry.box.min.z/cell);z<=Math.floor(entry.box.max.z/cell);z++){const key=x+','+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(entry);}}
 function prepare(){
  if(!prepared){
   prepared=true;scene.updateMatrixWorld(true);
   scene.traverse(object=>{
    if(object.userData.treeCollider||object.userData.nonCollidable)return;
    if(!object.isMesh||!object.geometry?.attributes.position)return;
    let parent=object;while(parent){if(!parent.visible)return;parent=parent.parent;}
    const materials=Array.isArray(object.material)?object.material:[object.material];if(!materials.some(m=>m&&!m.transparent&&m.visible!==false))return;
    object.geometry.computeBoundingBox();
    if(object.isInstancedMesh){for(let i=0;i<object.count;i++){object.getMatrixAt(i,instanceMatrix);worldMatrix.multiplyMatrices(object.matrixWorld,instanceMatrix);add({box:object.geometry.boundingBox.clone().applyMatrix4(worldMatrix).expandByScalar(radius),foliage:true});}return;}
    const geometry=object.geometry;let tree=geometryTrees.get(geometry);if(!tree){tree=buildTree(geometry);geometryTrees.set(geometry,tree);}
    const entry={box:tree.box.clone().applyMatrix4(object.matrixWorld).expandByScalar(radius),geometry,tree,inverse:object.matrixWorld.clone().invert(),object,version:geometry.attributes.position.version};
    add(entry);dynamic.push(entry);
   });
  }
  for(const entry of dynamic)if(entry.version!==entry.geometry.attributes.position.version){refit(entry.geometry,entry.tree);entry.version=entry.geometry.attributes.position.version;entry.box.copy(entry.tree.box).applyMatrix4(entry.object.matrixWorld).expandByScalar(radius);}
 }
 function intersects(tree,geometry,farSq){
  if(!localRay.intersectBox(tree.box,point)||point.distanceToSquared(localRay.origin)>farSq&&!tree.box.containsPoint(localRay.origin))return false;
  if(tree.ids){for(const id of tree.ids){triangle(geometry,id);if(localRay.intersectTriangle(a,b,c,false,hit)&&hit.distanceToSquared(localRay.origin)<=farSq)return true;}return false;}
  return intersects(tree.left,geometry,farSq)||intersects(tree.right,geometry,farSq);
 }
 function clear(from,to){
  // Fireflies steer around the canopy envelope, never into tiny dead-end leaf pockets.
  const treeBounds=scene.userData.treeCollisions?.flightBounds;
  if(treeBounds){direction.copy(to).sub(from);const distance=direction.length();if(distance>1e-8)direction.divideScalar(distance);ray.set(from,direction);for(const box of treeBounds){if(box.containsPoint(from)||box.containsPoint(to)||distance>1e-8&&ray.intersectBox(box,point)&&point.distanceToSquared(from)<=distance*distance)return false;}}
  else if(scene.userData.treeCollisions&&!scene.userData.treeCollisions.clear(from,to,radius))return false;
  direction.copy(to).sub(from);const distance=direction.length();if(distance<1e-7)return true;
  segmentBox.makeEmpty().expandByPoint(from).expandByPoint(to).expandByScalar(radius);candidates.clear();
  for(let x=Math.floor(segmentBox.min.x/cell);x<=Math.floor(segmentBox.max.x/cell);x++)for(let z=Math.floor(segmentBox.min.z/cell);z<=Math.floor(segmentBox.max.z/cell);z++)for(const entry of grid.get(x+','+z)||[])if(entry.box.intersectsBox(segmentBox))candidates.add(entry);
  if(!candidates.size)return true;
  direction.divideScalar(distance);
  for(const offset of offsets){start.copy(from).add(offset);end.copy(to).add(offset).addScaledVector(direction,radius);ray.set(start,direction);
   for(const entry of candidates){
    if(entry.foliage){if(entry.box.containsPoint(start)||ray.intersectBox(entry.box,point)&&point.distanceToSquared(start)<=(distance+radius)**2)return false;continue;}
    localRay.copy(ray).applyMatrix4(entry.inverse);localEnd.copy(end).applyMatrix4(entry.inverse);if(intersects(entry.tree,entry.geometry,localEnd.distanceToSquared(localRay.origin)))return false;
   }
  }
  return true;
 }
 function occupied(p){
  const trees=scene.userData.treeCollisions;
  if(trees?.flightBounds?trees.flightBounds.some(b=>b.containsPoint(p)):trees?.occupied(p.x,p.y,p.z,radius))return true;
  for(const entry of grid.get(Math.floor(p.x/cell)+','+Math.floor(p.z/cell))||[])if(entry.foliage){segmentBox.copy(entry.box).expandByScalar(radius);if(segmentBox.containsPoint(p))return true;}
  return false;
 }
 return {prepare,clear,occupied};
}

export function clearsOrb(from,to,x,y,z,radius){
 const sx=from.x-x,sy=from.y-y,sz=from.z-z,ex=to.x-x,ey=to.y-y,ez=to.z-z;
 const startSq=sx*sx+sy*sy+sz*sz,endSq=ex*ex+ey*ey+ez*ez,radiusSq=radius*radius;
 if(endSq<radiusSq-1e-6)return false;
 if(startSq<radiusSq)return endSq>=startSq;
 const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z,lengthSq=dx*dx+dy*dy+dz*dz;
 const t=lengthSq?Math.max(0,Math.min(1,-(sx*dx+sy*dy+sz*dz)/lengthSq)):0;
 return (sx+t*dx)**2+(sy+t*dy)**2+(sz+t*dz)**2>=radiusSq-1e-6;
}
