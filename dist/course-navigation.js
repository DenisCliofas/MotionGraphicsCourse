(() => {
 const pages=[
  {file:'index.html',day:1,part:1,title:'Motion principles',de:'Bewegungsprinzipien'},
  {file:'foundation.html',day:1,part:2,title:'Blender foundations',de:'Blender-Grundlagen'},
  {file:'day2.html',day:2,part:1,title:'Ball animation',de:'Ballanimation'},
  {file:'day2-machines.html',day:2,part:2,title:'Dynamic Machines',de:'Dynamic Machines'}
 ];
 const current=pages.find(p=>p.file===location.pathname.split('/').pop())||pages[0];
 const actions=document.querySelector('.header-actions');if(!actions)return;
 const menu=document.createElement('details');menu.className='course-switcher';menu.setAttribute('translate','no');
 const summary=document.createElement('summary');summary.setAttribute('aria-label','Switch course day or part');menu.append(summary);
 const list=document.createElement('nav');list.className='course-menu';list.setAttribute('aria-label','Course days and parts');menu.append(list);
 actions.prepend(menu);
 const part=actions.querySelector('.part-link');
 function render(){
  const de=document.documentElement.lang==='de';const day=de?'Tag':'Day',partName=de?'Teil':'Part';
  summary.textContent=`${day} ${current.day} ▾`;summary.setAttribute('aria-label',de?'Kurstag oder Teil wechseln':'Switch course day or part');
  list.replaceChildren();
  for(const n of [1,2]){
   const group=document.createElement('div');group.className='course-day-group';const heading=document.createElement('strong');heading.textContent=`${day} ${n}`;group.append(heading);
   for(const p of pages.filter(p=>p.day===n)){
    const a=document.createElement('a');a.href=p.file+(de&&p.day===1?'?lang=de':'');a.innerHTML=`<span>${partName} ${p.part}</span><b>${de?p.de:p.title}</b>`;
    if(p===current)a.setAttribute('aria-current','page');group.append(a);
   }list.append(group);
  }
  if(part){const target=pages.find(p=>p.day===current.day&&p.part!==current.part);part.setAttribute('translate','no');part.href=target.file+(de&&target.day===1?'?lang=de':'');part.textContent=`${partName} ${target.part} ↗`;part.title=`${day} ${target.day} · ${partName} ${target.part}: ${de?target.de:target.title}`;}
 }
 render();new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;summary.focus();}});
})();
