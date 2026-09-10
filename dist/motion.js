export const clamp = (v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const smooth=t=>t*t*(3-2*t);
export function motionAt(mode,time){const t=clamp(time);switch(mode){case 'linear':return t;case 'ease':return smooth(t);case 'anticipation':return t<.2?-.08*Math.sin(t/.2*Math.PI):smooth((t-.2)/.8);case 'overshoot':{const x=t-1;return 1+2.4*x*x*x+1.4*x*x;}case 'heavy':return t<.9?Math.pow(t/.9,2.4):1;case 'playful':{const x=t-1;return 1+3.3*x*x*x+2.3*x*x;}default:return smooth(t);}}
