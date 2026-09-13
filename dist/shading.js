import * as THREE from './assets/three.module.js';
export function initShading(){
 const host=document.querySelector('#shading-scene');if(!host)return;
 try{
 const renderer=new THREE.WebGLRenderer({canvas:host.querySelector('canvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xf1f2f4);
 const camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.set(0,.4,5.5);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x657080,2));
 for(const [x,y,z,power] of [[-3,4,5,3],[3,1,-2,2]]){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light);}
 const material=new THREE.MeshStandardMaterial({color:0x6191c6,roughness:.42,metalness:.1,flatShading:true});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(1.1,16,12),material);mesh.rotation.set(.15,-.3,.1);scene.add(mesh);
 const normalGroup=new THREE.Group();mesh.add(normalGroup);normalGroup.visible=false;
 const flatNormals=new THREE.Group(),smoothNormals=new THREE.Group();normalGroup.add(flatNormals,smoothNormals);smoothNormals.visible=false;
 const geometry=mesh.geometry,position=geometry.attributes.position,index=geometry.index;
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),normal=new THREE.Vector3(),center=new THREE.Vector3();
 function arrow(parent,origin,direction){parent.add(new THREE.ArrowHelper(direction,origin,.22,0xff562e,.055,.03));}
 for(let i=0;i<index.count;i+=3){a.fromBufferAttribute(position,index.getX(i));b.fromBufferAttribute(position,index.getX(i+1));c.fromBufferAttribute(position,index.getX(i+2));normal.subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a));if(normal.lengthSq()<1e-10)continue;normal.normalize();for(const vertex of [a,b,c])arrow(flatNormals,vertex.clone().addScaledVector(normal,.008),normal.clone());}
 const seen=new Set();
 for(let i=0;i<position.count;i++){a.fromBufferAttribute(position,i);const key=[a.x,a.y,a.z].map(v=>v.toFixed(4)).join(',');if(seen.has(key))continue;seen.add(key);normal.fromBufferAttribute(geometry.attributes.normal,i).normalize();arrow(smoothNormals,a.clone().addScaledVector(normal,.008),normal.clone());}
 const normalsButton=document.querySelector('#show-shading-normals');
 normalsButton.addEventListener('click',()=>{normalGroup.visible=!normalGroup.visible;normalsButton.setAttribute('aria-pressed',String(normalGroup.visible));normalsButton.textContent=normalGroup.visible?'Hide normals':'Show normals';render();});
 const render=()=>renderer.render(scene,camera);
 document.querySelectorAll('input[name="surface-shading"]').forEach(input=>input.addEventListener('change',()=>{material.flatShading=input.value==='flat';material.needsUpdate=true;flatNormals.visible=material.flatShading;smoothNormals.visible=!material.flatShading;document.querySelector('#shading-description').textContent=material.flatShading?'Each face has a single normal, so the individual faces remain visible.':'Normals are interpolated across faces, giving the surface a smoother appearance. The geometry stays the same.';render();}));
 const canvas=renderer.domElement;canvas.tabIndex=0;let drag=null;
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});});
 canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;mesh.rotation.y+=(e.clientX-drag.x)*.008;mesh.rotation.x+=(e.clientY-drag.y)*.008;drag.x=e.clientX;drag.y=e.clientY;render();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(drag?.id===e.pointerId)drag=null;});
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();mesh.rotation.y+=e.key==='ArrowLeft'?-.1:e.key==='ArrowRight'?.1:0;mesh.rotation.x+=e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0;render();});
 new ResizeObserver(()=>{renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();render();}).observe(host);render();
 }catch(error){document.querySelector('#shading-description').textContent='Interactive 3D is unavailable on this device. Flat shading shows individual faces; smooth shading blends their normals without adding geometry.';document.querySelectorAll('input[name="surface-shading"]').forEach(input=>input.disabled=true);console.warn('Shading preview unavailable',error);}
}
