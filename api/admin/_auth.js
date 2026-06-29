const { verifyToken } = require('../_lib');

async function requireAdmin(req, res) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  const token = auth.slice(7);
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Session expired' });
    return false;
  }
  return true;
}

module.exports = { requireAdmin };
