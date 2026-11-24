const button=document.querySelector('#enter');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let timer=0,running=false,lastStart=-Infinity;
const engaged=()=>button.matches(':hover,:focus-visible');
function schedule(){
 clearTimeout(timer);
 if(running||reduced.matches)return;
 const interval=engaged()?1650:6500;
 timer=setTimeout(start,Math.max(0,lastStart+interval-performance.now()));
}
function start(){
 if(reduced.matches)return;
 if(document.hidden||!button.getClientRects().length||getComputedStyle(button).visibility==='hidden'){timer=setTimeout(start,500);return;}
 running=true;lastStart=performance.now();button.classList.add('shine-running');
}
button.addEventListener('animationend',event=>{
 if(event.animationName!=='entrance-continuous-pass')return;
 button.classList.remove('shine-running');running=false;schedule();
});
for(const event of ['pointerenter','pointerleave','focus','blur'])button.addEventListener(event,schedule);
reduced.addEventListener('change',()=>{clearTimeout(timer);if(reduced.matches){button.classList.remove('shine-running');running=false;}else schedule();});
schedule();
