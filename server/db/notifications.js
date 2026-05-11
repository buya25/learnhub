const { notifications } = require('./index');

function findById(id)       { return notifications.findById(id); }
function findByUser(userId) {
  return notifications.findWhere(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function unreadCount(userId) { return findByUser(userId).filter(n => !n.read).length; }
function create(n)           { return notifications.create(n); }
function update(id, changes) { return notifications.update(id, changes); }
function markAllRead(userId) {
  findByUser(userId).filter(n => !n.read).forEach(n => notifications.update(n.id, { read: true }));
}

module.exports = { findById, findByUser, unreadCount, create, update, markAllRead };
