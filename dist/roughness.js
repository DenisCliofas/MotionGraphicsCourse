import * as THREE from './assets/three.module.js';
import {HDRLoader} from './assets/HDRLoader.js';
export function initRoughness(){initMaterial('material');}
async function initMaterial(kind){
 const host=document.querySelector('#'+kind+'-scene');if(!host)return;
 const slider=document.querySelector('#roughness-value'),controls=['metallic','roughness','specular'];
 try{
 const renderer=new THREE.WebGLRenderer({canvas:host.querySelector('canvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xf1f2f4);
 const camera=new THREE.PerspectiveCamera(36,1,.1,40);camera.position.set(0,1.8,6.5);camera.lookAt(0,.15,0);
 const hdr=await new HDRLoader().loadAsync('./assets/lebombo_1k.hdr');const generator=new THREE.PMREMGenerator(renderer),environment=generator.fromEquirectangular(hdr);scene.environment=environment.texture;generator.dispose();hdr.dispose();
 const material=new THREE.MeshPhysicalMaterial({color:kind==='roughness'?0xb8bec8:0xb66c35,metalness:kind==='roughness'?1:0,roughness:kind==='roughness'?.35:.22,ior:1.5,specularIntensity:1});
 const group=new THREE.Group(),sphere=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),material);sphere.castShadow=true;group.add(sphere);
 for(const radius of [.7,.95]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.025,12,96),material);ring.position.z=Math.sqrt(1-radius*radius)+.012;group.add(ring);}
 group.rotation.set(.1,-.35,.18);group.position.y=.12;scene.add(group);
 scene.add(new THREE.HemisphereLight(0xffffff,0x687080,.6));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-3,6,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.normalBias=.025;scene.add(light);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xf1f2f4,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.92;floor.receiveShadow=true;scene.add(floor);
 const render=()=>renderer.render(scene,camera);
 const canvas=renderer.domElement;let drag=null;
 canvas.tabIndex=0;canvas.setAttribute('aria-label',`Interactive ${kind} sphere. Drag to rotate, or use arrow keys.`);
 canvas.addEventListener('pointerdown',event=>{if(event.button!==0||drag)return;event.preventDefault();canvas.focus({preventScroll:true});drag={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);host.classList.add('dragging');});
 canvas.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;group.rotation.y+=(event.clientX-drag.x)*.008;group.rotation.x+=(event.clientY-drag.y)*.008;drag.x=event.clientX;drag.y=event.clientY;render();});
 const endDrag=event=>{if(drag&&event.pointerId===drag.id){drag=null;host.classList.remove('dragging');}};
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,endDrag);
 canvas.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const step=event.shiftKey?.2:.08;if(event.key==='ArrowLeft')group.rotation.y-=step;if(event.key==='ArrowRight')group.rotation.y+=step;if(event.key==='ArrowUp')group.rotation.x-=step;if(event.key==='ArrowDown')group.rotation.x+=step;render();});
 const hint=document.createElement('span');hint.className='material-drag-hint';hint.textContent='Drag to rotate';host.append(hint);

 const update=()=>{
 material.color.set(document.querySelector('#material-color').value);
 for(const key of controls){const input=document.querySelector('#'+key+'-value'),value=Number(input.value);document.querySelector('#'+key+'-output').value=value.toFixed(2);if(key==='metallic')material.metalness=value;else if(key==='roughness')material.roughness=value;else material.specularIntensity=value;}
 const specular=document.querySelector('#specular-value');specular.disabled=material.metalness===1;specular.closest('.material-control').classList.toggle('inactive',specular.disabled);render();
 };
 for(const key of controls)document.querySelector('#'+key+'-value').addEventListener('input',update);
 document.querySelector('#material-color').addEventListener('input',update);
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render();}).observe(host);
 host.classList.add('ready');update();
 }catch(error){document.querySelectorAll('.material-panel input').forEach(input=>input.disabled=true);document.querySelector('#'+kind+'-help').textContent='Interactive 3D is unavailable on this device. Please try a browser with WebGL enabled.';console.warn('Roughness preview unavailable',error);}
}
