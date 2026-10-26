const COURSE_LABELS={sentences:"Построение предложений",present:"Present",past:"Past",future:"Future",perfect:"Perfect"};
const $course=(s,r=document)=>r.querySelector(s);
function saveTextLocal(key,value){try{localStorage.setItem(key,value)}catch(e){}}
function loadTextLocal(key){try{return localStorage.getItem(key)||""}catch(e){return""}}
async function recordQuiz(course,score,total,answers){
 const client=window.englishClient;const status=$course("#remoteStatus");
 if(!client){if(status)status.textContent="Результат сохранён локально. Чтобы учитель видел его, подключите Supabase и войдите в аккаунт.";return;}
 try{const {data:{user}}=await client.auth.getUser();if(!user){if(status)status.textContent="Результат сохранён локально. Войди через «Аккаунт ученика» и пройди контрольную ещё раз для отправки учителю.";return;}
  const {error}=await client.from("quiz_results").insert({student_id:user.id,section:course,score,total,percentage:Math.round(score/total*100),answers});
  if(error)throw error;
  const msg=$course("#remoteStatus");if(msg)msg.textContent="Результат сохранён в аккаунт и доступен преподавателю.";
 }catch(e){const msg=$course("#remoteStatus");if(msg)msg.textContent="Не удалось синхронизировать результат. Проверьте настройку базы данных."}
}
function renderCourseExam(){
 const host=$course("#courseExam");if(!host)return;
 const key=document.body.dataset.course;const qs=(window.ENGLISH_COURSE_QUESTIONS||{})[key]||[];
 host.innerHTML="";
 qs.forEach((q,i)=>{
  const card=document.createElement("article");card.className="content-card exam-question";card.dataset.index=String(i);
  const title=document.createElement("h3");title.textContent=(i+1)+". "+q.q;card.append(title);
  const opts=document.createElement("div");opts.className="options";
  q.o.forEach((v,j)=>{const b=document.createElement("button");b.type="button";b.textContent=v;b.dataset.option=String(j);b.addEventListener("click",()=>{if(card.dataset.graded)return;card.dataset.answer=String(j);opts.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));});opts.append(b)});
  card.append(opts);const fb=document.createElement("div");fb.className="feedback";card.append(fb);host.append(card);
 });
 const count=$course("#examCount");if(count)count.textContent=qs.length+" заданий";
 const check=$course("#checkExam"),result=$course("#examResult");
 if(check)check.addEventListener("click",async()=>{
  const cards=[...host.querySelectorAll(".exam-question")];
  const unanswered=cards.filter(card=>card.dataset.answer===undefined);
  if(unanswered.length){if(result)result.textContent="Нужно ответить на все задания. Осталось: "+unanswered.length+".";unanswered[0].scrollIntoView({behavior:"smooth",block:"center"});return;}
  let score=0;const answers=[];
  cards.forEach((card,i)=>{const q=qs[i],a=card.dataset.answer;
   const ok=Number(a)===q.a;if(ok)score++;answers.push(Number(a));
   card.dataset.graded="1";card.querySelectorAll("button").forEach(b=>{b.disabled=true;if(Number(b.dataset.option)===q.a)b.classList.add("correct")});
   const fb=card.querySelector(".feedback");fb.className="feedback "+(ok?"correct":"wrong");fb.textContent=(ok?"Верно. ":"Правильный ответ: "+q.o[q.a]+". ")+q.e;
  });
  if(result)result.textContent="Результат: "+score+" из "+qs.length+" ("+Math.round(score/qs.length*100)+"%). "+(score>=Math.ceil(qs.length*.8)?"Отличная работа!":"Повтори правила и попробуй ещё раз.");
  check.disabled=true;await recordQuiz(key,score,qs.length,answers);
  saveTextLocal("course_exam_"+key,JSON.stringify({score,total:qs.length,date:new Date().toISOString()}));
 });
}
function setupRetelling(){
 const box=$course("#retellText"),save=$course("#saveRetelling"),status=$course("#retellStatus");if(!box||!save)return;
 const key="course_retell_"+document.body.dataset.course;box.value=loadTextLocal(key);
 const counter=$course("#retellCounter");
 const sentenceCount=()=>box.value.trim()?box.value.trim().split(/[.!?]+/).filter(s=>s.trim()).length:0;
 const updateCounter=()=>{const n=sentenceCount();if(counter)counter.textContent=n+" из 5 предложений"+(n===5?" ✓":" — старайся написать ровно 5");};
 box.addEventListener("input",updateCounter);updateCounter();
 save.addEventListener("click",async()=>{
  const value=box.value.trim();saveTextLocal(key,value);
  if(!value){if(status)status.textContent="Сначала напиши пересказ.";return;}
  const n=sentenceCount();const prefix="Черновик сохранён ("+n+" предложений из 5). ";
  const client=window.englishClient;
  if(client){try{const {data:{user}}=await client.auth.getUser();if(user){const {error}=await client.from("writing_submissions").insert({student_id:user.id,section:document.body.dataset.course,kind:"retelling",prompt:"Пересказ текста в 5 предложениях; отправлено предложений: "+n,content:value});if(error)throw error;if(status)status.textContent=prefix+"Отправлено преподавателю.";return;}}catch(e){if(status)status.textContent=prefix+"Сохранено в этом браузере, синхронизация не выполнена.";return;}}
  if(status)status.textContent=prefix+"Сохранено в этом браузере. Для отправки преподавателю войди через «Аккаунт ученика».";
 });
}
document.addEventListener("DOMContentLoaded",()=>{renderCourseExam();setupRetelling();});
