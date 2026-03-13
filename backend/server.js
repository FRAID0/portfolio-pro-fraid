const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const contactRoutes = require('./routes/contact');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const port = process.env.PORT || 5000;

// Render/Vercel are behind proxies; this fixes req.ip and secure detection.
app.set('trust proxy', 1);

function parseCommaList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const configuredCorsOrigins = parseCommaList(process.env.CORS_ORIGINS);
const allowVercelPreviewOrigins = process.env.CORS_ALLOW_VERCEL_PREVIEW === 'true';
const allowedOrigins = new Set([
  ...configuredCorsOrigins,
  // Local dev
  'http://localhost:3000',
]);

// Configuration CORS (env-based)
app.use(cors({
  origin: (origin, cb) => {
    // 1. Autoriser les clients non-navigateurs (Postman, etc.)
    if (!origin) return cb(null, true);

    // 2. Vérifier les origines explicites configurées
    if (allowedOrigins.has(origin)) return cb(null, true);

    // 3. Autoriser dynamiquement les previews Vercel
    const isVercelPreview = allowVercelPreviewOrigins && (
      origin.endsWith('.vercel.app') || 
      /^https:\/\/portfolio-pro-fraid-.*\.vercel\.app$/.test(origin)
    );

    if (isVercelPreview) {
      return cb(null, true);
    }

    // 4. Bloquer et logger pour debug si besoin
    console.warn(`[CORS] Origine bloquée : ${origin}`);
    return cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-key", "Origin"]
}));

function setSecurityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  const enableHsts = process.env.ENABLE_HSTS === 'true';
  if (enableHsts && req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000');
  }

  next();
}

app.use(setSecurityHeaders);

app.use(express.json({ limit: '200kb' }));

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

// Email routes
app.use('/api', contactRoutes);

function normalizePath(path) {
  // Reduce high-cardinality metrics by normalizing obvious IDs.
  return path
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi, '/:uuid');
}

function escapeLabelValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

const metrics = {
  startedAt: Date.now(),
  requestsTotal: new Map(), // key => count
  requestDurationMs: new Map(), // key => { count, sum }
};

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const path = normalizePath(req.path || '/');
    const key = `${req.method}|${path}|${res.statusCode}`;

    metrics.requestsTotal.set(key, (metrics.requestsTotal.get(key) || 0) + 1);
    const existing = metrics.requestDurationMs.get(key) || { count: 0, sum: 0 };
    existing.count += 1;
    existing.sum += durationMs;
    metrics.requestDurationMs.set(key, existing);
  });
  next();
});

// Middleware de sécurité pour l'admin
const checkAdmin = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'];
  
  // Debug log (à retirer après résolution)
  console.log(`[AUTH] Key received: "${apiKey}" | Expected: "${ADMIN_KEY}"`);

  if (!ADMIN_KEY) {
    console.error("[CRITICAL] ADMIN_SECRET_KEY is NOT defined in .env!");
    return res.status(500).json({ error: "Erreur de configuration serveur." });
  }

  if (apiKey && apiKey === ADMIN_KEY) {
    next();
  } else {
    res.status(403).json({ error: "Accès refusé. Clé API invalide." });
  }
};

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

function containsLink(text) {
  if (!text) return false;
  const linkRegex = /(https?:\/\/|www\.|<a\s|mailto:)/gi;
  return linkRegex.test(text);
}

const contactRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyFn: (req) => `contact:${getClientIp(req)}`,
});

const adminRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 60,
  keyFn: (req) => `admin:${getClientIp(req)}`,
});

app.get('/api/admin/verify', adminRateLimit, checkAdmin, (req, res) => {
  res.status(200).json({ valid: true });
});

// --- ROUTES UPLOAD SUPABASE ---

app.post('/api/upload/image', adminRateLimit, checkAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier fourni." });
    
    const { folder = 'projects-images' } = req.body;
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('projects')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('projects')
      .getPublicUrl(filePath);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Erreur lors de l'upload vers Supabase." });
  }
});

