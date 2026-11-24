const lettering=document.querySelector('#intro h1 em');
export function updateOpeningGlass(){
 const style=getComputedStyle(lettering),size=parseFloat(style.fontSize),box=lettering.getBoundingClientRect();if(!box.width||!box.height)return;
 const text=lettering.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}"><text x="2" y="${size*.91}" font-family="Georgia,serif" font-style="italic" letter-spacing="${style.letterSpacing}" font-size="${size}" fill="white">${text}</text></svg>`;
 lettering.style.setProperty('--letter-mask',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}
new ResizeObserver(updateOpeningGlass).observe(lettering);document.fonts.ready.then(updateOpeningGlass);updateOpeningGlass();
