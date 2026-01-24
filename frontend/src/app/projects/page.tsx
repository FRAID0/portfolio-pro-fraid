'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // CRUCIAL : Importation du lien Next.js

interface Project {
  id: number;
  title: string;
  tech: string;
  category: string;
  description?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    fetch(`${apiUrl}/api/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen py-24 px-6 sm:py-32 lg:px-8 bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Mes Projets</h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Une liste dynamique de mes réalisations, synchronisée avec ma base de données.
          </p>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {projects.map((project) => (
              /* --- AJOUT DU COMPOSANT LINK ICI --- */
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`} 
                className="group relative flex flex-col items-start justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center gap-x-4 text-xs">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1.5 font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20 uppercase tracking-widest">
                    {project.category}
                  </span>
                </div>
                
                <div className="relative">
                  <h3 className="mt-6 text-xl font-bold leading-6 text-white group-hover:text-blue-400 transition">
                    {/* L'absolute inset-0 permet de rendre TOUTE la carte cliquable via le Link parent */}
                    {project.title}
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400 italic">
                    Stack technique : {project.tech}
                  </p>
                </div>

                <div className="mt-8 flex border-t border-slate-800 pt-6 w-full justify-between items-center">
                   <span className="text-xs text-slate-500 font-mono">Détails →</span>
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Live data"></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {projects.length === 0 && !loading && (
          <div className="mt-16 text-center text-slate-500 italic">
            Aucun projet trouvé dans la base de données.
          </div>
        )}
      </div>
    </div>
  );
}