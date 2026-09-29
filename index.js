const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Frank123';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [{username: ADMIN_USER, password: ADMIN_PASS, role: 'admin'}];
let servers = [];

app.post('/api/login', (req,res)=>{
  const {username,password}=req.body;
  const found = users.find(u=>u.username===username && u.password===password);
  if(found) return res.json({success:true, user:found});
  // auto register normal users
  if(username && password){
    users.push({username,password,role:'user'});
    return res.json({success:true, user:{username,role:'user'}});
  }
  res.json({success:false, message:'Invalid login'});
});

app.get('/api/servers',(req,res)=>res.json(servers));
app.get('/api/users',(req,res)=>res.json(users));

app.post('/api/create-server',(req,res)=>{
  const s={
    id: 'PT-'+Math.random().toString(36).substr(2,5).toUpperCase(),
    name: req.body.name || 'Minecraft Server',
    ram: req.body.ram || '2GB',
    cpu: req.body.cpu || '100%',
    owner: req.body.owner || 'admin',
    status: 'Online',
    created: new Date().toLocaleString()
  };
  servers.push(s);
  res.json({success:true, server:s});
});

app.delete('/api/server/:id',(req,res)=>{
  servers = servers.filter(s=>s.id!==req.params.id);
  res.json({success:true});
});

app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public/login.html')));
app.listen(PORT,HOST,()=>console.log(`PT PANEL LIVE ON ${HOST}:${PORT}`));
