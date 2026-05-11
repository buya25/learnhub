const DataStore = require('../lib/store');
const { BACKUP_INTERVAL } = require('../config');

const stores = {
  users:         new DataStore('users'),
  resources:     new DataStore('resources'),
  posts:         new DataStore('posts'),
  answers:       new DataStore('answers'),
  bookmarks:     new DataStore('bookmarks'),
  notifications: new DataStore('notifications'),
  comments:      new DataStore('comments'),
};

// Hourly backups for all stores
setInterval(() => {
  Object.values(stores).forEach(s => s.backup());
}, BACKUP_INTERVAL);

module.exports = stores;
