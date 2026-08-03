const WebSocket = require('ws');
const { spawn } = require('child_process');

const sessions = new Map();

function createTerminalSession(ws, req, { cols = 80, rows = 24 } = {}) {
  const shell = process.env.SHELL || '/bin/bash';
  const workDir = process.env.FILE_ROOT || '/home/pi';
  
  const proc = spawn(shell, [], {
    cwd: workDir,
    env: { ...process.env, TERM: 'xterm-256color', COLUMNS: String(cols), LINES: String(rows) },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const sessionId = Math.random().toString(36).slice(2);
  const session = { proc, ws, cols, rows, alive: true };
  sessions.set(sessionId, session);

  proc.stdout.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'data', data: data.toString() }));
    }
  });

  proc.stderr.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'data', data: data.toString() }));
    }
  });

  proc.on('exit', (code) => {
    session.alive = false;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'exit', code }));
      ws.close();
    }
    sessions.delete(sessionId);
  });

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      switch (msg.type) {
        case 'input':
          if (session.alive) proc.stdin.write(msg.data);
          break;
        case 'resize':
          session.cols = msg.cols;
          session.rows = msg.rows;
          proc.stdin.write(`\x1b[8;${msg.rows};${msg.cols}t`);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch {}
  });

  ws.on('close', () => {
    if (session.alive) {
      proc.kill('SIGTERM');
      sessions.delete(sessionId);
    }
  });

  ws.send(JSON.stringify({ type: 'ready', sessionId }));
}

function setupTerminalWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const cols = parseInt(url.searchParams.get('cols'), 10) || 80;
    const rows = parseInt(url.searchParams.get('rows'), 10) || 24;
    createTerminalSession(ws, req, { cols, rows });
  });

  return wss;
}

module.exports = { setupTerminalWebSocket };