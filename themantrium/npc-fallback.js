import {variedDialogue} from './dialogue-variety.js?v=spacing237';
import {expandedReplies} from './npc-fallback-expanded.js?v=spacing237';
// Curated, rotating offline voices. No fabricated live facts or repeated user text.
const library={
 greeting:[
 ['Welcome. Bring an unfinished idea; those are often the most interesting.','Hello, traveller. We can explore a thought or simply find your next doorway.','Good to meet you. What would you like to make possible?'],
 ['Hello. The same place can feel different when you arrive with a new question.','Welcome. There is no correct order in which to discover this world.','Take your time. You might notice something on the way that matters more than the destination.'],
 ['Welcome, little light. There is room here for whatever you are still becoming.','You have arrived. Let the next step be smaller than the whole journey.','Every arrival carries a question, even before it finds its words.']
 ],
 idea:[
 ['Start with one person and one thing you could make easier for them.','Build the smallest version that lets someone respond to your idea. Their reaction will teach you more than polishing it alone.','Give your idea a clear purpose before giving it more features.'],
 ['Which assumption is doing the most work in your idea? That may be the best place to begin testing.','Look at how people solve this already. The awkward parts are useful clues.','Try describing the outcome without naming the technology. What remains?'],
 ['An idea does not need to arrive fully formed to deserve your attention.','Let intention choose the direction; let making reveal the path.','A possibility becomes real through small acts of care, repeated.']
 ],
 design:[
 ['Good design makes the next useful action feel clear. Begin there.','Try removing one element. If the experience becomes clearer, you have learned something.','A beautiful interface should also make someone feel capable.'],
 ['Notice where your attention goes first, and whether that is where it needs to go.','Consistency creates trust; a deliberate exception can create meaning.','Ask what the design helps people understand before asking what it makes them admire.'],
 ['Form is a way of making an intention visible.','Restraint leaves space for another person to enter the work.','Beauty can welcome someone in; clarity helps them find their way.']
 ],
 technology:[
 ['Choose technology around the job it needs to do, and the people who will maintain it.','A useful prototype can answer a question before a large system commits to an answer.','Intelligence is most helpful when people can understand its limits and remain in control.'],
 ['What should the system decide, and what should remain a human choice?','Complexity often moves rather than disappears. Notice who is being asked to carry it.','A reliable simple system can be more impressive than a fragile elaborate one.'],
 ['A tool can extend a hand; it should not replace the reason the hand reaches out.','Let the system serve the intention, rather than becoming the intention.','There is wisdom in knowing which things need no automation.']
 ],
 studio:[
 ['Mantrium brings design, engineering and imagination together. Origin introduces the studio; Intelligence explores its capabilities.','For examples of what Mantrium makes, visit Creation. Knowledge offers the thinking behind the work.','Origin is the place to learn about the studio’s approach. I can help you choose what to explore first.'],
 ['The world itself is one expression of the studio’s approach: identity translated into an experience.','Creation shows projects; Knowledge looks behind their finished form. Those are two useful ways to understand the work.','For details about the people and philosophy behind Mantrium, explore Origin.'],
 ['Here, intention and craft are asked to meet. Origin holds the studio’s story.','A studio can be understood through what it makes, and through the care behind each decision.','Mantrium is a place for design, technology, intuition and intention to speak to one another.']
 ],
 pricing:[
 ['A useful project brief starts with the goal, audience, scope and timing. The studio can then discuss what is involved.','I do not have confirmed pricing or availability. The studio would need to understand your project before quoting.','Describe the change you want to create, rather than only a list of features. That makes a stronger starting brief.'],
 ['Scope and constraints shape a project as much as its ambition. Which parts are essential?','I cannot confirm a budget or delivery date. Those need a conversation with the studio.','A clear definition of success makes both estimates and creative decisions more useful.'],
 ['Give the ambition a shape before asking how far the journey reaches.','I cannot promise a price or a timeline. I can help you find the intention you want the studio to understand.','What must remain true when the project is finished? That is worth bringing into the first conversation.']
 ],
 stuck:[
 ['Make the next task smaller. Choose something you can try without needing the whole answer.','You could sketch three rough alternatives, then ask someone what each one makes clear.','Take a short pause, then name the specific decision that is blocking you.'],
 ['Is the obstacle missing information, too many options, or uncertainty about the goal? Each needs a different response.','Try changing the question. Sometimes the answer is blocked because the frame is too narrow.','Look for one thing you already know. It can give the next experiment a starting point.'],
 ['Being uncertain is not the same as being lost.','You may rest without abandoning the journey.','A path can begin with the admission that you do not yet know.']
 ],
 meaning:[
 ['Meaning often becomes clearer when an idea helps someone in a concrete way.','Choose one principle you want your work to express, then make a decision that honours it.','You do not need one grand purpose before you can do something worthwhile.'],
 ['Which part of this question belongs to what others expect, and which part feels like your own?','Notice what keeps your attention when there is no reward for paying attention.','Two people can find different meanings in the same thing. That difference can be useful.'],
 ['I offer reflections, not certainty about fate or the unseen. What feels meaningful to you is a place to begin.','Intention is not a prediction. It is a direction you can choose again.','Perhaps meaning is sometimes something we practise, rather than something we discover fully formed.']
 ],
 identity:[
 ['I’m Sage, a fictional AI guide. I can help you explore this world and think through creative questions.','I’m a guide within Mantrium, not a person visiting the site. My role is to offer practical encouragement.','Think of me as a companion for finding a useful next step.'],
 ['I’m Observer, a fictional AI guide. I look for details and alternative perspectives.','I’m part of this experience, rather than another human visitor. I can help you notice and question.','My name is Observer. Different viewpoints are my particular interest.'],
 ['I’m Oracle, a fictional AI guide, not a source of supernatural knowledge. I offer questions and reflections.','There is no prophecy behind my voice. I’m a guide made for this world.','I’m the Oracle of Origins. My role is to invite reflection, not tell you who you must become.']
 ],
 thanks:[
 ['You’re welcome. Try the next small step and see what it teaches you.','Glad to help. There is plenty more to explore at your own pace.','You’re welcome. Keep the part that is useful to you.'],
 ['You’re welcome. A second look is always available.','Thank you for the conversation. Notice what stays with you.','Glad to share a perspective. Yours may lead somewhere different.'],
 ['Carry what serves you, and leave room for more.','May the next step feel a little clearer.','Thank you for bringing your curiosity here.']
 ],
 farewell:[
 ['Until next time. Leave your idea somewhere you can find it again.','Take care. You can return whenever you want to explore further.','Goodbye for now. A small beginning is enough.'],
 ['See you again. A familiar place may reveal a new detail on your return.','Until we meet again. Keep noticing.','Thank you for spending a little time in this world.'],
 ['Every return begins somewhere else. Go gently.','May you carry a little of this stillness with you.','The doorway remains. Until next time.']
 ],
 general:[
 ['Would you like a practical next step, a creative perspective, or help finding your way around?','I can help with ideas, design, technology and exploring the temples. Which part interests you?','Try giving me a little more context about what you want to make or understand.'],
 ['What detail matters most in what you’re asking?','There may be more than one useful way to look at that. What would you like to understand better?','I may need a more specific question. Is this about your own idea or something you noticed here?'],
 ['What is the question beneath the question?','You do not need perfect words. Tell me which part you want to explore.','I do not want to pretend certainty. Could you tell me a little more?']
 ]};
