const express = require('express');
const pm2Manager = require('../services/pm2Manager');
const authenticate = require('../auth');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/status', authenticate, async (req, res) => {
  try {
    const all = await pm2Manager.listBots();

    let namespace = null;
    if (req.auth.method === 'apikey') namespace = 'root';
    else if (req.auth.method === 'session' && req.auth.user) namespace = req.auth.user.id;

    const bots = pm2Manager.filterBotsByNamespace(all, namespace);
    const total = bots.length;
    const online = bots.filter((b) => b.status === 'online').length;
    const stopped = bots.filter((b) => b.status === 'stopped').length;
    const errored = bots.filter((b) => b.status === 'errored').length;

    res.json({
      total,
      online,
      stopped,
      errored,
      bots: bots.map((b) => ({
        id: b.id,
        status: b.status,
        cpu: b.cpu,
        memory: b.memory,
        uptime: b.uptime,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
