import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-slate-500 text-sm">
            © {currentYear} FRAID. Développé avec passion & Next.js.
          </div>

          <div className="flex gap-8 text-slate-400 text-sm">
            <a
              href="https://github.com/fraid0"
              target="_blank"
              rel="noopener noreferrer" // Empêche l'erreur de sécurité
              className="hover:text-blue-400 transition"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/fraid-fomekong-22b740283/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              LinkedIn
            </a>

            <a
              href="https://www.xing.com/profile/FRAID_FOMEKONG/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              Xing
            </a>

            <a
              href="mailto:votre@email.com"
              className="hover:text-blue-400 transition"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}