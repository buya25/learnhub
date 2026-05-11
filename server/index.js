const express      = require('express');
const cors         = require('cors');
const { PORT, CLIENT_ORIGIN, NODE_ENV } = require('./config');
const logger       = require('./lib/logger');
const errorHandler = require('./middleware/errorHandler');
const { createLimiter } = require('./middleware/rateLimiter');
const { sanitizeBody }  = require('./middleware/sanitize');

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeBody);

// ── HTTP request logging ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => logger.http(req, res.statusCode, Date.now() - start));
  next();
});

// ── Rate limiting ────────────────────────────────────────────────────────────
const strictLimiter = createLimiter(20, 15 * 60 * 1000);  // 20 req / 15 min for auth
const globalLimiter = createLimiter();

app.use('/api/auth', strictLimiter);
app.use('/api',      globalLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/resources',     require('./routes/resources'));
app.use('/api/posts',         require('./routes/posts'));
app.use('/api/answers',       require('./routes/answers'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/search',        require('./routes/search'));
app.use('/api/bookmarks',     require('./routes/bookmarks'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/leaderboard',   require('./routes/leaderboard'));
app.use('/api/stats',         require('./routes/stats'));
app.use('/api/comments',      require('./routes/comments'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', env: NODE_ENV }));

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ── Centralized error handler ────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
