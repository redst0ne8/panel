const { WebSocketServer } = require('ws');
const pm2 = require('pm2');

const clients = new Map();

function setup(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (token !== process.env.API_KEY) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const botFilter = url.searchParams.get('bot') || null;
    clients.set(ws, { bot: botFilter });

    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  pm2.connect((err) => {
    if (err) {
      console.error('PM2 connection failed for log stream:', err.message);
      return;
    }

    pm2.launchBus((err, bus) => {
      if (err) {
        console.error('PM2 bus launch failed:', err.message);
        return;
      }

      bus.on('log:out', (data) => {
        if (data.process && data.data) {
          broadcast({
            type: 'stdout',
            bot: data.process.name,
            data: data.data,
            timestamp: Date.now(),
          });
        }
      });

      bus.on('log:err', (data) => {
        if (data.process && data.data) {
          broadcast({
            type: 'stderr',
            bot: data.process.name,
            data: data.data,
            timestamp: Date.now(),
          });
        }
      });

      bus.on('process:event', (data) => {
        if (data.process && data.event) {
          broadcast({
            type: 'event',
            bot: data.process.name,
            event: data.event,
            timestamp: Date.now(),
          });
        }
      });

      console.log('PM2 log bus connected — streaming logs via WebSocket');
    });
  });

  function broadcast(msg) {
    const payload = JSON.stringify(msg);
    for (const [ws, filter] of clients) {
      if (ws.readyState === 1) {
        if (!filter.bot || filter.bot === msg.bot) {
          ws.send(payload);
        }
      } else {
        clients.delete(ws);
      }
    }
  }
}

module.exports = setup;
