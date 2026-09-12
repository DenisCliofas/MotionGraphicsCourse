import * as THREE from './assets/three.module.js';
import {SVGLoader} from './assets/SVGLoader.js';
export async function initFoundationHero(isPaused){
 const host=document.querySelector('#foundation-scene');if(!host)return;
 try{
 const renderer=new THREE.WebGLRenderer({canvas:host.querySelector('canvas'),antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,60);camera.position.set(0,1.1,11);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x657085,2));
 for(const [x,y,z,color,power] of [[-3,5,6,0xffe8d5,4],[4,2,-2,0xc5dcff,3]]){const light=new THREE.DirectionalLight(color,power);light.position.set(x,y,z);light.castShadow=z>0;light.shadow.mapSize.set(1024,1024);light.shadow.normalBias=.02;scene.add(light);}
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-2;floor.receiveShadow=true;scene.add(floor);
 const svg=await new SVGLoader().loadAsync('./assets/blender.svg'),logo=new THREE.Group();
 const material=new THREE.MeshPhysicalMaterial({color:0xe87d0d,metalness:.25,roughness:.26,clearcoat:1});
 for(const path of svg.paths)for(const shape of SVGLoader.createShapes(path)){const geometry=new THREE.ExtrudeGeometry(shape,{depth:1.5,bevelEnabled:true,bevelThickness:.16,bevelSize:.12,bevelSegments:3,curveSegments:32});const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;logo.add(mesh);}
 const bounds=new THREE.Box3().setFromObject(logo),center=bounds.getCenter(new THREE.Vector3());logo.children.forEach(m=>m.position.sub(center));logo.scale.set(.19,-.19,.19);
 const turn=new THREE.Group();turn.add(logo);scene.add(turn);turn.rotation.set(-.08,-.25,0);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(host);resize();host.classList.add('ready');
 let active=true,drag=null,last=performance.now(),time=0;
 new IntersectionObserver(es=>active=es[0].isIntersecting).observe(host);
 const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){turn.rotation.y+=(e.clientX-drag.x)*.008;drag.x=e.clientX;}});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null);
 function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;if(active&&!document.hidden){if(!isPaused()&&!drag){time+=dt;turn.rotation.y+=dt*.22;turn.position.y=Math.sin(time*.8)*.08;}renderer.render(scene,camera);}requestAnimationFrame(frame);}requestAnimationFrame(frame);
 }catch(error){console.warn('Blender logo preview unavailable',error);}
}
