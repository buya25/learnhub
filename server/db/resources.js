const { resources } = require('./index');

function getAll()                   { return resources.getAll(); }
function findById(id)               { return resources.findById(id); }
function findByCategory(category)   { return resources.findWhere(r => r.category.toLowerCase() === category.toLowerCase()); }
function create(resource)           { return resources.create(resource); }
function update(id, changes)        { return resources.update(id, changes); }
function remove(id)                 { return resources.remove(id); }

module.exports = { getAll, findById, findByCategory, create, update, remove };
