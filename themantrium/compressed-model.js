// Lossless transport compression keeps every vertex and embedded texture intact.
export function loadCompressedModel(loader,packed,original,onLoad,onError){
 if(typeof DecompressionStream==='undefined'){loader.load(original,onLoad,undefined,onError);return;}
 const manager=loader.manager;manager.itemStart(packed);
 fetch(packed).then(response=>{if(!response.ok)throw new Error('Compressed model unavailable');return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();})
 .then(buffer=>new Promise((resolve,reject)=>loader.parse(buffer,'',resolve,reject)))
 .then(onLoad).catch(()=>new Promise(resolve=>loader.load(original,gltf=>{onLoad(gltf);resolve();},undefined,error=>{onError?.(error);resolve();})))
 .finally(()=>manager.itemEnd(packed));
}
