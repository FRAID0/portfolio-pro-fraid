'use client';

import { useState, useEffect } from 'react';

// Types
type Project = { id: number; title: string; tech: string; category: string; description: string; imageUrl?: string; githubLink?: string; liveLink?: string };
type Skill = { id: number; name: string; category: string; level?: string };
type Message = { id: number; senderName: string; senderEmail: string; content: string; createdAt: string };
type Tag = { id: number; name: string; type: string };
type Certificate = { id: number; title: string; issuer: string; date?: string; link?: string; imageUrl?: string };

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'messages' | 'tags' | 'certificates'>('projects');
  const [status, setStatus] = useState({ message: '', type: '' });

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Form states
  const [projectForm, setProjectForm] = useState<Partial<Project>>({ category: '', tech: '' });
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({ category: '' });
  const [tagForm, setTagForm] = useState<Partial<Tag>>({ type: 'TECH' });
  const [certForm, setCertForm] = useState<Partial<Certificate>>({});

  const [editingId, setEditingId] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const headers = { 'x-admin-key': adminKey };
      if (activeTab === 'projects') {
        const res = await fetch(`${apiUrl}/api/projects`, { headers });
        if (res.ok) setProjects(await res.json());
        // Also fetch tags for the project form
        const tagsRes = await fetch(`${apiUrl}/api/tags`, { headers });
        if (tagsRes.ok) setTags(await tagsRes.json());
      } else if (activeTab === 'skills') {
        const res = await fetch(`${apiUrl}/api/skills`, { headers });
        if (res.ok) setSkills(await res.json());
      } else if (activeTab === 'messages') {
        const res = await fetch(`${apiUrl}/api/messages`, { headers });
        if (res.ok) setMessages(await res.json());
      } else if (activeTab === 'tags') {
        const res = await fetch(`${apiUrl}/api/tags`, { headers });
        if (res.ok) setTags(await res.json());
      } else if (activeTab === 'certificates') {
        const res = await fetch(`${apiUrl}/api/certificates`, { headers });
        if (res.ok) setCertificates(await res.json());
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
    isEditing ? `${apiUrl}/api/${endpoint}/${editingId}` : `${apiUrl}/api/${endpoint}`;

  const getMethod = (isEditing: boolean) => isEditing ? 'PUT' : 'POST';

  const submitTarget = async (endpoint: string, formPayload: any, onSuccess: () => void) => {
    const isEditing = editingId !== null;
    try {
      const res = await fetch(getUrl(endpoint, isEditing), {
        method: getMethod(isEditing),
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(formPayload),
      });

      if (res.ok) {
        handleShowMessage(`Opération réussie ! ✅`, 'success');
        onSuccess();
        setEditingId(null);
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
      const res = await fetch(`${apiUrl}/api/${endpoint}/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
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
        <label htmlFor="adminKey" className="block text-blue-400 font-bold mb-2 uppercase text-xs">Clé Secrète Admin</label>
        <input 
          id="adminKey"
          type="password" 
          placeholder="Entrez votre clé secrète..."
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />
      </div>

      {adminKey && (
        <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar */}
          <div className="md:w-64 bg-slate-950 p-6 flex flex-col gap-2 border-r border-slate-800">
            <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contenu</h2>
            <button onClick={() => { setActiveTab('projects'); setEditingId(null); setProjectForm({ category: '', tech: '' }); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'projects' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Projets</button>
            <button onClick={() => { setActiveTab('skills'); setEditingId(null); setSkillForm({ category: '' }); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'skills' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Compétences</button>
            <button onClick={() => { setActiveTab('certificates'); setEditingId(null); setCertForm({}); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'certificates' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Certificats</button>
            
            <h2 className="text-white font-bold mt-6 mb-2 uppercase tracking-wider text-sm">Configuration</h2>
            <button onClick={() => { setActiveTab('tags'); setEditingId(null); setTagForm({ type: 'TECH' }); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'tags' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Tags & Catégories</button>
            <button onClick={() => { setActiveTab('messages'); }} className={`p-3 text-left outline-none rounded-xl transition ${activeTab === 'messages' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-300'}`}>Messages</button>
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
                <form onSubmit={(e) => { e.preventDefault(); submitTarget('projects', projectForm, () => setProjectForm({ category: '', tech: '' })); }} className="space-y-6 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
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
                        <button onClick={() => {setEditingId(p.id); setProjectForm(p);}} className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">Éditer</button>
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
                
                <form onSubmit={(e) => { e.preventDefault(); submitTarget('tags', tagForm, () => setTagForm({ type: 'TECH' })); }} className="space-y-4 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Nom du Tag</label>
                      <input type="text" required placeholder="ex: React, Python, Devops..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={tagForm.name || ''} onChange={e => setTagForm({...tagForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Type</label>
                      <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={tagForm.type || 'TECH'} onChange={e => setTagForm({...tagForm, type: e.target.value})}>
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
                <form onSubmit={(e) => { e.preventDefault(); submitTarget('certificates', certForm, () => setCertForm({})); }} className="space-y-4 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
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
                <form onSubmit={(e) => { e.preventDefault(); submitTarget('skills', skillForm, () => setSkillForm({ category: '' })); }} className="space-y-6 text-sm mb-12 bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
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