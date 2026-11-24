import * as T from 'three';

const trailSpacing=160,trailWindow=4000,staleAfter=15000;
const pigmentColors=['#d9a751','#728fdf','#58c9b1','#b889d6'].map(c=>new T.Color(c));
const samePosition=(a,b)=>a[1]===b[1]&&a[2]===b[2]&&a[3]===b[3];
function recordPoint(trail,stamp,player){
 const round=v=>Math.round(v*1000)/1000;
 const point=[stamp,round(player.x),round(player.height),round(player.z)];
 const last=trail.at(-1);
 if(last?.[0]===stamp)trail.pop();
 if(trail.length>=2&&samePosition(trail.at(-1),point)&&samePosition(trail.at(-2),point))trail.pop();
 trail.push(point);
 while(trail.length>26||(trail.length>1&&trail[0][0]<stamp-trailWindow))trail.shift();
}

// Only the sender knows its actual route through the hall. Replay each new point
// once, including turns and changes of elevation between presence requests.
function receiveTrail(peer,snapshot,stamp,first){
 if(first){peer.played=peer.latest=stamp;return;}
 if(stamp===peer.latest)return;
 if(stamp<peer.latest||stamp-peer.played>trailWindow+1000){
  peer.queue.length=0;
  peer.played=peer.latest=stamp-1200;
 }
 for(const point of snapshot.trail||[]){
  if(point[0]>peer.latest&&point[0]<stamp){peer.queue.push(point);peer.latest=point[0];}
 }
 peer.queue.push([stamp,snapshot.x,snapshot.y,snapshot.z]);peer.latest=stamp;
}

function advancePeer(peer,dt,target){
 if(!peer.queue.length)return;
 const buffer=peer.latest-peer.played;
 const speed=buffer>1700?1.15:buffer<300?.9:1;
 const until=Math.min(peer.latest,peer.played+dt*1000*speed);
 while(peer.queue.length){
  const [tick,x,y,z]=peer.queue[0];
  target.set(x,y+1.45,z);
  if(tick>until){
   peer.mesh.position.lerp(target,(until-peer.played)/(tick-peer.played));
   peer.played=until;
   break;
  }
  peer.mesh.position.copy(target);peer.played=tick;peer.queue.shift();
 }
}

