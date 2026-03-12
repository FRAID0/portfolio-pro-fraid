import { supabase } from '../lib/supabaseClient';

/**
 * Service central pour la gestion du stockage Supabase
 */

// Seuil de compression (peut être utilisé par ImageUploader avant l'upload)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload une image vers un dossier spécifique du bucket 'projects'
 * @param {File} file - Le fichier à uploader
 * @param {string} folder - Le dossier cible (ex: 'projects-images', 'certifications', 'profile')
 */
export const uploadImage = async (file, folder) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('projects')
      .upload(filePath, file);

    if (error) throw error;

    return getPublicUrl(filePath);
  } catch (error) {
    console.error('Error uploading image:', error.message);
    throw error;
  }
};

/**
 * Upload un document PDF vers le dossier 'documents'
 */
export const uploadDocument = async (file) => {
  try {
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.pdf`;
    const filePath = `documents/${fileName}`;

    const { data, error } = await supabase.storage
      .from('projects')
      .upload(filePath, file);

    if (error) throw error;

    return getPublicUrl(filePath);
  } catch (error) {
    console.error('Error uploading document:', error.message);
    throw error;
  }
};

/**
 * Supprime un fichier de Supabase Storage
 * @param {string} url - L'URL publique complète du fichier
 */
export const deleteFile = async (url) => {
  try {
    // Extraire le chemin relatif de l'URL
    // Format attendu: https://[ID].supabase.co/storage/v1/object/public/projects/[PATH]
    const parts = url.split('/projects/');
    if (parts.length < 2) return;
    
    const filePath = parts[1];

    const { error } = await supabase.storage
      .from('projects')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error.message);
    throw error;
  }
};

/**
 * Récupère l'URL publique d'un fichier à partir de son chemin
 */
export const getPublicUrl = (path) => {
  const { data } = supabase.storage
    .from('projects')
    .getPublicUrl(path);

  return data.publicUrl;
};
