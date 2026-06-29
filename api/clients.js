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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const clients = (await get('clients')) || [];

  const publicClients = clients
    .filter((c) => c.enabled && c.showOnClientsPage)
    .map(({ id, name, description, quote, logoUrl }) => ({
      id, name, description, quote, logoUrl,
    }));

  return res.json(publicClients);
};
