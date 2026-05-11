const logger = require('../lib/logger');

function errorHandler(err, req, res, next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) logger.error(message, { method: req.method, url: req.originalUrl });
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
