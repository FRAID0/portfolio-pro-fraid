# 🚀 Cloud-Native Fullstack Infrastructure

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge&logo=githubactions)](https://github.com/)
[![Dockerized](https://img.shields.io/badge/Infrastructure-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2015%20%7C%20Node%20%7C%20PostgreSQL-black?style=for-the-badge)](https://nextjs.org/)

This project is not just a static portfolio. It is a **full microservices architecture**, containerized and monitored, designed to demonstrate mastery of modern software development life cycles (SDLC) and DevOps practices.

## 🏗️ System Architecture

The application is orchestrated via **Docker Compose** and consists of 5 interconnected services:

* **Frontend**: Built with **Next.js 15 (React 19)** and **Tailwind CSS**. Optimized for Core Web Vitals and featuring a dynamic UI.
* **Backend**: A **Node.js / Express** REST API serving as the data gateway.
* **Database**: **PostgreSQL** for persistent, relational data management of projects and logs.
* **Monitoring (Prometheus)**: Real-time collection of server health metrics and API performance.
* **Observability (Grafana)**: Advanced visualization of system uptime and performance metrics.



## 🛠️ Technical Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | Dynamic UI & High Performance |
| **Backend** | Node.js / Express | Business Logic & RESTful API |
| **ORM** | Prisma | Secure Database Management & Migrations |
| **Infrastructure** | Docker & Docker Compose | Isolation, Portability & Environment Consistency |
| **Monitoring** | Prometheus & Grafana | Real-time Observability & Health Dashboards |
| **CI/CD** | GitHub Actions | Automated Testing & Continuous Deployment |

## 🚀 Quick Start

The entire project is fully "Dockerized". You can launch the full infrastructure with a single command:

```bash
# Clone the repository
git clone [https://github.com/your-username/portfolio-pro-fraid.git](https://github.com/your-username/portfolio-pro-fraid.git)

# Launch all services
docker-compose up -d --build
Access Points:
🌐 Web Application: http://localhost:3000

⚙️ REST API: http://localhost:5000/api/projects

📊 Monitoring Dashboard: http://localhost:3001 (Default: admin/admin)

📈 Metrics Endpoint: http://localhost:9090

🔄 CI/CD Pipeline
Every code change triggers a GitHub Actions workflow that ensures production readiness:

Code Quality: Runs linters and formatting checks.

Automated Testing: Executes backend unit tests to prevent regressions.

Docker Build: Builds production-ready images to ensure "it works on my machine" translates to "it works in the cloud."

Auto-Deployment: Continuous Deployment (CD) to cloud providers (Render/Vercel) upon successful builds.

📈 DevOps Insights
The API exposes a /health endpoint used by cloud orchestrators for Liveness Probes. Detailed metrics are exposed on /metrics and scraped by Prometheus, allowing for:

API request latency monitoring.

PostgreSQL connection pool health tracking.

Container resource utilization analysis.

💡 Challenges Overcome
Cross-Platform Dependency Management: Resolved Windows vs. Linux binary conflicts (SWC/Next.js) using Docker anonymous volumes.

Hot Reloading in Containers: Optimized file-watching triggers for development within virtualized environments.

Microservices Communication: Managed Cross-Origin Resource Sharing (CORS) and internal networking between isolated containers.

Created with ❤️ by FRAID - Applied Computer Science Student.