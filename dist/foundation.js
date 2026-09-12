import {initRoughness} from './roughness.js?v=combined5';
import {initFoundationHero} from './foundation-hero.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),videos=[...document.querySelectorAll('video')],visible=new Set();let paused=reduced.matches;
const toggle=document.querySelector('#motion-toggle');
function sync(){toggle.textContent=paused?'Resume motion ▶':'Pause motion Ⅱ';toggle.setAttribute('aria-pressed',String(paused));videos.forEach(v=>{if(paused||!visible.has(v))v.pause();else if(!v.dataset.userPaused)v.play().catch(()=>{});});}
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{const v=e.target;if(e.isIntersecting){visible.add(v);if(!v.src){v.src=v.dataset.src;v.load();}}else visible.delete(v);});sync();},{threshold:.15});
videos.forEach(v=>{observer.observe(v);v.addEventListener('pause',()=>{if(!paused&&visible.has(v)&&!document.hidden)v.dataset.userPaused='1';});v.addEventListener('play',()=>delete v.dataset.userPaused);});
toggle.addEventListener('click',()=>{paused=!paused;sync();});reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});sync();
const sections=[...document.querySelectorAll('.foundation-lesson')],links=[...document.querySelectorAll('.topnav a')];
function reading(){let current=sections[0];for(const s of sections){if(s.getBoundingClientRect().top<innerHeight*.4)current=s;else break;}links.forEach(a=>{if(a.hash==='#'+current.dataset.group)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('#reading-progress').style.width=(max?scrollY/max*100:0)+'%';}
addEventListener('scroll',reading,{passive:true});addEventListener('resize',reading);reading();

initFoundationHero(()=>paused);

// Match anchor clearance to the actual one- or two-row header.
const header=document.querySelector('.site-header');
new ResizeObserver(()=>document.documentElement.style.setProperty('--foundation-header-offset',`${header.getBoundingClientRect().height+16}px`)).observe(header);

// Keep an explicit chapter jump aligned while first-load media and fonts settle.
let jumpTarget=null,alignmentFrame=0;
function alignJump(){
 if(!jumpTarget)return;
 const top=scrollY+jumpTarget.getBoundingClientRect().top-header.getBoundingClientRect().height-16;
 window.scrollTo({top:Math.max(0,top),behavior:'instant'});
}
function scheduleAlignment(){if(!jumpTarget||alignmentFrame)return;alignmentFrame=requestAnimationFrame(()=>{alignmentFrame=0;alignJump();});}
function releaseJump(){jumpTarget=null;}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const target=document.getElementById(link.hash.slice(1));if(!target)return;
 event.preventDefault();jumpTarget=target;history.pushState(null,'',link.hash);alignJump();
}));
// Stop tracking immediately when the reader takes control of scrolling.
addEventListener('wheel',releaseJump,{passive:true});addEventListener('touchstart',releaseJump,{passive:true});
addEventListener('pointerdown',releaseJump,{passive:true});
addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))releaseJump();});
const layoutObserver=new ResizeObserver(scheduleAlignment);
sections.forEach(section=>layoutObserver.observe(section));layoutObserver.observe(header);
document.fonts.ready.then(scheduleAlignment);
addEventListener('load',()=>{if(!jumpTarget&&location.hash)jumpTarget=document.getElementById(location.hash.slice(1));scheduleAlignment();},{once:true});
addEventListener('popstate',()=>{jumpTarget=location.hash?document.getElementById(location.hash.slice(1)):null;scheduleAlignment();});

// Procedural demonstrations advance one image at a time.
for(const number of [28,29,38,40,41,42,43,44]){
 const lesson=document.getElementById(`foundation-${number}`),grid=lesson?.querySelector('.foundation-media');
 if(!grid||grid.children.length<2)continue;
 const frames=[...grid.children];let step=0;
 grid.classList.add('step-sequence');
 const controls=document.createElement('div');controls.className='sequence-controls';
 const back=document.createElement('button');back.type='button';back.textContent='← Back';
 const status=document.createElement('span');status.setAttribute('aria-live','polite');
 const next=document.createElement('button');next.type='button';
 controls.append(back,status,next);grid.after(controls);
 const hint=document.createElement('p');hint.className='sequence-hint';hint.textContent='Click the image to continue.';grid.before(hint);
 function show(){frames.forEach((frame,i)=>{frame.hidden=i!==step;frame.querySelectorAll('video').forEach(v=>{if(i!==step){visible.delete(v);v.pause();}});});status.textContent=`Step ${step+1} of ${frames.length}`;back.disabled=step===0;next.textContent=step===frames.length-1?'Start again ↺':'Next →';frames[step].querySelector('button.sequence-image')?.setAttribute('aria-label',step===frames.length-1?'Start this demonstration again':`Show step ${step+2}`);}
 function advance(){step=(step+1)%frames.length;show();}
 frames.forEach(frame=>{const img=frame.querySelector('img');if(img){const button=document.createElement('button');button.type='button';button.className='sequence-image';img.replaceWith(button);button.append(img);button.addEventListener('click',advance);}else hint.textContent='Use Next to continue through the demonstration.';});
 back.addEventListener('click',()=>{step=Math.max(0,step-1);show();});next.addEventListener('click',advance);show();
}

initRoughness();
