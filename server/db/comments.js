const { comments } = require('./index');

function findByTarget(targetId) {
  return comments.findWhere(c => c.targetId === targetId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function findById(id)        { return comments.findById(id); }
function create(data)        { return comments.create(data); }
function remove(id)          { return comments.remove(id); }

module.exports = { findByTarget, findById, create, remove };
