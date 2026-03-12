'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Project {
  id: number;
  title: string;
  tech: string;
  category: string;
}

interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date?: string;
  link?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/projects`).then(res => res.json()).catch(() => []),
      fetch(`/api/certificates`).then(res => res.json()).catch(() => [])
    ])
      .then(([projectsData, certsData]) => {
        if (Array.isArray(projectsData)) setProjects(projectsData.slice(0, 4));
        if (Array.isArray(certsData)) setCertificates(certsData.slice(0, 3));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Erreur API Globale:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Background gradients & noise */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-20 lg:pt-36 lg:flex lg:items-center lg:gap-x-12 relative z-10">

        {/* LEFT SECTION: Hero Copy */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 max-w-2xl lg:max-w-xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-10 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </span>
            Disponible pour 2026
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Salut, je suis <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-sm">
              FRAID
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-400 leading-relaxed mb-10 font-light">
            Étudiant en <span className="text-slate-200 font-medium">Informatique Appliquée</span> à la Hochschule Worms.
            Je conçois des solutions performantes à l’intersection du{' '}
            <span className="text-blue-400 font-medium">Web</span>, de l’
            <span className="text-purple-400 font-medium">IoT</span> et du{' '}
            <span className="text-indigo-400 font-medium">DevOps</span>.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 items-center">
            <Link
              href="/projects"
              className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative">Explorer mes projets</span>
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all backdrop-blur-md"
            >
              Mon parcours
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT SECTION: Projects Grid */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="flex-1 mt-20 lg:mt-0 relative group perspective-1000"
        >
          {/* Glowing backplate */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 group-hover:blur-2xl transition duration-700" />

          {/* Glass Card */}
          <div className="relative bg-slate-900/60 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">
                  Projets Récents
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  API Live
                </span>
              </div>

              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-1 sm:col-span-2 py-16 flex flex-col items-center justify-center border border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
                  <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-400 text-xs tracking-wide uppercase font-medium">Synchronisation...</p>
                </div>
              ) : projects.length > 0 ? (
                projects.map((project, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    key={project.id}
                    className="group/card relative p-5 rounded-2xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 hover:border-blue-500/40 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                    <span className="inline-block mb-3 text-[10px] font-mono text-blue-300 bg-blue-900/30 px-2 py-1 rounded-md border border-blue-700/30 uppercase tracking-wider">
                      {project.category}
                    </span>
                    <h3 className="text-slate-100 font-semibold text-base mb-1.5 group-hover/card:text-blue-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {project.tech}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 py-12 text-center border border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
                  <p className="text-slate-500 text-sm">Aucun projet trouvé.</p>
                </div>
              )}
            </div>

            <Link
              href="/projects"
              className="group flex items-center justify-center gap-2 mt-8 py-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-600 text-sm text-slate-300 font-medium transition-all"
            >
              <span>Voir l&apos;archive complète</span>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            {certificates.length > 0 && (
              <div className="mt-16 pt-12 border-t border-slate-700/50">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">
                    Certifications & Badges
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] uppercase font-bold tracking-wider">
                    Vérifiées
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {certificates.map((cert, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                      key={cert.id}
                      className="group/cert p-5 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 hover:border-yellow-500/40 transition-all duration-300 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-slate-200 font-semibold mb-1 group-hover/cert:text-yellow-400 transition-colors">{cert.title}</h3>
                        <p className="text-slate-400 text-xs flex items-center gap-2">
                          <span className="text-slate-300">{cert.issuer}</span>
                          {cert.date && <span>• {cert.date}</span>}
                        </p>
                      </div>
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 rounded-full bg-slate-700/50 text-slate-400 hover:bg-yellow-500/20 hover:text-yellow-400 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-10 text-center">
                  <Link 
                    href="/certifications" 
                    className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest transition-all border border-yellow-500/30"
                  >
                    Voir mon parcours complet
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
