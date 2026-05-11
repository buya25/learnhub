const SCHEMAS = {
  register: {
    name:     { required: true, maxLen: 60 },
    email:    { required: true, maxLen: 120, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, minLen: 6 },
  },
  login: {
    email:    { required: true },
    password: { required: true },
  },
  resource: {
    title:       { required: true, maxLen: 120 },
    externalLink:{ required: true, maxLen: 500 },
    category:    { required: true },
    description: { maxLen: 1000 },
  },
  post: {
    title:    { required: true, maxLen: 150 },
    body:     { required: true, maxLen: 10000 },
    category: { required: true },
  },
  answer: {
    postId: { required: true },
    body:   { required: true, maxLen: 10000 },
  },
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = SCHEMAS[schemaName];
    if (!schema) return next();

    for (const [field, rules] of Object.entries(schema)) {
      const val = req.body[field];
      const empty = val === undefined || val === null || (typeof val === 'string' && !val.trim());

      if (rules.required && empty)
        return res.status(400).json({ error: `${field} is required` });

      if (val && typeof val === 'string') {
        if (rules.maxLen && val.length > rules.maxLen)
          return res.status(400).json({ error: `${field} must be at most ${rules.maxLen} characters` });
        if (rules.minLen && val.length < rules.minLen)
          return res.status(400).json({ error: `${field} must be at least ${rules.minLen} characters` });
        if (rules.pattern && !rules.pattern.test(val))
          return res.status(400).json({ error: `${field} format is invalid` });
      }
    }
    next();
  };
}

module.exports = { validate };
