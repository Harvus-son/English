const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "users.json");

app.use(express.json({limit:"1mb"}));
app.use(express.static(__dirname));

function readUsers(){
  try { return JSON.parse(fs.readFileSync(DATA_FILE,"utf8")); }
  catch { return {}; }
}
function writeUsers(users){
  fs.mkdirSync(path.dirname(DATA_FILE), {recursive:true});
  fs.writeFileSync(DATA_FILE, JSON.stringify(users,null,2));
}

async function github(pathname){
  const response = await fetch("https://api.github.com"+pathname,{
    headers:{
      "Accept":"application/vnd.github+json",
      "User-Agent":"English-User-Inspector/1.0"
    }
  });
  if(!response.ok){
    const text=await response.text();
    const error=new Error(text || "GitHub API request failed");
    error.status=response.status;
    throw error;
  }
  return response.json();
}

app.get("/api/health",(req,res)=>res.json({ok:true,service:"English User Inspector"}));

app.get("/api/users/search",async(req,res)=>{
  const q=String(req.query.q||"").trim();
  if(q.length<2) return res.status(400).json({error:"Enter at least 2 characters."});
  try{
    const data=await github("/search/users?q="+encodeURIComponent(q)+"&per_page=12");
    res.json({total:data.total_count,users:data.items});
  }catch(err){res.status(err.status||500).json({error:"Unable to search GitHub users.",details:err.message});}
});

app.get("/api/users/:login",async(req,res)=>{
  const login=encodeURIComponent(req.params.login);
  try{
    const [user,repos,events] = await Promise.all([
      github("/users/"+login),
      github("/users/"+login+"/repos?per_page=100&sort=updated"),
      github("/users/"+login+"/events/public?per_page=30")
    ]);
    const languages={};
    repos.forEach(repo=>{
      if(repo.language) languages[repo.language]=(languages[repo.language]||0)+1;
    });
    const stats={
      repositories: user.public_repos,
      followers:user.followers,
      following:user.following,
      gists:user.public_gists,
      stars:repos.reduce((sum,r)=>sum+(r.stargazers_count||0),0),
      forks:repos.reduce((sum,r)=>sum+(r.forks_count||0),0),
      languages
    };
    const custom=readUsers()[req.params.login]||{};
    res.json({user,stats,repositories:repos.slice(0,12),events:events.slice(0,12),custom});
  }catch(err){res.status(err.status||500).json({error:"User not found or GitHub API unavailable.",details:err.message});}
});

app.put("/api/users/:login/profile",(req,res)=>{
  const login=req.params.login;
  const body=req.body||{};
  const users=readUsers();
  users[login]={
    bio:String(body.bio||"").slice(0,500),
    location:String(body.location||"").slice(0,120),
    website:String(body.website||"").slice(0,300),
    accent:String(body.accent||"").slice(0,30),
    notes:String(body.notes||"").slice(0,1000),
    updatedAt:new Date().toISOString()
  };
  writeUsers(users);
  res.json({ok:true,profile:users[login]});
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));

app.listen(PORT,()=>console.log("English User Inspector running on http://localhost:"+PORT));