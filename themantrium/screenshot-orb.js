import * as T from 'three';
export function createScreenshotOrb(){
 const root=document.createElement('div');
 root.className='crystal-viewer';
 root.hidden=true;
 root.innerHTML=`<div class="crystal-orb"><div class="crystal-scroll" tabindex="0" role="region" aria-label="Screenshot inside the crystal ball"></div><div class="crystal-glass" aria-hidden="true"></div></div>
  <div class="crystal-controls"><span class="orb-hint">Scroll to see more</span>
   <div class="orb-playback" hidden><button type="button" class="orb-toggle">Play</button><input type="range" min="0" step="0.1" value="0" aria-label="Seek video"><button type="button" class="orb-mute">Mute</button></div>
   <a class="orb-fallback" target="_blank" rel="noopener" hidden>Open video</a><button type="button" class="orb-close" aria-label="Close screenshot">×</button></div>`;
 document.body.append(root);
 const scroll=root.querySelector('.crystal-scroll'),close=root.querySelector('.orb-close');
 const hint=root.querySelector('.orb-hint'),playback=root.querySelector('.orb-playback');
 const toggle=playback.querySelector('.orb-toggle'),mute=playback.querySelector('.orb-mute'),seek=playback.querySelector('input');
 const fallback=root.querySelector('.orb-fallback');
 let active=false,trigger=null,fadeTimer=null,request=0,player=null;
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

 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const stopFilm=()=>{
  if(player?.tagName==='VIDEO'){
   player.pause();
   player.removeAttribute('src');
   player.load();
  }
  player?.remove();
  player=null;
  document.body.classList.remove('mobile-orb-film');
 };

 function dismiss(restoreFocus=true){
  if(!active)return;
  active=false;
  request++;
  stopFilm();
  root.classList.add('is-fading');
  clearTimeout(fadeTimer);
  fadeTimer=setTimeout(()=>{
   root.hidden=true;
   scroll.replaceChildren();
   root.classList.remove('is-fading');
  },reduced.matches?100:450);
  if(restoreFocus && trigger?.isConnected)trigger.focus({preventScroll:true});
 }
 close.onclick=()=>dismiss();
 function leaveViewer(){
  dismiss(false);
  if(lightbox?.open)lightbox.close();
 }
 mobile.addEventListener('change',leaveViewer);
 window.addEventListener('pagehide',leaveViewer);
 window.addEventListener('mantrium:reading-close',leaveViewer);

 function reveal(ticket){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(ticket!==request || !active)return;
   root.classList.remove('is-fading');
   scroll.classList.remove('is-switching');
  }));
  dispatchEvent(new Event('blur'));
  close.focus({preventScroll:true});
 }

 async function showImage(link,ticket,switching){
  const next=new Image();
  next.alt=link.querySelector('img').alt;
  next.src=link.href;
  try{
   await Promise.all([next.decode(),delay(switching && !reduced.matches?300:0)]);
  }catch{
   if(ticket===request)dismiss();
   return;
  }
  if(ticket!==request || !active)return;
  const art=link.classList.contains('jungle-art');
  const wide=art && next.naturalWidth>next.naturalHeight;
  next.classList.toggle('orb-art-wide',wide);
  root.dataset.mode=art?'art':'image';
  scroll.setAttribute('aria-label','Screenshot inside the crystal ball');
  close.setAttribute('aria-label','Close screenshot');
  playback.hidden=true;
  fallback.hidden=true;
  hint.hidden=false;
  hint.textContent=wide?'Scroll sideways to explore':'Scroll to see more';
  scroll.replaceChildren(next);
  reveal(ticket);
  scroll.focus({preventScroll:true});
  requestAnimationFrame(()=>{
   if(ticket!==request)return;
   scroll.scrollTop=0;
   const overflow=scroll.scrollWidth-scroll.clientWidth;
   scroll.scrollLeft=wide?overflow/2:0;
   if(art)hint.hidden=wide?overflow<2:scroll.scrollHeight<=scroll.clientHeight+2;
  });
 }

 function showFilm(link,ticket){
  const id=link.dataset.youtubeId;
  const title=link.getAttribute('aria-label');
  const poster=link.querySelector('img').src;
  root.dataset.mode=id?'youtube':'video';
  document.body.classList.toggle('mobile-orb-film',mobile.matches);
  scroll.setAttribute('aria-label','Video inside the crystal ball');
  close.setAttribute('aria-label','Close video');
  hint.hidden=true;
  playback.hidden=Boolean(id);
  fallback.href=link.href;
  fallback.hidden=true;
  scroll.scrollTop=scroll.scrollLeft=0;
  if(id){
   const frame=document.createElement('iframe');
   frame.title=title;
   frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';
   frame.allowFullscreen=true;
   frame.referrerPolicy='strict-origin-when-cross-origin';
   frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&playsinline=1';
   player=frame;
   scroll.replaceChildren(frame);
  }else{
   const video=document.createElement('video');
   player=video;
   video.playsInline=true;
   video.poster=poster;
   video.setAttribute('aria-label',title);
   video.src=link.href;
   seek.value='0';
   seek.disabled=true;
   toggle.textContent='Play';
   mute.textContent='Mute';
   const sync=()=>{
    if(player!==video)return;
    toggle.textContent=video.paused?'Play':'Pause';
    mute.textContent=video.muted?'Unmute':'Mute';
    if(Number.isFinite(video.duration) && video.duration>0){
     seek.disabled=false;
     seek.max=String(video.duration);
     seek.value=String(video.currentTime);
    }
   };
   for(const name of ['play','pause','ended','volumechange','loadedmetadata','timeupdate'])video.addEventListener(name,sync);
   video.addEventListener('error',()=>{if(player===video)fallback.hidden=false;});
   scroll.replaceChildren(video);
   video.play().catch(()=>{if(player===video)sync();});
  }
  reveal(ticket);
 }
 toggle.onclick=()=>{
  if(player?.tagName!=='VIDEO')return;
  if(player.paused)player.play().catch(()=>{});
  else player.pause();
 };
 mute.onclick=()=>{if(player?.tagName==='VIDEO')player.muted=!player.muted;};
 seek.oninput=()=>{if(player?.tagName==='VIDEO' && Number.isFinite(player.duration))player.currentTime=Number(seek.value);};

 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a.study-image,a.study-video');
  if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
  event.preventDefault();
  const film=link.classList.contains('study-video');
  if(!film && mobile.matches){
   dismiss(false);
   showLightbox(link);
   return;
  }
  const switching=active && !root.hidden;
  stopFilm();
  trigger=link;
  active=true;
  const ticket=++request;
  clearTimeout(fadeTimer);
  root.hidden=false;
  if(!switching)root.classList.add('is-fading');
  scroll.classList.add('is-switching');
  if(film)showFilm(link,ticket);
  else showImage(link,ticket,switching);
 });

 root.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
 for(const name of ['touchstart','touchmove','touchend','keydown','keyup'])root.addEventListener(name,e=>{
  e.stopPropagation();
  if(name==='keydown' && e.key==='Escape'){e.preventDefault();dismiss();}
 });
 const point=new T.Vector3(),local=new T.Vector3();
 return {get mobileVideoOpen(){return active && mobile.matches && (root.dataset.mode==='video' || root.dataset.mode==='youtube');},update(camera,orb,visible){if(lightbox?.open&&!visible)lightbox.close();if(!active)return;if(!visible){dismiss(false);return;}
  local.copy(orb.position).applyMatrix4(camera.matrixWorldInverse);
  const radius=orb.geometry.parameters.radius*orb.scale.x,depth=-local.z;
  // Perspective shifts the visible sphere silhouette away from its projected centre.
  point.copy(local);const silhouette=depth*depth/(depth*depth-radius*radius);point.x*=silhouette;point.y*=silhouette;point.applyMatrix4(camera.projectionMatrix);
  const pixels=radius/(depth*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*innerHeight*.5;
  // An inset from the projected sphere leaves its luminous rim visible and contains every corner.
  root.style.width=root.style.height=(pixels*1.87)+'px';root.style.left=((point.x*.5+.5)*innerWidth)+'px';root.style.top=((-point.y*.5+.5)*innerHeight)+'px';
 },dismiss};
}
