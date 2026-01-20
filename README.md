# 🚀 Cloud‑Native Fullstack Infrastructure

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge\&logo=githubactions)](https://github.com/)
[![Dockerized](https://img.shields.io/badge/Infrastructure-Docker-2496ED?style=for-the-badge\&logo=docker)](https://www.docker.com/)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2015%20%7C%20Node.js%20%7C%20PostgreSQL-black?style=for-the-badge)](https://nextjs.org/)

> A **production‑ready, cloud‑native fullstack platform** showcasing modern SDLC, DevOps, and observability best practices. More than a portfolio—this is a real microservices system.

---

## 🧠 Overview

This project demonstrates end‑to‑end engineering skills: **frontend performance**, **API design**, **containerized infrastructure**, and **monitoring/observability**—all automated via **CI/CD**.

**Key goals**:

* Clean, scalable architecture
* Reproducible environments (Docker)
* Measurable performance (Prometheus/Grafana)
* Automated quality gates (GitHub Actions)

---

## 🏗️ System Architecture

The platform is orchestrated with **Docker Compose** and consists of **five isolated but interconnected services**:

* **Frontend** — **Next.js 15 (React 19)** + **Tailwind CSS**

  * Optimized for Core Web Vitals
  * Dynamic, responsive UI

* **Backend** — **Node.js / Express** REST API

  * Central data gateway
  * Health & metrics endpoints

* **Database** — **PostgreSQL**

  * Persistent relational storage
  * Project data & logs

* **Monitoring** — **Prometheus**

  * Real‑time metrics scraping
  * API & container performance

* **Observability** — **Grafana**

  * System uptime dashboards
  * Latency & resource visualization

---

## 🛠️ Technical Stack

| Component          | Technology              | Responsibility                   |
| ------------------ | ----------------------- | -------------------------------- |
| **Frontend**       | Next.js 15 (App Router) | High‑performance UI              |
| **Backend**        | Node.js / Express       | Business logic & REST API        |
| **ORM**            | Prisma                  | Type‑safe DB access & migrations |
| **Infrastructure** | Docker & Docker Compose | Isolation & portability          |
| **Monitoring**     | Prometheus & Grafana    | Metrics & observability          |
| **CI/CD**          | GitHub Actions          | Automated testing & delivery     |

---

## 🚀 Quick Start

The entire stack is **fully dockerized**. One command spins up the full infrastructure.

```bash
# Clone the repository
git clone https://github.com/your-username/portfolio-pro-fraid.git
cd portfolio-pro-fraid

# Start all services
docker compose up -d --build
```

### 🔗 Access Points

* 🌐 **Web App**: [http://localhost:3000](http://localhost:3000)
* ⚙️ **REST API**: [http://localhost:5000/api/projects](http://localhost:5000/api/projects)
* 📊 **Grafana**: [http://localhost:3001](http://localhost:3001) (default: admin / admin)
* 📈 **Prometheus**: [http://localhost:9090](http://localhost:9090)

---

## 🔄 CI/CD Pipeline

Every push triggers a **GitHub Actions workflow** ensuring production readiness:

* **Code Quality** — Linting & formatting checks
* **Automated Testing** — Backend unit tests
* **Docker Build** — Reproducible production images
* **Continuous Deployment** — Auto‑deploy to cloud platforms (Render / Vercel)

> Guarantees: *“Works locally” → “Works in the cloud”*

---

## 📈 DevOps & Observability

The backend exposes dedicated endpoints for infrastructure automation:

* **`/health`** — Liveness & readiness probes for orchestrators
* **`/metrics`** — Prometheus‑scraped metrics

**Monitored insights include**:

* API request latency
* PostgreSQL connection pool health
* Container CPU & memory usage

---

## 💡 Engineering Challenges Solved

* **Cross‑Platform Compatibility**

  * Fixed Windows/Linux binary conflicts (Next.js SWC) using Docker volumes

* **Hot Reloading in Containers**

  * Optimized file‑watching for fast developer feedback

* **Microservices Networking**

  * Managed CORS, internal DNS, and container‑to‑container communication

---

## 👨‍💻 Author

**FRAID** — Applied Computer Science Student
Built with ❤️, Docker, and a DevOps mindset.

---

⭐ *If you like this project, consider starring the repository.*
