module.exports = {
  PORT:               process.env.PORT          || 5000,
  JWT_SECRET:         process.env.JWT_SECRET     || 'elearning_dev_secret_change_in_production',
  JWT_EXPIRES_IN:     process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_ORIGIN:      process.env.CLIENT_ORIGIN  || 'http://localhost:3009',
  NODE_ENV:           process.env.NODE_ENV        || 'development',
  RATE_LIMIT_WINDOW:  15 * 60 * 1000,  // 15 minutes
  RATE_LIMIT_MAX:     100,              // requests per window
  BACKUP_INTERVAL:    60 * 60 * 1000,  // 1 hour
  MAX_BACKUPS:        5,               // backups kept per data file
};
