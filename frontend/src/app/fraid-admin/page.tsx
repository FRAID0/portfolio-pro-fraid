'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    title: '',
    tech: '',
    category: 'FULLSTACK',
    description: '',
    adminKey: ''
  });
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ message: 'Envoi en cours...', type: 'info' });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': formData.adminKey
        },
        body: JSON.stringify({
          title: formData.title,
          tech: formData.tech,
          category: formData.category,
          description: formData.description
        }),
      });

      if (res.ok) {
        setStatus({ message: 'Projet ajouté avec succès ! ✅', type: 'success' });
        setFormData({ ...formData, title: '', tech: '', description: '' });
      } else {
        const errorData = await res.json();
        setStatus({ message: `Erreur : ${errorData.error}`, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Impossible de contacter le serveur.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen py-24 px-6 bg-slate-950 flex justify-center">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Tableau de Bord Admin</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Clé Secrète */}
          <div>
            <label htmlFor="adminKey" className="block text-blue-400 font-bold mb-1 uppercase text-xs">Clé Secrète Admin</label>
            <input 
              id="adminKey"
              name="adminKey"
              type="password" 
              placeholder="Entrez votre clé secrète"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500"
              value={formData.adminKey}
              onChange={(e) => setFormData({...formData, adminKey: e.target.value})}
            />
          </div>

          <hr className="border-slate-800 my-6" />

          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-slate-400 mb-1">Titre du Projet</label>
            <input 
              id="title"
              name="title"
              type="text" 
              placeholder="Nom du projet"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Tech */}
          <div>
            <label htmlFor="tech" className="block text-slate-400 mb-1">Stack Technique</label>
            <input 
              id="tech"
              name="tech"
              type="text" 
              placeholder="ex: React, Node.js, Docker"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              value={formData.tech}
              onChange={(e) => setFormData({...formData, tech: e.target.value})}
            />
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="category" className="block text-slate-400 mb-1">Catégorie</label>
            <select 
              id="category"
              name="category"
              title="Sélectionnez une catégorie"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="FULLSTACK">Fullstack</option>
              <option value="IOT">IoT</option>
              <option value="MOBILE">Mobile</option>
              <option value="GUI">GUI / Python</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-slate-400 mb-1">Description</label>
            <textarea 
              id="description"
              name="description"
              placeholder="Décrivez brièvement le projet..."
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white h-24"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition"
          >
            Ajouter au Portfolio
          </button>

          {status.message && (
            <div role="alert" className={`mt-4 text-center p-2 rounded ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}