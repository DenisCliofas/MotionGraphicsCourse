const tabs=[...document.querySelectorAll('[data-lesson]')];
document.querySelectorAll('[data-preview]').forEach(button=>{const video=button.previousElementSibling;button.addEventListener('click',async()=>{if(video.paused){try{await video.play();}catch{button.textContent='Use the video controls to play';}}else video.pause();});video.addEventListener('play',()=>button.textContent='Pause preview Ⅱ');video.addEventListener('pause',()=>button.textContent='Play preview ▶');});
function selectLesson(id,updateHash=false){
 const chosen=tabs.find(b=>b.dataset.lesson===id);if(!chosen)return;
 tabs.forEach(b=>{const active=b===chosen;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;const panel=document.getElementById(b.getAttribute('aria-controls'));panel.hidden=!active;if(!active){panel.querySelector('video')?.pause();const tutorial=panel.querySelector('.tutorial-player');if(tutorial)tutorial.open=false;}});
 if(updateHash)history.replaceState(null,'','#'+id);
}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>selectLesson(b.dataset.lesson,true));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();tabs[n].focus();selectLesson(tabs[n].dataset.lesson,true);}});});
function fromHash(){const id=location.hash.slice(1);if(tabs.some(b=>b.dataset.lesson===id)){selectLesson(id);document.querySelector('#toolkit').scrollIntoView();}}
fromHash();addEventListener('hashchange',fromHash);
const storageKey='vtech-dynamic-machines-class-v1',form=document.querySelector('#machine-plan'),checks=[...document.querySelectorAll('[data-check]')],status=document.querySelector('#plan-status');
function readState(){try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}}
const previous=readState();for(const el of form.elements)if(el.name)el.value=previous.plan?.[el.name]||'';checks.forEach((c,i)=>c.checked=Boolean(previous.checks?.[i]));
function values(){return Object.fromEntries([...form.elements].filter(e=>e.name).map(e=>[e.name,e.value]));}
function updateCount(){document.querySelector('#check-status').textContent=`${checks.filter(c=>c.checked).length} of ${checks.length} checked`;}
function save(){try{localStorage.setItem(storageKey,JSON.stringify({plan:values(),checks:checks.map(c=>c.checked)}));status.textContent='Saved in this browser.';}catch{status.textContent='Browser storage is unavailable. Download your plan to keep it.';}updateCount();}
form.addEventListener('input',save);form.addEventListener('submit',e=>e.preventDefault());checks.forEach(c=>c.addEventListener('change',save));updateCount();
document.querySelector('#export-plan').addEventListener('click',()=>{const p=values(),text=`DYNAMIC MACHINES — CLASS PLAN\n\nTitle: ${p.title||'Untitled'}\n\n1. RECEIVE\n${p.receive||''}\n\n2. MAIN EVENT\n${p.event||''}\n\n3. RELEASE\n${p.release||''}\n\nTechniques: ${p.techniques||''}\n\nTemplate: 30 fps; frames 0–449; entry 113; exit 335–340.\nClass deadline and upload location: confirm with instructor.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='my-machine-plan.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Plan downloaded.';});
function progress(){const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('#reading-progress').style.width=`${max?scrollY/max*100:0}%`;let current='brief';for(const id of ['brief','toolkit','lab'])if(document.getElementById(id).getBoundingClientRect().top<180)current=id;document.querySelectorAll('.topnav a').forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
addEventListener('scroll',progress,{passive:true});addEventListener('resize',progress);progress();

// Closing a tutorial also stops its embedded playback.
document.querySelectorAll('.tutorial-player').forEach(details=>details.addEventListener('toggle',()=>{if(!details.open){const frame=details.querySelector('iframe');frame.src=frame.src;}}));
