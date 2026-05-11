const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/resources');
const usersDb = require('../db/users');
const { requireAuth } = require('../middleware/auth');

function withAuthor(resource) {
  const user = usersDb.findById(resource.uploadedBy);
  return { ...resource, authorName: user?.name || 'Unknown' };
}

// GET /api/resources?category=Science&search=bio&sort=popular&page=1&limit=12
router.get('/', (req, res) => {
  let data = req.query.category ? db.findByCategory(req.query.category) : db.getAll();

  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    data = data.filter(r =>
      r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }

  const sort = req.query.sort || 'newest';
  if (sort === 'popular')  data.sort((a, b) => b.downloads - a.downloads);
  else if (sort === 'upvotes') data.sort((a, b) => b.upvotes - a.upvotes);
  else data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  data = data.map(withAuthor);

  if (req.query.page) {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 12);
    const total = data.length;
    const pages = Math.ceil(total / limit) || 1;
    return res.json({ data: data.slice((page - 1) * limit, page * limit), total, page, pages });
  }

  res.json(data);
});

// GET /api/resources/:id — increments download counter
router.get('/:id', (req, res) => {
  const resource = db.findById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  db.update(req.params.id, { downloads: resource.downloads + 1 });
  res.json(withAuthor(db.findById(req.params.id)));
});

// POST /api/resources
router.post('/', requireAuth, (req, res) => {
  const { title, description, externalLink, fileType, category } = req.body;
  if (!title || !externalLink || !category)
    return res.status(400).json({ error: 'title, externalLink, and category are required' });

  const resource = db.create({
    id: uuidv4(),
    title,
    description: description || '',
    externalLink,
    fileType: fileType || 'Other',
    category,
    uploadedBy: req.user.id,
    upvotes: 0,
    downloads: 0,
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(withAuthor(resource));
});

// PATCH /api/resources/:id/upvote
router.patch('/:id/upvote', requireAuth, (req, res) => {
  const resource = db.findById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  res.json(withAuthor(db.update(req.params.id, { upvotes: resource.upvotes + 1 })));
});

// DELETE /api/resources/:id — owner or admin only
router.delete('/:id', requireAuth, (req, res) => {
  const resource = db.findById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  if (resource.uploadedBy !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });
  db.remove(req.params.id);
  res.status(204).send();
});

module.exports = router;
