'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date?: string;
  link?: string;
  imageUrl?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
};

export default function CertificationsPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/certificates')
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Erreur API:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight"
          >
            Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Certifications</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg lg:text-xl font-light leading-relaxed"
          >
            Un aperçu de mon parcours d&apos;apprentissage continu, validé par des organismes internationaux. 
            Je m&apos;efforce d&apos;approfondir mes connaissances en Cloud, DevOps et Développement Backend.
          </motion.p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Récupération des badges...</p>
          </div>
        ) : certificates.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {certificates.map((cert) => (
              <motion.div
                key={cert.id}
                variants={itemVariants}
                className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl p-8 hover:bg-slate-900/60 hover:border-yellow-500/30 transition-all duration-500 backdrop-blur-sm"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                </div>

                <div className="mb-8 flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 group-hover:bg-yellow-500/20 transition-all duration-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-yellow-400 transition-colors">
                  {cert.title}
                </h3>
                
                <div className="flex flex-col gap-1 mb-6">
                  <p className="text-slate-400 font-medium text-sm">
                    {cert.issuer}
                  </p>
                  {cert.date && (
                    <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                      Obtenu le : {cert.date}
                    </p>
                  )}
                </div>

                {cert.link && (
                  <a 
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-slate-800/50 hover:bg-yellow-500 hover:text-slate-900 text-slate-300 font-bold text-sm transition-all duration-300 w-full justify-center group/btn"
                  >
                    Vérifier le badge
                    <svg className="w-4 h-4 translate-x-0 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 px-6 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
            <p className="text-slate-500 italic text-lg">Aucune certification n&apos;a encore été publiée.</p>
            <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">Retourner à l&apos;accueil</Link>
          </div>
        )}

        <footer className="mt-32 pt-16 border-t border-slate-900 flex justify-between items-center text-slate-500 text-sm">
           <Link href="/" className="hover:text-white transition">← Accueil</Link>
           <p>© {new Date().getFullYear()} FRAID</p>
        </footer>
      </div>
    </div>
  );
}
