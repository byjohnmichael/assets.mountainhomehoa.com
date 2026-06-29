const { createHmac, timingSafeEqual } = require('crypto');

// ── HMAC session tokens (stateless, no DB needed) ────────────────
function generateToken() {
  const expires = Date.now() + 86400000; // 24 hours
  const sig = createHmac('sha256', process.env.ADMIN_SECRET)
    .update(String(expires))
    .digest('hex');
  return `${expires}.${sig}`;
}

function verifyToken(token) {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const expires = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (Date.now() > parseInt(expires, 10)) return false;
  const expected = createHmac('sha256', process.env.ADMIN_SECRET)
    .update(expires)
    .digest('hex');
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// ── Edge Config write (reads use @vercel/edge-config) ────────────
function getEdgeConfigId() {
  const url = process.env.EDGE_CONFIG || '';
  try {
    return new URL(url).pathname.replace(/^\//, ''); // "ecfg_xxx"
  } catch {
    return null;
  }
}

async function writeEdgeConfig(key, value) {
  const id = getEdgeConfigId();
  if (!id) throw new Error('EDGE_CONFIG env var missing or invalid');

  const res = await fetch(`https://api.vercel.com/v1/edge-config/${id}/items`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ operation: 'upsert', key, value }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge Config write failed: ${text}`);
  }
}

module.exports = { generateToken, verifyToken, writeEdgeConfig };
