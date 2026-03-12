'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
type Project = { id: number; title: string; tech: string; category: string; description: string; imageUrl?: string; githubLink?: string; liveLink?: string };
type Skill = { id: number; name: string; category: string; level?: string };
type Message = { id: number; senderName: string; senderEmail: string; content: string; createdAt: string };
type Tag = { id: number; name: string; type: 'TECH' | 'CATEGORY' };
type Certificate = { id: number; title: string; issuer: string; date?: string; link?: string; imageUrl?: string };
type Experience = { id: number; title: string; company?: string; location?: string; period: string; description: string; order: number };

export default function FraidAdmin() {
  const [adminKey, setAdminKey] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'messages' | 'tags' | 'certificates' | 'experiences'>('projects');
  const [status, setStatus] = useState({ message: '', type: '' });

  // Load key from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedKey = localStorage.getItem('fraid_admin_key');
    if (savedKey) setAdminKey(savedKey);
  }, []);

  // Sync key to localStorage
  const handleKeyChange = (val: string) => {
    setAdminKey(val);
    localStorage.setItem('fraid_admin_key', val);
  };

  const handleLogout = () => {
    if (confirm('Se déconnecter ?')) {
      setAdminKey('');
      localStorage.removeItem('fraid_admin_key');
    }
  };

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Form states
  const [projectForm, setProjectForm] = useState<Partial<Project>>({ category: '', tech: '' });
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({ category: '' });
  const [tagForm, setTagForm] = useState<Partial<Tag>>({ type: 'TECH' });
  const [certForm, setCertForm] = useState<Partial<Certificate>>({});
  const [expForm, setExpForm] = useState<Partial<Experience>>({ order: 0 });

  const [editingId, setEditingId] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const headers = { 'x-admin-key': adminKey };
      if (activeTab === 'projects') {
        const res = await fetch(`/api/projects`, { headers });
        if (res.ok) setProjects(await res.json());
        // Also fetch tags for the project form
        const tagsRes = await fetch(`/api/tags`, { headers });
        if (tagsRes.ok) setTags(await tagsRes.json());
      } else if (activeTab === 'skills') {
        const res = await fetch(`/api/skills`, { headers });
        if (res.ok) setSkills(await res.json());
      } else if (activeTab === 'messages') {
        const res = await fetch(`/api/messages`, { headers });
        if (res.ok) setMessages(await res.json());
      } else if (activeTab === 'tags') {
        const res = await fetch(`/api/tags`, { headers });
        if (res.ok) setTags(await res.json());
      } else if (activeTab === 'certificates') {
        const res = await fetch(`/api/certificates`, { headers });
        if (res.ok) setCertificates(await res.json());
      } else if (activeTab === 'experiences') {
        const res = await fetch(`/api/experiences`, { headers });
        if (res.ok) setExperiences(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (adminKey) fetchData();
  }, [activeTab, adminKey]);

  const handleShowMessage = (msg: string, type: 'success' | 'error') => {
    setStatus({ message: msg, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 3000);
  };

  const getUrl = (endpoint: string, isEditing: boolean) =>
    isEditing ? `/api/${endpoint}/${editingId}` : `/api/${endpoint}`;

  const getMethod = (isEditing: boolean) => isEditing ? 'PUT' : 'POST';



  const handleEdit = (id: number) => {
    setEditingId(id);
    if (activeTab === 'projects') setProjectForm(projects.find(p => p.id === id) || {});
    else if (activeTab === 'skills') setSkillForm(skills.find(s => s.id === id) || {});
    else if (activeTab === 'tags') setTagForm(tags.find(t => t.id === id) || { type: 'TECH' });
    else if (activeTab === 'certificates') setCertForm(certificates.find(c => c.id === id) || {});
    else if (activeTab === 'experiences') setExpForm(experiences.find(e => e.id === id) || { order: 0 });
  };

  const handleClearForm = () => {
    setEditingId(null);
    setProjectForm({ category: '', tech: '' });
    setSkillForm({ category: '' });
    setTagForm({ type: 'TECH' });
    setCertForm({});
    setExpForm({ order: 0 });
  };

  const handleSubmit = async (e?: React.FormEvent, customEndpoint?: string, customBody?: any) => {
    if (e) e.preventDefault();
    const isEditing = editingId !== null;
    
    const endpoint = customEndpoint || (
      activeTab === 'projects' ? 'projects' :
      activeTab === 'skills' ? 'skills' :
      activeTab === 'tags' ? 'tags' :
      activeTab === 'certificates' ? 'certificates' :
      'experiences'
    );

    const body = customBody || (
      activeTab === 'projects' ? projectForm :
      activeTab === 'skills' ? skillForm :
      activeTab === 'tags' ? tagForm :
      activeTab === 'certificates' ? certForm :
      expForm
    );

    try {
      const res = await fetch(getUrl(endpoint, isEditing), {
        method: getMethod(isEditing),
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        handleShowMessage(`Opération réussie ! ✅`, 'success');
        handleClearForm();
        fetchData();
      } else {
        const errorData = await res.json();
        handleShowMessage(`Erreur : ${errorData.error}`, 'error');
      }
    } catch (err) {
      handleShowMessage('Impossible de contacter le serveur.', 'error');
    }
  };

  const deleteTarget = async (endpoint: string, id: number) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      const res = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
      if (res.ok) {
        handleShowMessage('Élément supprimé.', 'success');
        fetchData();
      }
    } catch (e) {
      handleShowMessage('Erreur suppression.', 'error');
    }
  };

  // Tag helper for Project/Skill form
  const toggleTag = (currentString: string = '', tagNameToToggle: string) => {
    const currentArray = currentString.split(',').map(s => s.trim()).filter(Boolean);
    if (currentArray.includes(tagNameToToggle)) {
      return currentArray.filter(t => t !== tagNameToToggle).join(', ');
    } else {
      return [...currentArray, tagNameToToggle].join(', ');
    }
  };

  const hasTag = (currentString: string = '', tagName: string) => {
    return currentString.split(',').map(s => s.trim()).includes(tagName);
  };

  return (
    <div className="min-h-screen py-24 px-6 bg-slate-950 flex flex-col items-center">
      
      {/* Auth */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="adminKey" className="block text-blue-400 font-bold mb-2 uppercase text-xs">Clé Secrète Admin</label>
            <input 
              id="adminKey"
              type="password" 
              placeholder="Entrez votre clé secrète..."
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500"
              value={adminKey}
              onChange={(e) => handleKeyChange(e.target.value)}
            />
          </div>
          {adminKey && (
            <button 
              onClick={handleLogout}
              className="mt-6 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition text-xs font-bold"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>

      {adminKey && (
        <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar */}
          <div className="md:w-64 bg-slate-950 p-6 flex flex-col gap-2 border-r border-slate-800">
            <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contenu</h2>
            <button onClick={() => { setActiveTab('projects'); setEditingId(null); setProjectForm({ category: '', tech: '' }); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'projects' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Projets</button>
            <button onClick={() => { setActiveTab('skills'); setEditingId(null); setSkillForm({ category: '' }); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'skills' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Compétences</button>
            <button onClick={() => { setActiveTab('certificates'); setEditingId(null); }} className={`p-4 text-left outline-none rounded-xl transition ${activeTab === 'certificates' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Certifications</button>
            <button onClick={() => { setActiveTab('experiences'); setEditingId(null); }} className={`p-4 text-left outline-none rounded-xl transition ${activeTab === 'experiences' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Parcours</button>
            
            <h2 className="text-white font-bold mt-6 mb-2 uppercase tracking-wider text-sm">Configuration</h2>
            <button onClick={() => { setActiveTab('tags'); setEditingId(null); setTagForm({ type: 'TECH' }); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'tags' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Tags & Catégories</button>
            <button onClick={() => { setActiveTab('messages'); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'messages' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Messages</button>
            
            <div className="mt-auto pt-10">
              <Link
                href="/"
                className="flex items-center gap-2 p-3 text-slate-500 hover:text-white transition-all text-xs border border-slate-800 rounded-xl hover:bg-slate-800/50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Voir le site public
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 flex-1 relative bg-slate-900 min-h-[600px]">
            {status.message && (
              <div className={`absolute top-4 right-4 p-3 rounded-lg text-sm font-medium z-50 shadow-lg ${status.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                {status.message}
              </div>
            )}

            {/* ---> PROJECT TAB <--- */}
            {activeTab === 'projects' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                  {editingId ? 'Modifier' : 'Ajouter'} un Projet
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Titre</label>
                      <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" value={projectForm.title || ''} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Image URL (Optionnel)</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition" value={projectForm.imageUrl || ''} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2 font-semibold">Catégorie du Projet</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.filter(t => t.type === 'CATEGORY').map(t => {
                        const isSelected = hasTag(projectForm.category, t.name);
                        return (
                          <button key={t.id} type="button" onClick={() => setProjectForm({...projectForm, category: toggleTag(projectForm.category, t.name)})} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            {t.name}
                          </button>
                        )
                      })}
                      {tags.filter(t => t.type === 'CATEGORY').length === 0 && <span className="text-xs text-slate-500 italic">Aucune catégorie créée dans &apos;Tags & Catégories&apos;.</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2 font-semibold">Technologies / Stacks</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.filter(t => t.type === 'TECH').map(t => {
                        const isSelected = hasTag(projectForm.tech, t.name);
                        return (
                          <button key={t.id} type="button" onClick={() => setProjectForm({...projectForm, tech: toggleTag(projectForm.tech, t.name)})} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isSelected ? 'bg-blue-600/20 border-blue-500 text-blue-300 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            {t.name}
                          </button>
                        )
                      })}
                      {tags.filter(t => t.type === 'TECH').length === 0 && <span className="text-xs text-slate-500 italic">Aucune tech créée dans &apos;Tags & Catégories&apos;.</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                    <textarea required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-24 focus:border-blue-500 outline-none transition" value={projectForm.description || ''} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Lien Logiciel / Live (Optionnel)</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" value={projectForm.liveLink || ''} onChange={e => setProjectForm({...projectForm, liveLink: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Lien Github (Optionnel)</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" value={projectForm.githubLink || ''} onChange={e => setProjectForm({...projectForm, githubLink: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-lg shadow-blue-500/20">
                      {editingId ? 'Mettre à jour le projet' : 'Créer le projet'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setProjectForm({ category: '', tech: '' }); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg transition">Annuler</button>
                    )}
                  </div>
                </form>

                <h3 className="text-xl font-bold text-white mb-4">Liste des Projets</h3>
                <div className="grid grid-cols-1 gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="p-5 bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 rounded-2xl flex justify-between items-center transition">
                      <div>
                        <h4 className="text-white font-bold text-lg">{p.title}</h4>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {p.category && p.category.split(',').map(c => c.trim()).filter(Boolean).map((cat, i) => <span key={`cat-${i}`} className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">{cat}</span>)}
                          {p.tech && p.tech.split(',').map(c => c.trim()).filter(Boolean).map((t, i) => <span key={`tech-${i}`} className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded uppercase">{t}</span>)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(p.id)} className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">Éditer</button>
                        <button onClick={() => deleteTarget('projects', p.id)} className="px-4 py-2 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---> TAGS TAB <--- */}
            {activeTab === 'tags' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
                  Gestion des Tags & Catégories
                </h3>
                <p className="text-slate-400 mb-6 text-sm">Créez tous les langages, frameworks et catégories ici. Ils seront disponibles sous forme de boutons cliquables dans la création des projets.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Nom du Tag</label>
                      <input type="text" required placeholder="ex: React, Python, Devops..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={tagForm.name || ''} onChange={e => setTagForm({...tagForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Type</label>
                      <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={tagForm.type || 'TECH'} onChange={e => setTagForm({...tagForm, type: e.target.value as Tag['type']})}>
                        <option value="TECH">Stack Technique (ex: Python)</option>
                        <option value="CATEGORY">Catégorie Générale (ex: Fullstack)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-lg shadow-purple-500/20">Ajouter le Tag</button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-indigo-400 font-bold mb-4">Catégories d'Architecture</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.filter(t => t.type === 'CATEGORY').map(t => (
                        <div key={t.id} className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-medium">
                          {t.name}
                          <button onClick={() => deleteTarget('tags', t.id)} className="text-red-400 hover:text-red-300 ml-1 opacity-0 group-hover:opacity-100 transition">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-blue-400 font-bold mb-4">Stacks Techniques</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.filter(t => t.type === 'TECH').map(t => (
                        <div key={t.id} className="group flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs font-medium">
                          {t.name}
                          <button onClick={() => deleteTarget('tags', t.id)} className="text-red-400 hover:text-red-300 ml-1 opacity-0 group-hover:opacity-100 transition">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---> CERTIFICATES TAB <--- */}
            {activeTab === 'certificates' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-yellow-500 rounded-full inline-block"></span>
                  {editingId ? 'Modifier' : 'Ajouter'} un Certificat
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Titre de la certification</label>
                      <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition" value={certForm.title || ''} onChange={e => setCertForm({...certForm, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Organisme (ex: Udemy, AWS...)</label>
                      <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition" value={certForm.issuer || ''} onChange={e => setCertForm({...certForm, issuer: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Date d'obtention (ex: Mars 2026)</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" value={certForm.date || ''} onChange={e => setCertForm({...certForm, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Lien de vérification / Badge (Optionnel)</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" value={certForm.link || ''} onChange={e => setCertForm({...certForm, link: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-400 mb-1 font-semibold">URL de l'image (Optionnel)</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" value={certForm.imageUrl || ''} onChange={e => setCertForm({...certForm, imageUrl: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-lg shadow-yellow-500/20">
                      {editingId ? 'Valider la modification' : 'Ajouter le certificat'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setCertForm({}); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg transition">Annuler</button>
                    )}
                  </div>
                </form>

                <h3 className="text-xl font-bold text-white mb-4">Certificats Actuels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.map(c => (
                    <div key={c.id} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col justify-between transition hover:border-slate-600">
                      <div>
                        <h4 className="text-white font-bold text-lg leading-tight">{c.title}</h4>
                        <p className="text-yellow-400 text-sm mt-1 mb-3">{c.issuer} {c.date && <span className="text-slate-500 text-xs ml-2">• {c.date}</span>}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {setEditingId(c.id); setCertForm(c);}} className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">Éditer</button>
                        <button onClick={() => deleteTarget('certificates', c.id)} className="px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---> SKILLS TAB <--- */}
            {activeTab === 'skills' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-teal-500 rounded-full inline-block"></span>
                  {editingId ? 'Modifier' : 'Ajouter'} une Compétence
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Nom de la compétence (ex: React, Docker)</label>
                      <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 outline-none transition" value={skillForm.name || ''} onChange={e => setSkillForm({...skillForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Niveau (ex: Débutant, Intermédiaire, Avancé)</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 outline-none transition" value={skillForm.level || ''} onChange={e => setSkillForm({...skillForm, level: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2 font-semibold">Catégorie associée</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.filter(t => t.type === 'CATEGORY').map(t => {
                        const isSelected = skillForm.category === t.name;
                        return (
                          <button key={t.id} type="button" onClick={() => setSkillForm({...skillForm, category: t.name})} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            {t.name}
                          </button>
                        )
                      })}
                      {tags.filter(t => t.type === 'CATEGORY').length === 0 && <span className="text-xs text-slate-500 italic">Aucune catégorie créée dans &apos;Tags & Catégories&apos;.</span>}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-lg shadow-teal-500/20">
                      {editingId ? 'Mettre à jour la compétence' : 'Ajouter la compétence'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setSkillForm({ category: '' }); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg transition">Annuler</button>
                    )}
                  </div>
                </form>

                <h3 className="text-xl font-bold text-white mb-4">Liste des Compétences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {skills.map(s => (
                    <div key={s.id} className="p-4 bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 rounded-xl flex justify-between items-center transition">
                      <div>
                        <h4 className="text-white font-bold text-base">{s.name}</h4>
                        <div className="flex flex-col mt-1">
                          <span className="text-[10px] text-indigo-300 font-mono uppercase truncate">{s.category}</span>
                          {s.level && <span className="text-xs text-slate-400">{s.level}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => {setEditingId(s.id); setSkillForm(s);}} className="text-[10px] font-medium text-slate-300 hover:text-white transition">Éditer</button>
                        <button onClick={() => deleteTarget('skills', s.id)} className="text-[10px] font-medium text-red-500 hover:text-red-400 transition">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'experiences' && (
              <div className="space-y-12">
                <section className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-6">{editingId ? 'Modifier l\'expérience' : 'Ajouter une expérience'}</h3>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Titre (ex: Bachelor Informatique)" className="p-3 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-white" value={expForm.title || ''} onChange={e => setExpForm({ ...expForm, title: e.target.value })} required />
                    <input type="text" placeholder="Entreprise / École" className="p-3 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-white" value={expForm.company || ''} onChange={e => setExpForm({ ...expForm, company: e.target.value })} />
                    <input type="text" placeholder="Lieu (ex: Worms / Remote)" className="p-3 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-white" value={expForm.location || ''} onChange={e => setExpForm({ ...expForm, location: e.target.value })} />
                    <input type="text" placeholder="Période (ex: 2023 - Présent)" className="p-3 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-white" value={expForm.period || ''} onChange={e => setExpForm({ ...expForm, period: e.target.value })} required />
                    <input type="number" placeholder="Ordre (plus haut = plus en haut)" className="p-3 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-white" value={expForm.order || 0} onChange={e => setExpForm({ ...expForm, order: parseInt(e.target.value) })} />
                    <textarea placeholder="Description" className="md:col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-white h-32" value={expForm.description || ''} onChange={e => setExpForm({ ...expForm, description: e.target.value })} required />
                    <div className="md:col-span-2 flex gap-4">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-lg transition">{editingId ? 'Mettre à jour' : 'Ajouter au parcours'}</button>
                      {editingId && <button type="button" onClick={handleClearForm} className="bg-slate-800 p-3 rounded-lg text-white">Annuler</button>}
                    </div>
                  </form>
                </section>

                <div className="grid grid-cols-1 gap-4">
                  {experiences.map(exp => (
                    <div key={exp.id} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex justify-between items-center group">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-blue-500 uppercase">{exp.period}</span>
                          <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-400">Ordre: {exp.order}</span>
                        </div>
                        <h4 className="text-white font-bold text-lg">{exp.title}</h4>
                        <p className="text-slate-500 text-sm">{exp.company} • {exp.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(exp.id)} className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg transition text-white">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteTarget('experiences', exp.id)} className="p-2 bg-slate-800 hover:bg-red-600 rounded-lg transition text-white">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {experiences.length === 0 && <p className="text-center text-slate-500 italic">Aucune expérience enregistrée.</p>}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-white mb-6">Boîte de réception</h3>
                <div className="space-y-4">
                  {messages.length === 0 && <p className="text-slate-400">Aucun message.</p>}
                  {messages.map(m => (
                    <div key={m.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-bold">{m.senderName}</h4>
                          <a href={`mailto:${m.senderEmail}`} className="text-blue-400 text-xs hover:underline">{m.senderEmail}</a>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-slate-500 text-xs">{new Date(m.createdAt).toLocaleString()}</span>
                          <button onClick={() => deleteTarget('messages', m.id)} className="text-xs text-red-400 hover:text-red-300 transition">Supprimer</button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mt-3 bg-slate-900 p-4 rounded-lg border border-slate-800 whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}