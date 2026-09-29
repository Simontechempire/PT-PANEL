const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';
const VPS_HOST = process.env.VPS_HOST || 'https://vps-website--frankdavid00202.replit.app';
const VPS_PORT = process.env.VPS_PORT || '443';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Frank123';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{res.header('Access-Control-Allow-Origin','*');next()});

let users=[{username:ADMIN_USER,password:ADMIN_PASS,role:'admin'}];
let servers=[];

app.post('/api/login',(req,res)=>{
 const {username,password}=req.body;
 const f=users.find(u=>u.username===username && u.password===password);
 if(f) return res.json({success:true,user:f});
 if(username&&password){const nu={username,password,role:'user'};users.push(nu);return res.json({success:true,user:nu});}
 res.json({success:false,message:'Invalid'});
});

app.get('/api/vps-status',async(req,res)=>{
 try{const r=await axios.get(VPS_HOST+'/api/status',{timeout:5000});res.json({connected:true,host:VPS_HOST,vps_data:r.data,status:'Online'});}
 catch(e){res.json({connected:false,host:VPS_HOST,status:'Offline',error:e.message});}
});

app.get('/api/servers',(req,res)=>res.json(servers));
app.get('/api/users',(req,res)=>res.json(users));

app.post('/api/create-server',async(req,res)=>{
 const s={id:'PT-'+Math.random().toString(36).substr(2,5).toUpperCase(),name:req.body.name||'Minecraft Server',ram:req.body.ram||'2GB',cpu:req.body.cpu||'100%',owner:req.body.owner||'admin',vps:VPS_HOST,status:'Deploying to VPS...',created:new Date().toLocaleString()};
 servers.push(s);
 try{const vpsRes=await axios.post(VPS_HOST+'/api/deploy',s);s.status='Online';s.vps_ip=vpsRes.data.server?.ip||'172.0.0.1';s.vps_port=vpsRes.data.server?.port||25565;}catch{setTimeout(()=>s.status='Online',2000);}
 res.json({success:true,server:s});
});

app.delete('/api/server/:id',async(req,res)=>{
 servers=servers.filter(s=>s.id!==req.params.id);
 try{await axios.delete(VPS_HOST+'/api/server/'+req.params.id);}catch{}
 res.json({success:true});
});

app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public/login.html')));
app.listen(PORT,HOST,()=>console.log(`PT PANEL LIVE ${HOST}:${PORT} VPS:${VPS_HOST}`));
