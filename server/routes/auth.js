const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const users         = require('../db/users');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');
const { validate }  = require('../middleware/validate');
const { JWT_EXPIRES_IN } = require('../config');

router.post('/register', validate('register'), async (req, res, next) => {
  try {
    const { name, email, password, subjects } = req.body;
    if (users.findByEmail(email)) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = users.create({
      id: uuidv4(), name, email: email.toLowerCase(), passwordHash,
      subjects: Array.isArray(subjects) ? subjects : [],
      role: 'user', reputation: 0, createdAt: new Date().toISOString(),
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
});

router.post('/login', validate('login'), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = users.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, (req, res) => {
  const user = users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(sanitize(user));
});

function sanitize({ passwordHash, ...safe }) { return safe; }

module.exports = router;
