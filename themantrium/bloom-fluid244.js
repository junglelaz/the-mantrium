import * as T from 'three';
export function createBloom(renderer){
 const options={type:T.HalfFloatType,depthBuffer:false,stencilBuffer:false};
 let source=new T.FramebufferTexture(1,1);const a=new T.WebGLRenderTarget(1,1,options),b=new T.WebGLRenderTarget(1,1,options);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const vertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const extract=new T.ShaderMaterial({toneMapped:false,depthTest:false,depthWrite:false,uniforms:{source:{value:source}},vertexShader:vertex,fragmentShader:`uniform sampler2D source;varying vec2 vUv;void main(){vec3 c=texture2D(source,vUv).rgb;float l=max(c.r,max(c.g,c.b));float weight=smoothstep(.76,.98,l);gl_FragColor=vec4(c*weight,1.);}`});
 const blur=new T.ShaderMaterial({toneMapped:false,depthTest:false,depthWrite:false,uniforms:{source:{value:a.texture},stepUV:{value:new T.Vector2()}},vertexShader:vertex,fragmentShader:`uniform sampler2D source;uniform vec2 stepUV;varying vec2 vUv;void main(){vec3 c=texture2D(source,vUv).rgb*.227027;for(int i=1;i<=4;i++){float w=i==1?.194595:i==2?.121622:i==3?.054054:.016216;c+=(texture2D(source,vUv+stepUV*float(i)).rgb+texture2D(source,vUv-stepUV*float(i)).rgb)*w;}gl_FragColor=vec4(c,1.);}`});
 const composite=new T.ShaderMaterial({toneMapped:false,depthTest:false,depthWrite:false,uniforms:{source:{value:source},glow:{value:a.texture}},vertexShader:vertex,fragmentShader:`uniform sampler2D source;uniform sampler2D glow;varying vec2 vUv;void main(){vec3 base=texture2D(source,vUv).rgb;vec3 bloom=texture2D(glow,vUv).rgb;gl_FragColor=vec4(base+bloom*.19,1.);

 }`});
 const quad=new T.Mesh(new T.PlaneGeometry(2,2),extract);quad.frustumCulled=false;scene.add(quad);const size=new T.Vector2();
 return {render(draw){renderer.getDrawingBufferSize(size);if(source.image.width!==size.x||source.image.height!==size.y){source.dispose();source=new T.FramebufferTexture(size.x,size.y);extract.uniforms.source.value=source;composite.uniforms.source.value=source;a.setSize(Math.max(1,Math.round(size.x/4)),Math.max(1,Math.round(size.y/4)));b.setSize(a.width,a.height);}
  // Preserve the scene's existing colour and transparency before adding a soft glow.
  draw();renderer.copyFramebufferToTexture(source);
  quad.material=extract;renderer.setRenderTarget(a);renderer.render(scene,camera);
  quad.material=blur;blur.uniforms.source.value=a.texture;blur.uniforms.stepUV.value.set(1.5/a.width,0);renderer.setRenderTarget(b);renderer.render(scene,camera);
  blur.uniforms.source.value=b.texture;blur.uniforms.stepUV.value.set(0,1.5/a.height);renderer.setRenderTarget(a);renderer.render(scene,camera);
  quad.material=composite;renderer.setRenderTarget(null);renderer.render(scene,camera);
 }};
}
