const { put } = require('@vercel/blob');
const { requireAdmin } = require('./_auth');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = await requireAdmin(req, res);
  if (!token) return;

  if (req.method !== 'POST') return res.status(405).end();

  const { base64, contentType, filename } = req.body || {};
  if (!base64 || !contentType || !filename) {
    return res.status(400).json({ error: 'Missing base64, contentType, or filename' });
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return res.status(400).json({ error: 'File type not allowed. Use JPEG, PNG, WebP, or SVG.' });
  }

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: 'File too large. Maximum size is 2 MB.' });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const blob = await put(`logos/${Date.now()}-${safeName}`, buffer, {
    access: 'public',
    contentType,
  });

  return res.json({ url: blob.url });
};
