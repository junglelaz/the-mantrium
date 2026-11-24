import {revealOpeningHeading} from './opening-cipher.js?v=spacing237';
import * as T from 'three';
const screen=document.querySelector('#arrival'),status=document.querySelector('#arrival-status');
const loadingMessages=['Your sanctuary awaits...','Loading the Mantrium...','Preparing the temples...','Awakening the orbs...','Aligning the stars...'];
function sizeLoadingTrack(){
 const measure=document.createElement('span');
 const style=getComputedStyle(status);
 measure.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;';
 measure.style.font=style.font;measure.style.letterSpacing=style.letterSpacing;
 screen.append(measure);
 let width=0;for(const message of loadingMessages){measure.textContent=message;width=Math.max(width,measure.getBoundingClientRect().width);}
 measure.remove();screen.style.setProperty('--loading-track-width',`${Math.ceil(width)}px`);
}
sizeLoadingTrack();document.fonts.ready.then(sizeLoadingTrack);
let messageIndex=0,messageAnimation=null,messagesActive=true;
status.textContent=loadingMessages[0];
const messageTimer=setInterval(async()=>{
 if(!messagesActive)return;
 messageAnimation?.cancel();
 const duration=matchMedia('(prefers-reduced-motion:reduce)').matches?0:450;
 messageAnimation=status.animate([{opacity:1},{opacity:0}],{duration,easing:'ease-in-out',fill:'forwards'});
 try{await messageAnimation.finished;}catch{return;}
 if(!messagesActive)return;
 status.textContent=loadingMessages[++messageIndex%loadingMessages.length];
 messageAnimation.cancel();
 messageAnimation=status.animate([{opacity:0},{opacity:1}],{duration,easing:'ease-in-out',fill:'forwards'});
},2000);
function stopMessages(){messagesActive=false;clearInterval(messageTimer);for(const animation of status.getAnimations())animation.cancel();}
let failed=false;
// Perceived progress stays monotonic and rate-limited while asset batches arrive.
let shown=.08,assetProgress=0,ready=false,progressFrame;
const progressStart=performance.now();let progressLast=progressStart;
function updateProgress(now){
 const dt=Math.min((now-progressLast)/1000,.05);progressLast=now;
 const elapsed=(now-progressStart)/1000;
 const gentleEstimate=.08+.80*(1-Math.exp(-elapsed/14));
 const target=ready?1:Math.min(.94,Math.max(gentleEstimate,assetProgress*.90));
 const distance=Math.max(0,target-shown);
 shown+=Math.min(distance,dt*(ready?.36:.075),distance*(1-Math.exp(-dt*(ready?4:1.7))));
 if(ready&&1-shown<.002)shown=1;
 screen.style.setProperty('--loaded',`${(shown*100).toFixed(2)}%`);
 if(!failed&&shown<1)progressFrame=requestAnimationFrame(updateProgress);
}
progressFrame=requestAnimationFrame(updateProgress);
const manager=T.DefaultLoadingManager;
if(matchMedia('(pointer:coarse)').matches||innerWidth<=650){
 const mobileMaps=new Set(['bark-color.webp', 'bark-normal.webp', 'leaf-color.webp', 'leaf-normal.webp', 'marble-color.webp', 'marble-normal.webp', 'marble-rough.webp', 'moss-surface.webp', 'moss-surface-normal.webp', 'stone-color.webp', 'stone-normal.webp', 'stone-rough.webp']);
 manager.setURLModifier(url=>{
  const prefix='public/nature/';
  if(!url.startsWith(prefix))return url;
  const file=url.slice(prefix.length);
  return mobileMaps.has(file)?prefix+'mobile246/'+file:url;
 });
}

manager.onProgress=(url,loaded,total)=>{assetProgress=Math.max(assetProgress,total?loaded/total:0)};


const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
let sceneReady=false;
try{
 const app=await import('./app-fluid251.js');
 sceneReady=true;
 // The app has built the navigable scene. Optional textures can settle during the reveal.
 document.body.classList.add('arrival-revealing');
 document.body.classList.remove('is-loading');
 await frame();await frame();
 ready=true;
 cancelAnimationFrame(progressFrame);
 screen.style.setProperty('--loaded','100%');
 stopMessages();
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const mark=screen.querySelector('.arrival-mark');
 // Capture the visible breathing scale, including the SVG's letterboxed content.
 const box=mark.getBoundingClientRect(),width=box.width,height=width*545/550;
 const x=box.left,y=box.top+(box.height-height)/2;
 mark.style.cssText='animation:none;position:fixed;left:0;top:0;width:550px;height:545px;transform-origin:0 0;max-width:none;filter:none;will-change:transform,opacity;opacity:1;';
 const initial=`matrix(${width/550},0,0,${height/545},${x},${y})`;
 mark.style.transform=initial;
 document.body.classList.add('arrival-revealing');
 document.body.classList.remove('is-loading');
 const cloudVeil=app.arrivalCloudVeil();screen.prepend(cloudVeil);
 screen.classList.add('unfolding');
 // Direct interior previews have no overhead emblem to align with.
 const fadeInPlace=document.body.dataset.arrival==='fade'||location.pathname.endsWith('/qa-guru.html');
 // The cloud veil keeps architecture hidden throughout enlargement.
 const duration=reduced?300:fadeInPlace?600:2000;
 const target=fadeInPlace?initial:app.arrivalTransform();
 const frames=destination=>[{transform:initial},{transform:destination}];
 const flight=mark.animate(frames(target),{duration,easing:'cubic-bezier(.25,.45,.35,1)',fill:'forwards'});
 const resize=()=>{if(!fadeInPlace)flight.effect.setKeyframes(frames(app.arrivalTransform()));};
 addEventListener('resize',resize);
 await flight.finished;
 removeEventListener('resize',resize);
 // At full size, reveal the world and dissolve the aligned mark together.
 // No hold, extra frames, or exposed environment during enlargement.
 screen.classList.add('world-reveal');
 await mark.animate([{opacity:1},{opacity:0}],{duration:reduced?200:800,easing:'ease-in-out',fill:'forwards'}).finished;
 screen.remove();
 document.body.classList.add('arrival-copy');
 revealOpeningHeading();
 setTimeout(()=>document.body.classList.remove('arrival-revealing','arrival-copy'),1600);
}catch(error){
 failed=true;
 stopMessages();
 cancelAnimationFrame(progressFrame);
 if(!sceneReady)throw error;
 console.warn('Mantrium opening transition skipped:',error);
 screen.remove();
 document.body.classList.remove('is-loading','arrival-revealing','arrival-copy');
}
