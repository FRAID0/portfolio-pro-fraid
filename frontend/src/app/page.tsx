'use client'; // On précise que c'est un composant interactif
import { useEffect, useState } from 'react';

interface Project {
  id: number;
  title: string;
  tech: string;
  category: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // On appelle ton API Node.js (qui tourne sur le port 5000)
    fetch('http://localhost:5000/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-blue-400">Portfolio de FRAID</h1>
        <p className="text-gray-400 mb-8 italic">Fullstack Developer | DevOps Enthusiast</p>

        <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">Mes Projets (via API)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <span className="text-xs font-mono text-blue-400 uppercase">{project.category}</span>
              <h3 className="text-xl font-bold mt-1">{project.title}</h3>
              <p className="text-gray-400 mt-2 text-sm">Stack: {project.tech}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}