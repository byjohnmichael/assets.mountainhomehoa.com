const { get } = require('@vercel/edge-config');
const { writeEdgeConfig } = require('../_lib');
const { requireAdmin } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing client id' });

  const clients = (await get('clients')) || [];
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });

  if (req.method === 'PUT') {
    const body = req.body || {};
    const updated = {
      ...clients[idx],
      ...body,
      id: clients[idx].id,
      createdAt: clients[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    clients[idx] = updated;
    await writeEdgeConfig('clients', clients);
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    clients.splice(idx, 1);
    await writeEdgeConfig('clients', clients);
    return res.status(204).end();
  }

  return res.status(405).end();
};
