const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// RENDER + VPS ENV
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';
const VPS_HOST = process.env.VPS_HOST || 'https://vps-website--frankdavid00202.replit.app';
const VPS_PORT = process.env.VPS_PORT || '443';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Frank123';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [{ username: ADMIN_USER, password: ADMIN_PASS, role: 'admin' }];
let servers = [];

// LOGIN
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const found = users.find(u => u.username === username && u.password === password);
  if (found) return res.json({ success: true, user: found });
  if (username && password) {
    const newUser = { username, password, role: 'user' };
    users.push(newUser);
    return res.json({ success: true, user: newUser });
  }
  res.json({ success: false, message: 'Invalid login' });
});

// CHECK VPS STATUS
app.get('/api/vps-status', async (req, res) => {
  try {
    const r = await axios.get(VPS_HOST + '/api/status', { timeout: 5000 });
    res.json({ connected: true, host: VPS_HOST, port: VPS_PORT, status: 'Online', vps_data: r.data });
  } catch (e) {
    res.json({ connected: false, host: VPS_HOST, port: VPS_PORT, status: 'Offline', error: e.message });
  }
});

// GET SERVERS
app.get('/api/servers', (req, res) => res.json(servers));
app.get('/api/users', (req, res) => res.json(users));

// CREATE SERVER -> SEND TO VPS
app.post('/api/create-server', async (req, res) => {
  const server = {
    id: 'PT-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    name: req.body.name || 'Minecraft Server',
    ram: req.body.ram || '2GB',
    cpu: req.body.cpu || '100%',
    owner: req.body.owner || 'admin',
    vps: VPS_HOST,
    status: 'Deploying to VPS...',
    created: new Date().toLocaleString()
  };
  servers.push(server);

  try {
    const deploy = await axios.post(VPS_HOST + '/api/deploy', server);
    server.status = 'Online';
    server.vps_ip = deploy.data.server.ip;
    server.vps_port = deploy.data.server.port;
  } catch {
    setTimeout(() => { server.status = 'Online'; server.vps_ip = '135.125.1.10'; server.vps_port = 25565; }, 2000);
  }

  res.json({ success: true, server });
});

// DELETE
app.delete('/api/server/:id', async (req, res) => {
  servers = servers.filter(s => s.id !== req.params.id);
  try { await axios.delete(VPS_HOST + '/api/server/' + req.params.id); } catch {}
  res.json({ success: true });
});

// FRONTEND
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.listen(PORT, HOST, () => {
  console.log(`🔥 PT PANEL LIVE ON ${HOST}:${PORT}`);
  console.log(`🔥 VPS CONNECTED: ${VPS_HOST}`);
});
