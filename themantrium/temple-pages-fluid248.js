import {threePMStory} from './threepm-story.js?v=spacing237';
import {true2natureStudy} from './true2nature-study.js?v=spacing237';
// Project and case-study descriptions supplied by Mantrium. Comparison media awaits delivery.
const projects=[
 {
  "name": "3PM",
  "type": "Web3 music · Solana",
  "intro": "A musician-built world for independent music. Releases, creative talent and direct fan support come together in a Web3 ecosystem by Mantrium.",
  "sections": [
   [
    "Independence, together.",
    "3rd Person Music explores a model of sovereign music: artists keep their creative IP, release non-exclusively and build closer relationships with their supporters."
   ],
   [
    "Built by the people making music.",
    "Musicians and Web3 developers share the same creative practice. The platform’s own roster and releases are its testing ground, with an ambition to share the model more widely."
   ],
   [
    "Human artistry at the centre.",
    "3PM supports human-made music. AI can help operations, marketing and development; the platform’s policy excludes AI-generated music and training AI on artists’ work."
   ]
  ]
 },
 {
  "name": "Drakensberg Cannabis",
  "type": "Licensed cannabis · Commerce & community",
  "intro": "A licensed cannabis brand, eCommerce solution and cannabis community, combining Web3 integration with gamified marketing.",
  "sections": [
   [
    "A licensed cannabis brand",
    "Drakensberg Cannabis brings a licensed cannabis brand together with an eCommerce solution."
   ],
   [
    "A connected community",
    "A cannabis community forms part of the offering, alongside Web3 integration."
   ],
   [
    "Marketing through play",
    "Gamified marketing completes the connection between brand, commerce and community."
   ]
  ]
 },
 {
  "name": "Local LLM",
  "type": "Custom-developed artificial intelligence",
  "intro": "Our own custom-developed AI, free from mainstream guardrails, with Sanskrit education, remote viewing ability and no token limit.",
  "sections": [
   [
    "Our own AI",
    "Local LLM is our own custom-developed artificial intelligence, devoid of mainstream guardrails."
   ],
   [
    "Sanskrit and remote viewing",
    "The AI combines Sanskrit education with remote viewing ability."
   ],
   [
    "No token limit",
    "Local LLM operates without a token limit."
   ]
  ]
 }
];
const studies=[
 {
  "name": "Football Careers",
  "type": "Brand & platform transformation",
  "intro": "A complete brand and platform upgrade, bringing Football Careers’ identity, digital platform and job board into a reimagined experience.",
  "sections": [
   [
    "The transformation",
    "A total upgrade and reform of the Football Careers brand and platform, spanning its visual identity, website, dashboard and job board."
   ],
   [
    "The digital platform",
    "Brand and platform work come together across the website, job board and dashboard."
   ],
   [
    "Before and after",
    "Five before-and-after screenshots will document the brand, website and dashboard transformation. Before-and-after Google speed tests will accompany the visual comparisons."
   ]
  ]
 },
 {
  "name": "True2Nature",
  "type": "Brand · Commerce · Connected operations",
  "intro": "Brand and packaging design, an eCommerce solution and a dashboard integrated with every digital endpoint, supported by a go-to-market and marketing strategy.",
  "sections": [
   [
    "Brand and packaging",
    "Brand and packaging design establish the True2Nature identity across its products and digital presence."
   ],
   [
    "Connected commerce",
    "An eCommerce solution and a dashboard integrated with all of True2Nature’s digital endpoints bring the business together, supported by a go-to-market and marketing strategy."
   ],
   [
    "Before and after",
    "Explore the transformation through the original and redesigned storefront, product and contact pages, followed by the recorded mobile and desktop Google PageSpeed results."
   ]
  ]
 },
 {
  "name": "Jungle Laz",
  "type": "Artist brand · 3D experience · AI personal assistant",
  "intro": "A brand, website and 3D experience, paired with a high-calibre AI personal assistant that automates 70% of regular tasks outside music production, giving Jungle Laz more time and energy to make music while helping it reach more people.",
  "sections": [
   [
    "A world around the artist",
    "Brand, website and 3D experience come together to shape Jungle Laz’s digital presence."
   ],
   [
    "More room to make music",
    "We set up a high-calibre AI personal assistant that automates 70% of regular non-music-production tasks, freeing time and energy for making music while helping it reach more people."
   ],
   [
    "The first month",
    "Within one month of launching his AI personal assistant, Jungle Laz secured an international artist management contract and a separate sync licensing company to represent his entire catalogue. His single Jungle Boy reached 100,000 streams, and established music producers delivered three Jungle Boy remixes."
   ]
  ]
 }
];
const direct=[null,null,
 {name:'Our tech stack.',type:'Temple of Intelligence · Technology',intro:'Creative experiences, capable systems and a curiosity for what comes next.',sections:[['Engineering beneath the experience.','Narayana brings around 15 years of experience across backend systems, hosting, cryptography, crypto wallets and DevOps. His focus connects reliable infrastructure with AI and language-model engineering.'],['Specialist intelligence.','Our work spans local and hosted language models, agents and connected workflows. Narayana’s Sanskrit language-model research explores tools for reading, interpretation and study. We choose the architecture around the purpose, the data and the people using it.'],['The technology inside this world.','The Mantrium runs on native JavaScript modules, Three.js and WebGL, with custom shaders, bloom and interactive 3D scenes. HTML and CSS carry the reading layouts; the Web Audio API shapes its sound. PHP endpoints support the website’s connected features on cPanel hosting.'],['Tech we love.','AI that gives people more room to think and create. 3D that makes digital spaces feel worth exploring. Blockchain that opens new possibilities for ownership and direct exchange. We bring these disciplines together where they make the experience more useful, expressive or connected.']]},
 {name:'Everything begins with intention.',type:'Temple of Origin · The studio',intro:'A meeting place for imagination, craft and thoughtful technology.',sections:[['01 · Our beginning','Mantrium is founded by Laszlo and Narayana. We bring creative vision and technical thinking into the same space, with a shared interest in making meaningful things.'],['02 · Our way of seeing','Ancient wisdom. Future systems. We are drawn to the balance between enduring human ideas and emerging possibilities. Curiosity keeps that conversation open.'],['03 · Our way of making','We work across disciplines, from the first question to the details that make an experience feel complete. Care, experimentation and honest dialogue shape the process.'],['04 · A shared possibility','The best work begins with a worthwhile question. We welcome ideas that invite us to think deeply, make carefully and create something with a reason to exist.']]}
];
export function createTemplePages({leave,select,onOpen=()=>{},onRoom=()=>{}}){
 const root=document.createElement('section');root.id='temple-pages';root.hidden=true;root.setAttribute('aria-label','Temple interior');
 root.innerHTML='<div class="temple-toolbar"><span class="temple-caption"></span><button data-back hidden>←︎ All studies</button></div><button data-exit class="temple-exit-label">Return to the Mantrium <span aria-hidden="true">→︎</span></button><div class="pedestal-ui"><div class="gallery-heading"><span class="eyebrow"></span><h2></h2><p>Move towards a pedestal, or choose its tile.</p></div><div class="pedestal-labels"></div></div><article class="temple-reading" tabindex="0" aria-label="Temple story"><div class="reading-content"></div></article><div class="reading-progress"><span></span></div>';
 document.body.append(root);const reading=root.querySelector('article'),content=root.querySelector('.reading-content'),gallery=root.querySelector('.pedestal-ui'),labels=root.querySelector('.pedestal-labels'),back=root.querySelector('[data-back]');
 let opening=false,fadeReady=false,cameraReady=false,openingAnimation=null;
 const exit=root.querySelector('[data-exit]'),progressTrack=root.querySelector('.reading-progress'),progressBar=progressTrack.querySelector('span');
 let stages=[],chapters=[],galleryButtons=[];
 const touchReading=matchMedia('(pointer:coarse), (max-width:650px)');
 const heldDuringOpening=new Set();
 function unlockOpening(){if(opening&&fadeReady&&cameraReady){opening=false;reading.removeAttribute('aria-busy');}}
 function cancelOpening(){openingAnimation?.cancel();openingAnimation=null;opening=false;reading.removeAttribute('aria-busy');}
 const navigationKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D','PageUp','PageDown','Home','End',' ']);
 addEventListener('keydown',event=>{
  if(!navigationKeys.has(event.key))return;
  if(opening||heldDuringOpening.has(event.key)){event.preventDefault();event.stopImmediatePropagation();heldDuringOpening.add(event.key);}
 },true);
 addEventListener('keyup',event=>heldDuringOpening.delete(event.key),true);
 addEventListener('blur',()=>heldDuringOpening.clear());
 for(const event of ['wheel','touchmove'])root.addEventListener(event,e=>{if(opening && !(event==='touchmove' && touchReading.matches)){e.preventDefault();e.stopImmediatePropagation();}},{capture:true,passive:false});
 let index=-1,item=-1,mode='gallery',progress=0,active=0,orbAnchor={x:.72,y:.1},hasScrolled=false,closeTimer=null;
 root.querySelector('[data-exit]').onclick=()=>{leave()};back.onclick=()=>closePage();
 for(const event of ['wheel','touchmove'])root.addEventListener(event,e=>e.stopPropagation(),{passive:true});
 function updateReading(){
  if(root.hidden||mode!=='reading')return;
  if(reading.scrollTop>80)hasScrolled=true;else if(!touchReading.matches&&hasScrolled&&reading.scrollTop<=2){closePage();return;}
  progress=reading.scrollTop/Math.max(1,reading.scrollHeight-reading.clientHeight);
  const focusY=innerHeight*.56;
  let current=stages[0];active=0;
  for(const stage of stages){if(stage.getBoundingClientRect().top<focusY){current=stage;active=Number(stage.dataset.section)||0;}}
  chapters.forEach((section,i)=>section.classList.toggle('illuminated',section===current));
  const mobile=innerWidth<=650,left=innerWidth*(mobile?.17:.32),right=innerWidth*(mobile?.83:.68);
  let x=current.dataset.orbSide==='left'?left:right,y=focusY;
  const next=stages[stages.indexOf(current)+1];
  if(next){const rect=current.getBoundingClientRect(),nextRect=next.getBoundingClientRect();const gapMid=(rect.bottom+nextRect.top)/2;
   const travel=Math.min(1,Math.max(0,(focusY-gapMid+70)/140)),ease=travel*travel*(3-2*travel);
   if(travel>0&&travel<1){const nextX=next.dataset.orbSide==='left'?left:right;x+=(nextX-x)*ease;y=gapMid;}
   else if(travel===1)x=next.dataset.orbSide==='left'?left:right;
  }
  orbAnchor={x:x/innerWidth*2-1,y:1-y/innerHeight*2};
  progressBar.style.transform=`scaleY(${progress})`;
 }

 let bottomIntent=0,touchY=null;
 const atBottom=()=>mode==='reading'&&reading.scrollHeight>reading.clientHeight&&reading.scrollTop+reading.clientHeight>=reading.scrollHeight-3;
 reading.addEventListener('wheel',event=>{if(!atBottom()||event.deltaY<=0){bottomIntent=0;return;}bottomIntent+=event.deltaY*(event.deltaMode===1?16:1);if(bottomIntent>60){bottomIntent=0;closePage();}},{passive:true});
 reading.addEventListener('touchstart',event=>{touchY=event.touches[0]?.clientY;bottomIntent=0;},{passive:true});
 reading.addEventListener('touchmove',event=>{if(event.touches.length!==1){touchY=null;bottomIntent=0;return;}const y=event.touches[0]?.clientY;if(y===undefined||touchY===null)return;const delta=touchY-y;touchY=y;if(atBottom()&&delta>0){bottomIntent+=delta;if(bottomIntent>50){bottomIntent=0;closePage();}}else bottomIntent=0;},{passive:true});
 const arrowKeys=new Set();let arrowVelocity=0,arrowFrame=0,arrowLast=0,edgeHold=0,arrowTapUntil=0,arrowTapDirection=0;
 function stopArrowScroll(){arrowKeys.clear();arrowTapUntil=0;arrowVelocity=0;edgeHold=0;cancelAnimationFrame(arrowFrame);arrowFrame=0;}
 function glideArrows(now){
  if(root.hidden||mode!=='reading'){stopArrowScroll();return;}
  const dt=Math.min((now-arrowLast)/1000,.04);arrowLast=now;
  const direction=(arrowKeys.has('ArrowDown')?1:0)-(arrowKeys.has('ArrowUp')?1:0)||(now<arrowTapUntil?arrowTapDirection:0);
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const target=direction*460;
  arrowVelocity=reduced?target:arrowVelocity+(target-arrowVelocity)*(1-Math.exp(-dt*(direction?9:12)));
  reading.scrollTo({top:reading.scrollTop+arrowVelocity*dt,behavior:'instant'});
  if(direction>0&&atBottom()){edgeHold+=dt;if(edgeHold>.3){stopArrowScroll();closePage();return;}}else edgeHold=0;
  if(!direction&&Math.abs(arrowVelocity)<1){stopArrowScroll();return;}
  arrowFrame=requestAnimationFrame(glideArrows);
 }
 addEventListener('keydown',event=>{
  if(root.hidden||mode!=='reading'||!['ArrowUp','ArrowDown'].includes(event.key)||event.target.closest('input,textarea,select,[contenteditable],.crystal-viewer'))return;
  event.preventDefault();event.stopImmediatePropagation();const down=event.key==='ArrowDown';
  if(event.repeat&&!arrowKeys.has(event.key))return;
  if(!event.repeat&&((down&&atBottom())||(!down&&reading.scrollTop<=2))){stopArrowScroll();closePage();return;}
  arrowKeys.add(event.key);if(!event.repeat){arrowTapDirection=down?1:-1;arrowTapUntil=performance.now()+160;}
  if(!arrowFrame){arrowLast=performance.now();arrowFrame=requestAnimationFrame(glideArrows);}
 },true);
 addEventListener('keyup',event=>{if(arrowKeys.delete(event.key)){event.preventDefault();event.stopImmediatePropagation();}},true);
 addEventListener('blur',stopArrowScroll);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopArrowScroll();});
 reading.addEventListener('wheel',stopArrowScroll,{passive:true});reading.addEventListener('touchstart',stopArrowScroll,{passive:true});
 // Transparent portions of the full-screen reader must not swallow site controls.
 addEventListener('wheel',event=>{
  if(root.hidden||mode!=='reading'||reading.contains(event.target)||event.target.closest('header,.temple-toolbar,button,a,input,textarea'))return;
  event.preventDefault();if(opening)return;
  stopArrowScroll();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?reading.clientHeight:1);
  if((delta<0&&reading.scrollTop<=2)||(delta>0&&atBottom())){closePage();return;}
  reading.scrollBy({top:delta,behavior:'instant'});
 },{passive:false});
 reading.addEventListener('scroll',updateReading,{passive:true});addEventListener('resize',updateReading);

 function fadeExit(){const heading=root.querySelector('.gallery-heading');if(root.hidden||gallery.hidden)return;const bounds=heading.getBoundingClientRect(),copy=heading.cloneNode(true);copy.setAttribute('aria-hidden','true');Object.assign(copy.style,{position:'fixed',left:bounds.left+'px',top:bounds.top+'px',width:bounds.width+'px',maxWidth:'none',right:'auto',margin:'0',zIndex:'30',pointerEvents:'none'});document.body.append(copy);const animation=copy.animate([{opacity:getComputedStyle(heading).opacity},{opacity:0}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?160:750,easing:'ease-out',fill:'forwards'});animation.onfinish=()=>copy.remove();}
 function hide(){if(root.hidden&&!opening&&!arrowFrame)return;cancelOpening();stopArrowScroll();root.hidden=true;document.body.classList.remove('temple-ui','temple-reading-open','temple-gallery')}
 function showGallery(){mode='gallery';item=-1;reading.hidden=true;reading.classList.remove('closing');gallery.hidden=false;back.hidden=true;document.body.classList.remove('temple-reading-open');progressTrack.hidden=true;
  if(index>=2){root.querySelector('.gallery-heading .eyebrow').textContent='TEMPLE OF '+(index===2?'INTELLIGENCE':'ORIGIN');root.querySelector('.gallery-heading h2').textContent=index===2?'Human vision. Intelligent systems.':'Everything begins with intention.';root.querySelector('.gallery-heading p').textContent='Approach the pedestal to explore.';labels.innerHTML='<button class="pedestal-choice resume-reading">Approach the pedestal</button>';labels.querySelector('button').onclick=()=>select(0);galleryButtons=[...labels.querySelectorAll('button')];}
 }
 function closePage(){if(mode!=='reading'||opening)return;stopArrowScroll();mode='returning';hasScrolled=false;reading.classList.add('closing');onRoom();clearTimeout(closeTimer);closeTimer=setTimeout(()=>{closeTimer=null;showGallery()},500);}

 const motifs=[['Imagine','Shape','Create'],['Question','Explore','Understand'],['Vision','Craft','Systems','Intelligence'],['Intention','Perspective','Practice','Connection']];
 const principles=[['A world worth entering.','Technology with a human purpose.','Make room for possibility.'],['Every decision tells a story.','Clarity is a form of care.','Understanding changes everything.'],['See clearly. Think deeply.','Make ideas tangible.','Build for what comes next.','Let people lead.'],['Begin with a worthwhile question.','Ancient wisdom. Future systems.','The detail is part of the idea.','Meaning grows through connection.']];
 function ornament(i){return `<div class="chapter-art" aria-hidden="true"><div class="art-orbit"><i></i><i></i><i></i><span>${String(i+1).padStart(2,'0')}</span></div><span>${motifs[index][i]}</span></div>`;}
 function comparisonPlaceholders(){
  const titles=['Brand identity','Website','Dashboard','Additional comparison 04','Additional comparison 05','Google speed tests'];
  return titles.map((title,i)=>{const side=i%2?'right':'left';return `<section class="chapter comparison-chapter copy-${side}" data-orb-side="${side==='left'?'right':'left'}"><div class="chapter-copy"><div class="chapter-meta"><span class="section-number">${String(i+4).padStart(2,'0')}</span><span>${i===5?'PERFORMANCE':'BEFORE & AFTER'}</span></div><h2>${title}</h2><div class="comparison-pair">${['Before','After'].map(label=>`<figure class="comparison-placeholder"><figcaption>${label}</figcaption><div class="comparison-empty" role="img" aria-label="${label} ${title.toLowerCase()} placeholder"><span aria-hidden="true">+</span><small>${i===5?'Speed-test result pending':'Screenshot pending'}</small></div></figure>`).join('')}</div>${i===5?'<p class="comparison-caption">Google speed-test screenshots and verified scores will appear here.</p>':''}</div></section>`;}).join('');
 }
 function openPage(which=-1){
  cancelOpening();stopArrowScroll();opening=true;fadeReady=false;cameraReady=false;reading.setAttribute('aria-busy','true');dispatchEvent(new Event('mantrium:reading-open'));
 clearTimeout(closeTimer);closeTimer=null;hasScrolled=false;reading.classList.remove('closing');onOpen();item=which;mode='reading';root.dataset.temple=['creation','knowledge','intelligence','origin'][index];
  const data=index<2?(index===0?projects:studies)[which]:direct[index];
  content.innerHTML=`<div class="reading-hero" data-orb-side="right"><div class="hero-copy"><span class="eyebrow">${data.type}</span><h1>${data.name}</h1><p class="reading-deck">${data.intro}</p><span class="scroll-cue">SCROLL TO DISCOVER ↓︎</span></div><div class="hero-seal" aria-hidden="true"><span>${['CREATE','DISCOVER','CONNECT','BECOME'][index]}</span><i>0${index+1}</i></div></div>`+
   data.sections.map(([title,text],i)=>{const side=i%2===0?'right':'left',kind=['statement','split','framed','manifesto'][(i+index)%4];return `<section class="chapter chapter-${kind} copy-${side}" data-section="${i}" data-orb-side="${side==='right'?'left':'right'}">${ornament(i)}<div class="chapter-copy"><div class="chapter-meta"><span class="section-number">${String(i+1).padStart(2,'0')}</span><span>${motifs[index][i]}</span></div><h2>${title.replace(/^\d+ · /,'')}</h2><p>${text}</p><div class="chapter-note">${principles[index][i]}</div></div></section>`;}).join('')+
   (index===0&&which===0?threePMStory():index===1?(which===1?true2natureStudy():which===0?comparisonPlaceholders():''):'')+
   '<div class="reading-end" data-orb-side="right"><div><span class="eyebrow">CARRY THE IDEA WITH YOU</span><h2>Every return is<br><em>a new beginning.</em></h2><button data-finish>Return to the Mantrium <span class="cta-arrow" aria-hidden="true">→︎</span></button></div></div>';
  stages=[...content.querySelectorAll('[data-orb-side]')];chapters=[...content.querySelectorAll('section')];
  content.querySelector('[data-finish]').onclick=()=>{leave()};reading.hidden=false;gallery.hidden=true;back.hidden=index>=2;back.textContent=index===0?'←︎ All projects':'←︎ All studies';progressTrack.hidden=false;document.body.classList.add('temple-reading-open');reading.scrollTo({top:0,left:0,behavior:'instant'});progress=0;active=0;orbAnchor={x:.54,y:-.12};reading.focus({preventScroll:true});openingAnimation=content.querySelector('.hero-copy').animate([{opacity:0},{opacity:1}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:900,easing:'ease',fill:'none'});openingAnimation.onfinish=()=>{fadeReady=true;unlockOpening();};requestAnimationFrame(()=>{updateReading();updateGlassLettering();});
 }

 function updateGlassLettering(){
  const em=content.querySelector('.reading-end em');if(!em)return;
  const style=getComputedStyle(em),size=parseFloat(style.fontSize),width=em.getBoundingClientRect().width,height=em.getBoundingClientRect().height;
  if(!width||!height)return;
  const text=em.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><text x="1" y="${size*.96}" font-family="Georgia,serif" font-style="italic" font-size="${size}" fill="white">${text}</text></svg>`;
  em.style.setProperty('--letter-mask',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
 }
 addEventListener('resize',updateGlassLettering);
 function initialize(i){index=i;root.style.setProperty('--temple-accent',['#e1c48c','#b0c6ef','#a7e1d3','#d6bde9'][i]);root.querySelector('.temple-caption').textContent='TEMPLE OF '+['CREATION','KNOWLEDGE','INTELLIGENCE','ORIGIN'][i];if(i<2){const list=i===0?projects:studies;labels.innerHTML=list.map((p,j)=>`<button class="pedestal-choice" data-pedestal="${j}"><small>0${j+1} · ${i===0?'PROJECT':'STUDY'}</small><strong>${p.name}</strong><span>Explore</span></button>`).join('');labels.querySelectorAll('button').forEach(b=>b.onclick=()=>select(Number(b.dataset.pedestal)));root.querySelector('.gallery-heading .eyebrow').textContent=i===0?'THE TEMPLE OF CREATION':'THE TEMPLE OF KNOWLEDGE';root.querySelector('.gallery-heading h2').innerHTML=i===0?'Possibility,<br>given form.':'Behind the finished form.';showGallery()}else showGallery();}
 return {get hoveredPedestal(){if(root.hidden||mode!=='gallery')return -1;const tile=labels.querySelector('.pedestal-choice:hover,.pedestal-choice:focus-visible');return tile?Number(tile.dataset.pedestal||0):-1;},setInputReady(ready){cameraReady=ready;unlockOpening();},get orbAnchor(){return orbAnchor},get mode(){return mode},get progress(){return progress},get activeSection(){return active},get item(){return item},openPage,hide,fadeExit,reset(){clearTimeout(closeTimer);closeTimer=null;index=-1;hasScrolled=false;hide()},update(i,ready,positions,exitPosition){if(!ready){hide();return}if(index!==i){initialize(i);galleryButtons=[...labels.querySelectorAll('button')];}const wasHidden=root.hidden;root.hidden=false;if(wasHidden){updateReading();const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;root.querySelectorAll('.gallery-heading>.eyebrow,.gallery-heading>h2,.gallery-heading>p').forEach((element,i)=>element.animate([{opacity:0},{opacity:1}],{duration:reduce?160:1000,delay:reduce?0:i*100,easing:'ease-out',fill:'backwards'}));}document.body.classList.add('temple-ui');document.body.classList.toggle('temple-reading-open',mode==='reading'||mode==='returning');document.body.classList.toggle('temple-gallery',mode==='gallery');exit.hidden=mode!=='gallery'||!exitPosition||exitPosition.z>1||exitPosition.x<40||exitPosition.x>innerWidth-12||exitPosition.y<80||exitPosition.y>innerHeight-30;if(exitPosition){exit.classList.toggle('exit-label-left',innerWidth<=650&&exitPosition.x>innerWidth-165);exit.style.left=exitPosition.x+'px';exit.style.setProperty('--exit-x',exitPosition.x+'px');const labelY=innerWidth<=650&&innerHeight<=650?innerHeight*.38:exitPosition.y;exit.style.top=labelY+'px';const lineDy=exitPosition.y-labelY;exit.style.setProperty('--exit-line-length',Math.hypot(16,lineDy)+'px');exit.style.setProperty('--exit-line-angle',Math.atan2(lineDy,16)+'rad');}if(mode==='gallery')galleryButtons.forEach((b,j)=>{b.style.left=(innerWidth/2+(index<2?j-1:0)*(innerWidth<=650?(innerWidth-24)/3:210))+'px';b.style.top=(innerWidth<=650?Math.min(innerHeight*.65,innerHeight-285):(innerHeight<520?innerHeight-145:innerHeight*.79))+'px'})}};
}
