import * as THREE from './assets/three.module.js';
import {motionAt,clamp,bezierAt} from './motion.js?v=f7b449157b5e';
export function initPlayground({setupScene,lightStudio,observe,register,isPaused,resume,reduced}){
 const $=s=>document.querySelector(s),host=$('#lab-scene');if(!host)return;
 const descriptions={linear:'Equal distance every frame. The speed stays constant.',ease:'Slow at each end, fast in the middle. Watch it travel there and back.',anticipation:'A small pullback prepares the main action.',overshoot:'Pass the destination, then settle back.',heavy:'A slow start builds into a firm stop.',playful:'An arc, deformation, and overshoot give the object a lively character.',custom:'Your curve controls the orange ball. The gray reference stays linear.'};
 let mode='ease',duration=2,time=0,stopped=false,showTrails=false;
 let handles=[1/3,0,2/3,1],study=null,trails=[],trailDirty=true;
 const valueAt=t=>mode==='custom'?bezierAt(t,handles):motionAt(mode,t);
 const progress=()=>{const phase=time/duration;return mode==='ease'?clamp(phase<=1?phase:2-phase):clamp(phase);};
 const cycleDuration=()=>mode==='ease'?duration*2:duration+.65;
 const poseAt=t=>{const p=valueAt(t);let stretch=1,lift=0;if(mode==='playful'){stretch=1+Math.sin(t*Math.PI*2)*.2;lift=Math.sin(t*Math.PI)*.75;}return {x:-2.2+4.4*p,y:.39*stretch+lift,stretch,p};};
 const point=(x,y)=>[25+x*250,140-y*100];
 function drawCurve(){let d='';for(let i=0;i<=100;i++){const t=i/100;const [x,y]=point(t,valueAt(t));d+=`${i?'L':'M'}${x},${y}`;}$('#motion-curve').setAttribute('d',d);trailDirty=true;}
 function drawHandles(){
  const a=point(handles[0],handles[1]),b=point(handles[2],handles[3]);
  $('#handle-lines').setAttribute('d',`M25 140L${a[0]} ${a[1]}M275 40L${b[0]} ${b[1]}`);
  for(const [i,id] of ['handle-start','handle-end'].entries()){
   const p=i?b:a,el=$('#'+id);el.setAttribute('cx',p[0]);el.setAttribute('cy',p[1]);
   el.setAttribute('aria-label',`${i?'End':'Start'} handle: time ${Math.round(handles[i*2]*100)}%, position ${Math.round(handles[i*2+1]*100)}%. Use arrow keys to adjust.`);
  }
  ['x1','y1','x2','y2'].forEach((key,i)=>{const input=$('#handle-'+key);input.value=handles[i];input.setAttribute('aria-valuetext',`${Math.round(handles[i]*100)} percent`);});
 }
 function updateUI(){
  const t=progress(),[x,y]=point(t,valueAt(t));$('#scrub').value=(mode==='ease'?time/(duration*2):t)*1000;$('#lab-time').value=(mode==='ease'?time:t*duration).toFixed(1)+' s';$('#curve-dot').setAttribute('cx',x);$('#curve-dot').setAttribute('cy',y);
  $('.lab-scene-label span:last-child').textContent=mode==='ease'?(time<duration?'A \u2192 B':'A \u2190 B'):'A \u2192 B';
  $('#lab-play').textContent=stopped||isPaused()?'Play':'Pause';$('#lab-play').setAttribute('aria-pressed',String(stopped||isPaused()));
 }
 function setMode(next,reset=true){
  const previousProgress=progress();mode=next;time=reset?0:previousProgress*duration;
  document.querySelector('label[for="duration"]').firstChild.textContent=mode==='ease'?'Duration each way ':'Move duration ';
  const input=document.querySelector(`input[name="motion-mode"][value="${mode}"]`);input.checked=true;
  $('#study-label').textContent=input.nextElementSibling.textContent;$('#lab-description').textContent=descriptions[mode];
  $('#curve-handles').toggleAttribute('hidden',mode!=='custom');$('#reset-curve').hidden=mode!=='custom';$('#edit-curve').hidden=mode==='custom';
  $('#curve-help').textContent=mode==='custom'?'Drag either handle. Arrow keys adjust a focused handle; Shift makes larger steps.':'Edit the curve to control how the orange ball speeds up and slows down.';
  if(reset&&!reduced.matches){host.classList.remove('mode-changing');void host.offsetWidth;host.classList.add('mode-changing');}
  drawHandles();drawCurve();updateUI();
 }
 try{
  study=setupScene(host,2.55);lightStudio(study);study.camera.position.set(0,5,10);study.camera.lookAt(0,0,0);
  const main=new THREE.Mesh(new THREE.SphereGeometry(.38,40,28),new THREE.MeshPhysicalMaterial({color:0xff502c,metalness:.38,roughness:.23,clearcoat:1,clearcoatRoughness:.17,envMapIntensity:.8}));
  const reference=new THREE.Mesh(new THREE.SphereGeometry(.22,24,16),new THREE.MeshPhysicalMaterial({color:0x99958d,metalness:.15,roughness:.3,clearcoat:.5,envMapIntensity:.65}));
  main.castShadow=true;reference.castShadow=true;study.scene.add(main,reference);
  for(const z of [-.85,1.1]){
   const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.2,.005,z),new THREE.Vector3(2.2,.005,z)]);
   study.scene.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x99818e,transparent:true,opacity:.55})));
   for(const x of [-2.2,2.2]){const ring=new THREE.Mesh(new THREE.RingGeometry(.4,.415,48),new THREE.MeshBasicMaterial({color:0x806573,side:THREE.DoubleSide,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.012,z);study.scene.add(ring);}
  }
  const dotGeometry=new THREE.SphereGeometry(.045,10,8);
  for(let row=0;row<2;row++)for(let i=0;i<=40;i++){
   const dot=new THREE.Mesh(dotGeometry,new THREE.MeshBasicMaterial({color:row?0x696569:0xff6a45,transparent:true,opacity:.5}));dot.visible=false;dot.userData={row,seconds:i*.1,t:i*.1/duration};study.scene.add(dot);trails.push(dot);
  }
  study.update=dt=>{
   if(!isPaused()&&!stopped)time=(time+dt)%cycleDuration();
   const t=progress(),p=poseAt(t);main.position.set(p.x,p.y,-.85);main.scale.set(1/Math.sqrt(p.stretch),p.stretch,1/Math.sqrt(p.stretch));main.rotation.z=-p.p*Math.PI*2;reference.position.set(-2.2+4.4*t,.23,1.1);
   for(const dot of trails){dot.visible=showTrails&&dot.userData.seconds<=duration+.0001;if(trailDirty){dot.userData.t=clamp(dot.userData.seconds/duration);const q=poseAt(dot.userData.t);dot.position.set(dot.userData.row?-2.2+4.4*dot.userData.t:q.x,dot.userData.row ? .23 : q.y,dot.userData.row?1.1:-.85);}dot.material.opacity=(mode==='ease'&&time>=duration?dot.userData.t>=t:dot.userData.t<=t) ? .65 : .22;}
   trailDirty=false;updateUI();
  };register(study);
 }catch(error){
  host.classList.remove('ready');study=null;observe(host);
  register({host,update:dt=>{if(!isPaused()&&!stopped)time=(time+dt)%cycleDuration();updateUI();},renderer:{render(){}},scene:null,camera:null});
  const notice=document.createElement('p');notice.className='lab-fallback-note';notice.textContent='3D is unavailable on this device. You can still edit and play the curve below.';host.after(notice);
  $('#show-trails').disabled=true;console.warn('3D study unavailable.',error);
 }
 document.querySelectorAll('input[name="motion-mode"]').forEach(input=>input.addEventListener('change',()=>setMode(input.value)));
 $('#duration').addEventListener('input',e=>{const t=time/duration;duration=Number(e.target.value);time=t*duration;$('#duration-value').value=duration.toFixed(1)+' s';$('#trail-help').textContent='Dots every 0.10 s. Close dots mean slower motion.';trailDirty=true;updateUI();});
 $('#scrub').addEventListener('input',e=>{stopped=true;time=Number(e.target.value)/1000*duration*(mode==='ease'?2:1);updateUI();});
 $('#lab-play').addEventListener('click',()=>{if(stopped||isPaused()){stopped=false;resume();}else stopped=true;if(time>=(mode==='ease'?duration*2:duration))time=0;updateUI();});
 $('#show-trails').addEventListener('change',e=>{showTrails=e.target.checked;trailDirty=true;});
 $('#edit-curve').addEventListener('click',()=>setMode('custom',false));
 $('#reset-curve').addEventListener('click',()=>{handles=[1/3,0,2/3,1];drawHandles();drawCurve();updateUI();});
 ['x1','y1','x2','y2'].forEach((key,i)=>$('#handle-'+key).addEventListener('input',e=>{handles[i]=Number(e.target.value);setMode('custom',false);}));
 const svg=$('#curve-editor');let dragging=null;
 const localPoint=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
 svg.addEventListener('pointerdown',e=>{
  if(mode!=='custom')return;const p=localPoint(e);let closest=23;
  for(let i=0;i<2;i++){const h=point(handles[i*2],handles[i*2+1]),distance=Math.hypot(p.x-h[0],p.y-h[1]);if(distance<closest){dragging=i;closest=distance;}}
  if(dragging!==null){e.preventDefault();svg.setPointerCapture(e.pointerId);$('#'+(dragging?'handle-end':'handle-start')).focus();}
 });
 svg.addEventListener('pointermove',e=>{if(dragging===null)return;const p=localPoint(e);handles[dragging*2]=clamp((p.x-25)/250);handles[dragging*2+1]=clamp((140-p.y)/100,-.25,1.25);drawHandles();drawCurve();updateUI();});
 const endDrag=()=>dragging=null;svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);svg.addEventListener('lostpointercapture',endDrag);
 ['handle-start','handle-end'].forEach((id,i)=>$('#'+id).addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const step=e.shiftKey ? .1 : .01;const horizontal=e.key==='ArrowLeft'||e.key==='ArrowRight',index=i*2+(horizontal?0:1),sign=e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:1;handles[index]=clamp(handles[index]+sign*step,horizontal?0:-.25,horizontal?1:1.25);drawHandles();drawCurve();updateUI();}));
 reduced.addEventListener('change',()=>{host.classList.remove('mode-changing');});
 setMode('ease',false);
}
