const { answers } = require('./index');

function getAll()               { return answers.getAll(); }
function findById(id)           { return answers.findById(id); }
function findByPostId(postId)   { return answers.findWhere(a => a.postId === postId); }
function create(answer)         { return answers.create(answer); }
function update(id, changes)    { return answers.update(id, changes); }
function remove(id)             { return answers.remove(id); }

module.exports = { getAll, findById, findByPostId, create, update, remove };
