const { get } = require('@vercel/edge-config');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
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
