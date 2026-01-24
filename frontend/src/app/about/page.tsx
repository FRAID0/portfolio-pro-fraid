// About.tsx
'use client';

export default function About() {
  const experiences = [
    {
      date: "2023 – Present",
      title: "Bachelor en Informatique Appliquée",
      location: "Hochschule Worms, Allemagne",
      description:
        "Études focalisées sur génie logiciel, systèmes distribués et Cloud. Cours clés : bases de données, architecture logicielle, DevOps, sécurité.",
    },
    {
      date: "2024",
      title: "Développeur Full-Stack (projets académiques & perso)",
      location: "Worms / Remote",
      description:
        "Réalisation de projets Web et mobile : frontend (React/Next.js, Angular, Flutter), backend Node.js/Express, ORM Sequelize. Exemples : SkillBridge (plateforme de mise en relation), prototype IoT (Sudoku connecté) et application mobile.",
    },
    {
      date: "2025 (Praktikum)",
      title: "Praktikant - PWO AG (DevOps / Automation)",
      location: "PWO / Onsite",
      description:
        "Participation à l'automatisation des processus : création de scripts d'automatisation SQL, intégration CI/CD (Azure DevOps), prototype d'interface Web pour gestion de références et déploiement d'un pipeline de tests.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 pt-24 pb-20">
      {/* Glow de fond */}
      <div className="absolute top-0 right-0 w-75 h-75 bg-blue-600/10 blur-[120px] -z-10" />

      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* --- Header --- */}
        <section className="mb-20 text-center lg:text-left">
          <h1 className="text-4xl font-extrabold text-white mb-6 lg:text-5xl">
            À propos de <span className="text-blue-500">Wilfried</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-3xl">
            Étudiant en <span className="text-white font-medium">Angewandte Informatik</span> à la Hochschule Worms,
            passionné par le développement Full-Stack, l'automatisation et l'ingénierie Cloud. J'aime transformer des
            problèmes complexes en solutions simples, robustes et maintenables.
          </p>

          {/* Contact / disponibilité rapide */}
          <div className="mt-6 text-sm text-slate-400">
            <span className="mr-4">📍 Mannheim</span>
            <span className="mr-4">✉️ 5667tom@gmail.com</span>
            <span>📞 0151 000 40050</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">Disponible pour Praktikum, Werkstudent ou Bachelor-Thesis (à partir de Septembre).</p>
        </section>

        {/* --- Timeline Expériences --- */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-4">
            <span className="h-px w-12 bg-blue-500"></span>
            Parcours & Expériences
          </h2>

          <div className="space-y-12 border-l-2 border-slate-900 ml-4 pl-8 relative">
            {experiences.map((exp, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-10.25 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-slate-950 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />

                <span className="text-xs font-mono text-blue-500 font-bold uppercase tracking-wider">
                  {exp.date}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {exp.title}
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  {exp.location}
                </p>
                <p className="text-slate-400 leading-relaxed max-w-2xl">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Skills Grid --- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-purple-500"></span>
            Compétences techniques 
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkillCard
              title="Langages"
              skills={["TypeScript", "Python", "JavaScript"]}
              color="blue"
            />
            <SkillCard
              title="Frontend"
              skills={["React / Next.js", "Angular", "Tailwind CSS", "Flutter"]}
              color="purple"
            />
            <SkillCard
              title="Backend"
              skills={["Node.js", "Express", "FASTAPI", "Sequelize / ORM"]}
              color="indigo"
            />
            <SkillCard
              title="Bases de données"
              skills={["PostgreSQL", "MySQL", "MS-SQL", "SQLite"]}
              color="blue"
            />
            <SkillCard
              title="DevOps & Cloud"
              skills={["Docker", "Azure DevOps", "CI/CD", "MLOps (Grundlagen)"]}
              color="purple"
            />
            <SkillCard
              title="Outils & Méthodes"
              skills={["Git", "REST APIs", "Mockups (Figma/Sketch)", "Agile / Scrum"]}
              color="indigo"
            />
          </div>
        </section>

        {/* --- Projets sélectionnés --- */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-green-500"></span>
            Projets sélectionnés
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProjectCard
              title="SkillBridge — Plateforme de mise en relation"
              bullets={[
                "Plateforme full-stack (auth, profils, gestion des compétences)",
                "Frontend Angular/React, Backend Node.js + Sequelize, PostgreSQL",
                "Focus sécurité, tests et workflows CI basiques",
              ]}
            />
            <ProjectCard
              title="Automatisation & DevOps (PWO Internship)"
              bullets={[
                "Automatisation des comparaisons Ist⇄Soll (SQL + option Python)",
                "Mise en place de pipelines Azure DevOps, documentation de déploiement",
                "Prototype d'interface Web pour gestion de références",
              ]}
            />
            <ProjectCard
              title="Workshop-Management (TOP Projekt)"
              bullets={[
                "Webapp pour gestion du cycle des workshops (Anfrage → Genehmigung → Veröffentlichung)",
                "Backend Node.js, PostgreSQL, upload de documents, gestion des rôles",
              ]}
            />
            <ProjectCard
              title="IoT & Mobile (projet university)"
              bullets={[
                "Prototype Sudoku connecté (IoT) et application mobile Flutter",
                "Intégration capteurs simple + backend minimal pour échanges",
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SkillCard({
  title,
  skills,
  color,
}: {
  title: string;
  skills: string[];
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/20 text-blue-400",
    purple: "border-purple-500/20 text-purple-400",
    indigo: "border-indigo-500/20 text-indigo-400",
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-slate-900/40 border ${colorMap[color]} backdrop-blur-sm`}
    >
      <h3 className="text-white font-bold mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-slate-950 rounded-lg text-xs font-medium border border-slate-800"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800">
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <ul className="list-disc list-inside text-slate-400">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
