"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-400 text-sm font-medium transition-colors">Home</Link>
            <Link href="/about" className="hover:text-blue-400 text-sm font-medium transition-colors">About</Link>
            <Link href="/projects" className="hover:text-blue-400 text-sm font-medium transition-colors">Projects</Link>
            
            {/* Version optimisée du lien Contact demandée */}
            <Link 
              href="/contact" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:scale-105 active:scale-95"
            >
              Contact
            </Link>
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
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-300">
          <Link onClick={() => setIsOpen(false)} href="/" className="block hover:bg-slate-800 px-3 py-3 rounded-md text-base font-medium">Home</Link>
          <Link onClick={() => setIsOpen(false)} href="/about" className="block hover:bg-slate-800 px-3 py-3 rounded-md text-base font-medium">About</Link>
          <Link onClick={() => setIsOpen(false)} href="/projects" className="block hover:bg-slate-800 px-3 py-3 rounded-md text-base font-medium">Projects</Link>
          <Link onClick={() => setIsOpen(false)} href="/contact" className="block bg-blue-600 hover:bg-blue-500 px-3 py-3 rounded-md text-base font-medium text-center shadow-lg transition-colors">
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}