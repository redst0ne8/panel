const express = require('express');
const multer = require('multer');
const path = require('path');
const submissionStore = require('./submissionStore');
const authenticate = require('./auth');

const router = express.Router();
router.use(authenticate);

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.zip';
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

function withZipUrl(entry) {
  if (!entry) return entry;
  const e = { ...entry };
  if (e.zipPath) {
    const basename = path.basename(e.zipPath);
    e.zipUrl = '/uploads/' + basename;
  }
  return e;
}

router.post('/', upload.single('zip'), (req, res) => {
  const auth = req.auth;
  if (!auth || auth.method !== 'session' || !auth.user) {
    return res.status(403).json({ error: 'Only Discord-authenticated users can submit bots' });
  }

  const { discordUsername, discordId, botName, botPurpose, botFeatures } = req.body;
  if (!botName || !botPurpose || !botFeatures) {
    return res.status(400).json({ error: 'botName, botPurpose, and botFeatures are required' });
  }

  const entry = submissionStore.create({
    discordUsername: discordUsername || '',
    discordId: discordId || '',
    botName,
    botPurpose,
    botFeatures,
    zipPath: req.file ? req.file.path : null,
    submittedBy: auth.user.id,
  });

  res.status(201).json({ submission: withZipUrl(entry) });
});

router.get('/mine', (req, res) => {
  const auth = req.auth;
  if (!auth || auth.method !== 'session' || !auth.user) {
    return res.status(403).json({ error: 'Only Discord-authenticated users can view their submissions' });
  }

  const submissions = submissionStore.getByUser(auth.user.id).map(withZipUrl);
  res.json({ submissions });
});

router.get('/all', (req, res) => {
  const auth = req.auth;
  if (!auth || auth.method !== 'apikey') {
    return res.status(403).json({ error: 'Only root can view all submissions' });
  }

  const submissions = submissionStore.getAll().map(withZipUrl);
  res.json({ submissions });
});

router.post('/:id/accept', (req, res) => {
  const auth = req.auth;
  if (!auth || auth.method !== 'apikey') {
    return res.status(403).json({ error: 'Only root can accept submissions' });
  }

  const entry = submissionStore.updateStatus(req.params.id, 'accepted', 'root');
  if (!entry) return res.status(404).json({ error: 'Submission not found' });
  res.json({ submission: withZipUrl(entry) });
});

router.post('/clear-reviewed', (req, res) => {
  const auth = req.auth;
  if (!auth || auth.method !== 'session' || !auth.user) {
    return res.status(403).json({ error: 'Only Discord-authenticated users can clear submissions' });
  }

  const remaining = submissionStore.clearReviewed(auth.user.id);
  res.json({ submissions: remaining.map(withZipUrl) });
});

router.post('/:id/deny', (req, res) => {
  const auth = req.auth;
  if (!auth || auth.method !== 'apikey') {
    return res.status(403).json({ error: 'Only root can deny submissions' });
  }

  const entry = submissionStore.updateStatus(req.params.id, 'denied', 'root');
  if (!entry) return res.status(404).json({ error: 'Submission not found' });
  res.json({ submission: withZipUrl(entry) });
});

module.exports = router;
