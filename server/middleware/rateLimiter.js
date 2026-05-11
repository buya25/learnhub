const { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } = require('../config');

const store = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (val.reset < now) store.delete(key);
  }
}, 60_000);

function createLimiter(max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW) {
  return function rateLimiter(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.reset < now) {
      store.set(key, { count: 1, reset: now + windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many requests — please slow down.' });
    }
    next();
  };
}

module.exports = { createLimiter };
