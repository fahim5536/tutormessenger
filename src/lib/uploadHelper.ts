import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadGroupLogo(file: File, groupId: string): Promise<{ url: string | null; error: string | null }> {
  // Frontend Validation
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { url: null, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: "File is too large. Maximum size is 5MB." };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${groupId}/logo_${Date.now()}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("Storage upload error:", error);
      return { url: null, error: `Upload failed: ${error.message}. Ensure the 'attachments' bucket exists and RLS policies allow uploads.` };
    }

    const { data: publicUrlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error("Unexpected upload error:", err);
    return { url: null, error: "An unexpected error occurred during upload." };
  }
}
