// One request for the nearby group; conversational history lives only in this tab.
export function createNpcDialogue({fetcher=fetch}={}){
 const history=[];let queue=Promise.resolve(),pending=0;
 return {ask(message,nearby,visited,context={}){
  if(pending>=2)return Promise.reject(new Error('Conversation busy'));
  pending++;
  const task=queue.then(async()=>{
   if(context.personalise===false)history.length=0;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
   try{
    const response=await fetcher('api/npc.php',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,nearby,visited:context.personalise===false?0:visited,context,history:context.personalise===false?[]:history.slice(-6)}),signal:controller.signal});
    if(!response.ok)throw new Error('Guides unavailable');
    const data=await response.json();
    if(!data.replies||nearby.some(name=>typeof data.replies[name]!=='string'))throw new Error('Invalid guide reply');
    history.push({role:'user',content:message},{role:'assistant',content:nearby.map(name=>name+': '+data.replies[name]).join('\n').slice(0,600)});history.splice(0,Math.max(0,history.length-6));
    return data.replies;
   }finally{clearTimeout(timer);}
  });
  queue=task.catch(()=>{});return task.finally(()=>pending--);
 }};
}
