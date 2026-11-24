// Keep coarse place context in memory. Half-degree coordinates go only to our sunrise calculator, never to OpenAI.
export function createNpcContext(){
 const started=Date.now();let region=null,skyLocation=null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
 fetch('https://get.geojs.io/v1/ip/geo.json',{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{const clean=v=>typeof v==='string'?v.replace(/[^\p{L}\p{N} .,'’-]/gu,'').slice(0,80):'';region=[Number(data.accuracy||0)<=100?clean(data.city):'',clean(data.region),clean(data.country)].filter((v,i,a)=>v&&a.indexOf(v)===i).join(', ')||null;const lat=Number(data.latitude),lon=Number(data.longitude);if(data.latitude!=null&&data.longitude!=null&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180&&typeof data.timezone==='string')skyLocation={latitude:Math.round(lat*2)/2,longitude:Math.round(lon*2)/2,timezone:data.timezone.slice(0,64)};}).catch(()=>{}).finally(()=>clearTimeout(timer));
 return {get(){return {personalise:true,minutes:Math.min(180,Math.floor((Date.now()-started)/60000)),language:(navigator.language||'en').slice(0,24),region,skyLocation};},get revision(){return 0;}};
}
