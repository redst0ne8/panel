const express = require('express');
const { spawn } = require('child_process');
const authenticate = require('../auth');

const router = express.Router();
router.use(authenticate);

const sessions = new Map();

function createSession(id, cols = 80, rows = 24) {
  const shell = process.env.SHELL || '/bin/bash';
  const proc = spawn(shell, [], {
    cwd: process.env.FILE_ROOT || '/home/pi',
    env: { ...process.env, TERM: 'xterm-256color', COLUMNS: cols, LINES: rows },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const buffers = { stdout: '', stderr: '' };
  
  proc.stdout.on('data', (data) => {
    buffers.stdout += data.toString();
  });
  
  proc.stderr.on('data', (data) => {
    buffers.stderr += data.toString();
  });

  return { proc, buffers, cols, rows };
}

router.post('/exec', async (req, res) => {
  try {
    const { command, cwd, timeout = 30000 } = req.body;
    if (!command) return res.status(400).json({ error: 'Command required' });

    const workDir = cwd ? require('path').resolve(process.env.FILE_ROOT || '/home/pi', cwd) : (process.env.FILE_ROOT || '/home/pi');
    const rootResolved = require('path').resolve(process.env.FILE_ROOT || '/home/pi');
    if (!workDir.startsWith(rootResolved)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { execSync } = require('child_process');
    let stdout = '', stderr = '';
    let exitCode = 0;
    
    try {
      stdout = execSync(command, { 
        cwd: workDir, 
        timeout, 
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
        shell: '/bin/bash',
        env: { ...process.env, TERM: 'xterm-256color' }
      });
    } catch (err) {
      stdout = err.stdout || '';
      stderr = err.stderr || err.message;
      exitCode = err.status || 1;
    }

    res.json({ stdout, stderr, exitCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/session', (req, res) => {
  try {
    const { cols = 80, rows = 24 } = req.body;
    const id = Math.random().toString(36).slice(2);
    const session = createSession(id, cols, rows);
    sessions.set(id, session);
    
    session.proc.on('exit', (code) => {
      sessions.delete(id);
    });

    res.json({ sessionId: id, cols, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/session/:id/resize', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  const { cols, rows } = req.body;
  session.cols = cols;
  session.rows = rows;
  session.proc.stdin.write(`\x1b[8;${rows};${cols}t`);
  res.json({ success: true });
});

router.post('/session/:id/write', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  const { data } = req.body;
  if (data) session.proc.stdin.write(data);
  res.json({ success: true });
});

router.get('/session/:id/read', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  const output = session.buffers.stdout + session.buffers.stderr;
  session.buffers.stdout = '';
  session.buffers.stderr = '';
  res.json({ output });
});

router.delete('/session/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  session.proc.kill('SIGTERM');
  sessions.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;