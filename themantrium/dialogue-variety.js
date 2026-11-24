const memory=new Map();
function read(key){if(memory.has(key))return memory.get(key);let items=[];try{items=JSON.parse(localStorage.getItem('mantrium-dialogue-'+key)||'[]');if(!Array.isArray(items))items=[];}catch{}memory.set(key,items);return items;}
export function recentDialogue(key){return read(key).slice(-5);}
export function rememberDialogue(key,text){const items=[...read(key).filter(x=>x!==text),text].slice(-30);memory.set(key,items);try{localStorage.setItem('mantrium-dialogue-'+key,JSON.stringify(items));}catch{}}
export function variedDialogue(key,options){const seen=read(key);let available=options.filter(x=>!seen.includes(x));if(!available.length){available=options.filter(x=>x!==seen.at(-1));memory.set(key,[]);}const chosen=available[Math.floor(Math.random()*available.length)]||options[0];rememberDialogue(key,chosen);return chosen;}
