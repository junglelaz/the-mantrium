export const TEMPLE_SITES=[
 {name:'Creation',sx:603,sy:87,color:'#d9a751',pigment:'amber',heading:'Where thought becomes form.',theme:'Projects and original ventures',copy:'Explore the meeting of design, engineering and imagination. Selected work will live here.'},
 {name:'Knowledge',sx:775,sy:317,color:'#728fdf',pigment:'blue',heading:'Look beyond the finished form.',theme:'Case studies',copy:'Discover the questions, decisions and craft behind the work. Detailed case studies will live here.'},
 {name:'Intelligence',sx:603,sy:545,color:'#58c9b1',pigment:'jade',heading:'Human vision. Intelligent systems.',theme:'Expertise',copy:'Design, development and intelligence working together. Explore the capabilities that bring an idea to life.'},
 {name:'Origin',sx:431,sy:317,color:'#b889d6',pigment:'violet',heading:'Return to the intention.',theme:'The studio',copy:'Mantrium is founded by Laszlo and Narayana: a place for thoughtful technology, human craft and meaningful work.'}
].map((site,index)=>({...site,index,x:(site.sx-603)*.14,z:(site.sy-317)*.14}));
// Symmetric threshold inside the four open colonnades; reachable from each side of the plinth.
export function templeAt(x,z,height=.7){return TEMPLE_SITES.findIndex(t=>{const dx=x-t.x,dz=z-t.z,u=(dx-dz)/Math.SQRT2,v=(dx+dz)/Math.SQRT2;return Math.max(Math.abs(u),Math.abs(v))<1.5&&height>(Math.abs(t.x)>20?-1.5:0)})}
export function createJourney(){let active=-1;const completed=new Set();return {completed,get active(){return active},update(next){const exited=active!==next&&active>=0&&!completed.has(active)?active:-1;if(exited>=0)completed.add(exited);const entered=next!==active?next:-1;active=next;return {entered,exited}}}}