app.post('/api/upload/document', adminRateLimit, checkAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier fourni." });
    
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.pdf`;
    const filePath = `documents/${fileName}`;

    const { data, error } = await supabase.storage
      .from('projects')
      .upload(filePath, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('projects')
      .getPublicUrl(filePath);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Erreur lors de l'upload du document." });
  }
});

app.delete('/api/upload', adminRateLimit, checkAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL requise." });

    const parts = url.split('/projects/');
    if (parts.length < 2) return res.status(400).json({ error: "URL invalide." });
    
    const filePath = parts[1];
    const { error } = await supabase.storage.from('projects').remove([filePath]);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});


// --- ROUTES PROJETS ---

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, tech: true, category: true, description: true, imageUrl: true }
    });
    res.json(projects);
  } catch (error) {
    console.error("Erreur Prisma (Liste):", error);
    res.status(500).json({ error: "Impossible de récupérer les projets." });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Projet introuvable." });

    res.json({
      ...project,
      media: [{ type: 'image', url: project.imageUrl || 'https://via.placeholder.com/800x450' }]
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

app.post('/api/projects', adminRateLimit, checkAdmin, async (req, res) => {
  const { title, tech, category, description, imageUrl, githubLink, liveLink } = req.body || {};

  const safeTitle = typeof title === 'string' ? title.trim() : '';
  const safeTech = typeof tech === 'string' ? tech.trim() : '';
  const safeCategory = typeof category === 'string' ? category.trim() : '';
  const safeDescription = typeof description === 'string' ? description.trim() : '';

  if (!safeTitle || safeTitle.length > 120) return res.status(400).json({ error: "Titre invalide." });
  if (!safeTech || safeTech.length > 200) return res.status(400).json({ error: "Tech invalide." });
  if (!safeCategory || safeCategory.length > 40) return res.status(400).json({ error: "Catégorie invalide." });
  if (!safeDescription || safeDescription.length > 2000) return res.status(400).json({ error: "Description invalide." });

  try {
    const created = await prisma.project.create({
      data: {
        title: safeTitle,
        tech: safeTech,
        category: safeCategory,
        description: safeDescription,
        imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : null,
        githubLink: typeof githubLink === 'string' ? githubLink.trim() : null,
        liveLink: typeof liveLink === 'string' ? liveLink.trim() : null,
      },
      select: { id: true, title: true, tech: true, category: true, description: true, imageUrl: true, githubLink: true, liveLink: true, createdAt: true }
    });
    return res.status(201).json(created);
  } catch (error) {
    console.error("Erreur Prisma (Create Project):", error);
    return res.status(500).json({ error: "Impossible de créer le projet." });
  }
});

app.delete('/api/projects/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });

  try {
    await prisma.project.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur Prisma (Delete Project):", error);
    return res.status(500).json({ error: "Impossible de supprimer le projet." });
  }
});

app.put('/api/projects/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });

  const { title, tech, category, description, imageUrl, githubLink, liveLink } = req.body || {};
  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title: String(title).trim() }),
        ...(tech && { tech: String(tech).trim() }),
        ...(category && { category: String(category).trim() }),
        ...(description && { description: String(description).trim() }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? String(imageUrl).trim() : null }),
        ...(githubLink !== undefined && { githubLink: githubLink ? String(githubLink).trim() : null }),
        ...(liveLink !== undefined && { liveLink: liveLink ? String(liveLink).trim() : null })
      }
    });
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Erreur Prisma (Update Project):", error);
    return res.status(500).json({ error: "Impossible de mettre à jour le projet." });
  }
});

// --- ROUTES SKILLS ---
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    res.json(skills);
  } catch (error) {
    return res.status(500).json({ error: "Impossible de récupérer les compétences." });
  }
});

app.post('/api/skills', adminRateLimit, checkAdmin, async (req, res) => {
  const { name, category, level } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: "Données invalides." });
  try {
    const created = await prisma.skill.create({
      data: {
        name: String(name).trim(),
        category: String(category).trim(),
        level: level ? String(level).trim() : null
      }
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur lors de la création." });
  }
});

app.put('/api/skills/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });
  const { name, category, level } = req.body || {};
  try {
    const updated = await prisma.skill.update({
      where: { id },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(category && { category: String(category).trim() }),
        ...(level !== undefined && { level: level ? String(level).trim() : null })
      }
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
});

app.delete('/api/skills/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });
  try {
    await prisma.skill.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Impossible de supprimer la compétence." });
  }
});

// --- ROUTES TAGS ---
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    return res.status(500).json({ error: "Impossible de récupérer les tags." });
  }
});

app.post('/api/tags', adminRateLimit, checkAdmin, async (req, res) => {
  const { name, type } = req.body || {};
  if (!name || !type) return res.status(400).json({ error: "Données invalides." });
  try {
    const created = await prisma.tag.create({
      data: {
        name: String(name).trim(),
        type: String(type).trim().toUpperCase()
      }
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la création du tag (Peut-être qu'il existe déjà ?)." });
  }
});

app.delete('/api/tags/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });
  try {
    await prisma.tag.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Impossible de supprimer ce tag." });
  }
});

// --- ROUTES CERTIFICATS ---
app.get('/api/certificates', async (req, res) => {
  try {
    const certs = await prisma.certificate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(certs);
  } catch (error) {
    return res.status(500).json({ error: "Impossible de récupérer les certificats." });
  }
});

app.post('/api/certificates', adminRateLimit, checkAdmin, async (req, res) => {
  const { title, issuer, date, link, imageUrl } = req.body || {};
  if (!title || !issuer) return res.status(400).json({ error: "Le titre et l'organisme sont requis." });
  try {
    const created = await prisma.certificate.create({
      data: {
        title: String(title).trim(),
        issuer: String(issuer).trim(),
        date: date ? String(date).trim() : null,
        link: link ? String(link).trim() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
      }
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur lors de la création du certificat." });
  }
});

app.put('/api/certificates/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });
  const { title, issuer, date, link, imageUrl } = req.body || {};
  try {
    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        ...(title && { title: String(title).trim() }),
        ...(issuer && { issuer: String(issuer).trim() }),
        ...(date !== undefined && { date: date ? String(date).trim() : null }),
        ...(link !== undefined && { link: link ? String(link).trim() : null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? String(imageUrl).trim() : null })
      }
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Impossible de mettre à jour le certificat." });
  }
});

app.delete('/api/certificates/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });
  try {
    await prisma.certificate.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Impossible de supprimer ce certificat." });
  }
});

// --- ROUTES EXPERIENCES (PARCOURS) ---
app.get('/api/experiences', async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { order: 'desc' } // Reversed as requested (Practical at top if order is high)
    });
    res.json(experiences);
  } catch (error) {
    return res.status(500).json({ error: "Impossible de récupérer le parcours." });
  }
});

app.post('/api/experiences', adminRateLimit, checkAdmin, async (req, res) => {
  const { title, company, location, period, description, order } = req.body || {};
  if (!title || !period || !description) return res.status(400).json({ error: "Titre, période et description requis." });
  try {
    const created = await prisma.experience.create({
      data: {
        title: String(title).trim(),
        company: company ? String(company).trim() : null,
        location: location ? String(location).trim() : null,
        period: String(period).trim(),
        description: String(description).trim(),
        order: parseInt(order) || 0
      }
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur lors de la création de l'expérience." });
  }
});

app.put('/api/experiences/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });
  const { title, company, location, period, description, order } = req.body || {};
  try {
    const updated = await prisma.experience.update({
      where: { id },
      data: {
        ...(title && { title: String(title).trim() }),
        ...(company !== undefined && { company: company ? String(company).trim() : null }),
        ...(location !== undefined && { location: location ? String(location).trim() : null }),
        ...(period && { period: String(period).trim() }),
        ...(description && { description: String(description).trim() }),
        ...(order !== undefined && { order: parseInt(order) || 0 })
      }
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Impossible de mettre à jour l'expérience." });
  }
});

app.delete('/api/experiences/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });
  try {
    await prisma.experience.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Impossible de supprimer cette expérience." });
  }
});

// Admin messages
app.get('/api/messages', adminRateLimit, checkAdmin, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, senderName: true, senderEmail: true, content: true, createdAt: true }
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur Prisma (List Messages):", error);
    return res.status(500).json({ error: "Impossible de récupérer les messages." });
  }
});

app.delete('/api/messages/:id', adminRateLimit, checkAdmin, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID invalide." });

  try {
    await prisma.message.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur Prisma (Delete Message):", error);
    return res.status(500).json({ error: "Impossible de supprimer le message." });
  }
});// --- ROUTES ADMIN PROFILE ---

app.get('/api/profile', async (req, res) => {
  try {
    const profile = await prisma.adminProfile.findFirst();
    res.json(profile || {});
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du profil." });
  }
});

app.post('/api/profile', adminRateLimit, checkAdmin, async (req, res) => {
  const { name, photoUrl, bio, contactEmail } = req.body || {};
  try {
    const existing = await prisma.adminProfile.findFirst();
    let profile;
    if (existing) {
      profile = await prisma.adminProfile.update({
        where: { id: existing.id },
        data: { name, photoUrl, bio, contactEmail }
      });
    } else {
      profile = await prisma.adminProfile.create({
        data: { name, photoUrl, bio, contactEmail }
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
});

// --- ROUTE CONTACT (Hybride Prisma + Email) ---

app.post('/api/contact', contactRateLimit, async (req, res) => {
  const { name, email, message } = req.body || {};
  const safeName = typeof name === 'string' ? name.trim() : '';
  const safeEmail = typeof email === 'string' ? email.trim() : '';
  const safeMessage = typeof message === 'string' ? message.trim() : '';

  if (!safeName || safeName.length > 80) {
    return res.status(400).json({ error: "Nom invalide." });
  }

  if (!safeEmail || safeEmail.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(safeEmail)) {
    return res.status(400).json({ error: "Email invalide." });
  }

  if (!safeMessage || safeMessage.length > 2000) {
    return res.status(400).json({ error: "Message invalide." });
  }

  if (containsLink(safeMessage)) {
    return res.status(400).json({ error: "Les liens ne sont pas autorisés dans le message." });
  }

  try {
    // 1. Sauvegarde locale pour l'historique admin
    await prisma.message.create({
      data: { senderName: safeName, senderEmail: safeEmail, content: safeMessage }
    });

    // 2. Notification mail instantanée
    const toEmail = process.env.CONTACT_TO_EMAIL || '5667tom@gmail.com';
    const fromEmail = process.env.CONTACT_FROM_EMAIL || '5667tom@gmail.com';
    const mailOptions = {
      from: fromEmail,
      replyTo: safeEmail,
      to: toEmail,
      subject: `📧 Nouveau message Portfolio de ${safeName}`,
      text: `De: ${safeName} (${safeEmail})\n\nMessage: ${safeMessage}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Message envoyé et reçu !" });
  } catch (error) {
    console.error("Erreur Contact:", error);
    res.status(500).json({ error: "Impossible d'envoyer le message." });
  }
});