Object.assign(library,expandedReplies);
const extraPatterns=[["inspiration", "inspir\\w*|reference\\w*|moodboard"], ["learning", "learn\\w*|study|studying|practi[cs]e|skill\\w*"], ["collaboration", "collaborat\\w*|partner\\w*|teamwork|working together"], ["feedback", "feedback|critique|criticis\\w*|review"], ["focus", "focus|distract\\w*|priorit\\w*|productiv\\w*"], ["failure", "fail\\w*|mistake\\w*|unsuccessful|wrong"], ["change", "change|changing|adapt\\w*|transform\\w*"], ["craft", "craft\\w*|detail\\w*|polish|quality|finish\\w*"], ["curiosity", "curio\\w*|wonder|question\\w*"], ["story", "story|stories|narrative|storytelling"], ["nature", "nature|tree\\w*|plant\\w*|leaf|leaves|landscape\\w*|garden|foliage"], ["music", "music|sound|rhythm|melody|listen\\w*"], ["calm", "calm|peace|quiet|rest|relax\\w*|slow down"], ["originality", "original\\w*|unique|novel\\w*|copy|different"], ["constraints", "constraint\\w*|limit\\w*|resource\\w*|scope"], ["future", "future|tomorrow|prediction\\w*|long term"]].map(([topic,words])=>[topic,new RegExp('\\b('+words+')\\b','i')]);
const patterns=[['identity',/\b(who are you|are you (real|human|ai)|your name|chatgpt|bot)\b/i],['pricing',/\b(price|pricing|cost|budget|quote|hire|deadline|availability)\b/i],['studio',/\b(mantrium|studio|founder|team|service|portfolio|case stud)\w*/i],['technology',/\b(ai|code|coding|technology|tech|engineer|develop|automati\w*)\b/i],['design',/\b(design|ux|ui|brand|interface|colour|color|beautiful)\b/i],['idea',/\b(idea|project|build|create|making|prototype)\b/i],['stuck',/\b(stuck|overwhelm\w*|confus\w*|uncertain|afraid|worr\w*)\b/i],['meaning',/\b(meaning|purpose|spirit\w*|wisdom|intention|life|destiny)\b/i],['thanks',/\b(thank\w*|appreciate)\b/i],['farewell',/\b(bye|goodbye|see you|farewell)\b/i],['greeting',/\b(hello|hi|hey|greetings)\b/i]];
export function createOfflineDialogue(){const counts=new Map(),lastTopics=new Map();return {reply(text,index,{visited=0,minutes=0,region=null,personalise=false}={}){
 if(index===3){if(/\b(who are you|your name|are you (real|human|ai))\b/i.test(text))return 'I am Guru, an AI-powered fictional guide in The Secret Sanctum. We can explore a reading, a question, or whatever is on your mind.';if(/\b(reading|birth|chart|jyotisha)\b/i.test(text))return 'We can explore a personal reading through our conversation. You can pause it at any time, or say “continue my reading” to return to your birth details.';index=2;}

 if(/\b(sanctum|secret|hidden chamber|fifth temple|5th temple)\b/i.test(text))return visited===4?'The Secret Sanctum is open. Return to the central crossing and guide your orb into the glowing circular opening.':'To reach The Secret Sanctum, visit all four temples. Then return to the centre, where a circular opening will reveal the way below.';
 let topic=patterns.slice(0,3).find(([,pattern])=>pattern.test(text))?.[0]||extraPatterns.find(([,pattern])=>pattern.test(text))?.[0]||patterns.slice(3).find(([,pattern])=>pattern.test(text))?.[0]||'general';
 if(/\b(where|move|walk|controls|navigate|lost|help|exit|temple|pedestal|map|pulse)\b/i.test(text)&&topic==='general'){
 const lines=visited===4?['All four colours are yours. Return to the centre and enter the glowing circular opening.','The central crossing has lowered. Its opening leads to the secret chamber.','The hidden chamber awaits beneath the centre. Follow the light there.']:['Use WASD or arrows to move, scroll to zoom, and M for the temple map. On mobile, drag to move and pinch to zoom.','Approach a pedestal inside a temple to open its story. Scroll beyond either end to return to the room.','Enter any temple from the Mantrium. Its exit doorway brings you back, carrying its colour.'];const key='nav'+index,n=counts.get(key)||0;counts.set(key,n+1);return variedDialogue('fallback-nav-'+index,lines);}
 if(/\b(yes|why|how so|tell me more|go on|continue)\b/i.test(text)&&topic==='general')topic=lastTopics.get(index)||'general';
 if(personalise&&region&&/\b(where am i|where.*from|location|home|country|region)\b/i.test(text))return ['Your approximate region is '+region+'. That estimate can be wrong; the place you call home is yours to describe.','The region estimate suggests '+region+', but it is only a rough clue, not a certainty about where you are.','Perhaps your journey reaches us from '+region+'. Places leave different traces on each of us. What does home mean to you?'][index];
 if(personalise&&minutes>5&&topic==='general'&&!counts.has('dwell'+index)){counts.set('dwell'+index,1);return ['You’ve spent a little time exploring. Is there an idea you’d like to take further?','You’ve given this place some attention. What caught yours?','You have lingered here a while. Sometimes a slower journey makes room for a different question.'][index];}
 lastTopics.set(index,topic);const key=topic+index,n=counts.get(key)||0;counts.set(key,n+1);return variedDialogue('fallback-'+topic+'-'+index,library[topic][index]);
 }};}
export const offlineReplyCount=Object.values(library).reduce((sum,voices)=>sum+voices.reduce((n,lines)=>n+lines.length,0),0);
