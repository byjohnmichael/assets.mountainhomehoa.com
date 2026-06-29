const { get } = require('@vercel/edge-config');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const clients = (await get('clients')) || [];

  const publicClients = clients
    .filter((c) => c.enabled && c.showOnClientsPage)
    .map(({ id, name, description, quote, logoUrl, includeAsReference }) => ({
      id, name, description, quote, logoUrl, includeAsReference: includeAsReference || false,
    }));

  return res.json(publicClients);
};
