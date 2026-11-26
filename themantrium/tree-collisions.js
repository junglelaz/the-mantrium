import * as T from 'three';
// Small occupied cells follow the actual branches instead of enclosing the whole canopy.
export function createTreeCollisions(){
 const cell=.4,grid=new Map(),ray=new T.Ray(),direction=new T.Vector3(),hit=new T.Vector3(),point=new T.Vector3(),box=new T.Box3();
 const key=(x,y,z)=>x+','+y+','+z;
 function addGeometry(geometry,matrices){
  const p=geometry.attributes.position,index=geometry.index,local=new Map(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
  const localCell=.15;
  for(let i=0;i<(index?.count||p.count);i+=3){
   a.fromBufferAttribute(p,index?index.getX(i):i);b.fromBufferAttribute(p,index?index.getX(i+1):i+1);c.fromBufferAttribute(p,index?index.getX(i+2):i+2);
   box.makeEmpty().expandByPoint(a).expandByPoint(b).expandByPoint(c);
   for(let x=Math.floor(box.min.x/localCell);x<=Math.floor(box.max.x/localCell);x++)for(let y=Math.floor(box.min.y/localCell);y<=Math.floor(box.max.y/localCell);y++)for(let z=Math.floor(box.min.z/localCell);z<=Math.floor(box.max.z/localCell);z++)local.set(key(x,y,z),[x,y,z]);
  }
  for(const matrix of matrices)for(const [x,y,z] of local.values()){
   box.min.set(x*localCell,y*localCell,z*localCell);box.max.copy(box.min).addScalar(localCell);box.applyMatrix4(matrix);
   for(let i=Math.floor(box.min.x/cell);i<=Math.floor(box.max.x/cell);i++)for(let j=Math.floor(box.min.y/cell);j<=Math.floor(box.max.y/cell);j++)for(let k=Math.floor(box.min.z/cell);k<=Math.floor(box.max.z/cell);k++){
    const id=key(i,j,k),clipped=new T.Box3(new T.Vector3(Math.max(i*cell,box.min.x),Math.max(j*cell,box.min.y),Math.max(k*cell,box.min.z)),new T.Vector3(Math.min((i+1)*cell,box.max.x),Math.min((j+1)*cell,box.max.y),Math.min((k+1)*cell,box.max.z)));
    if(grid.has(id))grid.get(id).union(clipped);else grid.set(id,clipped);
   }
  }
 }
 // Player collision uses real bark triangles, not the transparent leaf cards.
 // All tree instances share one triangle grid in model space. A narrow
 // phase transforms only nearby triangles, preserving world-space distances.
 const branchInstances=[],queryBox=new T.Box3(),localQuery=new T.Box3();
 const triangle=new T.Triangle(),closest=new T.Vector3(),seen=new Set();
 function readFace(geometry,id){
  const p=geometry.attributes.position,index=geometry.index,i=id*3;
  triangle.a.fromBufferAttribute(p,index?index.getX(i):i);
  triangle.b.fromBufferAttribute(p,index?index.getX(i+1):i+1);
  triangle.c.fromBufferAttribute(p,index?index.getX(i+2):i+2);
 }
 function addBranches(geometry,matrices){
  geometry.computeBoundingBox();
  const extent=geometry.boundingBox.getSize(new T.Vector3());
  const size=Math.max(extent.x,extent.y,extent.z,1e-4)/24;
  const bins=new Map(),count=(geometry.index?.count??geometry.attributes.position.count)/3;
  for(let id=0;id<count;id++){
   readFace(geometry,id);
   box.makeEmpty().expandByPoint(triangle.a).expandByPoint(triangle.b).expandByPoint(triangle.c);
   for(let x=Math.floor(box.min.x/size);x<=Math.floor(box.max.x/size);x++){
    for(let y=Math.floor(box.min.y/size);y<=Math.floor(box.max.y/size);y++){
     for(let z=Math.floor(box.min.z/size);z<=Math.floor(box.max.z/size);z++){
      const cellKey=key(x,y,z);
      let ids=bins.get(cellKey);
      if(!ids){ids=[];bins.set(cellKey,ids);}
      ids.push(id);
     }
    }
   }
  }
  for(const matrix of matrices)branchInstances.push({
   geometry,bins,size,matrix,inverse:matrix.clone().invert(),
   bounds:geometry.boundingBox.clone().applyMatrix4(matrix)
  });
 }
 function occupiedBranches(x,y,z,r){
  point.set(x,y,z);
  queryBox.min.copy(point).addScalar(-r);queryBox.max.copy(point).addScalar(r);
  for(const tree of branchInstances){
   if(!tree.bounds.intersectsBox(queryBox))continue;
   localQuery.copy(queryBox).applyMatrix4(tree.inverse).intersect(tree.geometry.boundingBox);
   if(localQuery.isEmpty())continue;
   seen.clear();
   const min=localQuery.min,max=localQuery.max,size=tree.size;
   for(let i=Math.floor(min.x/size);i<=Math.floor(max.x/size);i++)
    for(let j=Math.floor(min.y/size);j<=Math.floor(max.y/size);j++)
     for(let k=Math.floor(min.z/size);k<=Math.floor(max.z/size);k++){
      const ids=tree.bins.get(key(i,j,k));
      if(!ids)continue;
      for(const id of ids){
       if(seen.has(id))continue;
       seen.add(id);readFace(tree.geometry,id);
       triangle.a.applyMatrix4(tree.matrix);triangle.b.applyMatrix4(tree.matrix);triangle.c.applyMatrix4(tree.matrix);
       triangle.closestPointToPoint(point,closest);
       if(closest.distanceToSquared(point)<r*r)return true;
      }
     }
  }
  return false;
 }
 function visit(minX,minY,minZ,maxX,maxY,maxZ,fn){for(let x=Math.floor(minX/cell);x<=Math.floor(maxX/cell);x++)for(let y=Math.floor(minY/cell);y<=Math.floor(maxY/cell);y++)for(let z=Math.floor(minZ/cell);z<=Math.floor(maxZ/cell);z++){const b=grid.get(key(x,y,z));if(b&&fn(b))return true;}return false;}
 function occupied(x,y,z,r=.12){point.set(x,y,z);return visit(x-r,y-r,z-r,x+r,y+r,z+r,b=>b.distanceToPoint(point)<r);}
 function clear(from,to,r=.12){direction.copy(to).sub(from);const length=direction.length();if(length<1e-8)return !occupied(from.x,from.y,from.z,r);direction.divideScalar(length);ray.set(from,direction);
  return !visit(Math.min(from.x,to.x)-r,Math.min(from.y,to.y)-r,Math.min(from.z,to.z)-r,Math.max(from.x,to.x)+r,Math.max(from.y,to.y)+r,Math.max(from.z,to.z)+r,b=>{box.copy(b).expandByScalar(r);return box.containsPoint(from)||!!ray.intersectBox(box,hit)&&hit.distanceToSquared(from)<=length*length;});
 }
 return {addGeometry,addBranches,occupiedBranches,occupied,clear,get size(){return grid.size;}};
}
