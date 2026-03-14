'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Experience {
  id: number;
  title: string;
  company?: string;
  location?: string;
  period: string;
  description: string;
  order: number;
}

export default function About() {

  const { locale } = useParams();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('about');

  useEffect(() => {
    fetch(`/api/experiences?locale=${locale}`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new TypeError("Oops, we haven't got JSON!");
        }
        return res.json();
      })
      .then(data => {
        setExperiences(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Experiences Error:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 pt-32 pb-24 overflow-hidden">
      {/* Glow de fond pour un aspect premium */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] -z-10" />

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* --- Header --- */}
        <section className="mb-24 flex flex-col lg:flex-row gap-12 items-center lg:items-start text-center lg:text-left">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight"
            >
              {t('title')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 leading-relaxed font-light mb-8"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-500 font-mono uppercase tracking-widest border-t border-slate-900 pt-8"
            >
              <div className="flex flex-col gap-1">
                <span className="text-blue-500 font-bold">{t('location')}</span>
                Mannheim, DE
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-blue-500 font-bold">{t('degree')}</span>
                Bachelor Info.
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-blue-500 font-bold">{t('focus')}</span>
                Fullstack / Cloud
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full lg:w-1/3 aspect-square bg-slate-900 rounded-[3rem] border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden group shadow-2xl"
          >
             <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-all" />
             <span className="text-8xl select-none grayscale group-hover:grayscale-0 transition-all duration-700">👨‍💻</span>
             <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{t('available')}</p>
             </div>
          </motion.div>
        </section>

        {/* --- Timeline Expériences --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
              <span className="h-0.5 w-12 bg-blue-500"></span>
              {t('path')}
            </h2>

            {isLoading ? (
              <div className="space-y-12 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-slate-900/50 rounded-3xl border border-slate-800" />
                ))}
              </div>
            ) : experiences.length > 0 ? (
              <div className="space-y-16 relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-slate-800 to-transparent" />
                {experiences.map((exp) => (
                  <motion.div 
                    key={exp.id} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative pl-16 group"
                  >
                    <div className="absolute left-4.5 top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:bg-blue-500 transition-all duration-300" />
                    
                    <span className="text-xs font-mono text-blue-500 font-bold uppercase tracking-[0.2em] block mb-2">
                      {exp.period}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {exp.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-6 bg-slate-900/50 w-fit px-3 py-1 rounded-lg border border-slate-800/50">
                      <span className="font-semibold text-slate-300">{exp.company}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>{exp.location}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-lg font-light">
                      {exp.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">Aucun parcours disponible pour le moment.</p>
            )}
          </div>

          {/* Section Certifications & Links */}
          <aside className="space-y-12">
             <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] sticky top-32 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6">{t('certifications_title')}</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  {t('certifications_desc')}
                </p>
                <Link 
                  href="/certifications"
                  className="group flex items-center justify-between p-4 bg-yellow-500 text-slate-950 font-bold rounded-2xl hover:scale-[1.02] transition-all"
                >
                  {t('certifications_cta')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                
                <div className="mt-12 flex flex-col gap-4">
                  <h4 className="text-xs font-mono text-slate-600 uppercase tracking-widest font-bold">Contact Rapide</h4>
                  <a href="mailto:5667tom@gmail.com" className="text-slate-400 hover:text-white transition text-sm">5667tom@gmail.com</a>
                  <a href="tel:015100040050" className="text-slate-400 hover:text-white transition text-sm">0151 000 40050</a>
                </div>
             </div>
          </aside>
        </div>

        {/* --- Skills Grid --- */}
        <section className="mt-32">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
            <span className="h-0.5 w-12 bg-purple-500"></span>
            {t('skills_title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkillCard title="Langages" skills={["TypeScript", "Python", "JavaScript", "SQL"]} color="blue" />
            <SkillCard title="Frontend" skills={["React / Next.js", "Angular", "Tailwind CSS", "Flutter"]} color="purple" />
            <SkillCard title="Backend" skills={["Node.js", "Express", "FASTAPI", "ORM Sequelize/Prisma"]} color="indigo" />
            <SkillCard title="Infrastructure" skills={["Docker", "Azure DevOps", "CI/CD Pipelines", "Supabase"]} color="blue" />
            <SkillCard title="Data & Cloud" skills={["PostgreSQL", "AWS Grundlagen", "Git / GitHub", "Linux CLI"]} color="purple" />
            <SkillCard title="Soft Skills" skills={["Agile (SCRUM)", "Figma Design", "Technical Writing", "Problem Solving"]} color="indigo" />
          </div>
        </section>
      </div>
    </div>
  );
}

function SkillCard({ title, skills, color }: { title: string; skills: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/10 hover:border-blue-500/30 text-blue-400 bg-blue-500/5",
    purple: "border-purple-500/10 hover:border-purple-500/30 text-purple-400 bg-purple-500/5",
    indigo: "border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400 bg-indigo-500/5",
  };

  return (
    <div className={`p-8 rounded-[2rem] border ${colorMap[color]} backdrop-blur-sm transition-all duration-500 group`}>
      <h3 className="text-white font-bold mb-6 text-lg">{title}</h3>
      <div className="flex flex-wrap gap-2 text-sm">
        {skills.map((skill) => (
          <span key={skill} className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-900 group-hover:border-slate-800 transition-colors">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

