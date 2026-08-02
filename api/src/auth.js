const session = require('./session');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = header.slice(7);

  if (token === process.env.API_KEY) {
    req.auth = { method: 'apikey' };
    return next();
  }

  const user = session.get(token);
  if (user) {
    req.auth = { method: 'session', user };
    return next();
  }

  return res.status(401).json({ error: 'Invalid API key or session' });
}

module.exports = authenticate;
