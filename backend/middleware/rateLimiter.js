function createRateLimiter({ windowMs, max, keyFn }) {
  const hits = new Map(); // key -> { resetAt, count }

  return (req, res, next) => {
    const now = Date.now();
    const key = keyFn(req);
    if (!key) return next();

    const current = hits.get(key);
    if (!current || now >= current.resetAt) {
      hits.set(key, { resetAt: now + windowMs, count: 1 });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ error: 'Trop de requêtes. Réessayez plus tard.' });
    }

    return next();
  };
}

function getClientIp(req) {
  return req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
}

module.exports = { createRateLimiter, getClientIp };

