'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  tech: string;
  category: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data.slice(0, 4))) // 4 projets récents
      .catch((err) => console.error('Erreur API:', err));
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* --- Effets de fond --- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16 lg:pt-40 lg:flex lg:items-center lg:gap-x-12">
        
        {/* --- SECTION GAUCHE --- */}
        <div className="flex-1 max-w-2xl lg:max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Disponible pour nouveaux défis en 2026
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            Salut, je suis <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-500">
              FRAID
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-400 leading-relaxed mb-10">
            Étudiant en <span className="text-white font-medium italic">Informatique Appliquée</span> à la Hochschule Worms.
            Je conçois des solutions à l’intersection du{' '}
            <span className="text-blue-400">Web</span>, de l’
            <span className="text-purple-400">IoT</span> et du{' '}
            <span className="text-indigo-400">DevOps</span>.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href="/projects"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
            >
              Explorer mes projets
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-800 transition-all backdrop-blur-md"
            >
              Mon parcours
            </Link>
          </div>
        </div>

        {/* --- SECTION DROITE : PROJETS --- */}
        <div className="flex-1 mt-16 lg:mt-0 relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000" />

          <div className="relative bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Projets récents <span className="text-blue-500 ml-2">/ API Live</span>
              </h2>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-5 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all cursor-default"
                  >
                    <span className="inline-block mb-2 text-[10px] font-mono text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/20">
                      {project.category}
                    </span>
                    <h3 className="text-white font-semibold text-base mb-1">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 text-[11px] leading-tight line-clamp-2">
                      {project.tech}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-12 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
                  <p className="text-slate-500 text-xs">
                    Synchronisation avec Render…
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/projects"
              className="block text-center mt-8 text-xs text-slate-500 hover:text-blue-400 transition-colors underline underline-offset-4"
            >
              Consulter l&apos;archive complète des projets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
