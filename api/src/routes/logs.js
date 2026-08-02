const express = require('express');
const logService = require('../services/logService');
const pm2Manager = require('../services/pm2Manager');
const authenticate = require('../auth');

const router = express.Router();

router.use(authenticate);

function getNamespace(auth) {
  if (auth.method === 'apikey') return 'root';
  if (auth.method === 'session' && auth.user) return auth.user.id;
  return null;
}

router.get('/:id/logs', async (req, res) => {
  try {
    const all = await pm2Manager.listBots();
    const namespace = getNamespace(req.auth);
    const filtered = pm2Manager.filterBotsByNamespace(all, namespace);
    const bot = filtered.find((b) => b.id === req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found in your namespace' });

    const tail = Math.min(parseInt(req.query.tail, 10) || 100, 5000);
    const type = req.query.type;
    const logs = await logService.getBotLogs(req.params.id, { tail, type });
    res.json({ bot: req.params.id, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
