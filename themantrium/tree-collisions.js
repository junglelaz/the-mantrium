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
 const branchGrid=new Map(),branchCell=1,closest=new T.Vector3();
 function addBranches(geometry,matrices){
  const p=geometry.attributes.position,index=geometry.index;
  for(const matrix of matrices)for(let i=0;i<(index?.count||p.count);i+=3){
   const vertices=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(matrix));
   const triangle=new T.Triangle(...vertices),bounds=new T.Box3().setFromPoints(vertices);
   for(let x=Math.floor(bounds.min.x/branchCell);x<=Math.floor(bounds.max.x/branchCell);x++)for(let y=Math.floor(bounds.min.y/branchCell);y<=Math.floor(bounds.max.y/branchCell);y++)for(let z=Math.floor(bounds.min.z/branchCell);z<=Math.floor(bounds.max.z/branchCell);z++){const id=key(x,y,z);if(!branchGrid.has(id))branchGrid.set(id,[]);branchGrid.get(id).push(triangle);}
  }
 }
 function occupiedBranches(x,y,z,r){
  point.set(x,y,z);const seen=new Set();
  for(let i=Math.floor((x-r)/branchCell);i<=Math.floor((x+r)/branchCell);i++)for(let j=Math.floor((y-r)/branchCell);j<=Math.floor((y+r)/branchCell);j++)for(let k=Math.floor((z-r)/branchCell);k<=Math.floor((z+r)/branchCell);k++)for(const triangle of branchGrid.get(key(i,j,k))||[]){if(seen.has(triangle))continue;seen.add(triangle);triangle.closestPointToPoint(point,closest);if(closest.distanceToSquared(point)<r*r)return true;}
  return false;
 }
 function visit(minX,minY,minZ,maxX,maxY,maxZ,fn){for(let x=Math.floor(minX/cell);x<=Math.floor(maxX/cell);x++)for(let y=Math.floor(minY/cell);y<=Math.floor(maxY/cell);y++)for(let z=Math.floor(minZ/cell);z<=Math.floor(maxZ/cell);z++){const b=grid.get(key(x,y,z));if(b&&fn(b))return true;}return false;}
 function occupied(x,y,z,r=.12){point.set(x,y,z);return visit(x-r,y-r,z-r,x+r,y+r,z+r,b=>b.distanceToPoint(point)<r);}
 function clear(from,to,r=.12){direction.copy(to).sub(from);const length=direction.length();if(length<1e-8)return !occupied(from.x,from.y,from.z,r);direction.divideScalar(length);ray.set(from,direction);
  return !visit(Math.min(from.x,to.x)-r,Math.min(from.y,to.y)-r,Math.min(from.z,to.z)-r,Math.max(from.x,to.x)+r,Math.max(from.y,to.y)+r,Math.max(from.z,to.z)+r,b=>{box.copy(b).expandByScalar(r);return box.containsPoint(from)||!!ray.intersectBox(box,hit)&&hit.distanceToSquared(from)<=length*length;});
 }
 return {addGeometry,addBranches,occupiedBranches,occupied,clear,get size(){return grid.size;}};
}
