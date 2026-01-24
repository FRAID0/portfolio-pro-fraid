const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;

/* ======================================================
   ✅ CORS — DOIT ÊTRE AVANT TOUT
====================================================== */
app.use(cors({
  origin: [
    "https://portfolio-pro-fraid-ivno4g1fp-fraids-projects.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-admin-key"
  ],
  credentials: false
}));

/* ✅ Preflight obligatoire (Render / Vercel) */
app.options("*", cors());

/* ======================================================
   MIDDLEWARES
====================================================== */
app.use(express.json());

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

/* ======================================================
   EMAIL (GMAIL)
====================================================== */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "5667tom@gmail.com",
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000
});

/* ======================================================
   ADMIN GUARD
====================================================== */
const checkAdmin = (req, res, next) => {
  const apiKey = req.headers["x-admin-key"];
  if (apiKey && ADMIN_KEY && apiKey === ADMIN_KEY) {
    return next();
  }
  return res.status(403).json({ error: "Accès refusé." });
};

/* ======================================================
   ROUTES PROJETS
====================================================== */
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        tech: true,
        category: true,
        description: true,
        imageUrl: true
      }
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Erreur Prisma:", error);
    res.status(500).json({ error: "Impossible de récupérer les projets." });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  const projectId = Number(req.params.id);
  if (isNaN(projectId)) {
    return res.status(400).json({ error: "ID invalide." });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: "Projet introuvable." });
    }

    res.status(200).json({
      ...project,
      media: [
        {
          type: "image",
          url: project.imageUrl || "https://via.placeholder.com/800x450"
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

/* ======================================================
   CONTACT
====================================================== */
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await prisma.message.create({
      data: {
        senderName: name,
        senderEmail: email,
        content: message
      }
    });

    await transporter.sendMail({
      from: `"Portfolio FRAID" <${email}>`,
      to: "5667tom@gmail.com",
      subject: `📧 Nouveau message de ${name}`,
      text: `Email: ${email}\n\nMessage:\n${message}`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur Contact:", error);
    res.status(500).json({ error: "Impossible d'envoyer le message." });
  }
});

/* ======================================================
   HEALTHCHECK
====================================================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    database: "CONNECTED",
    timestamp: new Date().toISOString()
  });
});

/* ======================================================
   SERVER
====================================================== */
app.listen(port, () => {
  console.log(`🚀 Backend FRAID en ligne sur le port ${port}`);
});
