// Shared accessible mouse/touch control for every local speech bubble.
export function addBubbleClose(bubble,onClose,label){
 const button=document.createElement('button');
 button.type='button';button.className='speech-close';button.setAttribute('aria-label',label);
 button.innerHTML='<span aria-hidden="true">×</span>';
 button.addEventListener('pointerdown',event=>event.stopPropagation());
 button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();onClose();});
 bubble.append(button);return button;
}
