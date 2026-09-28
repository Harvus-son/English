const $=s=>document.querySelector(s);
const $$=(s,r=document)=>r.querySelectorAll(s);
const state={xp:Number(localStorage.getItem("english_xp")||0),practice:Number(localStorage.getItem("english_practice")||0)};
const titles={lesson:"Present Simple",practice:"Практика",selfwork:"Самостоятельная работа",progress:"Прогресс"};

$$(".nav").forEach(btn=>btn.addEventListener("click",()=>show(btn.dataset.view)));
$$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>show(btn.dataset.go)));

function show(view){
  $$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  $$(".view").forEach(x=>x.classList.toggle("active",x.id===view+"View"));
  $("#pageTitle").textContent=titles[view];
  window.scrollTo({top:0,behavior:"smooth"});
}
function save(){
  localStorage.setItem("english_xp",state.xp);
  localStorage.setItem("english_practice",state.practice);
  updateProgress();
}
function updateProgress(){
  $("#score").textContent=state.xp;
  $("#progressXp").textContent=state.xp;
  $("#practiceResult").textContent=state.practice+" / 5";
  const percent=Math.min(100,Math.round((state.practice/5)*100));
  $("#progressBar").style.width=percent+"%";
  $("#sideProgress").style.width=percent+"%";
  $("#sideProgressText").textContent=percent+"% завершено";
}
function toast(msg){
  $("#toast").textContent=msg;
  $("#toast").classList.add("show");
  setTimeout(()=>$("#toast").classList.remove("show"),2200);
}
const tasks=[
 {type:"choice",q:"Choose the correct sentence:",options:["She play games every day.","She plays games every day.","She does plays games every day."],answer:1,explain:"He / She / It → глагол получает -s."},
 {type:"choice",q:"Choose the correct negative sentence:",options:["He don't like music.","He doesn't likes music.","He doesn't like music."],answer:2,explain:"После doesn't используется обычная форма глагола: like."},
 {type:"choice",q:"Complete: ___ you work on Monday?",options:["Does","Do","Are"],answer:1,explain:"С I / you / we / they используем Do."},
 {type:"choice",q:"Complete: ___ she play Roblox?",options:["Do","Does","Is"],answer:1,explain:"С he / she / it используем Does."},
 {type:"input",q:"Translate: «Я обычно играю в игры вечером.»",answer:"I usually play games in the evening.",accept:["i usually play games in the evening","i usually play games in evening"]}
];

function renderPractice(){
  $("#practiceTasks").innerHTML=tasks.map(function(t,i){
    if(t.type==="choice"){
      return '<article class="practice-card" data-task="'+i+'"><span class="task-number">0'+(i+1)+'</span><h3>'+t.q+'</h3><div class="options">'+t.options.map(function(o,j){return '<button data-option="'+j+'">'+o+'</button>';}).join("")+'</div><div class="feedback"></div></article>';
    }
    return '<article class="practice-card" data-task="'+i+'"><span class="task-number">05</span><h3>'+t.q+'</h3><div class="input-row"><input placeholder="Type your answer..."><button data-check>Check</button></div><div class="feedback"></div></article>';
  }).join("");
  $$(".practice-card").forEach(function(card){
    const i=Number(card.dataset.task),t=tasks[i];
    if(t.type==="choice"){
      $$(".options button",card).forEach(function(btn){btn.addEventListener("click",function(){checkChoice(card,i,Number(btn.dataset.option));});});
    }else{
      card.querySelector("[data-check]").addEventListener("click",function(){checkInput(card,i);});
    }
  });
}
function mark(card,ok,message){
  const f=card.querySelector(".feedback");
  f.className="feedback "+(ok?"correct":"wrong");
  f.innerHTML=(ok?"✓ Correct! ":"✗ Try again. ")+message;
  if(ok&&!card.dataset.done){
    card.dataset.done="1";
    state.practice++;
    state.xp+=10;
    save();
  }
}
function checkChoice(card,i,n){
  const ok=n===tasks[i].answer;
  $$(".options button",card).forEach(function(b){b.disabled=true;});
  mark(card,ok,tasks[i].explain);
}
function checkInput(card,i){
  const value=card.querySelector("input").value.trim().toLowerCase().replace(/[.!?]/g,"");
  const ok=tasks[i].accept.some(function(a){return a===value;});
  mark(card,ok,"Правильный вариант: "+tasks[i].answer);
}
$("#finishPractice").addEventListener("click",function(){updateProgress();show("progress");toast("Практика завершена. Результат сохранён.");});
$("#showAnswers").addEventListener("click",function(){
  $("#answers").classList.toggle("hidden");
  $("#answers").innerHTML="<b>Ответы:</b><br>1. She plays games every day.<br>2. He doesn't like football.<br>3. Does she like music?<br>4. They play Roblox.";
});
renderPractice();
updateProgress();