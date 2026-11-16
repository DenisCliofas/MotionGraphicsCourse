import * as THREE from './assets/three.module.js';
// Analytic sphere/ground ray tracer. Two specular bounces, deterministic area-light
// shadow samples. No accumulation: interaction remains immediate.
export function createBallRayTracer(renderer,camera,ball){
 const uniforms={cameraWorld:{value:new THREE.Matrix4()},projectionInverse:{value:new THREE.Matrix4()},center:{value:new THREE.Vector3()},inverseBall:{value:new THREE.Matrix3()},resolution:{value:new THREE.Vector2()}};
 const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,vertexShader:`varying vec2 uvScreen;void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
 precision highp float;
 varying vec2 uvScreen;
 uniform mat4 cameraWorld,projectionInverse;
 uniform mat3 inverseBall;
 uniform vec3 center;
 uniform vec2 resolution;
 const float R=.75;
 float sphere(vec3 o,vec3 d){vec3 p=o-center;float b=dot(p,d),c=dot(p,p)-R*R,h=b*b-c;if(h<0.)return -1.;float t=-b-sqrt(h);return t>.001?t:-1.;}
 vec3 studio(vec3 d){
  vec3 c=mix(vec3(.12,.17,.24),vec3(.55,.49,.39),smoothstep(-.3,.8,d.y));
  float key=pow(max(0.,dot(d,normalize(vec3(-3.,7.,4.)))),85.);
  float rim=pow(max(0.,dot(d,normalize(vec3(4.,5.,-3.)))),120.);
  return c+vec3(5.,3.9,2.7)*key+vec3(2.5,3.8,5.5)*rim;
 }
 vec3 pigment(vec3 n){vec3 local=inverseBall*n;float a=mod(atan(local.z,local.x)+6.2831853,6.2831853);float i=floor(a/1.04719755);
 if(i<1.)return vec3(.85,.035,.02);if(i<2.)return vec3(.95,.64,.025);if(i<3.)return vec3(.025,.12,.8);if(i<4.)return vec3(.95,.19,.02);if(i<5.)return vec3(.88);return vec3(.025,.55,.065);}
 vec3 light(vec3 p,vec3 n,vec3 view,vec3 base,vec3 location,vec3 tint,float size,bool glossy){
 vec3 sum=vec3(0.);
 for(int i=0;i<8;i++){float angle=float(i)*2.399963;float radius=sqrt((float(i)+.5)/8.)*size;vec3 lp=location+vec3(cos(angle)*radius,0.,sin(angle)*radius);vec3 delta=lp-p;float dist=length(delta);vec3 l=delta/dist;float hit=sphere(p+n*.003,l);float visibility=(hit>0.&&hit<dist)?0.:1.;
 float diffuse=max(0.,dot(n,l));vec3 halfV=normalize(l+view);float spec=glossy?pow(max(0.,dot(n,halfV)),100.)*1.7:0.;sum+=(base*diffuse+spec)*tint*visibility;}
 return sum/8.;
 }
 void main(){
 vec2 ndc=uvScreen*2.-1.;vec4 q=projectionInverse*vec4(ndc,1.,1.);vec3 direction=normalize((cameraWorld*vec4(normalize(q.xyz/q.w),0.)).xyz);vec3 origin=cameraWorld[3].xyz;
 vec3 color=vec3(0.),weight=vec3(1.);
 for(int bounce=0;bounce<3;bounce++){
 float ts=sphere(origin,direction),tp=direction.y<-.00001?-origin.y/direction.y:-1.;bool isBall=ts>0.&&(tp<0.||ts<tp);float t=isBall?ts:tp;
 if(t<0.){color+=weight*studio(direction);break;}
 vec3 p=origin+direction*t,n=isBall?normalize(p-center):vec3(0.,1.,0.);vec3 base=isBall?pigment(n):vec3(.32,.29,.25);
 float ambient=isBall?.25:mix(.24,.5,smoothstep(0.,4.,length(p.xz-center.xz)));
 vec3 direct=base*ambient;
 direct+=light(p,n,-direction,base,vec3(-3.,7.,4.),vec3(1.7,1.35,.98),2.,isBall);
 direct+=light(p,n,-direction,base,vec3(4.,5.,-3.),vec3(.55,.85,1.3),1.5,isBall);
 float fresnel=.045+.955*pow(1.-max(0.,dot(n,-direction)),5.);
 float reflectance=isBall?min(.65,fresnel):.10;
 color+=weight*direct*(1.-reflectance);weight*=reflectance;
 origin=p+n*.004;direction=reflect(direction,n);
 }
 // Filmic output with a gentle vignette.
 color*=1.-.12*dot(uvScreen-.5,uvScreen-.5);
 color=clamp((color*(2.51*color+.03))/(color*(2.43*color+.59)+.14),0.,1.);
 gl_FragColor=vec4(pow(color,vec3(1./2.2)),1.);
 }`});
 const scene=new THREE.Scene();scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));const screenCamera=new THREE.Camera();
 return ()=>{camera.updateMatrixWorld();ball.updateMatrixWorld();uniforms.cameraWorld.value.copy(camera.matrixWorld);uniforms.projectionInverse.value.copy(camera.projectionMatrixInverse);ball.getWorldPosition(uniforms.center.value);uniforms.inverseBall.value.setFromMatrix4(ball.matrixWorld).invert();renderer.getDrawingBufferSize(uniforms.resolution.value);renderer.render(scene,screenCamera);};
}
