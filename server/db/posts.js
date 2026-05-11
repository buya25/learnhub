const { posts } = require('./index');

function getAll()                  { return posts.getAll(); }
function findById(id)              { return posts.findById(id); }
function findByCategory(category)  { return posts.findWhere(p => p.category.toLowerCase() === category.toLowerCase()); }
function create(post)              { return posts.create(post); }
function update(id, changes)       { return posts.update(id, changes); }
function remove(id)                { return posts.remove(id); }

module.exports = { getAll, findById, findByCategory, create, update, remove };
