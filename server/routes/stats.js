const router = require('express').Router();
const resourcesDb = require('../db/resources');
const postsDb     = require('../db/posts');
const answersDb   = require('../db/answers');
const usersDb     = require('../db/users');

// GET /api/stats
router.get('/', (req, res) => {
  res.json({
    resources: resourcesDb.getAll().length,
    posts:     postsDb.getAll().length,
    answers:   answersDb.getAll().length,
    users:     usersDb.getAll().length,
  });
});

module.exports = router;
