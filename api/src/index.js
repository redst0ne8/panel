require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');

const systemRoutes = require('./routes/system');
const botRoutes = require('./routes/bots');
const logRoutes = require('./routes/logs');
const fileRoutes = require('./routes/files');
const terminalRoutes = require('./routes/terminal');
const discordRoutes = require('./discord');
const submissionRoutes = require('./submissions');
const setupLogStream = require('./ws/logStream');
const { setupTerminalWebSocket } = require('./ws/terminal');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4000;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.DASHBOARD_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('short'));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', discordRoutes);
app.use('/api', systemRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/bots', logRoutes);
app.use('/api/submissions', submissionRoutes);

const server = app.listen(PORT, () => {
  console.log(`Bot API server listening on port ${PORT}`);
});

const logWss = new WebSocketServer({ noServer: true });
const terminalWss = new WebSocketServer({ noServer: true });

setupLogStream(logWss);
setupTerminalWebSocket(terminalWss);

server.on('upgrade', (request, socket, head) => {
  let pathname = '';
  try {
    pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  } catch {
    socket.destroy();
    return;
  }

  let wss = null;
  if (pathname.startsWith('/api/terminal/ws')) wss = terminalWss;
  else if (pathname.startsWith('/api/logs')) wss = logWss;

  if (!wss) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});