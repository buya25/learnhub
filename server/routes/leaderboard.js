const router   = require('express').Router();
const usersDb  = require('../db/users');
const answersDb = require('../db/answers');
const postsDb  = require('../db/posts');

// GET /api/leaderboard?limit=10
router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const top = usersDb.getAll()
    .map(u => {
      const { passwordHash, email, ...safe } = u;
      return {
        ...safe,
        postCount:   postsDb.getAll().filter(p => p.author === u.id).length,
        answerCount: answersDb.getAll().filter(a => a.author === u.id).length,
      };
    })
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, limit);
  res.json(top);
});

module.exports = router;
