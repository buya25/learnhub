const { NODE_ENV } = require('../config');

function ts() { return new Date().toISOString(); }

function fmt(level, msg, meta) {
  const base = `[${ts()}] ${level.padEnd(5)} ${msg}`;
  return meta ? `${base} — ${JSON.stringify(meta)}` : base;
}

const logger = {
  info:  (msg, meta) => console.log(fmt('INFO',  msg, meta)),
  warn:  (msg, meta) => console.warn(fmt('WARN',  msg, meta)),
  error: (msg, meta) => console.error(fmt('ERROR', msg, meta)),
  http:  (req, status, ms) => {
    if (NODE_ENV !== 'test')
      console.log(fmt('HTTP', `${req.method} ${req.originalUrl} ${status} ${ms}ms`));
  },
};

module.exports = logger;
