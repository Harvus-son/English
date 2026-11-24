/* Shared light/dark theme for every English Lab page. */
(() => {
 const KEY="english-lab-theme";
 const read=()=>{try{return localStorage.getItem(KEY)==="light"?"light":"dark"}catch(_){return"dark"}};
 const apply=theme=>{
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  const btn=document.querySelector("[data-theme-toggle]");
  if(btn){btn.textContent=theme==="dark"?"☀ Светлая тема":"☾ Тёмная тема";btn.setAttribute("aria-label",theme==="dark"?"Включить светлую тему":"Включить тёмную тему");btn.setAttribute("aria-pressed",String(theme==="light"));}
 };
 const mount=()=>{
  const host=document.querySelector(".top-actions")||document.querySelector(".topbar");
  if(!host||document.querySelector("[data-theme-toggle]"))return;
  const btn=document.createElement("button");btn.type="button";btn.className="theme-toggle";btn.dataset.themeToggle="";
  btn.addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem(KEY,next)}catch(_){}apply(next)});
  host.append(btn);apply(read());
 };
 apply(read());
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();