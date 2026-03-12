'use client';

import { useState, useRef } from 'react';

interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  currentFileUrl?: string;
  adminKey: string;
}

export default function FileUploader({ onUploadSuccess, currentFileUrl, adminKey }: FileUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(currentFileUrl ? "Document PDF chargé" : null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError("Le fichier doit être un PDF.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Le document est trop lourd (max 20MB).");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setProgress(50);

      const res = await fetch('/api/upload/document', {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Échec de l'upload.");
      }

      const { url } = await res.json();
      setFileName(file.name);
      setProgress(100);
      onUploadSuccess(url);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3
          ${fileName ? 'border-green-500/30 bg-green-500/5' : 'border-slate-700 hover:border-blue-500/50 bg-slate-900/50'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className={`p-2 rounded-lg ${fileName ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-slate-300 truncate">
            {uploading ? `Chargement... ${progress}%` : (fileName || "Ajouter un document PDF")}
          </p>
          {!uploading && !fileName && <p className="text-[10px] text-slate-500">Cliquez pour choisir un fichier (Max 20MB)</p>}
        </div>

        {fileName && !uploading && (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf" 
        className="hidden" 
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
