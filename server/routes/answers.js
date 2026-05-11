const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db              = require('../db/answers');
const postsDb         = require('../db/posts');
const usersDb         = require('../db/users');
const notificationsDb = require('../db/notifications');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');

// POST /api/answers
router.post('/', requireAuth, validate('answer'), (req, res) => {
  const { postId, body } = req.body;
  const post = postsDb.findById(postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const answer = db.create({
    id: uuidv4(), postId, body,
    author: req.user.id,
    upvotes: 0, isAccepted: false,
    createdAt: new Date().toISOString(),
  });

  // +5 reputation for answering
  const answerer = usersDb.findById(req.user.id);
  if (answerer) usersDb.update(req.user.id, { reputation: answerer.reputation + 5 });

  // Notify the question author (skip if answering own question)
  if (post.author !== req.user.id) {
    notificationsDb.create({
      id: uuidv4(),
      userId: post.author,
      type: 'new_answer',
      message: `${answerer?.name || 'Someone'} answered your question: "${post.title}"`,
      link: `/forum/${post.category.toLowerCase()}/${postId}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  const user = usersDb.findById(req.user.id);
  res.status(201).json({ ...answer, authorName: user?.name || 'Unknown' });
});

// PATCH /api/answers/:id/upvote
router.patch('/:id/upvote', requireAuth, (req, res) => {
  const answer = db.findById(req.params.id);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });
  const updated = db.update(req.params.id, { upvotes: answer.upvotes + 1 });
  const user = usersDb.findById(updated.author);
  res.json({ ...updated, authorName: user?.name || 'Unknown' });
});

// PATCH /api/answers/:id/accept
router.patch('/:id/accept', requireAuth, (req, res) => {
  const answer = db.findById(req.params.id);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });

  const post = postsDb.findById(answer.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author !== req.user.id)
    return res.status(403).json({ error: 'Only the question author can accept an answer' });

  db.findByPostId(answer.postId).filter(a => a.isAccepted).forEach(a => db.update(a.id, { isAccepted: false }));

  // +15 reputation for having answer accepted
  const answerer = usersDb.findById(answer.author);
  if (answerer) usersDb.update(answer.author, { reputation: answerer.reputation + 15 });

  const updated = db.update(req.params.id, { isAccepted: true });
  const user = usersDb.findById(updated.author);
  res.json({ ...updated, authorName: user?.name || 'Unknown' });
});

// DELETE /api/answers/:id
router.delete('/:id', requireAuth, (req, res) => {
  const answer = db.findById(req.params.id);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });
  if (answer.author !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });
  db.remove(req.params.id);
  res.status(204).send();
});

module.exports = router;
