import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase environment variables. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
