import * as THREE from './assets/three.module.js';
import {initPlayground} from './playground.js?v=f7b449157b5e';
import {initLearning} from './learning.js?v=f7b449157b5e';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches, scenes=[],last=performance.now(),heroTime=0;
const visible=new Set();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);if(e.target.tagName==='VIDEO'){if(e.isIntersecting){if(!e.target.src){e.target.src=e.target.dataset.src;e.target.load();}if(!paused&&!e.target.dataset.userPaused)e.target.play().catch(()=>{});}else e.target.pause();}}),{rootMargin:'0px',threshold:.08});
function syncPause(){document.body.classList.toggle('motion-paused',paused);$('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#motion-toggle').innerHTML=paused?'Resume motion <span aria-hidden="true">▶</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';$$('video').forEach(v=>{if(paused)v.pause();else if(visible.has(v)&&!v.dataset.userPaused)v.play().catch(()=>{});});}
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;syncPause();});reduced.addEventListener('change',()=>{paused=reduced.matches;syncPause();});syncPause();
$$('video').forEach(v=>{observer.observe(v);v.addEventListener('pause',()=>{if(!paused&&visible.has(v)&&!document.hidden)v.dataset.userPaused='1';});v.addEventListener('play',()=>{delete v.dataset.userPaused;});});
$$('.film-play').forEach(button=>button.addEventListener('click',()=>{const host=button.closest('.film');const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${host.dataset.videoId}?autoplay=1&rel=0`;iframe.title=button.getAttribute('aria-label');iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';host.replaceChildren(iframe);}));
$$('.contents a').forEach(a=>a.addEventListener('click',()=>($('.contents')||{}).open=false));document.addEventListener('click',e=>{if(!e.target.closest('.contents'))($('.contents')||{}).open=false;});document.addEventListener('keydown',e=>{if(e.key==='Escape')($('.contents')||{}).open=false;});
const sections=$$('.tracked');let scrollPending=false;
function updateReading(){scrollPending=false;const max=document.documentElement.scrollHeight-innerHeight;$('#reading-progress').style.width=`${max?scrollY/max*100:0}%`;let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=innerHeight*.45)current=section;else break;}$('#current-chapter').textContent=current.dataset.chapter||'The course';const chapter=current.id==='motion-lab'?'#motion-lab':current.id==='appeal'||Number(current.dataset.number)>=20?'#slide-20':Number(current.dataset.number)>=5?'#slide-5':'#slide-1';$$('.topnav a,.contents nav a').forEach(a=>{if(a.getAttribute('href')===chapter)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateReading)}},{passive:true});addEventListener('resize',updateReading);updateReading();
const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');reveals.unobserve(e.target);}}),{threshold:.05});
if(!reduced.matches)$$('.lesson h2,.lesson .lead,.spec-grid,.prompt').forEach(el=>{el.classList.add('reveal-ready');if(el.getBoundingClientRect().top>innerHeight)el.classList.add('waiting');reveals.observe(el);});
function setupScene(host,scale=6){const canvas=host.querySelector('canvas');const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-scale,scale,scale,-scale,.1,80);camera.position.set(7,9,10);camera.lookAt(0,0,0);scene.add(new THREE.HemisphereLight(0xffffff,0xb7aa96,3));const key=new THREE.DirectionalLight(0xfff2dd,4.5);key.position.set(-4,10,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.03;key.shadow.bias=-.0002;key.shadow.radius=4;scene.add(key);const fill=new THREE.DirectionalLight(0xffffff,1.5);fill.position.set(6,4,-5);scene.add(fill);const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x453e34,opacity:.15}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.left=-scale*w/h;camera.right=scale*w/h;camera.top=scale;camera.bottom=-scale;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(host);resize();host.classList.add('ready');observer.observe(host);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('ready');});canvas.addEventListener('webglcontextrestored',()=>{host.classList.add('ready');resize();});return{host,scene,camera,renderer};}
function material(color){return new THREE.MeshStandardMaterial({color,roughness:.36,metalness:.12});}
function roundedCube(size,mat){const r=.075,s=size/2-r;const shape=new THREE.Shape();shape.moveTo(-s,-s);shape.lineTo(s,-s);shape.lineTo(s,s);shape.lineTo(-s,s);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:size-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r});geo.center();const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
try{
 const s=setupScene($('#hero-scene'),4.4),group=new THREE.Group();s.scene.add(group);
 s.renderer.toneMappingExposure=1.05;
 const black=new THREE.MeshPhysicalMaterial({color:0x30343c,roughness:.25,metalness:.35,clearcoat:.65});
 const porcelain=new THREE.MeshPhysicalMaterial({color:0xe5e8ed,roughness:.26,metalness:.08,clearcoat:.8});
 const orange=new THREE.MeshPhysicalMaterial({color:0xff5026,roughness:.2,metalness:.2,clearcoat:1});
 const objects=[],radius=1.8;
 // The inner orbit clears the full footprint of every outer object.
 for(let i=0;i<6;i++){
  const angle=i/6*Math.PI*2;
  const obj=i%2===0?roundedCube(1.04,black):new THREE.Mesh(new THREE.CylinderGeometry(.51,.51,.97,64),porcelain);
  obj.position.set(Math.cos(angle)*2.9,.54,Math.sin(angle)*2.9);obj.castShadow=true;obj.receiveShadow=true;group.add(obj);objects.push(obj);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.7,.74,.07,64),new THREE.MeshStandardMaterial({color:0xe7e9ed,roughness:.55,metalness:.2}));
  base.position.set(obj.position.x,.015,obj.position.z);base.receiveShadow=true;group.add(base);
 }
 for(const r of [radius-.06,radius+.06]){
  const ring=new THREE.Mesh(new THREE.RingGeometry(r-.008,r+.008,160),new THREE.MeshBasicMaterial({color:0xc5cbd2,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.012;group.add(ring);
 }
 const pulse=new THREE.Mesh(new THREE.SphereGeometry(.22,40,28),orange);pulse.castShadow=true;group.add(pulse);
 // A continuous tapered ribbon follows the sphere, fading into the orbit.
 const count=80,positions=new Float32Array((count+1)*6),colors=new Float32Array((count+1)*6),indices=[];
 for(let i=0;i<=count;i++){
  const color=new THREE.Color(0xff602e).lerp(new THREE.Color(0xffffff),i/count);
  for(let j=0;j<2;j++)color.toArray(colors,i*6+j*3);
  if(i<count){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));geo.setIndex(indices);
 const ribbon=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.75,depthWrite:false}));ribbon.frustumCulled=false;group.add(ribbon);
 let drag=false,px=0,rotation=0;const canvas=s.renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(drag){rotation+=(e.clientX-px)*.008;px=e.clientX;}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=false);
 s.update=dt=>{
  if(!paused)heroTime=(heroTime+dt)%10;
  const a=heroTime/10*Math.PI*2;group.rotation.y+=(rotation-group.rotation.y)*.12;
  pulse.position.set(Math.cos(a)*radius,.25,Math.sin(a)*radius);
  for(let i=0;i<=count;i++){
   const angle=a-.10-i/count*1.15,half=.075*(1-i/count);
   for(let j=0;j<2;j++){const r=radius+(j?half:-half),offset=i*6+j*3;positions[offset]=Math.cos(angle)*r;positions[offset+1]=.045;positions[offset+2]=Math.sin(angle)*r;}
  }
  geo.attributes.position.needsUpdate=true;
  objects.forEach((obj,i)=>{
   const lag=((a-i/6*Math.PI*2)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
   const bounce=lag<1?Math.sin(lag*Math.PI)**2*.32:0;
   obj.position.y=.54+bounce;obj.rotation.z=i%2===0?bounce*.12:0;
  });
  $('#loop-time').textContent=heroTime.toFixed(1).padStart(4,'0');$('#relay-progress').style.width=heroTime*10+'%';
 };scenes.push(s);
}catch(e){console.warn('3D preview unavailable; showing the course illustration.',e);$('.drag-hint').textContent='Kinetic Relay · course illustration';}

function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden)for(const s of scenes){if(visible.has(s.host)){s.update(dt);s.renderer.render(s.scene,s.camera);}}requestAnimationFrame(frame);}requestAnimationFrame(frame);
// LAB_IMPLEMENTATION
function lightMotionStudio(study){
 const {scene,renderer}=study;
 scene.background=new THREE.Color(0x8c8195);
 scene.fog=new THREE.Fog(0x8c8195,12,29);
 renderer.toneMappingExposure=1.05;
 scene.traverse(object=>{
  if(object.isHemisphereLight){object.color.set(0xf4e5ee);object.groundColor.set(0x57485e);object.intensity=.85;}
  if(object.isDirectionalLight){
   if(object.castShadow){object.position.set(-3,6,4);object.color.set(0xffe0ce);object.intensity=3.2;object.shadow.camera.left=-5;object.shadow.camera.right=5;object.shadow.camera.top=5;object.shadow.camera.bottom=-5;object.shadow.camera.updateProjectionMatrix();object.shadow.normalBias=.015;object.shadow.radius=4;}
   else{object.position.set(4,3,-3);object.color.set(0xcfc7ff);object.intensity=1.7;}
  }
  if(object.isMesh&&object.material.isShadowMaterial){object.material.dispose();object.material=new THREE.MeshStandardMaterial({color:0xb9a4ac,roughness:.82,metalness:0});}
 });
 const wash=new THREE.SpotLight(0xffbfa9,65,22,.85,.95,1.5);
 wash.position.set(-1,5,-3);wash.target.position.set(0,0,-2);scene.add(wash,wash.target);
 // Broad studio panels provide reflections without extra runtime shadow maps.
 const room=new THREE.Scene();
 room.add(new THREE.Mesh(new THREE.BoxGeometry(24,18,24),new THREE.MeshBasicMaterial({color:0x796f83,side:THREE.BackSide})));
 for(const [x,y,z,w,h,power] of [[-4,5,3,3,7,3],[5,3,1,2,6,2],[0,6,-4,6,2,2]]){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(power,power*.92,power*.87),side:THREE.DoubleSide}));
  panel.position.set(x,y,z);panel.lookAt(0,0,0);room.add(panel);
 }
 const generator=new THREE.PMREMGenerator(renderer);
 const environment=generator.fromScene(room,.06,.1,40);
 scene.environment=environment.texture;
 generator.dispose();room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
}
initPlayground({setupScene,lightStudio:lightMotionStudio,observe:el=>observer.observe(el),register:study=>scenes.push(study),isPaused:()=>paused,resume:()=>{paused=false;syncPause();},reduced});

initLearning({observe:el=>observer.observe(el),register:study=>scenes.push(study),isPaused:()=>paused,resume:()=>{paused=false;syncPause();}});
