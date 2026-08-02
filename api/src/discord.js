const express = require('express');
const session = require('./session');

const router = express.Router();

function getConfig() {
  return {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.DISCORD_REDIRECT_URI,
    panelUrl: process.env.PANEL_URL || process.env.DASHBOARD_ORIGIN,
  };
}

router.get('/login', (req, res) => {
  const cfg = getConfig();
  if (!cfg.clientId || !cfg.clientSecret || !cfg.redirectUri) {
    return res.status(503).json({ error: 'Discord OAuth not configured on the API server' });
  }

  const url =
    'https://discord.com/api/oauth2/authorize' +
    '?client_id=' + encodeURIComponent(cfg.clientId) +
    '&redirect_uri=' + encodeURIComponent(cfg.redirectUri) +
    '&response_type=code' +
    '&scope=identify';

  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const cfg = getConfig();
  const { code } = req.query;
  if (!code) {
    return redirectError(res, cfg.panelUrl, 'No authorization code received');
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: cfg.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return redirectError(res, cfg.panelUrl, 'Token exchange failed: ' + errText);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: 'Bearer ' + accessToken },
    });

    if (!userResponse.ok) {
      return redirectError(res, cfg.panelUrl, 'Failed to fetch Discord user');
    }

    const discordUser = await userResponse.json();

    const sessionToken = session.create({
      id: discordUser.id,
      username: discordUser.username,
      displayName: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar,
      discriminator: discordUser.discriminator,
    });

    const panelOrigin = cfg.panelUrl ? cfg.panelUrl.replace(/\/+$/, '') : 'http://localhost:3000';
    const apiBase = cfg.redirectUri ? cfg.redirectUri.replace(/\/api\/auth\/callback\/?$/, '') : `${req.protocol}://${req.get('host')}`;
    res.redirect(panelOrigin + '/auth/callback?token=' + encodeURIComponent(sessionToken) + '&apiUrl=' + encodeURIComponent(apiBase));
  } catch (err) {
    redirectError(res, cfg.panelUrl, 'OAuth error: ' + err.message);
  }
});

function redirectError(res, panelUrl, message) {
  const origin = panelUrl ? panelUrl.replace(/\/+$/, '') : 'http://localhost:3000';
  res.redirect(origin + '/login?error=' + encodeURIComponent(message));
}

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = header.slice(7);
  const user = session.get(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  res.json({ user });
});

router.post('/logout', (req, res) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    session.remove(header.slice(7));
  }
  res.json({ ok: true });
});

module.exports = router;
