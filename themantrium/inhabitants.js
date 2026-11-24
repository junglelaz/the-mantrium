import {variedDialogue,recentDialogue,rememberDialogue} from './dialogue-variety.js?v=spacing237';
import {createGuruReading} from './guru-reading.js?v=spacing237';
import {createOfflineDialogue} from './npc-fallback.js?v=spacing237';
import {createNpcContext} from './npc-context.js?v=spacing237';
import {createNpcDialogue} from './npc-dialogue.js?v=spacing237';
import {addBubbleClose} from './speech-controls.js?v=spacing237';
import * as T from 'three';
// Curated local characters, explicitly labelled NPCs; never represented as real visitors.
export function createInhabitants(scene,navigation,camera){
 const group=new T.Group();group.name='Wandering guides';scene.add(group);
 const dialogue=createNpcDialogue(),guruDialogue=createNpcDialogue(),offline=createOfflineDialogue();let dialogueSerial=0,oracleEncounter=false,guidanceTurns=0,sanctumHints=0;
 let chatDiscovered=false;try{chatDiscovered=localStorage.getItem('mantrium-chat-discovered')==='1';}catch{}
 const names=['The Wandering Sage','The Observer','The Oracle of Origins','Guru'],colors=['#e2c78f','#9dc6d5','#c1a6da','#f1d6ad'];
 const shortNames=['Sage','Observer','Oracle','Guru'];
 const lines=[['You do not need to see the whole path to take the next step.','A quiet beginning is still a beginning.','Creation starts where curiosity is allowed to wander.','An idea becomes clearer when you give it room to breathe.','Sometimes the smallest detail opens the largest door.'],['Notice what changes when you stop looking for the destination.','Every crossing holds two perspectives. Both can be true.','What you carry changes the way the world meets you.','Wonder lives in the space between seeing and understanding.','A familiar path can reveal something new.'],['Before a thing has a shape, it has an intention.','The way home is part of the journey.','Wisdom is not what you collect, but what you allow to change you.','Leave room for the answer you did not expect.','Stillness can be a way of moving forward.']];
 const sanctumGuidance=count=>count===4?['The Secret Sanctum is open. Return to the central crossing and let your orb fall through the glowing circular opening.','You have visited all four temples. The Secret Sanctum awaits beneath the centre. Follow the light into the opening.']:['The Secret Sanctum waits beneath the Mantrium. Visit all four temples, then return to the centre to discover its entrance.','Four temples hold the way to The Secret Sanctum. Visit each one and return to the central crossing.','Gather the colour of every temple. Once all four have been visited, a circular opening at the centre leads to The Secret Sanctum.'];
 const guidance=count=>count===4?['The centre has opened. Return there and follow the light into the circular passage.','You carry all four colours. The hidden chamber awaits beneath the centre.']:['Enter any temple to explore. Return to the Mantrium to carry its colour.','Use the menu to choose a temple, or follow the paths to its doorway.','Approach a pedestal inside any temple to open its story.','Scroll back to the top of a temple page to return to its room.','Send a light pulse with P, or double-tap the movement control on mobile.'];
 function nextThought(c,i,count){
  if(i===3){speak(c,variedDialogue(c.guruEngaged?'guru-reflection':'guru-welcome',c.guruEngaged?[
   'There is no hurry here. Stay with whatever insight feels worth exploring.',
   'We can stay with your reading, or follow another question. What is on your mind?',
   'Let the thought settle. You are welcome to ask about anything that arises.',
   'Some questions need room before they need an answer. I am listening.'
  ]:[
   'Welcome to The Secret Sanctum. Would you like a personal Jyotisha reading? We can begin with your birth date, local birth time and birthplace.',
   'You have found a quiet place beneath the crossing. Shall we explore your birth chart, or simply talk?',
   'Welcome, traveller. If you would like a Jyotisha reading, share your birth date, local birth time and birthplace. Or bring any question.',
   'Four colours have brought you here. What would you like to explore? I can offer a personal Jyotisha reading using your birth details.',
   'Rest a moment in the Sanctum. We can discuss what is on your mind, or explore your starting sky with a birth date, time and place.',
   'A new conversation begins here. Would you like to look at your birth chart? If your birth time is unknown, you can say so.'
  ]));return;}
  let text;if(c.sinceHint>=c.hintAfter){const hints=guidance(count);text=++guidanceTurns%3===0?variedDialogue('sanctum-'+i+'-'+count,sanctumGuidance(count)):variedDialogue('guidance-'+i+'-'+count,hints);c.sinceHint=0;c.hintAfter=[2,4,3,5][++c.hintIndex%4];}
  else{text=variedDialogue('idle-'+i,lines[i]);c.sinceHint++;}
  speak(c,text);
  if(i===2&&available&&!editing&&!oracleEncounter){oracleEncounter=true;const serial=dialogueSerial;dialogue.ask('Use a fresh opening, image and wording. Avoid repeating these recent welcomes: '+JSON.stringify(recentDialogue('oracle-live'))+'. Offer a brief, evocative welcome shaped by one current transit or Panchanga element in the supplied sky context. If an approximate region is available, offer a tentative local symbolic outlook shaped by the supplied sky and sunrise context, perhaps weaving in one grounded landscape detail. Do not simply announce my location or invent a forecast.',['Oracle'],count,conversationContext.get()).then(replies=>{if(serial===dialogueSerial&&available&&!editing&&!c.dismissed&&Math.hypot(c.state.x-currentPlayer.x,c.state.z-currentPlayer.z)<9){rememberDialogue('oracle-live',replies.Oracle);speak(c,replies.Oracle);}}).catch(()=>{});}
 }
 const characters=names.map((name,index)=>{
  let start=null;for(let z=-22;z<=22&&!start;z+=2)for(let x=-24;x<=24;x+=2){if(index===0&&x>-8||index===1&&x<8||index===2&&(Math.abs(x)>8||z<12))continue;const h=navigation.valid(x,z,.35);if(h!==null){start={x,z,height:h};break}}
  if(index===3)start={x:0,z:0,height:-60.79};
  const material=new T.MeshPhysicalMaterial({color:colors[index],emissive:colors[index],emissiveIntensity:.24,roughness:.18,metalness:.15,transparent:true,opacity:.7});const mesh=new T.Mesh(new T.SphereGeometry(.43,24,16),material);group.add(mesh);

  const label=document.createElement('div');label.className='npc-label npc-speech speech-bubble';label.style.setProperty('--signal-delay',(-index*1.73)+'s');if(index===3)label.dataset.anchored='guru';label.setAttribute('role','note');label.setAttribute('aria-label',shortNames[index]+' · NPC guide');label.hidden=true;const prefix=document.createElement('strong');prefix.textContent=shortNames[index]+': ';const message=document.createElement('span');message.className='npc-typed';const messageFrame=document.createElement('div');messageFrame.className='npc-message-frame';messageFrame.append(message);label.append(prefix,messageFrame);const chatHint=document.createElement('button');chatHint.type='button';chatHint.className='npc-chat-hint';chatHint.tabIndex=-1;chatHint.hidden=chatDiscovered;label.classList.toggle('has-chat-hint',!chatDiscovered);chatHint.addEventListener('pointerdown',event=>event.stopPropagation());chatHint.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();startChat();});label.append(chatHint);document.body.append(label);
  const character={state:start||{x:0,z:0,height:.35},mesh,label,message,messageFrame,chatHint,targetText:'',typingPhase:'idle',typingClock:0,heading:index*2.1,turn:0,thought:0,sinceHint:0,hintAfter:2+index,hintIndex:0,remaining:0,dismissed:false};
  addBubbleClose(label,()=>{character.dismissed=true;label.hidden=true;},'Close '+shortNames[index]+' speech bubble');

  return character;
 });

 const bubbleAnchors=new Map(),connectors=new Map();
 function positionBubble(element,world,radius){const projected=world.clone().project(camera),depth=-world.clone().applyMatrix4(camera.matrixWorldInverse).z;const screenRadius=radius*innerHeight/(2*Math.max(.1,depth)*Math.tan(T.MathUtils.degToRad(camera.fov/2)));bubbleAnchors.set(element,{x:(projected.x*.5+.5)*innerWidth,y:(-projected.y*.5+.5)*innerHeight-screenRadius-12});}
 // Keep each bubble at a constant size; move crowded bubbles into nearby free lanes.
 function arrangeBubbles(){
  const visibleBottom=Math.min(Number(document.documentElement.dataset.controlCeiling??innerHeight),innerHeight,(window.visualViewport?.height??innerHeight)+(window.visualViewport?.offsetTop??0));
  const exitLabel=document.querySelector('.sanctum-exit-label');const exitBounds=exitLabel&&!exitLabel.hidden?exitLabel.getBoundingClientRect():null;const obstacle=exitBounds?{x:exitBounds.left,y:exitBounds.top-8,w:exitBounds.width,h:exitBounds.height+16}:null;
  const placed=obstacle?[obstacle]:[];for(const line of connectors.values())line.hidden=true;
  for(const [element,a] of [...bubbleAnchors].sort(([a],[b])=>Number(b.dataset.anchored==='guru')-Number(a.dataset.anchored==='guru'))){
   const w=element.offsetWidth,h=element.offsetHeight,pad=12;let best=null;
   for(const dx of [0,-w-pad,w+pad])for(const dy of [0,-h-pad,h+pad,-2*(h+pad),2*(h+pad)]){
    const x=Math.max(12,Math.min(innerWidth-w-12,a.x-w/2+dx)),y=Math.max(76,Math.min(visibleBottom-h-16,a.y-h+dy));
    const overlap=placed.reduce((sum,r)=>sum+Math.max(0,Math.min(x+w+pad,r.x+r.w)-Math.max(x-pad,r.x))*Math.max(0,Math.min(y+h+pad,r.y+r.h)-Math.max(y-pad,r.y)),0);
    const score=overlap*10000+Math.pow(x+w/2-a.x,2)+Math.pow(y+h-a.y,2);if(!best||score<best.score)best={x,y,w,h,score};
   }
   if(element.dataset.anchored==='guru'){
    best={x:Math.max(12,Math.min(innerWidth-w-12,a.x-w/2)),y:a.y-h,w,h};
    if(obstacle&&best.x+w+pad>obstacle.x&&best.x-pad<obstacle.x+obstacle.w&&best.y+h+pad>obstacle.y&&best.y-pad<obstacle.y+obstacle.h){
     // Only the fixed ladder label can displace Guru, never the moving player bubble.
     const left=obstacle.x-w-20;
     if(left>=12)best.x=Math.min(best.x,left);
     else if(obstacle.y-h-20>=76)best.y=obstacle.y-h-20;
     else best.y=obstacle.y+obstacle.h+20;
    }
   }
   best.y=Math.max(76,Math.min(visibleBottom-h-16,best.y));
   placed.push(best);element.style.left=(best.x+w/2)+'px';element.style.top=(best.y+h)+'px';
   const displaced=Math.abs(best.x+w/2-a.x)>2||Math.abs(best.y+h-a.y)>2;element.classList.toggle('bubble-displaced',displaced);
   const pointerX=Math.max(16,Math.min(w-16,a.x-best.x)),above=a.y<best.y;element.style.setProperty('--pointer-x',pointerX+'px');element.dataset.pointerSide=above?'top':'bottom';
   const shapeKey=[w,h,Math.round(pointerX),above].join(':');if(element.dataset.glassShape!==shapeKey){element.dataset.glassShape=shapeKey;const x=Math.round(pointerX),r=12,t=8,b=h+8;const top=above?`L ${x-8} ${t} L ${x} 0 L ${x+8} ${t}`:'',bottom=above?'':`L ${x+8} ${b} L ${x} ${b+8} L ${x-8} ${b}`;element.style.setProperty('--speech-outline',`path("M ${r} ${t} ${top} L ${w-r} ${t} Q ${w} ${t} ${w} ${t+r} L ${w} ${b-r} Q ${w} ${b} ${w-r} ${b} ${bottom} L ${r} ${b} Q 0 ${b} 0 ${b-r} L 0 ${t+r} Q 0 ${t} ${r} ${t} Z")`);}

   if(displaced && a.y+8<visibleBottom){let line=connectors.get(element);if(!line){line=document.createElement('div');line.className='speech-connector';element.append(line);connectors.set(element,line);}const x=best.x+pointerX,y=above?best.y-8:best.y+h+8;line.hidden=false;line.style.left=pointerX+'px';line.style.top=(above?-8:h+8)+'px';line.style.width=Math.hypot(a.x-x,a.y+6-y)+'px';line.style.transform='rotate('+Math.atan2(a.y+6-y,a.x-x)+'rad)';}

  }
 }
 function speak(c,text){text=String(text).replace(/\s*[\u2013\u2014]\s*/g,', ');c.messageFrame.dataset.fullText=text;c.chatHint.classList.remove('is-visible');c.chatHint.tabIndex=-1;c.targetText=text;c.typingPhase=c.message.textContent?'erase':'type';c.typingClock=0;c.remaining=10+text.split(/\s+/).length*.35;}
 function typeMessage(c,dt,reduced){if(c.typingPhase==='idle')return;if(reduced){c.message.textContent=c.targetText;c.typingPhase='idle';return;}c.typingClock+=dt;const interval=c.typingPhase==='erase'?.014:.027;while(c.typingClock>=interval&&c.typingPhase!=='idle'){c.typingClock-=interval;if(c.typingPhase==='erase'){c.message.textContent=c.message.textContent.slice(0,-1);if(!c.message.textContent)c.typingPhase='type';}else{c.message.textContent=c.targetText.slice(0,c.message.textContent.length+1);if(c.message.textContent===c.targetText)c.typingPhase='idle';}}}
 let inSanctum=false;
 const present=c=>characters.indexOf(c)===3?inSanctum:!inSanctum;
 let currentPlayer=null,currentCount=0,available=false,editing=false,userTTL=0,chatPartner=null,chatFade=0;
 const bubble=document.createElement('form');bubble.className='player-speech speech-bubble';bubble.hidden=true;
 const ownName=document.createElement('strong');ownName.textContent='You: ';
 const input=document.createElement('textarea');input.rows=1;input.wrap='soft';input.enterKeyHint='send';input.maxLength=240;input.placeholder='Say something…';input.setAttribute('aria-label','Your message to nearby NPC orbs');
 function resizeMessage(){input.style.height='auto';input.style.height=Math.max(24,input.scrollHeight)+'px';}input.addEventListener('input',resizeMessage);addEventListener('resize',()=>{if(!bubble.hidden)resizeMessage();});
 const ownMessage=document.createElement('span');ownMessage.hidden=true;bubble.append(ownName,input,ownMessage);document.body.append(bubble);const conversationContext=createNpcContext();
 addBubbleClose(bubble,()=>{editing=false;userTTL=0;chatFade=0;chatPartner=null;bubble.hidden=true;input.blur();},'Close your speech bubble');
 const reading=createGuruReading((chart,message)=>{if(!inSanctum||!available)return;const c=characters[3],serial=++dialogueSerial;c.dismissed=false;c.guruEngaged=true;speak(c,chart?'Your sky is taking shape. Let me read its patterns alongside the sky of this moment.':'An unknown birth time leaves some parts of a chart open. Let us explore what that means.');c.remaining=35;guruDialogue.ask(message,['Guru'],currentCount,{...conversationContext.get(),birthChart:chart}).then(replies=>{if(serial===dialogueSerial&&inSanctum&&available)speak(c,replies.Guru);}).catch(()=>{if(serial===dialogueSerial&&inSanctum&&available)speak(c,chart?'Your chart is calculated, but my reading connection is resting. Please try again shortly; I will not invent its interpretation.':'Without a known birth time, I cannot reliably calculate your ascendant or houses. You are welcome to stay and talk without a chart.');});});
 const tapChat=matchMedia('(pointer:coarse), (max-width:650px)');
 function openBubbleChat(event){
  if(!tapChat.matches||document.body.classList.contains('speech-muted')||event.currentTarget.hidden||event.currentTarget.classList.contains('chat-departing')||event.target.closest('button,a,input,textarea,select'))return;
  event.stopPropagation();
  startChat();
 }
 for(const target of [...characters.map(c=>c.label),bubble]){
  let origin=null;
  target.addEventListener('touchstart',e=>{
   const touch=e.touches[0];origin=e.touches.length===1?[touch.clientX,touch.clientY]:null;
  },{passive:true});
  target.addEventListener('touchcancel',()=>{origin=null;});
  target.addEventListener('touchend',e=>{
   const start=origin;origin=null;const touch=e.changedTouches[0];
   if(!start||!touch||e.touches.length||Math.hypot(touch.clientX-start[0],touch.clientY-start[1])>12||e.target.closest('button,a,input,textarea,select'))return;
   if(!available||target.hidden||!tapChat.matches)return;
   e.preventDefault();openBubbleChat(e);
  },{passive:false});
  target.addEventListener('click',openBubbleChat);
 }
 function startChat(){if(!available)return;if(editing){input.focus();return;}if(!chatDiscovered){chatDiscovered=true;try{localStorage.setItem('mantrium-chat-discovered','1');}catch{}for(const c of characters){c.chatHint.hidden=true;c.chatHint.tabIndex=-1;c.label.classList.remove('has-chat-hint');}}editing=true;userTTL=0;chatFade=0;bubble.classList.remove('chat-departing');chatPartner=characters.filter(c=>present(c)&&Math.hypot(c.state.x-currentPlayer.x,c.state.z-currentPlayer.z)<9&&Math.abs(c.state.height-currentPlayer.height)<2).sort((a,b)=>Math.hypot(a.state.x-currentPlayer.x,a.state.z-currentPlayer.z)-Math.hypot(b.state.x-currentPlayer.x,b.state.z-currentPlayer.z))[0]||null;bubble.hidden=false;input.hidden=false;ownMessage.hidden=true;input.value='';input.focus({preventScroll:true});resizeMessage();}
 document.querySelector('#instructions').addEventListener('click',()=>{if(matchMedia('(any-pointer:coarse), (max-width:650px)').matches||navigator.maxTouchPoints>0)startChat()});
 addEventListener('keydown',event=>{if(event.key==='/'&&!event.target.closest('input,textarea,[contenteditable]')){event.preventDefault();event.stopImmediatePropagation();startChat();}else if(editing&&(event.target===input||event.key==='Escape')){if(event.key.startsWith('Arrow')){event.preventDefault();return;}event.stopImmediatePropagation();if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();bubble.requestSubmit();}if(event.key==='Escape'){editing=false;bubble.hidden=true;input.blur();}}},true);
 function reply(text,i){return offline.reply(text,i,{visited:currentCount,...conversationContext.get()});}
 bubble.onsubmit=async event=>{event.preventDefault();const text=input.value.trim();if(!text)return;const rect=input.getBoundingClientRect(),sent=document.createElement('div');sent.className='aether-message';sent.textContent=text;sent.style.left=rect.left+'px';sent.style.top=rect.top+'px';sent.style.width=rect.width+'px';document.body.append(sent);sent.addEventListener('animationend',()=>sent.remove(),{once:true});setTimeout(()=>sent.remove(),5000);input.value='';resizeMessage();input.focus();const recipients=characters.map((c,i)=>({c,i})).filter(({c})=>present(c)&&Math.hypot(c.state.x-currentPlayer.x,c.state.z-currentPlayer.z)<9&&Math.abs(c.state.height-currentPlayer.height)<2);if(!recipients.length)return;const serial=++dialogueSerial,contextRevision=conversationContext.revision;for(const {c,i} of recipients){c.remaining=Math.max(c.remaining,22);if(i===3)c.guruEngaged=true;}if(inSanctum){const intake=await reading.respond(text);if(serial!==dialogueSerial)return;if(intake.handled){if(intake.text)speak(characters[3],intake.text);return;}}(inSanctum?guruDialogue:dialogue).ask(text,recipients.map(({i})=>shortNames[i]),currentCount,{...conversationContext.get(),...(inSanctum?{birthChart:reading.chart}:{})}).then(replies=>deliver(replies)).catch(()=>deliver(null));function deliver(replies){if(serial!==dialogueSerial||!available||contextRevision!==conversationContext.revision)return;for(const {c,i} of recipients){if(c.dismissed||Math.hypot(c.state.x-currentPlayer.x,c.state.z-currentPlayer.z)>11||Math.abs(c.state.height-currentPlayer.height)>3)continue;speak(c,replies?replies[shortNames[i]]:reply(text,i));}}};
 return {get bodies(){return characters.filter(present).map(c=>({owner:c,x:c.state.x,z:c.state.z,y:c.state.height+1.6,radius:.43}))},get chatting(){return editing},update(dt,t,player,count,active,reduced,playerOrbPosition=null,sanctum=false,speechReady=true){if(inSanctum!==sanctum){reading.close();dialogueSerial++;editing=false;chatPartner=null;input.blur();}inSanctum=sanctum;camera.updateMatrixWorld(true);bubbleAnchors.clear();bubble.inert=!speechReady;for(const c of characters)c.label.inert=!speechReady;group.visible=active;currentPlayer=player;currentCount=count;available=active&&speechReady&&document.body.classList.contains('exploring');
 if(editing&&chatPartner&&(Math.hypot(chatPartner.state.x-player.x,chatPartner.state.z-player.z)>11||Math.abs(chatPartner.state.height-player.height)>3)){editing=false;chatFade=.5;bubble.classList.add('chat-departing');input.blur();}chatFade=Math.max(0,chatFade-dt);
 if(!available){if(editing)chatFade=.5;editing=false;bubble.hidden=chatFade<=0;input.blur();}else if(editing||userTTL>0||chatFade>0){bubble.hidden=false;userTTL=Math.max(0,userTTL-dt);const point=playerOrbPosition||new T.Vector3(player.x,player.height+1.45+(reduced?0:Math.sin(t*1.7)*.06),player.z);positionBubble(bubble,point,.65);}else bubble.hidden=true;
  characters.forEach((c,i)=>{c.label.hidden=true;c.mesh.visible=present(c);if(!active||!present(c))return;const distance=Math.hypot(c.state.x-player.x,c.state.z-player.z);const nearby=distance<9&&Math.abs(c.state.height-player.height)<2;
   let formingMessage=false;
   if(nearby && speechReady && !c.dismissed && c.typingPhase!=='idle'){
    const point=c.mesh.position.clone().project(camera);
    formingMessage=point.z<1 && Math.abs(point.x)<.98 && Math.abs(point.y)<.98;
   }
   if(i!==3&&distance>3.5&&!reduced&&!formingMessage){const before={...c.state};navigation.move(c.state,Math.cos(c.heading)*dt*.65,Math.sin(c.heading)*dt*.65,c);if(Math.hypot(c.state.x-before.x,c.state.z-before.z)<dt*.1)c.heading+=1.4;else c.heading+=Math.sin(t*.2+i)*dt*.08;}
   const body=navigation.orbs.find(o=>o.owner===c);if(body){body.x=c.state.x;body.z=c.state.z;body.y=c.state.height+1.6;}c.mesh.position.set(c.state.x,c.state.height+1.6+(reduced?0:Math.sin(t*.8+i)*.12),c.state.z);const proximityGlow=.2+.35*(1-T.MathUtils.smoothstep(distance,3.5,6.5));c.mesh.material.emissiveIntensity=T.MathUtils.damp(c.mesh.material.emissiveIntensity,proximityGlow,3,dt);
   if(distance>=9||Math.abs(c.state.height-player.height)>=2)c.dismissed=false;
   if(!c.dismissed&&distance<9&&Math.abs(c.state.height-player.height)<2){const p=c.mesh.position.clone().project(camera);if(p.z<1&&Math.abs(p.x)<.98&&Math.abs(p.y)<.98){c.label.hidden=false;if(speechReady)typeMessage(c,dt,reduced);if(!chatDiscovered){const ready=c.typingPhase==='idle'&&!!c.message.textContent;c.chatHint.textContent=(innerWidth<=650||matchMedia('(pointer:coarse)').matches)?'Tap here to communicate':'Press / to communicate';c.chatHint.classList.toggle('is-visible',ready);c.chatHint.tabIndex=ready?0:-1;}if(speechReady&&c.typingPhase==='idle')c.remaining-=dt;if(speechReady&&c.remaining<=0&&!(i===3&&editing))nextThought(c,i,count);positionBubble(c.label,c.mesh.position,.43);}}
  });
  arrangeBubbles();
 }};
}
