import {diagramAt,clamp} from './motion.js?v=f7b449157b5e';

export function initLearning({observe,register,isPaused,resume}){
 for(const experiment of document.querySelectorAll('.mini-experiment')){
  if(experiment.dataset.experiment==='arcs'){initArc(experiment);continue;}
  const canvas=experiment.querySelector('canvas'),ctx=canvas.getContext('2d');
  const slider=experiment.querySelector('input'),output=experiment.querySelector('output');
  const button=experiment.querySelector('.mini-pause'),kind=experiment.dataset.experiment;
  let time=.4,stopped=false,amount=Number(slider.value),width=720,height=210;
  const resize=()=>{width=Math.max(260,canvas.clientWidth||720);height=Math.max(160,Math.min(230,width*.3));const dpr=Math.min(devicePixelRatio,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
  new ResizeObserver(resize).observe(canvas);resize();
  const setValue=()=>{amount=Number(slider.value);output.value=slider.dataset.unit==='s'?amount.toFixed(1)+' s':Math.round(amount*100)+'%';};
  slider.addEventListener('input',setValue);setValue();
  button.addEventListener('click',()=>{if(stopped||isPaused()){stopped=false;resume();}else stopped=true;});
  const dot=(x,y,r,color,sx=1,sy=1)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,r*sx,r*sy,0,0,Math.PI*2);ctx.fill();};
  const draw=dt=>{
   if(!experiment.open)return;
   if(!isPaused()&&!stopped)time=(time+dt)%(kind==='easing'?4:(kind==='timing'?amount:2)+.6);
   button.textContent=stopped||isPaused()?'Play':'Pause';button.setAttribute('aria-pressed',String(stopped||isPaused()));
   const duration=kind==='timing'?amount:2,phase=time/duration,t=kind==='easing'?clamp(phase<=1?phase:2-phase):clamp(phase);
   ctx.clearRect(0,0,width,height);
   const left=width*.15,right=width*.85,ground=height*.78,lift=height*.5;
   ctx.strokeStyle='#dedede';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,ground);ctx.lineTo(right,ground);ctx.stroke();
   ctx.font='13px Arial';ctx.fillStyle='#626262';ctx.fillText('A',left-5,ground+24);ctx.fillText('B',right-5,ground+24);
   if(kind==='appeal'){
    ctx.clearRect(0,0,width,height);
    const phase=isPaused()||stopped?0:Math.sin(t*Math.PI*2)*3;
    for(let i=0;i<5;i++){const centered=(i-2)*width*.07,spaced=(i-2)*width*.15;const x=width/2+centered*(1-amount)+spaced*amount;const main=i===2;dot(x,height*.52+(main?phase:phase*(1-amount)),main?19+amount*8:19-amount*7,main?'#ff5a3d':amount>.35?'#9b9b9b':'#f17862');}
    return;
   }
   if(kind==='timing'||kind==='easing')for(let i=0;i<=Math.floor(duration/.1);i++){const p=diagramAt(kind,i*.1/duration,amount);dot(left+(right-left)*p.x,ground-16,3,'#c4c4c4');}
   const count=kind==='overlap'||kind==='secondary'?2:1;
   for(let i=count-1;i>=0;i--){const p=diagramAt(kind,t,amount,i);let y=ground-16*p.sy-p.y*lift;
    if(count===2)y-=i*35;
    dot(left+(right-left)*p.x,y,i?10:16,i?'#888888':'#ff5a3d',p.sx,p.sy);
   }
  };
  observe(canvas);register({host:canvas,update:draw,renderer:{render(){}},scene:null,camera:null});
 }
 function initArc(experiment){
  const svg=experiment.querySelector('svg'),path=svg.querySelector('.arc-path'),guides=svg.querySelector('.arc-guides'),ball=svg.querySelector('.arc-ball'),handles=[...svg.querySelectorAll('.arc-handle')],button=experiment.querySelector('.mini-pause');
  let points=[[230,45],[490,45]],time=0,stopped=false,dragging=null;
  const paint=()=>{
   path.setAttribute('d',`M70 240 C${points[0]} ${points[1]} 650 240`);
   guides.setAttribute('d',`M70 240L${points[0]}M650 240L${points[1]}`);
   handles.forEach((handle,i)=>{handle.setAttribute('transform',`translate(${points[i]})`);handle.setAttribute('aria-label',`${i?'Second':'First'} path handle: horizontal ${Math.round(points[i][0]/720*100)}%, height ${Math.round((300-points[i][1])/300*100)}%. Drag or use arrow keys.`);});
   const t=clamp(time/2),u=1-t;
   ball.setAttribute('cx',u**3*70+3*u*u*t*points[0][0]+3*u*t*t*points[1][0]+t**3*650);
   ball.setAttribute('cy',u**3*240+3*u*u*t*points[0][1]+3*u*t*t*points[1][1]+t**3*240);
  };
  const move=(i,x,y)=>{points[i]=[clamp(x,30,690),clamp(y,30,260)];paint();};
  handles.forEach((handle,i)=>{
   handle.addEventListener('pointerdown',event=>{if(dragging!==null)return;event.preventDefault();dragging={i,id:event.pointerId};handle.focus();svg.setPointerCapture(event.pointerId);});
   handle.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const step=event.shiftKey?20:5;move(i,points[i][0]+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),points[i][1]+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0));});
  });
  svg.addEventListener('pointermove',event=>{if(!dragging||event.pointerId!==dragging.id)return;const matrix=svg.getScreenCTM();if(!matrix)return;const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const local=p.matrixTransform(matrix.inverse());move(dragging.i,local.x,local.y);});
  const end=event=>{if(dragging&&event.pointerId===dragging.id)dragging=null;};
  for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(name,end);
  experiment.querySelector('.arc-reset').addEventListener('click',()=>{points=[[230,45],[490,45]];paint();});
  button.addEventListener('click',()=>{if(stopped||isPaused()){stopped=false;resume();}else stopped=true;});
  paint();observe(svg);register({host:svg,update:dt=>{if(!experiment.open)return;if(!isPaused()&&!stopped)time=(time+dt)%2.6;button.textContent=stopped||isPaused()?'Play':'Pause';button.setAttribute('aria-pressed',String(stopped||isPaused()));paint();},renderer:{render(){}},scene:null,camera:null});
 }
 for(const widget of document.querySelectorAll('.prediction')){
  const section=widget.closest('section'),start=widget.querySelector('.prediction-start');
  const panel=widget.querySelector('.prediction-question'),feedback=widget.querySelector('.prediction-feedback');
  const secrets=[...section.querySelectorAll('.comparison-title,.comparison-description,.prompt')];
  const videos=[...section.querySelectorAll('video')],originalLabels=videos.map(v=>v.getAttribute('aria-label'));
  function blind(value){section.classList.toggle('prediction-blind',value);secrets.forEach(el=>{el.inert=value;el.setAttribute('aria-hidden',String(value));});videos.forEach((v,i)=>v.setAttribute('aria-label',value?`Example ${i===0?'A':'B'}`:originalLabels[i]));}
  start.addEventListener('click',()=>{const opening=panel.hidden;panel.hidden=!opening;start.setAttribute('aria-expanded',String(opening));start.textContent=opening?'Close prediction':'Try a prediction';feedback.textContent='';blind(opening);widget.querySelectorAll('[data-choice]').forEach(b=>b.disabled=false);});
  function reveal(choice){blind(false);let intro='';if(choice!==undefined)intro=Number(choice)===Number(widget.dataset.answer)?'Yes. ':'Look again. ';feedback.textContent=intro+widget.dataset.explanation;widget.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);}
  widget.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>reveal(b.dataset.choice)));
  widget.querySelector('.prediction-reveal').addEventListener('click',()=>reveal());
 }
}
