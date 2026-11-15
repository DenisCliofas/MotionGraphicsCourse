import * as THREE from './assets/three.module.js';

// Step-by-step examples retain space while changing images, avoiding anchor jumps.
document.querySelectorAll('.d2-stepper').forEach(figure=>{
 const steps=JSON.parse(figure.dataset.steps);let index=0;
 const image=figure.querySelector('img'),caption=figure.querySelector('figcaption'),count=figure.querySelector('output');
 const prev=figure.querySelector('[data-prev]'),next=figure.querySelector('[data-next]'),large=figure.querySelector('.d2-step-image');
 function show(i){index=(i+steps.length)%steps.length;image.src=`assets/day2/${steps[index][0]}.png`;image.alt=steps[index][1];caption.textContent=steps[index][1];count.textContent=`${index+1} / ${steps.length}`;prev.disabled=index===0;next.textContent=index===steps.length-1?'Start again ↻':'Next →';large.querySelector('span').textContent=index===steps.length-1?'Click to start again ↻':'Click for next step →';}
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

let mode='bezier',phase=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true;
const host=document.querySelector('#interpolation-stage'),time=host.querySelector('input'),play=host.querySelector('[data-play]'),output=host.querySelector('output');
const descriptions={constant:['Hold, then jump.','Constant holds the previous value until the next key. Useful for blocking clear poses before refining the motion.'],linear:['Equal time. Equal distance.','Linear moves at constant speed between keys, then changes direction abruptly. The ball never slows near the apex.'],bezier:['Smooth is not always right.','Automatic Bézier handles ease into every key. This is soft at the top, but also slows down before impact. A bounce needs a sharper contact.']};
function height(t,type=mode){if(type==='constant')return t<.5?0:t<1?1:0;const p=t<.5?t*2:(1-t)*2;return type==='linear'?p:p*p*(3-2*p);}
const sx=t=>35+345*t,sy=v=>150-v*125;
function curvePath(fn){return Array.from({length:121},(_,i)=>`${i?'L':'M'}${sx(i/120)},${sy(fn(i/120))}`).join(' ');}
function updateCurve(){document.querySelector('#interpolation-curve .motion-line').setAttribute('d',curvePath(t=>height(t)));}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('#mode-title').textContent=descriptions[mode][0];document.querySelector('#mode-copy').textContent=descriptions[mode][1];updateCurve();}));
function playLabel(){play.textContent=playing?'Pause':'Play';play.setAttribute('aria-label',playing?'Pause interpolation preview':'Play interpolation preview');}
play.addEventListener('click',()=>{playing=!playing;playLabel();});time.addEventListener('input',()=>{playing=false;phase=(Number(time.value)-13)/24;playLabel();});playLabel();updateCurve();
const sharp=document.querySelector('#sharpness');
function updateSharp(){const amount=Number(sharp.value)/100;document.querySelector('#sharpness-value').textContent=sharp.value+'%';document.querySelector('#bounce-curve .motion-line').setAttribute('d',curvePath(t=>{const p=t<.5?2*t:2*(1-t);return (1-amount)*p*p*(3-2*p)+amount*(2*p-p*p);}));}
sharp.addEventListener('input',updateSharp);updateSharp();
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(host);
try{
 const renderer=new THREE.WebGLRenderer({canvas:host.querySelector('canvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#eee9e0');
 const camera=new THREE.PerspectiveCamera(36,1,.1,50);camera.position.set(5,3.7,9);camera.lookAt(0,2,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8e8174,2));const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(-3,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=8;key.shadow.camera.bottom=-4;key.shadow.normalBias=.03;scene.add(key);
 const ball=new THREE.Group();scene.add(ball);const colors=[0xe82620,0xffcc20,0x35c834,0x234de5,0xf67d16,0xf4f1e9];
 for(let i=0;i<6;i++){const panel=new THREE.Mesh(new THREE.SphereGeometry(.68,20,40,i*Math.PI/3,Math.PI/3),new THREE.MeshStandardMaterial({color:colors[i],roughness:.25,metalness:0}));panel.castShadow=true;ball.add(panel);}
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.13,24,12),new THREE.MeshStandardMaterial({color:colors[0],roughness:.28}));cap.scale.y=.18;cap.position.y=.68;ball.add(cap);ball.rotation.set(.3,.3,.15);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xe4ded2,roughness:.8}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 function resize(){const w=host.clientWidth,h=host.querySelector('canvas').clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(host);host.classList.add('ready');resize();
 let previous=performance.now();function tick(now){requestAnimationFrame(tick);const dt=Math.min((now-previous)/1000,.05);previous=now;if(!visible||document.hidden)return;if(playing)phase=(phase+dt/2)%1;const h=height(phase);ball.position.y=.68+2.5*h;time.value=13+phase*24;output.textContent=`Frame ${(13+phase*24).toFixed(1)}`;const point=document.querySelector('#interpolation-curve circle');point.setAttribute('cx',sx(phase));point.setAttribute('cy',sy(h));renderer.render(scene,camera);}requestAnimationFrame(tick);
}catch(error){play.disabled=true;time.disabled=true;play.textContent='Preview unavailable';console.warn('Day 2 WebGL preview unavailable',error);}
