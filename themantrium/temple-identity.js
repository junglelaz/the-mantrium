import * as T from 'three';
export function dressTemple(scene,index,materials){
 const themes=[{floor:'#d3c4a3',stone:'#ac9d7c',sky:'#303e40',ink:'#c8a76c'},{floor:'#b4c5cc',stone:'#829eac',sky:'#233945',ink:'#82b8d2'},{floor:'#647f7c',stone:'#79998f',sky:'#203b3d',ink:'#86d8c2'},{floor:'#beb4c1',stone:'#aa9daa',sky:'#343541',ink:'#c4a6cb'}];
 const t=themes[index];materials.floor.color.set(t.floor);materials.stone.color.set(t.stone);scene.background.set(t.sky);scene.fog.color.set(t.sky);
 // Floor decoration is deliberately limited to the two pedestal rings.
}
