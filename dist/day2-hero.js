import * as THREE from './assets/three.module.js';
const host=document.querySelector('[data-day2-scene]');
if(host){try{
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;host.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(7,6,10);camera.lookAt(0,1,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x6e7685,.55));
for(const [x,y,z,power] of [[-4,8,5,2.4],[5,4,-4,1.3]]){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);light.castShadow=z>0;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-6;light.shadow.camera.right=6;light.shadow.camera.top=6;light.shadow.camera.bottom=-6;light.shadow.normalBias=.025;scene.add(light);}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.2}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const group=new THREE.Group();scene.add(group);const ball=new THREE.Group();group.add(ball);
const material=color=>new THREE.MeshPhysicalMaterial({color,roughness:.23,metalness:.12,clearcoat:1});
const machine=host.dataset.day2Scene==='machine';
const slats=[];let reflectionCamera,reflectionTarget,reflectionTick=0;
if(machine){
 // Same 23-slats-per-half-turn Array study, viewed from its traveling camera.
 camera.position.set(7,5.5,9);camera.lookAt(0,.4,0);floor.position.y=-2.5;
 renderer.toneMappingExposure=1.05;
 scene.background=new THREE.Color(0x303b46);
 floor.material.dispose();floor.material=new THREE.MeshStandardMaterial({color:0x536476,metalness:.15,roughness:.42});floor.scale.setScalar(7);
 scene.children.filter(o=>o.isHemisphereLight).forEach(o=>o.intensity=.35);
 scene.children.filter(o=>o.isDirectionalLight).forEach((o,i)=>{o.color.set(i?0xc7ddff:0xffeee0);o.intensity=i?2.1:3.2;o.shadow.normalBias=.015;});
 renderer.shadowMap.type=THREE.VSMShadowMap;
 scene.children.filter(o=>o.isDirectionalLight&&o.castShadow).forEach(o=>{o.shadow.radius=4;o.shadow.blurSamples=8;});
 const environment=new THREE.Scene();environment.background=new THREE.Color(0x303b46);
 // Broad photographic softboxes, visible in reflections but outside the main view.
 const softboxCanvas=document.createElement('canvas');softboxCanvas.width=128;softboxCanvas.height=128;
 const ctx=softboxCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,28,64,64,64);
 gradient.addColorStop(0,'white');gradient.addColorStop(.7,'#eeeeee');gradient.addColorStop(1,'black');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const softboxMap=new THREE.CanvasTexture(softboxCanvas);softboxMap.colorSpace=THREE.SRGBColorSpace;
 for(const [x,y,z,w,h] of [[-3,9,4,5,5],[5,7,-2,4,4],[-2,5,-6,3,3]]){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(3,3,3),map:softboxMap,side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,1,0);environment.add(panel);
  const reflectionPanel=panel.clone();reflectionPanel.layers.set(1);scene.add(reflectionPanel);
 }
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(environment,.08).texture;pmrem.dispose();
 const chrome=new THREE.MeshPhysicalMaterial({color:0xdde4ec,metalness:1,roughness:.12,clearcoat:1});
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),chrome);sphere.castShadow=true;ball.add(sphere);
 const seam=new THREE.Mesh(new THREE.SphereGeometry(1.003,64,8,0,Math.PI*2,Math.PI/2-.065,.13),material(0x245bc5));ball.add(seam);
 ball.position.y=1.15;
 // A beveled cross-section gives the ceramic real edge highlights.
 const outline=new THREE.Shape();outline.moveTo(-1.95,-.09);outline.lineTo(1.95,-.09);outline.lineTo(1.95,.09);outline.lineTo(-1.95,.09);outline.closePath();
 const geometry=new THREE.ExtrudeGeometry(outline,{depth:.28,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:3,steps:1});geometry.translate(0,0,-.14);
 const porcelain=new THREE.MeshPhysicalMaterial({color:0xe0e5ec,metalness:0,roughness:.26,clearcoat:.65,clearcoatRoughness:.17});
 reflectionTarget=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
 reflectionCamera=new THREE.CubeCamera(.1,65,reflectionTarget);scene.add(reflectionCamera);chrome.envMap=reflectionTarget.texture;chrome.envMapIntensity=1.1;
 reflectionCamera.children.forEach(camera=>camera.layers.enable(1));

 for(let i=0;i<115;i++){const slat=new THREE.Mesh(geometry,porcelain);slat.castShadow=true;slat.receiveShadow=true;group.add(slat);slats.push(slat);}
}else{
 const colors=[0xff4438,0xffc928,0x2266ee,0xff8025,0xffffff,0x28ba60];
 colors.forEach((color,i)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(.75,20,40,i*Math.PI/3,Math.PI/3),material(color));mesh.castShadow=true;ball.add(mesh);});
}
if(!machine){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,.025,12,80),material(0xc7bcae));ring.rotation.x=-Math.PI/2;ring.position.y=.025;group.add(ring);}
let dragging=false,lastX=0,rotation=0;renderer.domElement.style.touchAction='pan-y';renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(dragging){rotation+=(e.clientX-lastX)*.008;lastX=e.clientX;}});renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(host);
let visible=true;new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(host);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');const clock=new THREE.Clock();let t=0;
renderer.setAnimationLoop(()=>{const dt=clock.getDelta();if(!visible||document.hidden)return;if(!reduced.matches)t+=Math.min(dt,.05);group.rotation.y=rotation;
if(machine){
 // Translation and twist cancel at the ball, keeping its contact plane level.
 // Recycle by the full 50-unit track length (five half-turns: identical slats).
 const travel=t*5,span=50;
 slats.forEach((slat,i)=>{const z=((i*10/23-travel+span/2)%span+span)%span-span/2;slat.position.set(0,0,z);slat.rotation.z=z*Math.PI/10;});
 ball.position.y=1.15;ball.rotation.set(-t*Math.PI*1.5,0,0);
}else{const phase=(t%2)/2;ball.position.y=.75+3*4*phase*(1-phase);ball.rotation.set(.15,t*.6,.2);}
if(machine&&reflectionTick++%3===0){
  const background=scene.background;scene.background=scene.userData.reflectionBackground||new THREE.Color(0x303b46);
  group.updateMatrixWorld(true);ball.getWorldPosition(reflectionCamera.position);ball.visible=false;
  reflectionCamera.update(renderer,scene);ball.visible=true;scene.background=background;
 }
 renderer.render(scene,camera);});
host.classList.add('scene-ready');
}catch(error){console.warn('Day 2 scene unavailable',error);}}
