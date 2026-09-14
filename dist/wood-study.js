import * as THREE from './assets/three.module.js';
import {HDRLoader} from './assets/HDRLoader.js';
export async function buildWoodStudy(s,isPaused){
 const scene=s.scene,group=new THREE.Group();scene.add(group);
 const texture=await new THREE.TextureLoader().loadAsync('./assets/wood-diffuse.jpg');texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.center.set(.5,.5);texture.rotation=Math.PI/2;texture.repeat.set(1/.33,1/.33);texture.anisotropy=Math.min(8,s.renderer.capabilities.getMaxAnisotropy());
 const hdr=await new HDRLoader().loadAsync('./assets/lebombo_1k.hdr'),pmrem=new THREE.PMREMGenerator(s.renderer);scene.environment=pmrem.fromEquirectangular(hdr).texture;scene.environmentIntensity=.75;pmrem.dispose();hdr.dispose();
 s.renderer.toneMappingExposure=.85;
 scene.traverse(o=>{if(o.isHemisphereLight)o.intensity=.28;if(o.isDirectionalLight){o.intensity=o.castShadow?3.2:.45;o.color.set(o.castShadow?0xffebd9:0xdde8ff);if(o.castShadow){o.position.set(-3,7,4);o.shadow.mapSize.set(2048,2048);o.shadow.radius=3;o.shadow.camera.left=-4;o.shadow.camera.right=4;o.shadow.camera.top=5;o.shadow.camera.bottom=-4;o.shadow.camera.near=.5;o.shadow.camera.far=18;o.shadow.camera.updateProjectionMatrix();o.shadow.normalBias=.012;o.shadow.bias=-.00008;}}if(o.material?.isShadowMaterial){o.material.opacity=.4;o.material.color.set(0x242831);o.position.y=-.065;}});
 const wood=new THREE.MeshPhysicalMaterial({map:texture,color:0xe5d9c7,roughness:.48,metalness:0,clearcoat:.22,clearcoatRoughness:.35});

 const metal=new THREE.MeshPhysicalMaterial({color:0xd8d4cb,metalness:1,roughness:.16,clearcoat:.4});
 const dark=new THREE.MeshStandardMaterial({color:0x353336,metalness:.7,roughness:.28});
 function add(geo,mat,x,y,z,parent=group){const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 // The ramp runs along Z; the ring swings across X in its central slot.
 const R=2.3,base=.65,limit=1.12,ballRadius=.23,orbit=R-ballRadius;
 // A single extruded cross-section forms the ramp, return, and base.
 function continuousRamp(side){
  const inner=.065,thickness=.18,edgeZ=R*Math.sin(inner),top=t=>base+R*(1-Math.cos(t));
  const profile=new THREE.Shape();profile.moveTo(edgeZ,top(inner));
  for(let i=1;i<=96;i++){const t=inner+(limit-inner)*i/96;profile.lineTo(R*Math.sin(t),top(t));}
  profile.lineTo(R*Math.sin(limit),top(limit)-thickness);
  const join=Math.asin((edgeZ+thickness)/R);
  for(let i=1;i<=96;i++){const t=limit+(join-limit)*i/96;profile.lineTo(R*Math.sin(t),top(t)-thickness);}
  profile.lineTo(edgeZ+thickness,.23);profile.quadraticCurveTo(edgeZ+thickness,.14,edgeZ+thickness+.09,.14);
  profile.lineTo(2.65,.14);profile.lineTo(2.65,-.06);profile.lineTo(edgeZ+.14,-.06);
  profile.quadraticCurveTo(edgeZ,-.06,edgeZ,.08);profile.lineTo(edgeZ,top(inner));profile.closePath();
  const geo=new THREE.ExtrudeGeometry(profile,{depth:2.7,steps:1,bevelEnabled:false,curveSegments:20});
  const positions=geo.attributes.position;
  for(let i=0;i<positions.count;i++){const z=positions.getX(i),y=positions.getY(i),x=positions.getZ(i)-1.35;positions.setXYZ(i,x,y,side*z);}
  // The positive-side axis mapping changes handedness; reverse triangle winding.
  if(side===1)for(const attribute of Object.values(geo.attributes))for(let i=0;i<attribute.count;i+=3)for(let c=0;c<attribute.itemSize;c++){
   const first=i*attribute.itemSize+c,last=(i+2)*attribute.itemSize+c,value=attribute.array[first];attribute.array[first]=attribute.array[last];attribute.array[last]=value;
  }
  geo.computeVertexNormals();
  // Consistent world-scale grain instead of ExtrudeGeometry's per-unit tiling.
  const normals=geo.attributes.normal,uv=geo.attributes.uv;
  for(let i=0;i<positions.count;i++){
   const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
   if(Math.abs(normals.getX(i))>.8)uv.setXY(i,(side*z)/5.5,y/5.5);
   else uv.setXY(i,(x+1.35)/5.5,(side*z+y*.4)/5.5);
  }
  uv.needsUpdate=true;return geo;
 }
 for(const side of [-1,1])add(continuousRamp(side),wood,0,0,0);
 // Soft contact occlusion beneath each wooden support supplements the real shadows.
 const mask=document.createElement('canvas');mask.width=mask.height=128;const ctx=mask.getContext('2d');const gradient=ctx.createRadialGradient(64,64,20,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,0.32)');gradient.addColorStop(.65,'rgba(0,0,0,0.18)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const contactTexture=new THREE.CanvasTexture(mask);
 for(const side of [-1,1]){const contact=new THREE.Mesh(new THREE.PlaneGeometry(4,3.3),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));contact.rotation.x=-Math.PI/2;contact.position.set(0,-.061,side*1.4);group.add(contact);}
 const pivot=new THREE.Group();pivot.position.set(0,3.8,0);group.add(pivot);
 const arm=3.8-base-ballRadius;
 const sleeve=new THREE.Shape();sleeve.absarc(0,0,.555,0,Math.PI*2,false);
 const opening=new THREE.Path();opening.absarc(0,0,.425,0,Math.PI*2,true);sleeve.holes.push(opening);
 const sleeveGeometry=new THREE.ExtrudeGeometry(sleeve,{depth:.22,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:3,curveSegments:64});sleeveGeometry.translate(0,0,-.11);
 add(sleeveGeometry,metal,0,-arm,0,pivot);
 add(new THREE.CylinderGeometry(.009,.009,arm-.49,8),metal,0,-(arm-.49)/2,0,pivot);
 const ball=new THREE.Group();group.add(ball);
 const lacquer=new THREE.MeshPhysicalMaterial({color:0xe94725,metalness:0,roughness:.2,clearcoat:1});
 add(new THREE.SphereGeometry(ballRadius,48,24,0,Math.PI*2,0,Math.PI/2),metal,0,0,0,ball);
 add(new THREE.SphereGeometry(ballRadius,48,24,0,Math.PI*2,Math.PI/2,Math.PI/2),lacquer,0,0,0,ball);
 // Integrate a rolling sphere under gravity to obtain a reusable quarter-cycle.
 const launchSpeed=2.5,amplitude=limit;
 const samples=[{t:0,angle:amplitude}],step=.001,k=5*9.81/(7*orbit);let angle=amplitude,velocity=-launchSpeed/orbit,t=0;
 while(angle>0){velocity-=k*Math.sin(angle)*step;angle+=velocity*step;t+=step;samples.push({t,angle:Math.max(0,angle)});}
 const quarter=t;
 function rollAt(time){const q=Math.floor(time/quarter)%4,u=(time%quarter)/quarter,f=q%2?1-u:u,index=Math.min(samples.length-2,Math.floor(f*(samples.length-1))),blend=f*(samples.length-1)-index;return (samples[index].angle*(1-blend)+samples[index+1].angle*blend)*(q===0||q===3?1:-1);}
 let time=0,drag=null,target=-.22;group.rotation.y=target;
 const canvas=s.renderer.domElement;canvas.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){target+=(e.clientX-drag.x)*.008;drag.x=e.clientX;}});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
 // Tangent launch and an ideal elastic impact on a visible angled return pad.
 const impactTime=.42,flight=impactTime*2,travel=quarter*2,halfCycle=travel+flight,duration=halfCycle*2;
 const vy=launchSpeed*Math.sin(amplitude),vz=launchSpeed*Math.cos(amplitude);
 for(const side of [-1,1]){
  const impact=new THREE.Vector3(0,base+R-orbit*Math.cos(amplitude)+vy*impactTime-4.905*impactTime**2,side*(orbit*Math.sin(amplitude)+vz*impactTime));
  const incoming=new THREE.Vector3(0,vy-9.81*impactTime,side*vz);
  const normal=incoming.clone().normalize().negate();
  const pad=add(new THREE.BoxGeometry(1.05,.13,.85),dark,0,0,0);
  pad.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
  pad.position.copy(impact).addScaledVector(normal,-ballRadius-.065);
  const supportHeight=Math.max(.1,pad.position.y-.15);
  add(new THREE.CylinderGeometry(.055,.075,supportHeight,16),metal,pad.position.x,supportHeight/2,pad.position.z);
  add(new THREE.BoxGeometry(1.15,.12,.95),wood,0,0,pad.position.z);
 }
 function animatedPose(time){
  const half=Math.floor(time/halfCycle),local=time%halfCycle;
  if(local<travel)return {angle:rollAt(local+half*travel),lift:0,outward:0,spin:0};
  const airborne=local-travel,sign=half===0?-1:1;
  // Reflection reverses the incident velocity at impact; gravity governs both legs.
  const tau=airborne<=impactTime?airborne:flight-airborne;
  return {angle:sign*amplitude,lift:vy*tau-4.905*tau*tau,outward:sign*vz*tau,spin:sign*launchSpeed*tau/ballRadius};
 }
 document.querySelector('.loop-counter small').textContent=` / ${duration.toFixed(1)} SEC`;
 s.update=dt=>{
  if(!isPaused())time=(time+dt)%duration;
  const pose=animatedPose(time),ballAngle=pose.angle;
  // Continuous swing: maximum speed at the center, natural reversal only at the ends.
  pivot.rotation.z=.82*Math.cos((time+flight/2)/duration*Math.PI*2);
  ball.position.set(0,base+R-orbit*Math.cos(ballAngle)+pose.lift,orbit*Math.sin(ballAngle)+pose.outward);
  ball.rotation.x=ballAngle*orbit/ballRadius+pose.spin;
  group.rotation.y+=(target-group.rotation.y)*.12;
  document.querySelector('#loop-time').textContent=time.toFixed(1).padStart(4,'0');document.querySelector('#relay-progress').style.width=time/duration*100+'%';
 };s.update(0);
}
