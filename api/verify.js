const { get } = require('@vercel/edge-config');

const ALLOWED_ORIGINS = [
  'https://mountainhomehoa.com',
  'https://www.mountainhomehoa.com',
  'http://localhost:4000',
  'http://localhost:3000',
];

module.exports = async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { id, password } = req.body || {};
  if (!id || !password) {
    return res.status(400).json({ error: 'Missing id or password' });
  }

  const clients = (await get('clients')) || [];
  const client = clients.find((c) => c.id === id && c.enabled);

  if (!client) return res.status(404).json({ error: 'Client not found' });
  if (client.filePassword !== password) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  return res.json({ url: client.fileUrl });
};