// --- DEVOPS ---
app.get('/health', async (req, res) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error) {
    console.error("Health DB check failed:", error);
  }

  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'UP' : 'DEGRADED',
    database: dbOk ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');

  const lines = [];
  lines.push('# HELP fortlion_http_requests_total Total HTTP requests.');
  lines.push('# TYPE fortlion_http_requests_total counter');

  for (const [key, count] of metrics.requestsTotal.entries()) {
    const [method, path, status] = key.split('|');
    lines.push(
      `fortlion_http_requests_total{method="${escapeLabelValue(method)}",path="${escapeLabelValue(path)}",status="${escapeLabelValue(status)}"} ${count}`
    );
  }

  lines.push('# HELP fortlion_http_request_duration_ms Total request duration in milliseconds.');
  lines.push('# TYPE fortlion_http_request_duration_ms_sum counter');
  for (const [key, v] of metrics.requestDurationMs.entries()) {
    const [method, path, status] = key.split('|');
    lines.push(
      `fortlion_http_request_duration_ms_sum{method="${escapeLabelValue(method)}",path="${escapeLabelValue(path)}",status="${escapeLabelValue(status)}"} ${v.sum}`
    );
  }

  lines.push('# TYPE fortlion_http_request_duration_ms_count counter');
  for (const [key, v] of metrics.requestDurationMs.entries()) {
    const [method, path, status] = key.split('|');
    lines.push(
      `fortlion_http_request_duration_ms_count{method="${escapeLabelValue(method)}",path="${escapeLabelValue(path)}",status="${escapeLabelValue(status)}"} ${v.count}`
    );
  }

  lines.push('# HELP fortlion_process_uptime_seconds Process uptime in seconds.');
  lines.push('# TYPE fortlion_process_uptime_seconds gauge');
  lines.push(`fortlion_process_uptime_seconds ${process.uptime()}`);

  lines.push('# HELP fortlion_nodejs_memory_rss_bytes Resident set size in bytes.');
  lines.push('# TYPE fortlion_nodejs_memory_rss_bytes gauge');
  lines.push(`fortlion_nodejs_memory_rss_bytes ${process.memoryUsage().rss}`);

  res.status(200).send(lines.join('\n') + '\n');
});

app.listen(port, () => {
  console.log(`🚀 Backend Portfolio FRAID prêt sur http://localhost:${port}`);
});
