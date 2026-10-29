'use strict';
const evPaths = {
 inicio:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
 conhecimento:'M12 5v16M3 4h5l4 2 4-2h5v15h-5l-4 2-4-2H3Z',
 missoes:'m5 7 2 2 4-4M13 7h7M5 15l2 2 4-4M13 15h7',
 conquistas:'M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5m-5 3h10m-8-3h6',
 jogos:'M7 7h10l4 11-3 2-4-4h-4l-4 4-3-2ZM6 11h4m-2-2v4m7-2h.01m3 2h.01',
 perfil:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
 sobre:'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 criador:'m4 16 12-12 4 4-12 12-5 1Zm10-10 4 4',
 menu:'M4 6h16M4 12h16M4 18h16',
 sugestao:'M4 4h16v12H9l-5 4ZM8 8h8m-8 4h5'
};
function evIcon(name){return `<svg class="ev-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${evPaths[name]||evPaths.conhecimento}"/></svg>`;}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.ev-nav-item,.ev-nav-mobile-item').forEach(el=>{
  const label=el.textContent.trim().replace(/^[^\p{L}]+/u,'');
  const icon=el.querySelector('.ev-nav-ico,.ev-nav-mobile-ico');
  if(icon)icon.innerHTML=evIcon(el.dataset.secao||'criador');
  el.setAttribute('aria-label',label);el.title=label;
  for(const n of [...el.childNodes])if(n.nodeType===3&&n.textContent.trim()){const span=document.createElement('span');span.className='ev-nav-text';span.textContent=n.textContent;n.replaceWith(span);}
 });
 const toggle=document.getElementById('menu-toggle');
 if(toggle){
  let collapsed=false;try{collapsed=localStorage.getItem('evlurn.menu')==='compact';}catch{}
  const update=()=>{document.body.classList.toggle('menu-compact',collapsed);toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'Expandir menu':'Recolher menu');toggle.innerHTML=evIcon('menu');};
  toggle.addEventListener('click',()=>{collapsed=!collapsed;try{localStorage.setItem('evlurn.menu',collapsed?'compact':'expanded');}catch{}update();});update();
 }
 document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=evIcon(el.dataset.icon));
});
