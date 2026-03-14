'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

// ✅ Swiper v11+ correct import
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// ✅ CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Project = {
  id: number;
  title: string;
  description: string;
  tech: string;
  category: string;
  imageUrl?: string;
  githubLink?: string;
  contribution?: string;
};

export default function ProjectDetail() {
  const t = useTranslations('projects');
  const params = useParams<{ id: string; locale: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const locale = params?.locale;

  useEffect(() => {
    if (!params?.id) return;

    fetch(`/api/projects/${params.id}?locale=${locale}`)
      .then(res => {
        if (!res.ok) throw new Error('Projet introuvable');
        return res.json();
      })
      .then(data => setProject(data))
      .catch(err => console.error('Erreur chargement projet :', err));
  }, [params?.id, locale]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Chargement du projet…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          href="/projects"
          className="text-blue-500 hover:text-blue-400 mb-10 inline-flex items-center gap-2"
        >
          ← {t('backToProjects')}
        </Link>

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <span className="text-xs font-mono text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {project.category}
            </span>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-white mt-6 mb-6">
              {project.title}
            </h1>

            <div className="flex flex-wrap gap-2">
              {project.tech.split(',').map(t => (
                <span
                  key={t}
                  className="px-3 py-1 bg-slate-900 text-slate-300 text-xs rounded-md border border-slate-800"
                >
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Swiper */}
          <div className="h-[400px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="h-full w-full"
            >
              <SwiperSlide className="flex items-center justify-center">
                <img
                  src={
                    project.imageUrl ||
                    'https://fraid0.github.io/portofolio_FRAID/images/IOT/WhatsApp%20Image%202025-02-09%20at%2012.45.20.jpeg'
                  }
                  alt={project.title}
                  className="object-contain w-full h-full"
                />
              </SwiperSlide>

              <SwiperSlide className="flex items-center justify-center">
                <video
                  controls
                  className="max-h-[320px] rounded-xl border border-slate-800"
                >
                  <source
                    src="https://fraid0.github.io/portofolio_FRAID/images/IOT/video_2025-02-10_17-15-45.mp4"
                    type="video/mp4"
                  />
                </video>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-slate-900 pt-16">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">
                {t('aboutProject')}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </section>

            <section className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('personalContribution')}
              </h2>
              <p className="text-slate-300 whitespace-pre-line">
                {project.contribution ||
                  t('defaultContribution')}
              </p>
            </section>
          </div>

          <aside>
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl sticky top-28">
              <h3 className="text-white font-bold mb-4">{t('resources')}</h3>

              <a
                href={project.githubLink || 'https://github.com/fraid0'}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-slate-800 hover:border-blue-500 transition"
              >
                {t('sourceCode')} →
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
