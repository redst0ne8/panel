const pm2 = require('pm2');

let connected = false;

function connect() {
  return new Promise((resolve, reject) => {
    if (connected) return resolve();
    pm2.connect((err) => {
      if (err) return reject(err);
      connected = true;
      resolve();
    });
  });
}

function disconnect() {
  return new Promise((resolve) => {
    if (!connected) return resolve();
    pm2.disconnect();
    connected = false;
    resolve();
  });
}

async function listBots() {
  await connect();
  const list = await new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) reject(err);
      else resolve(list);
    });
  });

  return list.map(normalizeProc);
}

async function getBot(name) {
  const bots = await listBots();
  return bots.find((b) => b.id === name) || null;
}

async function restartBot(name) {
  await connect();
  await new Promise((resolve, reject) => {
    pm2.restart(name, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function stopBot(name) {
  await connect();
  await new Promise((resolve, reject) => {
    pm2.stop(name, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function startBot(name) {
  await connect();
  await new Promise((resolve, reject) => {
    pm2.start(name, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function normalizeProc(proc) {
  const env = proc.pm2_env || {};
  return {
    id: proc.name,
    pm_id: proc.pm_id,
    pid: proc.pid,
    status: env.status || 'unknown',
    uptime: env.pm_uptime || null,
    restarts: env.restart_time || 0,
    cpu: proc.monit ? proc.monit.cpu : 0,
    memory: proc.monit ? proc.monit.memory : 0,
    exec_mode: env.exec_mode || 'fork',
    instances: env.instances || 1,
    version: env.version || null,
    exec_path: env.pm_exec_path || null,
    cwd: env.pm_cwd || null,
    created_at: env.created_at || null,
    namespace: env.namespace || null,
  };
}

function filterBotsByNamespace(bots, namespace) {
  if (namespace === 'root') return bots;
  if (!namespace) return bots.filter((b) => !b.namespace);
  return bots.filter((b) => b.namespace === namespace);
}

module.exports = {
  connect,
  disconnect,
  listBots,
  getBot,
  restartBot,
  stopBot,
  startBot,
  filterBotsByNamespace,
};
