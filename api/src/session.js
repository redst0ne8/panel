const crypto = require('crypto');

const sessions = new Map();

const TTL = 86400000;

function create(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + TTL;
  sessions.set(token, { user, expiry });
  return token;
}

function get(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiry) {
    sessions.delete(token);
    return null;
  }
  return session.user;
}

function remove(token) {
  sessions.delete(token);
}

module.exports = { create, get, remove };
