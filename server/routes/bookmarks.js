const router      = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db          = require('../db/bookmarks');
const resourcesDb = require('../db/resources');
const postsDb     = require('../db/posts');
const { requireAuth } = require('../middleware/auth');

function enrich(bookmark) {
  if (bookmark.type === 'resource') {
    const r = resourcesDb.findById(bookmark.targetId);
    return { ...bookmark, target: r || null };
  }
  const p = postsDb.findById(bookmark.targetId);
  return { ...bookmark, target: p || null };
}

// GET /api/bookmarks
router.get('/', requireAuth, (req, res) => {
  res.json(db.findByUser(req.user.id).map(enrich));
});

// POST /api/bookmarks
router.post('/', requireAuth, (req, res) => {
  const { targetId, type } = req.body;
  if (!targetId || !['resource', 'post'].includes(type))
    return res.status(400).json({ error: 'targetId and type (resource|post) required' });

  if (db.findByUserAndTarget(req.user.id, targetId))
    return res.status(409).json({ error: 'Already bookmarked' });

  const bookmark = db.create({ id: uuidv4(), userId: req.user.id, targetId, type, createdAt: new Date().toISOString() });
  res.status(201).json(bookmark);
});

// DELETE /api/bookmarks/:targetId
router.delete('/:targetId', requireAuth, (req, res) => {
  const removed = db.removeByTarget(req.user.id, req.params.targetId);
  if (!removed) return res.status(404).json({ error: 'Bookmark not found' });
  res.status(204).send();
});

module.exports = router;
