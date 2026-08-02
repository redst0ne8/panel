const fs = require('fs');
const path = require('path');
const os = require('os');

const PM2_LOG_DIR = path.join(os.homedir(), '.pm2', 'logs');

function logPath(name, suffix) {
  return path.join(PM2_LOG_DIR, `${name}-${suffix}.log`);
}

async function getBotLogs(name, { tail = 100, type } = {}) {
  const patterns = type === 'out'
    ? [`${name}-out.log`, `${name}-out-0.log`]
    : type === 'err'
      ? [`${name}-error.log`, `${name}-err.log`, `${name}-error-0.log`]
      : [
          `${name}-out.log`, `${name}-out-0.log`,
          `${name}-error.log`, `${name}-err.log`, `${name}-error-0.log`,
        ];

  const result = { stdout: [], stderr: [] };

  for (const filename of patterns) {
    const filepath = path.join(PM2_LOG_DIR, filename);
    if (!fs.existsSync(filepath)) continue;

    const content = await fs.promises.readFile(filepath, 'utf-8');
    const lines = content.trim().split('\n').slice(-tail);

    if (filename.includes('out')) {
      result.stdout = lines;
    } else {
      result.stderr = lines;
    }
  }

  return result;
}

module.exports = { getBotLogs };
