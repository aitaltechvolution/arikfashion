import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const key = ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY
  || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) as string;

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

export const supabase = getSupabase();

export function publicImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${url}/storage/v1/object/public/product-images/${path}`;
}
