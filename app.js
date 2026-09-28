const $=s=>document.querySelector(s);
const $$=(s,r=document)=>r.querySelectorAll(s);
const KEY_XP="english_xp";
const KEY_PRACTICE="english_practice";
const KEY_WRITING="english_writing";
const state={xp:Number(localStorage.getItem(KEY_XP)||0),practice:Number(localStorage.getItem(KEY_PRACTICE)||0)};
const titles={lesson:"Present Simple",practice:"Практика",selfwork:"Самостоятельная работа",progress:"Прогресс"};

$$(".nav").forEach(btn=>btn.addEventListener("click",()=>show(btn.dataset.view)));
$$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>show(btn.dataset.go)));

function show(view){
  $$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  $$(".view").forEach(x=>x.classList.toggle("active",x.id===view+"View"));
  $("#pageTitle").textContent=titles[view]||"English Lab";
  window.scrollTo({top:0,behavior:"smooth"});
}
function save(){
  localStorage.setItem(KEY_XP,String(state.xp));
  localStorage.setItem(KEY_PRACTICE,String(state.practice));
  updateProgress();
}
function updateProgress(){
  $("#score").textContent=state.xp;
  $("#progressXp").textContent=state.xp;
  $("#practiceResult").textContent=state.practice+" / "+tasks.length;
  const percent=Math.min(100,Math.round((state.practice/tasks.length)*100));
  $("#progressBar").style.width=percent+"%";
  $("#sideProgress").style.width=percent+"%";
  $("#sideProgressText").textContent=percent+"% практики";
}
function toast(msg){
  const el=$("#toast");
  el.textContent=msg;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>el.classList.remove("show"),2200);
}

const tasks=[
 {type:"choice",q:"Choose the correct sentence:",options:["She play games every day.","She plays games every day.","She does plays games every day."],answer:1,explain:"С He / She / It в утвердительном предложении: play → plays."},
 {type:"choice",q:"Choose the correct negative sentence:",options:["He don't like music.","He doesn't likes music.","He doesn't like music."],answer:2,explain:"После doesn't используется обычная форма глагола: like."},
 {type:"choice",q:"Complete: ___ you work on Monday?",options:["Does","Do","Are"],answer:1,explain:"С you используем Do."},
 {type:"choice",q:"Complete: ___ she play Roblox?",options:["Do","Does","Is"],answer:1,explain:"С she используем Does."},
 {type:"choice",q:"Choose the correct spelling:",options:["He watchs videos.","He watches videos.","He watch video."],answer:1,explain:"После -ch добавляем -es: watch → watches."},
 {type:"choice",q:"Choose the correct sentence:",options:["My brother study English.","My brother studies English.","My brother studys English."],answer:1,explain:"Согласная + y меняется на ies: study → studies."},
 {type:"choice",q:"Read: “Alex wakes up at seven.” What time does Alex wake up?",options:["At six.","At seven.","At eleven."],answer:1,explain:"В тексте сказано: Alex wakes up at seven o'clock."},
 {type:"input",q:"Translate: «Я обычно играю в игры вечером.»",answer:"I usually play games in the evening.",accept:["i usually play games in the evening","i usually play games in evening"]}
];

function renderPractice(){
  $("#practiceTasks").innerHTML=tasks.map((t,i)=>{
    const number=String(i+1).padStart(2,"0");
    if(t.type==="choice"){
      return '<article class="practice-card" data-task="'+i+'"><span class="task-number">'+number+'</span><h3>'+t.q+'</h3><div class="options">'+t.options.map((o,j)=>'<button data-option="'+j+'">'+o+'</button>').join("")+'</div><div class="feedback"></div></article>';
    }
    return '<article class="practice-card" data-task="'+i+'"><span class="task-number">'+number+'</span><h3>'+t.q+'</h3><div class="input-row"><input autocomplete="off" placeholder="Type your answer..."><button data-check>Check</button></div><div class="feedback"></div></article>';
  }).join("");

  $$(".practice-card").forEach(card=>{
    const i=Number(card.dataset.task);
    const t=tasks[i];
    if(t.type==="choice"){
      $$(".options button",card).forEach(btn=>btn.addEventListener("click",()=>checkChoice(card,i,Number(btn.dataset.option))));
    }else{
      card.querySelector("[data-check]").addEventListener("click",()=>checkInput(card,i));
      card.querySelector("input").addEventListener("keydown",e=>{if(e.key==="Enter")checkInput(card,i);});
    }
  });
}
function mark(card,ok,message){
  const f=card.querySelector(".feedback");
  f.className="feedback "+(ok?"correct":"wrong");
  f.innerHTML=(ok?"✓ Correct! ":"✗ Пока неверно. ")+message;
  if(ok&&!card.dataset.done){
    card.dataset.done="1";
    state.practice++;
    state.xp+=10;
    save();
  }
}
function checkChoice(card,i,n){
  if(card.dataset.done)return;
  const ok=n===tasks[i].answer;
  if(ok){
    $$(".options button",card).forEach(b=>b.disabled=true);
    mark(card,true,tasks[i].explain);
  }else{
    mark(card,false,tasks[i].explain+" Попробуй другой вариант.");
  }
}
function normalize(value){
  return value.trim().toLowerCase().replace(/[.!?]+$/,"").replace(/\s+/g," ");
}
function checkInput(card,i){
  if(card.dataset.done)return;
  const value=normalize(card.querySelector("input").value);
  const ok=tasks[i].accept.some(a=>normalize(a)===value);
  mark(card,ok,ok?"Отлично.":"Ожидаемый вариант: "+tasks[i].answer);
  if(ok)card.querySelector("input").disabled=true;
}
$("#finishPractice").addEventListener("click",()=>{
  const remaining=tasks.length-state.practice;
  if(remaining>0){
    show("progress");
    toast("Практика завершена. Правильных ответов: "+state.practice+" из "+tasks.length+".");
  }else{
    show("progress");
    toast("Отлично! Практика выполнена полностью.");
  }
});
$("#saveWriting").addEventListener("click",()=>{
  const value=$("#writingTask").value.trim();
  if(value.length<20){
    $("#writingStatus").textContent="Напиши хотя бы несколько предложений.";
    return;
  }
  localStorage.setItem(KEY_WRITING,value);
  $("#writingStatus").textContent="✓ Ответ сохранён";
  toast("Письменная работа сохранена.");
});
$("#showAnswers").addEventListener("click",()=>{
  const panel=$("#answers");
  panel.classList.toggle("hidden");
  panel.innerHTML="<b>Ответы:</b><br>1. She plays games every day.<br>2. He doesn't like football.<br>3. Do you work on Monday?<br>4. Does she like music?<br>5. He watches videos.<br>6. My brother studies English.";
});
const savedWriting=localStorage.getItem(KEY_WRITING);
if(savedWriting)$("#writingTask").value=savedWriting;
renderPractice();
updateProgress();