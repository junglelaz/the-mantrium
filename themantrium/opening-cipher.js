import {updateOpeningGlass} from './opening-glass.js?v=spacing237';
// Resolve each line in place, preserving the final glass lettering and layout.
export function revealOpeningHeading(){
 const heading=document.querySelector('#intro h1');
 if(!heading||document.body.classList.contains('exploring')||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const ancient=[...'𓂀𓆣𓋹𓇳𓊖ᚠᚢᚦᚨᚱᚷᚹᛉᛟΔΘΛΞΠΣΦΨΩאבגדהוזחטअआइउऋकगनम'];
 const digital='{}[]<>/\\#@01=+*_:;|%&';
 const first=document.createElement('span');first.className='cipher-original';first.textContent=heading.firstChild.textContent;heading.firstChild.replaceWith(first);
 const second=heading.querySelector('em'),lines=[first,second];
 heading.setAttribute('aria-label','Ancient wisdom. Future systems.');
 const layers=lines.map(line=>{
  const wrap=heading;line.classList.add('cipher-original');const bounds=line.getBoundingClientRect(),parent=heading.getBoundingClientRect();
  const overlay=document.createElement('span');overlay.className='cipher-symbols';overlay.setAttribute('aria-hidden','true');overlay.classList.toggle('cipher-digital',line===second);Object.assign(overlay.style,{left:(bounds.left-parent.left)+'px',top:(bounds.top-parent.top)+'px',width:bounds.width+'px',height:bounds.height+'px'});wrap.append(overlay);
  const letters=[...line.textContent];const range=document.createRange();
  letters.forEach((letter,i)=>{const cell=document.createElement('span');range.setStart(line.firstChild,i);range.setEnd(line.firstChild,i+1);cell.style.width=range.getBoundingClientRect().width+'px';cell.textContent=letter===' '?' ':ancient[i%ancient.length];overlay.append(cell);});
  return {line,wrap,overlay,letters,cells:[...overlay.children]};
 });
 heading.classList.add('cipher-active');layers[1].overlay.style.opacity='0';
 second.style.opacity='1';second.style.clipPath='inset(0 100% 0 0)';updateOpeningGlass();
 let start=performance.now(),last=-1,frame;
 function finish(){cancelAnimationFrame(frame);for(const item of layers){item.overlay.remove();item.line.classList.remove('cipher-original');}second.style.clipPath='inset(0 0 0 0)';second.style.opacity='1';heading.classList.remove('cipher-active');updateOpeningGlass();}
 function tick(now){
  if(document.body.classList.contains('exploring')){finish();return;}
  const elapsed=now-start,stage=elapsed<1750?0:1,progress=Math.min(1,(elapsed-stage*1750)/1600),item=layers[stage];
  if(stage===1){layers[0].line.style.opacity='1';layers[0].overlay.style.opacity='0';item.overlay.style.opacity='1';}
  const beat=Math.floor(elapsed/85);
  if(beat!==last){last=beat;const alphabet=stage?digital:ancient;item.cells.forEach((cell,i)=>{const settled=progress>(.22+i/item.letters.length*.7);cell.textContent=item.letters[i]===' '?' ':settled?(stage?' ':item.letters[i]):alphabet[Math.floor(Math.random()*alphabet.length)];cell.style.opacity=settled?'1':String(.55+Math.random()*.45);cell.style.transform=settled?'none':`translateY(${(Math.random()-.5)*2}px)`;});}
  if(stage===1){const count=item.letters.filter((_,i)=>progress>(.22+i/item.letters.length*.7)).length;const total=item.cells.reduce((sum,cell)=>sum+parseFloat(cell.style.width),0),visible=item.cells.slice(0,count).reduce((sum,cell)=>sum+parseFloat(cell.style.width),0);second.style.clipPath=`inset(0 ${Math.max(0,100-visible/total*100)}% 0 0)`;}
  if(elapsed>=3350){finish();return;}frame=requestAnimationFrame(tick);
 }
 frame=requestAnimationFrame(tick);
}
