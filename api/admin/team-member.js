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
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const team = (await get('team')) || [];
  const idx = team.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Team member not found' });

  if (req.method === 'PUT') {
    const body = req.body || {};
    team[idx] = { ...team[idx], ...body, id: team[idx].id, createdAt: team[idx].createdAt, updatedAt: new Date().toISOString() };
    await writeEdgeConfig('team', team);
    return res.json(team[idx]);
  }

  if (req.method === 'DELETE') {
    team.splice(idx, 1);
    await writeEdgeConfig('team', team);
    return res.status(204).end();
  }

  return res.status(405).end();
};
