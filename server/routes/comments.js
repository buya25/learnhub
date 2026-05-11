const router  = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db      = require('../db/comments');
const usersDb = require('../db/users');
const { requireAuth } = require('../middleware/auth');

function withAuthor(comment) {
  const user = usersDb.findById(comment.author);
  return { ...comment, authorName: user?.name || 'Unknown' };
}

// GET /api/comments?targetId=X
router.get('/', (req, res) => {
  if (!req.query.targetId)
    return res.status(400).json({ error: 'targetId is required' });
  res.json(db.findByTarget(req.query.targetId).map(withAuthor));
});

// POST /api/comments
router.post('/', requireAuth, (req, res) => {
  const { targetId, body } = req.body;
  if (!targetId || !body?.trim())
    return res.status(400).json({ error: 'targetId and body are required' });
  if (body.trim().length > 300)
    return res.status(400).json({ error: 'Comment must be 300 characters or fewer' });

  const comment = db.create({
    id:        uuidv4(),
    targetId,
    author:    req.user.id,
    body:      body.trim(),
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(withAuthor(comment));
});

// DELETE /api/comments/:id
router.delete('/:id', requireAuth, (req, res) => {
  const comment = db.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.author !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });
  db.remove(req.params.id);
  res.status(204).send();
});

module.exports = router;
