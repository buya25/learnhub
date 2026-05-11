const router = require('express').Router();
const resourcesDb = require('../db/resources');
const postsDb     = require('../db/posts');
const usersDb     = require('../db/users');

// GET /api/search?q=biology
router.get('/', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (q.length < 2) return res.json({ resources: [], posts: [], total: 0 });

  const resources = resourcesDb.getAll()
    .filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .slice(0, 6)
    .map(r => {
      const user = usersDb.findById(r.uploadedBy);
      return { ...r, authorName: user?.name || 'Unknown', _type: 'resource' };
    });

  const posts = postsDb.getAll()
    .filter(p => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
    .slice(0, 6)
    .map(p => {
      const user = usersDb.findById(p.author);
      return { ...p, authorName: user?.name || 'Unknown', _type: 'post' };
    });

  res.json({ resources, posts, total: resources.length + posts.length });
});

module.exports = router;
