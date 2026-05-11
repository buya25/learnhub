const { bookmarks } = require('./index');

function getAll()                           { return bookmarks.getAll(); }
function findById(id)                       { return bookmarks.findById(id); }
function findByUser(userId)                 { return bookmarks.findWhere(b => b.userId === userId); }
function findByUserAndTarget(userId, targetId) {
  return bookmarks.findWhere(b => b.userId === userId && b.targetId === targetId)[0] || null;
}
function create(bookmark)                   { return bookmarks.create(bookmark); }
function remove(id)                         { return bookmarks.remove(id); }
function removeByTarget(userId, targetId)   {
  const b = findByUserAndTarget(userId, targetId);
  return b ? bookmarks.remove(b.id) : false;
}

module.exports = { getAll, findById, findByUser, findByUserAndTarget, create, remove, removeByTarget };
