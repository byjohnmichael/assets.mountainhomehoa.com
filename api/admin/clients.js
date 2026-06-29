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
    const clients = (await get('clients')) || [];
    return res.json(clients);
  }

  if (req.method === 'POST') {
    const clients = (await get('clients')) || [];
    const body = req.body || {};
    const newClient = {
      id: randomBytes(8).toString('hex'),
      name: body.name || '',
      description: body.description || '',
      quote: body.quote || '',
      fileUrl: body.fileUrl || '',
      filePassword: body.filePassword || '',
      logoUrl: body.logoUrl || '',
      enabled: false,
      showOnClientsPage: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.push(newClient);
    await writeEdgeConfig('clients', clients);
    return res.status(201).json(newClient);
  }

  return res.status(405).end();
};
