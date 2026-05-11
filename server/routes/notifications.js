const router = require('express').Router();
const db     = require('../db/notifications');
const { requireAuth } = require('../middleware/auth');

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  res.json(db.findByUser(req.user.id));
});

// GET /api/notifications/unread-count
router.get('/unread-count', requireAuth, (req, res) => {
  res.json({ count: db.unreadCount(req.user.id) });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, (req, res) => {
  db.markAllRead(req.user.id);
  res.json({ ok: true });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, (req, res) => {
  const notif = db.findById(req.params.id);
  if (!notif)                     return res.status(404).json({ error: 'Not found' });
  if (notif.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  res.json(db.update(req.params.id, { read: true }));
});

module.exports = router;
