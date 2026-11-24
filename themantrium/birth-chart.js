import * as A from './vendor/astronomy.js';
export const angle=x=>((x%360)+360)%360;
const delta=(a,b)=>angle(b-a+180)-180;
export function localInstants(date,time,zone){
 const [y,m,d]=date.split('-').map(Number),[hh,mm]=time.split(':').map(Number),wall=Date.UTC(y,m-1,d,hh,mm);
 if(!Number.isFinite(wall)||new Date(wall).toISOString().slice(0,10)!==date||hh>23||mm>59)throw Error('Check the date and time.');
 const format=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const local=stamp=>{const p=Object.fromEntries(format.formatToParts(new Date(stamp)).map(v=>[v.type,v.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);};
 const offsets=new Set([-370,-180,-2,-1,0,1,2,180,370].map(days=>{const t=wall+days*86400000;return local(t)-t;}));
 return [...offsets].map(offset=>wall-offset).filter(t=>local(t)===wall).sort((a,b)=>a-b);
}
export function calculateBirthChart(stamp,lat,lon){
 if(!Number.isFinite(stamp)||stamp<Date.UTC(1900,0,1)||stamp>Date.now()||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Use a valid birth date from 1900 onwards and a listed birthplace.');
 const date=new Date(stamp),t=(stamp/86400000+2440587.5-2451545)/36525;
 const ayan=23.857092340656987+1.3968881881553707*t+.00030694937343626763*t*t-3.986271419308174e-7*t*t*t;
 const positions={},motion={};
 for(const name of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn']){
  const longitude=d=>A.Ecliptic(A.GeoVector(A.Body[name],d,true)).elon;
  positions[name]=angle(longitude(date)-ayan);
  motion[name]=delta(longitude(new Date(stamp-3600000)),longitude(new Date(stamp+3600000)))<0?'retrograde':'direct';
 }
 positions.Rahu=angle(125.04452-1934.136261*t+.0020708*t*t+t*t*t/450000-ayan);positions.Ketu=angle(positions.Rahu+180);
 const rad=Math.PI/180,theta=(A.SiderealTime(date)*15+lon)*rad,eps=(23.439291111-.013004167*t-.000000164*t*t+.000000504*t*t*t)*rad;
 const ascendant=Math.abs(lat)<66.5?angle(Math.atan2(-Math.cos(theta),Math.sin(theta)*Math.cos(eps)+Math.tan(lat*rad)*Math.sin(eps))/rad+180-ayan):null;
 return {positions,motion,ascendant,year:date.getUTCFullYear(),method:'lahiri-whole-sign-v1'};
}
