const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/posts');
const answersDb = require('../db/answers');
const usersDb = require('../db/users');
const { requireAuth } = require('../middleware/auth');

function withMeta(post) {
  const user = usersDb.findById(post.author);
  const answers = answersDb.findByPostId(post.id);
  return {
    ...post,
    authorName:        user?.name || 'Unknown',
    answerCount:       answers.length,
    hasAcceptedAnswer: answers.some(a => a.isAccepted),
  };
}

function enrichAnswer(answer) {
  const user = usersDb.findById(answer.author);
  return { ...answer, authorName: user?.name || 'Unknown' };
}

// GET /api/posts?category=History&search=war&sort=popular&page=1&limit=10
router.get('/', (req, res) => {
  let data = req.query.category ? db.findByCategory(req.query.category) : db.getAll();

  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    data = data.filter(p =>
      p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
    );
  }

  if (req.query.unanswered === '1') {
    data = data.filter(p => answersDb.findByPostId(p.id).length === 0);
  }

  const sort = req.query.sort || 'newest';
  if (sort === 'popular') data.sort((a, b) => b.upvotes - a.upvotes);
  else if (sort === 'views') data.sort((a, b) => b.views - a.views);
  else data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  data = data.map(withMeta);

  if (req.query.page) {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const total = data.length;
    const pages = Math.ceil(total / limit) || 1;
    return res.json({ data: data.slice((page - 1) * limit, page * limit), total, page, pages });
  }

  res.json(data);
});

// GET /api/posts/counts-by-category
router.get('/counts-by-category', (req, res) => {
  const counts = {};
  for (const post of db.getAll()) {
    counts[post.category] = (counts[post.category] || 0) + 1;
  }
  res.json(counts);
});

// GET /api/posts/:id — includes enriched answers, increments view count
router.get('/:id', (req, res) => {
  const post = db.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  db.update(req.params.id, { views: post.views + 1 });
  const answers = answersDb.findByPostId(req.params.id)
    .sort((a, b) => b.isAccepted - a.isAccepted || b.upvotes - a.upvotes)
    .map(enrichAnswer);
  res.json({ ...withMeta(db.findById(req.params.id)), answers });
});

// POST /api/posts
router.post('/', requireAuth, (req, res) => {
  const { title, body, category, tags } = req.body;
  if (!title || !body || !category)
    return res.status(400).json({ error: 'title, body, and category are required' });

  const post = db.create({
    id: uuidv4(),
    title, body, category,
    tags: Array.isArray(tags) ? tags : [],
    author: req.user.id,
    upvotes: 0, views: 0,
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(withMeta(post));
});

// PATCH /api/posts/:id/upvote
router.patch('/:id/upvote', requireAuth, (req, res) => {
  const post = db.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(withMeta(db.update(req.params.id, { upvotes: post.upvotes + 1 })));
});

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, (req, res) => {
  const post = db.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });
  db.remove(req.params.id);
  res.status(204).send();
});

module.exports = router;
