import * as T from 'three';

export function createOrbShadow(scene, orb, sun) {
 const sphere = {value: new T.Vector4()};
 const direction = {value: sun.position.clone().sub(sun.target.position).normalize()};
 const originals = new Set();
 const shadowLight = T.ShaderChunk.lights_fragment_begin.replace(
  'vDirectionalShadowCoord[ i ] ) : 1.0;',
  `vDirectionalShadowCoord[ i ] ) : 1.0;
  #if UNROLLED_LOOP_INDEX == 0
  if (receiveShadow && orbShadowSphere.w > 0.0) {
   vec3 toOrb = orbShadowSphere.xyz - orbShadowWorldPosition;
   float distanceToOrb = dot(toOrb, orbShadowLightDirection);
   vec3 offset = toOrb - orbShadowLightDirection * distanceToOrb;
   float radius = orbShadowSphere.w;
   float coverage = 1.0 - smoothstep(0.62, 1.37, dot(offset, offset) / (radius * radius));
   float reach = smoothstep(0.0, radius, distanceToOrb) * (1.0 - smoothstep(2.0, 7.0, distanceToOrb));
   directLight.color *= 1.0 - 0.93 * coverage * reach;
  }
  #endif`
 );
 scene.traverse(object => {
  if (!object.isMesh || !object.receiveShadow) return;
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  for (const material of materials) if (material?.isMeshStandardMaterial) originals.add(material);
 });
 for (const material of originals) {
  const compile = material.onBeforeCompile;
  const key = material.customProgramCacheKey();
  material.onBeforeCompile = function(shader, renderer) {
   compile.call(this, shader, renderer);
   shader.uniforms.orbShadowSphere = sphere;
   shader.uniforms.orbShadowLightDirection = direction;
   shader.vertexShader = 'varying vec3 orbShadowWorldPosition;\n' + shader.vertexShader.replace(
    '#include <worldpos_vertex>',
    '#include <worldpos_vertex>\n#ifdef USE_SHADOWMAP\norbShadowWorldPosition = worldPosition.xyz;\n#endif'
   );
   shader.fragmentShader = 'varying vec3 orbShadowWorldPosition;\nuniform vec4 orbShadowSphere;\nuniform vec3 orbShadowLightDirection;\n'
    + shader.fragmentShader.replace('#include <lights_fragment_begin>', shadowLight);
  };
  material.customProgramCacheKey = () => key + '|orb-shadow-v1';
  material.needsUpdate = true;
 }
 orb.castShadow = false;
 return function update(visible) {
  sphere.value.set(orb.position.x, orb.position.y, orb.position.z, visible ? orb.geometry.parameters.radius * orb.scale.x : 0);
 };
}
