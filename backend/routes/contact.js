const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { createRateLimiter, getClientIp } = require('../middleware/rateLimiter');

// 🛡️ Anti-spam basique: limite par IP (in-memory). Suffisant pour Render/Vercel.
// Important: sur plusieurs instances, chaque instance a sa propre mémoire.
const contactRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.CONTACT_RATE_LIMIT_MAX || 20),
  keyFn: (req) => `contact:${getClientIp(req)}`,
});

function requireAdminKey(req, res, next) {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  const apiKey = req.headers['x-admin-key'];

  if (!adminKey) {
    return res.status(500).json({ error: 'Erreur de configuration serveur.' });
  }

  if (apiKey && apiKey === adminKey) return next();
  return res.status(403).json({ error: 'Accès refusé.' });
}

const testEmailRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyFn: (req) => `test-email:${getClientIp(req)}`,
});

// POST /api/contact
router.post('/contact', contactRateLimit, contactController.submitContactForm);

// GET /api/test-email
router.get('/test-email', testEmailRateLimit, requireAdminKey, contactController.testEmail);

module.exports = router;
