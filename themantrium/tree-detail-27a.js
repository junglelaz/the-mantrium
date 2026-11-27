import * as T from 'three';

// Offline meshoptimizer indices reuse the shipped tree's positions, UVs and materials.
// Keep the source geometry for collision queries and for cameras close to the canopy.
export async function loadTreeDetail() {
 if (typeof DecompressionStream === 'undefined') return new Map();
 try {
  const response = await fetch(new URL('./public/nature/tree/tree-detail-27a.bin', import.meta.url));
  if (!response.ok) return new Map();
  const buffer = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  let offset = new DataView(buffer).getUint32(0, true);
  const entries = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 4, offset - 4)));
  const levels = new Map();
  for (const entry of entries) {
   const indices = new Uint32Array(buffer, offset, entry.indexCount);
   let index = 0;
   for (let i = 0; i < indices.length; i++) {
    index = (index + indices[i]) >>> 0;
    if (index >= entry.vertexCount) return new Map();
    indices[i] = index;
   }
   offset += indices.byteLength;
   levels.set(entry.mesh, { ...entry, index: new T.BufferAttribute(indices, 1) });
  }
  return levels;
 } catch {
  // An optional level may be unavailable while the main model is already usable.
  return new Map();
 }
}

export function createTreeDetail() {
 const parts = [];
 const viewCenter = new T.Vector3();
 function register(source, meshes, level) {
  if (!level || source.index?.count !== level.sourceCount ||
      source.attributes.position.count !== level.vertexCount) return;
  const distant = new T.BufferGeometry();
  for (const [name, attribute] of Object.entries(source.attributes)) distant.setAttribute(name, attribute);
  distant.setIndex(level.index);
  source.computeBoundingSphere();
  distant.boundingSphere = source.boundingSphere.clone();
  for (const mesh of meshes) {
   const scale = mesh.matrix.getMaxScaleOnAxis();
   const bounds = source.boundingSphere.clone().applyMatrix4(mesh.matrix);
   bounds.radius += .25; // Include the canopy's shader-driven sway.
   parts.push({ mesh, source, distant, bounds, error: level.error * scale });
  }
 }
 function update(camera, viewportHeight) {
  const focalPixels = viewportHeight * camera.projectionMatrix.elements[5] / 2;
  let changed = false;
  for (const part of parts) {
   viewCenter.copy(part.bounds.center).applyMatrix4(camera.matrixWorldInverse);
   const depth = -viewCenter.z - part.bounds.radius;
   // Include perspective magnification for off-axis parts. Near-plane crossings use full detail.
   const offAxis = Math.hypot(viewCenter.x, viewCenter.y) + part.bounds.radius;
   const pixels = depth > camera.near ? focalPixels * part.error / depth * Math.hypot(1, offAxis / depth) : Infinity;
   const limit = part.mesh.geometry === part.distant ? .85 : .55;
   const next = pixels < limit ? part.distant : part.source;
   if (part.mesh.geometry === next) continue;
   part.mesh.geometry = next;
   changed = true;
  }
  return changed;
 }
 return { register, update };
}
