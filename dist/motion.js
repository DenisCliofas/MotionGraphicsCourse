export const clamp = (v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const smooth=t=>t*t*(3-2*t);
const cubic=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
// Solve x(u)=time before evaluating y(u); using time as u gives the wrong speed.
export function bezierAt(time,handles=[.3,0,.7,1]){
 const t=clamp(time);if(t===0||t===1)return t;
 let lo=0,hi=1;
 for(let i=0;i<30;i++){const u=(lo+hi)/2;if(cubic(u,handles[0],handles[2])<t)lo=u;else hi=u;}
 return cubic((lo+hi)/2,handles[1],handles[3]);
}
export function diagramAt(kind,t,amount,index=0){
 t=clamp(t);let x=smooth(t),y=0,sx=1,sy=1;
 if(kind==='timing')x=t;
 if(kind==='easing')x=t*(1-amount)+smooth(t)*amount;
 if(kind==='anticipation')x=t<.2?-amount*.15*Math.sin(t/.2*Math.PI):smooth((t-.2)/.8);
 if(kind==='overshoot'){const q=t-1;const a=amount*3;x=1+(a+1)*q*q*q+a*q*q;}
 if(kind==='arcs')y=Math.sin(t*Math.PI)*amount;
 if(kind==='weight'||kind==='squash'){
  x=.5;const impact=.45;
  y=t<impact?1-(t/impact)**2:amount*Math.abs(Math.sin((t-impact)/(1-impact)*Math.PI*2))*Math.exp(-(t-impact)*4);
  if(kind==='squash'){
   y=t<impact?1-(t/impact)**2:.65*Math.abs(Math.sin((t-impact)/(1-impact)*Math.PI*2))*Math.exp(-(t-impact)*4);
   const compression=Math.exp(-(((t-impact)/.045)**2));
   sy=1+amount*.4*Math.sin(Math.PI*Math.min(t/impact,1))-amount*.5*compression;sx=1/sy;
  }
 }
 if(kind==='overlap'){
  const u=clamp((t-index*amount*.65)/.65);const q=u-1;
  x=1+2.2*q*q*q+1.2*q*q;
 }
 if(kind==='secondary'){
  x=.5;y=index===0?Math.sin(Math.PI*t)*.8:amount*Math.sin(Math.PI*clamp((t-.12)/.88))*.8;
 }
 return {x,y,sx,sy};
}
export function motionAt(mode,time){const t=clamp(time);switch(mode){case 'linear':return t;case 'ease':return smooth(t);case 'anticipation':return t<.2?-.08*Math.sin(t/.2*Math.PI):smooth((t-.2)/.8);case 'overshoot':{const x=t-1;return 1+2.4*x*x*x+1.4*x*x;}case 'heavy':return t<.9?Math.pow(t/.9,2.4):1;case 'playful':{const x=t-1;return 1+3.3*x*x*x+2.3*x*x;}default:return smooth(t);}}
