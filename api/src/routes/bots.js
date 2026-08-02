const express = require('express');
const path = require('path');
const fs = require('fs');
const pm2Manager = require('../services/pm2Manager');
const authenticate = require('../auth');

const router = express.Router();

router.use(authenticate);

function getNamespace(auth) {
  if (auth.method === 'apikey') return 'root';
  if (auth.method === 'session' && auth.user) return auth.user.id;
  return null;
}

router.get('/', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const bots = pm2Manager.filterBotsByNamespace(all, namespace);
    res.json({ bots, namespace });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const filtered = pm2Manager.filterBotsByNamespace(all, namespace);
    const bot = filtered.find((b) => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    res.json({ bot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/restart', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const filtered = pm2Manager.filterBotsByNamespace(all, namespace);
    const bot = filtered.find((b) => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found in your namespace' });
    await pm2Manager.restartBot(req.params.id);
    res.json({ success: true, message: `Restarted ${req.params.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/stop', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const filtered = pm2Manager.filterBotsByNamespace(all, namespace);
    const bot = filtered.find((b) => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found in your namespace' });
    await pm2Manager.stopBot(req.params.id);
    res.json({ success: true, message: `Stopped ${req.params.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/start', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const filtered = pm2Manager.filterBotsByNamespace(all, namespace);
    const bot = filtered.find((b) => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found in your namespace' });
    await pm2Manager.startBot(req.params.id);
    res.json({ success: true, message: `Started ${req.params.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getBotDir(bot) {
  return bot.cwd || (bot.exec_path ? path.dirname(bot.exec_path) : null);
}

function parseEnv(content) {
  const env = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const withoutExport = trimmed.replace(/^export\s+/, '');
    const eqIndex = withoutExport.indexOf('=');
    if (eqIndex === -1) continue;
    const key = withoutExport.slice(0, eqIndex).trim();
    if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = withoutExport.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

router.get('/:id/env', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const filtered = pm2Manager.filterBotsByNamespace(all, namespace);
    const bot = filtered.find((b) => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found in your namespace' });

    const botDir = getBotDir(bot);
    if (!botDir) return res.status(500).json({ error: 'Cannot determine bot directory' });

    const envPath = path.join(botDir, '.env');
    let content = '';
    try {
      content = fs.readFileSync(envPath, 'utf8');
    } catch (e) {}

    res.json({ env: parseEnv(content) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/env', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const filtered = pm2Manager.filterBotsByNamespace(all, namespace);
    const bot = filtered.find((b) => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found in your namespace' });

    const { env } = req.body;
    if (!env || typeof env !== 'object') {
      return res.status(400).json({ error: 'env object is required' });
    }

    const botDir = getBotDir(bot);
    if (!botDir) return res.status(500).json({ error: 'Cannot determine bot directory' });

    const envPath = path.join(botDir, '.env');
    let content = '';
    try {
      content = fs.readFileSync(envPath, 'utf8');
    } catch (e) {}

    const lines = content.split('\n');
    const updated = [];

    for (const [key, value] of Object.entries(env)) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
      const regex = new RegExp(`^${key}=.*`);
      let found = false;
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          lines[i] = `${key}=${value}`;
          found = true;
          break;
        }
      }
      if (!found) lines.push(`${key}=${value}`);
      updated.push(key);
    }

    fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
