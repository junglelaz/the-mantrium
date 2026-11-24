import * as T from 'three';
export function createScreenshotOrb(){
 const root=document.createElement('div');root.className='crystal-viewer';root.hidden=true;
 root.innerHTML='<div class="crystal-orb"><div class="crystal-scroll" tabindex="0" role="region" aria-label="Screenshot inside the crystal ball"><img alt=""></div><div class="crystal-glass" aria-hidden="true"></div></div><div class="crystal-controls"><span>Scroll to see more</span><button type="button" aria-label="Close screenshot">×</button></div>';
 document.body.append(root);const scroll=root.querySelector('.crystal-scroll'),img=root.querySelector('img'),close=root.querySelector('button');
 let active=false,trigger=null,fadeTimer=null,request=0;
 const mobile=matchMedia('(max-width:650px), (pointer:coarse) and (hover:none)');
 let lightbox=null,fullImage=null,imageOpener=null;
 function showLightbox(link){
  if(!lightbox){
   lightbox=document.createElement('dialog');lightbox.className='study-lightbox';
   lightbox.setAttribute('aria-label','Full-size project image');
   lightbox.innerHTML='<button type="button" aria-label="Close image" autofocus>×</button><div class="study-lightbox-scroll" tabindex="0" aria-label="Full-size image"><img alt=""></div>';
   document.body.append(lightbox);fullImage=lightbox.querySelector('img');
   lightbox.querySelector('button').onclick=()=>lightbox.close();
   for(const type of ['touchstart','touchmove','touchend','wheel','keydown','keyup'])
    lightbox.addEventListener(type,event=>event.stopPropagation());
   lightbox.addEventListener('close',()=>{
    fullImage.removeAttribute('src');
    const opener=imageOpener;imageOpener=null;
    if(opener?.isConnected&&opener.getClientRects().length)opener.focus({preventScroll:true});
   });
  }
  imageOpener=link;fullImage.alt=link.querySelector('img').alt;fullImage.src=link.href;
  if(!lightbox.open)lightbox.showModal();
  lightbox.querySelector('.study-lightbox-scroll').scrollTop=0;
 }
 mobile.addEventListener('change',()=>{if(lightbox?.open)lightbox.close();if(active)dismiss();});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function dismiss(){if(!active)return;active=false;request++;root.classList.add('is-fading');clearTimeout(fadeTimer);fadeTimer=setTimeout(()=>{root.hidden=true;img.removeAttribute('src');root.classList.remove('is-fading');},reduced.matches?100:450);trigger?.focus({preventScroll:true});}
 close.onclick=dismiss;
 document.addEventListener('click',async event=>{
  const link=event.target.closest?.('a.study-image');if(!link)return;event.preventDefault();
  if(mobile.matches){showLightbox(link);return;}
  const ticket=++request;trigger=link;clearTimeout(fadeTimer);
  const switching=active&&!root.hidden;active=true;
  if(!switching){root.classList.add('is-fading');root.hidden=false;}
  scroll.classList.add('is-switching');
  const next=new Image();next.src=link.href;
  try{await Promise.all([next.decode(),pause(switching?(reduced.matches?100:300):0)]);}catch{if(ticket===request)dismiss();return;}
  if(ticket!==request||!active)return;
  img.alt=link.querySelector('img').alt;img.src=next.src;scroll.scrollTop=0;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ticket!==request||!active)return;root.classList.remove('is-fading');scroll.classList.remove('is-switching');}));
  dispatchEvent(new Event('blur'));scroll.focus({preventScroll:true});
 });
 root.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
 for(const name of ['touchstart','touchmove','keydown','keyup'])root.addEventListener(name,e=>{e.stopPropagation();if(name==='keydown'&&e.key==='Escape'){e.preventDefault();dismiss();}});
 const point=new T.Vector3(),local=new T.Vector3();
 return {update(camera,orb,visible){if(lightbox?.open&&!visible)lightbox.close();if(!active)return;if(!visible){dismiss();return;}
  local.copy(orb.position).applyMatrix4(camera.matrixWorldInverse);
  const radius=orb.geometry.parameters.radius*orb.scale.x,depth=-local.z;
  // Perspective shifts the visible sphere silhouette away from its projected centre.
  point.copy(local);const silhouette=depth*depth/(depth*depth-radius*radius);point.x*=silhouette;point.y*=silhouette;point.applyMatrix4(camera.projectionMatrix);
  const pixels=radius/(depth*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*innerHeight*.5;
  // An inset from the projected sphere leaves its luminous rim visible and contains every corner.
  root.style.width=root.style.height=(pixels*1.87)+'px';root.style.left=((point.x*.5+.5)*innerWidth)+'px';root.style.top=((-point.y*.5+.5)*innerHeight)+'px';
 },dismiss};
}
