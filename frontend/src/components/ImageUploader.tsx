'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  currentImageUrl?: string;
  folder?: string;
  adminKey: string;
}

export default function ImageUploader({ onUploadSuccess, currentImageUrl, folder = 'projects-images', adminKey }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError("Le fichier doit être une image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("L'image est trop lourde (max 10MB).");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // 1. Compression
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      setProgress(30);
      const compressedFile = await imageCompression(file, options);
      
      // Preview locale
      const localPreview = URL.createObjectURL(compressedFile);
      setPreview(localPreview);
      setProgress(50);

      // 2. Upload via backend relay (to keep Supabase keys server-side as requested)
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', folder);

      const res = await fetch('/api/upload/image', {
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
      setProgress(100);
      onUploadSuccess(url);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload.");
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 w-full">
      <div 
        onClick={triggerUpload}
        className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex items-center justify-center
          ${preview ? 'border-blue-500/50' : 'border-slate-700 hover:border-blue-500/50 bg-slate-900/50'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-6">
            <svg className="w-10 h-10 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-400">Cliquez ou glissez une image ici</p>
            <p className="text-[10px] text-slate-500 mt-1">JPG, PNG, WEBP (Max 10MB)</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center p-4">
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-blue-400 font-medium animate-pulse">Upload: {progress}%</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      
      {preview && !uploading && (
        <button 
          onClick={triggerUpload}
          className="text-[10px] uppercase tracking-wider text-blue-400 hover:text-blue-300 font-bold"
        >
          Changer l'image
        </button>
      )}
    </div>
  );
}
