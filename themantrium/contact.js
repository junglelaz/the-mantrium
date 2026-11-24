const panel=document.querySelector('#panel'), content=document.querySelector('#panel-content');
const trigger=document.querySelector('#contact-toggle');
trigger.addEventListener('click',()=>{
 window.dispatchEvent(new Event('blur'));
 panel.classList.remove('contact-leaving');
 panel.classList.add('contact-panel');
 content.innerHTML=`<div class="eyebrow">LET’S CREATE SOMETHING EXTRAORDINARY</div><h2 id="contact-heading">Begin a conversation.</h2><form id="contact-form"><label>Your name<input name="name" autocomplete="name" maxlength="100" required></label><label>Email address<input name="email" type="email" autocomplete="email" maxlength="254" required></label><label>What do you have in mind? <span>(We can build <em>almost</em> anything.)</span><textarea name="message" rows="4" maxlength="5000" required></textarea></label><label class="contact-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label class="contact-budget"><input type="checkbox" name="budget" value="confirmed" required><span class="budget-switch" aria-hidden="true"></span><span>Yes, I have a budget of at least $25,000 USD.</span></label><button class="primary" type="submit">Send your message</button><p class="contact-status" role="status" aria-live="polite"></p></form><div class="contact-direct">Prefer to email directly? <button type="button" id="contact-email">Reveal email address</button></div>`;
 panel.setAttribute('aria-labelledby','contact-heading');panel.showModal();
 document.querySelector('#contact-email').onclick=e=>{
 const address=String.fromCharCode(...[97,115,99,101,110,100,64,109,97,110,116,114,105,117,109,46,105,111]);
 const link=document.createElement('a');link.href='mailto:'+address;link.textContent=address;link.className='contact-email-reveal';e.currentTarget.replaceWith(link);link.focus();
 };
 const form=document.querySelector('#contact-form'),status=form.querySelector('.contact-status');
 form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Sending your message…';
 try{const response=await fetch('api/contact.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to send right now. Please use the email link below.');status.textContent='Thank you. Your message has been sent.';form.reset();}
 catch(error){status.textContent=error.message.includes('JSON')?'Unable to send right now. Please use the email link below.':error.message;}finally{button.disabled=false;}};
});
let closing=false;
function closeContact(){
 if(closing||!panel.open)return;
 closing=true;panel.classList.add('contact-leaving');
 // Keep the modal and its backdrop present until the exit has finished.
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?150:440;
 setTimeout(()=>{panel.close();closing=false;},duration);
}
document.querySelector('#close').addEventListener('click',e=>{
 if(!panel.classList.contains('contact-panel'))return;
 e.preventDefault();e.stopImmediatePropagation();closeContact();
},true);
panel.addEventListener('cancel',e=>{if(panel.classList.contains('contact-panel')){e.preventDefault();closeContact();}});
panel.addEventListener('close',()=>{closing=false;panel.classList.remove('contact-panel','contact-leaving');panel.removeAttribute('aria-labelledby');});
for(const type of ['keydown','keyup','wheel'])panel.addEventListener(type,e=>{if(panel.classList.contains('contact-panel'))e.stopPropagation();});
