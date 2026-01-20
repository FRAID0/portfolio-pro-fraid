const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Configuration du CORS (Autorise ton Frontend sur le port 3000 à parler à ton Backend)
app.use(cors());
app.use(express.json());

// Simulation de données (En attendant que ta DB Postgres soit branchée avec Prisma)
const projects = [
  { id: 1, title: "Projet IoT Sudoku", tech: "Python, MQTT, Docker", category: "IoT" },
  { id: 2, title: "Application Mobile EMA", tech: "Flutter, Firebase", category: "Mobile" },
  { id: 3, title: "TOP (Team oriented project)", tech: "Angular, Node, AWS", category: "Fullstack" }
];

// --- ROUTES API ---

// Récupérer tous les projets
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// --- ROUTES DEVOPS (Monitoring & Health) ---

// Route Healthcheck (Indispensable pour Render et Kubernetes)
app.get('/health', async (req, res) => {
  try {
    // Note: Une fois Prisma configuré, on décommentera la ligne ci-dessous
    // await prisma.$queryRaw`SELECT 1`; 
    res.status(200).json({ status: 'UP', database: 'CONNECTED (MOCK)' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', database: 'ERROR' });
  }
});

// Route Metrics pour Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('portfolio_backend_status 1\nportfolio_api_calls_total 128'); 
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Backend Portfolio opérationnel sur http://localhost:${port}`);
});