const { get } = require('@vercel/edge-config');
const { writeEdgeConfig } = require('../_lib');
const { requireAdmin } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!(await requireAdmin(req, res))) return;
  if (req.method !== 'POST') return res.status(405).end();

  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });

  const team = (await get('team')) || [];
  const reordered = ids.map(id => team.find(m => m.id === id)).filter(Boolean);
  team.forEach(m => { if (!ids.includes(m.id)) reordered.push(m); });

  await writeEdgeConfig('team', reordered);
  return res.json({ ok: true });
};
