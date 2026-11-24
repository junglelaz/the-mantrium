// Avoid replacing text nodes when frame-driven labels have not changed.
export function setText(element,value){if(element.textContent!==value)element.textContent=value;}
