import * as T from 'three';
export function createQuickNav(camera,sites,lights,onSelect,onToggle,orb,interiorSite=()=>null){
 const button=document.querySelector('#map'),layer=document.createElement('div');layer.id='quick-nav';layer.hidden=true;layer.setAttribute('aria-label','Temple destinations');document.body.append(layer);
 const orbTarget=document.createElement('button');orbTarget.className='menu-orb-target';orbTarget.setAttribute('aria-label','Close menu and return to your orb');orbTarget.onclick=()=>toggle(false);layer.append(orbTarget);
 const target=new T.Vector3(),overview=camera.clone(),orbPoint=new T.Vector3(),projectedSite=new T.Vector3();
 let open=false,blend=0,blendVelocity=0,hover=-1;const buttons=sites.map((site,i)=>{const b=document.createElement('button');b.className='temple-destination';b.setAttribute('aria-label','Enter Temple of '+site.name);b.style.setProperty('--temple-colour',site.color);b.innerHTML='<span class="temple-target" aria-hidden="true"></span><span class="temple-title"><small>Temple of</small><strong>'+site.name+'</strong><span class="temple-page-title">('+({Creation:'Projects',Knowledge:'Case Studies',Origin:'About Us',Intelligence:'Tech Stack'}[site.name]||'')+')</span></span>';b.onclick=()=>{toggle(false);blend=0;blendVelocity=0;layer.hidden=true;onSelect(i)};b.onpointerenter=b.onfocus=()=>hover=i;b.onpointerleave=b.onblur=()=>hover=-1;layer.append(b);return b;});
 const titles=buttons.map(b=>b.querySelector('.temple-title'));
 const offsets=new Float64Array(titles.length);
 function toggle(value=!open){open=value;layer.inert=!open;layer.hidden=false;button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close temple menu':'Open temple menu');document.body.classList.toggle('quick-nav-open',open);onToggle(open);if(!open)hover=-1;}
 button.onclick=event=>{toggle();if(open&&event.detail===0)buttons[0]?.focus();};addEventListener('keydown',e=>{if(e.key==='Escape'&&open){toggle(false);button.focus();}});
 function update(dt,reduced){if(reduced){blend=open?1:0;blendVelocity=0;}else{const goal=open?1:0,omega=interiorSite()?1.8:3.5,offset=blend-goal,c=blendVelocity+omega*offset,decay=Math.exp(-omega*dt);blend=goal+(offset+c*dt)*decay;blendVelocity=(blendVelocity-omega*c*dt)*decay;}if(!open&&blend<.002){blend=0;blendVelocity=0;if(!layer.hidden)layer.hidden=true;}for(let i=0;i<lights.length;i++)lights[i].intensity=T.MathUtils.damp(lights[i].intensity,open&&hover===i?150:35,7,dt);if(!blend)return false;
 target.set(0,(innerWidth<=650?180:145)/Math.min(1,camera.aspect),.01);overview.copy(camera);overview.position.copy(target);overview.lookAt(0,0,0);const site=interiorSite();
 if(site){camera.position.set(site.x,18,site.z+.01);camera.lookAt(site.x,0,site.z);}
 const ascent=site?T.MathUtils.smoothstep(blend,.62,1):blend;
 camera.position.lerp(target,ascent);camera.quaternion.slerp(overview.quaternion,ascent);camera.updateMatrixWorld();
 orbPoint.copy(orb.position).project(camera);orbTarget.style.left=(orbPoint.x*.5+.5)*innerWidth+'px';orbTarget.style.top=(-orbPoint.y*.5+.5)*innerHeight+'px';orbTarget.hidden=!open||blend<.8||!orb.visible||orbPoint.z>1;orbTarget.style.pointerEvents=orbTarget.hidden?'none':'auto';
 buttons.forEach((b,i)=>{const site=sites[i],p=projectedSite.set(site.x,3,site.z).project(camera);b.style.left=(p.x*.5+.5)*innerWidth+'px';b.style.top=(-p.y*.5+.5)*innerHeight+'px';b.style.opacity=String(T.MathUtils.smoothstep(blend,.55,.96));b.style.setProperty('--reveal',String((1-blend)*16)+'px');b.style.pointerEvents=open&&blend>.8?'auto':'none';b.classList.toggle('highlighted',hover===i);b.dataset.side=Math.abs(site.x)>20?(site.x<0?'left':'right'):(site.z<0?'top':'bottom');titles[i].style.translate='0px 0px';});
 if(innerWidth<=650){
  const width=innerWidth;
  titles.forEach((title,i)=>{const box=title.getBoundingClientRect();offsets[i]=Math.max(10-box.left,Math.min(0,width-10-box.right));});
  titles.forEach((title,i)=>{if(offsets[i])title.style.translate=offsets[i]+'px 0px';});
 }
 return true;
 }
 return {toggle,update,get open(){return open},get active(){return blend>0},get blend(){return blend}};
}
