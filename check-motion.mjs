import assert from 'node:assert/strict';
import {bezierAt,diagramAt,motionAt} from './dist/motion.js';
for(let i=0;i<=100;i++){
 const t=i/100;
 assert.ok(Math.abs(bezierAt(t,[1/3,1/3,2/3,2/3])-t)<1e-8,'Linear curve must have constant speed');
 assert.ok(Math.abs(bezierAt(t,[1/3,0,2/3,1])-(t*t*(3-2*t)))<1e-8,'Default handles must reproduce ease in/out');
 assert.ok(Math.abs(bezierAt(t,[.25,0,.75,1])+bezierAt(1-t,[.25,0,.75,1])-1)<1e-8,'Symmetric handles must give symmetric motion');
 for(const h of [[0,-.25,0,1.25],[1,1.25,1,-.25],[1,0,0,1]])assert.ok(Number.isFinite(bezierAt(t,h)),'Extreme valid handles must remain finite');
 for(const type of ['timing','easing','anticipation','overshoot','arcs','weight','squash','overlap','secondary'])for(const a of [0,.5,1]){
  const p=diagramAt(type,t,a);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.sx>0&&p.sy>0);
  if(type==='squash')assert.ok(Math.abs(p.sx*p.sy-1)<1e-10,'Squash must preserve diagram area');
 }
}
assert.ok(bezierAt(.1,[.3,-.25,.7,1])<0,'Negative start handle creates anticipation');
assert.ok(bezierAt(.9,[.3,0,.7,1.25])>1,'High end handle creates overshoot');
for(const mode of ['linear','ease','anticipation','overshoot','heavy','playful']){assert.ok(Math.abs(motionAt(mode,0))<1e-9);assert.ok(Math.abs(motionAt(mode,1)-1)<1e-9);}
console.log('PASS: Bézier inversion, symmetry, extreme handles, anticipation/overshoot, squash area and preset endpoints.');
