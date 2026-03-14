"use client";
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('menu');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const changeLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter hover:text-blue-400 transition">
              FRAID <span className="text-blue-500">.</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-blue-400 text-sm font-medium transition-colors">{t('home')}</Link>
            <Link href="/about" className="hover:text-blue-400 text-sm font-medium transition-colors">{t('about')}</Link>
            <Link href="/projects" className="hover:text-blue-400 text-sm font-medium transition-colors">{t('projects')}</Link>
            <Link 
              href="/contact" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-all"
            >
              {t('contact')}
            </Link>

            {/* Locale Switcher */}
            <div className="flex items-center gap-2 ml-4 border-l border-slate-700 pl-4 h-6">
              {['en', 'fr', 'de'].map((l) => (
                <button
                  key={l}
                  onClick={() => changeLocale(l)}
                  className={`text-xs font-bold uppercase ${locale === l ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white focus:outline-none p-2">
              <span className="sr-only">Open menu</span>
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link onClick={() => setIsOpen(false)} href="/" className="block hover:bg-slate-800 px-3 py-3 rounded-md text-base">{t('home')}</Link>
          <Link onClick={() => setIsOpen(false)} href="/about" className="block hover:bg-slate-800 px-3 py-3 rounded-md text-base">{t('about')}</Link>
          <Link onClick={() => setIsOpen(false)} href="/projects" className="block hover:bg-slate-800 px-3 py-3 rounded-md text-base">{t('projects')}</Link>
          <Link onClick={() => setIsOpen(false)} href="/contact" className="block bg-blue-600 px-3 py-3 rounded-md text-center">{t('contact')}</Link>
          
          {/* Locale Switcher Mobile */}
          <div className="flex justify-center gap-6 pt-4 border-t border-slate-800">
            {['en', 'fr', 'de'].map((l) => (
              <button
                key={l}
                onClick={() => { changeLocale(l); setIsOpen(false); }}
                className={`text-sm font-bold uppercase ${locale === l ? 'text-blue-400' : 'text-slate-500'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}