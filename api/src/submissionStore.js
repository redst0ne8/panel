const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'submissions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw).submissions || [];
  } catch {
    return [];
  }
}

function writeAll(submissions) {
  ensureDataDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify({ submissions }, null, 2), 'utf-8');
}

function create(data) {
  const submissions = readAll();
  const entry = {
    id: crypto.randomUUID(),
    discordUsername: data.discordUsername,
    discordId: data.discordId,
    botName: data.botName,
    botPurpose: data.botPurpose,
    botFeatures: data.botFeatures,
    zipPath: data.zipPath || null,
    status: 'pending',
    submittedBy: data.submittedBy,
    createdAt: Date.now(),
    reviewedBy: null,
    reviewedAt: null,
  };
  submissions.push(entry);
  writeAll(submissions);
  return entry;
}

function getById(id) {
  const submissions = readAll();
  return submissions.find((s) => s.id === id) || null;
}

function updateStatus(id, status, reviewedBy) {
  const submissions = readAll();
  const idx = submissions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  submissions[idx].status = status;
  submissions[idx].reviewedBy = reviewedBy;
  submissions[idx].reviewedAt = Date.now();
  writeAll(submissions);
  return submissions[idx];
}

function getByUser(discordUserId) {
  const submissions = readAll();
  return submissions.filter((s) => s.submittedBy === discordUserId);
}

function getAll() {
  return readAll();
}

function clearReviewed(userId) {
  const submissions = readAll();
  const kept = submissions.filter(
    (s) => s.submittedBy !== userId || s.status === 'pending'
  );
  writeAll(kept);
  return kept.filter((s) => s.submittedBy === userId);
}

module.exports = { create, getById, updateStatus, getByUser, getAll, clearReviewed };
