import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Don't throw at import time — that would crash the whole app (including
  // the build) before a shop owner has had a chance to configure .env.local.
  // Callers should check `isSupabaseConfigured` or simply let the resulting
  // failed request surface through their own try/catch as a friendly error.
  console.warn(
    '[supabaseClient] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — ' +
      'copy .env.local.example to .env.local and fill in your Supabase project credentials.',
  );
}

/**
 * Anon-key Supabase client, safe to use from both Client Components and
 * Server Components (it only ever holds the public NEXT_PUBLIC_ credentials).
 * Every query made with this client is subject to Postgres Row Level
 * Security — it can never read products.floor_price or write to orders
 * (see supabase/schema.sql).
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
