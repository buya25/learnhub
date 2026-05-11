const router = require('express').Router();
const db = require('../db/users');
const resourcesDb = require('../db/resources');
const postsDb = require('../db/posts');
const answersDb = require('../db/answers');

// GET /api/users/:id — public profile
router.get('/:id', (req, res) => {
  const user = db.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { passwordHash, email, ...publicProfile } = user;

  const resources = resourcesDb.getAll()
    .filter(r => r.uploadedBy === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const posts = postsDb.getAll()
    .filter(p => p.author === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const answers = answersDb.getAll()
    .filter(a => a.author === user.id)
    .map(a => {
      const post = postsDb.findById(a.postId);
      return { ...a, postTitle: post?.title || 'Deleted question', postCategory: post?.category || '' };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    ...publicProfile,
    resourceCount: resources.length,
    postCount: posts.length,
    answerCount: answers.length,
    resources,
    posts,
    answers,
  });
});

module.exports = router;
