

// Step-by-step examples retain space while changing images, avoiding anchor jumps.
document.querySelectorAll('.d2-stepper').forEach(figure=>{
 const steps=JSON.parse(figure.dataset.steps);let index=0;
 const image=figure.querySelector('img'),caption=figure.querySelector('figcaption'),count=figure.querySelector('output');
 const prev=figure.querySelector('[data-prev]'),next=figure.querySelector('[data-next]'),large=figure.querySelector('.d2-step-image');
 function show(i){index=(i+steps.length)%steps.length;image.src=`assets/day2/${steps[index][0]}.svg?v=rig-controls-v2`;image.alt=steps[index][1];caption.textContent=steps[index][1];count.textContent=`${index+1} / ${steps.length}`;prev.disabled=index===0;next.textContent=index===steps.length-1?'Start again ↻':'Next →';large.querySelector('span').textContent=index===steps.length-1?'Click to start again ↻':'Click for next step →';}
 prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));large.addEventListener('click',()=>show(index+1));show(0);
});

const sections=[...document.querySelectorAll('.d2-chapter[id]')];
function progress(){
 const max=document.documentElement.scrollHeight-innerHeight;
 document.querySelector('#reading-progress').style.width=`${max>0?scrollY/max*100:0}%`;
 let current='';for(const s of sections)if(s.getBoundingClientRect().top<180)current=s.id;
 document.querySelectorAll('.topnav a').forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
addEventListener('scroll',progress,{passive:true});addEventListener('resize',progress);progress();

