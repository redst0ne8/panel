const express = require('express');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const authenticate = require('../auth');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const rename = promisify(fs.rename);

const router = express.Router();
router.use(authenticate);

const ROOT_DIR = process.env.FILE_ROOT || '/home/pi';

function resolveSafePath(reqPath) {
  const requested = path.resolve(ROOT_DIR, reqPath || '');
  const rootResolved = path.resolve(ROOT_DIR);
  if (!requested.startsWith(rootResolved)) {
    throw new Error('Access denied: path traversal not allowed');
  }
  return requested;
}

function getFileInfo(fullPath, relPath) {
  const stats = fs.statSync(fullPath);
  return {
    name: path.basename(fullPath),
    path: relPath,
    fullPath,
    isDirectory: stats.isDirectory(),
    size: stats.size,
    modified: stats.mtime.toISOString(),
    created: stats.birthtime.toISOString(),
  };
}

router.get('/', async (req, res) => {
  try {
    const reqPath = req.query.path || '';
    const fullPath = resolveSafePath(reqPath);
    
    const stats = await stat(fullPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }
    
    const entries = await readdir(fullPath);
    const items = await Promise.all(
      entries.map(async (entry) => {
        const entryFull = path.join(fullPath, entry);
        const entryRel = path.join(reqPath, entry);
        try {
          return getFileInfo(entryFull, entryRel);
        } catch {
          return null;
        }
      })
    );
    
    res.json({ 
      path: reqPath,
      items: items.filter(Boolean).sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/read', async (req, res) => {
  try {
    const reqPath = req.query.path;
    if (!reqPath) return res.status(400).json({ error: 'Path required' });
    
    const fullPath = resolveSafePath(reqPath);
    const stats = await stat(fullPath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory' });
    }
    
    const content = await readFile(fullPath, 'utf8');
    res.json({ content, path: reqPath, size: stats.size });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'File not found' });
    res.status(500).json({ error: err.message });
  }
});

router.post('/write', async (req, res) => {
  try {
    const { path: reqPath, content } = req.body;
    if (!reqPath) return res.status(400).json({ error: 'Path required' });
    if (content === undefined) return res.status(400).json({ error: 'Content required' });
    
    const fullPath = resolveSafePath(reqPath);
    await writeFile(fullPath, content, 'utf8');
    res.json({ success: true, path: reqPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { path: reqPath, type } = req.body;
    if (!reqPath) return res.status(400).json({ error: 'Path required' });
    if (!type || !['file', 'directory'].includes(type)) {
      return res.status(400).json({ error: 'Type must be file or directory' });
    }
    
    const fullPath = resolveSafePath(reqPath);
    
    if (type === 'directory') {
      await mkdir(fullPath, { recursive: true });
    } else {
      const dir = path.dirname(fullPath);
      await mkdir(dir, { recursive: true });
      await writeFile(fullPath, '', 'utf8');
    }
    
    res.json({ success: true, path: reqPath });
  } catch (err) {
    if (err.code === 'EEXIST') return res.status(409).json({ error: 'Already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const reqPath = req.query.path;
    if (!reqPath) return res.status(400).json({ error: 'Path required' });
    
    const fullPath = resolveSafePath(reqPath);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      await rmdir(fullPath, { recursive: true });
    } else {
      await unlink(fullPath);
    }
    
    res.json({ success: true, path: reqPath });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    if (err.code === 'ENOTEMPTY') return res.status(409).json({ error: 'Directory not empty' });
    res.status(500).json({ error: err.message });
  }
});

router.post('/rename', async (req, res) => {
  try {
    const { path: reqPath, newName } = req.body;
    if (!reqPath || !newName) return res.status(400).json({ error: 'Path and newName required' });
    
    const fullPath = resolveSafePath(reqPath);
    const dir = path.dirname(fullPath);
    const newFullPath = path.join(dir, newName);
    const newRelPath = path.join(path.dirname(reqPath), newName);
    
    await rename(fullPath, newFullPath);
    res.json({ success: true, oldPath: reqPath, newPath: newRelPath });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    if (err.code === 'EEXIST') return res.status(409).json({ error: 'Already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/stat', async (req, res) => {
  try {
    const reqPath = req.query.path;
    if (!reqPath) return res.status(400).json({ error: 'Path required' });
    
    const fullPath = resolveSafePath(reqPath);
    const stats = await stat(fullPath);
    
    res.json({
      path: reqPath,
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString(),
    });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;