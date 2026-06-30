const { get } = require('@vercel/edge-config');
const { randomBytes } = require('crypto');
const { writeEdgeConfig } = require('../_lib');
const { requireAdmin } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'GET') {
    const team = (await get('team')) || [];
    return res.json(team);
  }

  if (req.method === 'POST') {
    const team = (await get('team')) || [];
    const body = req.body || {};
    const member = {
      id: randomBytes(8).toString('hex'),
      name: body.name || '',
      role: body.role || '',
      bio: body.bio || '',
      photoUrl: body.photoUrl || '',
      enabled: body.enabled || false,
      showOnHome: body.showOnHome || false,
      showOnAbout: body.showOnAbout || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    team.push(member);
    await writeEdgeConfig('team', team);
    return res.status(201).json(member);
  }

  return res.status(405).end();
};