export function createPresence(scene,navigation,onSharedOpening,onViewVisitor,speech){
 const group=new T.Group();group.name='Real nearby visitors';scene.add(group);
 const peers=new Map(),trail=[],target=new T.Vector3();
 let lastAttempt=performance.now(),retryAfter=0,busy=false,pulse=false,cooldown=0,lastSample=-Infinity;
 const button=document.createElement('button');button.className='presence-pulse';button.textContent='Send a pulse';button.setAttribute('aria-label','Send a light pulse to nearby visitors');button.hidden=true;document.body.append(button);
 const status=document.createElement('button');status.type='button';status.className='presence-status';status.hidden=true;status.title='Show the nearest visitor';document.body.append(status);
 let nearest=null,visibleCount=0,enabled=false,lastSent=null;
 status.onclick=()=>{if(enabled&&nearest?.alive&&nearest.mesh.visible)onViewVisitor(nearest);};
 const ring=new T.Mesh(new T.RingGeometry(.7,.75,64),new T.MeshBasicMaterial({color:'#cdebd9',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));
 ring.visible=false;ring.rotation.x=-Math.PI/2;group.add(ring);let pulseAge=10;
 const visit=globalThis.crypto?.randomUUID?.()||'';
 let pendingOpening=false,receivedOpening=null;
 const pointer=matchMedia('(pointer:coarse)');
 const pulseLabel=()=>pointer.matches?'Send a pulse':'Send a pulse · P';
 function sendPulse(){if(!enabled||cooldown>0||document.hidden)return;pulse=true;cooldown=6;pulseAge=0;button.textContent='Light sent';}
 button.onclick=sendPulse;addEventListener('keydown',e=>{if(e.key.toLowerCase()==='p'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable)sendPulse();});

 function accept(snapshot,time){
  let p=peers.get(snapshot.id);const first=!p;
  if(first){
   const mesh=new T.Mesh(new T.SphereGeometry(.65,24,16),new T.MeshPhysicalMaterial({color:'#d8e5df',emissive:'#b5d8c8',emissiveIntensity:.8,transparent:true,opacity:0,roughness:.22,metalness:.1}));
   mesh.position.set(snapshot.x,snapshot.y+1.45,snapshot.z);group.add(mesh);
   p={mesh,queue:[],pulse:0,pigments:0,solid:false};peers.set(snapshot.id,p);
  }
  p.alive=true;p.lastSeen=time;
  receiveTrail(p,snapshot,snapshot.tick||Math.round(time),first);
  p.speaking=typeof snapshot.speech==='string';
  speech?.setVisitorSpeech(p,snapshot.speech??null);
  const mask=snapshot.pigments||0;
  if(mask!==p.pigments){
   const tint=p.mesh.material.color;
   if(mask){tint.setRGB(0,0,0);let n=0;for(let i=0;i<4;i++)if(mask&(1<<i)){tint.add(pigmentColors[i]);n++;}tint.multiplyScalar(1/n);}
   else tint.set('#d8e5df');
   p.pigments=mask;
  }
  p.mesh.material.emissiveIntensity=snapshot.pulse>p.pulse?1.65:.8;p.pulse=snapshot.pulse||0;
 }

 function update(dt,player,pigments,active,entered){
  const now=performance.now(),tick=Math.round(performance.timeOrigin+now);
  if(active!==enabled){trail.length=0;lastSample=-Infinity;}
  enabled=active;group.visible=active;
  if(button.hidden===active)button.hidden=!active;
  cooldown=Math.max(0,cooldown-dt);if(button.disabled!==(cooldown>0))button.disabled=cooldown>0;
  const label=cooldown>0?'Pulse ready in '+Math.ceil(cooldown)+'s':pulseLabel();if(button.textContent!==label)button.textContent=label;
  pulseAge+=dt;const opacity=Math.max(0,.35-pulseAge*.18);ring.visible=opacity>0;
  if(ring.visible){ring.position.set(player.x,player.height+.08,player.z);ring.scale.setScalar(1+pulseAge*3);ring.material.opacity=opacity;}
  if(active&&now-lastSample>=trailSpacing){recordPoint(trail,tick,player);lastSample=now;}
  let count=0,closest=Infinity,remoteSpeaking=false;nearest=null;
  for(const [id,p] of peers){
   if(now-p.lastSeen>staleAfter)p.alive=false;
   p.mesh.visible=active;
   advancePeer(p,dt,target);
   p.mesh.material.opacity=T.MathUtils.damp(p.mesh.material.opacity,p.alive?.84:0,3,dt);
   if(!p.alive){
    speech?.setVisitorSpeech(p,null);
    if(p.mesh.material.opacity<.01){group.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();peers.delete(id);}
    continue;
   }
   if(!active)continue;
   const pos=p.mesh.position,d=(pos.x-player.x)**2+(pos.z-player.z)**2+(pos.y-player.height-1.45)**2;
   // Visitors can spawn together. Both must be able to leave that spot.
   p.solid=d>1.38**2;
   if(p.speaking)remoteSpeaking=true;
   count++;if(d<closest){closest=d;nearest=p;}
  }
  if(count!==visibleCount){visibleCount=count;status.hidden=!count;status.textContent=count?count+' nearby visitor'+(count===1?'':'s')+' · View':'';}
  const idleAlone=lastSent&&peers.size===0&&!pulse&&lastSent.x===player.x&&lastSent.y===player.height&&lastSent.z===player.z&&lastSent.pigments===pigments;
  const message=active?(speech?.publicSpeech()??null):null;
  const talking=active&&(remoteSpeaking||message!==null||lastSent?.speech!=null);
  const interval=talking?950:(!active||idleAlone)&&!pendingOpening?4000:1200;
  if(!entered||document.hidden||busy||now<retryAfter||now-lastAttempt<interval||location.protocol!=='https:')return;
  lastAttempt=now;busy=true;const gesture=pulse;pulse=false;
  lastSent={x:player.x,y:player.height,z:player.z,pigments,speech:message};
  if(active)recordPoint(trail,tick,player);
  const packet={...lastSent,zone:active?'hall':'secret',visit,opened:pendingOpening,pulse:gesture,tick,trail:active?trail:[]};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
  fetch('api/presence.php',{signal:controller.signal,method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(packet)})
   .then(r=>{if(!r.ok)throw Error('Presence unavailable');return r.json();})
   .then(data=>{
    if(data.announced)pendingOpening=false;
    const opening=data.opening||(data.shared?'initial':null);
    if(opening&&opening!==receivedOpening){receivedOpening=opening;onSharedOpening();}
    const time=performance.now(),seen=new Set();
    for(const snapshot of (enabled&&active?data.peers:[])||[]){seen.add(snapshot.id);accept(snapshot,time);}
    for(const [id,p] of peers)if(!seen.has(id)&&(!enabled||time-p.lastSeen>=2400))p.alive=false;
   }).catch(()=>{retryAfter=performance.now()+1500;})
   .finally(()=>{clearTimeout(timeout);busy=false;});
 }
 return {announceOpening(){pendingOpening=true;},sendPulse,get bodies(){return [...peers.values()].filter(p=>p.alive&&p.mesh.visible&&p.solid).map(p=>({owner:p,x:p.mesh.position.x,z:p.mesh.position.z,y:p.mesh.position.y,radius:.65}));},update};
}
