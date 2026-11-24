import * as T from 'three';
import {createCelestialAtmosphere} from './celestial-atmosphere.js?v=spacing237';
// The Mantrium's pearl horizon and quiet corner light, scaled to each room.
export function createInteriorAtmosphere(parent,{floorY=0,round=false,extraAnchors=[]}={}){
 const anchors=round?Array.from({length:4},(_,i)=>({x:Math.cos(i*Math.PI/2+Math.PI/4)*8.8,z:Math.sin(i*Math.PI/2+Math.PI/4)*8.8,y:floorY,width:.8,height:10})): [-10,10].flatMap(x=>[-10,10].map(z=>({x,z,y:floorY,width:.8,height:10})));
 const atmosphere=createCelestialAtmosphere(parent,[],{anchors:[...anchors,...extraAnchors]});
 const rim=new T.DirectionalLight('#e1dbfa',.65);rim.position.set(9,floorY+12,-10);rim.target.position.set(0,floorY,0);parent.add(rim,rim.target);
 const fill=new T.DirectionalLight('#fff0db',.6);fill.position.set(-10,floorY+14,8);fill.target.position.set(0,floorY,0);parent.add(fill,fill.target);
 return atmosphere;
}
