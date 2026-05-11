const { users } = require('./index');

function getAll()               { return users.getAll(); }
function findById(id)           { return users.findById(id); }
function findByEmail(email)     { return users.findWhere(u => u.email === email.toLowerCase())[0] || null; }
function create(user)           { return users.create(user); }
function update(id, changes)    { return users.update(id, changes); }

module.exports = { getAll, findById, findByEmail, create, update };
