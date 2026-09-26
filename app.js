const $=s=>document.querySelector(s);
let current=null;
const views={search:"Search GitHub users",profile:"User profile",analytics:"Statistics",settings:"Settings"};

document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  show(btn.dataset.view);
}));

function show(view){
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
  $("#"+view+"View").classList.add("active");
  $("#pageTitle").textContent=views[view];
  if(view==="analytics"&&current) renderAnalytics(current);
  if(view==="profile"&&current) renderProfile(current);
}

function toast(msg){
  const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);
}

$("#searchForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const q=$("#searchInput").value.trim();
  if(q.length<2)return toast("Enter at least 2 characters");
  $("#results").innerHTML='<div class="panel empty">Searching GitHub...</div>';
  try{
    const r=await fetch("/api/users/search?q="+encodeURIComponent(q));
    const data=await r.json();if(!r.ok)throw new Error(data.error);
    $("#searchMeta").textContent=data.total+" public users found";
    $("#results").innerHTML=data.users.map(u=>`<article class="user-card" onclick="loadUser('${u.login}')"><div class="user-head"><img class="avatar" src="${u.avatar_url}" alt=""><div><h3>${escapeHtml(u.login)}</h3><span class="muted">GitHub user</span></div></div><span class="tag">Open profile →</span></article>`).join("")||'<div class="panel empty">No users found.</div>';
  }catch(err){$("#results").innerHTML='<div class="panel empty">'+escapeHtml(err.message)+'</div>'}
});

async function loadUser(login){
  $("#profile").innerHTML='<div class="panel empty">Loading profile...</div>';
  show("profile");
  try{
    const r=await fetch("/api/users/"+encodeURIComponent(login));const data=await r.json();if(!r.ok)throw new Error(data.error);
    current=data;renderProfile(data);renderAnalytics(data);
  }catch(err){$("#profile").innerHTML='<div class="panel empty">'+escapeHtml(err.message)+'</div>'}
}

function renderProfile(d){
 const u=d.user,c=d.custom||{};
 $("#profile").innerHTML=`
 <div class="profile-head"><img class="avatar" src="${u.avatar_url}" alt="${escapeHtml(u.login)}"><div><span class="eyebrow">GITHUB PROFILE</span><h2>${escapeHtml(u.name||u.login)}</h2><div>@${escapeHtml(u.login)}</div><p>${escapeHtml(c.bio||u.bio||"No public bio.")}</p></div><div class="profile-actions"><button class="ghost" onclick="editProfile()">Edit profile</button><button class="ghost" onclick="window.open('${u.html_url}','_blank')">GitHub ↗</button></div></div>
 <div class="stats"><div class="stat"><span>Repositories</span><b>${d.stats.repositories}</b></div><div class="stat"><span>Followers</span><b>${d.stats.followers}</b></div><div class="stat"><span>Following</span><b>${d.stats.following}</b></div><div class="stat"><span>Total stars</span><b>${d.stats.stars}</b></div></div>
 <div class="two-col"><div class="panel"><h3>Repositories</h3>${d.repositories.map(r=>`<div class="repo"><a href="${r.html_url}" target="_blank">${escapeHtml(r.name)}</a><p class="muted">${escapeHtml(r.description||"No description")}</p><div class="repo-meta">★ ${r.stargazers_count} · Forks ${r.forks_count} · ${r.language||"Unknown"}</div></div>`).join("")}</div>
 <div class="panel"><h3>Public information</h3><p><b>Location</b><br>${escapeHtml(c.location||u.location||"Not specified")}</p><p><b>Website</b><br>${u.blog?'<a href="'+u.blog+'" target="_blank">'+escapeHtml(u.blog)+'</a>':"Not specified"}</p><p><b>Joined</b><br>${new Date(u.created_at).toLocaleDateString()}</p><p><b>Public gists</b><br>${d.stats.gists}</p><p><b>Custom notes</b><br>${escapeHtml(c.notes||"No notes yet.")}</p></div></div>`;
}

function renderAnalytics(d){
 const langs=Object.entries(d.stats.languages).sort((a,b)=>b[1]-a[1]);const max=langs[0]?.[1]||1;
 $("#analytics").innerHTML=`<div class="stats"><div class="stat"><span>Stars</span><b>${d.stats.stars}</b></div><div class="stat"><span>Forks</span><b>${d.stats.forks}</b></div><div class="stat"><span>Gists</span><b>${d.stats.gists}</b></div><div class="stat"><span>Repos analyzed</span><b>${d.repositories.length}</b></div></div><div class="two-col"><div class="panel"><h3>Languages across public repositories</h3><div class="bars">${langs.length?langs.map(([name,count])=>`<div class="bar-row"><b>${escapeHtml(name)}</b><div class="bar"><i style="width:${count/max*100}%"></i></div><span>${count}</span></div>`).join(""):"<span class='muted'>No language data.</span>"}</div></div><div class="panel"><h3>Activity</h3>${d.events.map(e=>`<div class="repo-meta" style="margin:12px 0"><b>${escapeHtml(e.type)}</b><br>${escapeHtml(e.repo?.name||"GitHub")} · ${new Date(e.created_at).toLocaleString()}</div>`).join("")||"No public activity returned."}</div></div>`;
}

function editProfile(){
 const u=current.user,c=current.custom||{};
 $("#profile").innerHTML=`<div class="panel narrow"><span class="eyebrow">EDITOR</span><h2>Edit custom profile</h2><p class="muted">These fields are your application's data; GitHub's original profile is not modified.</p><form class="form" id="editForm"><label>Bio<textarea name="bio">${escapeHtml(c.bio||u.bio||"")}</textarea></label><label>Location<input name="location" value="${escapeAttr(c.location||u.location||"")}"></label><label>Website<input name="website" value="${escapeAttr(c.website||u.blog||"")}"></label><label>Notes<textarea name="notes">${escapeHtml(c.notes||"")}</textarea></label><button class="primary">Save changes</button></form></div>`;
 $("#editForm").addEventListener("submit",saveProfile);
}

async function saveProfile(e){
 e.preventDefault();const form=new FormData(e.target);const body=Object.fromEntries(form.entries());
 try{const r=await fetch("/api/users/"+encodeURIComponent(current.user.login)+"/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error);current.custom=data.profile;toast("Profile saved");renderProfile(current)}catch(err){toast(err.message)}
}

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function escapeAttr(v){return escapeHtml(v).replace(/\n/g,"")}
