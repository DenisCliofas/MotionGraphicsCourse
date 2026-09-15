(() => {
 const button=document.querySelector('.fullscreen-toggle');
 const status=document.querySelector('.fullscreen-status');
 if(!button||!status)return;
 button.href=location.href;
 function sync(){
  const active=Boolean(document.fullscreenElement);
  const label=active?'Exit fullscreen':document.fullscreenEnabled?'Enter fullscreen':'Open course in a new tab';
  button.setAttribute('aria-label',label);button.title=label;
 }
 button.addEventListener('click',async event=>{
  button.href=location.href;
  if(!document.fullscreenEnabled)return; // Native new-tab link when the embed blocks fullscreen.
  event.preventDefault();status.textContent='';
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else await document.documentElement.requestFullscreen();
  }catch{
   status.replaceChildren(document.createTextNode('Fullscreen is unavailable here. '));
   const link=document.createElement('a');link.href=location.href;link.target='_blank';link.rel='noopener';link.textContent='Open course in a new tab ↗';status.append(link);
  }
 });
 document.addEventListener('fullscreenchange',sync);sync();
})();
