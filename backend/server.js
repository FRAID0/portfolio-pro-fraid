const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Importé pour l'envoi d'emails
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;

// Configuration CORS
app.use(cors({
  origin: [
    "https://portfolio-pro-fraid-68rp6xsg4-fraids-projects.vercel.app", 
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-key"]
}));

app.use(express.json());

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

// Configuration du transporteur Nodemailer vers 5667tom@gmail.com
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '5667tom@gmail.com',
    pass: process.env.EMAIL_PASSWORD // Ton mot de passe d'application
  }
});

// Middleware de sécurité pour l'admin
const checkAdmin = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'];
  if (apiKey && ADMIN_KEY && apiKey === ADMIN_KEY) {
    next();
  } else {
    res.status(403).json({ error: "Accès refusé. Clé API invalide." });
  }
};

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
  const projectId = parseInt(id);
  if (isNaN(projectId)) return res.status(400).json({ error: "ID invalide." });

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "Projet introuvable." });

    res.json({
      ...project,
      media: [{ type: 'image', url: project.imageUrl || 'https://via.placeholder.com/800x450' }]
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// --- ROUTE CONTACT (Hybride Prisma + Email) ---

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // 1. Sauvegarde locale pour l'historique admin
    await prisma.message.create({
      data: { senderName: name, senderEmail: email, content: message }
    });

    // 2. Notification mail instantanée vers ton Gmail
    const mailOptions = {
      from: email,
      to: '5667tom@gmail.com',
      subject: `📧 Nouveau message Portfolio de ${name}`,
      text: `De: ${name} (${email})\n\nMessage: ${message}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Message envoyé et reçu !" });
  } catch (error) {
    console.error("Erreur Contact:", error);
    res.status(500).json({ error: "Impossible d'envoyer le message." });
  }
});

// --- DEVOPS ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', database: 'CONNECTED', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Backend Portfolio FRAID prêt sur http://localhost:${port}`);
});